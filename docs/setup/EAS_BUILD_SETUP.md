# EAS Build setup

The project contains `development`, `preview`, and `production` profiles in
`frontend/eas.json`.

## Required one-time account setup

Run these commands from `frontend`:

```powershell
npx eas-cli@21.2.0 login
npx eas-cli@21.2.0 init
```

Use the Expo account that should permanently own the client application. The
`init` command adds the EAS project ID to `app.json`.

Before the first store build, replace both instances of
`com.example.kidsoralcare` in `app.json` with a permanent reverse-domain
identifier owned by the client. Do not publish to either store with the example
identifier.

## EAS environment variables

Create matching `development`, `preview`, and `production` environments in the
Expo dashboard. Add the following variables to each environment:

```text
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY
```

The `.env` file is intentionally excluded from EAS uploads.

## Build commands

Android internal preview:

```powershell
npm run build:preview:android
```

iPhone internal preview:

```powershell
npm run build:preview:ios
```

Store builds, only after preview testing:

```powershell
npm run build:production
```

An iPhone device build requires a paid Apple Developer account and registered
test devices. Production submissions also require the appropriate Apple and
Google developer accounts.

## Native App Check limitation

The current App Check provider is web-only. Do not enforce App Check for native
Android or iOS traffic until native providers are implemented and verified in a
development build. Web App Check can remain enabled.
