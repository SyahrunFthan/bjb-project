import { useCallback, useEffect, useState } from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import { getTodayAttendance } from '@/api/attendance';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import { SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import { useModal } from '@/hooks/useModal';
import { formatActivityDate, formatCurrency } from '@/lib/formatter';
import { TodayAttendanceResponse } from '@/model/attendance';
import { CourierDashboard } from '@/model/dashboard';
import { RouteParamList } from '@/types/navigation';
import 'dayjs/locale/id';

dayjs.locale('id');

interface Props {
  loading: boolean;
  dashboardData: CourierDashboard | null;
  navigation: NativeStackNavigationProp<RouteParamList, 'Courier'>;
}

const DashboardContent = ({ dashboardData, loading, navigation }: Props) => {
  const modal = useModal();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceResponse | null>(null);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await getTodayAttendance();
      setTodayAttendance(res);
    } catch (e) {
      console.log('Error fetching today attendance for courier:', e);
    }
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance, dashboardData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTodayAttendance();
    });
    return unsubscribe;
  }, [fetchTodayAttendance, navigation]);

  const workEndTime = todayAttendance?.branch?.work_end_time || '17:00';
  const isClockOutAllowed = (() => {
    const [endH, endM] = workEndTime.split(':').map(Number);
    const minTime = dayjs().hour(endH).minute(endM).second(0);
    return dayjs().isAfter(minTime) || dayjs().isSame(minTime);
  })();

  const handleClockOutPress = () => {
    const [endH, endM] = workEndTime.split(':').map(Number);
    const minTime = dayjs().hour(endH).minute(endM).second(0);
    if (dayjs().isBefore(minTime)) {
      modal.result.error('Belum Jam Pulang', `Presensi pulang belum dibuka. Jam pulang operasional kantor cabang Anda adalah pukul ${workEndTime}.`);
      return;
    }

    navigation.navigate('FaceCamera', {
      mode: 'clock-out',
      onSuccess: fetchTodayAttendance,
    });
  };

  const handleRegisterFacePress = () => {
    if (todayAttendance?.is_face_registered && !todayAttendance?.can_update_face) {
      modal.result.error(
        'Master Wajah Terkunci',
        'Wajah master biometrik Anda sudah terdaftar dan dikunci secara aman. Anda tidak dapat mengubah wajah sendiri tanpa izin Admin. Hubungi Admin kantor cabang Anda jika memerlukan pembaruan.',
      );
      return;
    }

    if (todayAttendance?.is_face_registered && todayAttendance?.can_update_face) {
      modal.confirm.show(
        'Izin Ubah Wajah Aktif',
        'Admin telah memberikan izin untuk memperbarui wajah master. Anda memiliki kesempatan 1 kali untuk memindai wajah baru. Lanjutkan pemindaian sekarang?',
        () => {
          navigation.navigate('FaceCamera', {
            mode: 'register',
            onSuccess: fetchTodayAttendance,
          });
        },
      );
      return;
    }

    navigation.navigate('FaceCamera', {
      mode: 'register',
      onSuccess: fetchTodayAttendance,
    });
  };
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
            {[0, 2, 4].map(startIndex => (
              <View key={startIndex} style={styles.quickGridRow}>
                {[0, 1].map(offset => (
                  <Card key={startIndex + offset} style={styles.quickGridItem}>
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

  const stats = dashboardData?.stats;
  const recentPayments = dashboardData?.recentPayments || [];
  const activeDelegations = dashboardData?.active_delegations || [];

  const dailyPaid = Number(stats?.totalDailyBillPaid || 0);
  const dailyTarget = Number(stats?.totalDailyBillUnpaid || 0);
  const dailyProgress = dailyTarget > 0 ? Math.min(100, Math.round((dailyPaid / dailyTarget) * 100)) : dailyPaid > 0 ? 100 : 0;
  const dailyRemaining = Math.max(0, dailyTarget - dailyPaid);

  const monthlyPaid = Number(stats?.totalMonthlyBillPaid || 0);
  const monthlyTarget = Number(stats?.totalMonthlyBill || 0);
  const monthlyProgress = monthlyTarget > 0 ? Math.min(100, Math.round((monthlyPaid / monthlyTarget) * 100)) : monthlyPaid > 0 ? 100 : 0;

  const todayFormatted = dayjs().locale('id').format('dddd, D MMM YYYY');
  const monthFormatted = dayjs().locale('id').format('MMMM YYYY');

  return (
    <View style={styles.container}>
      {/* 🌟 BANNER TITIPAN CUTI AKTIF */}
      {activeDelegations.length > 0 && (
        <View style={styles.delegationBanner}>
          <View style={styles.delegationBannerHeader}>
            <View style={styles.delegationBannerBadge}>
              <AppIcon name="swap-horiz" size={14} color="#0369A1" />
              <AppText variant="bold" style={styles.delegationBannerTitle}>
                Tugas Titipan Cuti Aktif
              </AppText>
            </View>
            <AppText variant="medium" style={styles.delegationBannerCount}>
              {activeDelegations.length} Rekan
            </AppText>
          </View>
          <AppText style={styles.delegationBannerDesc}>
            Anda sedang menggantikan tugas penagihan untuk:{' '}
            <AppText variant="bold" style={styles.delegationBannerHighlight}>
              {activeDelegations.map(d => d.original_employee_name).join(', ')}
            </AppText>
            . Nasabah & tagihan titipan ditandai dengan badge khusus.
          </AppText>
        </View>
      )}

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
              Target:{' '}
              <AppText variant="semiBold" style={{ color: '#FFFFFF' }}>
                Rp {formatCurrency(dailyTarget)}
              </AppText>
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
              {stats?.totalCustomers?.toLocaleString('id-ID') ?? '0'}
            </AppText>
            <AppText style={styles.heroMetricLabel}>Nasabah</AppText>
          </View>

          <View style={styles.heroMetricSeparator} />

          <View style={styles.heroMetricItem}>
            <AppIcon name="credit-card" size={16} color="#93C5FD" />
            <AppText variant="bold" style={styles.heroMetricValue}>
              {stats?.activeLoansCount?.toLocaleString('id-ID') ?? '0'}
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

      {/* 📸 2.5 ATTENDANCE CARD */}
      <Card style={styles.attendanceCard} variant="elevated">
        <View style={styles.attendanceCardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#E0F2FE', width: 36, height: 36, borderRadius: 18 }]}>
              <AppIcon name="photo-camera" size={18} color="#0284C7" />
            </View>
            <View>
              <AppText variant="bold" style={styles.attendanceTitle}>
                Presensi Hari Ini
              </AppText>
              <AppText style={styles.attendanceSubtitle}>{dayjs().format('dddd, DD MMMM YYYY')}</AppText>
            </View>
          </View>
        </View>

        <View style={styles.attendanceContentRow}>
          <View style={styles.attendanceTimeCol}>
            <AppText style={styles.attendanceLabel}>Masuk</AppText>
            <AppText variant="bold" style={styles.attendanceTime}>
              {todayAttendance?.attendance?.clock_in_at ? dayjs(todayAttendance.attendance.clock_in_at).format('HH:mm') : '--:--'}
            </AppText>
          </View>
          <View style={styles.attendanceDivider} />
          <View style={styles.attendanceTimeCol}>
            <AppText style={styles.attendanceLabel}>Pulang</AppText>
            <AppText variant="bold" style={styles.attendanceTime}>
              {todayAttendance?.attendance?.clock_out_at ? dayjs(todayAttendance.attendance.clock_out_at).format('HH:mm') : '--:--'}
            </AppText>
          </View>
        </View>
        <View style={{ alignItems: 'center', flex: 1, marginTop: 10 }}>
          {!todayAttendance?.attendance?.clock_in_at ? (
            <TouchableOpacity
              style={styles.attendanceBtn}
              onPress={() =>
                navigation.navigate('FaceCamera', {
                  mode: 'clock-in',
                  onSuccess: fetchTodayAttendance,
                })
              }>
              <AppIcon name="photo-camera" size={16} color={color.white} />
              <AppText variant="bold" style={styles.attendanceBtnText}>
                Absen Masuk
              </AppText>
            </TouchableOpacity>
          ) : !todayAttendance?.attendance?.clock_out_at ? (
            <TouchableOpacity
              style={[styles.attendanceBtn, { backgroundColor: isClockOutAllowed ? '#EA580C' : '#64748B' }]}
              onPress={handleClockOutPress}
              activeOpacity={0.8}>
              <AppIcon name={isClockOutAllowed ? 'photo-camera' : 'schedule'} size={16} color={color.white} />
              <AppText variant="bold" style={styles.attendanceBtnText}>
                {isClockOutAllowed ? 'Absen Pulang' : `Absen Pulang (${workEndTime})`}
              </AppText>
            </TouchableOpacity>
          ) : (
            <View style={styles.attendanceDoneBadge}>
              <AppIcon name="check-circle" size={16} color="#16A34A" />
              <AppText variant="bold" style={{ color: '#16A34A', fontSize: 12 }}>
                Selesai
              </AppText>
            </View>
          )}
        </View>
      </Card>

      {/* ⚡ 3. QUICK ACTIONS GRID (2x4) */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <AppText variant="bold" style={styles.sectionTitle}>
            Akses Cepat
          </AppText>
          <AppText style={styles.sectionSubtitle}>Menu utama operasional</AppText>
        </View>

        <View style={styles.quickGrid}>
          {/* Baris 1 */}
          <View style={styles.quickGridRow}>
            {/* Action 1: Penagihan Angsuran */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('CourierCollection')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#ECFDF5' }]}>
                <AppIcon name="receipt-long" size={22} color="#059669" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Penagihan
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Setor Angsuran</AppText>
            </TouchableOpacity>

            {/* Action 2: Monitoring Setoran */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => (navigation as any).navigate('Monitoring')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <AppIcon name="insights" size={22} color="#2563EB" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Monitoring
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Status Nasabah</AppText>
            </TouchableOpacity>
          </View>

          {/* Baris 2 */}
          <View style={styles.quickGridRow}>
            {/* Action 3: Ajukan Pinjaman */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('CourierLoanCreate')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <AppIcon name="add-card" size={22} color="#D97706" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Pengajuan
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Pinjaman Baru</AppText>
            </TouchableOpacity>

            {/* Action 4: Tambah Nasabah */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('CustomerCreate')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#F5F3FF' }]}>
                <AppIcon name="person-add-alt-1" size={22} color="#7C3AED" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Nasabah Baru
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Registrasi</AppText>
            </TouchableOpacity>
          </View>

          {/* Baris 3 */}
          <View style={styles.quickGridRow}>
            {/* Action 5: Presensi Wajah */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('Attendance')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <AppIcon name="photo-camera" size={22} color="#0284C7" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Presensi Wajah
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Masuk & Pulang</AppText>
            </TouchableOpacity>

            {/* Action 6: Izin & Cuti */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('LeaveRequestList')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <AppIcon name="event-note" size={22} color="#D97706" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Izin & Cuti
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Pengajuan & Izin</AppText>
            </TouchableOpacity>
          </View>

          {/* Baris 4 */}
          <View style={styles.quickGridRow}>
            {/* Action 7: Riwayat Aktivitas */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={() => navigation.navigate('Activity')}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <AppIcon name="history" size={22} color="#16A34A" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Riwayat
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Semua Aktivitas</AppText>
            </TouchableOpacity>

            {/* Action 8: Master Wajah */}
            <TouchableOpacity activeOpacity={0.8} style={styles.quickGridItem} onPress={handleRegisterFacePress}>
              <View style={[styles.quickIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <AppIcon name="face" size={22} color="#7C3AED" />
              </View>
              <AppText variant="semiBold" style={styles.quickGridTitle}>
                Master Wajah
              </AppText>
              <AppText style={styles.quickGridSubtitle}>Biometrik</AppText>
            </TouchableOpacity>
          </View>
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
            <AppText style={styles.emptySubtitle}>Transaksi pembayaran angsuran dari nasabah akan langsung tercatat di sini.</AppText>
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
    gap: 10,
  },
  quickGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickGridItem: {
    flex: 1,
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
  delegationBanner: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 6,
  },
  delegationBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  delegationBannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  delegationBannerTitle: {
    fontSize: 12.5,
    color: '#0369A1',
  },
  delegationBannerCount: {
    fontSize: 10.5,
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  delegationBannerDesc: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  delegationBannerHighlight: {
    color: '#0369A1',
  },
  attendanceCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attendanceTitle: {
    fontSize: 13,
    color: '#0F172A',
  },
  attendanceSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  attendanceContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceTimeCol: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceLabel: {
    fontSize: 10.5,
    color: '#64748B',
  },
  attendanceTime: {
    fontSize: 16,
    color: '#0F172A',
    marginTop: 2,
  },
  attendanceDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  attendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    width: '100%',
  },
  attendanceBtnText: {
    color: color.white,
    fontSize: 12,
  },
  attendanceDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
});
