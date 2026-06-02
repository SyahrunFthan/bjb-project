import { AuthProvider } from '@/contexts/AuthContext';
import { FormProvider } from '@/contexts/FormContext';
import { ModalProvider } from '@/contexts/ModalContext';
import { navigationRef } from '@/lib/navigate';
import Routes from '@/routers';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FormProvider>
          <ModalProvider>
            <NavigationContainer ref={navigationRef}>
              <Routes />
            </NavigationContainer>
          </ModalProvider>
        </FormProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
