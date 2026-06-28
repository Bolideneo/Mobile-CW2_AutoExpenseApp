import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

export type OcrBannerStatus = 'idle' | 'loading' | 'success' | 'error';

type OcrStatusBannerProps = {
  status: OcrBannerStatus;
  summary?: string;
  aiEnabled?: boolean;
  usedAi?: boolean;
  aiMessage?: string;
  aiRawResponse?: string;
};

const statusCopy = (
  aiEnabled: boolean,
  usedAi: boolean,
): Record<OcrBannerStatus, string> => ({
  idle: 'Scan a receipt to auto-fill details',
  loading: aiEnabled
    ? 'Reading receipt with OCR + AI...'
    : 'Extracting receipt data with OCR...',
  success: usedAi
    ? 'Receipt analyzed with AI'
    : aiEnabled
      ? 'Receipt extracted (local OCR fallback)'
      : 'Receipt data extracted',
  error: 'OCR failed — enter details manually',
});

export const OcrStatusBanner = ({
  status,
  summary,
  aiEnabled = false,
  usedAi = false,
  aiMessage,
  aiRawResponse,
}: OcrStatusBannerProps) => {
  if (status === 'idle') {
    return null;
  }

  const tint =
    status === 'success'
      ? usedAi
        ? colors.success
        : colors.warning
      : status === 'loading'
        ? colors.primary
        : colors.warning;

  const labels = statusCopy(aiEnabled, usedAi);

  return (
    <View style={[styles.banner, {borderColor: tint}]}>
      <View style={styles.row}>
        {status === 'loading' ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <View style={[styles.dot, {backgroundColor: tint}]} />
        )}
        <Text style={styles.title}>{labels[status]}</Text>
      </View>
      {aiMessage ? <Text style={styles.aiMessage}>{aiMessage}</Text> : null}
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {aiRawResponse ? (
        <View style={styles.aiResponseBox}>
          <Text style={styles.aiResponseLabel}>AI response</Text>
          <Text style={styles.aiResponseText}>{aiRawResponse}</Text>
        </View>
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
  aiMessage: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginLeft: spacing.md + 10,
  },
  summary: {
    fontSize: typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    marginLeft: spacing.md + 10,
    fontWeight: '600',
  },
  aiResponseBox: {
    marginTop: spacing.sm,
    marginLeft: spacing.md + 10,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiResponseLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  aiResponseText: {
    fontSize: typography.caption,
    color: colors.text,
    fontFamily: 'monospace',
  },
});
