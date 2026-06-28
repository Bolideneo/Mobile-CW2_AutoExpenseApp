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
  locationCity?: string;
  locationCountry?: string;
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
  locationCity?: string;
  locationCountry?: string;
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

export const expenseToDraft = (expense: Expense): ExpenseDraft => ({
  vendor: expense.vendor,
  amount: expense.amount.toFixed(2),
  date: expense.date,
  category: expense.category,
  notes: expense.notes,
  imageUri: expense.imageUri,
  audioUri: expense.audioUri,
  latitude: expense.latitude,
  longitude: expense.longitude,
  locationCity: expense.locationCity,
  locationCountry: expense.locationCountry,
});

export const formatAmount = (amount: number): string =>
  `$${amount.toFixed(2)}`;
