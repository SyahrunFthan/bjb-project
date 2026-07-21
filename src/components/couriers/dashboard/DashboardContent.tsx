import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { formatActivityDate, formatCurrency } from '@/lib/formatter';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  loading: boolean;
  dashboardData: any;
  navigation: NativeStackNavigationProp<RouteParamList, 'Courier'>;
}

const DashboardContent = ({ dashboardData, loading, navigation }: Props) => {
  if (loading) {
    return (
      <>
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <SkeletonCircle size={24} />
            <SkeletonText lines={3} style={{ marginTop: 5 }} />
          </Card>
          <Card style={styles.statCard}>
            <SkeletonCircle size={24} />
            <SkeletonText lines={3} style={{ marginTop: 5 }} />
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <SkeletonCircle size={24} />
            <SkeletonText lines={3} style={{ marginTop: 5 }} />
          </Card>
          <Card style={styles.statCard}>
            <SkeletonCircle size={24} />
            <SkeletonText lines={3} style={{ marginTop: 5 }} />
          </Card>
        </View>

        <Card style={styles.fullStatCard}>
          <SkeletonCircle size={24} />
          <SkeletonText lines={3} style={{ marginTop: 5 }} />
        </Card>
        <Card style={styles.fullStatCard}>
          <SkeletonCircle size={24} />
          <SkeletonText lines={3} style={{ marginTop: 5 }} />
        </Card>

        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Akses Cepat
          </AppText>

          <View style={styles.quickAccessContainer}>
            <Card style={styles.quickCard}>
              <View style={styles.quickContent}>
                <SkeletonCircle size={20} />
                <View style={{ flex: 1, gap: 4 }}>
                  <SkeletonText lines={2} />
                </View>
                <AppIcon name="chevron-right" size={20} color={color.border} />
              </View>
            </Card>
            <Card style={styles.quickCard}>
              <View style={styles.quickContent}>
                <SkeletonCircle size={20} />
                <View style={{ flex: 1, gap: 4 }}>
                  <SkeletonText lines={2} />
                </View>
                <AppIcon name="chevron-right" size={20} color={color.border} />
              </View>
            </Card>
            <Card style={styles.quickCard}>
              <View style={styles.quickContent}>
                <SkeletonCircle size={20} />
                <View style={{ flex: 1, gap: 4 }}>
                  <SkeletonText lines={2} />
                </View>
                <AppIcon name="chevron-right" size={20} color={color.border} />
              </View>
            </Card>
          </View>
        </View>

        <Card>
          <View style={styles.activityHeader}>
            <AppText variant="semiBold" style={styles.activityTitle}>
              Aktivitas Terbaru
            </AppText>
            <TouchableOpacity>
              <AppText style={styles.seeAllText}>Lihat Semua</AppText>
            </TouchableOpacity>
          </View>

          {Array.from({ length: 4 }).map((_, idx) => {
            return (
              <View key={idx} style={styles.activityItem}>
                <SkeletonCircle size={25} />

                <SkeletonText lines={3} />
              </View>
            );
          })}
        </Card>
      </>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentPayments = dashboardData?.recentPayments || [];

  return (
    <>
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <AppIcon name="people" size={24} color={color.primary} />
          <AppText variant="regular" style={styles.statLabel}>
            Total Nasabah
          </AppText>
          <AppText variant="semiBold" style={styles.statValue}>
            {stats.totalCustomers?.toLocaleString('id-ID') ?? '0'}
          </AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppIcon name="credit-card" size={24} color={color.primary} />
          <AppText variant="regular" style={styles.statLabel}>
            Pinjaman Aktif
          </AppText>
          <AppText variant="semiBold" style={styles.statValue}>
            {stats.activeLoansCount?.toLocaleString('id-ID') ?? '0'}
          </AppText>
        </Card>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <AppIcon name="check-circle" size={24} color={color.success} />
          <AppText variant="regular" style={styles.statLabel}>
            Lunas Hari Ini
          </AppText>
          <AppText variant="semiBold" style={styles.billValue}>
            Rp {formatCurrency(stats.totalDailyBillPaid ?? 0)}
          </AppText>
        </Card>
        <Card style={styles.statCard}>
          <AppIcon name="pending-actions" size={24} color={color.tertiary} />
          <AppText variant="regular" style={styles.statLabel}>
            Tagihan Hari Ini
          </AppText>
          <AppText variant="semiBold" style={styles.billValue}>
            Rp {formatCurrency(stats.totalDailyBillUnpaid ?? 0)}
          </AppText>
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="bold" style={styles.sectionTitle}>
          Akses Cepat
        </AppText>

        <View style={styles.quickAccessContainer}>
          <Card style={styles.quickCard} onPress={() => navigation.navigate('CustomerCreate')}>
            <View style={styles.quickContent}>
              <View style={styles.quickIconContainer}>
                <AppIcon name="add-reaction" size={20} color={color.primary} />
              </View>
              <View style={styles.quickTextContainer}>
                <AppText variant="medium" style={styles.quickTitle}>
                  Tambah Nasabah
                </AppText>
                <AppText style={styles.quickSubtitle}>Registrasi Baru</AppText>
              </View>
              <AppIcon name="chevron-right" size={20} color={color.neutral} />
            </View>
          </Card>

          <Card style={styles.quickCard} onPress={() => navigation.navigate('CourierLoanCreate')}>
            <View style={styles.quickContent}>
              <View style={styles.quickIconContainer}>
                <AppIcon name="currency-exchange" size={20} color={color.primary} />
              </View>
              <View style={styles.quickTextContainer}>
                <AppText variant="medium" style={styles.quickTitle}>
                  Ajukan Pinjaman
                </AppText>
                <AppText style={styles.quickSubtitle}>Input Pengajuan</AppText>
              </View>
              <AppIcon name="chevron-right" size={20} color={color.neutral} />
            </View>
          </Card>

          <Card style={styles.quickCard} onPress={() => navigation.navigate('CourierCollection')}>
            <View style={styles.quickContent}>
              <View style={styles.quickIconContainer}>
                <AppIcon name="receipt-long" size={20} color={color.primary} />
              </View>
              <View style={styles.quickTextContainer}>
                <AppText variant="medium" style={styles.quickTitle}>
                  Penagihan Angsuran
                </AppText>
                <AppText style={styles.quickSubtitle}>Bayar Cicilan Nasabah</AppText>
              </View>
              <AppIcon name="chevron-right" size={20} color={color.neutral} />
            </View>
          </Card>
        </View>
      </View>

      <Card style={styles.fullStatCard}>
        <AppIcon name="calendar-month" size={24} color={color.blue} />
        <AppText variant="regular" style={styles.statLabel}>
          Tagihan Bulan Ini
        </AppText>
        <AppText variant="semiBold" style={styles.billValue}>
          Rp {formatCurrency(stats.totalMonthlyBill ?? 0)}
        </AppText>
      </Card>
      <Card style={styles.fullStatCard}>
        <AppIcon name="event-available" size={24} color={color.success} />
        <AppText variant="regular" style={styles.statLabel}>
          Lunas Bulan Ini
        </AppText>
        <AppText variant="semiBold" style={styles.billValue}>
          Rp {formatCurrency(stats.totalMonthlyBillPaid ?? 0)}
        </AppText>
      </Card>

      <Card>
        <View style={styles.activityHeader}>
          <AppText variant="semiBold" style={styles.activityTitle}>
            Aktivitas Terbaru
          </AppText>
          <TouchableOpacity>
            <AppText style={styles.seeAllText}>Lihat Semua</AppText>
          </TouchableOpacity>
        </View>

        {recentPayments.length === 0 ? (
          <EmptyState />
        ) : (
          recentPayments.map((item: any) => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityIconPrimary}>
                <AppIcon name="assured-workload" size={20} color={color.primary} />
              </View>

              <View style={styles.activityContent}>
                <AppText variant="medium" style={styles.activityText}>
                  {item.customerName} - Bayar Cicilan
                </AppText>
                <AppText style={styles.activitySubtext}>
                  {formatActivityDate(item.paymentDate)} | {item.paymentMethod?.toUpperCase() ?? 'CASH'}
                </AppText>
              </View>

              <AppText variant="semiBold">{formatCurrency(item.amount)}</AppText>
            </View>
          ))
        )}
      </Card>
    </>
  );
};

export default DashboardContent;

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
  },
  fullStatCard: {
    width: '100%',
    marginBottom: 15,
  },
  statLabel: {
    color: color.neutral,
    marginTop: 6,
  },
  statValue: {
    fontSize: 26,
    marginTop: 2,
  },
  billValue: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  quickAccessContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  quickCard: {
    width: '100%',
  },
  quickContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: color.primary + '40',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextContainer: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 12,
  },
  quickSubtitle: {
    color: color.neutral,
    fontSize: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: color.border,
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
  },
  seeAllText: {
    fontSize: 12,
    color: color.primary,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activityIconPrimary: {
    width: 30,
    height: 30,
    backgroundColor: color.primary + '40',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 12,
  },
  activitySubtext: {
    fontSize: 10,
    color: color.neutral,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: color.neutral,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    color: color.neutral,
    fontSize: 14,
  },
});
