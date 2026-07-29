export type LanguageCode = 'en' | 'fr' | 'ar';
export type AuthMode = 'login' | 'signup';
export type UserRole = 'user' | 'admin';
export type AgeGroup = '3-5' | '6-8' | '9-12';
export type ThemeName = 'ocean' | 'sunny' | 'mint' | 'berry';

export type ChildProfile = {
  id: string;
  nickname: string;
  age: number;
  ageGroup: AgeGroup;
  avatar: string;
  theme: ThemeName;
  points: number;
  badges: string[];
  unlockedCharacters: string[];
  selectedCharacter: string;
  level: number;
  totalBrushes: number;
  weeklyBrushes: number[];
};

export type ReminderSettings = {
  morning: string;
  evening: string;
};

export type BrushingSession = {
  id: string;
  childId: string;
  completedAt: string;
  durationSeconds: number;
  period: 'morning' | 'evening';
};

export type Game = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: 'oral' | 'nutrition';
  ageGroups: AgeGroup[];
  dailyLimit: number;
  points: number;
};

export type Challenge = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  cadence: 'daily' | 'weekly';
  points: number;
  progress: number;
  target: number;
};

export type LeaderboardEntry = {
  id: string;
  nickname: string;
  avatar: string;
  points: number;
  level: number;
};

export type AdminUserSummary = {
  id: string;
  nickname: string;
  age: number;
  todayBrushes: number;
  weeklyBrushes: number;
  totalBrushes: number;
  timeSpentMinutes: number;
  gamesPlayed: number;
  rewardsEarned: number;
  engagementScore: number;
  lastActive: string;
  totalUsageSeconds: number;
  loginCount: number;
  activitiesCompleted: number;
  remindersFollowed: number;
};

export type RootScreen =
  | 'welcome'
  | 'auth'
  | 'childHome'
  | 'brushing'
  | 'games'
  | 'rewards'
  | 'challenges'
  | 'leaderboard'
  | 'personalization'
  | 'parentDashboard'
  | 'adminDashboard'
  | 'legalInformation'
  | 'settings'
  | 'language';
