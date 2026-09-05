import { collectPayment, fetchLoanDetails } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import CollectionBillCard from '@/components/couriers/collections/CollectionBillCard';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { Installment, Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

dayjs.locale('id');

type FilterType = 'all' | 'unpaid' | 'partially_paid' | 'paid';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'partially_paid', label: 'Sebagian' },
  { key: 'paid', label: 'Lunas' },
];

const CourierCollectionDetailScreen = ({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollectionDetail'>;
}) => {
  const route = useRoute();
  const { loanId } = route.params as { loanId: string };
  const modal = useModal();

  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const [payModalVisible, setPayModalVisible] = useState<boolean>(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [payMethod, setPayMethod] = useState<'courier' | 'transfer'>('courier');

  const fetchData = useCallback(() => {
    fetchLoanDetails(loanId, setLoan, setLoading, modal);
  }, [loanId, modal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = (installment: Installment) => {
    setSelectedInstallment(installment);
    const sisa = Math.max(0, Math.round(Number(installment.amount) - Number(installment.paid_amount || 0)));
    setPayAmountInput(String(sisa));
    setPayDate(dayjs().format('YYYY-MM-DD'));
    setPayMethod('courier');
    setPayModalVisible(true);
  };

  const submitPay = () => {
    if (!selectedInstallment) return;
    const amountVal = Number(payAmountInput);
    if (isNaN(amountVal) || amountVal <= 0) {
      modal.result.error('Input Tidak Valid', 'Nominal pembayaran harus lebih dari 0.');
      return;
    }
    setPayModalVisible(false);

    collectPayment(
      {
        installment_id: selectedInstallment.id,
        amount: amountVal,
        payment_method: payMethod,
        payment_date: payDate,
      },
      modal,
      setProcessing,
      fetchData,
    );
  };

  const handleCall = () => {
    if (!loan?.customer?.phone_number) return;
    Linking.openURL(`tel:${loan.customer.phone_number}`);
  };

  const handleWhatsApp = () => {
    if (!loan?.customer?.phone_number) return;
    const cleanPhone = loan.customer.phone_number.replace(/^0/, '62').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Halo Ibu/Bapak ${loan.customer.full_name || ''}, kami dari Koperasi menginfokan terkait pinjaman Anda.`,
    );
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  const handleViewReceipt = (paymentId: string) => {
    navigation.navigate('PaymentReceipt', { paymentId });
  };

  // Calculations
  const installments = (loan?.installments || []) as Installment[];
  const totalCount = installments.length;

  const paidCount = installments.filter(item => {
    const instAmount = Number(item.amount || 0);
    const instPaidAmount = Number(item.paid_amount || 0);
    return item.status === 'paid' || (instAmount > 0 && instAmount - instPaidAmount < 1.0);
  }).length;

  const partiallyPaidCount = installments.filter(item => {
    const instAmount = Number(item.amount || 0);
    const instPaidAmount = Number(item.paid_amount || 0);
    const isFullyPaid = item.status === 'paid' || (instAmount > 0 && instAmount - instPaidAmount < 1.0);
    return !isFullyPaid && instPaidAmount > 0;
  }).length;

  const unpaidCount = Math.max(0, totalCount - paidCount - partiallyPaidCount);

  const totalAmount = Number(loan?.total_amount || 0);
  const remainingAmount = Number(loan?.remaining_amount || 0);
  const principalAmount = Number(loan?.amount || 0);
  const totalPaid = Math.max(0, totalAmount - remainingAmount);
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  // Formatted address helper
  const getFormattedAddress = () => {
    const addr = (loan?.customer as any)?.address;
    if (!addr) return null;
    const parts = [];
    if (addr.address) parts.push(addr.address);
    if (addr.neighborhood_unit || addr.community_unit) {
      parts.push(`RT ${addr.neighborhood_unit || '-'}/RW ${addr.community_unit || '-'}`);
    }
    if (addr.sub_district?.name) parts.push(addr.sub_district.name);
    if (addr.district?.name) parts.push(addr.district.name);
    if (addr.regency?.name) parts.push(addr.regency.name);
    return parts.join(', ');
  };

  const formattedAddress = getFormattedAddress();

  const filteredInstallments = installments.filter(item => {
    const instAmount = Number(item.amount || 0);
    const instPaidAmount = Number(item.paid_amount || 0);
    const isFullyPaid =
      item.status === 'paid' ||
      (instAmount > 0 && (instAmount - instPaidAmount < 1.0 || instPaidAmount >= instAmount));

    if (activeFilter === 'paid') return isFullyPaid;
    if (activeFilter === 'partially_paid') return !isFullyPaid && instPaidAmount > 0;
    if (activeFilter === 'unpaid') return !isFullyPaid && instPaidAmount <= 0;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText variant="bold" style={styles.headerTitle}>
          Detail Tagihan & Pembayaran
        </AppText>
      </View>

      <FlatList
        data={loading ? skeletonData : filteredInstallments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[color.primary]} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          loan ? (
            <View style={styles.headerComponent}>
              {/* 🌟 1. HERO OVERVIEW CARD */}
              <View style={styles.heroCard}>
                {/* Top Badge Row */}
                <View style={styles.heroBadgeRow}>
                  <View style={styles.sequenceChip}>
                    <AppText variant="bold" style={styles.sequenceChipText}>
                      Pinjaman #{loan.loan_sequence_number || 1}
                    </AppText>
                  </View>

                  <View style={styles.statusChipsContainer}>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            loan.loan_status === 'done'
                              ? '#DCFCE7'
                              : loan.loan_status === 'closed'
                              ? '#FEE2E2'
                              : '#DBEAFE',
                        },
                      ]}>
                      <AppText
                        variant="bold"
                        style={[
                          styles.statusChipText,
                          {
                            color:
                              loan.loan_status === 'done'
                                ? '#15803D'
                                : loan.loan_status === 'closed'
                                ? '#B91C1C'
                                : '#1D4ED8',
                          },
                        ]}>
                        {loan.loan_status === 'done'
                          ? 'LUNAS'
                          : loan.loan_status === 'closed'
                          ? 'DITUTUP'
                          : 'AKTIF BERJALAN'}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Customer Identity */}
                <View style={styles.customerIdentityRow}>
                  <View style={styles.customerAvatar}>
                    <AppIcon name="person" size={24} color="#1D4ED8" />
                  </View>
                  <View style={styles.customerInfo}>
                    <AppText variant="bold" style={styles.customerName}>
                      {loan.customer?.full_name || 'Nasabah'}
                    </AppText>
                    <View style={styles.customerMetaRow}>
                      <AppText style={styles.customerMetaText}>
                        No. Anggota: {loan.customer?.member_number || '-'}
                      </AppText>
                      {loan.customer?.national_id ? (
                        <>
                          <AppText style={styles.metaDot}>•</AppText>
                          <AppText style={styles.customerMetaText}>NIK: {loan.customer.national_id}</AppText>
                        </>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Contact & Location Action Row */}
                <View style={styles.contactActionRow}>
                  {loan.customer?.phone_number && (
                    <>
                      <TouchableOpacity activeOpacity={0.8} style={styles.contactBtnWa} onPress={handleWhatsApp}>
                        <AppIcon name="chat" size={16} color="#FFFFFF" />
                        <AppText variant="semiBold" style={styles.contactBtnTextWhite}>
                          WhatsApp
                        </AppText>
                      </TouchableOpacity>

                      <TouchableOpacity activeOpacity={0.8} style={styles.contactBtnCall} onPress={handleCall}>
                        <AppIcon name="call" size={16} color="#1D4ED8" />
                        <AppText variant="semiBold" style={styles.contactBtnTextBlue}>
                          Telepon
                        </AppText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Address Snippet */}
                {formattedAddress && (
                  <View style={styles.addressBox}>
                    <AppIcon name="location-on" size={16} color="#64748B" />
                    <AppText style={styles.addressText} numberOfLines={2}>
                      {formattedAddress}
                    </AppText>
                  </View>
                )}

                <View style={styles.heroDivider} />

                {/* Financial Summary Grid (2x2 / 4-box) */}
                <View style={styles.financialGrid}>
                  <View style={styles.financialItem}>
                    <AppText style={styles.financialLabel}>Plafon Pokok</AppText>
                    <AppText variant="semiBold" style={styles.financialVal}>
                      Rp {formatCurrency(principalAmount)}
                    </AppText>
                  </View>

                  <View style={styles.financialItem}>
                    <AppText style={styles.financialLabel}>Total Tagihan</AppText>
                    <AppText variant="semiBold" style={styles.financialVal}>
                      Rp {formatCurrency(totalAmount)}
                    </AppText>
                  </View>

                  <View style={styles.financialItem}>
                    <AppText style={styles.financialLabel}>Sisa Pinjaman</AppText>
                    <AppText variant="bold" style={[styles.financialVal, { color: '#B91C1C' }]}>
                      Rp {formatCurrency(remainingAmount)}
                    </AppText>
                  </View>

                  <View style={styles.financialItem}>
                    <AppText style={styles.financialLabel}>Sudah Terbayar</AppText>
                    <AppText variant="bold" style={[styles.financialVal, { color: '#059669' }]}>
                      Rp {formatCurrency(totalPaid)}
                    </AppText>
                  </View>
                </View>

                {/* Sub-row: Angsuran harian & Tenor */}
                <View style={styles.loanContractRow}>
                  <View style={styles.contractItem}>
                    <AppIcon name="payments" size={14} color="#64748B" />
                    <AppText style={styles.contractText}>
                      Cicilan: <AppText variant="semiBold" style={{ color: '#0F172A' }}>Rp {formatCurrency(loan.installment_amount)}/hari</AppText>
                    </AppText>
                  </View>
                  <View style={styles.contractItem}>
                    <AppIcon name="timelapse" size={14} color="#64748B" />
                    <AppText style={styles.contractText}>
                      Tenor: <AppText variant="semiBold" style={{ color: '#0F172A' }}>{loan.tenor?.name || `${loan.tenor?.duration_day || 24} Hari`}</AppText>
                    </AppText>
                  </View>
                </View>

                {/* Progress Bar Pelunasan */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <AppText style={styles.progressLabel}>
                      Progress Pelunasan ({paidCount}/{totalCount} Hari)
                    </AppText>
                    <AppText variant="bold" style={styles.progressPercent}>
                      {percentPaid}%
                    </AppText>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.max(2, percentPaid)}%` }]} />
                  </View>
                </View>
              </View>

              {/* 📑 Filter Options */}
              <View style={styles.filterSection}>
                <AppText variant="semiBold" style={styles.filterSectionTitle}>
                  Daftar Angsuran ({filteredInstallments.length})
                </AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  {FILTER_OPTIONS.map(f => {
                    const countBadge =
                      f.key === 'all'
                        ? totalCount
                        : f.key === 'paid'
                        ? paidCount
                        : f.key === 'partially_paid'
                        ? partiallyPaidCount
                        : unpaidCount;

                    return (
                      <TouchableOpacity
                        key={f.key}
                        style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                        onPress={() => setActiveFilter(f.key)}
                        activeOpacity={0.7}>
                        <AppText style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
                          {f.label} ({countBadge})
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <AppIcon name="event-busy" size={36} color={color.neutral} />
              <AppText style={styles.emptyText}>Tidak ada data angsuran untuk kategori ini.</AppText>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CollectionBillCard
            item={item as Installment}
            loading={loading}
            onPay={handlePay}
            onViewReceipt={handleViewReceipt}
            processing={processing}
            key={item.id}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* 💳 Modal Catat Pembayaran */}
      <Modal visible={payModalVisible} transparent animationType="fade" onRequestClose={() => setPayModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="bold" style={styles.modalTitle}>
              Catat Pembayaran
            </AppText>
            <AppText style={styles.modalSubtitle}>Angsuran Ke-{selectedInstallment?.sequence_number}</AppText>

            <View style={styles.modalInfoContainer}>
              <View style={styles.modalInfoRow}>
                <AppText style={styles.modalInfoLabel}>Total Tagihan:</AppText>
                <AppText style={styles.modalInfoVal}>
                  {selectedInstallment ? `Rp ${formatCurrency(selectedInstallment.amount)}` : 'Rp 0'}
                </AppText>
              </View>
              {selectedInstallment && selectedInstallment.paid_amount && selectedInstallment.paid_amount > 0 ? (
                <View style={styles.modalInfoRow}>
                  <AppText style={styles.modalInfoLabel}>Telah Dibayar:</AppText>
                  <AppText style={styles.modalInfoVal}>Rp {formatCurrency(selectedInstallment.paid_amount)}</AppText>
                </View>
              ) : null}
              <View style={styles.modalInfoRow}>
                <AppText style={styles.modalInfoLabel}>Sisa Tagihan:</AppText>
                <AppText variant="semiBold" style={[styles.modalInfoVal, { color: color.primary }]}>
                  {selectedInstallment
                    ? `Rp ${formatCurrency(Number(selectedInstallment.amount) - Number(selectedInstallment.paid_amount || 0))}`
                    : 'Rp 0'}
                </AppText>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.dateSelectionContainer}>
              <AppText style={styles.dateSelectionLabel}>Tanggal Penagihan:</AppText>
              <View style={styles.dateChipRow}>
                <TouchableOpacity
                  style={[styles.dateChip, payDate === dayjs().format('YYYY-MM-DD') && styles.dateChipActive]}
                  onPress={() => setPayDate(dayjs().format('YYYY-MM-DD'))}
                  activeOpacity={0.7}>
                  <AppText style={[styles.dateChipText, payDate === dayjs().format('YYYY-MM-DD') && styles.dateChipTextActive]}>
                    Hari Ini ({dayjs().format('DD/MM')})
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateChip, payDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD') && styles.dateChipActive]}
                  onPress={() => setPayDate(dayjs().subtract(1, 'day').format('YYYY-MM-DD'))}
                  activeOpacity={0.7}>
                  <AppText style={[styles.dateChipText, payDate === dayjs().subtract(1, 'day').format('YYYY-MM-DD') && styles.dateChipTextActive]}>
                    Kemarin ({dayjs().subtract(1, 'day').format('DD/MM')})
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.methodSelectionContainer}>
              <AppText style={styles.dateSelectionLabel}>Metode Pembayaran:</AppText>
              <View style={styles.dateChipRow}>
                <TouchableOpacity
                  style={[styles.dateChip, payMethod === 'courier' && styles.dateChipActive]}
                  onPress={() => setPayMethod('courier')}
                  activeOpacity={0.7}>
                  <AppText style={[styles.dateChipText, payMethod === 'courier' && styles.dateChipTextActive]}>
                    Tunai (Petugas)
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dateChip, payMethod === 'transfer' && styles.dateChipActive]}
                  onPress={() => setPayMethod('transfer')}
                  activeOpacity={0.7}>
                  <AppText style={[styles.dateChipText, payMethod === 'transfer' && styles.dateChipTextActive]}>
                    Transfer Bank
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            <Input
              label="Nominal Pembayaran"
              value={payAmountInput ? formatCurrency(Number(payAmountInput)) : ''}
              onChangeText={val => {
                const cleanNum = val.replace(/[^0-9]/g, '');
                setPayAmountInput(cleanNum);
              }}
              keyboardType="numeric"
              placeholder="Masukkan nominal bayar"
              leftIcon={<AppText style={styles.prefixText}>Rp</AppText>}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setPayModalVisible(false)}
                activeOpacity={0.7}>
                <AppText style={styles.modalBtnCancelText}>Batal</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={submitPay} activeOpacity={0.7}>
                <AppText style={styles.modalBtnConfirmText}>Simpan Pembayaran</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CourierCollectionDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: color.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerComponent: {
    marginBottom: 14,
  },

  /* 🌟 HERO CARD */
  heroCard: {
    backgroundColor: color.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sequenceChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  sequenceChipText: {
    color: '#1D4ED8',
    fontSize: 11,
  },
  statusChipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 10,
  },
  customerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    color: '#0F172A',
  },
  customerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  customerMetaText: {
    fontSize: 11,
    color: color.neutral,
  },
  metaDot: {
    color: color.neutral,
    fontSize: 11,
  },
  contactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  contactBtnWa: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  contactBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  contactBtnTextBlue: {
    color: '#1D4ED8',
    fontSize: 12,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressText: {
    flex: 1,
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  financialItem: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  financialLabel: {
    fontSize: 10,
    color: color.neutral,
    marginBottom: 2,
  },
  financialVal: {
    fontSize: 13,
    color: '#0F172A',
  },
  loanContractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  contractItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contractText: {
    fontSize: 11,
    color: color.neutral,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#475569',
  },
  progressPercent: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  progressTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },

  /* 📑 FILTER */
  filterSection: {
    marginTop: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  chipText: {
    fontSize: 11,
    color: '#64748B',
  },
  chipTextActive: {
    color: color.white,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: color.neutral,
    fontSize: 13,
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    color: color.black,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: color.neutral,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  modalInfoContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: color.neutral,
  },
  modalInfoVal: {
    fontSize: 12,
    color: color.black,
  },
  dateSelectionContainer: {
    marginBottom: 12,
  },
  methodSelectionContainer: {
    marginBottom: 14,
  },
  dateSelectionLabel: {
    fontSize: 11,
    color: color.neutral,
    marginBottom: 6,
  },
  dateChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  dateChipActive: {
    borderColor: color.primary,
    backgroundColor: '#EFF6FF',
  },
  dateChipText: {
    fontSize: 11,
    color: '#64748B',
  },
  dateChipTextActive: {
    color: color.primary,
    fontWeight: '700',
  },
  prefixText: {
    fontSize: 14,
    color: color.neutral,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F1F5F9',
  },
  modalBtnCancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  modalBtnConfirm: {
    backgroundColor: color.primary,
  },
  modalBtnConfirmText: {
    fontSize: 13,
    color: color.white,
    fontWeight: '700',
  },
});
