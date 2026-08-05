export const MAX_LEVEL = 10;
export const STARS_PER_LEVEL = 200;

export const getLevelForPoints = (points: number) => Math.min(
  Math.floor(Math.max(0, points) / STARS_PER_LEVEL) + 1,
  MAX_LEVEL
);

export const getLevelProgress = (points: number) => {
  const safePoints = Math.max(0, points);
  const level = getLevelForPoints(safePoints);
  const isMaxLevel = level === MAX_LEVEL;
  const levelStart = (level - 1) * STARS_PER_LEVEL;
  const nextLevelAt = level * STARS_PER_LEVEL;

  return {
    level,
    isMaxLevel,
    starsToNextLevel: isMaxLevel ? 0 : Math.max(nextLevelAt - safePoints, 0),
    progress: isMaxLevel ? 1 : Math.min((safePoints - levelStart) / STARS_PER_LEVEL, 1)
  };
};
