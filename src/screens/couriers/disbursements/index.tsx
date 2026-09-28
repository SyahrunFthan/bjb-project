import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { fetchDisbursements } from '@/api/loan';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import DatePicker from '@/components/DatePicker';
import AppIcon from '@/components/Icon';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { DisbursementSummary, Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';

dayjs.locale('id');

const PAGE_LIMIT = 20;

const CourierDisbursementScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const modal = useModal();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // 'YYYY-MM-DD' or null for whole month
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [dataList, setDataList] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<DisbursementSummary | null>(null);

  const loadData = useCallback(
    async (isRefresh = false, targetPage = 1, currentMonth = selectedMonth, currentDate = selectedDate, searchQuery = search) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (targetPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        await fetchDisbursements({
          modal,
          month: currentDate ? undefined : currentMonth,
          date: currentDate || undefined,
          search: searchQuery.trim(),
          page: targetPage,
          limit: PAGE_LIMIT,
          setDataList: (resData, meta) => {
            if (targetPage === 1) {
              setDataList(resData || []);
            } else {
              setDataList(prev => {
                const existingIds = new Set(prev.map(i => i.id));
                const newItems = (resData || []).filter(i => !existingIds.has(i.id));
                return [...prev, ...newItems];
              });
            }

            setPage(targetPage);
            setHasMore(meta?.has_more ?? resData?.length === PAGE_LIMIT);
          },
          setSummary: resSummary => {
            if (resSummary) {
              setSummary(resSummary);
            }
          },
          setLoading: () => {},
          setRefreshing: () => {},
        });
      } catch (err) {
        console.error('Error fetching disbursements:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedMonth, selectedDate, search, modal],
  );

  // Initial load or when filters change
  useEffect(() => {
    loadData(false, 1, selectedMonth, selectedDate, search);
  }, [selectedMonth, selectedDate]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData(false, 1, selectedMonth, selectedDate, search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const onRefresh = () => {
    loadData(true, 1, selectedMonth, selectedDate, search);
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || loading || refreshing) return;
    loadData(false, page + 1, selectedMonth, selectedDate, search);
  };

  const handlePrevMonth = () => {
    const newMonth = dayjs(selectedMonth, 'YYYY-MM').subtract(1, 'month').format('YYYY-MM');
    setSelectedMonth(newMonth);
    setSelectedDate(null); // Reset date filter to whole month
  };

  const handleNextMonth = () => {
    const newMonth = dayjs(selectedMonth, 'YYYY-MM').add(1, 'month').format('YYYY-MM');
    setSelectedMonth(newMonth);
    setSelectedDate(null);
  };

  const handleSelectAllMonth = () => {
    setSelectedDate(null);
  };

  const handleSelectToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedMonth(dayjs().format('YYYY-MM'));
    setSelectedDate(today);
  };

  const handleCustomDateSelect = (date: Date) => {
    const formatted = dayjs(date).format('YYYY-MM-DD');
    setSelectedMonth(dayjs(date).format('YYYY-MM'));
    setSelectedDate(formatted);
    setShowDatePicker(false);
  };

  const handleCallCustomer = (phone?: string) => {
    if (phone && phone !== '-') {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const renderLoanCard = ({ item }: { item: Loan }) => {
    const customer = item.customer;
    const customerName = customer?.full_name || 'Nasabah';
    const memberNumber = customer?.member_number || '-';
    const customerPhone = customer?.phone_number;

    const customerInitials = customerName
      .split(' ')
      .filter(Boolean)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const disbursementDateStr = item.effective_disbursement_date || item.disbursement_date || item.start_date || item.createdAt;
    const formattedDate = dayjs(disbursementDateStr).format('DD MMMM YYYY');

    const tenorName =
      item.tenor?.name || (item.tenor?.duration_month ? `${item.tenor.duration_month} Bulan` : `${item.tenor?.duration_day || '-'} Hari`);

    return (
      <View style={styles.card}>
        {/* Card Header: Avatar, Name & Member Number */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customerInitials || 'N'}</Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {customerName}
            </Text>
            <Text style={styles.memberNumber}>No. Anggota: {memberNumber}</Text>
          </View>

          <View style={styles.badgeSuccess}>
            <AppIcon name="check-circle" size={13} color="#059669" />
            <Text style={styles.badgeSuccessText}>Dicairkan</Text>
          </View>
        </View>

        {/* Delegated Banner if applicable */}
        {item.is_delegated && item.original_employee && (
          <View style={styles.delegationNotice}>
            <AppIcon name="swap-horiz" size={14} color="#0284C7" />
            <Text style={styles.delegationNoticeText}>
              Titipan dari: <Text style={{ fontWeight: 'bold' }}>{item.original_employee.full_name}</Text>
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Nominal Pencairan */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Nominal Pencairan (Pokok Pinjaman)</Text>
          <Text style={styles.amountValue}>Rp {formatCurrency(item.amount)}</Text>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.gridCol}>
            <View style={styles.detailRow}>
              <AppIcon name="event" size={14} color={color.neutral} />
              <Text style={styles.detailLabel}>Tgl Dropping</Text>
            </View>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          <View style={styles.gridCol}>
            <View style={styles.detailRow}>
              <AppIcon name="schedule" size={14} color={color.neutral} />
              <Text style={styles.detailLabel}>Jangka Waktu</Text>
            </View>
            <Text style={styles.detailValue}>{tenorName}</Text>
          </View>
        </View>

        <View style={[styles.detailsGrid, { marginTop: 8 }]}>
          <View style={styles.gridCol}>
            <View style={styles.detailRow}>
              <AppIcon name="receipt" size={14} color={color.neutral} />
              <Text style={styles.detailLabel}>Angsuran</Text>
            </View>
            <Text style={styles.detailValueSecondary}>
              Rp {formatCurrency(item.installment_amount)} <Text style={styles.perPeriodText}>/hari</Text>
            </Text>
          </View>

          <View style={styles.gridCol}>
            <View style={styles.detailRow}>
              <AppIcon name="account-balance-wallet" size={14} color={color.neutral} />
              <Text style={styles.detailLabel}>Total Pinjaman</Text>
            </View>
            <Text style={styles.detailValueSecondary}>Rp {formatCurrency(item.total_amount)}</Text>
          </View>
        </View>

        {/* Footer Actions */}
        {customerPhone && customerPhone !== '-' && (
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.callButton} activeOpacity={0.8} onPress={() => handleCallCustomer(customerPhone)}>
              <AppIcon name="phone" size={14} color={color.primary} />
              <Text style={styles.callButtonText}>Hubungi Nasabah ({customerPhone})</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={color.primary} />
        <Text style={styles.footerLoaderText}>Memuat data pencairan...</Text>
      </View>
    );
  };

  const selectedMonthLabel = dayjs(selectedMonth, 'YYYY-MM').format('MMMM YYYY');
  const isTodaySelected = selectedDate === dayjs().format('YYYY-MM-DD');
  const isAllMonthSelected = selectedDate === null;

  return (
    <AppLayout>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <AppIcon name="arrow-back" size={24} color={color.primary} />
          </TouchableOpacity>
          <View style={styles.topHeaderTitleWrapper}>
            <Text style={styles.pageTitle}>Pencairan Nasabah</Text>
            <Text style={styles.pageSubtitle}>Laporan realisasi dropping pinjaman</Text>
          </View>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelectorCard}>
          <TouchableOpacity style={styles.monthArrowBtn} onPress={handlePrevMonth}>
            <AppIcon name="chevron-left" size={22} color={color.primary} />
          </TouchableOpacity>

          <View style={styles.monthLabelWrapper}>
            <AppIcon name="calendar-today" size={16} color={color.primary} />
            <Text style={styles.monthLabelText}>{selectedMonthLabel}</Text>
          </View>

          <TouchableOpacity style={styles.monthArrowBtn} onPress={handleNextMonth}>
            <AppIcon name="chevron-right" size={22} color={color.primary} />
          </TouchableOpacity>
        </View>

        {/* Date Filter Chips (Semua Bulan, Hari Ini, Pilih Tanggal) */}
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity style={[styles.filterChip, isAllMonthSelected && styles.filterChipActive]} onPress={handleSelectAllMonth}>
            <AppIcon name="date-range" size={14} color={isAllMonthSelected ? color.white : '#475569'} />
            <Text style={[styles.filterChipText, isAllMonthSelected && styles.filterChipTextActive]}>Bulan Ini</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.filterChip, isTodaySelected && styles.filterChipActive]} onPress={handleSelectToday}>
            <AppIcon name="today" size={14} color={isTodaySelected ? color.white : '#475569'} />
            <Text style={[styles.filterChipText, isTodaySelected && styles.filterChipTextActive]}>Hari Ini</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, !isAllMonthSelected && !isTodaySelected && styles.filterChipActive]}
            onPress={() => setShowDatePicker(true)}>
            <AppIcon name="event" size={14} color={!isAllMonthSelected && !isTodaySelected ? color.white : '#475569'} />
            <Text style={[styles.filterChipText, !isAllMonthSelected && !isTodaySelected && styles.filterChipTextActive]}>
              {!isAllMonthSelected && !isTodaySelected ? dayjs(selectedDate).format('D MMM YYYY') : 'Pilih Tanggal'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Date Notice Banner if a specific date is chosen */}
        {selectedDate && (
          <View style={styles.selectedDateBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <AppIcon name="filter-alt" size={14} color="#0369A1" />
              <Text style={styles.selectedDateBannerText}>
                Filter Tanggal: <Text style={{ fontWeight: 'bold' }}>{dayjs(selectedDate).format('dddd, DD MMMM YYYY')}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.clearDateBtn} onPress={handleSelectAllMonth}>
              <AppIcon name="close" size={14} color="#0369A1" />
            </TouchableOpacity>
          </View>
        )}

        {/* KPI Banner Cards */}
        {summary && (
          <View style={styles.kpiContainer}>
            {/* Total Filtered Disbursement */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <View style={[styles.kpiIconWrapper, { backgroundColor: '#ECFDF5' }]}>
                  <AppIcon name="payments" size={18} color="#059669" />
                </View>
                <Text style={styles.kpiCardTitle}>{selectedDate ? 'Pencairan Terpilih' : 'Total Bulan Ini'}</Text>
              </View>
              <Text style={styles.kpiCardValue}>Rp {formatCurrency(summary.total_disbursement_amount)}</Text>
              <Text style={styles.kpiCardSubtext}>{summary.total_disbursement_count} Pinjaman Terealisasi</Text>
            </View>

            {/* Today's Disbursement */}
            <View style={styles.kpiCard}>
              <View style={styles.kpiCardHeader}>
                <View style={[styles.kpiIconWrapper, { backgroundColor: '#EFF6FF' }]}>
                  <AppIcon name="today" size={18} color="#2563EB" />
                </View>
                <Text style={styles.kpiCardTitle}>Khusus Hari Ini</Text>
              </View>
              <Text style={[styles.kpiCardValue, { color: '#2563EB' }]}>Rp {formatCurrency(summary.today_disbursement_amount)}</Text>
              <Text style={styles.kpiCardSubtext}>{summary.today_disbursement_count} Pinjaman Hari Ini</Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <AppIcon name="search" size={20} color={color.neutral} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama nasabah atau no. anggota..."
            placeholderTextColor={color.neutral}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
              <AppIcon name="close" size={18} color={color.neutral} />
            </TouchableOpacity>
          )}
        </View>

        {/* DatePicker Modal for custom date selection */}
        <DatePicker
          visible={showDatePicker}
          showInput={false}
          onClose={() => setShowDatePicker(false)}
          value={selectedDate ? dayjs(selectedDate).toDate() : new Date()}
          onDateChange={handleCustomDateSelect}
        />

        {/* List of Disbursements */}
        {loading ? (
          <View style={{ marginTop: 10 }}>
            {skeletonData.map((_, index) => (
              <SkeletonCard style={styles.skeleton} key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            data={dataList}
            keyExtractor={item => item.id}
            renderItem={renderLoanCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.primary]} tintColor={color.primary} />}
            ListEmptyComponent={
              <EmptyData
                title="Tidak Ada Pencairan"
                description={
                  search
                    ? `Tidak ada data pencairan yang sesuai dengan kata kunci "${search}"`
                    : selectedDate
                    ? `Belum ada realisasi pencairan pada tanggal ${dayjs(selectedDate).format('DD MMMM YYYY')}`
                    : `Belum ada realisasi pencairan nasabah pada ${selectedMonthLabel}`
                }
              />
            }
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

export default CourierDisbursementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.border,
  },
  topHeaderTitleWrapper: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: color.primary,
  },
  pageSubtitle: {
    fontSize: 12,
    color: color.neutral,
    marginTop: 2,
  },
  monthSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 10,
  },
  monthArrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  monthLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthLabelText: {
    fontSize: 15,
    fontWeight: '700',
    color: color.black,
    textTransform: 'capitalize',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: color.white,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.border,
  },
  filterChipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: color.white,
    fontWeight: '700',
  },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  selectedDateBannerText: {
    fontSize: 12,
    color: '#0369A1',
  },
  clearDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearDateBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  kpiIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: color.neutral,
    flex: 1,
  },
  kpiCardValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 2,
  },
  kpiCardSubtext: {
    fontSize: 11,
    color: '#64748B',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: color.black,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  listContainer: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: color.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: color.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: color.primary,
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: color.black,
  },
  memberNumber: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 2,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  delegationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  delegationNoticeText: {
    fontSize: 11,
    color: '#0369A1',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  amountSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  gridCol: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: color.black,
  },
  detailValueSecondary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  perPeriodText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: color.neutral,
  },
  cardFooter: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: color.primary + '10',
    paddingVertical: 7,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  skeleton: {
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerLoaderText: {
    fontSize: 12,
    color: color.neutral,
  },
});
