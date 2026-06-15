import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
} from '../types/expense';
import {categoryColors, colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type CategoryPickerProps = {
  value: string;
  onChange: (category: ExpenseCategory) => void;
  error?: string;
};

export const CategoryPicker = ({
  value,
  onChange,
  error,
}: CategoryPickerProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Category</Text>
    <View style={styles.row}>
      {EXPENSE_CATEGORIES.map(category => {
        const selected = value === category;
        const tint = categoryColors[category] ?? colors.textSecondary;
        return (
          <Pressable
            key={category}
            onPress={() => onChange(category)}
            style={[
              styles.chip,
              selected && {backgroundColor: tint, borderColor: tint},
            ]}>
            <Text
              style={[styles.chipText, selected && styles.chipTextSelected]}>
              {category}
            </Text>
          </Pressable>
        );
      })}
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: typography.caption,
    color: colors.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  error: {
    fontSize: typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
