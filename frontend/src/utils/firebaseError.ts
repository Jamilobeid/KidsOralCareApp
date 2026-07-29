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
    'auth/too-many-requests': 'Too many attempts were made. Wait a few minutes, then try again.',
    'auth/user-disabled': 'This account has been disabled. Contact the application administrator.',
    'auth/weak-password': 'Choose a stronger password with at least six characters.',
    'username-already-in-use': 'This username is already taken. Please choose another one.',
    'permission-denied': 'Firebase refused this request. Sign in again and make sure the email is verified.',
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

  return fallback;
};
