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
import 'dayjs/locale/id'; // Impor bahasa Indonesia
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

dayjs.locale('id');

const MonitoringScreen = () => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataList, setDataList] = useState<Installment[]>([]);
  const modal = useModal();

  const fetchMonitoringData = async () => {
    monitoringGetItems({
      modal,
      month: selectedMonth,
      search,
      setDataList,
      setLoading,
      setRefreshing,
      status: selectedStatus,
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchMonitoringData();
    }, [selectedMonth, selectedStatus]),
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        fetchMonitoringData();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMonitoringData();
  };

  // Fungsi navigasi ubah bulan
  const handlePrevMonth = () => {
    setSelectedMonth(prev => dayjs(prev, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => dayjs(prev, 'YYYY-MM').add(1, 'month').format('YYYY-MM'));
  };

  const renderCard = ({ item }: { item: Installment }) => {
    const isPaid = item.payments && item.payments.length > 0;
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
          <Text style={styles.amountText}>Tagihan: Rp {formatCurrency(item.paid_amount ?? 0)}</Text>
        </View>
        <Text style={styles.metaText}>Cicilan Ke: {item.sequence_number}</Text>

        <Text style={styles.dateText}>Jatuh Tempo: {dayjs(item.due_date).format('DD MMMM YYYY')}</Text>
      </View>
    );
  };

  return (
    <AppLayout scrollable>
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

        {/* List Data */}
        {loading ? (
          skeletonData.map((_, index) => {
            return <SkeletonCard style={styles.skeleton} key={index} />;
          })
        ) : (
          <FlatList
            data={dataList}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.primary]} tintColor={color.primary} />}
            ListEmptyComponent={<EmptyData />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </View>
    </AppLayout>
  );
};

export default MonitoringScreen;

const styles = StyleSheet.create({
  container: {
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
});
