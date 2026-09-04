import { PictureQuestion } from '../data/pickTheRightOneQuestions';

const DAY_MS = 24 * 60 * 60 * 1000;

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = <T,>(items: T[], seed: number) => {
  const shuffled = [...items];
  let state = seed || 1;
  const random = () => {
    state = Math.imul(state ^ (state >>> 15), 1 | state);
    state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
    return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

export const getDailyPictureQuestions = (
  questions: PictureQuestion[],
  date = new Date(),
  preferredCount?: 2 | 3
) => {
  if (questions.length === 0) return [];

  const count = Math.min(preferredCount ?? (questions.length >= 6 ? 3 : 2), questions.length);
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor(localMidnight.getTime() / DAY_MS);
  const cycleLength = Math.max(1, Math.ceil(questions.length / count));
  const cycle = Math.floor(dayNumber / cycleLength);
  const dayInCycle = ((dayNumber % cycleLength) + cycleLength) % cycleLength;
  const ordered = seededShuffle(questions, hashString(`pick-right-one-${cycle}`));
  const start = dayInCycle * count;

  return Array.from({ length: count }, (_, offset) => ordered[(start + offset) % ordered.length]);
};

