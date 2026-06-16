import React, {useEffect, useMemo} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ExpenseDetailContent} from '../components/ExpenseDetailContent';
import {PrimaryButton} from '../components/PrimaryButton';
import {deleteExpense, getExpenseById} from '../db/expenseRepository';
import type {RootStackParamList} from '../navigation/types';
import {commonStyles, spacing} from '../theme/styles';
import {colors} from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ExpenseDetail'>;

export const ExpenseDetailScreen = ({navigation, route}: Props) => {
  const expense = useMemo(
    () => getExpenseById(route.params.expenseId),
    [route.params.expenseId],
  );

  useEffect(() => {
    if (!expense) {
      navigation.goBack();
    }
  }, [expense, navigation]);

  if (!expense) {
    return null;
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete expense',
      `Remove ${expense.vendor} (${expense.amount.toFixed(2)})?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(expense.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <View style={commonStyles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ExpenseDetailContent expense={expense} />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Delete Expense" onPress={handleDelete} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
