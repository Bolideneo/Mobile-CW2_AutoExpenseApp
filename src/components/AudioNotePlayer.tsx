import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {playAudio, stopAudio} from '../services/audioPlaybackService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type AudioNotePlayerProps = {
  audioUri: string;
};

export const AudioNotePlayer = ({audioUri}: AudioNotePlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      stopAudio();
    },
    [],
  );

  const handlePlay = async () => {
    setError(undefined);
    setPlaying(true);
    try {
      await playAudio(audioUri);
    } catch {
      setError('Could not play this voice note.');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Voice note</Text>
      <Pressable
        onPress={handlePlay}
        disabled={playing}
        style={[styles.button, playing && styles.buttonDisabled]}>
        {playing ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.buttonText}>Play voice note</Text>
        )}
      </Pressable>
      <Text style={styles.hint}>Plays through the device speaker</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.8,
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
