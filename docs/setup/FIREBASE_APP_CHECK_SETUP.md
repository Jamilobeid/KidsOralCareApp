# Firebase App Check rollout

This application uses Firebase App Check with reCAPTCHA Enterprise for its Netlify web
build. App Check complements Firebase Authentication, custom admin claims, and Firestore
rules; it does not replace them.

## 1. Create the reCAPTCHA Enterprise key

1. Open Google Cloud Console for the Firebase project.
2. Enable the reCAPTCHA Enterprise API if prompted.
3. Create a **Website** score-based key and leave the checkbox challenge disabled.
4. Add the production Netlify hostname, such as `your-site.netlify.app`.
5. Add the custom production hostname too, if one is used.

Do not add `localhost` to the production key merely to support development. Use a Firebase
App Check debug token locally instead.

## 2. Register the Firebase web app

1. Open Firebase Console > App Check > Apps.
2. Register the existing web app with the **reCAPTCHA Enterprise** provider.
3. Enter the site key created above.
4. Keep the default one-hour token TTL initially.

The Enterprise site key is public client configuration. Service-account JSON files and App
Check debug tokens are secrets and must never be placed in the web build.

## 3. Configure and deploy Netlify

Add this production environment variable in Netlify:

```text
EXPO_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY=<RECAPTCHA_ENTERPRISE_SITE_KEY>
```

Do **not** add `EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN` to Netlify.

Rebuild the Expo web application after setting the variable. Expo public environment
variables are embedded at build time, so changing the value without rebuilding is not
enough.

## 4. Test without enforcement

Deploy the App Check-enabled web build while enforcement remains disabled. Test:

- child registration;
- built-in parent email verification and resend;
- password recovery;
- normal child Firestore activity;
- administrator login and dashboard loading.

Then review Firebase Console > App Check > APIs. Confirm legitimate Netlify requests appear
as verified before enforcing any service.

## 5. Enable Firebase service enforcement

After verified traffic is healthy, enable enforcement progressively in Firebase Console:

1. Cloud Firestore.
2. Firebase Authentication only after carefully testing it; App Check support for
   Authentication may be marked preview in the Firebase Console.

Enforce one service at a time and retest before proceeding. Do not enable enforcement before
the App Check-enabled Netlify build is live.

## Local web development

Set the production site key plus a registered Firebase App Check debug token in
`frontend/.env`:

```env
EXPO_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY=<RECAPTCHA_ENTERPRISE_SITE_KEY>
EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN=<REGISTERED_PRIVATE_DEBUG_TOKEN>
```

Register the debug token in Firebase Console > App Check > Apps > Manage debug tokens.
Never commit it, put it in Netlify, or share it. Revoke it immediately if exposed.

## Native Expo builds

The current implementation initializes reCAPTCHA Enterprise only on web. A future native
iOS or Android release should register those Firebase apps separately and use App Attest /
DeviceCheck on Apple platforms and Play Integrity on Android.
