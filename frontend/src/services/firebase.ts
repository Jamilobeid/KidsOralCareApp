import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { initializeFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import { nativeAuthPersistence } from './firebaseAuthPersistence';

const publicEnvironment = process.env as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: publicEnvironment.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBPquTZO6oICq7O2eQvM-wOz6pvREK81qA',
  authDomain: publicEnvironment.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kids-oral-care.firebaseapp.com',
  projectId: publicEnvironment.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'kids-oral-care',
  storageBucket: publicEnvironment.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kids-oral-care.firebasestorage.app',
  messagingSenderId: publicEnvironment.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '587130937499',
  appId: publicEnvironment.EXPO_PUBLIC_FIREBASE_APP_ID || '1:587130937499:web:2b22c69d3868892cd8e63e'
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
export const firebaseProjectId = firebaseConfig.projectId;

const app = isFirebaseConfigured && !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const appCheckSiteKey = publicEnvironment.EXPO_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY?.trim();
const appCheckDebugToken = publicEnvironment.EXPO_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN?.trim();

if (Platform.OS === 'web' && app && appCheckSiteKey) {
  if (appCheckDebugToken) {
    (globalThis as typeof globalThis & { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      appCheckDebugToken;
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true
  });
}

const createAuth = () => {
  if (!app) return null;
  if (Platform.OS === 'web') return getAuth(app);

  try {
    // Keep Firebase refresh credentials in the OS-protected Keychain/Keystore,
    // never in plaintext AsyncStorage.
    return initializeAuth(app, { persistence: nativeAuthPersistence });
  } catch (error) {
    // Fast Refresh can initialize this module more than once.
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
};

export const auth = createAuth();
export const db = app ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }) : null;
