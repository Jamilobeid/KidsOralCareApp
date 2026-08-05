import React, { createContext, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { AppState } from 'react-native';
import { avatarOptions, challenges as initialChallenges, childProfile as demoChild, demoAdminUsers, games } from '../data/demoData';
import { themes } from '../data/themes';
import { applyTextDirection, getInitialLanguage, translate } from '../i18n/translations';
import { canUseFirebase, checkCurrentUserEmailVerification, createFirebaseChildProfile, createFirebaseParentRegistration, ensureFirebaseLeaderboardEntry, fetchFirebaseAdminUsers, fetchFirebaseLeaderboard, getFirebaseParentalConsentStatus, getFirebaseUserProfile, getFirebaseUserRole, getPublicNicknameIssue, normalizeFirebaseChildCalendar, recordFirebaseBrushing, recordFirebaseGamePlay, requestFirebaseAccountDeletion, requestFirebasePasswordReset, sendCurrentUserVerificationEmail, signInFirebaseUser, signOutFirebaseUser, recordFirebaseParentalConsent, syncFirebaseChildProfile, recordFirebaseUsage, recordFirebaseLogin, recordFirebaseActivityCompletion, recordFirebaseReminderFollowed, withdrawFirebaseLeaderboardParticipation } from '../services/firebaseData';
import { cancelBrushingReminders, requestReminderPermission, scheduleDailyReminder, scheduleTestReminder } from '../services/reminders';
import { auth } from '../services/firebase';
import { AdminUserSummary, AuthMode, ChildProfile, Challenge, LanguageCode, LeaderboardEntry, ReminderSettings, RootScreen, ThemeName, UserRole } from '../types/app';
import { appAlert as Alert } from '../utils/appAlert';
import { emptyWeeklyBrushes, getLocalDateKey, getLocalWeekKey, getMondayBasedDayIndex, normalizeWeeklyBrushes } from '../utils/calendar';
import { getFriendlyFirebaseError } from '../utils/firebaseError';
import { subscribeToInternetConnection } from '../services/connectivity';
import { createSyncActionId, loadOfflineProgress, loadSyncQueue, saveOfflineProgress, saveSyncQueue, SyncAction } from '../services/offlineProgress';
import { getLevelForPoints } from '../utils/levels';
import { isToothBuddyUnlocked, toothBuddies } from '../data/toothBuddies';

const initialLanguage = getInitialLanguage();
applyTextDirection(initialLanguage);
const LEGACY_REMEMBERED_PARENT_EMAIL_KEY = 'kidsOralCare:rememberedChild';
const PREFERRED_LANGUAGE_KEY = 'eSmile:preferredLanguage';
const CHARACTER_LEVEL_REQUIREMENTS: Record<string, number> = {
  Toothy: 1,
  'Tooth Fairy': 2,
  'Super Tooth': 2,
  'Dr Smile': 3,
  Brushy: 3,
  Minty: 4,
  Bubbles: 5,
  Sparky: 5,
  Flossy: 6,
  'Captain Enamel': 7,
  'Luna Smile': 8,
  'Professor Pearl': 9,
  'King Sparkle': 10
};
type BrushingPeriod = 'morning' | 'evening';
const BRUSHING_REWARD_POINTS = 5;
const NOON_MINUTES = 12 * 60;
const EVENING_WINDOW_START_MINUTES = 18 * 60;

const parseTimeMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
};

const getRewardPeriod = (brushedAt: Date, reminders: ReminderSettings): BrushingPeriod | null => {
  const brushedMinutes = brushedAt.getHours() * 60 + brushedAt.getMinutes();
  const morningReminderMinutes = parseTimeMinutes(reminders.morning);
  const eveningReminderMinutes = parseTimeMinutes(reminders.evening);

  if (morningReminderMinutes !== null && brushedMinutes >= morningReminderMinutes && brushedMinutes < NOON_MINUTES) return 'morning';
  if (eveningReminderMinutes !== null && brushedMinutes >= EVENING_WINDOW_START_MINUTES && brushedMinutes <= eveningReminderMinutes) return 'evening';
  return null;
};
type PendingBrushingReminder = {
  period: BrushingPeriod;
  notificationDate: number;
};

const REMINDER_FOLLOW_WINDOW_MS = 60 * 60 * 1000;

type AppContextValue = {
  screen: RootScreen;
  setScreen: (screen: RootScreen) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
  child: ChildProfile;
  username: string;
  role: UserRole;
  isAdmin: boolean;
  adminUsers: AdminUserSummary[];
  adminUsersStatus: string;
  isFirebaseReady: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  refreshAdminUsers: () => Promise<void>;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  signInChild: (parentEmail: string, password: string) => Promise<void>;
  registerParent: (password: string, parentEmail: string) => Promise<void>;
  verificationPending: boolean;
  verificationEmailMasked: string;
  consentPending: boolean;
  childSetupPending: boolean;
  checkParentEmailVerification: () => Promise<void>;
  submitParentalConsent: (parentLegalName: string, leaderboardRequested: boolean, signature: string) => Promise<void>;
  completeChildSetup: (username: string, age: number) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  cancelVerification: () => Promise<void>;
  requestPasswordReset: (parentEmail: string) => Promise<void>;
  signOutAccount: () => Promise<boolean>;
  deleteAccountAndData: (password: string, confirmation: string) => Promise<boolean>;
  theme: (typeof themes)[ThemeName];
  reminders: ReminderSettings;
  setReminders: (settings: ReminderSettings) => void;
  saveReminders: (options?: { morningEnabled?: boolean; eveningEnabled?: boolean }) => Promise<void>;
  sendTestReminder: () => Promise<void>;
  brushingCountToday: number;
  completeBrushing: (startedAt?: Date) => boolean;
  gamePlays: Record<string, number>;
  recordGamePlay: (gameId: string) => boolean;
  awardGame: (gameId: string, pointsOverride?: number) => void;
  challenges: Challenge[];
  updateAvatar: (avatar: string) => void;
  updateTheme: (theme: ThemeName) => void;
  chooseCharacter: (character: string) => void;
  unlockCharacter: (character: string) => boolean;
  games: typeof games;
  leaderboard: LeaderboardEntry[];
  leaderboardStatus: 'idle' | 'loading' | 'ready' | 'error';
  leaderboardParticipating: boolean;
  refreshLeaderboard: () => Promise<void>;
  leaveLeaderboard: () => Promise<boolean>;
  avatarOptions: typeof avatarOptions;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [screen, setScreen] = useState<RootScreen>('language');
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);
  const [child, setChild] = useState<ChildProfile>(demoChild);
  const [username, setUsername] = useState(demoChild.nickname);
  const [role, setRole] = useState<UserRole>('user');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [firebaseAdminUsers, setFirebaseAdminUsers] = useState<AdminUserSummary[]>([]);
  const [adminUsersStatus, setAdminUsersStatus] = useState('Not loaded yet.');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [verificationPending, setVerificationPending] = useState(false);
  const [verificationEmailMasked, setVerificationEmailMasked] = useState('');
  const [consentPending, setConsentPending] = useState(false);
  const [childSetupPending, setChildSetupPending] = useState(false);
  const [reminders, setReminders] = useState<ReminderSettings>({ morning: '07:30', evening: '19:30' });
  const [brushingCountToday, setBrushingCountToday] = useState(0);
  const [brushedPeriodsToday, setBrushedPeriodsToday] = useState<BrushingPeriod[]>([]);
  const [gamePlays, setGamePlays] = useState<Record<string, number>>({});
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges.map((challenge) => ({ ...challenge, progress: 0 })));
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [leaderboardParticipating, setLeaderboardParticipating] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const syncInProgressRef = React.useRef(false);
  const hydratedUserRef = React.useRef<string | null>(null);
  const queueWriteRef = React.useRef<Promise<void>>(Promise.resolve());

  const usageStartedAtRef = React.useRef<number | null>(null);
  const dailyDateKeyRef = React.useRef(getLocalDateKey());
  const weekKeyRef = React.useRef(getLocalWeekKey());

  const pendingReminderRef = React.useRef<PendingBrushingReminder | null>(null);

  React.useEffect(() => subscribeToInternetConnection(setIsOnline), []);

  const enqueueSyncAction = async (userId: string, action: SyncAction) => {
    queueWriteRef.current = queueWriteRef.current.then(async () => {
      const queue = await loadSyncQueue(userId);
      const nextQueue = [...queue, action];
      await saveSyncQueue(userId, nextQueue);
      setPendingSyncCount(nextQueue.length);
    });
    await queueWriteRef.current;
  };

  const performSyncAction = async (userId: string, action: SyncAction) => {
    if (action.type === 'brushing') {
      await recordFirebaseBrushing(userId, action.period, action.nextCount, action.weeklyBrushes);
      await syncFirebaseChildProfile(userId, action.child);
    } else if (action.type === 'gamePlay') {
      await recordFirebaseGamePlay(userId, action.gameId, action.dailyGamePlays);
    } else if (action.type === 'activityCompletion') {
      await recordFirebaseActivityCompletion(userId);
    } else {
      await syncFirebaseChildProfile(userId, action.child);
    }
  };

  const flushSyncQueue = React.useCallback(async (userId: string) => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    try {
      const queue = await loadSyncQueue(userId);
      setPendingSyncCount(queue.length);
      const remaining = [...queue];
      while (remaining.length > 0) {
        await performSyncAction(userId, remaining[0]);
        remaining.shift();
        await saveSyncQueue(userId, remaining);
        setPendingSyncCount(remaining.length);
      }
    } catch (error) {
      console.warn('Progress is waiting for an internet connection:', error);
    } finally {
      syncInProgressRef.current = false;
    }
  }, []);

  React.useEffect(() => {
    if (!currentUserId) {
      hydratedUserRef.current = null;
      setPendingSyncCount(0);
      return;
    }
    let active = true;
    void Promise.all([loadSyncQueue(currentUserId), loadOfflineProgress(currentUserId)]).then(([queue, saved]) => {
      if (!active) return;
      setPendingSyncCount(queue.length);
      if (saved && queue.length > 0) {
        setChild({ ...saved.child, level: getLevelForPoints(saved.child.points) });
        setUsername(saved.child.nickname);
        setBrushingCountToday(saved.brushingCountToday);
        setBrushedPeriodsToday(saved.brushedPeriodsToday);
        setGamePlays(saved.gamePlays);
        setChallenges(saved.challenges);
        dailyDateKeyRef.current = saved.dailyDateKey;
        weekKeyRef.current = saved.weekKey;
      }
      hydratedUserRef.current = currentUserId;
      if (isOnline) void flushSyncQueue(currentUserId);
    }).catch((error) => console.warn('Could not restore offline progress:', error));
    return () => { active = false; };
  }, [currentUserId, isOnline, flushSyncQueue]);

  React.useEffect(() => {
    if (!currentUserId || hydratedUserRef.current !== currentUserId) return;
    void saveOfflineProgress(currentUserId, {
      child,
      brushingCountToday,
      brushedPeriodsToday,
      gamePlays,
      challenges,
      dailyDateKey: dailyDateKeyRef.current,
      weekKey: weekKeyRef.current
    }).catch((error) => console.warn('Could not save offline progress:', error));
  }, [currentUserId, child, brushingCountToday, brushedPeriodsToday, gamePlays, challenges]);

  const resetCalendarStateIfNeeded = (now = new Date()) => {
    const nextDailyDateKey = getLocalDateKey(now);
    const nextWeekKey = getLocalWeekKey(now);
    const dayChanged = dailyDateKeyRef.current !== nextDailyDateKey;
    const weekChanged = weekKeyRef.current !== nextWeekKey;

    if (dayChanged) {
      dailyDateKeyRef.current = nextDailyDateKey;
      setBrushingCountToday(0);
      setBrushedPeriodsToday([]);
      setGamePlays({});
      setChallenges((items) => items.map((challenge) => (
        challenge.cadence === 'daily' ? { ...challenge, progress: 0 } : challenge
      )));
      pendingReminderRef.current = null;
    }

    if (weekChanged) {
      weekKeyRef.current = nextWeekKey;
      setChild((current) => ({ ...current, weeklyBrushes: emptyWeeklyBrushes() }));
      setChallenges((items) => items.map((challenge) => (
        challenge.cadence === 'weekly' ? { ...challenge, progress: 0 } : challenge
      )));
    }

    if ((dayChanged || weekChanged) && currentUserId && canUseFirebase) {
      void normalizeFirebaseChildCalendar(currentUserId).catch((error) => {
        console.warn('Could not persist calendar reset:', error);
      });
    }

    return { dayChanged, weekChanged };
  };

  React.useEffect(() => {
  const handleReminderResponse = (
    response: Notifications.NotificationResponse) => {
    const notification = response.notification;
    const data = notification.request.content.data;

    if (data?.type !== 'brushing-reminder') {
      return;
    }

    if ( data?.period !== 'morning' && data?.period !== 'evening') {
      return;
    }

    const notificationDate = notification.date;
    const age = Date.now() - notificationDate;

    setScreen('brushing');

    if ( age < 0 || age > REMINDER_FOLLOW_WINDOW_MS) {
      return;
    }

    pendingReminderRef.current = { period: data.period, notificationDate };
  };

  void Notifications
    .getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        handleReminderResponse(response);

        void Notifications
          .clearLastNotificationResponseAsync();
      }
    });

  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      handleReminderResponse
    );

  return () => {
    subscription.remove();
  };
}, []);

  React.useEffect(() => {
    if (!currentUserId || role !== 'user' || !canUseFirebase) {
      usageStartedAtRef.current = null;
      return;
    }

    usageStartedAtRef.current = Date.now();

    const flushUsage = () => {
      const startedAt = usageStartedAtRef.current;
      if (startedAt === null) return;

      const elapsedSeconds = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      usageStartedAtRef.current = Date.now();

      if (elapsedSeconds >= 1) {
        void recordFirebaseUsage(
          currentUserId,
          elapsedSeconds
        );
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState === 'active') {
          resetCalendarStateIfNeeded();
          usageStartedAtRef.current = Date.now();
        } else {
          flushUsage();
          usageStartedAtRef.current = null;
        }
      }
    );

    const intervalId = setInterval(flushUsage, 5 * 60_000);

    return () => {
      flushUsage();
      clearInterval(intervalId);
      subscription.remove();
      usageStartedAtRef.current = null;
    };
  }, [currentUserId, role]);

  React.useEffect(() => {
    if (!currentUserId || role !== 'user') return;
    resetCalendarStateIfNeeded();
    const calendarInterval = setInterval(() => resetCalendarStateIfNeeded(), 60_000);
    return () => clearInterval(calendarInterval);
  }, [currentUserId, role]);

  const t = (key: string) => translate(language, key);
  const isRtl = language === 'ar';

  const setLanguage = (nextLanguage: LanguageCode) => {
    applyTextDirection(nextLanguage);
    setLanguageState(nextLanguage);
    void AsyncStorage.setItem(PREFERRED_LANGUAGE_KEY, nextLanguage).catch((error) => {
      console.warn('Could not save the language preference:', error);
    });
  };

  React.useEffect(() => {
    // Privacy migration: remove the parent email saved by older app versions.
    // Current versions never persist account email addresses on the device.
    void AsyncStorage.removeItem(LEGACY_REMEMBERED_PARENT_EMAIL_KEY).catch((error) => {
      console.warn('Could not remove legacy remembered parent email:', error);
    });

    void AsyncStorage.getItem(PREFERRED_LANGUAGE_KEY).then((savedLanguage) => {
      if (savedLanguage === 'en' || savedLanguage === 'fr' || savedLanguage === 'ar') {
        applyTextDirection(savedLanguage);
        setLanguageState(savedLanguage);
      }
    }).catch((error) => {
      console.warn('Could not restore the language preference:', error);
    });
  }, []);

  const addPoints = (points: number) => {
    setChild((current) => {
      const nextPoints = current.points + points;
      const earnedBadges = new Set(current.badges);
      if (nextPoints >= 50) earnedBadges.add('pocket-of-stars');
      if (nextPoints >= 100) earnedBadges.add('star-saver');
      if (nextPoints >= 250) earnedBadges.add('star-explorer');
      if (nextPoints >= 500) earnedBadges.add('star-captain');
      if (nextPoints >= 1000) earnedBadges.add('galaxy-of-smiles');
      const nextChild = { ...current, points: nextPoints, badges: [...earnedBadges], level: getLevelForPoints(nextPoints) };
      if (currentUserId && canUseFirebase) {
        const action: SyncAction = { id: createSyncActionId(), type: 'profile', child: nextChild };
        if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
        else void enqueueSyncAction(currentUserId, action);
      }
      return nextChild;
    });
  };

  const applyChildUsername = (nextUsername: string, nextAge?: number) => {
    const cleanUsername = nextUsername.trim() || demoChild.nickname;
    setUsername(cleanUsername);
    setChild((current) => ({ ...current, nickname: cleanUsername, age: nextAge ?? current.age }));
    setScreen('childHome');
  };

  const applyFirebaseProfile = ( nextUsername: string, profile?: Awaited<ReturnType<typeof getFirebaseUserProfile>>) => {
    const cleanUsername = profile?.nickname ?? (nextUsername.trim() || demoChild.nickname);

    setUsername(cleanUsername);

    setChild((current) => ({
      ...current,
      id: profile?.id ?? current.id,
      nickname: cleanUsername,
      age: profile?.age ?? current.age,
      points: profile?.points ?? 0,
      badges: profile?.badges ?? [],
      level: getLevelForPoints(profile?.points ?? 0),
      totalBrushes: profile?.totalBrushes ?? 0,
      lastBrushingAt: typeof profile?.lastBrushingAt === 'string' ? profile.lastBrushingAt : undefined,
      unlockedCharacters: Array.isArray(profile?.unlockedCharacters) ? profile.unlockedCharacters : ['Toothy'],
      selectedCharacter: typeof profile?.selectedCharacter === 'string' ? profile.selectedCharacter : 'Toothy',
      weeklyBrushes: normalizeWeeklyBrushes(profile?.weeklyBrushesByDay),
      theme: profile?.theme ?? current.theme,
      avatar: profile?.avatar ?? current.avatar
    }));

    setBrushingCountToday(profile?.todayBrushes ?? 0);
    setBrushedPeriodsToday(profile?.brushedPeriodsToday ?? []);
    setGamePlays(profile?.dailyGamePlays ?? {});
    setLeaderboardParticipating(profile?.leaderboardParticipating === true);
    dailyDateKeyRef.current = profile?.dailyDateKey ?? getLocalDateKey();
    weekKeyRef.current = profile?.weekKey ?? getLocalWeekKey();
    setScreen('childHome');
  };

  const refreshLeaderboard = async () => {
    if (!canUseFirebase || role === 'admin') {
      setLeaderboard([]);
      setLeaderboardStatus('ready');
      return;
    }
    setLeaderboardStatus('loading');
    try {
      const entries = await fetchFirebaseLeaderboard();
      setLeaderboard(entries);
      setLeaderboardStatus('ready');
    } catch (error) {
      console.warn('Could not load the leaderboard:', error);
      setLeaderboard([]);
      setLeaderboardStatus('error');
    }
  };

  const leaveLeaderboard = async () => {
    if (!isOnline) {
      Alert.alert(t('internetRequired'), t('internetRequiredMessage'));
      return false;
    }
    try {
      await withdrawFirebaseLeaderboardParticipation();
      setLeaderboardParticipating(false);
      setLeaderboard((entries) => entries.filter((entry) => entry.id !== currentUserId));
      return true;
    } catch (error) {
      Alert.alert(t('leaderboardRemovalFailed'), getFriendlyFirebaseError(error, t('pleaseTryAgain')));
      return false;
    }
  };

  React.useEffect(() => {
    if (screen === 'leaderboard') {
      void refreshLeaderboard();
    }
  }, [screen]);

  React.useEffect(() => {
    if (!auth || !canUseFirebase) return;

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active || !user) return;

      try {
        const nextRole = await getFirebaseUserRole(user);
        if (!active) return;

        if (nextRole === 'user' && !user.emailVerified) {
          setCurrentUserId(user.uid);
          setRole('user');
          setVerificationEmailMasked(user.email ?? '');
          setVerificationPending(true);
          setScreen('auth');
          return;
        }

        const profile = await getFirebaseUserProfile(user);
        if (!active) return;

        if (nextRole === 'user' && !profile) {
          const consent = await getFirebaseParentalConsentStatus();
          if (!active) return;
          setCurrentUserId(user.uid);
          setRole('user');
          if (consent.status === 'granted') {
            setChildSetupPending(true);
          } else {
            setConsentPending(true);
          }
          setScreen('auth');
          return;
        }

        setCurrentUserId(nextRole === 'user' ? user.uid : null);
        setRole(nextRole);
        applyFirebaseProfile(nextRole === 'admin' ? 'Admin' : profile?.nickname ?? 'Child', profile);
        if (nextRole === 'user') {
          await ensureFirebaseLeaderboardEntry().catch((error) => {
            console.warn('Could not synchronize the approved leaderboard profile:', error);
          });
        }

        if (nextRole === 'admin') {
          setAdminUsersStatus('Loading users from Firebase...');
          const users = await fetchFirebaseAdminUsers();
          if (!active) return;
          setFirebaseAdminUsers(users);
          setAdminUsersStatus(`Loaded ${users.length} user${users.length === 1 ? '' : 's'} from Firebase.`);
        }
      } catch (error) {
        console.warn('Could not restore the secure sign-in session:', getFriendlyFirebaseError(error, 'Please sign in again.'));
        const saved = await loadOfflineProgress(user.uid).catch(() => null);
        if (saved) {
          setCurrentUserId(user.uid);
          setRole('user');
          setChild({ ...saved.child, level: getLevelForPoints(saved.child.points) });
          setUsername(saved.child.nickname);
          setBrushingCountToday(saved.brushingCountToday);
          setBrushedPeriodsToday(saved.brushedPeriodsToday);
          setGamePlays(saved.gamePlays);
          setChallenges(saved.challenges);
          dailyDateKeyRef.current = saved.dailyDateKey;
          weekKeyRef.current = saved.weekKey;
          hydratedUserRef.current = user.uid;
          setScreen('childHome');
        } else {
          await signOutFirebaseUser().catch(() => undefined);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInChild = async (parentEmail: string, password: string) => {
    if (!parentEmail.trim() || !password.trim()) {
      Alert.alert(t('missingLogin'));
      return;
    }
    const cleanEmail = parentEmail.trim().toLowerCase();
    if (canUseFirebase) {
      try {
        const credential = await signInFirebaseUser(cleanEmail, password);
        const nextRole = await getFirebaseUserRole(credential.user);
        if (nextRole === 'user' && !credential.user.emailVerified) {
          setVerificationPending(true);
          setVerificationEmailMasked(credential.user.email ?? cleanEmail);
          Alert.alert(t('verificationRequired'), t('verificationRequiredMessage'));
          return;
        }
        const profile = await getFirebaseUserProfile(credential.user);
        if (nextRole === 'user') {
          if (!profile) {
            const consent = await getFirebaseParentalConsentStatus();
            setCurrentUserId(credential.user.uid);
            setRole('user');
            if (consent.status === 'granted') {
              setChildSetupPending(true);
            } else {
              setConsentPending(true);
            }
            return;
          }
          void recordFirebaseLogin(credential.user.uid).catch((error) => {
            console.warn('Could not record login count:', error);
          });
        }
        setCurrentUserId(nextRole === 'user' ? credential.user.uid : null);
        setRole(nextRole);
        applyFirebaseProfile(nextRole === 'admin' ? 'Admin' : profile?.nickname ?? 'Child', profile);
        if (nextRole === 'user') {
          await ensureFirebaseLeaderboardEntry().catch((error) => {
            console.warn('Could not synchronize the approved leaderboard profile:', error);
          });
        }
        if (nextRole === 'admin') {
          setAdminUsersStatus('Loading users from Firebase...');
          const users = await fetchFirebaseAdminUsers();
          setFirebaseAdminUsers(users);
          setAdminUsersStatus(`Loaded ${users.length} user${users.length === 1 ? '' : 's'} from Firebase.`);
        }
        return;
      } catch (error) {
        Alert.alert(t('loginFailed'), getFriendlyFirebaseError(error, t('loginFailedMessage')));
        return;
      }
    }

    setRole('user');
    setCurrentUserId(null);
    applyChildUsername(cleanEmail);
  };

  const registerParent = async (password: string, parentEmail: string) => {
    if (!parentEmail.trim() || password.trim().length < (canUseFirebase ? 6 : 4)) {
      Alert.alert(t('passwordHint'));
      return;
    }
    if (canUseFirebase) {
      try {
        const credential = await createFirebaseParentRegistration(parentEmail, password);
        setCurrentUserId(credential.user.uid);
        setRole('user');
        setVerificationEmailMasked(credential.user.email ?? parentEmail.trim());
        setVerificationPending(true);
        try {
          await sendCurrentUserVerificationEmail();
          Alert.alert(t('checkParentEmail'), t('verificationLinkSent'));
        } catch (error) {
          Alert.alert(t('accountCreated'), error instanceof Error ? error.message : t('resendVerificationHelp'));
        }
        return;
      } catch (error) {
        console.error('Parent account registration failed:', {
          code: (error as { code?: string })?.code ?? 'unknown',
          message: error instanceof Error ? error.message : 'Unknown Firebase error'
        });
        Alert.alert(t('accountError'), getFriendlyFirebaseError(error, t('accountCreationFailed')));
        return;
      }
    }
  };

  const checkParentEmailVerification = async () => {
    try {
      const verified = await checkCurrentUserEmailVerification();
      if (!verified) {
        Alert.alert(t('notVerifiedYet'), t('notVerifiedMessage'));
        return;
      }
      const user = auth?.currentUser;
      if (!user) throw new Error('Please sign in again.');
      setCurrentUserId(user.uid);
      setRole('user');
      setVerificationPending(false);
      setConsentPending(true);
      Alert.alert(t('emailVerified'), t('emailVerifiedMessage'));
    } catch (error) {
      Alert.alert(t('verificationCheckFailed'), getFriendlyFirebaseError(error, t('pleaseTryAgain')));
    }
  };

  const submitParentalConsent = async (parentLegalName: string, leaderboardRequested: boolean, signature: string) => {
    if (parentLegalName.trim().length < 2 || signature.trim() !== 'I CONSENT') {
      Alert.alert(t('consentIncomplete'), t('consentIncompleteMessage'));
      return;
    }
    try {
      await recordFirebaseParentalConsent(parentLegalName, leaderboardRequested);
      setConsentPending(false);
      setChildSetupPending(true);
      Alert.alert(t('consentApproved'), t('consentApprovedMessage'));
    } catch (error) {
      Alert.alert(t('consentSubmitFailed'), getFriendlyFirebaseError(error, t('checkInformationTryAgain')));
    }
  };

  const completeChildSetup = async (nextUsername: string, age: number) => {
    if (!nextUsername.trim() || age < 4 || age > 12) {
      Alert.alert(t('childProfileIncomplete'), t('childProfileIncompleteMessage'));
      return;
    }
    if (getPublicNicknameIssue(nextUsername)) {
      Alert.alert(t('nicknameSafetyCheck'), t('nicknameSafetyMessage'));
      return;
    }
    try {
      const childId = await createFirebaseChildProfile(nextUsername, age, child);
      const user = auth?.currentUser;
      if (!user) throw new Error('Please sign in again.');
      const profile = await getFirebaseUserProfile(user);
      if (!profile) throw new Error('The child profile could not be loaded.');
      setCurrentUserId(childId);
      setChildSetupPending(false);
      applyFirebaseProfile(nextUsername, profile);
      Alert.alert(t('familyAccountReady'), t('familyAccountReadyMessage'));
    } catch (error) {
      Alert.alert(t('childProfileCreationFailed'), getFriendlyFirebaseError(error, t('pleaseTryAgain')));
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const email = await sendCurrentUserVerificationEmail();
      setVerificationEmailMasked(email);
      Alert.alert(t('emailSent'), t('newVerificationLinkSent'));
    } catch (error) {
      Alert.alert(t('resendEmailFailed'), getFriendlyFirebaseError(error, t('pleaseTryAgainLater')));
    }
  };

  const cancelVerification = async () => {
    await signOutFirebaseUser();
    setVerificationPending(false);
    setVerificationEmailMasked('');
    setConsentPending(false);
    setChildSetupPending(false);
    setCurrentUserId(null);
  };

  const requestPasswordReset = async (parentEmail: string) => {
    try {
      await requestFirebasePasswordReset(parentEmail);
      Alert.alert(t('checkParentEmail'), t('passwordResetNeutral'));
    } catch {
      Alert.alert(t('requestReceived'), t('passwordResetNeutral'));
    }
  };

  const signOutAccount = async () => {
    try {
      // Firebase sign-out removes the persisted refresh credential from
      // Keychain/Keystore before any local account state is discarded.
      await signOutFirebaseUser();
    } catch (error) {
      Alert.alert(t('signOutFailed'), getFriendlyFirebaseError(error, t('checkConnectionTryAgain')));
      return false;
    }

    usageStartedAtRef.current = null;
    pendingReminderRef.current = null;
    await Promise.allSettled([
      cancelBrushingReminders(),
      Notifications.dismissAllNotificationsAsync()
    ]);

    setCurrentUserId(null);
    setRole('user');
    setChild({ ...demoChild, weeklyBrushes: emptyWeeklyBrushes() });
    setUsername(demoChild.nickname);
    setBrushingCountToday(0);
    setBrushedPeriodsToday([]);
    setGamePlays({});
    setChallenges(initialChallenges.map((challenge) => ({ ...challenge, progress: 0 })));
    setFirebaseAdminUsers([]);
    setLeaderboard([]);
    setLeaderboardStatus('idle');
    setLeaderboardParticipating(false);
    setAdminUsersStatus('Not loaded yet.');
    setVerificationPending(false);
    setVerificationEmailMasked('');
    setConsentPending(false);
    setChildSetupPending(false);
    setAuthMode('login');
    setScreen('welcome');
    return true;
  };

  const deleteAccountAndData = async (password: string, confirmation: string) => {
    if (!isOnline) {
      Alert.alert(t('internetRequired'), t('internetRequiredMessage'));
      return false;
    }
    if (role === 'admin') {
      Alert.alert(t('adminAccountProtected'), t('adminAccountProtectedMessage'));
      return false;
    }
    if (!password.trim() || confirmation.trim() !== 'DELETE') {
      Alert.alert(t('confirmationRequired'), t('confirmationRequiredMessage'));
      return false;
    }

    try {
      usageStartedAtRef.current = null;
      pendingReminderRef.current = null;
      await requestFirebaseAccountDeletion(password);
      await Promise.allSettled([
        cancelBrushingReminders(),
        Notifications.dismissAllNotificationsAsync(),
        signOutFirebaseUser()
      ]);

      setCurrentUserId(null);
      setRole('user');
      setChild({ ...demoChild, weeklyBrushes: emptyWeeklyBrushes() });
      setUsername(demoChild.nickname);
      setBrushingCountToday(0);
      setBrushedPeriodsToday([]);
      setGamePlays({});
      setChallenges(initialChallenges.map((challenge) => ({ ...challenge, progress: 0 })));
      setFirebaseAdminUsers([]);
      setLeaderboard([]);
      setLeaderboardStatus('idle');
      setLeaderboardParticipating(false);
      setAdminUsersStatus('Not loaded yet.');
      setVerificationPending(false);
      setVerificationEmailMasked('');
      setAuthMode('login');
      setScreen('welcome');
      Alert.alert(t('accountDeleted'), t('accountDeletedMessage'));
      return true;
    } catch (error) {
      Alert.alert(t('accountDeletionFailed'), getFriendlyFirebaseError(error, t('checkPasswordConnection')));
      return false;
    }
  };

  const refreshAdminUsers = async () => {
    if (!canUseFirebase || role !== 'admin') return;
    try {
      setAdminUsersStatus('Loading users from Firebase...');
      const users = await fetchFirebaseAdminUsers();
      setFirebaseAdminUsers(users);
      setAdminUsersStatus(users.length ? `Loaded ${users.length} user${users.length === 1 ? '' : 's'} from Firebase.` : 'Firebase loaded successfully, but found 0 child users.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load users from Firebase.';
      setAdminUsersStatus(`Firebase read failed: ${message}`);
      Alert.alert(t('refreshFailed'), getFriendlyFirebaseError(error, t('loadUsersFailed')));
    }
  };

  const completeBrushing = (startedAt = new Date()) => {
    const now = new Date();
    const { dayChanged } = resetCalendarStateIfNeeded(now);
    const period = getRewardPeriod(startedAt, reminders);
    const completedPeriods = dayChanged ? [] : brushedPeriodsToday;

    if (!period || completedPeriods.includes(period)) return false;

    setBrushedPeriodsToday((periods) => {
      const currentPeriods = dayChanged ? [] : periods;
      if (currentPeriods.includes(period)) return periods;

      const pendingReminder = pendingReminderRef.current;

      if (pendingReminder) { 

        const reminderAge = Date.now() - pendingReminder.notificationDate;
        const matchesPeriod = pendingReminder.period === period;
        const isWithinWindow = reminderAge >= 0 && reminderAge <= REMINDER_FOLLOW_WINDOW_MS;

        if (matchesPeriod && isWithinWindow && currentUserId && canUseFirebase) {
          pendingReminderRef.current = null;

          void recordFirebaseReminderFollowed(
            currentUserId,
            period
          ).catch((error) => {
            console.warn('Could not record followed reminder:', error);
          });
        }else if (!isWithinWindow) {
          pendingReminderRef.current = null;
        }
      }

      const nextPeriods = [...currentPeriods, period];
      const nextCount = Math.min(nextPeriods.length, 2);
      setBrushingCountToday(nextCount);
      setChallenges((items) => items.map((challenge) => {
        if (challenge.id === 'daily-two-brushes') return { ...challenge, progress: nextCount };
        if (challenge.id === 'weekly-streak' && currentPeriods.length === 0) return { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) };
        return challenge;
      }));
      setChild((current) => {
        const todayIndex = getMondayBasedDayIndex(now);
        const weeklyBrushes = [...current.weeklyBrushes];
        weeklyBrushes[todayIndex] = Math.min((weeklyBrushes[todayIndex] ?? 0) + 1, 2);
        const nextPoints = current.points + BRUSHING_REWARD_POINTS;
        const previousBrushingAt = current.lastBrushingAt ? new Date(current.lastBrushingAt) : null;
        const earnedBadges = new Set(current.badges);
        const nextTotalBrushes = current.totalBrushes + 1;
        if (nextTotalBrushes >= 10) earnedBadges.add('timer-tamer');
        if (nextTotalBrushes >= 25) earnedBadges.add('clockwork-brusher');
        if (nextTotalBrushes >= 50) earnedBadges.add('time-guardian');
        if (nextTotalBrushes >= 100) earnedBadges.add('super-number');
        if (now.getMonth() === 0 && now.getDate() === 1) earnedBadges.add('new-year-new-smile');
        if (previousBrushingAt && now.getTime() - previousBrushingAt.getTime() >= 7 * 24 * 60 * 60 * 1000) {
          earnedBadges.add('second-chance-smile');
        }
        const scheduledTime = period === 'morning' ? reminders.morning : reminders.evening;
        const [scheduledHour, scheduledMinute] = scheduledTime.split(':').map(Number);
        const scheduledAt = new Date(startedAt);
        scheduledAt.setHours(scheduledHour, scheduledMinute, 0, 0);
        const reminderDifference = startedAt.getTime() - scheduledAt.getTime();
        if (reminderDifference >= 0 && reminderDifference <= 5 * 60 * 1000) earnedBadges.add('exactly-on-time');
        if (nextPoints >= 50) earnedBadges.add('pocket-of-stars');
        if (nextPoints >= 100) earnedBadges.add('star-saver');
        if (nextPoints >= 250) earnedBadges.add('star-explorer');
        if (nextPoints >= 500) earnedBadges.add('star-captain');
        if (nextPoints >= 1000) earnedBadges.add('galaxy-of-smiles');
        const nextChild = {
          ...current,
          points: nextPoints,
          badges: [...earnedBadges],
          level: getLevelForPoints(nextPoints),
          totalBrushes: nextTotalBrushes,
          lastBrushingAt: now.toISOString(),
          weeklyBrushes
        };
        if (currentUserId && canUseFirebase) {
          const action: SyncAction = { id: createSyncActionId(), type: 'brushing', period, nextCount, weeklyBrushes, child: nextChild };
          if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
          else void enqueueSyncAction(currentUserId, action);
        }
        return nextChild;
      });
      return nextPeriods;
    });
    return true;
  };

  const recordGamePlay = (gameId: string) => {
    const { dayChanged } = resetCalendarStateIfNeeded();
    const game = games.find((item) => item.id === gameId);
    if (!game) return false;
    const used = dayChanged ? 0 : (gamePlays[gameId] ?? 0);
    if (used >= game.dailyLimit) {
      Alert.alert(t('limitReached'));
      return false;
    }
    const nextGamePlays = dayChanged ? { [gameId]: 1 } : { ...gamePlays, [gameId]: used + 1 };
    setGamePlays(nextGamePlays);
    if (currentUserId && canUseFirebase) {
      const action: SyncAction = { id: createSyncActionId(), type: 'gamePlay', gameId, dailyGamePlays: nextGamePlays };
      if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
      else void enqueueSyncAction(currentUserId, action);
    }
    return true;
  };

  const awardGame = (gameId: string, pointsOverride?: number) => {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    setChallenges((items) => items.map((challenge) => challenge.id === 'weekly-games' ? { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) } : challenge));
    addPoints(pointsOverride ?? game.points);
    
    if (currentUserId && canUseFirebase) {
      const action: SyncAction = { id: createSyncActionId(), type: 'activityCompletion' };
      if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
      else void enqueueSyncAction(currentUserId, action);
    }
};

  const saveReminders = async (options?: { morningEnabled?: boolean; eveningEnabled?: boolean }) => {
    try {
      const permissionGranted = await requestReminderPermission();
      if (!permissionGranted) {
        Alert.alert(t('notificationsDisabled'), t('enableNotificationsSaveAgain'));
        return;
      }

      await cancelBrushingReminders();
      if (options?.morningEnabled !== false) {
        await scheduleDailyReminder(t('morningReminder'), reminders.morning, 'morning');
      }
      if (options?.eveningEnabled !== false) {
        await scheduleDailyReminder(t('eveningReminder'), reminders.evening, 'evening');
      }
      Alert.alert(t('reminderSaved'));
    } catch (error) {
      Alert.alert(t('saveRemindersFailed'), getFriendlyFirebaseError(error, t('checkNotificationPermission')));
    }
  };

  const sendTestReminder = async () => {
    try {
      const permissionGranted = await requestReminderPermission();
      if (!permissionGranted) {
        Alert.alert(t('notificationsDisabled'), t('enableNotificationsTryAgain'));
        return;
      }

      await scheduleTestReminder();
      Alert.alert(t('testReminderScheduled'), t('testReminderScheduledMessage'));
    } catch (error) {
      Alert.alert(t('testReminderFailed'), getFriendlyFirebaseError(error, t('checkNotificationPermission')));
    }
  };

  const updateAvatar = (avatar: string) => setChild((current) => {
    const nextChild = { ...current, avatar };
    if (currentUserId && canUseFirebase) {
      const action: SyncAction = { id: createSyncActionId(), type: 'profile', child: nextChild };
      if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
      else void enqueueSyncAction(currentUserId, action);
    }
    return nextChild;
  });
  const updateTheme = (themeName: ThemeName) => setChild((current) => {
    const nextChild = { ...current, theme: themeName };
    if (currentUserId && canUseFirebase) {
      const action: SyncAction = { id: createSyncActionId(), type: 'profile', child: nextChild };
      if (isOnline) void performSyncAction(currentUserId, action).catch(() => enqueueSyncAction(currentUserId, action));
      else void enqueueSyncAction(currentUserId, action);
    }
    return nextChild;
  });
  const chooseCharacter = (character: string) => setChild((current) => {
    const buddy = toothBuddies.find((item) => item.id === character);
    if (!buddy || !isToothBuddyUnlocked(buddy, current.level)) return current;
    return {
      ...current,
      unlockedCharacters: current.unlockedCharacters.includes(character) ? current.unlockedCharacters : [...current.unlockedCharacters, character],
      selectedCharacter: character
    };
  });
  const unlockCharacter = (character: string) => {
    const requiredLevel = CHARACTER_LEVEL_REQUIREMENTS[character] ?? 1;
    if (child.level < requiredLevel) {
      Alert.alert(t('keepLeveling'), t('unlocksAtLevel').replace('{{name}}', character).replace('{{level}}', `${requiredLevel}`));
      return false;
    }
    setChild((current) => ({
      ...current,
      unlockedCharacters: current.unlockedCharacters.includes(character) ? current.unlockedCharacters : [...current.unlockedCharacters, character],
      selectedCharacter: character
    }));
    return true;
  };

  const demoDashboardUsers = useMemo<AdminUserSummary[]>(() => {
    const currentUserGames = Object.values(gamePlays).reduce((total, plays) => total + plays, 0);
    const currentWeeklyBrushes = child.weeklyBrushes.reduce((total, brushes) => total + brushes, 0);

    return demoAdminUsers.map((user) => {
      if (user.id !== child.id) return user;
      return {
        ...user,
        nickname: child.nickname,
        age: child.age,
        todayBrushes: brushingCountToday,
        weeklyBrushes: currentWeeklyBrushes,
        totalBrushes: child.totalBrushes,
        gamesPlayed: Math.max(user.gamesPlayed, currentUserGames),
        activitiesCompleted: user.activitiesCompleted ?? 0,
        remindersFollowed: user.remindersFollowed ?? 0,
        rewardsEarned: child.badges.length,
        engagementScore: Math.min(100, 55 + currentWeeklyBrushes * 4 + currentUserGames * 3),
        totalUsageSeconds: user.totalUsageSeconds ?? 0,
        lastActive: 'Now'
      };
    });
  }, [brushingCountToday, child, gamePlays]);

  const adminUsers = canUseFirebase && role === 'admin' ? firebaseAdminUsers : demoDashboardUsers;

  const value = useMemo<AppContextValue>(() => ({
    screen, setScreen, language, setLanguage, t, isRtl, child, username, role, isAdmin: role === 'admin', adminUsers, adminUsersStatus, isFirebaseReady: canUseFirebase, isOnline, pendingSyncCount, refreshAdminUsers, authMode, setAuthMode, signInChild, registerParent, verificationPending, verificationEmailMasked, consentPending, childSetupPending, checkParentEmailVerification, submitParentalConsent, completeChildSetup, resendVerificationEmail, cancelVerification, requestPasswordReset, signOutAccount, deleteAccountAndData, theme: themes[child.theme], reminders, setReminders, saveReminders, sendTestReminder, brushingCountToday, completeBrushing, gamePlays, recordGamePlay, awardGame, challenges, updateAvatar, updateTheme, chooseCharacter, unlockCharacter, games, leaderboard, leaderboardStatus, leaderboardParticipating, refreshLeaderboard, leaveLeaderboard, avatarOptions
  }), [screen, language, child, username, role, adminUsers, authMode, verificationPending, verificationEmailMasked, consentPending, childSetupPending, reminders, brushingCountToday, gamePlays, challenges, brushedPeriodsToday, leaderboard, leaderboardStatus, leaderboardParticipating, isOnline, pendingSyncCount]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
