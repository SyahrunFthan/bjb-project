import { collectPayment, fetchLoanDetails } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import CollectionBillCard from '@/components/couriers/collections/CollectionBillCard';
import AppIcon from '@/components/Icon';
import SectionCard from '@/components/ui/SectionCard';
import { useModal } from '@/hooks/useModal';
import { formatCurrency } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { Installment, Loan } from '@/model/loan';
import { RouteParamList } from '@/types/navigation';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CourierCollectionDetailScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'CourierCollectionDetail'> }) => {
  const route = useRoute();
  const { loanId } = route.params as { loanId: string };
  const modal = useModal();

  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [loan, setLoan] = useState<Loan | null>(null);

  const fetchData = useCallback(() => {
    fetchLoanDetails(loanId, setLoan, setLoading, modal);
  }, [loanId, modal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePay = (installment: Installment) => {
    modal.confirm.show(
      'Konfirmasi Pembayaran',
      `Tandai pembayaran angsuran ke-${installment.sequence_number} senilai ${formatCurrency(installment.amount)} sudah dibayar tunai?`,
      () => {
        collectPayment(
          {
            installment_id: installment.id,
            amount: installment.amount,
            payment_method: 'courier',
          },
          modal,
          setProcessing,
          fetchData,
        );
      },
    );
  };

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
        data={loading ? skeletonData : loan?.installments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={[color.primary]} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          loan ? (
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
                      {formatCurrency(loan.remaining_amount)}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText style={styles.label}>Total Pinjaman</AppText>
                    <AppText variant="medium" style={styles.totalVal}>
                      {formatCurrency(loan.total_amount)}
                    </AppText>
                  </View>
                </View>
              </View>
            </SectionCard>
          ) : null
        }
        renderItem={({ item }) => (
          <CollectionBillCard item={item as Installment} loading={loading} onPay={handlePay} processing={processing} key={item.id} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
});
