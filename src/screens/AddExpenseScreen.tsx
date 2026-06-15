import React, {useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CategoryPicker} from '../components/CategoryPicker';
import {FormInput} from '../components/FormInput';
import {PrimaryButton} from '../components/PrimaryButton';
import {insertExpense} from '../db/expenseRepository';
import type {RootStackParamList} from '../navigation/types';
import {
  createEmptyDraft,
  type ExpenseCategory,
  type ExpenseDraft,
} from '../types/expense';
import {commonStyles, spacing} from '../theme/styles';
import {
  hasValidationErrors,
  validateExpenseDraft,
  type ValidationErrors,
} from '../utils/validateExpense';

type Props = NativeStackScreenProps<RootStackParamList, 'AddExpense'>;

export const AddExpenseScreen = ({navigation}: Props) => {
  const [draft, setDraft] = useState<ExpenseDraft>(createEmptyDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof ExpenseDraft>(
    key: K,
    value: ExpenseDraft[K],
  ) => {
    setDraft(prev => ({...prev, [key]: value}));
    if (errors[key]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[key];
        return next;
      });
    }
  };

  const handleSave = () => {
    const validationErrors = validateExpenseDraft(draft);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      insertExpense(draft);
      navigation.goBack();
    } catch {
      Alert.alert('Save failed', 'Could not save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled">
        <FormInput
          label="Vendor"
          placeholder="e.g. Starbucks"
          value={draft.vendor}
          onChangeText={text => updateField('vendor', text)}
          error={errors.vendor}
        />
        <FormInput
          label="Amount"
          placeholder="0.00"
          value={draft.amount}
          onChangeText={text => updateField('amount', text)}
          keyboardType="decimal-pad"
          error={errors.amount}
        />
        <FormInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={draft.date}
          onChangeText={text => updateField('date', text)}
          error={errors.date}
        />
        <CategoryPicker
          value={draft.category}
          onChange={(category: ExpenseCategory) =>
            updateField('category', category)
          }
          error={errors.category}
        />
        <FormInput
          label="Notes"
          placeholder="Reason for expense (optional)"
          value={draft.notes}
          onChangeText={text => updateField('notes', text)}
          multiline
          numberOfLines={3}
          error={errors.notes}
        />
        <PrimaryButton
          label="Save Expense"
          onPress={handleSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  form: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});
