import AsyncStorage from '@react-native-async-storage/async-storage';
import type {FirebaseApp} from 'firebase/app';
import {initializeAuth, type Auth, type Persistence} from 'firebase/auth';

type ReactNativeAuthModule = {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const getRnPersistence = () => {
  const authModule = require('@firebase/auth') as ReactNativeAuthModule;
  return authModule.getReactNativePersistence(AsyncStorage);
};

export const createFirebaseAuth = (app: FirebaseApp): Auth =>
  initializeAuth(app, {
    persistence: getRnPersistence(),
  });
