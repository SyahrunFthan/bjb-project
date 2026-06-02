import AuthScreen from '@/screens/auth';
import CustomerCreateScreen from '@/screens/couriers/customers/create';
import CustomerEditScreen from '@/screens/couriers/customers/edit';
import CourierLoanCreateScreen from '@/screens/couriers/loans/create';
import CourierLoanEditScreen from '@/screens/couriers/loans/edit';
import CourierCollectionScreen from '@/screens/couriers/collection';
import CourierCollectionDetailScreen from '@/screens/couriers/collection/detail';
import SplashScreen from '@/screens/splash';
import StartScreen from '@/screens/start';
import { RouteParamList } from '@/types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CourierRouter from './courier';
import CustomerRouter from './customer';

const Routes = () => {
  const Stack = createNativeStackNavigator<RouteParamList>();

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{ statusBarStyle: 'light' }} />
      <Stack.Screen name="Start" component={StartScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Auth" component={AuthScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Customer" component={CustomerRouter} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Courier" component={CourierRouter} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CustomerCreate" component={CustomerCreateScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CustomerEdit" component={CustomerEditScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CourierLoanCreate" component={CourierLoanCreateScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CourierLoanEdit" component={CourierLoanEditScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CourierCollection" component={CourierCollectionScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CourierCollectionDetail" component={CourierCollectionDetailScreen} options={{ statusBarStyle: 'dark' }} />
    </Stack.Navigator>
  );
};

export default Routes;
