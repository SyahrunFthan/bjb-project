import { fetchLoans } from '@/api/loan';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import CourierLoanCard from '@/components/couriers/loans/CourierLoanCard';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/useModal';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FilterOption {
  key: string;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Semua' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'rejected', label: 'Ditolak' },
];

const CourierLoanScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'Courier'> }) => {
  const modal = useModal();

  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
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
        status: activeFilter,
      };

      fetchLoans(setLoans, setLoading, queries, modal).then(() => {
        setRefreshing(false);
      });
    },
    [activeFilter, debounceSearch, modal],
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

  console.log(loans);

  return (
    <AppLayout scrollable={true}>
      <StatusBar backgroundColor={color.primary} barStyle="light-content" />

      <View style={styles.searchContainer}>
        <Input
          leftIcon={<AppIcon name="search" size={20} color={color.neutral} />}
          placeholder="Cari nama nasabah..."
          value={search}
          onChangeText={val => setSearch(val)}
          containerStyle={styles.searchInput}
        />
      </View>

      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={f => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.chip, activeFilter === f.key && styles.chipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.7}>
              <AppText style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>{f.label}</AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <FlatList
            data={Array.from({ length: 5 })}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={() => <SkeletonCard />}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <FlatList
          data={loans}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[color.primary]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <CourierLoanCard loan={item} loading={loading} onRefresh={fetchData} />}
          ListEmptyComponent={<EmptyData />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </AppLayout>
  );
};

export default CourierLoanScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: color.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: color.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: color.white + 'A0',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 14,
    marginTop: 12,
  },
  searchInput: {
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  filterWrap: {
    height: 48,
    marginVertical: 4,
  },
  filterRow: {
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
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
  listContent: {
    paddingBottom: 80,
    minHeight: '100%',
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: color.border,
    marginHorizontal: 14,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
