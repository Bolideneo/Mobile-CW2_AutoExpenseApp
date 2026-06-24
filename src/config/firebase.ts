import {initializeApp, type FirebaseApp} from 'firebase/app';
import {getFirestore, type Firestore} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
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
