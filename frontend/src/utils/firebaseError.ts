type FirebaseLikeError = {
  code?: string;
  message?: string;
};

export const getFriendlyFirebaseError = (error: unknown, fallback: string) => {
  const firebaseError = error as FirebaseLikeError | null;
  const code = firebaseError?.code ?? '';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account already uses this parent email. Sign in or reset its password.',
    'auth/invalid-credential': 'The parent email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid parent email address.',
    'auth/missing-password': 'Enter the account password.',
    'auth/network-request-failed': 'The internet connection was interrupted. Check the connection and try again.',
    'auth/operation-not-allowed': 'Email/password account creation is disabled in Firebase Authentication.',
    'auth/configuration-not-found': 'Firebase Authentication configuration could not be found for this project.',
    'auth/invalid-api-key': 'The application is using an invalid Firebase API key.',
    'auth/app-not-authorized': 'This application is not authorized to use the configured Firebase project.',
    'auth/too-many-requests': 'Too many attempts were made. Wait a few minutes, then try again.',
    'auth/user-disabled': 'This account has been disabled. Contact the application administrator.',
    'auth/weak-password': 'Choose a stronger password with at least six characters.',
    'username-already-in-use': 'This username is already taken. Please choose another one.',
    'permission-denied': 'Firestore refused this request. Check that the latest security rules are published.',
    'firestore/permission-denied': 'Firestore refused this request. Check that the latest security rules are published.',
    'unavailable': 'Firebase is temporarily unavailable. Check the internet connection and try again.'
  };

  if (messages[code]) return messages[code];

  const message = firebaseError?.message ?? '';
  if (/network|offline|failed to fetch/i.test(message)) {
    return 'The internet connection was interrupted. Check the connection and try again.';
  }
  if (/app.?check|recaptcha/i.test(message)) {
    return 'The security check could not be completed. Refresh the application and try again.';
  }

  const safeCode = code && /^[a-z-]+\/[a-z0-9-]+$/i.test(code) ? ` (${code})` : '';
  return `${fallback}${safeCode}`;
};
