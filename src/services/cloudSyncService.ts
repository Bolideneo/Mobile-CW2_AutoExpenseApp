import {doc, setDoc} from 'firebase/firestore';
import {getFirestoreDb, isFirebaseConfigured} from '../config/firebase';
import {
  getUnsyncedExpenses,
  updateExpenseStatus,
} from '../db/expenseRepository';
import {getCurrentUserId} from './authService';
import type {Expense} from '../types/expense';

export type SyncResult = {
  synced: number;
  failed: number;
  skipped: boolean;
  message?: string;
};

const SYNC_TIMEOUT_MS = 20000;

const withTimeout = <T>(promise: Promise<T>, label: string): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out. Check internet, Firestore rules, and that Firestore is enabled.`,
        ),
      );
    }, SYNC_TIMEOUT_MS);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });

const expenseToCloudPayload = (expense: Expense, userId: string) => ({
  userId,
  vendor: expense.vendor,
  amount: expense.amount,
  date: expense.date,
  category: expense.category,
  notes: expense.notes,
  imageUri: expense.imageUri ?? null,
  audioUri: expense.audioUri ?? null,
  latitude: expense.latitude ?? null,
  longitude: expense.longitude ?? null,
  locationCity: expense.locationCity ?? null,
  locationCountry: expense.locationCountry ?? null,
  status: 'synced',
  createdAt: expense.createdAt,
  syncedAt: new Date().toISOString(),
});

export const getPendingSyncCount = (): number => getUnsyncedExpenses().length;

export const syncPendingExpenses = async (): Promise<SyncResult> => {
  if (!isFirebaseConfigured()) {
    return {
      synced: 0,
      failed: 0,
      skipped: true,
      message: 'Add your Firebase config in src/config/firebase.ts',
    };
  }

  const userId = getCurrentUserId();
  if (!userId) {
    return {
      synced: 0,
      failed: 0,
      skipped: true,
      message: 'Sign in with Google to sync expenses to the cloud',
    };
  }

  const db = getFirestoreDb();
  if (!db) {
    return {
      synced: 0,
      failed: 0,
      skipped: true,
      message: 'Firebase is not available',
    };
  }

  const pending = getUnsyncedExpenses();
  if (pending.length === 0) {
    return {synced: 0, failed: 0, skipped: false, message: 'All expenses synced'};
  }

  let synced = 0;
  let failed = 0;
  let lastError: string | undefined;

  for (const expense of pending) {
    if (expense.status === 'failed') {
      updateExpenseStatus(expense.id, 'pending');
    }

    try {
      await withTimeout(
        setDoc(
          doc(db, 'users', userId, 'expenses', expense.id),
          expenseToCloudPayload(expense, userId),
        ),
        'Cloud sync',
      );
      updateExpenseStatus(expense.id, 'synced');
      synced += 1;
    } catch (error) {
      updateExpenseStatus(expense.id, 'failed');
      failed += 1;
      lastError =
        error instanceof Error ? error.message : 'Cloud sync failed';
    }
  }

  if (failed > 0 && synced === 0 && lastError) {
    return {
      synced,
      failed,
      skipped: false,
      message: lastError,
    };
  }

  return {
    synced,
    failed,
    skipped: false,
    message:
      failed > 0
        ? `${synced} synced, ${failed} failed`
        : `${synced} expense${synced === 1 ? '' : 's'} synced`,
  };
};
