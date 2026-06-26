import {initializeApp, type FirebaseApp} from 'firebase/app';
import {type Auth} from 'firebase/auth';
import {
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import {createFirebaseAuth} from './firebaseAuth';

export const firebaseConfig = {
  apiKey: 'AIzaSyCYXiBEmGD_OUxC2M2_JWqjXf1J8VSD914',
  authDomain: 'mobilecw2-98b1b.firebaseapp.com',
  projectId: 'mobilecw2-98b1b',
  storageBucket: 'mobilecw2-98b1b.firebasestorage.app',
  messagingSenderId: '123605310755',
  appId: '1:123605310755:web:133a2ba2472eb100240096',
};


export const googleWebClientId =
  '123605310755-fen5u77dr87nkope9a9or9l3fvd4d79j.apps.googleusercontent.com';

export const isFirebaseConfigured = (): boolean =>
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  !firebaseConfig.projectId.startsWith('YOUR_');

export const isGoogleSignInConfigured = (): boolean =>
  isFirebaseConfigured() && !googleWebClientId.includes('YOUR_WEB_CLIENT_ID');

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
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

export const getFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (!firebaseAuth) {
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }
    firebaseAuth = createFirebaseAuth(app);
  }
  return firebaseAuth;
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
    firestoreDb = initializeFirestore(app, {
      // Required for Firestore on React Native Android/iOS emulators.
      experimentalForceLongPolling: true,
    });
  }
  return firestoreDb;
};
