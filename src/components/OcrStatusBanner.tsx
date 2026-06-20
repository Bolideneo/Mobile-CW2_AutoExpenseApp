import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

export type OcrBannerStatus = 'idle' | 'loading' | 'success' | 'error';

type OcrStatusBannerProps = {
  status: OcrBannerStatus;
  summary?: string;
};

const statusCopy: Record<OcrBannerStatus, string> = {
  idle: 'Scan a receipt to auto-fill details',
  loading: 'Extracting receipt data with OCR...',
  success: 'Receipt data extracted',
  error: 'OCR failed — enter details manually',
};

export const OcrStatusBanner = ({status, summary}: OcrStatusBannerProps) => {
  if (status === 'idle') {
    return null;
  }

  const tint =
    status === 'success'
      ? colors.success
      : status === 'loading'
        ? colors.primary
        : colors.warning;

  return (
    <View style={[styles.banner, {borderColor: tint}]}>
      <View style={styles.row}>
        {status === 'loading' ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={[styles.dot, {backgroundColor: tint}]} />
        )}
        <Text style={styles.title}>{statusCopy[status]}</Text>
      </View>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
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
  summary: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginLeft: spacing.md + 10,
  },
});
