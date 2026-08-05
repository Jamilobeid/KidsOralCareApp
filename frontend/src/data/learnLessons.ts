const publicEnvironment = process.env as Record<string, string | undefined>;

export const learnLessons = [
  { id: 'brushing', titleKey: 'learnBrushTeeth', uri: publicEnvironment.EXPO_PUBLIC_LEARN_BRUSHING_VIDEO_URL },
  { id: 'toothpaste', titleKey: 'learnToothpasteAmount', uri: publicEnvironment.EXPO_PUBLIC_LEARN_TOOTHPASTE_VIDEO_URL },
  { id: 'flossing', titleKey: 'learnFlossing', uri: publicEnvironment.EXPO_PUBLIC_LEARN_FLOSSING_VIDEO_URL },
  { id: 'toothbrush', titleKey: 'learnChangeToothbrush', uri: publicEnvironment.EXPO_PUBLIC_LEARN_TOOTHBRUSH_VIDEO_URL },
  { id: 'food', titleKey: 'learnFoodAndTeeth', uri: publicEnvironment.EXPO_PUBLIC_LEARN_FOOD_VIDEO_URL },
  { id: 'dentist', titleKey: 'learnDentistVisits', uri: publicEnvironment.EXPO_PUBLIC_LEARN_DENTIST_VIDEO_URL }
] as const;
