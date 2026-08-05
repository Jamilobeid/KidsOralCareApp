import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile, Challenge } from '../types/app';

const PROGRESS_PREFIX = 'eSmile:offlineProgress:';
const QUEUE_PREFIX = 'eSmile:syncQueue:';

export type OfflineProgress = {
  child: ChildProfile;
  brushingCountToday: number;
  brushedPeriodsToday: Array<'morning' | 'evening'>;
  gamePlays: Record<string, number>;
  challenges: Challenge[];
  dailyDateKey: string;
  weekKey: string;
};

export type SyncAction =
  | { id: string; type: 'brushing'; period: 'morning' | 'evening'; nextCount: number; weeklyBrushes: number[]; child: ChildProfile }
  | { id: string; type: 'gamePlay'; gameId: string; dailyGamePlays: Record<string, number> }
  | { id: string; type: 'activityCompletion' }
  | { id: string; type: 'profile'; child: ChildProfile };

const progressKey = (userId: string) => `${PROGRESS_PREFIX}${userId}`;
const queueKey = (userId: string) => `${QUEUE_PREFIX}${userId}`;

export const loadOfflineProgress = async (userId: string): Promise<OfflineProgress | null> => {
  const raw = await AsyncStorage.getItem(progressKey(userId));
  return raw ? JSON.parse(raw) as OfflineProgress : null;
};

export const saveOfflineProgress = async (userId: string, progress: OfflineProgress) => {
  await AsyncStorage.setItem(progressKey(userId), JSON.stringify(progress));
};

export const loadSyncQueue = async (userId: string): Promise<SyncAction[]> => {
  const raw = await AsyncStorage.getItem(queueKey(userId));
  return raw ? JSON.parse(raw) as SyncAction[] : [];
};

export const saveSyncQueue = async (userId: string, actions: SyncAction[]) => {
  if (actions.length === 0) {
    await AsyncStorage.removeItem(queueKey(userId));
    return;
  }
  await AsyncStorage.setItem(queueKey(userId), JSON.stringify(actions));
};

export const createSyncActionId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
