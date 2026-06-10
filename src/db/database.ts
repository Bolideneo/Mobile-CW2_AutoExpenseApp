import {open, type QuickSQLiteConnection} from 'react-native-quick-sqlite';

const DB_NAME = 'autoexpense.db';

let dbInstance: QuickSQLiteConnection | null = null;

export const getDatabase = (): QuickSQLiteConnection => {
  if (!dbInstance) {
    dbInstance = open({name: DB_NAME});
  }
  return dbInstance;
};

const EXPENSES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    vendor TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT DEFAULT '',
    image_uri TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );
`;

const EXPENSES_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_expenses_date
  ON expenses (date DESC);
`;

const EXPENSES_STATUS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_expenses_status
  ON expenses (status);
`;

export const initDatabase = (): void => {
  const db = getDatabase();
  db.execute(EXPENSES_TABLE_SQL);
  db.execute(EXPENSES_INDEX_SQL);
  db.execute(EXPENSES_STATUS_INDEX_SQL);
};

export const resetDatabase = (): void => {
  const db = getDatabase();
  db.execute('DELETE FROM expenses;');
};

export type ExpenseRow = {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  image_uri: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
};

export const mapRowToExpense = (row: ExpenseRow) => ({
  id: row.id,
  vendor: row.vendor,
  amount: row.amount,
  date: row.date,
  category: row.category,
  notes: row.notes ?? '',
  imageUri: row.image_uri ?? undefined,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  status: row.status as 'pending' | 'synced' | 'failed',
  createdAt: row.created_at,
});
