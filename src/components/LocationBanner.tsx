import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {LocationErrorCode} from '../services/locationService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

export type LocationBannerStatus =
  | 'loading'
  | 'success'
  | 'denied'
  | 'error';

type LocationBannerProps = {
  status: LocationBannerStatus;
  coordinates?: string;
  errorCode?: LocationErrorCode;
  onRetry?: () => void;
};

const statusCopy: Record<LocationBannerStatus, string> = {
  loading: 'Capturing location...',
  success: 'Location tagged',
  denied: 'Location permission denied',
  error: 'Could not capture location',
};

const errorHints: Record<LocationErrorCode, string> = {
  denied: 'Enable location in settings to tag this expense.',
  unavailable: 'GPS signal unavailable. You can still save without location.',
  timeout:
    'Location timed out. Turn on GPS, allow Precise location, then tap Retry (try near a window or outdoors).',
};

export const LocationBanner = ({
  status,
  coordinates,
  errorCode,
  onRetry,
}: LocationBannerProps) => {
  const isSuccess = status === 'success';
  const isLoading = status === 'loading';
  const tint = isSuccess
    ? colors.success
    : status === 'loading'
      ? colors.primary
      : colors.warning;

  return (
    <View style={[styles.banner, {borderColor: tint}]}>
      <View style={styles.row}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={[styles.dot, {backgroundColor: tint}]} />
        )}
        <Text style={styles.title}>{statusCopy[status]}</Text>
      </View>
      {coordinates ? (
        <Text style={styles.coordinates}>{coordinates}</Text>
      ) : null}
      {status === 'error' && errorCode ? (
        <Text style={styles.hint}>{errorHints[errorCode]}</Text>
      ) : null}
      {status === 'denied' ? (
        <Text style={styles.hint}>{errorHints.denied}</Text>
      ) : null}
      {(status === 'denied' || status === 'error') && onRetry ? (
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry location capture</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  coordinates: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginLeft: spacing.md + 10,
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: spacing.md + 10,
  },
  retryButton: {
    marginTop: spacing.sm,
    marginLeft: spacing.md + 10,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: typography.caption,
    color: colors.primaryLight,
    fontWeight: '600',
  },
});
