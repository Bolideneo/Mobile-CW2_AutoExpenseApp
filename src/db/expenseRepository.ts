import type {Expense, ExpenseDraft, ExpenseStatus} from '../types/expense';
import {getDatabase, mapRowToExpense, type ExpenseRow} from './database';

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const fetchRows = (sql: string, params: (string | number)[] = []): ExpenseRow[] => {
  const result = getDatabase().execute(sql, params);
  return (result.rows?._array ?? []) as ExpenseRow[];
};

export const getAllExpenses = (): Expense[] =>
  fetchRows('SELECT * FROM expenses ORDER BY date DESC, created_at DESC').map(
    mapRowToExpense,
  );

export const getExpenseById = (id: string): Expense | null => {
  const rows = fetchRows('SELECT * FROM expenses WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0 ? mapRowToExpense(rows[0]) : null;
};

export const getPendingExpenses = (): Expense[] =>
  fetchRows(
    "SELECT * FROM expenses WHERE status = 'pending' ORDER BY created_at ASC",
  ).map(mapRowToExpense);

export const insertExpense = (draft: ExpenseDraft): Expense => {
  const expense: Expense = {
    id: generateId(),
    vendor: draft.vendor.trim(),
    amount: parseFloat(draft.amount) || 0,
    date: draft.date,
    category: draft.category,
    notes: draft.notes.trim(),
    imageUri: draft.imageUri,
    latitude: draft.latitude,
    longitude: draft.longitude,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  getDatabase().execute(
    `INSERT INTO expenses
      (id, vendor, amount, date, category, notes, image_uri, latitude, longitude, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.vendor,
      expense.amount,
      expense.date,
      expense.category,
      expense.notes,
      expense.imageUri ?? null,
      expense.latitude ?? null,
      expense.longitude ?? null,
      expense.status,
      expense.createdAt,
    ],
  );

  return expense;
};

export const updateExpenseStatus = (
  id: string,
  status: ExpenseStatus,
): void => {
  getDatabase().execute('UPDATE expenses SET status = ? WHERE id = ?', [
    status,
    id,
  ]);
};

export const deleteExpense = (id: string): void => {
  getDatabase().execute('DELETE FROM expenses WHERE id = ?', [id]);
};

export const getTotalAmount = (): number => {
  const result = getDatabase().execute(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses',
  );
  const row = result.rows?._array?.[0] as {total: number} | undefined;
  return row ? Number(row.total) : 0;
};
