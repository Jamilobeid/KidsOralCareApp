# Kids Oral Care App

A cross-platform Expo + React Native mobile application for children's oral hygiene. It includes child brushing guidance, games, rewards, challenges, parent monitoring, admin statistics, and multilingual support for English, French, and Arabic with RTL handling.

## Project Structure

```text
KidsOralCareApp/
  frontend/   Expo React Native application
  backend/    Firebase rules, indexes, Cloud Functions scaffold, demo seed data
```

## Requirements

- Node.js 18+
- Expo Go on iPhone or Android
- Android Studio with an Android emulator, optional
- Firebase project, optional for live backend testing

## Run The Mobile App

```bash
cd frontend
npm install
npm start
```

Then choose:

- Press `a` for Android emulator.
- Scan the QR code with Expo Go on iPhone.
- Scan the QR code with Expo Go on a real Android phone.

The app includes local demo data and works without Firebase credentials. Add Firebase credentials later in `frontend/src/services/firebase.ts` or through Expo environment variables.

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication with Email/Password.
3. Create a Firestore database.
4. Copy your web app Firebase config into `.env` or directly into `frontend/src/services/firebase.ts`.
5. Deploy backend rules from the `backend` folder.

Environment variables supported by the frontend:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Android Studio Emulator

1. Open Android Studio.
2. Create or start an emulator from Device Manager.
3. In the frontend folder, run `npm start`.
4. Press `a` in the Expo terminal.

## iPhone With Expo Go

1. Install Expo Go from the App Store.
2. Run `npm start` in `frontend`.
3. Scan the QR code with the iPhone camera or Expo Go.

## Audio Assets

The app currently uses placeholder audio hooks and visual/caption instructions. Add only royalty-free or properly licensed files to:

```text
frontend/assets/audio/
```

Suggested files:

- `brush-start.mp3`
- `brush-switch.mp3`
- `brush-complete.mp3`
- `background-loop.mp3`

## Firebase Deploy Notes

```bash
cd backend
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules,firestore:indexes,functions
```

## Prototype

If you have an existing prototype, it can be used later as a visual reference to refine colors, layout, characters, and animations.
