import { monitoringGetItems } from '@/api/payment';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import AppIcon from '@/components/Icon';
import EmptyData from '@/components/ui/EmptyData';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { CustomerMonitoringItem, MonitoringSummary } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

dayjs.locale('id');

const PAGE_LIMIT = 20;

const MonitoringScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const modal = useModal();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [dataList, setDataList] = useState<CustomerMonitoringItem[]>([]);
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);

  // Fetch data awal / reset ke halaman 1
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
        setDataList: (resData, meta, resSummary) => {
          setDataList(resData || []);
          if (resSummary) {
            setSummary(resSummary);
          }
          if (!resData || resData.length < PAGE_LIMIT || meta?.has_more === false) {
            setHasMore(false);
          }
        },
        setSummary: resSummary => {
          if (resSummary) setSummary(resSummary);
        },
        setLoading: () => {},
        setRefreshing: () => {},
        status: selectedStatus,
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Infinite scroll load more
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
        setDataList: (resData, meta) => {
          if (!resData || resData.length === 0) {
            setHasMore(false);
          } else {
            setDataList(prev => {
              const existingIds = new Set(prev.map(item => item.loan_id));
              const newUniqueItems = resData.filter(item => !existingIds.has(item.loan_id));
              return [...prev, ...newUniqueItems];
            });

            setPage(nextPage);

            if (resData.length < PAGE_LIMIT || meta?.has_more === false) {
              setHasMore(false);
            }
          }
        },
        setLoading: () => {},
        setRefreshing: () => {},
        status: selectedStatus,
      });
    } catch (error) {
      console.error('Error load more monitoring data:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMonitoringData();
    }, [selectedMonth, selectedStatus]),
  );

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

  const handleCallCustomer = (phone: string) => {
    if (phone && phone !== '-') {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const handleOpenCollection = (loanId: string) => {
    navigation.navigate('CourierCollectionDetail', { loanId });
  };

  const renderCard = ({ item }: { item: CustomerMonitoringItem }) => {
    const isPaid = item.today_status.is_paid;
    const customerInitials = item.customer.full_name
      ? item.customer.full_name
          .split(' ')
          .map(w => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'N';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleOpenCollection(item.loan_id)}>
        {/* Card Header: Avatar, Nama, No Anggota & Status Badge Hari Ini */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{customerInitials}</Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer.full_name}
            </Text>
            <Text style={styles.memberNumber}>
              No. Anggota: {item.customer.member_number}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isPaid ? '#DCFCE7' : '#FEE2E2' },
            ]}>
            <AppIcon
              name={isPaid ? 'check-circle' : 'schedule'}
              size={14}
              color={isPaid ? '#15803D' : '#B91C1C'}
            />
            <Text
              style={[
                styles.statusBadgeText,
                { color: isPaid ? '#15803D' : '#B91C1C' },
              ]}>
              {isPaid ? 'Sudah Bayar' : 'Belum Bayar'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Essential Info Grid: Target Hari Ini & Sisa Saldo Pinjaman */}
        <View style={styles.infoGrid}>
          {/* Target Hari Ini */}
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Target Hari Ini</Text>
            <Text style={styles.targetValue}>
              Rp {formatCurrency(item.today_status.target_amount)}
            </Text>
            <Text style={styles.infoSubtext}>
              {isPaid
                ? `Telah disetor: Rp ${formatCurrency(item.today_status.paid_amount)}`
                : item.today_status.installment_number
                ? `Cicilan ke-${item.today_status.installment_number}`
                : 'Sesuai target harian'}
            </Text>
          </View>

          {/* Sisa Saldo Pinjaman */}
          <View style={[styles.infoCol, styles.infoColRight]}>
            <Text style={styles.infoLabel}>Sisa Saldo</Text>
            <Text
              style={[
                styles.balanceValue,
                item.remaining_amount <= 0 && styles.balanceLunas,
              ]}>
              {item.remaining_amount <= 0
                ? 'LUNAS'
                : `Rp ${formatCurrency(item.remaining_amount)}`}
            </Text>
            <Text style={styles.infoSubtext}>
              Total: Rp {formatCurrency(item.total_amount)}
            </Text>
          </View>
        </View>

        {/* Monthly Progress Section */}
        <View style={styles.monthlyProgressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.progressLabel}>
              Setoran Bulan Ini ({item.month_progress.month}):
            </Text>
            <Text style={styles.progressValue}>
              <Text style={styles.progressHighlight}>
                {item.month_progress.days_paid}
              </Text>
              /{item.month_progress.total_days} Hari
              {item.month_progress.total_paid > 0 &&
                ` • Rp ${formatCurrency(item.month_progress.total_paid)}`}
            </Text>
          </View>

          {/* Visual Progress Bar (Persentase Pinjaman Terbayar) */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(0, item.overall_progress.percentage))}%`,
                  backgroundColor:
                    item.overall_progress.percentage >= 100
                      ? '#15803D'
                      : color.primary,
                },
              ]}
            />
          </View>
          <View style={styles.progressBarCaptionRow}>
            <Text style={styles.progressCaption}>
              Progress cicilan: {item.overall_progress.paid_installments} dari{' '}
              {item.overall_progress.total_installments} cicilan lunas
            </Text>
            <Text style={styles.progressPercentage}>
              {item.overall_progress.percentage}%
            </Text>
          </View>
        </View>

        {/* Card Actions Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.actionHint}>
            <Text style={styles.actionHintText}>Ketuk untuk catat setoran</Text>
            <AppIcon name="chevron-right" size={18} color={color.primary} />
          </View>

          {item.customer.phone_number && item.customer.phone_number !== '-' && (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => handleCallCustomer(item.customer.phone_number)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppIcon name="phone" size={16} color={color.white} />
              <Text style={styles.phoneButtonText}>Telepon</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={color.primary} />
        <Text style={styles.footerText}>Memuat nasabah berikutnya...</Text>
      </View>
    );
  };

  return (
    <AppLayout scrollable={false}>
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Monitoring Tagihan</Text>
            <Text style={styles.subtitle}>
              Pantau sisa saldo & status setoran harian nasabah
            </Text>
          </View>
        </View>

        {/* Month Selector Bar */}
        <View style={styles.monthPickerContainer}>
          <TouchableOpacity style={styles.monthButton} onPress={handlePrevMonth}>
            <AppIcon name="chevron-left" size={22} color={color.primary} />
          </TouchableOpacity>

          <View style={styles.monthTitleWrapper}>
            <AppIcon name="calendar-today" size={16} color={color.primary} />
            <Text style={styles.monthTitle}>
              {dayjs(selectedMonth, 'YYYY-MM').format('MMMM YYYY')}
            </Text>
          </View>

          <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
            <AppIcon name="chevron-right" size={22} color={color.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick KPI Summary Banner */}
        {summary && (
          <View style={styles.kpiContainer}>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCol}>
                <Text style={styles.kpiLabel}>Total Nasabah Aktif</Text>
                <Text style={styles.kpiValueBig}>{summary.total_customers}</Text>
              </View>
              <View style={[styles.kpiCol, styles.kpiColBorder]}>
                <Text style={styles.kpiLabel}>Terkumpul Hari Ini</Text>
                <Text style={[styles.kpiValueBig, { color: '#15803D' }]}>
                  Rp {formatCurrency(summary.total_collected_today)}
                </Text>
              </View>
            </View>

            <View style={styles.kpiStatusRow}>
              <View style={[styles.kpiPill, { backgroundColor: '#FEE2E2' }]}>
                <AppIcon name="schedule" size={14} color="#B91C1C" />
                <Text style={[styles.kpiPillText, { color: '#B91C1C' }]}>
                  Belum Bayar: {summary.unpaid_today_count}
                </Text>
              </View>

              <View style={[styles.kpiPill, { backgroundColor: '#DCFCE7' }]}>
                <AppIcon name="check-circle" size={14} color="#15803D" />
                <Text style={[styles.kpiPillText, { color: '#15803D' }]}>
                  Sudah Bayar: {summary.paid_today_count}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Instant Search Bar */}
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
            <TouchableOpacity
              onPress={() => setSearch('')}
              style={styles.clearSearchBtn}>
              <AppIcon name="close" size={18} color={color.neutral} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs (Semua, Belum Bayar, Sudah Bayar) */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === 'ALL' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus('ALL')}>
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === 'ALL' && styles.filterChipTextActive,
              ]}>
              Semua {summary ? `(${summary.total_customers})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === 'UNPAID' && styles.filterChipActiveAlert,
            ]}
            onPress={() => setSelectedStatus('UNPAID')}>
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === 'UNPAID' && styles.filterChipTextActive,
              ]}>
              Belum Bayar {summary ? `(${summary.unpaid_today_count})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedStatus === 'PAID' && styles.filterChipActiveSuccess,
            ]}
            onPress={() => setSelectedStatus('PAID')}>
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === 'PAID' && styles.filterChipTextActive,
              ]}>
              Sudah Bayar {summary ? `(${summary.paid_today_count})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Customer Cards List */}
        {loading ? (
          <View>
            {skeletonData.map((_, index) => (
              <SkeletonCard style={styles.skeleton} key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            data={dataList}
            keyExtractor={(item) => item.loan_id}
            renderItem={renderCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[color.primary]}
                tintColor={color.primary}
              />
            }
            ListEmptyComponent={
              <EmptyData
                title="Tidak Ada Nasabah"
                description="Tidak ada data nasabah yang sesuai kriteria pencarian atau filter"
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

export default MonitoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: color.primary,
  },
  subtitle: {
    fontSize: 12,
    color: color.neutral,
    marginTop: 2,
  },
  monthPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 10,
  },
  monthButton: {
    padding: 6,
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: color.black,
    textTransform: 'capitalize',
  },
  kpiContainer: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: color.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiCol: {
    flex: 1,
  },
  kpiColBorder: {
    borderLeftWidth: 1,
    borderLeftColor: color.border,
    paddingLeft: 12,
  },
  kpiLabel: {
    fontSize: 11,
    color: color.neutral,
    fontWeight: '500',
    marginBottom: 2,
  },
  kpiValueBig: {
    fontSize: 16,
    fontWeight: '700',
    color: color.primary,
  },
  kpiStatusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 5,
  },
  kpiPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: color.black,
    paddingVertical: 8,
  },
  clearSearchBtn: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 6,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.border,
  },
  filterChipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  filterChipActiveAlert: {
    backgroundColor: '#B91C1C',
    borderColor: '#B91C1C',
  },
  filterChipActiveSuccess: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  filterChipText: {
    fontSize: 12,
    color: color.black,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: color.white,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 28,
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: color.primary,
  },
  headerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: color.black,
  },
  memberNumber: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoColRight: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 11,
    color: color.neutral,
    fontWeight: '500',
    marginBottom: 2,
  },
  targetValue: {
    fontSize: 15,
    fontWeight: '700',
    color: color.black,
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: color.tertiary,
  },
  balanceLunas: {
    color: '#15803D',
  },
  infoSubtext: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 2,
  },
  monthlyProgressContainer: {
    marginBottom: 10,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: color.neutral,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: color.black,
  },
  progressHighlight: {
    color: color.primary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarCaptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCaption: {
    fontSize: 10,
    color: color.neutral,
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: '700',
    color: color.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15803D',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phoneButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: color.white,
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
