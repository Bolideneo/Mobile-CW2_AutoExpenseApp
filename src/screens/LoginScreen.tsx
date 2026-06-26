import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {AuthError} from '../services/authService';
import {
  googleWebClientId,
  isFirebaseConfigured,
  isGoogleSignInConfigured,
} from '../config/firebase';
import {colors} from '../theme/colors';
import {commonStyles, spacing, typography} from '../theme/styles';

export const LoginScreen = () => {
  const {signInWithGoogle} = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error instanceof AuthError && error.code === 'cancelled') {
        return;
      }

      const message =
        error instanceof AuthError
          ? error.message
          : 'Could not sign in with Google. Please try again.';
      Alert.alert('Sign-in failed', message);
    } finally {
      setSigningIn(false);
    }
  };

  const configured = isFirebaseConfigured();
  const googleReady = isGoogleSignInConfigured();

  return (
    <View style={[commonStyles.screen, styles.container]}>
      <View style={styles.hero}>
        <Text style={styles.title}>Auto Expense</Text>
        <Text style={styles.subtitle}>
          Sign in with your Google account to access expense tracking and secure
          cloud sync (OAuth 2.0).
        </Text>
      </View>

      {!configured ? (
        <Text style={styles.notice}>
          Add your Firebase config in src/config/firebase.ts before signing in.
        </Text>
      ) : null}

      {configured && !googleReady ? (
        <Text style={styles.notice}>
          Enable Google Sign-In in Firebase Console, then set googleWebClientId
          in src/config/firebase.ts. Current value: {googleWebClientId}
        </Text>
      ) : null}

      <Pressable
        style={({pressed}) => [
          styles.googleButton,
          pressed && styles.googleButtonPressed,
          (signingIn || !googleReady) && styles.googleButtonDisabled,
        ]}
        disabled={signingIn || !googleReady}
        onPress={handleSignIn}>
        {signingIn ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  notice: {
    fontSize: typography.caption,
    color: colors.warning,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  googleButtonPressed: {
    backgroundColor: colors.background,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});
