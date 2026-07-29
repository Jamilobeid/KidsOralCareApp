import React, { createContext, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppState } from 'react-native';
import { avatarOptions, challenges as initialChallenges, childProfile as demoChild, demoAdminUsers, games, leaderboard } from '../data/demoData';
import { themes } from '../data/themes';
import { applyTextDirection, getInitialLanguage, translate } from '../i18n/translations';
import { canUseFirebase, checkCurrentUserEmailVerification, createFirebaseChildProfile, createFirebaseParentRegistration, fetchFirebaseAdminUsers, getFirebaseParentalConsentStatus, getFirebaseUserProfile, getFirebaseUserRole, normalizeFirebaseChildCalendar, recordFirebaseBrushing, recordFirebaseGamePlay, requestFirebaseAccountDeletion, requestFirebasePasswordReset, sendCurrentUserVerificationEmail, signInFirebaseUser, signOutFirebaseUser, submitFirebaseParentalConsentRequest, syncFirebaseChildProfile, recordFirebaseUsage, recordFirebaseLogin, recordFirebaseActivityCompletion, recordFirebaseReminderFollowed } from '../services/firebaseData';
import { cancelBrushingReminders, requestReminderPermission, scheduleDailyReminder, scheduleTestReminder } from '../services/reminders';
import { auth } from '../services/firebase';
import { AdminUserSummary, AuthMode, ChildProfile, Challenge, LanguageCode, ReminderSettings, RootScreen, ThemeName, UserRole } from '../types/app';
import { appAlert as Alert } from '../utils/appAlert';
import { emptyWeeklyBrushes, getLocalDateKey, getLocalWeekKey, getMondayBasedDayIndex, normalizeWeeklyBrushes } from '../utils/calendar';
import { getFriendlyFirebaseError } from '../utils/firebaseError';

const initialLanguage = getInitialLanguage();
applyTextDirection(initialLanguage);
const REMEMBERED_CHILD_KEY = 'kidsOralCare:rememberedChild';
const CHARACTER_LEVEL_REQUIREMENTS: Record<string, number> = {
  Toothy: 1,
  'Tooth Fairy': 2,
  'Super Tooth': 2,
  'Dr Smile': 3,
  Brushy: 3,
  Minty: 4,
  Bubbles: 5,
  Sparky: 5
};
type BrushingPeriod = 'morning' | 'evening';

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
  refreshAdminUsers: () => Promise<void>;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  signInChild: (parentEmail: string, password: string, remember?: boolean) => Promise<void>;
  registerParent: (password: string, parentEmail: string) => Promise<void>;
  verificationPending: boolean;
  verificationEmailMasked: string;
  consentPending: boolean;
  childSetupPending: boolean;
  checkParentEmailVerification: () => Promise<void>;
  submitParentalConsent: (parentLegalName: string, leaderboardRequested: boolean, signature: string) => Promise<void>;
  checkParentalConsentApproval: () => Promise<void>;
  completeChildSetup: (username: string, age: number) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  cancelVerification: () => Promise<void>;
  requestPasswordReset: (parentEmail: string) => Promise<void>;
  deleteAccountAndData: (password: string, confirmation: string) => Promise<boolean>;
  theme: (typeof themes)[ThemeName];
  reminders: ReminderSettings;
  setReminders: (settings: ReminderSettings) => void;
  saveReminders: (options?: { morningEnabled?: boolean; eveningEnabled?: boolean }) => Promise<void>;
  sendTestReminder: () => Promise<void>;
  brushingCountToday: number;
  completeBrushing: () => void;
  gamePlays: Record<string, number>;
  recordGamePlay: (gameId: string) => boolean;
  awardGame: (gameId: string) => void;
  challenges: Challenge[];
  updateAvatar: (avatar: string) => void;
  updateTheme: (theme: ThemeName) => void;
  chooseCharacter: (character: string) => void;
  unlockCharacter: (character: string) => boolean;
  games: typeof games;
  leaderboard: typeof leaderboard;
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

  const usageStartedAtRef = React.useRef<number | null>(null);
  const dailyDateKeyRef = React.useRef(getLocalDateKey());
  const weekKeyRef = React.useRef(getLocalWeekKey());

  const pendingReminderRef = React.useRef<PendingBrushingReminder | null>(null);

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
  };

  React.useEffect(() => {
    const restoreRememberedChild = async () => {
      if (canUseFirebase) {
        await AsyncStorage.removeItem(REMEMBERED_CHILD_KEY);
        return;
      }
      const savedUsername = await AsyncStorage.getItem(REMEMBERED_CHILD_KEY);
      if (savedUsername) {
        applyChildUsername(savedUsername);
      }
    };

    restoreRememberedChild();
  }, []);

  const addPoints = (points: number) => {
    setChild((current) => ({ ...current, points: current.points + points, level: Math.max(current.level, Math.floor((current.points + points) / 200) + 1) }));
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
      nickname: cleanUsername,
      age: profile?.age ?? current.age,
      points: profile?.points ?? 0,
      badges: profile?.badges ?? [],
      level: profile?.level ?? 1,
      totalBrushes: profile?.totalBrushes ?? 0,
      weeklyBrushes: normalizeWeeklyBrushes(profile?.weeklyBrushesByDay),
      theme: profile?.theme ?? current.theme,
      avatar: profile?.avatar ?? current.avatar
    }));

    setBrushingCountToday(profile?.todayBrushes ?? 0);
    setBrushedPeriodsToday(profile?.brushedPeriodsToday ?? []);
    setGamePlays(profile?.dailyGamePlays ?? {});
    dailyDateKeyRef.current = profile?.dailyDateKey ?? getLocalDateKey();
    weekKeyRef.current = profile?.weekKey ?? getLocalWeekKey();
    setScreen('childHome');
  };

  const signInChild = async (parentEmail: string, password: string, remember = false) => {
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
          Alert.alert('Parent email verification required', 'Please verify the parent email before using the app.');
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
        if (nextRole === 'admin') {
          setAdminUsersStatus('Loading users from Firebase...');
          const users = await fetchFirebaseAdminUsers();
          setFirebaseAdminUsers(users);
          setAdminUsersStatus(`Loaded ${users.length} user${users.length === 1 ? '' : 's'} from Firebase.`);
        }
        return;
      } catch (error) {
        Alert.alert('Login failed', getFriendlyFirebaseError(error, 'Please check the parent email and password, then try again.'));
        return;
      }
    }

    if (remember) {
      await AsyncStorage.setItem(REMEMBERED_CHILD_KEY, cleanEmail);
    } else {
      await AsyncStorage.removeItem(REMEMBERED_CHILD_KEY);
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
          Alert.alert('Check the parent email', `We sent a Firebase verification link to ${credential.user.email}.`);
        } catch (error) {
          Alert.alert('Account created', error instanceof Error ? error.message : 'Use Resend verification email to try again.');
        }
        return;
      } catch (error) {
        Alert.alert('Account error', getFriendlyFirebaseError(error, 'Could not create the account. Please try again.'));
        return;
      }
    }
  };

  const checkParentEmailVerification = async () => {
    try {
      const verified = await checkCurrentUserEmailVerification();
      if (!verified) {
        Alert.alert('Not verified yet', 'Open the link in the parent email, then try again.');
        return;
      }
      const user = auth?.currentUser;
      if (!user) throw new Error('Please sign in again.');
      setCurrentUserId(user.uid);
      setRole('user');
      setVerificationPending(false);
      setConsentPending(true);
      Alert.alert('Email verified', 'The parent can now review and submit the consent notice.');
    } catch (error) {
      Alert.alert('Verification check failed', getFriendlyFirebaseError(error, 'Please try again.'));
    }
  };

  const submitParentalConsent = async (parentLegalName: string, leaderboardRequested: boolean, signature: string) => {
    if (parentLegalName.trim().length < 2 || signature.trim() !== 'I CONSENT') {
      Alert.alert('Consent form incomplete', 'Enter the parent legal name and type I CONSENT exactly.');
      return;
    }
    try {
      await submitFirebaseParentalConsentRequest(parentLegalName, leaderboardRequested);
      Alert.alert('Consent request submitted', 'The signed request is pending trusted review. Return here after approval.');
    } catch (error) {
      Alert.alert('Could not submit consent', getFriendlyFirebaseError(error, 'Please check the information and try again.'));
    }
  };

  const checkParentalConsentApproval = async () => {
    try {
      const consent = await getFirebaseParentalConsentStatus();
      if (consent.status !== 'granted') {
        Alert.alert('Still pending', 'The parental consent request has not been approved yet.');
        return;
      }
      setConsentPending(false);
      setChildSetupPending(true);
      Alert.alert('Consent approved', 'You can now create the child profile.');
    } catch (error) {
      Alert.alert('Could not check consent', getFriendlyFirebaseError(error, 'Please try again.'));
    }
  };

  const completeChildSetup = async (nextUsername: string, age: number) => {
    if (!nextUsername.trim() || age < 4 || age > 12) {
      Alert.alert('Child profile incomplete', 'Enter a username and an age from 4 to 12.');
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
      Alert.alert('Family account ready', 'The child profile was created after parental consent.');
    } catch (error) {
      Alert.alert('Could not create child profile', getFriendlyFirebaseError(error, 'Please try again.'));
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const email = await sendCurrentUserVerificationEmail();
      setVerificationEmailMasked(email);
      Alert.alert('Email sent', 'A new Firebase verification link was sent to the parent email.');
    } catch (error) {
      Alert.alert('Could not resend email', getFriendlyFirebaseError(error, 'Please try again later.'));
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
      Alert.alert('Check the parent email', 'Firebase sent a password-reset link if the account exists.');
    } catch {
      Alert.alert('Request received', 'Firebase sent a password-reset link if the account exists.');
    }
  };

  const deleteAccountAndData = async (password: string, confirmation: string) => {
    if (role === 'admin') {
      Alert.alert('Admin account protected', 'Administrator accounts cannot be deleted from the child account deletion flow.');
      return false;
    }
    if (!password.trim() || confirmation.trim() !== 'DELETE') {
      Alert.alert('Confirmation required', 'Enter the parent password and type DELETE exactly.');
      return false;
    }

    try {
      usageStartedAtRef.current = null;
      pendingReminderRef.current = null;
      await requestFirebaseAccountDeletion(password);
      await Promise.allSettled([
        cancelBrushingReminders(),
        Notifications.dismissAllNotificationsAsync(),
        AsyncStorage.removeItem(REMEMBERED_CHILD_KEY),
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
      setAdminUsersStatus('Not loaded yet.');
      setVerificationPending(false);
      setVerificationEmailMasked('');
      setAuthMode('login');
      setScreen('welcome');
      Alert.alert('Account deleted', 'The account and its associated active data were deleted successfully.');
      return true;
    } catch (error) {
      Alert.alert('Could not delete the account', getFriendlyFirebaseError(error, 'Check the parent password and connection, then try again.'));
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
      Alert.alert('Refresh failed', getFriendlyFirebaseError(error, 'Could not load users from Firebase. Please try again.'));
    }
  };

  const completeBrushing = () => {
    const now = new Date();
    resetCalendarStateIfNeeded(now);
    const period: BrushingPeriod = now.getHours() < 12 ? 'morning' : 'evening';

    setBrushedPeriodsToday((periods) => {
      if (periods.includes(period)) {
        Alert.alert('Already counted', `Your ${period} brush is already complete.`);
        return periods;
      }

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

      const nextPeriods = [...periods, period];
      const nextCount = Math.min(nextPeriods.length, 2);
      setBrushingCountToday(nextCount);
      setChallenges((items) => items.map((challenge) => {
        if (challenge.id === 'daily-two-brushes') return { ...challenge, progress: nextCount };
        if (challenge.id === 'weekly-streak' && periods.length === 0) return { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) };
        return challenge;
      }));
      setChild((current) => {
        const todayIndex = getMondayBasedDayIndex(now);
        const weeklyBrushes = [...current.weeklyBrushes];
        weeklyBrushes[todayIndex] = Math.min((weeklyBrushes[todayIndex] ?? 0) + 1, 2);
        const nextPoints = current.points + 20;
        const nextChild = {
          ...current,
          points: nextPoints,
          level: Math.max(current.level, Math.floor(nextPoints / 200) + 1),
          totalBrushes: current.totalBrushes + 1,
          weeklyBrushes
        };
        if (currentUserId && canUseFirebase) {
          void recordFirebaseBrushing(currentUserId, period, nextCount, weeklyBrushes).catch((error) => {
            console.warn('Could not record brushing session:', error);
            Alert.alert('Progress not synced', getFriendlyFirebaseError(error, 'Keep the application open, check the internet connection, and try again.'));
          });
        }
        return nextChild;
      });
      return nextPeriods;
    });
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
      void recordFirebaseGamePlay(currentUserId, gameId, nextGamePlays).catch((error) => {
        console.warn('Could not record game play:', error);
        Alert.alert('Progress not synced', getFriendlyFirebaseError(error, 'Keep the application open, check the internet connection, and try again.'));
      });
    }
    return true;
  };

  const awardGame = (gameId: string) => {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    setChallenges((items) => items.map((challenge) => challenge.id === 'weekly-games' ? { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) } : challenge));
    addPoints(game.points);
    
    if (currentUserId && canUseFirebase) {
      void recordFirebaseActivityCompletion(currentUserId).catch((error) => {
        console.warn('Could not record completed activity:', error);
      });
    }
};

  const saveReminders = async (options?: { morningEnabled?: boolean; eveningEnabled?: boolean }) => {
    try {
      const permissionGranted = await requestReminderPermission();
      if (!permissionGranted) {
        Alert.alert('Notifications are disabled', 'Allow notifications in your device settings, then save the reminders again.');
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
      Alert.alert('Could not save reminders', getFriendlyFirebaseError(error, 'Check notification permission and try again.'));
    }
  };

  const sendTestReminder = async () => {
    try {
      const permissionGranted = await requestReminderPermission();
      if (!permissionGranted) {
        Alert.alert('Notifications are disabled', 'Allow notifications in your device settings, then try again.');
        return;
      }

      await scheduleTestReminder();
      Alert.alert('Test reminder scheduled', 'A notification will appear in about 5 seconds. Background the app to test tapping it.');
    } catch (error) {
      Alert.alert('Could not schedule the test reminder', getFriendlyFirebaseError(error, 'Check notification permission and try again.'));
    }
  };

  const updateAvatar = (avatar: string) => setChild((current) => {
    const nextChild = { ...current, avatar };
    if (currentUserId && canUseFirebase) void syncFirebaseChildProfile(currentUserId, nextChild);
    return nextChild;
  });
  const updateTheme = (themeName: ThemeName) => setChild((current) => {
    const nextChild = { ...current, theme: themeName };
    if (currentUserId && canUseFirebase) void syncFirebaseChildProfile(currentUserId, nextChild);
    return nextChild;
  });
  const chooseCharacter = (character: string) => setChild((current) => {
    const requiredLevel = CHARACTER_LEVEL_REQUIREMENTS[character] ?? 1;
    if (current.level < requiredLevel) return current;
    return {
      ...current,
      unlockedCharacters: current.unlockedCharacters.includes(character) ? current.unlockedCharacters : [...current.unlockedCharacters, character],
      selectedCharacter: character
    };
  });
  const unlockCharacter = (character: string) => {
    const requiredLevel = CHARACTER_LEVEL_REQUIREMENTS[character] ?? 1;
    if (child.level < requiredLevel) {
      Alert.alert('Keep leveling up', `${character} unlocks at Level ${requiredLevel}.`);
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
    screen, setScreen, language, setLanguage, t, isRtl, child, username, role, isAdmin: role === 'admin', adminUsers, adminUsersStatus, isFirebaseReady: canUseFirebase, refreshAdminUsers, authMode, setAuthMode, signInChild, registerParent, verificationPending, verificationEmailMasked, consentPending, childSetupPending, checkParentEmailVerification, submitParentalConsent, checkParentalConsentApproval, completeChildSetup, resendVerificationEmail, cancelVerification, requestPasswordReset, deleteAccountAndData, theme: themes[child.theme], reminders, setReminders, saveReminders, sendTestReminder, brushingCountToday, completeBrushing, gamePlays, recordGamePlay, awardGame, challenges, updateAvatar, updateTheme, chooseCharacter, unlockCharacter, games, leaderboard, avatarOptions
  }), [screen, language, child, username, role, adminUsers, authMode, verificationPending, verificationEmailMasked, consentPending, childSetupPending, reminders, brushingCountToday, gamePlays, challenges, brushedPeriodsToday]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
