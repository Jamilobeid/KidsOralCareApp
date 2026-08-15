import { Audio } from 'expo-av';

const backgroundMusicAsset = require('../../assets/audio/background-music.mp3');

let backgroundMusic: Audio.Sound | null = null;
let operation = Promise.resolve();

const updatePlayback = async (enabled: boolean) => {
  if (!enabled) {
    if (backgroundMusic) await backgroundMusic.pauseAsync();
    return;
  }

  if (!backgroundMusic) {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      staysActiveInBackground: false
    });
    const { sound } = await Audio.Sound.createAsync(
      backgroundMusicAsset,
      { isLooping: true, shouldPlay: true, volume: 0.25 }
    );
    backgroundMusic = sound;
    return;
  }

  await backgroundMusic.playAsync();
};

export const setBackgroundMusicPlayback = (enabled: boolean) => {
  operation = operation
    .then(() => updatePlayback(enabled))
    .catch((error) => console.warn('Background music could not be updated:', error));
  return operation;
};
