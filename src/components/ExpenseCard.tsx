import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Expense} from '../types/expense';
import {formatAmount} from '../types/expense';
import {categoryColors, colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

type ExpenseCardProps = {
  expense: Expense;
};

const statusLabels: Record<Expense['status'], string> = {
  pending: 'Pending sync',
  synced: 'Synced',
  failed: 'Sync failed',
};

const statusColors: Record<Expense['status'], string> = {
  pending: colors.warning,
  synced: colors.success,
  failed: colors.error,
};

export const ExpenseCard = ({expense}: ExpenseCardProps) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.vendor} numberOfLines={1}>
        {expense.vendor || 'Unknown vendor'}
      </Text>
      <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
    </View>
    <View style={styles.meta}>
      <View
        style={[
          styles.categoryBadge,
          {backgroundColor: categoryColors[expense.category] ?? colors.textSecondary},
        ]}>
        <Text style={styles.categoryText}>{expense.category}</Text>
      </View>
      <Text style={styles.date}>{expense.date}</Text>
    </View>
    {expense.notes ? (
      <Text style={styles.notes} numberOfLines={2}>
        {expense.notes}
      </Text>
    ) : null}
    <Text style={[styles.status, {color: statusColors[expense.status]}]}>
      {statusLabels[expense.status]}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  vendor: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  amount: {
    fontSize: typography.subtitle,
    fontWeight: '700',
    color: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  categoryText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  date: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  notes: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  status: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
