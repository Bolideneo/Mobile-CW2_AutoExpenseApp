import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const PrimaryButton = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
}: PrimaryButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled || loading}
    style={({pressed}) => [
      styles.button,
      pressed && styles.pressed,
      (disabled || loading) && styles.disabled,
      style,
    ]}>
    {loading ? (
      <ActivityIndicator color={colors.white} />
    ) : (
      <Text style={styles.label}>{label}</Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pressed: {
    backgroundColor: colors.accentDark,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
