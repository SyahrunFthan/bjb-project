import { FormProvider } from '@/contexts/FormContext';
import Routes from '@/routers';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
      <FormProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </FormProvider>
    </SafeAreaProvider>
  );
};

export default App;
