import { dashboardCourierGet } from '@/api/dashboard';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import DashboardContent from '@/components/couriers/dashboard/DashboardContent';
import { useModal } from '@/hooks/useModal';
import { CourierDashboard } from '@/model/dashboard';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';

const DashboardScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'Courier'> }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<CourierDashboard | null>(null);
  const modal = useModal();

  const fetchDashboardData = useCallback((isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    }

    dashboardCourierGet({ setLoading, setRefreshing, modal, setDashboardData });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });
    return unsubscribe;
  }, [fetchDashboardData, navigation]);

  return (
    <AppLayout
      scrollable={true}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboardData(true)} colors={[color.primary]} />}>
      <DashboardContent dashboardData={dashboardData} loading={loading} navigation={navigation} />
    </AppLayout>
  );
};

export default DashboardScreen;
