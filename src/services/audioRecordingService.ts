import {PermissionsAndroid, Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const MIC_MESSAGE =
  'Auto Expense uses the microphone to record voice notes for expenses.';

export type AudioRecordErrorCode = 'denied' | 'unavailable';

export const requestAudioRecordPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );
  if (granted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone permission',
      message: MIC_MESSAGE,
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

let recording = false;

export const startRecording = async (): Promise<void> => {
  const permitted = await requestAudioRecordPermission();
  if (!permitted) {
    throw new Error('denied');
  }

  try {
    await AudioRecorderPlayer.startRecorder();
    recording = true;
  } catch {
    throw new Error('unavailable');
  }
};

export const stopRecording = async (): Promise<string> => {
  if (!recording) {
    throw new Error('unavailable');
  }

  try {
    const path = await AudioRecorderPlayer.stopRecorder();
    AudioRecorderPlayer.removeRecordBackListener();
    recording = false;
    return path;
  } catch {
    recording = false;
    throw new Error('unavailable');
  }
};

export const cancelRecording = async (): Promise<void> => {
  if (!recording) {
    return;
  }

  try {
    await AudioRecorderPlayer.stopRecorder();
  } finally {
    AudioRecorderPlayer.removeRecordBackListener();
    recording = false;
  }
};

export const isRecording = (): boolean => recording;

export const mapRecordError = (error: unknown): AudioRecordErrorCode => {
  const message = error instanceof Error ? error.message : 'unavailable';
  return message === 'denied' ? 'denied' : 'unavailable';
};
