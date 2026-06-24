import Voice, {
  type SpeechErrorEvent,
  type SpeechResultsEvent,
} from '@react-native-voice/voice';
import {PermissionsAndroid, Platform} from 'react-native';

const MIC_MESSAGE =
  'Auto Expense uses the microphone for voice-to-text expense notes.';

export type VoiceErrorCode = 'denied' | 'unavailable' | 'no-speech';

export const requestMicrophonePermission = async (): Promise<boolean> => {
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

const mapVoiceError = (error: SpeechErrorEvent['error']): VoiceErrorCode => {
  if (error?.code === '7' || error?.message?.includes('No match')) {
    return 'no-speech';
  }
  if (error?.code === '6' || error?.message?.includes('permission')) {
    return 'denied';
  }
  return 'unavailable';
};

export const startVoiceCapture = async (
  onResult: (text: string) => void,
  onError: (code: VoiceErrorCode) => void,
): Promise<void> => {
  const permitted = await requestMicrophonePermission();
  if (!permitted) {
    onError('denied');
    return;
  }

  Voice.removeAllListeners();
  Voice.onSpeechResults = (event: SpeechResultsEvent) => {
    const transcript = event.value?.[0]?.trim();
    if (transcript) {
      onResult(transcript);
    }
  };
  Voice.onSpeechError = (event: SpeechErrorEvent) => {
    onError(mapVoiceError(event.error));
  };

  await Voice.start('en-US');
};

export const stopVoiceCapture = async (): Promise<void> => {
  try {
    await Voice.stop();
  } finally {
    Voice.removeAllListeners();
    Voice.destroy().catch(() => undefined);
  }
};
