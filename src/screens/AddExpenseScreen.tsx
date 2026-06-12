import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {colors} from '../theme/colors';
import {commonStyles, spacing, typography} from '../theme/styles';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen = (_props: Props) => (
  <View style={[commonStyles.screen, styles.container]}>
    <Text style={styles.title}>Add Expense</Text>
    <Text style={styles.subtitle}>
      Expense form with camera, GPS, and voice input coming next.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
