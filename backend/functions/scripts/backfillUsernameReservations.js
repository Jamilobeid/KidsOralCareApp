const admin = require('firebase-admin');

admin.initializeApp();

const normalizeUsername = (username) => username.trim().normalize('NFKC').toLocaleLowerCase('en-US');
const getUsernameKey = (normalizedUsername) => `u_${encodeURIComponent(normalizedUsername)}`;

const run = async () => {
  const db = admin.firestore();
  const children = await db.collection('children').get();
  let created = 0;
  let existing = 0;
  const conflicts = [];

  for (const childSnapshot of children.docs) {
    const nickname = childSnapshot.get('nickname');
    if (typeof nickname !== 'string' || !nickname.trim()) {
      conflicts.push(`${childSnapshot.id}: missing nickname`);
      continue;
    }

    const normalizedUsername = normalizeUsername(nickname);
    const usernameKey = getUsernameKey(normalizedUsername);
    const usernameRef = db.collection('usernames').doc(usernameKey);

    await db.runTransaction(async (transaction) => {
      const reservation = await transaction.get(usernameRef);
      if (reservation.exists) {
        if (reservation.get('uid') !== childSnapshot.id) {
          conflicts.push(`${nickname}: already reserved by another account`);
          return;
        }
        existing += 1;
      } else {
        transaction.create(usernameRef, {
          uid: childSnapshot.id,
          usernameKey,
          normalizedUsername,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        created += 1;
      }

      transaction.set(childSnapshot.ref, { normalizedUsername, usernameKey }, { merge: true });
    });
  }

  console.log(`Username reservations created: ${created}. Already present: ${existing}.`);
  if (conflicts.length) {
    console.error('Resolve these username conflicts manually:');
    conflicts.forEach((conflict) => console.error(`- ${conflict}`));
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error('Could not backfill username reservations:', error);
  process.exitCode = 1;
});
