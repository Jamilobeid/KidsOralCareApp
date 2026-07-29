import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, increment, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { AdminUserSummary, ChildProfile, ThemeName, UserRole } from '../types/app';
import { emptyWeeklyBrushes, getLocalDateKey, getLocalWeekKey, normalizeWeeklyBrushes } from '../utils/calendar';
import { auth, db, isFirebaseConfigured } from './firebase';

const publicEnvironment = process.env as Record<string, string | undefined>;

type ChildDocument = {
  id: string;
  parentId: string;
  nickname: string;
  normalizedUsername: string;
  usernameKey: string;
  age: number;
  points: number;
  badges: string[];
  level: number;
  todayBrushes: number;
  weeklyBrushes: number;
  weeklyBrushesByDay: number[];
  brushedPeriodsToday: Array<'morning' | 'evening'>;
  dailyGamePlays: Record<string, number>;
  dailyDateKey: string;
  weekKey: string;
  totalBrushes: number;
  timeSpentMinutes: number;
  gamesPlayed: number;
  rewardsEarned: number;
  engagementScore: number;
  totalUsageSeconds: number;
  loginCount: number;
  activitiesCompleted: number;
  remindersFollowed: number;
  lastActive: string;
  theme?: ThemeName;
  avatar?: string;
};

const withTimeout = async <T,>(promise: Promise<T>, milliseconds: number, message: string) => Promise.race([
  promise,
  new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error(message)), milliseconds);
  })
]);

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};

export const canUseFirebase = Boolean(isFirebaseConfigured && auth && db);

const normalizedCalendarFields = (data: Partial<ChildDocument>, now = new Date()) => {
  const dailyDateKey = getLocalDateKey(now);
  const weekKey = getLocalWeekKey(now);
  const isCurrentDay = data.dailyDateKey === dailyDateKey;
  const isCurrentWeek = data.weekKey === weekKey;
  const weeklyBrushesByDay = isCurrentWeek
    ? normalizeWeeklyBrushes(data.weeklyBrushesByDay)
    : emptyWeeklyBrushes();

  return {
    dailyDateKey,
    weekKey,
    todayBrushes: isCurrentDay ? Math.max(0, Math.min(2, data.todayBrushes ?? 0)) : 0,
    brushedPeriodsToday: isCurrentDay && Array.isArray(data.brushedPeriodsToday)
      ? data.brushedPeriodsToday.filter((period): period is 'morning' | 'evening' => period === 'morning' || period === 'evening')
      : [],
    dailyGamePlays: isCurrentDay && data.dailyGamePlays && typeof data.dailyGamePlays === 'object'
      ? data.dailyGamePlays
      : {},
    weeklyBrushesByDay,
    weeklyBrushes: weeklyBrushesByDay.reduce((total, count) => total + count, 0)
  };
};

export const signInFirebaseUser = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
};

export const createFirebaseParentRegistration = async (
  parentEmail: string,
  password: string
) => {
  if (!auth || !db) throw new Error('Firebase is not configured.');

  const cleanEmail = parentEmail.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const parentId = credential.user.uid;

  try {
    await setDoc(doc(db, 'parents', parentId), {
      uid: parentId,
      email: cleanEmail,
      role: 'parent',
      registrationVersion: 2,
      privacyPolicyVersion: 'draft-0.1',
      termsOfUseVersion: 'draft-0.1',
      legalAcceptedAt: serverTimestamp(),
      consentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (rollbackError) {
      console.warn('Could not roll back the incomplete Authentication account:', rollbackError);
    }
    throw error;
  }

  return credential;
};

export type ParentalConsentStatus = {
  status: 'missing' | 'pending' | 'granted' | 'denied' | 'withdrawn' | 'expired';
  leaderboardDisclosureGranted: boolean;
};

export const getFirebaseParentalConsentStatus = async (): Promise<ParentalConsentStatus> => {
  const user = auth?.currentUser;
  if (!user || !db) throw new Error('Please sign in again.');
  const snapshot = await getDoc(doc(db, 'parentalConsents', user.uid));
  if (!snapshot.exists()) return { status: 'missing', leaderboardDisclosureGranted: false };
  const data = snapshot.data();
  return {
    status: data.status ?? 'pending',
    leaderboardDisclosureGranted: data.leaderboardDisclosureGranted === true
  };
};

export const submitFirebaseParentalConsentRequest = async (
  parentLegalName: string,
  leaderboardRequested: boolean
) => {
  const user = auth?.currentUser;
  if (!user || !db || !user.emailVerified) throw new Error('Verify the parent email before submitting consent.');
  await setDoc(doc(db, 'consentRequests', user.uid), {
    uid: user.uid,
    parentLegalName: parentLegalName.trim(),
    signatureAcknowledgement: 'I CONSENT',
    internalUseRequested: true,
    leaderboardRequested,
    status: 'pending-review',
    noticeVersion: 'parent-notice-2026-07-29-v1',
    privacyPolicyVersion: 'privacy-draft-2026-07-29-v1',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const createFirebaseChildProfile = async (
  username: string,
  age: number,
  child: ChildProfile
) => {
  const user = auth?.currentUser;
  if (!user || !db || !user.emailVerified) throw new Error('Verify the parent email before creating the child profile.');
  const firestore = db;
  const consent = await getFirebaseParentalConsentStatus();
  if (consent.status !== 'granted') throw new Error('Parental consent has not been approved yet.');

  const cleanUsername = username.trim();
  const normalizedUsername = cleanUsername.normalize('NFKC').toLocaleLowerCase('en-US');
  const usernameKey = `u_${encodeURIComponent(normalizedUsername)}`;
  const childId = user.uid;
  const childDocument: ChildDocument = {
    id: childId, parentId: user.uid, nickname: cleanUsername, normalizedUsername, usernameKey, age,
    points: 0, badges: [], level: 1, todayBrushes: 0, weeklyBrushes: 0,
    weeklyBrushesByDay: emptyWeeklyBrushes(), brushedPeriodsToday: [], dailyGamePlays: {},
    dailyDateKey: getLocalDateKey(), weekKey: getLocalWeekKey(), totalBrushes: 0,
    timeSpentMinutes: 0, gamesPlayed: 0, rewardsEarned: 0, engagementScore: 0,
    totalUsageSeconds: 0, loginCount: 1, activitiesCompleted: 0, remindersFollowed: 0,
    lastActive: 'Now', theme: child.theme, avatar: child.avatar
  };

  await runTransaction(firestore, async (transaction) => {
    const usernameRef = doc(firestore, 'usernames', usernameKey);
    if ((await transaction.get(usernameRef)).exists()) {
      const error = new Error('This username is already taken.') as Error & { code: string };
      error.code = 'username-already-in-use';
      throw error;
    }
    transaction.set(usernameRef, { uid: user.uid, usernameKey, normalizedUsername, createdAt: serverTimestamp() });
    transaction.set(doc(firestore, 'children', childId), {
      ...childDocument,
      consentRequired: true,
      leaderboardParticipating: consent.leaderboardDisclosureGranted,
      lastActiveAt: serverTimestamp(), createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
  });
  return childId;
};

export const sendCurrentUserVerificationEmail = async () => {
  if (!auth?.currentUser) throw new Error('Please sign in again.');
  await sendEmailVerification(auth.currentUser);
  return maskEmail(auth.currentUser.email ?? '');
};

export const checkCurrentUserEmailVerification = async () => {
  if (!auth?.currentUser) throw new Error('Please sign in again.');
  await reload(auth.currentUser);
  if (auth.currentUser.emailVerified) {
    await auth.currentUser.getIdToken(true);
  }
  return auth.currentUser.emailVerified;
};

export const signOutFirebaseUser = async () => {
  if (auth) await signOut(auth);
};

export const requestFirebasePasswordReset = async (parentEmail: string) => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  await sendPasswordResetEmail(auth, parentEmail.trim().toLowerCase());
};

export const requestFirebaseAccountDeletion = async (password: string) => {
  const user = auth?.currentUser;
  if (!user?.email) throw new Error('Please sign in again before deleting the account.');

  const deletionEndpoint = publicEnvironment.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim();
  if (!deletionEndpoint) throw new Error('Secure account deletion is not configured yet.');

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
  const idToken = await user.getIdToken(true);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const apiResponse = await fetch(deletionEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ confirmation: 'DELETE' }),
      signal: controller.signal
    });
    const result = await apiResponse.json().catch(() => ({})) as { deleted?: boolean; error?: string };

    if (!apiResponse.ok || result.deleted !== true) {
      const messages: Record<string, string> = {
        'admin-account-protected': 'Administrator accounts cannot be deleted from this screen.',
        'parent-email-not-verified': 'Verify the parent email before deleting the account.',
        'recent-authentication-required': 'Enter the parent password again and retry.',
        'deletion-failed-retry-safe': 'Deletion was not completed. The secure request was recorded and can be retried.'
      };
      throw new Error(messages[result.error ?? ''] ?? 'The secure server could not complete account deletion.');
    }
  } finally {
    clearTimeout(timeout);
  }
};

export const getFirebaseUserRole = async (user: User): Promise<UserRole> => {
  const token = await user.getIdTokenResult();
  return token.claims.admin === true ? 'admin' : 'user';
};

export const getFirebaseUserProfile = async (user: User) => {
  if (!db) return null;
  const childRef = doc(db, 'children', user.uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(childRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data() as Partial<ChildDocument>;
    const calendar = normalizedCalendarFields(data);
    transaction.update(childRef, {
      ...calendar,
      updatedAt: serverTimestamp()
    });
    return { ...data, ...calendar };
  });
};

export const fetchFirebaseAdminUsers = async (): Promise<AdminUserSummary[]> => {
  if (!db) return [];
  const snapshot = await withTimeout(
    getDocs(collection(db, 'children')),
    12000,
    'Firebase did not answer after 12 seconds. Please check Firestore rules and internet connection.'
  );

  return snapshot.docs.map((item) => {
    const data = item.data() as Partial<ChildDocument>;
    const calendar = normalizedCalendarFields(data);
    return {
      id: item.id,
      nickname: data.nickname ?? 'Child',
      age: data.age ?? 0,
      todayBrushes: calendar.todayBrushes,
      weeklyBrushes: calendar.weeklyBrushes,
      totalBrushes: data.totalBrushes ?? 0,
      timeSpentMinutes: data.timeSpentMinutes ?? 0,
      loginCount: data.loginCount ?? 0,
      totalUsageSeconds: data.totalUsageSeconds ?? 0,
      gamesPlayed: data.gamesPlayed ?? 0,
      activitiesCompleted: data.activitiesCompleted ?? 0,
      remindersFollowed: data.remindersFollowed ?? 0,
      rewardsEarned: data.rewardsEarned ?? 0,
      engagementScore: data.engagementScore ?? 0,
      lastActive: data.lastActive ?? 'Unknown'
    };
  });
};

export const normalizeFirebaseChildCalendar = async (childId: string) => {
  if (!db) return;
  const childRef = doc(db, 'children', childId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(childRef);
    if (!snapshot.exists()) return;
    const calendar = normalizedCalendarFields(snapshot.data() as Partial<ChildDocument>);
    transaction.update(childRef, { ...calendar, updatedAt: serverTimestamp() });
    return calendar;
  });
};

export const recordFirebaseBrushing = async (
  childId: string,
  period: 'morning' | 'evening',
  todayBrushes: number,
  weeklyBrushesByDay: number[]
) => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    dailyDateKey: getLocalDateKey(),
    weekKey: getLocalWeekKey(),
    todayBrushes,
    brushedPeriodsToday: todayBrushes >= 2 ? ['morning', 'evening'] : [period],
    weeklyBrushesByDay,
    weeklyBrushes: weeklyBrushesByDay.reduce((total, count) => total + count, 0),
    totalBrushes: increment(1),
    engagementScore: Math.min(100, 55 + weeklyBrushesByDay.reduce((total, count) => total + count, 0) * 4),
    lastBrushingAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseGamePlay = async (childId: string, gameId: string, dailyGamePlays: Record<string, number>) => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    dailyDateKey: getLocalDateKey(),
    dailyGamePlays,
    gamesPlayed: increment(1),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const syncFirebaseChildProfile = async (childId: string, child: ChildProfile) => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    nickname: child.nickname,
    age: child.age,
    points: child.points,
    badges: child.badges,
    level: child.level,
    totalBrushes: child.totalBrushes,
    weeklyBrushes: child.weeklyBrushes.reduce((total, brushes) => total + brushes, 0),
    weeklyBrushesByDay: child.weeklyBrushes,
    rewardsEarned: child.badges.length,
    theme: child.theme,
    avatar: child.avatar,
    lastActiveAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseUsage = async (childId: string, elapsedSeconds: number) => {
  if (!db || elapsedSeconds <= 0) return;
  await updateDoc(doc(db, 'children', childId), {
    totalUsageSeconds: increment(elapsedSeconds),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseLogin = async (childId: string) => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    loginCount: increment(1),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseActivityCompletion = async (childId: string) => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    activitiesCompleted: increment(1),
    lastActivityCompletedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseReminderFollowed = async (childId: string, period: 'morning' | 'evening') => {
  if (!db) return;
  await updateDoc(doc(db, 'children', childId), {
    remindersFollowed: increment(1),
    lastReminderPeriod: period,
    lastReminderFollowedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};
