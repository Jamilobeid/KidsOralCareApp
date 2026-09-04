import type { ChildProfile, ThemeName } from '../types/app';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const THEMES = new Set<ThemeName>(['ocean', 'sunny', 'mint', 'berry']);

const fail = (message: string): never => {
  throw new Error(message);
};

export const normalizeAndValidateEmail = (value: string) => {
  const email = value.trim().toLocaleLowerCase('en-US');
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    fail('Enter a valid parent email address.');
  }
  return email;
};

export const validatePassword = (value: string) => {
  if (typeof value !== 'string' || value.length < 6 || value.length > 128) {
    fail('Use a password from 6 to 128 characters.');
  }
  return value;
};

export const normalizeAndValidateLegalName = (value: string) => {
  const name = value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120 || /[\u0000-\u001F\u007F]/.test(name)) {
    fail('Enter a valid parent name from 2 to 120 characters.');
  }
  return name;
};

export const validateChildAge = (value: number) => {
  if (!Number.isInteger(value) || value < 4 || value > 12) {
    fail('Choose an age from 4 to 12.');
  }
  return value;
};

export const validateSafeId = (value: string, label: string) => {
  if (typeof value !== 'string' || !SAFE_ID_PATTERN.test(value)) {
    fail(`The ${label} is invalid.`);
  }
  return value;
};

const finiteInteger = (value: number, minimum: number, maximum: number, label: string) => {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    fail(`The ${label} value is invalid.`);
  }
};

export const validateChildProfileForSync = (child: ChildProfile) => {
  validateChildAge(child.age);
  finiteInteger(child.points, 0, 1_000_000, 'points');
  finiteInteger(child.level, 1, 1_000, 'level');
  finiteInteger(child.totalBrushes, 0, 1_000_000, 'total brushes');
  if (!THEMES.has(child.theme)) fail('The selected theme is invalid.');
  if (!Array.isArray(child.weeklyBrushes) || child.weeklyBrushes.length !== 7) fail('Weekly brushing data is invalid.');
  child.weeklyBrushes.forEach((count) => finiteInteger(count, 0, 2, 'daily brushes'));
  if (!Array.isArray(child.badges) || child.badges.length > 100 || child.badges.some((badge) => typeof badge !== 'string' || !SAFE_ID_PATTERN.test(badge))) {
    fail('Badge data is invalid.');
  }
  if (!Array.isArray(child.unlockedCharacters) || child.unlockedCharacters.length > 20 || child.unlockedCharacters.some((item) => typeof item !== 'string' || item.length < 1 || item.length > 40)) {
    fail('Character data is invalid.');
  }
  if (typeof child.selectedCharacter !== 'string' || !child.unlockedCharacters.includes(child.selectedCharacter)) {
    fail('The selected character is invalid.');
  }
};

export const validateDailyGamePlays = (gameId: string, values: Record<string, number>) => {
  validateSafeId(gameId, 'game');
  const entries = Object.entries(values);
  if (entries.length > 25) fail('Daily game data is invalid.');
  entries.forEach(([id, count]) => {
    validateSafeId(id, 'game');
    finiteInteger(count, 0, 20, 'daily game count');
  });
};

export const validateElapsedSeconds = (value: number) => {
  finiteInteger(value, 1, 86_400, 'usage duration');
  return value;
};
