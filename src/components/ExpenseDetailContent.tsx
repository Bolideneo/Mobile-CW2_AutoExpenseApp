import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Expense} from '../types/expense';
import {formatAmount} from '../types/expense';
import {categoryColors, colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type DetailRowProps = {
  label: string;
  value: string;
};

export const DetailRow = ({label, value}: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

type ExpenseDetailContentProps = {
  expense: Expense;
};

export const ExpenseDetailContent = ({expense}: ExpenseDetailContentProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.vendor}>{expense.vendor}</Text>
      <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
    </View>
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            categoryColors[expense.category] ?? colors.textSecondary,
        },
      ]}>
      <Text style={styles.badgeText}>{expense.category}</Text>
    </View>
    <DetailRow label="Date" value={expense.date} />
    <DetailRow label="Status" value={expense.status} />
    {expense.notes ? <DetailRow label="Notes" value={expense.notes} /> : null}
    {expense.latitude != null && expense.longitude != null ? (
      <DetailRow
        label="Location"
        value={`${expense.latitude.toFixed(4)}, ${expense.longitude.toFixed(4)}`}
      />
    ) : null}
    <DetailRow
      label="Created"
      value={new Date(expense.createdAt).toLocaleString()}
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vendor: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.primary,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
  },
});
