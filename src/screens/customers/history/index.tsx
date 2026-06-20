import { customerLoansFetched, customerPaymentsFetched } from '@/api/customer';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatCurrency, formatDueDate, formatTransactionDate } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { CustomerLoanHistory, CustomerPaymentHistory } from '@/model/history';
import { RouteParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

const HistoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const [activeTab, setActiveTab] = useState<'loans' | 'payments'>('loans');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loans, setLoans] = useState<CustomerLoanHistory[]>([]);
  const [payments, setPayments] = useState<CustomerPaymentHistory[]>([]);
  const modal = useModal();

  const fetchHistoryData = useCallback(
    (tab: 'loans' | 'payments', isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (tab === 'loans') {
        customerLoansFetched({ setData: setLoans, setLoading, modal, setRefreshing });
      } else {
        customerPaymentsFetched({ setData: setPayments, setLoading, modal, setRefreshing });
      }
    },
    [modal],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchHistoryData(activeTab);
    });

    fetchHistoryData(activeTab);

    return unsubscribe;
  }, [navigation, activeTab, fetchHistoryData]);

  const handleTabChange = (tab: 'loans' | 'payments') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const getLoanStatusLabel = (loan: CustomerLoanHistory) => {
    if (loan.submission_status === 'pending') return 'Pending Approval';
    if (loan.submission_status === 'rejected') return 'Ditolak';
    if (loan.submission_status === 'draft') return 'Draft';

    if (loan.loan_status === 'active') return 'Aktif';
    if (loan.loan_status === 'done') return 'Lunas';
    if (loan.loan_status === 'closed') return 'Selesai';
    return loan.loan_status || 'Unknown';
  };

  const getLoanStatusColor = (loan: CustomerLoanHistory) => {
    if (loan.submission_status === 'pending') return color.yellow;
    if (loan.submission_status === 'rejected') return color.tertiary;
    if (loan.submission_status === 'draft') return color.neutral;

    if (loan.loan_status === 'active') return color.blue;
    if (loan.loan_status === 'done') return 'green';
    if (loan.loan_status === 'closed') return color.neutral;
    return color.neutral;
  };

  const getPaymentStatusColor = (status: string) => {
    if (status === 'paid' || status === 'success') return 'green';
    if (status === 'pending') return color.yellow;
    return color.tertiary;
  };

  const renderLoanItem = ({ item }: { item: CustomerLoanHistory }) => {
    const statusLabel = getLoanStatusLabel(item);
    const statusColor = getLoanStatusColor(item);
    const isClickable = item.submission_status === 'approved' || item.loan_status === 'active' || item.loan_status === 'done';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={isClickable ? 0.7 : 1}
        onPress={() => {
          if (isClickable) {
            navigation.navigate('LoanItem', { loanId: item.id });
          }
        }}>
        <View style={styles.cardHeader}>
          <View style={styles.loanSequenceBox}>
            <AppIcon name="credit-card" size={16} color={color.blue} />
            <AppText variant="bold" style={styles.loanTitle}>
              Pinjaman Ke-{item.loan_sequence_number}
            </AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
            <AppText variant="semiBold" style={[styles.badgeText, { color: statusColor }]}>
              {statusLabel}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <AppText style={styles.infoLabel}>Jumlah Pokok</AppText>
            <AppText variant="semiBold" style={styles.infoValue}>
              Rp {formatCurrency(item.amount)}
            </AppText>
          </View>
          <View style={styles.infoCol}>
            <AppText style={styles.infoLabel}>Total Pengembalian</AppText>
            <AppText variant="semiBold" style={styles.infoValue}>
              Rp {formatCurrency(item.total_amount)}
            </AppText>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <AppText style={styles.infoLabel}>Sisa Tagihan</AppText>
            <AppText variant="bold" style={[styles.infoValue, { color: color.tertiary }]}>
              Rp {formatCurrency(item.remaining_amount)}
            </AppText>
          </View>
          <View style={styles.infoCol}>
            <AppText style={styles.infoLabel}>Cicilan / Tenor</AppText>
            <AppText variant="semiBold" style={styles.infoValue}>
              Rp {formatCurrency(item.installment_amount)} ({item.tenor?.name || '-'})
            </AppText>
          </View>
        </View>

        {item.start_date ? (
          <View style={styles.dateRow}>
            <AppIcon name="calendar-today" size={14} color={color.neutral} />
            <AppText style={styles.dateText}>
              Periode: {formatDueDate(item.start_date)} s/d {formatDueDate(item.end_date)}
            </AppText>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderPaymentItem = ({ item }: { item: CustomerPaymentHistory }) => {
    const statusColor = getPaymentStatusColor(item.payment_status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.paymentBox}>
            <View style={styles.iconCircle}>
              <AppIcon name="receipt-long" size={18} color={color.blue} />
            </View>
            <View>
              <AppText variant="bold" style={styles.paymentTitle}>
                Bayar Cicilan
              </AppText>
              <AppText style={styles.paymentSubtitle}>Angsuran Ke-{item.installment_sequence}</AppText>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
            <AppText variant="semiBold" style={[styles.badgeText, { color: statusColor }]}>
              {item.payment_status.toUpperCase()}
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Nominal Pembayaran</AppText>
            <AppText variant="bold" style={styles.detailValue}>
              Rp {formatCurrency(item.amount)}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Metode Pembayaran</AppText>
            <AppText variant="semiBold" style={styles.detailValue}>
              {item.payment_method.toUpperCase()}
            </AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText style={styles.detailLabel}>Tanggal Transaksi</AppText>
            <AppText style={styles.detailValue}>{formatTransactionDate(item.payment_date)}</AppText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppLayout scrollable={false}>
      <View style={styles.headerContainer}>
        <AppText variant="bold" style={styles.headerTitle}>
          Riwayat Transaksi
        </AppText>
        <AppText style={styles.headerSubtitle}>Pantau semua riwayat pinjaman & pembayaran Anda</AppText>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'loans' && styles.activeTabButton]} onPress={() => handleTabChange('loans')}>
          <AppText variant={activeTab === 'loans' ? 'semiBold' : 'regular'} style={[styles.tabText, activeTab === 'loans' && styles.activeTabText]}>
            Pinjaman
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'payments' && styles.activeTabButton]} onPress={() => handleTabChange('payments')}>
          <AppText
            variant={activeTab === 'payments' ? 'semiBold' : 'regular'}
            style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Pembayaran
          </AppText>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.listContainer}>
          {skeletonData.slice(0, 3).map((_, idx) => (
            <SkeletonCard key={idx} style={{ marginBottom: 15 }} />
          ))}
        </View>
      ) : activeTab === 'loans' ? (
        <FlatList
          data={loans}
          keyExtractor={item => item.id}
          renderItem={renderLoanItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistoryData(activeTab, true)} colors={[color.blue]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="credit-card" size={48} color={color.neutral} />
              <AppText style={styles.emptyText}>Belum ada riwayat pinjaman.</AppText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistoryData(activeTab, true)} colors={[color.blue]} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="receipt" size={48} color={color.neutral} />
              <AppText style={styles.emptyText}>Belum ada riwayat pembayaran.</AppText>
            </View>
          }
        />
      )}
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    color: color.black,
  },
  headerSubtitle: {
    fontSize: 12,
    color: color.neutral,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: color.white,
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: color.blue,
  },
  tabText: {
    fontSize: 14,
    color: color.neutral,
  },
  activeTabText: {
    color: color.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanSequenceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanTitle: {
    fontSize: 15,
    color: color.black,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: color.black,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 11,
    color: color.neutral,
  },
  paymentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 14,
    color: color.black,
  },
  paymentSubtitle: {
    fontSize: 11,
    color: color.neutral,
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: color.neutral,
  },
  detailValue: {
    fontSize: 12,
    color: color.black,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    color: color.neutral,
    fontSize: 13,
    marginTop: 10,
  },
});

export default HistoryScreen;
