import { AgeGroup, Challenge, ChildProfile, Game, LeaderboardEntry } from '../types/app';

export const childProfile: ChildProfile = {
  id: 'demo-child-1',
  nickname: 'Sparkle',
  age: 7,
  ageGroup: '6-8',
  avatar: 'star',
  theme: 'ocean',
  points: 780,
  badges: ['morning-hero', 'seven-day-smile', 'food-detective'],
  unlockedCharacters: ['Toothy', 'Tooth Fairy', 'Super Tooth', 'Dr Smile'],
  selectedCharacter: 'Toothy',
  level: 4,
  totalBrushes: 87,
  lastBrushingAt: new Date().toISOString(),
  weeklyBrushes: [2, 2, 1, 2, 1, 0, 0]
};

export const ageTips: Record<AgeGroup, string[]> = {
  '3-5': ['Use pea-sized toothpaste with help from a grown-up.', 'Brush every side while singing a short song.'],
  '6-8': ['Brush circles on each tooth zone.', 'Spit after brushing and avoid rinsing too much.'],
  '9-12': ['Angle the brush toward the gumline.', 'Clean between teeth every day with parent-approved floss.']
};

export const games: Game[] = [
  { id: 'smile-race', titleKey: 'gameSmileRace', descriptionKey: 'gameSmileRaceDesc', category: 'oral', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 10, points: 20 },
  { id: 'clean-my-smile', titleKey: 'gameCleanMySmile', descriptionKey: 'gameCleanMySmileDesc', category: 'oral', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 10, points: 20 },
  { id: 'pick-right-one', titleKey: 'gamePickRightOne', descriptionKey: 'gamePickRightOneDesc', category: 'oral', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 10, points: 20 }
];

export const challenges: Challenge[] = [
  { id: 'daily-two-brushes', titleKey: 'dailyTwoBrushes', descriptionKey: 'dailyTwoBrushesDesc', cadence: 'daily', points: 40, progress: 0, target: 2 },
  { id: 'daily-water', titleKey: 'dailyWater', descriptionKey: 'dailyWaterDesc', cadence: 'daily', points: 15, progress: 2, target: 3 },
  { id: 'weekly-streak', titleKey: 'weeklyStreak', descriptionKey: 'weeklyStreakDesc', cadence: 'weekly', points: 120, progress: 5, target: 7 },
  { id: 'weekly-games', titleKey: 'weeklyGames', descriptionKey: 'weeklyGamesDesc', cadence: 'weekly', points: 80, progress: 4, target: 5 }
];

export const demoAdminUsers = [
  {
    id: 'demo-child-1',
    nickname: 'Sparkle',
    age: 7,
    todayBrushes: 0,
    weeklyBrushes: 8,
    totalBrushes: 87,
    timeSpentMinutes: 142,
    gamesPlayed: 12,
    rewardsEarned: 3,
    engagementScore: 82,
    totalUsageSeconds: 0,
    loginCount: 0,
    activitiesCompleted: 0,
    remindersFollowed: 0,
    lastActive: 'Today'
  },
  {
    id: 'demo-child-2',
    nickname: 'SunnySmile',
    age: 6,
    todayBrushes: 2,
    weeklyBrushes: 11,
    totalBrushes: 104,
    timeSpentMinutes: 188,
    gamesPlayed: 18,
    rewardsEarned: 5,
    engagementScore: 91,
    totalUsageSeconds: 0,
    loginCount: 0,
    activitiesCompleted: 0,
    remindersFollowed: 0,
    lastActive: 'Today'
  },
  {
    id: 'demo-child-3',
    nickname: 'BrushBoss',
    age: 9,
    todayBrushes: 1,
    weeklyBrushes: 7,
    totalBrushes: 73,
    timeSpentMinutes: 96,
    gamesPlayed: 9,
    rewardsEarned: 2,
    engagementScore: 68,
    totalUsageSeconds: 0,
    loginCount: 0,
    activitiesCompleted: 0,
    remindersFollowed: 0,
    lastActive: 'Yesterday'
  },
  {
    id: 'demo-child-4',
    nickname: 'MintyHero',
    age: 5,
    todayBrushes: 2,
    weeklyBrushes: 9,
    totalBrushes: 61,
    timeSpentMinutes: 121,
    gamesPlayed: 14,
    rewardsEarned: 4,
    engagementScore: 77,
    totalUsageSeconds: 0,
    loginCount: 0,
    activitiesCompleted: 0,
    remindersFollowed: 0,
    lastActive: 'Today'
  }
];

export const avatarOptions = ['star', 'sun', 'rocket', 'leaf', 'rainbow', 'tooth'];
export const characterOptions = ['Mina Molar', 'Captain Brush', 'Floss Fox', 'Professor Pearl'];
