import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {ReceiptPickSource} from '../services/receiptImageService';
import {pickReceiptImage} from '../services/receiptImageService';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type ReceiptCaptureProps = {
  imageUri?: string;
  error?: string;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
};

export const ReceiptCapture = ({
  imageUri,
  error,
  onImageSelected,
  onImageRemoved,
}: ReceiptCaptureProps) => {
  const [loading, setLoading] = useState(false);

  const handlePick = async (source: ReceiptPickSource) => {
    setLoading(true);
    try {
      const result = await pickReceiptImage(source);
      if (result?.uri) {
        onImageSelected(result.uri);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Receipt photo *</Text>
      {imageUri ? (
        <View style={[styles.previewBlock, error ? styles.fieldError : null]}>
          <Image source={{uri: imageUri}} style={styles.preview} />
          <View style={styles.previewActions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => handlePick('camera')}>
              <Text style={styles.secondaryText}>Retake</Text>
            </Pressable>
            <Pressable style={styles.removeButton} onPress={onImageRemoved}>
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.actions, error ? styles.fieldError : null]}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Pressable
                style={styles.actionButton}
                onPress={() => handlePick('camera')}>
                <Text style={styles.actionText}>Scan receipt</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => handlePick('gallery')}>
                <Text style={styles.secondaryText}>Choose from gallery</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
      <Text style={styles.hint}>
        Scan or upload a receipt to auto-fill vendor, amount, and date.
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
    marginBottom: spacing.sm,
  },
  actions: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  actionText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  previewBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 180,
    backgroundColor: colors.background,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  removeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  removeText: {
    color: colors.error,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  fieldError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
