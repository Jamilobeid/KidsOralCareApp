import React, { createContext, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { avatarOptions, challenges as initialChallenges, childProfile as demoChild, games, leaderboard } from '../data/demoData';
import { themes } from '../data/themes';
import { applyTextDirection, getInitialLanguage, translate } from '../i18n/translations';
import { scheduleDailyReminder } from '../services/reminders';
import { AuthMode, ChildProfile, Challenge, LanguageCode, ReminderSettings, RootScreen, ThemeName } from '../types/app';

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

type AppContextValue = {
  screen: RootScreen;
  setScreen: (screen: RootScreen) => void;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
  isRtl: boolean;
  child: ChildProfile;
  username: string;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  signInChild: (username: string, password: string, remember?: boolean) => void;
  registerChild: (username: string, password: string, age?: number) => void;
  theme: (typeof themes)[ThemeName];
  reminders: ReminderSettings;
  setReminders: (settings: ReminderSettings) => void;
  saveReminders: () => Promise<void>;
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
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [reminders, setReminders] = useState<ReminderSettings>({ morning: '07:30', evening: '19:30' });
  const [brushingCountToday, setBrushingCountToday] = useState(1);
  const [gamePlays, setGamePlays] = useState<Record<string, number>>({ 'plaque-pop': 1 });
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);

  const t = (key: string) => translate(language, key);
  const isRtl = language === 'ar';

  const setLanguage = (nextLanguage: LanguageCode) => {
    applyTextDirection(nextLanguage);
    setLanguageState(nextLanguage);
  };

  React.useEffect(() => {
    const restoreRememberedChild = async () => {
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

  const signInChild = async (nextUsername: string, password: string, remember = false) => {
    if (!nextUsername.trim() || !password.trim()) {
      Alert.alert(t('missingLogin'));
      return;
    }
    if (remember) {
      await AsyncStorage.setItem(REMEMBERED_CHILD_KEY, nextUsername.trim());
    } else {
      await AsyncStorage.removeItem(REMEMBERED_CHILD_KEY);
    }
    applyChildUsername(nextUsername);
  };

  const registerChild = (nextUsername: string, password: string, age?: number) => {
    if (!nextUsername.trim() || password.trim().length < 4) {
      Alert.alert(t('passwordHint'));
      return;
    }
    applyChildUsername(nextUsername, age);
    Alert.alert(t('accountReady'), nextUsername.trim());
  };

  const completeBrushing = () => {
    setBrushingCountToday((value) => {
      const nextValue = Math.min(value + 1, 2);
      setChallenges((items) => items.map((challenge) => {
        if (challenge.id === 'daily-two-brushes') return { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) };
        if (challenge.id === 'weekly-streak' && value === 0) return { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) };
        return challenge;
      }));
      return nextValue;
    });
    setChild((current) => {
      const todayIndex = (new Date().getDay() + 6) % 7;
      const weeklyBrushes = [...current.weeklyBrushes];
      weeklyBrushes[todayIndex] = Math.min((weeklyBrushes[todayIndex] ?? 0) + 1, 2);
      return { ...current, totalBrushes: current.totalBrushes + 1, weeklyBrushes };
    });
    addPoints(20);
  };

  const recordGamePlay = (gameId: string) => {
    const game = games.find((item) => item.id === gameId);
    if (!game) return false;
    const used = gamePlays[gameId] ?? 0;
    if (used >= game.dailyLimit) {
      Alert.alert(t('limitReached'));
      return false;
    }
    setGamePlays((current) => ({ ...current, [gameId]: used + 1 }));
    return true;
  };

  const awardGame = (gameId: string) => {
    const game = games.find((item) => item.id === gameId);
    if (!game) return;
    setChallenges((items) => items.map((challenge) => challenge.id === 'weekly-games' ? { ...challenge, progress: Math.min(challenge.progress + 1, challenge.target) } : challenge));
    addPoints(game.points);
  };

  const saveReminders = async () => {
    await scheduleDailyReminder(t('morningReminder'), reminders.morning);
    await scheduleDailyReminder(t('eveningReminder'), reminders.evening);
    Alert.alert(t('reminderSaved'));
  };

  const updateAvatar = (avatar: string) => setChild((current) => ({ ...current, avatar }));
  const updateTheme = (themeName: ThemeName) => setChild((current) => ({ ...current, theme: themeName }));
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

  const value = useMemo<AppContextValue>(() => ({
    screen, setScreen, language, setLanguage, t, isRtl, child, username, authMode, setAuthMode, signInChild, registerChild, theme: themes[child.theme], reminders, setReminders, saveReminders, brushingCountToday, completeBrushing, gamePlays, recordGamePlay, awardGame, challenges, updateAvatar, updateTheme, chooseCharacter, unlockCharacter, games, leaderboard, avatarOptions
  }), [screen, language, child, authMode, reminders, brushingCountToday, gamePlays, challenges]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
};
