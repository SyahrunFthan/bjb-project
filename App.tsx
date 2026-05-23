import { FormProvider } from '@/contexts/FormContext';
import Routes from '@/routers';
import { navigationRef } from '@/lib/navigate';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { ModalProvider } from '@/contexts/ModalContext';

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
