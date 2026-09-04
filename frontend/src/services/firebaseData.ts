import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { Platform } from 'react-native';
import { collection, doc, getDoc, getDocs, increment, limit, orderBy, query, runTransaction, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { AdminUserSummary, ChildProfile, LeaderboardEntry, ThemeName, UserRole } from '../types/app';
import { emptyWeeklyBrushes, getLocalDateKey, getLocalWeekKey, normalizeWeeklyBrushes } from '../utils/calendar';
import {
  normalizeAndValidateEmail,
  normalizeAndValidateLegalName,
  validateChildAge,
  validateChildProfileForSync,
  validateDailyGamePlays,
  validateElapsedSeconds,
  validatePassword
} from '../utils/inputValidation';
import { auth, db, isFirebaseConfigured } from './firebase';
import { nativeAuthPersistence } from './firebaseAuthPersistence';

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
  appSessions: number;
  daysUsed: number;
  lastUsageDateKey: string;
  educationalVideoViews: number;
  lastBrushingAt?: string;
  unlockedCharacters?: string[];
  selectedCharacter?: string;
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
  leaderboardParticipating?: boolean;
};

const APPROVED_LEADERBOARD_AVATARS = new Set(['star', 'sun', 'rocket', 'leaf', 'rainbow', 'tooth']);
const BLOCKED_PUBLIC_NICKNAME_WORDS = ['admin', 'moderator', 'support', 'firebase', 'netlify'];

export const getPublicNicknameIssue = (nickname: string) => {
  const clean = nickname.trim();
  const normalized = clean.toLocaleLowerCase('en-US');
  if (clean.length < 3 || clean.length > 15) return 'Use a nickname from 3 to 15 characters.';
  if (!/^[\p{L}\p{N} _-]+$/u.test(clean)) return 'Use only letters, numbers, spaces, underscores, or hyphens.';
  if (clean.includes('@') || /https?:|www\./i.test(clean)) return 'Do not use an email address or website as a nickname.';
  if (/\d{4,}/.test(clean)) return 'Do not include a phone number or other long number in a nickname.';
  if (BLOCKED_PUBLIC_NICKNAME_WORDS.some((word) => normalized.includes(word))) return 'Choose a nickname that does not imply an official eSmile role.';
  return null;
};

const leaderboardPayload = (childId: string, child: Pick<ChildDocument, 'nickname' | 'avatar' | 'points' | 'level'>) => ({
  childId,
  nickname: child.nickname.trim().slice(0, 15),
  avatar: APPROVED_LEADERBOARD_AVATARS.has(child.avatar ?? '') ? child.avatar : 'tooth',
  points: Math.max(0, Math.floor(child.points)),
  level: Math.max(1, Math.floor(child.level)),
  updatedAt: serverTimestamp()
});

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

export const signInFirebaseUser = async (email: string, password: string, rememberMe = false) => {
  if (!auth) throw new Error('Firebase Auth is not configured.');
  const cleanEmail = normalizeAndValidateEmail(email);
  validatePassword(password);
  const persistentStorage = Platform.OS === 'web' ? browserLocalPersistence : nativeAuthPersistence;
  await setPersistence(auth, rememberMe && persistentStorage ? persistentStorage : inMemoryPersistence);
  return signInWithEmailAndPassword(auth, cleanEmail, password);
};

export const createFirebaseParentRegistration = async (
  parentEmail: string,
  password: string
) => {
  if (!auth || !db) throw new Error('Firebase is not configured.');

  const cleanEmail = normalizeAndValidateEmail(parentEmail);
  validatePassword(password);
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

export const recordFirebaseParentalConsent = async (
  parentLegalName: string,
  leaderboardRequested: boolean
) => {
  const user = auth?.currentUser;
  if (!user || !db || !user.emailVerified) throw new Error('Verify the parent email before submitting consent.');
  const cleanLegalName = normalizeAndValidateLegalName(parentLegalName);
  await setDoc(doc(db, 'parentalConsents', user.uid), {
    uid: user.uid,
    parentLegalName: cleanLegalName,
    signatureAcknowledgement: 'I CONSENT',
    internalUseGranted: true,
    leaderboardDisclosureGranted: leaderboardRequested,
    status: 'granted',
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
  validateChildAge(age);
  const publicNicknameIssue = getPublicNicknameIssue(cleanUsername);
  if (publicNicknameIssue) throw new Error(publicNicknameIssue);
  const normalizedUsername = cleanUsername.normalize('NFKC').toLocaleLowerCase('en-US');
  const usernameKey = `u_${encodeURIComponent(normalizedUsername)}`;
  const childId = user.uid;
  const childDocument: ChildDocument = {
    id: childId, parentId: user.uid, nickname: cleanUsername, normalizedUsername, usernameKey, age,
    points: 0, badges: [], level: 1, todayBrushes: 0, weeklyBrushes: 0,
    weeklyBrushesByDay: emptyWeeklyBrushes(), brushedPeriodsToday: [], dailyGamePlays: {},
    dailyDateKey: getLocalDateKey(), weekKey: getLocalWeekKey(), totalBrushes: 0,
    appSessions: 0, daysUsed: 0, lastUsageDateKey: '', educationalVideoViews: 0,
    unlockedCharacters: ['Toothy'], selectedCharacter: 'Toothy',
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
    if (consent.leaderboardDisclosureGranted) {
      transaction.set(doc(firestore, 'leaderboard', childId), leaderboardPayload(childId, childDocument));
    }
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
  await sendPasswordResetEmail(auth, normalizeAndValidateEmail(parentEmail));
};

export const requestFirebaseAccountDeletion = async (password: string) => {
  const user = auth?.currentUser;
  if (!user?.email) throw new Error('Please sign in again before deleting the account.');

  const deletionEndpoint = publicEnvironment.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim();
  if (!deletionEndpoint) throw new Error('Secure account deletion is not configured yet.');

  validatePassword(password);
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
    const rawLastBrushingAt = snapshot.data().lastBrushingAt as unknown;
    const lastBrushingAt = typeof rawLastBrushingAt === 'string'
      ? rawLastBrushingAt
      : rawLastBrushingAt && typeof (rawLastBrushingAt as { toDate?: unknown }).toDate === 'function'
        ? (rawLastBrushingAt as { toDate: () => Date }).toDate().toISOString()
        : undefined;
    transaction.update(childRef, {
      ...calendar,
      updatedAt: serverTimestamp()
    });
    return { ...data, ...calendar, lastBrushingAt };
  });
};

export const fetchFirebaseLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  if (!db || !auth?.currentUser?.emailVerified) return [];
  const snapshot = await withTimeout(
    getDocs(query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(100))),
    12000,
    'The leaderboard did not answer after 12 seconds.'
  );

  return snapshot.docs.flatMap((item) => {
    const data = item.data() as Partial<LeaderboardEntry> & { childId?: string };
    if (
      data.childId !== item.id
      || typeof data.nickname !== 'string'
      || typeof data.points !== 'number'
      || typeof data.level !== 'number'
    ) return [];
    return [{
      id: item.id,
      nickname: data.nickname.slice(0, 15),
      avatar: APPROVED_LEADERBOARD_AVATARS.has(data.avatar ?? '') ? data.avatar! : 'tooth',
      points: Math.max(0, Math.floor(data.points)),
      level: Math.max(1, Math.floor(data.level))
    }];
  });
};

export const withdrawFirebaseLeaderboardParticipation = async () => {
  const user = auth?.currentUser;
  if (!db || !user) throw new Error('Please sign in again.');
  const firestore = db;
  await runTransaction(firestore, async (transaction) => {
    const childRef = doc(firestore, 'children', user.uid);
    const childSnapshot = await transaction.get(childRef);
    if (!childSnapshot.exists()) throw new Error('The child profile could not be found.');
    transaction.update(childRef, { leaderboardParticipating: false, updatedAt: serverTimestamp() });
    transaction.delete(doc(firestore, 'leaderboard', user.uid));
  });
};

export const ensureFirebaseLeaderboardEntry = async () => {
  const user = auth?.currentUser;
  if (!db || !user) return;
  const firestore = db;
  await runTransaction(firestore, async (transaction) => {
    const childRef = doc(firestore, 'children', user.uid);
    const childSnapshot = await transaction.get(childRef);
    if (!childSnapshot.exists()) return;
    const child = childSnapshot.data() as ChildDocument;
    const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
    if (child.leaderboardParticipating === true) {
      transaction.set(leaderboardRef, leaderboardPayload(user.uid, child));
    } else {
      if (child.leaderboardParticipating !== false) {
        transaction.update(childRef, { leaderboardParticipating: false, updatedAt: serverTimestamp() });
      }
      transaction.delete(leaderboardRef);
    }
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
      appSessions: data.appSessions ?? 0,
      daysUsed: data.daysUsed ?? 0,
      totalPointsEarned: data.points ?? 0,
      educationalVideoViews: data.educationalVideoViews ?? 0,
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
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  if ((period !== 'morning' && period !== 'evening') || !Number.isInteger(todayBrushes) || todayBrushes < 1 || todayBrushes > 2) {
    throw new Error('Brushing data is invalid.');
  }
  if (!Array.isArray(weeklyBrushesByDay) || weeklyBrushesByDay.length !== 7 || weeklyBrushesByDay.some((count) => !Number.isInteger(count) || count < 0 || count > 2)) {
    throw new Error('Weekly brushing data is invalid.');
  }
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
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  validateDailyGamePlays(gameId, dailyGamePlays);
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
  if (childId !== auth?.currentUser?.uid || child.id !== childId) throw new Error('The child profile is invalid.');
  validateChildProfileForSync(child);
  const firestore = db;
  await runTransaction(firestore, async (transaction) => {
    const childRef = doc(firestore, 'children', childId);
    const snapshot = await transaction.get(childRef);
    if (!snapshot.exists()) throw new Error('The child profile could not be found.');
    const current = snapshot.data() as Partial<ChildDocument>;
    const update = {
      nickname: child.nickname,
      age: child.age,
      points: child.points,
      badges: child.badges,
      level: child.level,
      totalBrushes: child.totalBrushes,
      lastBrushingAt: child.lastBrushingAt ?? null,
      unlockedCharacters: child.unlockedCharacters,
      selectedCharacter: child.selectedCharacter,
      weeklyBrushes: child.weeklyBrushes.reduce((total, brushes) => total + brushes, 0),
      weeklyBrushesByDay: child.weeklyBrushes,
      rewardsEarned: child.badges.length,
      theme: child.theme,
      avatar: child.avatar,
      leaderboardParticipating: current.leaderboardParticipating === true,
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    transaction.update(childRef, update);
    if (current.leaderboardParticipating === true) {
      transaction.set(doc(firestore, 'leaderboard', childId), leaderboardPayload(childId, { ...current, ...update }));
    }
  });
};

export const recordFirebaseUsage = async (childId: string, elapsedSeconds: number) => {
  if (!db || elapsedSeconds <= 0) return;
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  validateElapsedSeconds(elapsedSeconds);
  await updateDoc(doc(db, 'children', childId), {
    totalUsageSeconds: increment(elapsedSeconds),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseAppSession = async (childId: string) => {
  if (!db) return;
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  const firestore = db;
  const dateKey = getLocalDateKey();
  await runTransaction(firestore, async (transaction) => {
    const childRef = doc(firestore, 'children', childId);
    const snapshot = await transaction.get(childRef);
    if (!snapshot.exists()) throw new Error('The child profile could not be found.');
    const data = snapshot.data() as Partial<ChildDocument>;
    const firstSessionToday = data.lastUsageDateKey !== dateKey;
    transaction.update(childRef, {
      appSessions: (data.appSessions ?? 0) + 1,
      daysUsed: (data.daysUsed ?? 0) + (firstSessionToday ? 1 : 0),
      lastUsageDateKey: dateKey,
      lastActiveAt: serverTimestamp(),
      lastActive: 'Now',
      updatedAt: serverTimestamp()
    });
  });
};

export const recordFirebaseEducationalVideoView = async (childId: string) => {
  if (!db) return;
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  await updateDoc(doc(db, 'children', childId), {
    educationalVideoViews: increment(1),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseLogin = async (childId: string) => {
  if (!db) return;
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
  await updateDoc(doc(db, 'children', childId), {
    loginCount: increment(1),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};

export const recordFirebaseActivityCompletion = async (childId: string) => {
  if (!db) return;
  if (childId !== auth?.currentUser?.uid) throw new Error('The child profile is invalid.');
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
  if (childId !== auth?.currentUser?.uid || (period !== 'morning' && period !== 'evening')) throw new Error('Reminder data is invalid.');
  await updateDoc(doc(db, 'children', childId), {
    remindersFollowed: increment(1),
    lastReminderPeriod: period,
    lastReminderFollowedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    lastActive: 'Now',
    updatedAt: serverTimestamp()
  });
};
