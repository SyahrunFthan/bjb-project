import { fetchCustomerLoanDetails } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { formatCurrency, formatDueDate } from '@/lib/formatter';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RouteParamList, 'LoanItem'>;

const LoanItemScreen = ({ route, navigation }: Props) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const modal = useModal();

  useEffect(() => {
    fetchCustomerLoanDetails(loanId, setLoan, setLoading, modal);
  }, [loanId]);

  const installments = loan?.installments || [];
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter((ins: any) => ins.status === 'paid').length;
  const progressPercent = totalInstallments > 0 ? paidInstallments / totalInstallments : 0;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bg: '#EBFDF2',
          text: '#097939',
          label: 'Lunas',
        };
      case 'partially_paid':
        return {
          bg: '#EBF5FF',
          text: '#1D4ED8',
          label: 'Sebagian',
        };
      case 'overdue':
        return {
          bg: '#FDF2F2',
          text: '#970029',
          label: 'Terlambat',
        };
      default:
        return {
          bg: '#FFFDF0',
          text: '#B78C00',
          label: 'Belum Bayar',
        };
    }
  };

  const getLoanStatusLabel = (status: string) => {
    if (status === 'active') return 'Aktif';
    if (status === 'done') return 'Lunas';
    if (status === 'closed') return 'Selesai';
    return status || '-';
  };

  const getLoanStatusColor = (status: string) => {
    if (status === 'active') return color.blue;
    if (status === 'done') return 'green';
    return color.neutral;
  };

  const renderInstallmentItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    const sisa = Number(item.amount) - Number(item.paid_amount || 0);

    return (
      <View style={styles.installmentCard}>
        <View style={styles.installmentHeader}>
          <View style={styles.installmentTitleBox}>
            <AppIcon name="receipt" size={16} color={color.neutral} />
            <AppText variant="bold" style={styles.installmentTitle}>
              Angsuran Ke-{item.sequence_number}
            </AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <AppText variant="semiBold" style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </AppText>
          </View>
        </View>

        <View style={styles.installmentDivider} />

        <View style={styles.installmentDetails}>
          <View style={styles.detailItem}>
            <AppText style={styles.detailLabel}>
              {item.status === 'paid' || (item.paid_amount && Number(item.paid_amount) > 0) ? 'Sisa Tagihan' : 'Nominal'}
            </AppText>
            <AppText variant="semiBold" style={styles.detailValue}>
              Rp {item.status === 'paid' ? '0' : formatCurrency(sisa)}
            </AppText>
            {item.status === 'paid' ? (
              <AppText style={{ fontSize: 9, color: color.neutral, marginTop: 2 }}>
                Dibayar: Rp {formatCurrency(item.amount)} / Rp {formatCurrency(item.amount)}
              </AppText>
            ) : item.paid_amount && Number(item.paid_amount) > 0 ? (
              <AppText style={{ fontSize: 9, color: color.neutral, marginTop: 2 }}>
                Dibayar: Rp {formatCurrency(item.paid_amount)} / Rp {formatCurrency(item.amount)}
              </AppText>
            ) : null}
          </View>
          <View style={styles.detailItem}>
            <AppText style={styles.detailLabel}>Jatuh Tempo</AppText>
            <AppText style={styles.detailValue}>
              {formatDueDate(item.due_date)}
            </AppText>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (!loan) return null;
    const loanStatusColor = getLoanStatusColor(loan.loan_status);

    return (
      <View style={styles.summaryContainer}>
        {/* Loan Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <AppText variant="bold" style={styles.summaryTitle}>
              Pinjaman Ke-{loan.loan_sequence_number}
            </AppText>
            <View style={[styles.statusBadge, { backgroundColor: loanStatusColor + '15' }]}>
              <AppText variant="bold" style={[styles.statusText, { color: loanStatusColor }]}>
                {getLoanStatusLabel(loan.loan_status)}
              </AppText>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryGrid}>
            <View style={styles.gridCol}>
              <AppText style={styles.gridLabel}>Jumlah Pokok</AppText>
              <AppText variant="semiBold" style={styles.gridValue}>
                Rp {formatCurrency(loan.amount)}
              </AppText>
            </View>
            <View style={styles.gridCol}>
              <AppText style={styles.gridLabel}>Total Pengembalian</AppText>
              <AppText variant="semiBold" style={styles.gridValue}>
                Rp {formatCurrency(loan.total_amount)}
              </AppText>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.gridCol}>
              <AppText style={styles.gridLabel}>Sisa Tagihan</AppText>
              <AppText variant="bold" style={[styles.gridValue, { color: color.tertiary }]}>
                Rp {formatCurrency(loan.remaining_amount)}
              </AppText>
            </View>
            <View style={styles.gridCol}>
              <AppText style={styles.gridLabel}>Cicilan Bulanan</AppText>
              <AppText variant="semiBold" style={styles.gridValue}>
                Rp {formatCurrency(loan.installment_amount)} ({loan.tenor?.name || '-'})
              </AppText>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <AppText style={styles.progressLabel}>Kemajuan Pelunasan</AppText>
              <AppText variant="semiBold" style={styles.progressCount}>
                {paidInstallments} dari {totalInstallments} Cicilan
              </AppText>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
            </View>
          </View>
        </View>

        <AppText variant="bold" style={styles.sectionTitle}>
          Daftar Angsuran
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">
          Detail Cicilan
        </AppText>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat detail cicilan...</AppText>
        </View>
      ) : (
        <FlatList
          data={installments}
          keyExtractor={item => item.id}
          renderItem={renderInstallmentItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="receipt" size={48} color={color.neutral} />
              <AppText style={styles.emptyText}>Tidak ada data angsuran.</AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default LoanItemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: color.black,
  },
  headerPlaceholder: {
    width: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: color.neutral,
    fontSize: 13,
  },
  summaryContainer: {
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    color: color.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    color: color.black,
  },
  progressContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: color.neutral,
  },
  progressCount: {
    fontSize: 12,
    color: color.primary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: color.blue,
  },
  sectionTitle: {
    fontSize: 15,
    color: color.black,
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  installmentCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  installmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  installmentTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installmentTitle: {
    fontSize: 13,
    color: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
  },
  installmentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  installmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: '#334155',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: color.neutral,
    fontSize: 13,
  },
});
