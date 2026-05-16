import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

const DashboardScreen = () => {
  return (
    <AppLayout scrollable={true}>
      <View style={styles.mainCard}>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="regular" style={styles.labelLight}>
              Total Pinjaman Aktif
            </AppText>
            <AppText variant="bold" style={styles.valueLight}>
              Rp 10.000.000
            </AppText>
          </View>

          <View style={styles.badgePremium}>
            <AppText variant="bold" style={styles.textBadge}>
              Premium Member
            </AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetweenAlignCenter}>
          <View>
            <AppText style={styles.labelLight}>Sisa Tagihan</AppText>
            <AppText variant="semiBold" style={styles.valueLight}>
              Rp 4.250.000
            </AppText>
          </View>

          <View style={styles.alignCenter}>
            <AppText style={styles.labelLight}>Jatuh Tempo</AppText>
            <AppText variant="semiBold" style={styles.valueLight}>
              20 Des 2025
            </AppText>
          </View>
        </View>

        <View style={styles.infoBox}>
          <AppIcon name="calendar-today" size={20} color={color.white} />
          <AppText variant="semiBold" style={styles.textInfo}>
            Cicilan berikutnya: Rp. 850.000
          </AppText>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.progressBox}>
          <AppText variant="bold" style={styles.textProgress}>
            75%
          </AppText>
        </View>

        <View style={styles.flex1}>
          <AppText variant="semiBold" style={styles.statusTitle}>
            Status Pembayaran
          </AppText>

          <AppText style={styles.statusDesc}>Langkah bagus! 9 dari 12 cicilan anda telah terbayar.</AppText>

          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="semiBold" style={styles.sectionTitle}>
          Transaksi Terakhir
        </AppText>

        <TouchableOpacity>
          <AppText variant="semiBold" style={styles.seeAllText}>
            Lihat Semua
          </AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[1, 2, 3, 4]}
        scrollEnabled={false}
        renderItem={() => {
          return (
            <View style={styles.transactionItem}>
              <View style={styles.iconContainer}>
                <AppIcon name="receipt-long" size={16} color={color.blue} />
              </View>

              <View style={styles.flex1}>
                <AppText style={styles.transactionTitle}>Bayar Cicilan</AppText>
                <AppText style={styles.transactionDate}>20 Des 2025 • 14:20</AppText>
              </View>

              <View>
                <AppText style={styles.transactionAmount} variant="semiBold">
                  - Rp 850.000
                </AppText>
                <AppText style={styles.transactionStatus}>Berhasil</AppText>
              </View>
            </View>
          );
        }}
      />
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  mainCard: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: color.blue,
    marginBottom: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowBetweenAlignCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelLight: {
    fontSize: 12,
    color: color.light,
  },
  valueLight: {
    fontSize: 18,
    color: color.light,
  },
  badgePremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textBadge: {
    fontSize: 10,
    color: color.white,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: color.light,
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  alignCenter: {
    alignSelf: 'center',
  },
  infoBox: {
    backgroundColor: color.light + 40,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInfo: {
    fontSize: 12,
    color: color.white,
  },
  statusCard: {
    padding: 15,
    backgroundColor: color.white,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  progressBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: color.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: color.blue + '30',
  },
  textProgress: {
    color: color.blue,
    fontSize: 16,
  },
  flex1: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 12,
    color: color.neutral,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: color.blue,
    width: '75%',
    borderRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
  },
  seeAllText: {
    fontSize: 12,
    color: color.blue,
  },
  transactionItem: {
    marginBottom: 5,
    padding: 12,
    backgroundColor: color.white,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: color.light,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: {
    maxWidth: 150,
  },
  transactionDate: {
    fontSize: 12,
    color: color.neutral,
  },
  transactionAmount: {
    fontSize: 12,
    color: color.tertiary,
    textAlign: 'right',
  },
  transactionStatus: {
    color: color.success,
    fontSize: 12,
    textAlign: 'right',
  },
});

export default DashboardScreen;
