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
  weeklyBrushes: [2, 2, 1, 2, 1, 0, 0]
};

export const ageTips: Record<AgeGroup, string[]> = {
  '3-5': ['Use pea-sized toothpaste with help from a grown-up.', 'Brush every side while singing a short song.'],
  '6-8': ['Brush circles on each tooth zone.', 'Spit after brushing and avoid rinsing too much.'],
  '9-12': ['Angle the brush toward the gumline.', 'Clean between teeth every day with parent-approved floss.']
};

export const games: Game[] = [
  { id: 'plaque-pop', titleKey: 'gamePlaquePop', descriptionKey: 'gamePlaquePopDesc', category: 'oral', ageGroups: ['3-5', '6-8'], dailyLimit: 3, points: 15 },
  { id: 'food-sorter', titleKey: 'gameFoodSorter', descriptionKey: 'gameFoodSorterDesc', category: 'nutrition', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 3, points: 20 },
  { id: 'sugar-detective', titleKey: 'gameSugarDetective', descriptionKey: 'gameSugarDetectiveDesc', category: 'nutrition', ageGroups: ['6-8', '9-12'], dailyLimit: 2, points: 25 },
  { id: 'brush-sequence', titleKey: 'gameBrushSequence', descriptionKey: 'gameBrushSequenceDesc', category: 'oral', ageGroups: ['9-12'], dailyLimit: 2, points: 25 },
  { id: 'clean-tooth', titleKey: 'gameCleanTooth', descriptionKey: 'gameCleanToothDesc', category: 'oral', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 3, points: 20 },
  { id: 'smile-quiz', titleKey: 'gameSmileQuiz', descriptionKey: 'gameSmileQuizDesc', category: 'oral', ageGroups: ['3-5', '6-8', '9-12'], dailyLimit: 3, points: 25 }
];

export const challenges: Challenge[] = [
  { id: 'daily-two-brushes', titleKey: 'dailyTwoBrushes', descriptionKey: 'dailyTwoBrushesDesc', cadence: 'daily', points: 40, progress: 1, target: 2 },
  { id: 'daily-water', titleKey: 'dailyWater', descriptionKey: 'dailyWaterDesc', cadence: 'daily', points: 15, progress: 2, target: 3 },
  { id: 'weekly-streak', titleKey: 'weeklyStreak', descriptionKey: 'weeklyStreakDesc', cadence: 'weekly', points: 120, progress: 5, target: 7 },
  { id: 'weekly-games', titleKey: 'weeklyGames', descriptionKey: 'weeklyGamesDesc', cadence: 'weekly', points: 80, progress: 4, target: 5 }
];

export const leaderboard: LeaderboardEntry[] = [
  { id: '1', nickname: 'SunnySmile', avatar: 'sun', points: 940, level: 5 },
  { id: '2', nickname: 'Sparkle', avatar: 'star', points: 780, level: 4 },
  { id: '3', nickname: 'BrushBoss', avatar: 'rocket', points: 720, level: 4 },
  { id: '4', nickname: 'MintyHero', avatar: 'leaf', points: 680, level: 3 }
];

export const avatarOptions = ['star', 'sun', 'rocket', 'leaf', 'rainbow', 'tooth'];
export const characterOptions = ['Mina Molar', 'Captain Brush', 'Floss Fox', 'Professor Pearl'];

