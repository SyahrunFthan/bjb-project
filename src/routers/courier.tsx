import TabBar from '@/components/TabBar';
import { TabBarProvider } from '@/contexts/TabBarContext';
import CustomerScreen from '@/screens/couriers/customers';
import DashboardScreen from '@/screens/couriers/dashboard';
import RequestScreen from '@/screens/couriers/requests';
import ProfileScreen from '@/screens/customers/profile';
import { CourierRouteParamList } from '@/types/navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

const CourierRouter = () => {
  const Tab = createBottomTabNavigator<CourierRouteParamList>();
  return (
    <TabBarProvider>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Request" component={RequestScreen} />
        <Tab.Screen name="CustomerCourier" component={CustomerScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </TabBarProvider>
  );
};

export default CourierRouter;
