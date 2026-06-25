import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  cancelRecording,
  mapRecordError,
  startRecording,
  stopRecording,
  type AudioRecordErrorCode,
} from '../services/audioRecordingService';
import {playAudio, stopAudio} from '../services/audioPlaybackService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type AudioNoteSectionProps = {
  audioUri?: string;
  onAudioChange: (uri: string | undefined) => void;
};

const errorMessages: Record<AudioRecordErrorCode, string> = {
  denied: 'Microphone permission denied.',
  unavailable: 'Could not record audio on this device.',
};

export const AudioNoteSection = ({
  audioUri,
  onAudioChange,
}: AudioNoteSectionProps) => {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      cancelRecording().catch(() => undefined);
      stopAudio();
    },
    [],
  );

  const handleRecord = async () => {
    setError(undefined);
    try {
      await startRecording();
      setRecording(true);
    } catch (err) {
      setError(errorMessages[mapRecordError(err)]);
    }
  };

  const handleStop = async () => {
    setError(undefined);
    try {
      const path = await stopRecording();
      setRecording(false);
      onAudioChange(path);
    } catch (err) {
      setRecording(false);
      setError(errorMessages[mapRecordError(err)]);
    }
  };

  const handlePlay = async () => {
    if (!audioUri) {
      return;
    }

    setError(undefined);
    setPlaying(true);
    try {
      await playAudio(audioUri);
    } catch {
      setError('Could not play this recording.');
    } finally {
      setPlaying(false);
    }
  };

  const handleRemove = () => {
    stopAudio();
    onAudioChange(undefined);
    setError(undefined);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Voice recording</Text>
      <View style={styles.actions}>
        {recording ? (
          <Pressable onPress={handleStop} style={[styles.button, styles.stopButton]}>
            <Text style={styles.buttonText}>Stop recording</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleRecord} style={styles.button}>
            <Text style={styles.buttonText}>Record voice</Text>
          </Pressable>
        )}
        {audioUri && !recording ? (
          <>
            <Pressable
              onPress={handlePlay}
              disabled={playing}
              style={[styles.button, styles.playButton]}>
              {playing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Play</Text>
              )}
            </Pressable>
            <Pressable onPress={handleRemove} style={[styles.button, styles.removeButton]}>
              <Text style={styles.buttonText}>Remove</Text>
            </Pressable>
          </>
        ) : null}
      </View>
      <Text style={styles.hint}>
        {recording
          ? 'Recording… tap Stop when finished'
          : audioUri
            ? 'Voice note saved — play it back before saving the expense'
            : 'Record a spoken note (played through the speaker)'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  playButton: {
    backgroundColor: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.textSecondary,
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
