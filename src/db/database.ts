import {
  open,
  type QuickSQLiteConnection,
  type QueryResult,
} from 'react-native-quick-sqlite';
import {decryptField} from '../utils/fieldEncryption';

const DB_NAME = 'autoexpense.db';

let dbInstance: QuickSQLiteConnection | null = null;

export const getDatabase = (): QuickSQLiteConnection => {
  if (!dbInstance) {
    dbInstance = open({name: DB_NAME});
  }
  return dbInstance;
};

export const executeSql = (
  sql: string,
  params: (string | number | null)[] = [],
): QueryResult => {
  const result = getDatabase().execute(sql, params) as QueryResult & {
    status?: number;
    message?: string;
  };

  if (result.status === 1) {
    throw new Error(result.message ?? 'Database operation failed');
  }

  return result;
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
    audio_uri TEXT,
    latitude REAL,
    longitude REAL,
    location_city TEXT,
    location_country TEXT,
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
  migrateDatabase(db);
};

const migrateDatabase = (db: QuickSQLiteConnection): void => {
  const columns = (db.execute('PRAGMA table_info(expenses)').rows?._array ??
    []) as {name: string}[];
  const columnNames = new Set(columns.map(column => column.name));
  if (!columnNames.has('audio_uri')) {
    db.execute('ALTER TABLE expenses ADD COLUMN audio_uri TEXT');
  }
  if (!columnNames.has('location_city')) {
    db.execute('ALTER TABLE expenses ADD COLUMN location_city TEXT');
  }
  if (!columnNames.has('location_country')) {
    db.execute('ALTER TABLE expenses ADD COLUMN location_country TEXT');
  }
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
  audio_uri: string | null;
  latitude: number | null;
  longitude: number | null;
  location_city: string | null;
  location_country: string | null;
  status: string;
  created_at: string;
};

const looksLikePath = (value: string): boolean =>
  value.startsWith('/') ||
  value.startsWith('file://') ||
  value.startsWith('content://');

const decodeStoredPath = (value: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (looksLikePath(value)) {
    return value;
  }

  const decrypted = decryptField(value);
  if (decrypted && looksLikePath(decrypted)) {
    return decrypted;
  }

  return decrypted || undefined;
};

export const mapRowToExpense = (row: ExpenseRow) => ({
  id: row.id,
  vendor: decryptField(row.vendor),
  amount: row.amount,
  date: row.date,
  category: row.category,
  notes: decryptField(row.notes),
  imageUri: decryptField(row.image_uri) || undefined,
  audioUri: decodeStoredPath(row.audio_uri),
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  locationCity: row.location_city ?? undefined,
  locationCountry: row.location_country ?? undefined,
  status: row.status as 'pending' | 'synced' | 'failed',
  createdAt: row.created_at,
});
