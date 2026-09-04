import AuthScreen from '@/screens/auth';
import BoardingScreen from '@/screens/boarding';
import ActivityScreen from '@/screens/couriers/activities';
import CourierCollectionScreen from '@/screens/couriers/collection';
import CourierCollectionDetailScreen from '@/screens/couriers/collection/detail';
import CustomerCreateScreen from '@/screens/couriers/customers/create';
import CustomerEditScreen from '@/screens/couriers/customers/edit';
import CourierLoanCreateScreen from '@/screens/couriers/loans/create';
import CourierLoanEditScreen from '@/screens/couriers/loans/edit';
import LoanItemScreen from '@/screens/customers/history/item';
import PaymentReceiptScreen from '@/screens/customers/history/receipt';
import MaintenanceScreen from '@/screens/maintenance';
import NotificationScreen from '@/screens/notifications';
import CourierProfileScreen from '@/screens/profiles/courier';
import DeleteAccountScreen from '@/screens/profiles/delete-account';
import HelpScreen from '@/screens/profiles/help';
import PersonalScreen from '@/screens/profiles/personal';
import SecureScreen from '@/screens/profiles/secure';
import TermsScreen from '@/screens/profiles/terms';
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
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Customer" component={CustomerRouter} />
      <Stack.Screen name="Courier" component={CourierRouter} />
      <Stack.Screen name="CustomerCreate" component={CustomerCreateScreen} />
      <Stack.Screen name="CustomerEdit" component={CustomerEditScreen} />
      <Stack.Screen name="CourierLoanCreate" component={CourierLoanCreateScreen} />
      <Stack.Screen name="CourierLoanEdit" component={CourierLoanEditScreen} />
      <Stack.Screen name="CourierCollection" component={CourierCollectionScreen} />
      <Stack.Screen name="CourierCollectionDetail" component={CourierCollectionDetailScreen} />
      <Stack.Screen name="Boarding" component={BoardingScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="Secure" component={SecureScreen} />
      <Stack.Screen name="Personal" component={PersonalScreen} />
      <Stack.Screen name="CourierProfile" component={CourierProfileScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="LoanItem" component={LoanItemScreen} />
      <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
    </Stack.Navigator>
  );
};

export default Routes;
