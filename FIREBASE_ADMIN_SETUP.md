# Firebase Admin Setup

The application authorizes administrators with a Firebase Authentication custom claim:

```json
{ "admin": true }
```

An email address, password, or writable Firestore profile field never grants admin access.

## 1. Configure Firebase

Create `frontend/.env` from `frontend/.env.example`, add the Firebase web configuration,
and enable Email/Password sign-in in Firebase Authentication.

Parents and administrators sign in with real email addresses. The email itself has no
administrative meaning.

## 2. Create the first administrator

Create the intended account in Firebase Authentication. Then authenticate the Firebase
Admin SDK locally using one of the supported secure methods:

```powershell
gcloud auth application-default login
```

Alternatively, set `GOOGLE_APPLICATION_CREDENTIALS` to the path of a securely stored
service-account JSON file. Never commit that file to this repository.

From `backend/functions`, grant the custom claim by email:

```powershell
npm run admin:set -- --email admin@example.com --admin true
```

You can use a Firebase UID instead:

```powershell
npm run admin:set -- --uid FIREBASE_UID --admin true
```

To revoke access:

```powershell
npm run admin:set -- --email admin@example.com --admin false
```

The affected user must sign out and sign back in after any claim change.

## 3. Administrator profile

An administrator does not need a parent or child Firestore document. Only the signed custom
claim grants administrative access.

## 4. Deploy

Deploy the backend Firestore rules:

```powershell
cd backend
firebase deploy --only firestore:rules
```

## 5. Verify

1. Grant the intended account the claim.
2. Sign out and sign back in.
3. Confirm the Admin Dashboard is available.
4. Revoke the claim, sign out and back in, and confirm access is denied.
5. Confirm a normal user cannot read other users' records.
