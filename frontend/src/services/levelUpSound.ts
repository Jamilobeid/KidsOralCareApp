import { Audio } from 'expo-av';

const levelUpSoundAsset = require('../../assets/audio/level-up.mp3');

export const playLevelUpSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(levelUpSoundAsset, { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        void sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('The level-up sound could not be played:', error);
  }
};
