import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme/colors';
import {spacing, typography} from '../theme/styles';

export const SignOutButton = () => {
  const {signOut} = useAuth();
  const [signingOut, setSigningOut] = React.useState(false);

  const handlePress = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handlePress}
      disabled={signingOut}
      hitSlop={8}>
      {signingOut ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.label}>Sign out</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: spacing.sm,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});
