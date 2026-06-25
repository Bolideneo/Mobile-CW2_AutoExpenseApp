import {Platform} from 'react-native';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

let currentSound: Sound | null = null;

const normalizePath = (uri: string): string =>
  uri.startsWith('file://') ? uri.replace('file://', '') : uri;

export const playAudio = (uri: string): Promise<void> =>
  new Promise((resolve, reject) => {
    stopAudio();

    const path = normalizePath(uri);
    const sound = new Sound(path, '', error => {
      if (error) {
        reject(error);
        return;
      }

      if (Platform.OS === 'android') {
        sound.setSpeakerphoneOn(true);
      }

      currentSound = sound;
      sound.play(success => {
        sound.release();
        if (currentSound === sound) {
          currentSound = null;
        }
        if (success) {
          resolve();
        } else {
          reject(new Error('Playback failed'));
        }
      });
    });
  });

export const stopAudio = (): void => {
  if (!currentSound) {
    return;
  }

  const sound = currentSound;
  currentSound = null;
  sound.stop(() => {
    sound.release();
  });
};

export const isAudioPlaying = (): boolean => currentSound?.isPlaying() ?? false;
