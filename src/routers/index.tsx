import AuthScreen from '@/screens/auth';
import SplashScreen from '@/screens/splash';
import StartScreen from '@/screens/start';
import { RouteParamList } from '@/types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CustomerRouter from './customer';

const Routes = () => {
  const Stack = createNativeStackNavigator<RouteParamList>();

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ statusBarStyle: 'light' }} />
      <Stack.Screen name="Start" component={StartScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Customer" component={CustomerRouter} options={{ statusBarStyle: 'dark' }} />
    </Stack.Navigator>
  );
};

export default Routes;
