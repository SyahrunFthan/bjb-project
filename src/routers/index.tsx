import AuthScreen from '@/screens/auth';
import BoardingScreen from '@/screens/boarding';
import TermsScreen from '@/screens/profiles/terms';
import HelpScreen from '@/screens/profiles/help';
import DeleteAccountScreen from '@/screens/profiles/delete-account';
import SecureScreen from '@/screens/profiles/secure';
import PersonalScreen from '@/screens/profiles/personal';
import CourierProfileScreen from '@/screens/profiles/courier';
import CourierCollectionScreen from '@/screens/couriers/collection';
import CourierCollectionDetailScreen from '@/screens/couriers/collection/detail';
import CustomerCreateScreen from '@/screens/couriers/customers/create';
import CustomerEditScreen from '@/screens/couriers/customers/edit';
import CourierLoanCreateScreen from '@/screens/couriers/loans/create';
import CourierLoanEditScreen from '@/screens/couriers/loans/edit';
import NotificationScreen from '@/screens/notifications';
import LoanItemScreen from '@/screens/customers/history/item';
import PaymentReceiptScreen from '@/screens/customers/history/receipt';
import SplashScreen from '@/screens/splash';
import StartScreen from '@/screens/start';
import MaintenanceScreen from '@/screens/maintenance';
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
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} options={{ statusBarStyle: 'dark' }} />
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
      <Stack.Screen name="Boarding" component={BoardingScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Help" component={HelpScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Secure" component={SecureScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Personal" component={PersonalScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="CourierProfile" component={CourierProfileScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="Notification" component={NotificationScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="LoanItem" component={LoanItemScreen} options={{ statusBarStyle: 'dark' }} />
      <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} options={{ statusBarStyle: 'dark' }} />
    </Stack.Navigator>
  );
};

export default Routes;
