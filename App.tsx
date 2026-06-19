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
      <ModalProvider>
        <AuthProvider>
          <FormProvider>
            <NavigationContainer ref={navigationRef}>
              <Routes />
            </NavigationContainer>
          </FormProvider>
        </AuthProvider>
      </ModalProvider>
    </SafeAreaProvider>
  );
};

export default App;
