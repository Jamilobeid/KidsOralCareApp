export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalWeekKey = (date = new Date()) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - daysSinceMonday);
  return getLocalDateKey(monday);
};

export const getMondayBasedDayIndex = (date = new Date()) => (date.getDay() + 6) % 7;

export const emptyWeeklyBrushes = () => [0, 0, 0, 0, 0, 0, 0];

export const normalizeWeeklyBrushes = (value: unknown) => {
  if (!Array.isArray(value)) return emptyWeeklyBrushes();
  return emptyWeeklyBrushes().map((_, index) => {
    const count = Number(value[index] ?? 0);
    return Number.isFinite(count) ? Math.max(0, Math.min(2, Math.floor(count))) : 0;
  });
};
