import { fetchLoans } from '@/api/loan';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import CollectionLoanList from '@/components/couriers/collections/CollectionLoanList';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { skeletonData } from '@/lib/utils';
import { Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, View } from 'react-native';

const PAGE_LIMIT = 20;

const CourierCollectionScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollection'> }) => {
  const modal = useModal();
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [loans, setLoans] = useState<Loan[]>([]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPage(1);
    setHasMore(true);

    try {
      await fetchLoans({
        modal,
        queries: { search, status: 'approved' },
        page: 1,
        limit: PAGE_LIMIT,
        setDataList: (resData: Loan[]) => {
          setLoans(resData.filter(l => l.loan_status === 'active'));
          if (resData.length < PAGE_LIMIT) {
            setHasMore(false);
          }
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      await fetchLoans({
        modal,
        queries: { search, status: 'approved' },
        page: nextPage,
        limit: PAGE_LIMIT,
        setDataList: (resData: Loan[]) => {
          if (resData.length === 0) {
            setHasMore(false);
          } else {
            setLoans(prev => {
              const existingIds = new Set(prev.map(item => item.id));
              const newUniqueItems = resData.filter((item: Loan) => !existingIds.has(item.id) && item.loan_status === 'active');
              return [...prev, ...newUniqueItems];
            });
            setPage(nextPage);
            if (resData.length < PAGE_LIMIT) {
              setHasMore(false);
            }
          }
        },
      });
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={color.primary} />
        <Text style={styles.footerText}>Memuat halaman berikutnya...</Text>
      </View>
    );
  };

  return (
    <AppLayout scrollable={false}>
      <StatusBar backgroundColor={color.primary} barStyle="light-content" />

      <Input
        leftIcon={<AppIcon name="search" size={20} color={color.neutral} />}
        placeholder="Cari nama nasabah..."
        value={search}
        onChangeText={val => setSearch(val)}
        containerStyle={styles.searchInput}
      />

      {loading ? (
        <View style={styles.skeletonContainer}>
          {skeletonData.map((_, index) => (
            <SkeletonCard style={styles.skeleton} key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} colors={[color.primary]} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <CollectionLoanList item={item as Loan} key={item.id} loading={loading} navigation={navigation} />}
          ListEmptyComponent={<EmptyData />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
        />
      )}
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
  skeletonContainer: {
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  skeleton: {
    marginBottom: 12,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: color.neutral,
  },
});
