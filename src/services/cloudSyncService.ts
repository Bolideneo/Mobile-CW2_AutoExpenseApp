import {doc, setDoc} from 'firebase/firestore';
import {getFirestoreDb, isFirebaseConfigured} from '../config/firebase';
import {
  getPendingExpenses,
  updateExpenseStatus,
} from '../db/expenseRepository';
import type {Expense} from '../types/expense';

export type SyncResult = {
  synced: number;
  failed: number;
  skipped: boolean;
  message?: string;
};

const expenseToCloudPayload = (expense: Expense) => ({
  vendor: expense.vendor,
  amount: expense.amount,
  date: expense.date,
  category: expense.category,
  notes: expense.notes,
  imageUri: expense.imageUri ?? null,
  audioUri: expense.audioUri ?? null,
  latitude: expense.latitude ?? null,
  longitude: expense.longitude ?? null,
  status: 'synced',
  createdAt: expense.createdAt,
  syncedAt: new Date().toISOString(),
});

export const getPendingSyncCount = (): number =>
  getPendingExpenses().length;

export const syncPendingExpenses = async (): Promise<SyncResult> => {
  if (!isFirebaseConfigured()) {
    return {
      synced: 0,
      failed: 0,
      skipped: true,
      message: 'Add your Firebase config in src/config/firebase.ts',
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

  const pending = getPendingExpenses();
  if (pending.length === 0) {
    return {synced: 0, failed: 0, skipped: false, message: 'All expenses synced'};
  }

  let synced = 0;
  let failed = 0;

  for (const expense of pending) {
    try {
      await setDoc(doc(db, 'expenses', expense.id), expenseToCloudPayload(expense));
      updateExpenseStatus(expense.id, 'synced');
      synced += 1;
    } catch {
      updateExpenseStatus(expense.id, 'failed');
      failed += 1;
    }
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
