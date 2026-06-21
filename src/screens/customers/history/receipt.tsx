import { customerPaymentDetailsFetched } from '@/api/customer';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { formatCurrency, formatTransactionDate } from '@/lib/formatter';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Share, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Config from 'react-native-config';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RouteParamList, 'PaymentReceipt'>;

const PaymentReceiptScreen = ({ route, navigation }: Props) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const modal = useModal();

  useEffect(() => {
    customerPaymentDetailsFetched({ paymentId, setData: setPayment, setLoading, modal });
  }, [paymentId]);

  const handleDownload = async () => {
    if (!payment?.download_url) return;
    try {
      await Linking.openURL(payment.download_url);
    } catch (error) {
      modal.result.error('Gagal Mengunduh', 'Tidak dapat membuka tautan unduhan bukti pembayaran.');
    }
  };

  const handleShare = async () => {
    if (!payment?.download_url) return;
    try {
      const message =
        `Bukti Pembayaran Angsuran Koperasi BJB\n\n` +
        `Nama Nasabah: ${payment.customer_name}\n` +
        `No. Anggota: ${payment.member_number}\n` +
        `ID Transaksi: ${payment.id}\n` +
        `Angsuran Ke: ${payment.installment_sequence}\n` +
        `Nominal: Rp ${formatCurrency(payment.amount)}\n` +
        `Metode: ${payment.payment_method.toUpperCase()}\n` +
        `Tanggal: ${formatTransactionDate(payment.payment_date)}\n` +
        `Status: ${payment.payment_status.toUpperCase()}\n\n` +
        `Unduh PDF Bukti Pembayaran:\n${payment.download_url}`;

      await Share.share({
        message,
      });
    } catch (error) {
      modal.result.error('Gagal Membagikan', 'Tidak dapat membagikan bukti pembayaran.');
    }
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
          Bukti Pembayaran
        </AppText>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat bukti pembayaran...</AppText>
        </View>
      ) : payment ? (
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.receiptCard}>
              {/* Koperasi BJB Header */}
              <View style={styles.cardHeader}>
                <AppIcon name="verified" size={28} color="green" />
                <AppText variant="bold" style={styles.koperasiName}>
                  KOPERASI BJB
                </AppText>
                <AppText style={styles.koperasiSubtitle}>PT. BARE JAYA BERDIKARI</AppText>
              </View>

              <View style={styles.dividerDotted} />

              {/* Nominal */}
              <View style={styles.nominalContainer}>
                <AppText style={styles.nominalLabel}>Jumlah Pembayaran</AppText>
                <AppText variant="bold" style={styles.nominalValue}>
                  Rp {formatCurrency(payment.amount)}
                </AppText>
                <View style={styles.statusBadge}>
                  <AppText variant="bold" style={styles.statusText}>
                    {payment.payment_status.toUpperCase()}
                  </AppText>
                </View>
              </View>

              <View style={styles.dividerSolid} />

              {/* Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>ID Transaksi</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText} numberOfLines={1}>
                    {payment.id}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>No. Anggota</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.member_number}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Nama Nasabah</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.customer_name}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Pinjaman Ke</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.loan_sequence}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Angsuran Ke</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.installment_sequence}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Metode Pembayaran</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.payment_method.toUpperCase()}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Tanggal Transaksi</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {formatTransactionDate(payment.payment_date)}
                  </AppText>
                </View>
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Diterima Oleh</AppText>
                  <AppText variant="semiBold" style={styles.detailValueText}>
                    {payment.collected_by}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.actionContainer}>
              <Button title="Unduh PDF" type="default" size="medium" onPress={handleDownload} style={styles.downloadBtn} />
              <Button title="Bagikan" type="outline" size="medium" onPress={handleShare} style={styles.shareBtn} />
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <AppIcon name="error" size={48} color={color.tertiary} />
          <AppText style={styles.errorText}>Gagal mengambil data bukti pembayaran.</AppText>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaymentReceiptScreen;

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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  receiptCard: {
    backgroundColor: color.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  koperasiName: {
    fontSize: 18,
    color: color.primary,
    marginTop: 6,
  },
  koperasiSubtitle: {
    fontSize: 10,
    color: color.neutral,
    fontWeight: '500',
  },
  dividerDotted: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 16,
  },
  nominalContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  nominalLabel: {
    fontSize: 12,
    color: color.neutral,
    marginBottom: 4,
  },
  nominalValue: {
    fontSize: 28,
    color: color.black,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    color: 'green',
  },
  dividerSolid: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: color.neutral,
    flex: 1,
  },
  detailValueText: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'right',
    flex: 2,
  },
  actionContainer: {
    gap: 12,
    marginVertical: 10,
  },
  downloadBtn: {
    width: '100%',
  },
  shareBtn: {
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    color: color.neutral,
    textAlign: 'center',
  },
});
