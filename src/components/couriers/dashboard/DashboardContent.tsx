import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Card from '@/components/Card';
import { SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { AppText } from '@/components/AppText';
import { color } from '@/assets/color';
import EmptyData from '@/components/ui/EmptyData';
import AppIcon from '@/components/Icon';
import { formatActivityDate, formatCurrency } from '@/lib/formatter';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteParamList } from '@/types/navigation';
import EmptyState from '@/components/ui/EmptyState';

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

        <View style={styles.section}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Akses Cepat
          </AppText>

          <View style={styles.quickAccessContainer}>
            <Card style={styles.quickCard}>
              <View style={styles.quickContent}>
                <SkeletonCircle size={20} />

                <SkeletonText lines={2} />
              </View>
            </Card>

            <Card style={styles.quickCard}>
              <View style={styles.quickContent}>
                <SkeletonCircle size={20} />

                <SkeletonText lines={2} />
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
            </View>
          </Card>

          <Card style={styles.quickCard}>
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
  statLabel: {
    color: color.neutral,
    marginTop: 6,
  },
  statValue: {
    fontSize: 26,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  quickCard: {
    flex: 1,
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
