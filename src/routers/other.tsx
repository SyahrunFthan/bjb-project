import React from 'react';

import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBar from '@/components/TabBar';
import { TabBarProvider } from '@/contexts/TabBarContext';
import AttendanceScreen from '@/screens/others/attendances';
import OtherDashboardScreen from '@/screens/others/dashboard';
import ProfileScreen from '@/screens/profiles';
import { OtherRouteParamList } from '@/types/navigation';

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

const Tab = createBottomTabNavigator<OtherRouteParamList>();

const OtherRouter = () => {
  return (
    <TabBarProvider>
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Dashboard" component={OtherDashboardScreen} />
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </TabBarProvider>
  );
};

export default OtherRouter;
