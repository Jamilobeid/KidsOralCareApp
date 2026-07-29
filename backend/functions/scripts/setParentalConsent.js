const admin = require('firebase-admin');
const crypto = require('crypto');

const VALID_STATUSES = new Set(['granted', 'denied', 'withdrawn']);
const VALID_METHODS = new Set(['signed-form', 'video-call', 'knowledge-check', 'approved-provider']);

const getArgument = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const email = getArgument('email');
const uid = getArgument('uid');
const status = getArgument('status');
const method = getArgument('method');
const evidenceRef = getArgument('evidence-ref');
const leaderboardValue = getArgument('leaderboard');
const noticeVersion = getArgument('notice-version');
const policyVersion = getArgument('policy-version');

const hasOneIdentity = Boolean(email) !== Boolean(uid);
const validLeaderboard = ['true', 'false'].includes(leaderboardValue);
const requiresEvidence = status === 'granted';

if (
  !hasOneIdentity
  || !VALID_STATUSES.has(status)
  || !validLeaderboard
  || (requiresEvidence && (!VALID_METHODS.has(method) || !evidenceRef || !noticeVersion || !policyVersion))
) {
  console.error(
    'Usage: npm run consent:set -- (--email <email> | --uid <uid>) '
    + '--status <granted|denied|withdrawn> --leaderboard <true|false> '
    + '[--method <signed-form|video-call|knowledge-check|approved-provider> '
    + '--evidence-ref <non-secret-reference> --notice-version <version> --policy-version <version>]'
  );
  process.exit(1);
}

if (status !== 'granted' && leaderboardValue === 'true') {
  console.error('Leaderboard consent cannot be true unless parental consent is granted.');
  process.exit(1);
}

admin.initializeApp();

const run = async () => {
  const auth = admin.auth();
  const db = admin.firestore();
  const user = email
    ? await auth.getUserByEmail(email.trim().toLowerCase())
    : await auth.getUser(uid);

  if (user.customClaims?.admin === true) {
    throw new Error('Administrator accounts must not receive child parental-consent records.');
  }
  if (!user.emailVerified) {
    throw new Error('The parent email must be verified before consent can be recorded.');
  }

  const consentRef = db.doc(`parentalConsents/${user.uid}`);
  const auditRef = db.collection('consentAudits').doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const leaderboardDisclosureGranted = status === 'granted' && leaderboardValue === 'true';
  const accountRef = crypto.createHash('sha256').update(user.uid).digest('hex');
  const consentData = {
    uid: user.uid,
    status,
    method: status === 'granted' ? method : null,
    noticeVersion: status === 'granted' ? noticeVersion : null,
    privacyPolicyVersion: status === 'granted' ? policyVersion : null,
    dataCategoriesVersion: 'data-inventory-2026-07-29',
    internalUseGranted: status === 'granted',
    leaderboardDisclosureGranted,
    parentEmailVerifiedAt: status === 'granted' ? now : null,
    noticePresentedAt: status === 'granted' ? now : null,
    consentGrantedAt: status === 'granted' ? now : null,
    consentWithdrawnAt: status === 'withdrawn' ? now : null,
    verificationEvidenceRef: status === 'granted' ? evidenceRef : null,
    updatedAt: now
  };

  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(consentRef);
    transaction.set(consentRef, {
      ...consentData,
      createdAt: existing.exists ? existing.data().createdAt : now
    }, { merge: true });
    transaction.set(auditRef, {
      accountRef,
      action: `consent-${status}`,
      method: status === 'granted' ? method : null,
      leaderboardDisclosureGranted,
      noticeVersion: status === 'granted' ? noticeVersion : null,
      privacyPolicyVersion: status === 'granted' ? policyVersion : null,
      evidenceRef: status === 'granted' ? evidenceRef : null,
      createdAt: now
    });
  });

  const customClaims = { ...(user.customClaims ?? {}) };
  customClaims.parentalConsent = status === 'granted';
  customClaims.leaderboardConsent = leaderboardDisclosureGranted;
  await auth.setCustomUserClaims(user.uid, customClaims);

  console.log(`Parental consent marked ${status} for ${user.email ?? user.uid}.`);
  console.log(`Leaderboard participation: ${leaderboardDisclosureGranted ? 'approved' : 'not approved'}.`);
  console.log('The parent must sign out and sign back in to refresh the account token.');
};

run().catch((error) => {
  console.error('Could not update parental consent:', error);
  process.exitCode = 1;
});
