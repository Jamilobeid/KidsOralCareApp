import type { ImageSourcePropType } from 'react-native';

export type ToothBuddy = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
  requiredLevel: number;
  tone: string;
  achievementId?: string;
  unlockDescription?: string;
};

export const toothBuddies: ToothBuddy[] = [
  { id: 'Toothy', title: 'Toothy', subtitle: 'Your smile buddy', image: require('../../assets/images/rewards-buddy-toothy-custom.png'), requiredLevel: 1, tone: '#E9F9F6' },
  { id: 'Tooth Fairy', title: 'Tooth Fairy', subtitle: 'Sprinkles sparkles', image: require('../../assets/images/rewards-buddy-tooth-fairy-custom.png'), requiredLevel: 2, tone: '#FCEAF4' },
  { id: 'Super Tooth', title: 'Super Tooth', subtitle: 'Fights cavities', image: require('../../assets/images/rewards-buddy-super-tooth-custom.png'), requiredLevel: 2, tone: '#EEE9FF' },
  { id: 'Dr Smile', title: 'Dr Smile', subtitle: 'The dentist friend', image: require('../../assets/images/rewards-buddy-dr-smile-custom.png'), requiredLevel: 3, tone: '#EAF8FC' },
  { id: 'Brushy', title: 'Brushy', subtitle: 'The bristle boss', image: require('../../assets/images/rewards-buddy-brushy-custom.png'), requiredLevel: 3, tone: '#EFF5FB' },
  { id: 'Minty', title: 'Minty', subtitle: 'Fresh & cool', image: require('../../assets/images/rewards-buddy-minty-custom.png'), requiredLevel: 4, tone: '#EFF8F5' },
  { id: 'Bubbles', title: 'Bubbles', subtitle: 'Foamy fun', image: require('../../assets/images/rewards-buddy-bubbles-custom.png'), requiredLevel: 5, tone: '#EFF8FC' },
  { id: 'Sparky', title: 'Sparky', subtitle: 'Shiny sidekick', image: require('../../assets/images/rewards-buddy-sparky-custom.png'), requiredLevel: 5, tone: '#FFF6DE' },
  { id: 'Flossy', title: 'Flossy', subtitle: 'The flossing friend', image: require('../../assets/images/rewards-buddy-flossy-custom.png'), requiredLevel: 6, tone: '#EAF9FF' },
  { id: 'Captain Enamel', title: 'Captain Enamel', subtitle: 'The strong smile protector', image: require('../../assets/images/rewards-buddy-captain-enamel-custom.png'), requiredLevel: 7, tone: '#EAF2FF' },
  { id: 'Luna Smile', title: 'Luna Smile', subtitle: 'The bedtime brushing buddy', image: require('../../assets/images/rewards-buddy-luna-smile-custom.png'), requiredLevel: 8, tone: '#F2ECFF' },
  { id: 'Professor Pearl', title: 'Professor Pearl', subtitle: 'The smile scientist', image: require('../../assets/images/rewards-buddy-professor-pearl-custom.png'), requiredLevel: 9, tone: '#EEF7FF' },
  { id: 'King Sparkle', title: 'King Sparkle', subtitle: 'The legendary smile', image: require('../../assets/images/rewards-buddy-king-sparkle-custom.png'), requiredLevel: 10, tone: '#FFF6D9' },
  { id: 'Zoomy', title: 'Zoomy', subtitle: 'The Smile Race speedster', image: require('../../assets/images/rewards-buddy-zoomy.png'), requiredLevel: 1, tone: '#E7F1FF', achievementId: 'smile-race-50', unlockDescription: 'Score 50 or more in Smile Race' },
  { id: 'Floss Flash', title: 'Floss Flash', subtitle: 'The super-fast flossing hero', image: require('../../assets/images/rewards-buddy-floss-flash.png'), requiredLevel: 1, tone: '#EAFBE4', achievementId: 'clean-my-smile-90', unlockDescription: 'Complete Clean My Smile in 1 minute 30 seconds or less' }
];

export const toothBuddySubtitleKeys: Record<string, string> = {
  Toothy: 'buddyToothySubtitle', 'Tooth Fairy': 'buddyFairySubtitle', 'Super Tooth': 'buddySuperSubtitle', 'Dr Smile': 'buddyDoctorSubtitle', Brushy: 'buddyBrushySubtitle', Minty: 'buddyMintySubtitle', Bubbles: 'buddyBubblesSubtitle', Sparky: 'buddySparkySubtitle', Flossy: 'buddyFlossySubtitle', 'Captain Enamel': 'buddyCaptainSubtitle', 'Luna Smile': 'buddyLunaSubtitle', 'Professor Pearl': 'buddyProfessorSubtitle', 'King Sparkle': 'buddyKingSubtitle', Zoomy: 'buddyZoomySubtitle', 'Floss Flash': 'buddyFlossFlashSubtitle'
};

export const toothBuddyUnlockKeys: Record<string, string> = {
  Zoomy: 'buddyZoomyUnlock', 'Floss Flash': 'buddyFlossFlashUnlock'
};

export const isToothBuddyUnlocked = (buddy: ToothBuddy, level: number, unlockedCharacters: string[] = []) =>
  buddy.achievementId ? unlockedCharacters.includes(buddy.id) : level >= buddy.requiredLevel;
