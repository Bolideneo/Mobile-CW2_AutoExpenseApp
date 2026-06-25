export type ExpenseStatus = 'pending' | 'synced' | 'failed';

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  imageUri?: string;
  audioUri?: string;
  latitude?: number;
  longitude?: number;
  status: ExpenseStatus;
  createdAt: string;
}

export interface ExpenseDraft {
  vendor: string;
  amount: string;
  date: string;
  category: string;
  notes: string;
  imageUri?: string;
  audioUri?: string;
  latitude?: number;
  longitude?: number;
}

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals',
  'Office Supplies',
  'Transport',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const createEmptyDraft = (): ExpenseDraft => ({
  vendor: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: 'Other',
  notes: '',
});

export const formatAmount = (amount: number): string =>
  `$${amount.toFixed(2)}`;
