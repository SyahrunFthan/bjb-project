import { authSendEmailVerification } from '@/api/auth';
import { customerDashboardFetched } from '@/api/customer';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { formatCurrency, formatDueDate, formatTransactionDate } from '@/lib/formatter';
import { skeletonData } from '@/lib/utils';
import { CustomerDashboardData } from '@/model/dashboard';
import { CustomerRouteParamList } from '@/types/navigation';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DashboardScreenProps {
  navigation: BottomTabNavigationProp<CustomerRouteParamList, 'Dashboard'>;
}

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
  const { auth, setAuth } = useAuth();
  const modal = useModal();
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendVerification = () => {
    authSendEmailVerification({
      modal,
      setSending: setSendingEmail,
    });
  };

  const fetchDashboardData = useCallback(
    (isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      }
      customerDashboardFetched({ setData: setDashboardData, setLoading, modal, setRefreshing, setAuth });
    },
    [modal, setAuth],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !refreshing) {
    return (
      <AppLayout scrollable={false}>
        <SkeletonCard style={{ marginBottom: 15 }} />

        <SkeletonCard style={{ marginBottom: 15 }} />

        <View style={styles.sectionHeader}>
          <AppText variant="semiBold" style={styles.sectionTitle}>
            Transaksi Terakhir
          </AppText>

          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <AppText variant="semiBold" style={styles.seeAllText}>
              Lihat Semua
            </AppText>
          </TouchableOpacity>
        </View>

        {skeletonData.map((_, idx) => (
          <SkeletonCard key={idx} style={{ marginBottom: 10 }} />
        ))}
      </AppLayout>
    );
  }

  const hasActiveLoan = dashboardData && dashboardData.stats.totalActiveLoan > 0;

  return (
    <AppLayout
      scrollable={true}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboardData(true)} colors={[color.blue]} />}>
      {!auth?.email_verified_at && (
        <View style={styles.emailAlert}>
          <View style={styles.emailAlertLeft}>
            <View style={styles.emailAlertIconContainer}>
              <AppIcon name="mail-lock" size={20} color={color.yellow} />
            </View>
          </View>

          <View style={styles.emailAlertRight}>
            <AppText variant="semiBold" style={styles.emailAlertTitle}>
              Verifikasi Email Diperlukan
            </AppText>
            <AppText style={styles.emailAlertSubtitle}>
              Anda belum melakukan verifikasi email. Silakan verifikasi untuk mengamankan dan menikmati semua fitur akun Anda.
            </AppText>

            <TouchableOpacity style={styles.emailAlertButton} onPress={handleSendVerification} disabled={sendingEmail}>
              <AppText variant="medium" style={styles.emailAlertButtonText}>
                {sendingEmail ? 'Mengirim...' : 'Kirim Verifikasi Email'}
              </AppText>
              <AppIcon name="arrow-forward" size={14} color={color.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.welcomeContainer}>
        <AppText variant="bold" style={styles.welcomeText}>
          Halo, {dashboardData?.customer?.full_name || 'Nasabah'}
        </AppText>
        <AppText style={styles.subWelcomeText}>Selamat datang kembali di Koperasi BJB</AppText>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="regular" style={styles.labelLight}>
              Total Pinjaman Aktif
            </AppText>
            <AppText variant="bold" style={styles.valueLight}>
              Rp {formatCurrency(dashboardData?.stats?.totalActiveLoan || 0)}
            </AppText>
          </View>

          {dashboardData?.customer?.status === 'priority' && (
            <View style={styles.badgePremium}>
              <AppText variant="bold" style={styles.textBadge}>
                Premium Member
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetweenAlignCenter}>
          <View>
            <AppText style={styles.labelLight}>Sisa Tagihan</AppText>
            <AppText variant="semiBold" style={styles.valueLight}>
              Rp {formatCurrency(dashboardData?.stats?.totalRemainingAmount || 0)}
            </AppText>
          </View>

          <View style={styles.alignCenter}>
            <AppText style={styles.labelLight}>Jatuh Tempo</AppText>
            <AppText variant="semiBold" style={styles.valueLight}>
              {formatDueDate(dashboardData?.nextInstallment?.dueDate || null)}
            </AppText>
          </View>
        </View>

        {hasActiveLoan && dashboardData?.nextInstallment?.amount ? (
          <View style={styles.infoBox}>
            <AppIcon name="calendar-today" size={20} color={color.white} />
            <AppText variant="semiBold" style={styles.textInfo}>
              Cicilan berikutnya: Rp. {formatCurrency(dashboardData.nextInstallment.amount)}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.statusCard}>
        <View style={styles.progressBox}>
          <AppText variant="bold" style={styles.textProgress}>
            {dashboardData?.progress?.progressPercentage || 0}%
          </AppText>
        </View>

        <View style={styles.flex1}>
          <AppText variant="semiBold" style={styles.statusTitle}>
            Status Pembayaran
          </AppText>

          <AppText style={styles.statusDesc}>{dashboardData?.progress?.progressMessage || 'Anda belum memiliki pinjaman aktif.'}</AppText>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${dashboardData?.progress?.progressPercentage || 0}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="semiBold" style={styles.sectionTitle}>
          Transaksi Terakhir
        </AppText>

        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <AppText variant="semiBold" style={styles.seeAllText}>
            Lihat Semua
          </AppText>
        </TouchableOpacity>
      </View>

      {dashboardData?.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
        <FlatList
          data={dashboardData.recentTransactions}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            return (
              <View style={styles.transactionItem}>
                <View style={styles.iconContainer}>
                  <AppIcon name="receipt-long" size={16} color={color.blue} />
                </View>

                <View style={styles.flex1}>
                  <AppText style={styles.transactionTitle}>{item.title}</AppText>
                  <AppText style={styles.transactionDate}>{formatTransactionDate(item.date)}</AppText>
                </View>

                <View>
                  <AppText style={styles.transactionAmount} variant="semiBold">
                    - Rp {formatCurrency(item.amount)}
                  </AppText>
                  <AppText style={styles.transactionStatus}>{item.status}</AppText>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AppIcon name="receipt" size={32} color={color.neutral} />
          <AppText style={styles.emptyText}>Belum ada riwayat transaksi</AppText>
        </View>
      )}
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: color.neutral,
  },
  welcomeContainer: {
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 20,
    color: color.black,
  },
  subWelcomeText: {
    fontSize: 12,
    color: color.neutral,
    marginTop: 2,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
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
    fontSize: 14,
    color: color.black,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: color.white,
    borderRadius: 10,
  },
  emptyText: {
    color: color.neutral,
    fontSize: 12,
    marginTop: 6,
  },
  emailAlert: {
    backgroundColor: color.yellow + '15',
    borderWidth: 1,
    borderColor: color.yellow + '30',
    borderLeftWidth: 4,
    borderLeftColor: color.yellow,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  emailAlertLeft: {
    paddingTop: 2,
  },
  emailAlertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: color.yellow + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailAlertRight: {
    flex: 1,
    gap: 4,
  },
  emailAlertTitle: {
    fontSize: 14,
    color: color.black,
  },
  emailAlertSubtitle: {
    fontSize: 11,
    color: color.neutral,
    lineHeight: 15,
  },
  emailAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: color.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    marginTop: 6,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emailAlertButtonText: {
    fontSize: 11,
    color: color.white,
  },
});

export default DashboardScreen;
