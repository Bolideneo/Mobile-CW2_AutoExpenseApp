import {initializeApp, type FirebaseApp} from 'firebase/app';
import {getFirestore, type Firestore} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyCYXiBEmGD_OUxC2M2_JWqjXf1J8VSD914',
  authDomain: 'mobilecw2-98b1b.firebaseapp.com',
  projectId: 'mobilecw2-98b1b',
  storageBucket: 'mobilecw2-98b1b.firebasestorage.app',
  messagingSenderId: '123605310755',
  appId: '1:123605310755:web:133a2ba2472eb100240096',
};

export const isFirebaseConfigured = (): boolean =>
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  !firebaseConfig.projectId.startsWith('YOUR_');

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

export const getFirestoreDb = (): Firestore | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!firestoreDb) {
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }
    firestoreDb = getFirestore(app);
  }
  return firestoreDb;
};
