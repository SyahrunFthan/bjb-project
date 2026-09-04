import { recentPaymentGet } from '@/api/payment';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatActivityDate } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { RecentPayment } from '@/model/dashboard';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';

const PAGE_LIMIT = 20;

const ActivityScreen = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const modal = useModal();

  // Fetch awal / reset ke halaman 1
  const fetchRecentPayments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPage(1);
    setHasMore(true);

    try {
      await recentPaymentGet({
        modal,
        search,
        page: 1,
        limit: PAGE_LIMIT,
        setRecentPayments: (resData: RecentPayment[]) => {
          setPayments(resData);
          if (resData.length < PAGE_LIMIT) {
            setHasMore(false);
          }
        },
        setLoading: () => {},
        setRefreshing: () => {},
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
      await recentPaymentGet({
        modal,
        search,
        page: nextPage,
        limit: PAGE_LIMIT,
        setRecentPayments: (resData: RecentPayment[]) => {
          if (resData.length === 0) {
            setHasMore(false);
          } else {
            setPayments(prev => {
              const existingIds = new Set(prev.map(item => item.id));
              const newUniqueItems = resData.filter(item => !existingIds.has(item.id));
              return [...prev, ...newUniqueItems];
            });
            setPage(nextPage);
            if (resData.length < PAGE_LIMIT) {
              setHasMore(false);
            }
          }
        },
        setLoading: () => {},
        setRefreshing: () => {},
      });
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentPayments();
    }, []),
  );

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecentPayments();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = () => {
    fetchRecentPayments(true);
  };

  const renderPaymentCard = ({ item }: { item: RecentPayment }) => {
    const customerName = item.customerName || 'Tanpa Nama';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.paymentAmount}>Rp {item.amount?.toLocaleString('id-ID')}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.metaText}>Bayar Cicilan</Text>
          <Text style={styles.metaText}>
            {formatActivityDate(item.paymentDate)} | {item.paymentMethod?.toUpperCase() ?? 'CASH'}
          </Text>
        </View>
      </View>
    );
  };

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
      <View style={styles.container}>
        <Text style={styles.title}>Riwayat Pembayaran</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama customer..."
            placeholderTextColor={color.neutral}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>

        {loading ? (
          skeletonData.map((_, index) => {
            return <SkeletonCard style={styles.skeleton} key={index} />;
          })
        ) : (
          <FlatList
            data={payments}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderPaymentCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.primary]} tintColor={color.primary} />}
            ListEmptyComponent={<EmptyData />}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
    </AppLayout>
  );
};

export default ActivityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.black,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 44,
    backgroundColor: color.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: color.black,
    borderWidth: 1,
    borderColor: color.border,
  },
  loader: {
    marginTop: 32,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: color.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: color.success,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: color.neutral,
  },
  dateText: {
    fontSize: 11,
    color: color.neutral,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: color.neutral,
  },
  skeleton: {
    marginBottom: 8,
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
