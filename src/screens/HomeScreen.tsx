import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ExpenseCard} from '../components/ExpenseCard';
import {PrimaryButton} from '../components/PrimaryButton';
import {SyncStatusBanner} from '../components/SyncStatusBanner';
import {initDatabase} from '../db/database';
import {getAllExpenses, getTotalAmount} from '../db/expenseRepository';
import {
  getPendingSyncCount,
  syncPendingExpenses,
} from '../services/cloudSyncService';
import type {RootStackParamList} from '../navigation/types';
import type {Expense} from '../types/expense';
import {formatAmount} from '../types/expense';
import {colors} from '../theme/colors';
import {commonStyles, spacing, typography} from '../theme/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({navigation}: Props) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncMessage, setSyncMessage] = useState<string>();
  const [syncing, setSyncing] = useState(false);

  const loadExpenses = useCallback(() => {
    setExpenses(getAllExpenses());
    setTotal(getTotalAmount());
    setPendingCount(getPendingSyncCount());
  }, []);

  useEffect(() => {
    initDatabase();
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadExpenses);
    return unsubscribe;
  }, [navigation, loadExpenses]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(undefined);
    try {
      const result = await syncPendingExpenses();
      setSyncMessage(result.message);
      loadExpenses();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={commonStyles.screen}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
        <Text style={styles.summaryCount}>
          {expenses.length} record{expenses.length === 1 ? '' : 's'}
        </Text>
      </View>

      <SyncStatusBanner
        pendingCount={pendingCount}
        message={syncMessage}
        syncing={syncing}
        onSyncPress={handleSync}
      />

      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <Pressable
            onPress={() =>
              navigation.navigate('ExpenseDetail', {expenseId: item.id})
            }>
            <ExpenseCard expense={item} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyText}>
              Tap the button below to add your first expense.
            </Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <PrimaryButton
          label="Add Expense"
          onPress={() => navigation.navigate('AddExpense')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summary: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.white,
    fontSize: typography.caption,
    opacity: 0.85,
  },
  summaryAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  summaryCount: {
    color: colors.white,
    fontSize: typography.caption,
    opacity: 0.75,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
