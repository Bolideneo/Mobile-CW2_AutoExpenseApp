import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {SignOutButton} from '../components/SignOutButton';
import {HomeScreen} from '../screens/HomeScreen';
import {AddExpenseScreen} from '../screens/AddExpenseScreen';
import {ExpenseDetailScreen} from '../screens/ExpenseDetailScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {colors} from '../theme/colors';
import type {RootStackParamList} from './types';

type AuthStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const screenOptions = {
  headerStyle: {backgroundColor: colors.primary},
  headerTintColor: colors.white,
  headerTitleStyle: {fontWeight: '700' as const},
  contentStyle: {flex: 1, backgroundColor: colors.background},
  navigationBarColor: colors.surface,
};

const MainNavigator = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Auto Expense',
          headerRight: () => <SignOutButton />,
          contentStyle: {flex: 1, backgroundColor: colors.primary},
        }}
      />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={({route}) => ({
        title: route.params?.expenseId ? 'Edit Expense' : 'Add Expense',
      })}
    />
    <Stack.Screen
      name="ExpenseDetail"
      component={ExpenseDetailScreen}
      options={{title: 'Expense Detail'}}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer key={user ? 'authenticated' : 'unauthenticated'}>
      <AuthStack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {user ? (
          <AuthStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <AuthStack.Screen name="Login" component={LoginScreen} />
        )}
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
