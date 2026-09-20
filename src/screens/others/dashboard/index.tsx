import React, { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { getTodayAttendance } from '@/api/attendance';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { TodayAttendanceResponse } from '@/model/attendance';
import { RouteParamList } from '@/types/navigation';

dayjs.locale('id');

const OtherDashboardScreen: React.FC = () => {
  const { auth } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const modal = useModal();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayData, setTodayData] = useState<TodayAttendanceResponse | null>(null);

  const fetchTodayData = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const res = await getTodayAttendance();
      setTodayData(res);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTodayData();
    });
    return unsubscribe;
  }, [fetchTodayData, navigation]);

  const workEndTime = todayData?.branch?.work_end_time || '17:00';
  const isClockOutAllowed = (() => {
    const [endH, endM] = workEndTime.split(':').map(Number);
    const minTime = dayjs().hour(endH).minute(endM).second(0);
    return dayjs().isAfter(minTime) || dayjs().isSame(minTime);
  })();

  const handleFaceAction = (mode: 'register' | 'clock-in' | 'clock-out') => {
    if (mode === 'register') {
      if (todayData?.is_face_registered && !todayData?.can_update_face) {
        modal.result.error(
          'Master Wajah Terkunci',
          'Wajah master biometrik Anda sudah terdaftar dan dikunci secara aman. Anda tidak dapat mengubah wajah sendiri tanpa izin Admin. Hubungi Admin kantor cabang Anda jika memerlukan pembaruan.',
        );
        return;
      }

      if (todayData?.is_face_registered && todayData?.can_update_face) {
        modal.confirm.show(
          'Izin Ubah Wajah Aktif',
          'Admin telah memberikan izin untuk memperbarui wajah master. Anda memiliki kesempatan 1 kali untuk memindai wajah baru. Lanjutkan pemindaian sekarang?',
          () => {
            navigation.navigate('FaceCamera', {
              mode: 'register',
              onSuccess: () => fetchTodayData(),
            });
          },
        );
        return;
      }
    }

    if (mode !== 'register' && todayData && !todayData.is_face_registered) {
      modal.confirm.show(
        'Wajah Belum Terdaftar',
        'Anda harus mendaftarkan master wajah terlebih dahulu sebelum melakukan presensi. Apakah Anda ingin mendaftarkan wajah sekarang?',
        () => {
          navigation.navigate('FaceCamera', {
            mode: 'register',
            onSuccess: () => fetchTodayData(),
          });
        },
      );
      return;
    }

    if (mode === 'clock-out') {
      const [endH, endM] = workEndTime.split(':').map(Number);
      const minTime = dayjs().hour(endH).minute(endM).second(0);
      if (dayjs().isBefore(minTime)) {
        modal.result.error(
          'Belum Jam Pulang',
          `Presensi pulang belum dibuka. Jam pulang operasional kantor cabang Anda adalah pukul ${workEndTime}.`,
        );
        return;
      }
    }

    navigation.navigate('FaceCamera', {
      mode,
      onSuccess: () => fetchTodayData(),
    });
  };

  const getStatusBadge = () => {
    if (!todayData) return null;

    if (todayData.active_leave) {
      const typeLabel = todayData.active_leave.type === 'sick' ? 'Izin Sakit' : todayData.active_leave.type === 'permit' ? 'Izin' : 'Sedang Cuti';
      return (
        <View style={[styles.badgeContainer, { backgroundColor: '#e0e7ff' }]}>
          <AppIcon name="beach-access" size={16} color="#4338ca" style={{ marginRight: 4 }} />
          <AppText style={[styles.badgeText, { color: '#4338ca' }]}>{typeLabel}</AppText>
        </View>
      );
    }

    const att = todayData.attendance;
    if (!att || !att.clock_in_at) {
      return (
        <View style={[styles.badgeContainer, { backgroundColor: '#fee2e2' }]}>
          <AppIcon name="schedule" size={16} color="#b91c1c" style={{ marginRight: 4 }} />
          <AppText style={[styles.badgeText, { color: '#b91c1c' }]}>Belum Presensi</AppText>
        </View>
      );
    }

    if (att.status === 'late') {
      return (
        <View style={[styles.badgeContainer, { backgroundColor: '#fef3c7' }]}>
          <AppIcon name="warning" size={16} color="#b45309" style={{ marginRight: 4 }} />
          <AppText style={[styles.badgeText, { color: '#b45309' }]}>Terlambat</AppText>
        </View>
      );
    }

    return (
      <View style={[styles.badgeContainer, { backgroundColor: '#dcfce7' }]}>
        <AppIcon name="check-circle" size={16} color="#15803d" style={{ marginRight: 4 }} />
        <AppText style={[styles.badgeText, { color: '#15803d' }]}>Tepat Waktu</AppText>
      </View>
    );
  };

  return (
    <AppLayout
      scrollable={true}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTodayData(true)} colors={[color.primary]} />}>
      {/* Greeting Header */}
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <AppIcon name="person" size={32} color={color.primary} />
        </View>
        <View style={styles.userInfo}>
          <AppText style={styles.greetingText}>Selamat Bekerja,</AppText>
          <AppText style={styles.userName}>{auth?.full_name || 'Karyawan'}</AppText>
          <View style={styles.branchTag}>
            <AppIcon name="business" size={14} color={color.primary} style={{ marginRight: 4 }} />
            <AppText style={styles.branchTagText}>{todayData?.branch?.name || 'Kantor Cabang'}</AppText>
          </View>
        </View>
      </View>

      {/* Unregistered Face Alert Banner */}
      {todayData && !todayData.is_face_registered && (
        <View style={styles.alertBanner}>
          <View style={styles.alertIconBox}>
            <AppIcon name="face" size={24} color="#ea580c" />
          </View>
          <View style={styles.alertContent}>
            <AppText style={styles.alertTitle}>Biometrik Wajah Belum Terdaftar</AppText>
            <AppText style={styles.alertSubtitle}>Daftarkan foto wajah master Anda untuk mengaktifkan fitur presensi.</AppText>
            <TouchableOpacity style={styles.registerFaceButton} onPress={() => handleFaceAction('register')}>
              <AppText style={styles.registerFaceButtonText}>Daftarkan Wajah Sekarang</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Face Update Permission Banner */}
      {todayData && todayData.is_face_registered && todayData.can_update_face && (
        <View style={[styles.alertBanner, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
          <View style={[styles.alertIconBox, { backgroundColor: '#dbeafe' }]}>
            <AppIcon name="lock-open" size={24} color="#2563eb" />
          </View>
          <View style={styles.alertContent}>
            <AppText style={[styles.alertTitle, { color: '#1e40af' }]}>Izin Ubah Wajah Diberikan</AppText>
            <AppText style={[styles.alertSubtitle, { color: '#3b82f6' }]}>
              Admin telah memberikan akses untuk memperbarui master wajah Anda (1 kali).
            </AppText>
            <TouchableOpacity style={[styles.registerFaceButton, { backgroundColor: '#2563eb' }]} onPress={() => handleFaceAction('register')}>
              <AppText style={styles.registerFaceButtonText}>Perbarui Wajah Sekarang</AppText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Branch Operational Hours Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <AppIcon name="storefront" size={20} color={color.primary} style={{ marginRight: 8 }} />
            <AppText style={styles.cardTitle}>Jam Operasional Cabang</AppText>
          </View>
          {todayData?.branch?.grace_period_minutes ? (
            <View style={styles.toleranceBadge}>
              <AppText style={styles.toleranceBadgeText}>Toleransi {todayData.branch.grace_period_minutes}m</AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleItem}>
            <AppText style={styles.scheduleLabel}>Jam Masuk</AppText>
            <AppText style={styles.scheduleValue}>{todayData?.branch?.work_start_time || '08:00'}</AppText>
          </View>
          <View style={styles.scheduleDivider} />
          <View style={styles.scheduleItem}>
            <AppText style={styles.scheduleLabel}>Jam Pulang</AppText>
            <AppText style={styles.scheduleValue}>{todayData?.branch?.work_end_time || '17:00'}</AppText>
          </View>
        </View>
      </View>

      {/* Today's Attendance Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <AppText style={styles.cardTitle}>Presensi Hari Ini</AppText>
            <AppText style={styles.cardDateText}>{dayjs().format('dddd, DD MMMM YYYY')}</AppText>
          </View>
          {getStatusBadge()}
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={color.primary} />
          </View>
        ) : todayData?.active_leave ? (
          <View style={styles.leaveNotice}>
            <AppText style={styles.leaveNoticeTitle}>
              {todayData.active_leave.type === 'sick'
                ? 'Sedang Izin Sakit'
                : todayData.active_leave.type === 'permit'
                ? 'Sedang Izin'
                : 'Sedang Cuti Kerja'}
            </AppText>
            <AppText style={styles.leaveNoticeSubtitle}>Alasan: {todayData.active_leave.reason}</AppText>
            <AppText style={styles.leaveNoticeDate}>
              Periode: {dayjs(todayData.active_leave.start_date).format('DD MMM')} - {dayjs(todayData.active_leave.end_date).format('DD MMM YYYY')}
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.clockGrid}>
              <View style={styles.clockBox}>
                <View style={styles.clockBoxHeader}>
                  <AppIcon name="login" size={16} color="#16a34a" />
                  <AppText style={styles.clockBoxLabel}>Jam Masuk</AppText>
                </View>
                <AppText style={styles.clockBoxTime}>
                  {todayData?.attendance?.clock_in_at ? dayjs(todayData.attendance.clock_in_at).format('HH:mm') : '--:--'}
                </AppText>
                {todayData?.attendance?.similarity_score ? (
                  <AppText style={styles.scoreText}>Kecocokan: {Math.round(todayData.attendance.similarity_score * 100)}%</AppText>
                ) : null}
              </View>

              <View style={styles.clockBox}>
                <View style={styles.clockBoxHeader}>
                  <AppIcon name="logout" size={16} color="#dc2626" />
                  <AppText style={styles.clockBoxLabel}>Jam Pulang</AppText>
                </View>
                <AppText style={styles.clockBoxTime}>
                  {todayData?.attendance?.clock_out_at ? dayjs(todayData.attendance.clock_out_at).format('HH:mm') : '--:--'}
                </AppText>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.attendanceActionRow}>
              {!todayData?.attendance?.clock_in_at ? (
                <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: color.primary }]} onPress={() => handleFaceAction('clock-in')}>
                  <AppIcon name="photo-camera" size={20} color={color.white} />
                  <AppText style={styles.primaryActionBtnText}>Presensi Masuk</AppText>
                </TouchableOpacity>
              ) : !todayData?.attendance?.clock_out_at ? (
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: isClockOutAllowed ? '#ea580c' : '#64748b' }]}
                  onPress={() => handleFaceAction('clock-out')}
                  activeOpacity={0.8}>
                  <AppIcon name={isClockOutAllowed ? 'photo-camera' : 'schedule'} size={20} color={color.white} />
                  <AppText style={styles.primaryActionBtnText}>{isClockOutAllowed ? 'Presensi Pulang' : `Presensi Pulang (${workEndTime})`}</AppText>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedBox}>
                  <AppIcon name="verified" size={20} color="#16a34a" style={{ marginRight: 6 }} />
                  <AppText style={styles.completedText}>Presensi Hari Ini Lengkap</AppText>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Quick Menu */}
      <View style={styles.quickSection}>
        <AppText style={styles.sectionHeading}>Menu & Layanan</AppText>
        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LeaveRequestCreate')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#e0f2fe' }]}>
              <AppIcon name="add-circle-outline" size={26} color="#0284c7" />
            </View>
            <AppText style={styles.menuTitle}>Ajukan Cuti</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('LeaveRequestList')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#fef3c7' }]}>
              <AppIcon name="event-note" size={26} color="#d97706" />
            </View>
            <AppText style={styles.menuTitle}>Daftar Cuti</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Attendance')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#dcfce7' }]}>
              <AppIcon name="history" size={26} color="#16a34a" />
            </View>
            <AppText style={styles.menuTitle}>Riwayat Absen</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => handleFaceAction('register')}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#f3e8ff' }]}>
              <AppIcon name="face" size={26} color="#7c3aed" />
            </View>
            <AppText style={styles.menuTitle}>Master Wajah</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
};

export default OtherDashboardScreen;

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  branchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  branchTagText: {
    fontSize: 12,
    color: color.primary,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    borderColor: '#ffedd5',
    borderWidth: 1,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fed7aa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9a3412',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#c2410c',
    marginTop: 2,
    lineHeight: 16,
  },
  registerFaceButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#ea580c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  registerFaceButtonText: {
    color: color.white,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardDateText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  toleranceBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  toleranceBadgeText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  scheduleItem: {
    flex: 1,
    alignItems: 'center',
  },
  scheduleDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#cbd5e1',
  },
  scheduleLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  scheduleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  leaveNotice: {
    backgroundColor: '#eef2ff',
    padding: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  leaveNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730a3',
  },
  leaveNoticeSubtitle: {
    fontSize: 12,
    color: '#4338ca',
    marginTop: 4,
  },
  leaveNoticeDate: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 2,
  },
  clockGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  clockBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clockBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clockBoxLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  clockBoxTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  scoreText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 2,
  },
  attendanceActionRow: {
    width: '100%',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    elevation: 2,
  },
  primaryActionBtnText: {
    color: color.white,
    fontSize: 14,
    fontWeight: '700',
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 13,
  },
  quickSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuItem: {
    alignItems: 'center',
    width: '23%',
  },
  menuIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
