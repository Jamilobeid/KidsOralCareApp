# Free parent-account authentication

The application uses Firebase Authentication's built-in email verification and password
reset. It does not require Cloud Functions, an email extension, SMTP configuration, or the
Firebase Blaze plan.

## Account flow

1. A parent enters a real email, password, child nickname, and child age.
2. Firebase Authentication creates the parent account.
3. Firestore creates `parents/{parentUid}` and the first `children/{parentUid}` profile.
4. Firebase sends its built-in verification email.
5. Until the email is verified, Firestore rules block access to account data.
6. The parent verifies the email and returns to the app.
7. Future login and password recovery use the real parent email.

The child nickname is display information, not an Authentication email or login credential.

## Firebase Console setup

1. Enable Email/Password under Authentication > Sign-in method.
2. Add the production Netlify hostname under Authentication > Settings > Authorized domains.
3. Under Authentication > Templates, review the email-verification and password-reset
   templates.
4. Deploy the Firestore rules and indexes from `backend`:

```powershell
firebase deploy --only firestore:rules,firestore:indexes --project kids-oral-care
```

## Data structure

```text
parents/{parentUid}
children/{childId}
```

Each child contains `parentId: parentUid`. The first child uses the parent's UID as its
document ID. The structure supports adding multiple child profiles later without creating
additional Authentication accounts.

## Existing synthetic-email accounts

Accounts such as `testchild1@kidsoralcare.local` belong to the previous design. They do not
automatically become parent accounts.

- Delete and recreate disposable test accounts through the new signup screen.
- Do not delete real accounts with valuable progress. Export or manually migrate their
  `users/{uid}` data into `children/{newParentUid}` first.

The legacy `users`, `recoveryProfiles`, and `mail` collections are inaccessible to the new
client rules and may be archived after migration.
