import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import {
  MicIcon,
  PlayIcon,
  RecordDotIcon,
  StopIcon,
  VoiceCard,
  WaveBars,
} from './voice/VoiceUiParts';

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

  const footer = recording
    ? 'Recording in progress — tap stop when finished'
    : audioUri
      ? 'Recording saved — play it back before saving the expense'
      : 'Record a spoken note played through the speaker';

  return (
    <VoiceCard
      title="Audio note"
      subtitle="Record and play back a voice memo"
      accentColor={colors.accent}
      active={recording}
      icon={<RecordDotIcon size={12} />}
      footer={footer}
      error={error}>
      <View style={styles.body}>
        {audioUri && !recording ? (
          <View style={styles.savedCard}>
            <View style={styles.savedIcon}>
              <WaveBars active={playing} color={colors.accent} />
            </View>
            <View style={styles.savedText}>
              <Text style={styles.savedTitle}>Recording ready</Text>
              <Text style={styles.savedHint}>Saved to this expense</Text>
            </View>
            <View style={styles.savedActions}>
              <Pressable
                onPress={handlePlay}
                disabled={playing}
                style={({pressed}) => [
                  styles.iconAction,
                  styles.playAction,
                  pressed && styles.iconActionPressed,
                ]}>
                {playing ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <PlayIcon size={16} />
                )}
              </Pressable>
              <Pressable
                onPress={handleRemove}
                style={({pressed}) => [
                  styles.iconAction,
                  styles.removeAction,
                  pressed && styles.iconActionPressed,
                ]}>
                <Text style={styles.removeLabel}>✕</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={recording ? handleStop : handleRecord}
          style={({pressed}) => [
            styles.recordWrap,
            pressed && styles.recordWrapPressed,
          ]}>
          <View
            style={[
              styles.recordOuter,
              recording && styles.recordOuterActive,
            ]}>
            <View
              style={[
                styles.recordInner,
                recording ? styles.recordInnerActive : styles.recordInnerIdle,
              ]}>
              {recording ? (
                <StopIcon size={22} />
              ) : (
                <MicIcon size={28} color={colors.white} />
              )}
            </View>
          </View>
          <Text style={styles.recordLabel}>
            {recording ? 'Tap to stop' : 'Tap to record'}
          </Text>
          <WaveBars active={recording} color={colors.error} />
        </Pressable>
      </View>
    </VoiceCard>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: spacing.md,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: spacing.md,
  },
  savedIcon: {
    width: 40,
    alignItems: 'center',
  },
  savedText: {
    flex: 1,
  },
  savedTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  savedHint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  savedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionPressed: {
    opacity: 0.85,
  },
  playAction: {
    backgroundColor: colors.accent,
  },
  removeAction: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  recordWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  recordWrapPressed: {
    opacity: 0.92,
  },
  recordOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },
  recordOuterActive: {
    backgroundColor: '#FECACA',
  },
  recordInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInnerIdle: {
    backgroundColor: colors.error,
  },
  recordInnerActive: {
    backgroundColor: '#B91C1C',
  },
  recordLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
