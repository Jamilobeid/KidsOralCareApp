# eSmile — Secure Account Deletion Setup

The mobile client and deletion endpoint are implemented in source. Complete these deployment steps before testing the feature.

## Why Netlify is used

Firebase Cloud Functions requires the Firebase project to move from Spark to the Blaze billing plan. The deletion endpoint therefore runs as a Netlify Function on the Netlify free tier. Firebase Admin credentials remain only in Netlify’s encrypted environment settings and are never included in the app.

The Netlify free plan has a fixed usage limit. Monitor function usage and prevent public launch if the account cannot reliably process deletion requests.

## 1. Prepare the repository

Deploy the repository root to Netlify. Netlify reads `netlify.toml`, publishes the deletion-information page from `frontend/public`, and builds the function from `netlify/functions`.

## 2. Configure the Firebase service account secret

Use the Firebase service-account JSON that was generated for the `kids-oral-care` project. Do not copy it into the repository.

Convert it to Base64 in PowerShell:

```powershell
$serviceAccountPath = "C:\path\to\kids-oral-care-firebase-adminsdk.json"
[Convert]::ToBase64String([IO.File]::ReadAllBytes($serviceAccountPath))
```

Copy the resulting Base64 value. In Netlify, open:

`Project configuration → Environment variables → Add a variable`

Create:

```text
FIREBASE_SERVICE_ACCOUNT_BASE64=<the Base64 value>
```

Set secrets through the Netlify UI, CLI, or API. Never place this value in `netlify.toml`, `.env.example`, source control, screenshots, or support messages.

## 3. Deploy Netlify

After connecting the repository and setting the environment variable, deploy the site. The endpoint will be:

```text
https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/delete-account
```

The public deletion page will be:

```text
https://YOUR-NETLIFY-SITE.netlify.app/delete-account.html
```

## 4. Configure the mobile client

In the local `frontend/.env` and EAS build environment, set:

```text
EXPO_PUBLIC_ACCOUNT_DELETION_URL=https://YOUR-NETLIFY-SITE.netlify.app/.netlify/functions/delete-account
```

This URL is public configuration. The Firebase service account is not.

Restart Metro with a cleared cache after changing `.env`:

```powershell
npm start -- --clear
```

## 5. Deploy Firestore rules

The updated rules compile successfully in Firebase dry-run validation. Deploy them before enabling the deletion button in production:

```powershell
cd backend
npx firebase-tools deploy --only firestore:rules --project kids-oral-care
```

The rules deny all client access to `deletionJobs` and `deletionAudits` and prevent ordinary child writes after the server applies `deletionPending`.

## 6. Test safely

Never test deletion with the administrator account or an account that must be preserved.

1. Create a disposable parent/child account with a unique test email and username.
2. Verify the parent email.
3. Generate brushing, game, reward, reminder, and leaderboard records.
4. Open `Settings → Parent Zone → Delete account and data`.
5. Enter the parent password and type `DELETE`.
6. Confirm the app returns to the welcome screen and clears local reminders.
7. Confirm Firebase Authentication no longer contains the test user.
8. Confirm `parents`, `children`, `usernames`, `leaderboard`, `brushingSessions`, `gameSessions`, legacy recovery records, and related queued mail no longer contain the test account.
9. Confirm a non-identifying `deletionAudits` record exists and no `deletionJobs` record remains.
10. Confirm the deleted credentials can no longer sign in.

Also test incorrect password, incorrect confirmation, expired authentication, missing or invalid token, administrator account, network timeout, and retry after a simulated partial failure.

## 7. Dependency-security note

The endpoint uses the current Firebase Admin major version. At implementation time, npm reported transitive advisories in optional Google Cloud dependency paths, including packages not invoked by this endpoint. Do not use `npm audit fix --force`, because it proposes an unsafe major downgrade. Re-run `npm audit --omit=dev` before every release and update Firebase Admin as soon as its upstream dependency tree resolves the advisories.
