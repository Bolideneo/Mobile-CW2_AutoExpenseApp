import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from '../screens/HomeScreen';
import {AddExpenseScreen} from '../screens/AddExpenseScreen';
import {colors} from '../theme/colors';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.white,
        headerTitleStyle: {fontWeight: '700'},
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Auto Expense'}}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{title: 'Add Expense'}}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
