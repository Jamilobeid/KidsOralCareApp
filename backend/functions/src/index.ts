import * as admin from 'firebase-admin';
import { createHash, randomBytes } from 'crypto';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();
const AUTH_DOMAIN = 'kidsoralcare.local';
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_COOLDOWN_MS = 60 * 1000;
const callableOptions = {
  // Keep false while the App Check-enabled client is being rolled out. Set
  // ENFORCE_APP_CHECK=true and redeploy after legitimate requests are verified.
  enforceAppCheck: process.env.ENFORCE_APP_CHECK === 'true'
};

const normalizeUsername = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'user';
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};
const verificationUrl = (token: string) => {
  const projectId = process.env.GCLOUD_PROJECT || admin.app().options.projectId;
  return `https://us-central1-${projectId}.cloudfunctions.net/verifyParentEmail?token=${encodeURIComponent(token)}`;
};
const queueEmail = async (to: string, subject: string, text: string, html: string) => {
  await db.collection('mail').add({ to: [to], message: { subject, text, html } });
};

const sendVerification = async (uid: string, recoveryEmail: string) => {
  const token = randomBytes(32).toString('hex');
  const link = verificationUrl(token);
  await db.doc(`recoveryProfiles/${uid}`).set({
    recoveryEmail,
    normalizedRecoveryEmail: recoveryEmail,
    parentEmailVerified: false,
    verificationTokenHash: hashToken(token),
    verificationExpiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + VERIFY_TOKEN_TTL_MS),
    lastVerificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  await queueEmail(
    recoveryEmail,
    'Verify your Kids Oral Care parent email',
    `Verify the parent email for this account: ${link}\n\nThis link expires in 24 hours.`,
    `<h2>Verify the parent email</h2><p>Tap the button below to unlock the Kids Oral Care account.</p><p><a href="${link}" style="background:#6155F6;color:#fff;padding:12px 20px;border-radius:22px;text-decoration:none;font-weight:bold">Verify parent email</a></p><p>This link expires in 24 hours.</p>`
  );
};

export const startParentEmailVerification = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const recoveryEmail = normalizeEmail(String(request.data?.recoveryEmail ?? ''));
  if (!isValidEmail(recoveryEmail)) throw new HttpsError('invalid-argument', 'Enter a valid parent email.');
  const userDoc = await db.doc(`users/${request.auth.uid}`).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'user') {
    throw new HttpsError('failed-precondition', 'The child account could not be found.');
  }
  await sendVerification(request.auth.uid, recoveryEmail);
  return { sent: true, recoveryEmailMasked: maskEmail(recoveryEmail) };
});

export const resendParentEmailVerification = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const profile = await db.doc(`recoveryProfiles/${request.auth.uid}`).get();
  const data = profile.data();
  if (!profile.exists || !data?.recoveryEmail) throw new HttpsError('not-found', 'No recovery email is registered.');
  if (data.parentEmailVerified === true) return { sent: false, alreadyVerified: true };
  const lastSent = data.lastVerificationSentAt?.toMillis?.() ?? 0;
  if (Date.now() - lastSent < REQUEST_COOLDOWN_MS) {
    throw new HttpsError('resource-exhausted', 'Please wait one minute before requesting another email.');
  }
  await sendVerification(request.auth.uid, data.recoveryEmail);
  return { sent: true };
});

export const getParentEmailVerificationStatus = onCall(callableOptions, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const data = (await db.doc(`recoveryProfiles/${request.auth.uid}`).get()).data();
  return { verified: data?.parentEmailVerified === true, recoveryEmailMasked: data?.recoveryEmail ? maskEmail(data.recoveryEmail) : '' };
});

export const verifyParentEmail = onRequest(async (request, response) => {
  const token = String(request.query.token ?? '');
  if (!token) {
    response.status(400).send('This verification link is invalid.');
    return;
  }
  const matches = await db.collection('recoveryProfiles').where('verificationTokenHash', '==', hashToken(token)).limit(1).get();
  if (matches.empty) {
    response.status(400).send('This verification link is invalid or has already been used.');
    return;
  }
  const match = matches.docs[0];
  const data = match.data();
  if ((data.verificationExpiresAt?.toMillis?.() ?? 0) < Date.now()) {
    response.status(400).send('This verification link has expired. Request a new link in the app.');
    return;
  }
  await match.ref.update({
    parentEmailVerified: true,
    verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    verificationTokenHash: admin.firestore.FieldValue.delete(),
    verificationExpiresAt: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  response.status(200).send('<!doctype html><html><meta name="viewport" content="width=device-width"><body style="font-family:Arial;text-align:center;padding:48px;color:#17324D"><h1 style="color:#41438F">Email verified!</h1><p>Return to Kids Oral Care and tap “I’ve verified my email”.</p></body></html>');
});

export const requestPasswordReset = onCall(callableOptions, async (request) => {
  const username = normalizeUsername(String(request.data?.username ?? ''));
  const recoveryEmail = normalizeEmail(String(request.data?.recoveryEmail ?? ''));
  const genericResult = { accepted: true };
  if (!username || !isValidEmail(recoveryEmail)) return genericResult;
  const users = await db.collection('users').where('normalizedUsername', '==', username).limit(1).get();
  if (users.empty) return genericResult;
  const uid = users.docs[0].id;
  const profileRef = db.doc(`recoveryProfiles/${uid}`);
  const data = (await profileRef.get()).data();
  if (!data || data.parentEmailVerified !== true || data.normalizedRecoveryEmail !== recoveryEmail) return genericResult;
  const lastReset = data.lastPasswordResetSentAt?.toMillis?.() ?? 0;
  if (Date.now() - lastReset < REQUEST_COOLDOWN_MS) return genericResult;
  const resetLink = await admin.auth().generatePasswordResetLink(`${username}@${AUTH_DOMAIN}`);
  await queueEmail(
    recoveryEmail,
    'Reset your Kids Oral Care password',
    `Choose a new password using this secure link: ${resetLink}`,
    `<h2>Reset the account password</h2><p><a href="${resetLink}" style="background:#6155F6;color:#fff;padding:12px 20px;border-radius:22px;text-decoration:none;font-weight:bold">Choose a new password</a></p><p>If you did not request this, you can ignore this email.</p>`
  );
  await profileRef.update({ lastPasswordResetSentAt: admin.firestore.FieldValue.serverTimestamp() });
  return genericResult;
});

export const aggregateBrushingSession = onDocumentCreated('brushingSessions/{sessionId}', async (event) => {
  const data = event.data?.data();
  if (!data?.childId) return;

  const statsRef = db.doc('analytics/daily');
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(statsRef);
    const sessions = (current.data()?.brushingSessions ?? 0) + 1;
    transaction.set(statsRef, {
      brushingSessions: sessions,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
});

export const aggregateGameSession = onDocumentCreated('gameSessions/{sessionId}', async (event) => {
  const data = event.data?.data();
  if (!data?.gameId) return;

  const statsRef = db.doc('analytics/games');
  await statsRef.set({
    [`usage.${data.gameId}`]: admin.firestore.FieldValue.increment(1),
    lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
});
