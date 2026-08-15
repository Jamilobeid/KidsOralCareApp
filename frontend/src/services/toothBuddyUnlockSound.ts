import { Audio } from 'expo-av';

const toothBuddyUnlockSoundAsset = require('../../assets/audio/tooth-buddy-new.mp3');

export const playToothBuddyUnlockSound = async () => {
  try {
    const { sound } = await Audio.Sound.createAsync(toothBuddyUnlockSoundAsset, { shouldPlay: true });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.setOnPlaybackStatusUpdate(null);
        void sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('The Tooth Buddy unlock sound could not be played:', error);
  }
};
