const { cert, getApp, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore, Timestamp } = require('firebase-admin/firestore');

const RECENT_AUTH_WINDOW_SECONDS = 5 * 60;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const MAX_REQUEST_BODY_BYTES = 1024;
const JSON_HEADERS = {
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff'
};

const response = (statusCode, body, additionalHeaders = {}) => ({
  statusCode,
  headers: { ...JSON_HEADERS, ...additionalHeaders },
  body: JSON.stringify(body)
});

const getFirebaseApp = () => {
  if (getApps().length) return getApp();

  const encodedCredential = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encodedCredential) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not configured.');

  const credential = JSON.parse(Buffer.from(encodedCredential, 'base64').toString('utf8'));
  return initializeApp({ credential: cert(credential) });
};

const deleteQueryResults = async (db, query) => {
  let deleted = 0;

  while (true) {
    const snapshot = await query.limit(400).get();
    if (snapshot.empty) return deleted;

    const batch = db.batch();
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
    deleted += snapshot.size;
  }
};

const consumeRateLimit = async (db, uid) => {
  const rateLimitRef = db.doc(`securityRateLimits/accountDeletion_${uid}`);
  const nowMs = Date.now();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(rateLimitRef);
    const data = snapshot.data();
    const windowStartedAtMs = data?.windowStartedAt?.toMillis?.() ?? 0;
    const windowExpiresAtMs = windowStartedAtMs + RATE_LIMIT_WINDOW_MS;

    if (!snapshot.exists || nowMs >= windowExpiresAtMs) {
      transaction.set(rateLimitRef, {
        operation: 'account-deletion',
        attempts: 1,
        windowStartedAt: Timestamp.fromMillis(nowMs),
        lastAttemptAt: Timestamp.fromMillis(nowMs)
      });
      return { allowed: true, rateLimitRef };
    }

    const attempts = Number(data?.attempts ?? 0);
    if (attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
      return {
        allowed: false,
        rateLimitRef,
        retryAfterSeconds: Math.max(1, Math.ceil((windowExpiresAtMs - nowMs) / 1000))
      };
    }

    transaction.update(rateLimitRef, {
      attempts: attempts + 1,
      lastAttemptAt: Timestamp.fromMillis(nowMs)
    });
    return { allowed: true, rateLimitRef };
  });
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return response(204, {});
  if (event.httpMethod !== 'POST') return response(405, { error: 'method-not-allowed' });

  try {
    const authorization = event.headers.authorization || event.headers.Authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return response(401, { error: 'authentication-required' });
    }

    let requestBody;
    if (Buffer.byteLength(event.body || '', 'utf8') > MAX_REQUEST_BODY_BYTES) {
      return response(413, { error: 'request-too-large' });
    }
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch {
      return response(400, { error: 'invalid-json' });
    }

    if (!requestBody || Array.isArray(requestBody) || typeof requestBody !== 'object'
      || Object.keys(requestBody).length !== 1 || requestBody.confirmation !== 'DELETE') {
      return response(400, { error: 'confirmation-required' });
    }

    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const decodedToken = await auth.verifyIdToken(authorization.slice(7), true);

    if (decodedToken.admin === true) {
      return response(403, { error: 'admin-account-protected' });
    }
    if (decodedToken.email_verified !== true) {
      return response(403, { error: 'parent-email-not-verified' });
    }

    const authTime = Number(decodedToken.auth_time || 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!authTime || nowSeconds - authTime > RECENT_AUTH_WINDOW_SECONDS) {
      return response(401, { error: 'recent-authentication-required' });
    }

    const uid = decodedToken.uid;
    const rateLimit = await consumeRateLimit(db, uid);
    if (!rateLimit.allowed) {
      return response(
        429,
        { error: 'too-many-requests' },
        { 'Retry-After': String(rateLimit.retryAfterSeconds) }
      );
    }

    const jobRef = db.doc(`deletionJobs/${uid}`);
    const parentRef = db.doc(`parents/${uid}`);
    const childRef = db.doc(`children/${uid}`);
    let authenticationDeleted = false;

    await jobRef.set({
      status: 'processing',
      source: 'in-app',
      requestedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    try {
      const [userRecord, childSnapshot] = await Promise.all([
        auth.getUser(uid),
        childRef.get()
      ]);
      const childData = childSnapshot.data();
      const usernameKey = typeof childData?.usernameKey === 'string' ? childData.usernameKey : '';
      const parentEmail = userRecord.email?.trim().toLowerCase() || '';

      if (childSnapshot.exists) {
        await childRef.set({
          deletionPending: true,
          deletionRequestedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }

      await Promise.all([
        deleteQueryResults(db, db.collection('brushingSessions').where('childId', '==', uid)),
        deleteQueryResults(db, db.collection('gameSessions').where('childId', '==', uid)),
        deleteQueryResults(db, db.collection('leaderboard').where('childId', '==', uid))
      ]);

      if (parentEmail) {
        await deleteQueryResults(db, db.collection('mail').where('to', 'array-contains', parentEmail));
      }

      await Promise.all([
        db.recursiveDelete(childRef),
        db.recursiveDelete(parentRef),
        db.recursiveDelete(db.doc(`parentalConsents/${uid}`)),
        db.recursiveDelete(db.doc(`consentRequests/${uid}`)),
        db.recursiveDelete(db.doc(`recoveryProfiles/${uid}`)),
        db.recursiveDelete(db.doc(`users/${uid}`))
      ]);

      if (usernameKey) {
        await db.recursiveDelete(db.doc(`usernames/${usernameKey}`));
      }

      const auditRef = db.collection('deletionAudits').doc();
      await auditRef.set({
        source: 'in-app',
        result: 'data-deleted-auth-pending',
        requestedAt: FieldValue.serverTimestamp(),
        retentionExpiresAt: Timestamp.fromMillis(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
      });

      await auth.deleteUser(uid);
      authenticationDeleted = true;

      await auditRef.update({
        result: 'completed',
        completedAt: FieldValue.serverTimestamp()
      });
      await jobRef.delete();
      await rateLimit.rateLimitRef.delete().catch((cleanupError) => {
        console.error('Could not remove completed deletion rate limit:', cleanupError);
      });

      return response(200, { deleted: true });
    } catch (error) {
      console.error('Account deletion failed:', error);
      if (authenticationDeleted) {
        await jobRef.delete().catch((cleanupError) => {
          console.error('Could not remove completed deletion job:', cleanupError);
        });
        return response(200, { deleted: true });
      }

      await jobRef.set({
        status: 'failed',
        errorCode: error instanceof Error ? error.name : 'unknown',
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
      return response(500, { error: 'deletion-failed-retry-safe' });
    }
  } catch (error) {
    console.error('Deletion request rejected:', error);
    return response(401, { error: 'invalid-or-expired-authentication' });
  }
};

