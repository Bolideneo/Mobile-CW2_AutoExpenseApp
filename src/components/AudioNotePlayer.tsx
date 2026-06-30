import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {isAudioPlaying, playAudio, stopAudio} from '../services/audioPlaybackService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';
import {PlayIcon, StopIcon, WaveBars} from './voice/VoiceUiParts';

type AudioNotePlayerProps = {
  audioUri: string;
};

export const AudioNotePlayer = ({audioUri}: AudioNotePlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(
    () => () => {
      if (isAudioPlaying()) {
        stopAudio();
      }
    },
    [],
  );

  const handleToggle = async () => {
    setError(undefined);

    if (playing) {
      stopAudio();
      setPlaying(false);
      return;
    }

    setPlaying(true);
    try {
      await playAudio(audioUri);
    } catch {
      setError('Could not play this voice note. Try re-recording on Edit Expense.');
    } finally {
      setPlaying(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Voice note</Text>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <WaveBars active={playing} color={colors.accent} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>
            {playing ? 'Playing…' : 'Recorded voice note'}
          </Text>
          <Text style={styles.hint}>Plays through the device speaker</Text>
        </View>
        <Pressable
          onPress={handleToggle}
          style={({pressed}) => [
            styles.playButton,
            playing && styles.stopButton,
            pressed && styles.playButtonPressed,
          ]}>
          {playing ? (
            <StopIcon size={16} />
          ) : (
            <PlayIcon size={16} />
          )}
        </Pressable>
      </View>
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  playButtonPressed: {
    opacity: 0.88,
  },
  error: {
    fontSize: typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
