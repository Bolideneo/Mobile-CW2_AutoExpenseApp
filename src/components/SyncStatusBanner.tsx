import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {isFirebaseConfigured} from '../config/firebase';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type SyncStatusBannerProps = {
  pendingCount: number;
  message?: string;
  syncing?: boolean;
  onSyncPress: () => void;
};

export const SyncStatusBanner = ({
  pendingCount,
  message,
  syncing = false,
  onSyncPress,
}: SyncStatusBannerProps) => {
  const configured = isFirebaseConfigured();
  const tint = pendingCount > 0 ? colors.warning : colors.success;

  return (
    <View style={[styles.banner, {borderColor: tint}]}>
      <View style={styles.row}>
        <View style={[styles.dot, {backgroundColor: tint}]} />
        <View style={styles.copy}>
          <Text style={styles.title}>
            {pendingCount > 0
              ? `${pendingCount} expense${pendingCount === 1 ? '' : 's'} pending sync`
              : 'All expenses synced locally'}
          </Text>
          <Text style={styles.subtitle}>
            {configured
              ? 'Cloud backup via Firebase Firestore'
              : 'Configure Firebase to enable cloud sync'}
          </Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
      <Pressable
        style={[styles.button, syncing && styles.buttonDisabled]}
        disabled={syncing || !configured}
        onPress={onSyncPress}>
        <Text style={styles.buttonText}>
          {syncing ? 'Syncing…' : 'Sync now'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: spacing.xs,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  message: {
    fontSize: typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});
