const admin = require('firebase-admin');

const getArgument = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const email = getArgument('email');
const uid = getArgument('uid');
const adminValue = getArgument('admin');

if ((!email && !uid) || (email && uid) || !['true', 'false'].includes(adminValue)) {
  console.error(
    'Usage: npm run admin:set -- (--email <email> | --uid <uid>) --admin <true|false>'
  );
  process.exit(1);
}

admin.initializeApp();

const run = async () => {
  const user = email
    ? await admin.auth().getUserByEmail(email.trim().toLowerCase())
    : await admin.auth().getUser(uid);
  const customClaims = { ...(user.customClaims ?? {}) };

  if (adminValue === 'true') {
    customClaims.admin = true;
  } else {
    delete customClaims.admin;
  }

  await admin.auth().setCustomUserClaims(user.uid, customClaims);
  console.log(
    `Admin access ${adminValue === 'true' ? 'granted to' : 'revoked from'} ${user.email ?? user.uid}.`
  );
  console.log('The affected user must sign out and sign back in to refresh their token.');
};

run().catch((error) => {
  console.error('Could not update the admin claim:', error);
  process.exitCode = 1;
});
