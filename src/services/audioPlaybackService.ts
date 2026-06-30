import Sound from 'react-native-nitro-sound';
import {Platform} from 'react-native';

let playing = false;
let playbackResolve: (() => void) | null = null;
let playbackReject: ((error: Error) => void) | null = null;

export const normalizeAudioUri = (uri: string): string => {
  const trimmed = uri.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('http')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return Platform.OS === 'android' ? trimmed : `file://${trimmed}`;
  }

  return trimmed;
};

const clearPlaybackListeners = (): void => {
  Sound.removePlaybackEndListener();
  Sound.removePlayBackListener();
};

const finishPlayback = (): void => {
  playing = false;
  clearPlaybackListeners();
  playbackResolve?.();
  playbackResolve = null;
  playbackReject = null;
};

const failPlayback = (error: Error): void => {
  playing = false;
  clearPlaybackListeners();
  playbackReject?.(error);
  playbackResolve = null;
  playbackReject = null;
};

const resetPlayer = async (): Promise<void> => {
  clearPlaybackListeners();
  playing = false;
  playbackResolve = null;
  playbackReject = null;

  try {
    await Sound.stopPlayer();
  } catch {
    // Player may already be idle.
  }
};

export const playAudio = async (uri: string): Promise<void> => {
  const normalizedUri = normalizeAudioUri(uri);
  if (!normalizedUri) {
    throw new Error('Audio file path is missing.');
  }

  await resetPlayer();

  return new Promise((resolve, reject) => {
    playbackResolve = resolve;
    playbackReject = reject;

    Sound.startPlayer(normalizedUri)
      .then(() => {
        playing = true;
        Sound.addPlaybackEndListener(() => {
          finishPlayback();
        });
      })
      .catch(error => {
        failPlayback(
          error instanceof Error
            ? error
            : new Error('Could not start audio playback.'),
        );
      });
  });
};

export const stopAudio = (): void => {
  playing = false;
  clearPlaybackListeners();
  playbackResolve = null;
  playbackReject = null;
  Sound.stopPlayer().catch(() => undefined);
};

export const isAudioPlaying = (): boolean => playing;
