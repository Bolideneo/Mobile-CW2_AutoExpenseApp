import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {initDatabase} from './src/db/database';
import {colors} from './src/theme/colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
