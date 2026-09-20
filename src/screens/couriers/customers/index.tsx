import { customerFetched } from '@/api/customer';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import CustomerList from '@/components/couriers/customers/CustomerList';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import EmptyData from '@/components/ui/EmptyData';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { skeletonData } from '@/lib/utils';
import { Customer } from '@/model/customer';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Semua Status' },
  { key: 'priority', label: 'Prioritas' },
  { key: 'normal', label: 'Biasa' },
  { key: 'blocked', label: 'Blokir' },
  { key: 'stagnant', label: 'Macet' },
];

const DELEGATION_OPTIONS = [
  { key: 'all', label: 'Semua' },
  { key: 'mine', label: 'Nasabah Saya' },
  { key: 'delegated', label: 'Titipan Cuti' },
];

const CustomerScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'Customer'> }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [delegationFilter, setDelegationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const debounceSearch = useDebounce(search);
  const modal = useModal();

  const fetchData = useCallback(
    (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      }

      const queries: Record<string, string> = {
        search: debounceSearch,
        status: activeFilter,
        delegation_type: delegationFilter,
      };

      customerFetched({ modal, queries, setCustomers, setLoading, setRefreshing });
    },
    [activeFilter, debounceSearch, delegationFilter],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(
    (item: Customer) => {
      navigation.navigate('CustomerEdit', { customer: item });
    },
    [navigation],
  );

  const renderCustomerItem = useCallback(
    ({ item, index }: { item: any; index: number }) => <CustomerList onEdit={handleEdit} loading={loading} item={item as Customer} index={index} />,
    [loading, handleEdit],
  );

  const renderFilterItem = useCallback(
    ({ item: f }: { item: (typeof FILTER_OPTIONS)[0] }) => (
      <TouchableOpacity style={[styles.chip, activeFilter === f.key && styles.chipActive]} onPress={() => setActiveFilter(f.key)} activeOpacity={0.7}>
        <AppText style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>{f.label}</AppText>
      </TouchableOpacity>
    ),
    [activeFilter],
  );

  return (
    <AppLayout>
      <StatusBar backgroundColor={color.primary} barStyle="light-content" />
      <Input
        leftIcon={<AppIcon name="search" size={20} color={color.border} />}
        placeholder="Cari Nama"
        value={search}
        onChangeText={value => setSearch(value)}
      />

      <FlatList
        data={loading ? skeletonData : customers}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.delegationRow}>
              {DELEGATION_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.delegationTab, delegationFilter === d.key && styles.delegationTabActive]}
                  onPress={() => setDelegationFilter(d.key)}
                  activeOpacity={0.7}
                >
                  <AppText style={[styles.delegationTabText, delegationFilter === d.key && styles.delegationTabTextActive]}>
                    {d.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              horizontal
              data={FILTER_OPTIONS}
              keyExtractor={f => f.key}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={true}
              contentContainerStyle={styles.filterRow}
              renderItem={renderFilterItem}
            />

            <AppText style={styles.sectionLabel}>Nasabah terdaftar</AppText>
          </>
        }
        renderItem={renderCustomerItem}
        ListEmptyComponent={<EmptyData />}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </AppLayout>
  );
};

export default CustomerScreen;

const styles = StyleSheet.create({
  delegationRow: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  delegationTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  delegationTabActive: {
    backgroundColor: color.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  delegationTabText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: color.neutral,
  },
  delegationTabTextActive: {
    color: color.primary,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: color.border,
    padding: 10,
    gap: 2,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '600',
    color: color.primary,
  },
  statLabel: {
    fontSize: 10,
    color: color.neutral,
  },
  filterRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: color.border,
    backgroundColor: color.white,
  },
  chipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: color.neutral,
  },
  chipTextActive: {
    color: color.white,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: color.neutral,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
});
