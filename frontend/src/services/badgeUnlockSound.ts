import { Audio } from 'expo-av';

const badgeUnlockSoundAsset = require('../../assets/audio/badge-new.mp3');

export const playBadgeUnlockSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(badgeUnlockSoundAsset, { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        void sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('The badge-unlock sound could not be played:', error);
  }
};
