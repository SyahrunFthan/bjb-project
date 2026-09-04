import { collectPayment, fetchLoanDetails } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import CollectionBillCard from '@/components/couriers/collections/CollectionBillCard';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import SectionCard from '@/components/ui/SectionCard';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { Installment, Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'all' | 'unpaid' | 'partially_paid' | 'paid';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'partially_paid', label: 'Sebagian' },
  { key: 'paid', label: 'Lunas' },
];

const CourierCollectionDetailScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollectionDetail'> }) => {
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

  const fetchData = useCallback(() => {
    fetchLoanDetails(loanId, setLoan, setLoading, modal);
  }, [loanId, modal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = (installment: Installment) => {
    setSelectedInstallment(installment);
    const sisa = Math.round(Number(installment.amount) - Number(installment.paid_amount || 0));
    setPayAmountInput(String(sisa));
    setPayDate(dayjs().format('YYYY-MM-DD'));
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
        payment_method: 'courier',
        payment_date: payDate,
      },
      modal,
      setProcessing,
      fetchData,
    );
  };

  const filteredInstallments = (loan?.installments || []).filter(item => {
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

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Detail Tagihan & Pembayaran</AppText>
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
              <SectionCard icon="person" iconBg="#DBEAFE" iconColor="#1D4ED8" title="Informasi Nasabah">
                <View style={styles.customerDetail}>
                  <AppText variant="bold" style={styles.custName}>
                    {loan.customer?.full_name}
                  </AppText>
                  <AppText style={styles.custMeta}>No. Anggota: {loan.customer?.member_number}</AppText>
                  <AppText style={styles.custMeta}>No. HP: {loan.customer?.phone_number}</AppText>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <View>
                      <AppText style={styles.label}>Sisa Pinjaman</AppText>
                      <AppText variant="semiBold" style={styles.remainingVal}>
                        Rp {formatCurrency(loan.remaining_amount)}
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText style={styles.label}>Total Pinjaman</AppText>
                      <AppText variant="medium" style={styles.totalVal}>
                        Rp {formatCurrency(loan.total_amount)}
                      </AppText>
                    </View>
                  </View>
                </View>
              </SectionCard>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {FILTER_OPTIONS.map(f => (
                  <TouchableOpacity
                    key={f.key}
                    style={[styles.chip, activeFilter === f.key && styles.chipActive]}
                    onPress={() => setActiveFilter(f.key)}
                    activeOpacity={0.7}>
                    <AppText style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>{f.label}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>Tidak ada data angsuran untuk filter ini.</AppText>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <CollectionBillCard item={item as Installment} loading={loading} onPay={handlePay} processing={processing} key={item.id} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

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
                <AppText style={styles.modalInfoVal}>{selectedInstallment ? `Rp ${formatCurrency(selectedInstallment.amount)}` : 'Rp 0'}</AppText>
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
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setPayModalVisible(false)} activeOpacity={0.7}>
                <AppText style={styles.modalBtnCancelText}>Batal</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={submitPay} activeOpacity={0.7}>
                <AppText style={styles.modalBtnConfirmText}>Bayar</AppText>
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
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: color.neutral,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4FA',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F0F4FA',
  },
  customerDetail: {
    gap: 4,
  },
  custName: {
    fontSize: 16,
    color: color.black,
  },
  custMeta: {
    fontSize: 12,
    color: color.neutral,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: color.neutral,
  },
  remainingVal: {
    fontSize: 18,
    color: '#B91C1C',
  },
  totalVal: {
    fontSize: 14,
    color: color.black,
  },
  headerComponent: {
    gap: 12,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: color.border,
  },
  emptyText: {
    fontSize: 13,
    color: color.neutral,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    color: color.black,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: color.neutral,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  modalInfoContainer: {
    backgroundColor: '#F0F4FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: color.neutral,
  },
  modalInfoVal: {
    fontSize: 12,
    color: color.black,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F0F4FA',
    borderWidth: 0.5,
    borderColor: color.border,
  },
  modalBtnCancelText: {
    color: color.neutral,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnConfirm: {
    backgroundColor: color.primary,
  },
  modalBtnConfirmText: {
    color: color.white,
    fontSize: 14,
    fontWeight: '600',
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: color.black,
  },
  dateSelectionContainer: {
    marginBottom: 14,
  },
  dateSelectionLabel: {
    fontSize: 12,
    color: color.neutral,
    marginBottom: 6,
  },
  dateChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: color.border,
    backgroundColor: '#F8FAFC',
  },
  dateChipActive: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: color.neutral,
  },
  dateChipTextActive: {
    color: color.white,
    fontWeight: '600',
  },
});
