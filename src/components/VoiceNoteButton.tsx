import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import type {VoiceErrorCode} from '../services/voiceService';
import {
  startVoiceCapture,
  stopVoiceCapture,
} from '../services/voiceService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type VoiceNoteButtonProps = {
  onTranscript: (text: string) => void;
};

const errorMessages: Record<VoiceErrorCode, string> = {
  denied: 'Microphone permission denied.',
  unavailable: 'Voice input is unavailable on this device.',
  'no-speech': 'No speech detected. Try again.',
};

export const VoiceNoteButton = ({onTranscript}: VoiceNoteButtonProps) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      stopVoiceCapture().catch(() => undefined);
    },
    [],
  );

  const handleToggle = async () => {
    setError(undefined);

    if (listening) {
      await stopVoiceCapture();
      setListening(false);
      return;
    }

    setListening(true);
    try {
      await startVoiceCapture(
        text => {
          onTranscript(text);
          setListening(false);
          stopVoiceCapture().catch(() => undefined);
        },
        code => {
          setError(errorMessages[code]);
          setListening(false);
          stopVoiceCapture().catch(() => undefined);
        },
      );
    } catch {
      setError(errorMessages.unavailable);
      setListening(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={handleToggle}
        style={[styles.button, listening && styles.buttonActive]}>
        {listening ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.buttonText}>Voice note</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>
        {listening
          ? 'Listening… tap again to stop'
          : 'Speak the reason for this expense'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  error: {
    fontSize: typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
