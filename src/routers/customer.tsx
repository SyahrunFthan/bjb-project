import TabBar from '@/components/TabBar';
import { TabBarProvider } from '@/contexts/TabBarContext';
import DashboardScreen from '@/screens/customers/dashboard';
import HistoryScreen from '@/screens/customers/history';
import ProfileScreen from '@/screens/customers/profile';
import { CustomerRouteParamList } from '@/types/navigation';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

const CustomerRouter = () => {
  const Tab = createBottomTabNavigator<CustomerRouteParamList>();
  return (
    <TabBarProvider>
      <Tab.Navigator
        tabBar={props => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </TabBarProvider>
  );
};

export default CustomerRouter;
