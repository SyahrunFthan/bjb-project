import { monitoringGetItems } from '@/api/payment';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { Installment } from '@/model/loan';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

dayjs.locale('id');

const PAGE_LIMIT = 20;

const MonitoringScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [dataList, setDataList] = useState<Installment[]>([]);
  const modal = useModal();

  // 1. Fetch data awal / Reset Ke Halaman 1
  const fetchMonitoringData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setPage(1);
    setHasMore(true);

    try {
      await monitoringGetItems({
        modal,
        month: selectedMonth,
        search,
        page: 1,
        limit: PAGE_LIMIT,
        setDataList: (resData: Installment[]) => {
          setDataList(resData);
          if (resData.length < PAGE_LIMIT) {
            setHasMore(false);
          }
        },
        setLoading: () => {},
        setRefreshing: () => {},
        status: selectedStatus,
      });
    } catch (error) {
      console.error(error);
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
      await monitoringGetItems({
        modal,
        month: selectedMonth,
        search,
        page: nextPage,
        limit: PAGE_LIMIT,
        setDataList: (resData: Installment[]) => {
          if (resData.length === 0) {
            setHasMore(false);
          } else {
            // FIX: Filter agar hanya memasukkan item yang ID-nya belum ada di state sebelumnya
            setDataList(prev => {
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
        status: selectedStatus,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Trigger saat screen di-focus atau status/bulan berubah
  useFocusEffect(
    useCallback(() => {
      fetchMonitoringData();
    }, [selectedMonth, selectedStatus]),
  );

  // Trigger Debounce Search (Akan memanggil API baik saat mengetik maupun saat input dihapus/kosong)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMonitoringData();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = () => {
    fetchMonitoringData(true);
  };

  const handlePrevMonth = () => {
    setSelectedMonth(prev => dayjs(prev, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => dayjs(prev, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
  };

  const renderCard = ({ item }: { item: Installment }) => {
    const isPaid = item.status === 'paid' || (item.payments && item.payments.length > 0);
    const customerName = item.loan?.customer?.full_name || 'Tanpa Nama';
    const loanNumber = item.loan?.loan_sequence_number || '-';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.customerName}>{customerName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isPaid ? color.success : color.tertiary }]}>
            <Text style={styles.statusText}>{isPaid ? 'Sudah Bayar' : 'Belum Bayar'}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.metaText}>Pinjaman Ke: {loanNumber}</Text>
          <Text style={styles.amountText}>Tagihan: Rp {formatCurrency(item.amount ?? 0)}</Text>
        </View>
        <Text style={styles.metaText}>Cicilan Ke: {item.sequence_number}</Text>
        <Text style={styles.dateText}>Jatuh Tempo: {dayjs(item.due_date).format('DD MMMM YYYY')}</Text>
      </View>
    );
  };

  // Indicator Loader di bagian paling bawah FlatList saat memuat halaman baru
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
        <Text style={styles.title}>Monitoring Pembayaran Nasabah</Text>

        {/* Input Search Nama Nasabah */}
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama nasabah..."
          placeholderTextColor={color.neutral}
          value={search}
          onChangeText={setSearch}
        />

        {/* Komponen Filter Bulan */}
        <View style={styles.monthPickerContainer}>
          <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
            <Text style={styles.monthButtonText}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>{dayjs(selectedMonth, 'YYYY-MM').format('MMMM YYYY')}</Text>

          <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
            <Text style={styles.monthButtonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Status */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterChip, selectedStatus === 'ALL' && styles.filterChipActive]} onPress={() => setSelectedStatus('ALL')}>
            <Text style={[styles.filterChipText, selectedStatus === 'ALL' && styles.filterChipTextActive]}>Semua</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'PAID' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('PAID')}>
            <Text style={[styles.filterChipText, selectedStatus === 'PAID' && styles.filterChipTextActive]}>Sudah Bayar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedStatus === 'UNPAID' && styles.filterChipActive]}
            onPress={() => setSelectedStatus('UNPAID')}>
            <Text style={[styles.filterChipText, selectedStatus === 'UNPAID' && styles.filterChipTextActive]}>Belum Bayar</Text>
          </TouchableOpacity>
        </View>

        {/* List Data dengan Pagination / Infinite Scroll */}
        {loading ? (
          <View>
            {skeletonData.map((_, index) => (
              <SkeletonCard style={styles.skeleton} key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            data={dataList}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderCard}
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

export default MonitoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.primary,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  monthPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  monthButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: color.primary,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: color.black,
    textTransform: 'capitalize',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.border,
  },
  filterChipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: color.black,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: color.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: color.white,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: color.neutral,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '600',
    color: color.black,
  },
  dateText: {
    fontSize: 11,
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
