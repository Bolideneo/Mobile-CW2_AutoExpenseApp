import type {ExpenseDraft} from '../types/expense';

export type ExpenseField = keyof ExpenseDraft;

export type ValidationErrors = Partial<Record<ExpenseField, string>>;

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const validateExpenseDraft = (
  draft: ExpenseDraft,
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!draft.vendor.trim()) {
    errors.vendor = 'Vendor name is required';
  } else if (draft.vendor.trim().length < 2) {
    errors.vendor = 'Vendor must be at least 2 characters';
  }

  if (!draft.amount.trim()) {
    errors.amount = 'Amount is required';
  } else if (!AMOUNT_PATTERN.test(draft.amount.trim())) {
    errors.amount = 'Enter a valid amount (e.g. 12.50)';
  } else if (parseFloat(draft.amount) <= 0) {
    errors.amount = 'Amount must be greater than zero';
  }

  if (!draft.date.trim()) {
    errors.date = 'Date is required';
  } else if (!DATE_PATTERN.test(draft.date)) {
    errors.date = 'Use YYYY-MM-DD format';
  }

  if (!draft.category.trim()) {
    errors.category = 'Select a category';
  }

  if (!draft.imageUri?.trim()) {
    errors.imageUri = 'Receipt photo is required';
  }

  if (draft.notes.length > 200) {
    errors.notes = 'Notes must be 200 characters or fewer';
  }

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean =>
  Object.keys(errors).length > 0;
