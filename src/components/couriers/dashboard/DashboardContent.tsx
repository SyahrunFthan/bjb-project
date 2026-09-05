import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { formatActivityDate, formatCurrency } from '@/lib/formatter';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

dayjs.locale('id');

interface Props {
  loading: boolean;
  dashboardData: any;
  navigation: NativeStackNavigationProp<RouteParamList, 'Courier'>;
}

const DashboardContent = ({ dashboardData, loading, navigation }: Props) => {
  if (loading) {
    return (
      <View style={styles.container}>
        {/* Skeleton Hero Card */}
        <Card style={styles.skeletonHeroCard}>
          <View style={styles.skeletonHeaderRow}>
            <SkeletonText lines={1} style={{ width: 130, height: 16 }} />
            <SkeletonText lines={1} style={{ width: 80, height: 20, borderRadius: 10 }} />
          </View>
          <View style={{ marginTop: 18, marginBottom: 12 }}>
            <SkeletonText lines={1} style={{ width: 110, height: 14 }} />
            <SkeletonText lines={1} style={{ width: 200, height: 32, marginTop: 6 }} />
          </View>
          <SkeletonText lines={1} style={{ width: '100%', height: 8, borderRadius: 4 }} />
          <View style={styles.skeletonDivider} />
          <View style={styles.skeletonMetricsRow}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <SkeletonText lines={2} style={{ width: 60 }} />
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <SkeletonText lines={2} style={{ width: 60 }} />
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <SkeletonText lines={2} style={{ width: 70 }} />
            </View>
          </View>
        </Card>

        {/* Skeleton Monthly Card */}
        <Card style={styles.monthCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <SkeletonCircle size={36} />
              <View style={{ gap: 4 }}>
                <SkeletonText lines={1} style={{ width: 100, height: 14 }} />
                <SkeletonText lines={1} style={{ width: 70, height: 10 }} />
              </View>
            </View>
            <SkeletonText lines={1} style={{ width: 50, height: 22, borderRadius: 12 }} />
          </View>
          <View style={{ marginTop: 14, gap: 8 }}>
            <SkeletonText lines={1} style={{ width: 150, height: 16 }} />
            <SkeletonText lines={1} style={{ width: '100%', height: 6, borderRadius: 3 }} />
          </View>
        </Card>

        {/* Skeleton Quick Actions */}
        <View style={styles.section}>
          <SkeletonText lines={1} style={{ width: 120, height: 16, marginBottom: 12 }} />
          <View style={styles.quickGrid}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} style={styles.quickGridItem}>
                <View style={styles.quickItemInner}>
                  <SkeletonCircle size={38} />
                  <View style={{ marginTop: 10, gap: 4, width: '100%' }}>
                    <SkeletonText lines={1} style={{ width: 65, height: 12 }} />
                    <SkeletonText lines={1} style={{ width: 45, height: 10 }} />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Skeleton Activity */}
        <Card style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <SkeletonText lines={1} style={{ width: 120, height: 16 }} />
            <SkeletonText lines={1} style={{ width: 60, height: 12 }} />
          </View>
          {Array.from({ length: 3 }).map((_, idx) => (
            <View key={idx} style={styles.activityItem}>
              <SkeletonCircle size={36} />
              <View style={{ flex: 1, gap: 4 }}>
                <SkeletonText lines={1} style={{ width: '60%', height: 12 }} />
                <SkeletonText lines={1} style={{ width: '40%', height: 10 }} />
              </View>
              <SkeletonText lines={1} style={{ width: 70, height: 14 }} />
            </View>
          ))}
        </Card>
      </View>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentPayments = dashboardData?.recentPayments || [];

  const dailyPaid = Number(stats.totalDailyBillPaid || 0);
  const dailyTarget = Number(stats.totalDailyBillUnpaid || 0);
  const dailyProgress =
    dailyTarget > 0 ? Math.min(100, Math.round((dailyPaid / dailyTarget) * 100)) : dailyPaid > 0 ? 100 : 0;
  const dailyRemaining = Math.max(0, dailyTarget - dailyPaid);

  const monthlyPaid = Number(stats.totalMonthlyBillPaid || 0);
  const monthlyTarget = Number(stats.totalMonthlyBill || 0);
  const monthlyProgress =
    monthlyTarget > 0 ? Math.min(100, Math.round((monthlyPaid / monthlyTarget) * 100)) : monthlyPaid > 0 ? 100 : 0;

  const todayFormatted = dayjs().locale('id').format('dddd, D MMM YYYY');
  const monthFormatted = dayjs().locale('id').format('MMMM YYYY');

  return (
    <View style={styles.container}>
      {/* 🌟 1. HERO CARD - DAILY COLLECTION PERFORMANCE */}
      <View style={styles.heroCard}>
        {/* Top Header Badge */}
        <View style={styles.heroHeader}>
          <View style={styles.heroDateBadge}>
            <AppIcon name="calendar-today" size={12} color="#FFFFFF" />
            <AppText variant="medium" style={styles.heroDateText}>
              {todayFormatted}
            </AppText>
          </View>
          <View style={styles.heroCategoryPill}>
            <View style={styles.pulseDot} />
            <AppText variant="semiBold" style={styles.heroCategoryText}>
              Storting Harian
            </AppText>
          </View>
        </View>

        {/* Main Stat: Terkumpul Hari Ini */}
        <View style={styles.heroMainContent}>
          <AppText variant="regular" style={styles.heroLabel}>
            Total Terkumpul Hari Ini
          </AppText>
          <AppText variant="bold" style={styles.heroValue}>
            Rp {formatCurrency(dailyPaid)}
          </AppText>
        </View>

        {/* Progress Bar & Target Indicator */}
        <View style={styles.heroProgressSection}>
          <View style={styles.heroProgressHeader}>
            <AppText style={styles.heroTargetText}>
              Target: <AppText variant="semiBold" style={{ color: '#FFFFFF' }}>Rp {formatCurrency(dailyTarget)}</AppText>
            </AppText>
            <View style={styles.percentPill}>
              <AppText variant="bold" style={styles.percentPillText}>
                {dailyProgress}% Tercapai
              </AppText>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(4, dailyProgress)}%` }]} />
          </View>
        </View>

        {/* Divider */}
        <View style={styles.heroDivider} />

        {/* Bottom 3 Metrics */}
        <View style={styles.heroMetricsContainer}>
          <View style={styles.heroMetricItem}>
            <AppIcon name="people" size={16} color="#93C5FD" />
            <AppText variant="bold" style={styles.heroMetricValue}>
              {stats.totalCustomers?.toLocaleString('id-ID') ?? '0'}
            </AppText>
            <AppText style={styles.heroMetricLabel}>Nasabah</AppText>
          </View>

          <View style={styles.heroMetricSeparator} />

          <View style={styles.heroMetricItem}>
            <AppIcon name="credit-card" size={16} color="#93C5FD" />
            <AppText variant="bold" style={styles.heroMetricValue}>
              {stats.activeLoansCount?.toLocaleString('id-ID') ?? '0'}
            </AppText>
            <AppText style={styles.heroMetricLabel}>Pinjaman Aktif</AppText>
          </View>

          <View style={styles.heroMetricSeparator} />

          <View style={styles.heroMetricItem}>
            <AppIcon name="pending-actions" size={16} color="#FDE047" />
            <AppText variant="bold" style={styles.heroMetricValue}>
              {formatCurrency(dailyRemaining)}
            </AppText>
            <AppText style={styles.heroMetricLabel}>Sisa Target</AppText>
          </View>
        </View>
      </View>

      {/* 📊 2. MONTHLY TARGET OVERVIEW */}
      <Card style={styles.monthCard} variant="elevated">
        <View style={styles.monthHeader}>
          <View style={styles.monthIconWrapper}>
            <AppIcon name="event-available" size={20} color={color.primary} />
          </View>
          <View style={styles.monthTitleWrapper}>
            <AppText variant="semiBold" style={styles.monthTitle}>
              Pencapaian Bulan Ini
            </AppText>
            <AppText style={styles.monthSubtitle}>{monthFormatted}</AppText>
          </View>
          <View style={styles.monthBadge}>
            <AppText variant="bold" style={styles.monthBadgeText}>
              {monthlyProgress}%
            </AppText>
          </View>
        </View>

        <View style={styles.monthProgressContainer}>
          <View style={styles.monthValueRow}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
              <AppText variant="bold" style={styles.monthPaidValue}>
                Rp {formatCurrency(monthlyPaid)}
              </AppText>
              <AppText style={styles.monthTargetValue}>/ Rp {formatCurrency(monthlyTarget)}</AppText>
            </View>
          </View>

          <View style={styles.monthProgressBarTrack}>
            <View style={[styles.monthProgressBarFill, { width: `${Math.max(3, monthlyProgress)}%` }]} />
          </View>
        </View>
      </Card>

      {/* ⚡ 3. QUICK ACTIONS GRID (2x2) */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Akses Cepat
          </AppText>
          <AppText style={styles.sectionSubtitle}>Menu utama operasional</AppText>
        </View>

        <View style={styles.quickGrid}>
          {/* Action 1: Penagihan Angsuran */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickGridItem}
            onPress={() => navigation.navigate('CourierCollection')}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <AppIcon name="receipt-long" size={22} color="#059669" />
            </View>
            <AppText variant="semiBold" style={styles.quickGridTitle}>
              Penagihan
            </AppText>
            <AppText style={styles.quickGridSubtitle}>Setor Angsuran</AppText>
          </TouchableOpacity>

          {/* Action 2: Monitoring Setoran */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickGridItem}
            onPress={() => (navigation as any).navigate('Monitoring')}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <AppIcon name="insights" size={22} color="#2563EB" />
            </View>
            <AppText variant="semiBold" style={styles.quickGridTitle}>
              Monitoring
            </AppText>
            <AppText style={styles.quickGridSubtitle}>Status Nasabah</AppText>
          </TouchableOpacity>

          {/* Action 3: Ajukan Pinjaman */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickGridItem}
            onPress={() => navigation.navigate('CourierLoanCreate')}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#FFFBEB' }]}>
              <AppIcon name="add-card" size={22} color="#D97706" />
            </View>
            <AppText variant="semiBold" style={styles.quickGridTitle}>
              Pengajuan
            </AppText>
            <AppText style={styles.quickGridSubtitle}>Pinjaman Baru</AppText>
          </TouchableOpacity>

          {/* Action 4: Tambah Nasabah */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.quickGridItem}
            onPress={() => navigation.navigate('CustomerCreate')}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#F5F3FF' }]}>
              <AppIcon name="person-add-alt-1" size={22} color="#7C3AED" />
            </View>
            <AppText variant="semiBold" style={styles.quickGridTitle}>
              Nasabah Baru
            </AppText>
            <AppText style={styles.quickGridSubtitle}>Registrasi</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🕒 4. RECENT TRANSACTIONS */}
      <Card style={styles.activityCard} variant="elevated">
        <View style={styles.activityHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="history" size={20} color={color.primary} />
            <AppText variant="bold" style={styles.activityTitle}>
              Setoran Terakhir
            </AppText>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Activity')}>
            <AppText variant="semiBold" style={styles.seeAllText}>
              Lihat Semua
            </AppText>
          </TouchableOpacity>
        </View>

        {recentPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <AppIcon name="receipt" size={32} color={color.neutral} />
            </View>
            <AppText variant="medium" style={styles.emptyTitle}>
              Belum Ada Setoran Hari Ini
            </AppText>
            <AppText style={styles.emptySubtitle}>
              Transaksi pembayaran angsuran dari nasabah akan langsung tercatat di sini.
            </AppText>
          </View>
        ) : (
          recentPayments.map((item: any) => {
            const isCash = !item.paymentMethod || item.paymentMethod.toLowerCase() === 'cash' || item.paymentMethod.toLowerCase() === 'courier';
            return (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIconCircle}>
                  <AppIcon name="payments" size={18} color="#059669" />
                </View>

                <View style={styles.activityContent}>
                  <AppText variant="semiBold" style={styles.activityCustomerName} numberOfLines={1}>
                    {item.customerName || 'Nasabah'}
                  </AppText>
                  <View style={styles.activityMetaRow}>
                    <AppText style={styles.activityDate}>{formatActivityDate(item.paymentDate)}</AppText>
                    <View style={[styles.methodBadge, { backgroundColor: isCash ? '#ECFDF5' : '#EFF6FF' }]}>
                      <AppText style={[styles.methodBadgeText, { color: isCash ? '#059669' : '#2563EB' }]}>
                        {isCash ? 'TUNAI' : (item.paymentMethod || 'TRANSFER').toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View style={styles.activityAmountContainer}>
                  <AppText variant="bold" style={styles.activityAmount}>
                    +Rp {formatCurrency(item.amount)}
                  </AppText>
                </View>
              </View>
            );
          })
        )}
      </Card>
    </View>
  );
};

export default DashboardContent;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },

  /* 🌟 HERO CARD */
  heroCard: {
    backgroundColor: '#090B7B',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#090B7B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  skeletonHeroCard: {
    backgroundColor: color.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroDateText: {
    color: '#E0E7FF',
    fontSize: 11,
  },
  heroCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  heroCategoryText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  heroMainContent: {
    marginTop: 16,
    marginBottom: 12,
  },
  heroLabel: {
    color: '#C7D2FE',
    fontSize: 12,
    marginBottom: 4,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  heroProgressSection: {
    marginTop: 4,
  },
  heroProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTargetText: {
    color: '#C7D2FE',
    fontSize: 11,
  },
  percentPill: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  percentPillText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 14,
  },
  heroMetricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
  },
  heroMetricLabel: {
    color: '#C7D2FE',
    fontSize: 10,
  },
  heroMetricSeparator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* 📊 MONTH CARD */
  monthCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  monthTitle: {
    fontSize: 14,
    color: '#0F172A',
  },
  monthSubtitle: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 1,
  },
  monthBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  monthBadgeText: {
    color: '#1D4ED8',
    fontSize: 12,
  },
  monthProgressContainer: {
    marginTop: 14,
  },
  monthValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  monthPaidValue: {
    fontSize: 16,
    color: '#0F172A',
  },
  monthTargetValue: {
    fontSize: 12,
    color: color.neutral,
  },
  monthProgressBarTrack: {
    width: '100%',
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  monthProgressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },

  /* ⚡ QUICK ACTIONS GRID */
  section: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickGridItem: {
    width: '48.5%',
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickGridTitle: {
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 2,
  },
  quickGridSubtitle: {
    fontSize: 10,
    color: color.neutral,
  },

  /* 🕒 RECENT ACTIVITIES */
  activityCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 15,
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 12,
    color: color.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F8FAFC',
    gap: 10,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityCustomerName: {
    fontSize: 13,
    color: '#0F172A',
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  activityDate: {
    fontSize: 10,
    color: color.neutral,
  },
  methodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  methodBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  activityAmountContainer: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 13,
    color: '#059669',
  },

  /* EMPTY STATE */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 16,
  },

  /* SKELETON STYLES */
  skeletonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  skeletonMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickItemInner: {
    alignItems: 'flex-start',
    width: '100%',
  },
});
