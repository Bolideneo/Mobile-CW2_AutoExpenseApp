import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  getFirebaseAuth,
  googleWebClientId,
  isGoogleSignInConfigured,
} from '../config/firebase';

export type AuthErrorCode =
  | 'not-configured'
  | 'cancelled'
  | 'play-services'
  | 'in-progress'
  | 'unknown';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export const configureGoogleSignIn = (): void => {
  if (!isGoogleSignInConfigured()) {
    return;
  }

  GoogleSignin.configure({
    webClientId: googleWebClientId,
    offlineAccess: false,
  });
};

export const signInWithGoogle = async (): Promise<User> => {
  if (!isGoogleSignInConfigured()) {
    throw new AuthError(
      'not-configured',
      'Add your Google Web Client ID in src/config/firebase.ts',
    );
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    throw new AuthError('unknown', 'Firebase Auth is not available');
  }

  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const response = await GoogleSignin.signIn();

    if (!response.data?.idToken) {
      throw new AuthError('unknown', 'Google Sign-In did not return an ID token');
    }

    const credential = GoogleAuthProvider.credential(response.data.idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    const googleError = error as {code?: string; message?: string};
    if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new AuthError('cancelled', 'Sign-in was cancelled');
    }
    if (googleError.code === statusCodes.IN_PROGRESS) {
      throw new AuthError('in-progress', 'Sign-in is already in progress');
    }
    if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new AuthError(
        'play-services',
        'Google Play Services is not available on this device',
      );
    }

    throw new AuthError(
      'unknown',
      googleError.message ?? 'Google Sign-In failed. Check SHA-1 in Firebase.',
    );
  }
};

export const signOut = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  if (auth) {
    await firebaseSignOut(auth);
  }

  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore if Google Sign-In was never used on this device.
  }
};

export const getCurrentUserId = (): string | null =>
  getFirebaseAuth()?.currentUser?.uid ?? null;
