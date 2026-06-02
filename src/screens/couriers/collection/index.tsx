import { fetchLoans } from '@/api/loan';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import CollectionLoanList from '@/components/couriers/collections/CollectionLoanList';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import EmptyData from '@/components/ui/EmptyData';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { skeletonData } from '@/lib/utils';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, View } from 'react-native';

const CourierCollectionScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollection'> }) => {
  const modal = useModal();
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const debounceSearch = useDebounce(search);

  const fetchData = useCallback(
    (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      }
      const queries: Record<string, string> = {
        search: debounceSearch,
        status: 'approved',
      };
      fetchLoans(setLoans, setLoading, queries, modal).then(() => {
        setRefreshing(false);
      });
    },
    [debounceSearch, modal],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  const activeLoans = loans.filter(l => l.loan_status === 'active');

  return (
    <AppLayout>
      <StatusBar backgroundColor={color.primary} barStyle="light-content" />

      <Input
        leftIcon={<AppIcon name="search" size={20} color={color.neutral} />}
        placeholder="Cari nama nasabah..."
        value={search}
        onChangeText={val => setSearch(val)}
        containerStyle={styles.searchInput}
      />

      <FlatList
        data={loading ? skeletonData : activeLoans}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[color.primary]} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <CollectionLoanList item={item as Loan} key={item.id} loading={loading} navigation={navigation} />}
        ListEmptyComponent={<EmptyData />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </AppLayout>
  );
};

export default CourierCollectionScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: color.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: color.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: color.white + 'A0',
    marginTop: 2,
    marginLeft: 40,
  },
  searchContainer: {
    paddingHorizontal: 14,
    marginTop: -12,
  },
  searchInput: {
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  listContent: {
    paddingBottom: 24,
    marginTop: 16,
  },
});
