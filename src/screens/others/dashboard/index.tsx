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
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { TodayAttendanceResponse } from '@/model/attendance';
import { RouteParamList } from '@/types/navigation';

dayjs.locale('id');

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                             */
/* -------------------------------------------------------------------------- */

const ui = {
  ink: '#0f172a',
  body: '#475569',
  muted: '#64748b',
  line: '#e2e8f0',
  surface: '#f8fafc',
};

type Tone = 'neutral' | 'info' | 'danger' | 'warning' | 'success';

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: '#f1f5f9', fg: '#475569', border: '#e2e8f0' },
  info: { bg: '#eef2ff', fg: '#4338ca', border: '#c7d2fe' },
  danger: { bg: '#fef2f2', fg: '#b91c1c', border: '#fecaca' },
  warning: { bg: '#fffbeb', fg: '#b45309', border: '#fde68a' },
  success: { bg: '#f0fdf4', fg: '#15803d', border: '#bbf7d0' },
};

type IconName = React.ComponentProps<typeof AppIcon>['name'];
type FaceMode = 'register' | 'clock-in' | 'clock-out';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const LEAVE_BADGE_LABEL: Record<string, string> = {
  sick: 'Izin Sakit',
  permit: 'Izin',
};

const LEAVE_TITLE_LABEL: Record<string, string> = {
  sick: 'Sedang Izin Sakit',
  permit: 'Sedang Izin',
};

const getGreeting = (hour: number) => {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 18) return 'Selamat sore';
  return 'Selamat malam';
};

const getInitials = (name?: string | null) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const getWorkEnd = (workEndTime: string, base: dayjs.Dayjs = dayjs()) => {
  const [h, m] = workEndTime.split(':').map(Number);
  return base.hour(h).minute(m).second(0).millisecond(0);
};

type StatusInfo = { tone: Tone; icon: IconName; label: string };

const getStatus = (data: TodayAttendanceResponse | null): StatusInfo | null => {
  if (!data) return null;

  if (data.is_holiday) {
    return { tone: 'neutral', icon: 'event', label: 'Libur Kantor' };
  }

  if (data.active_leave) {
    return { tone: 'info', icon: 'beach-access', label: LEAVE_BADGE_LABEL[data.active_leave.type] ?? 'Sedang Cuti' };
  }

  const att = data.attendance;

  if (att?.status === 'absent' || data.is_absent) {
    return { tone: 'danger', icon: 'cancel', label: 'Tidak Hadir (Alpa)' };
  }

  if (!att || !att.clock_in_at) {
    return { tone: 'warning', icon: 'schedule', label: 'Belum Presensi' };
  }

  if (att.status === 'late') {
    return { tone: 'warning', icon: 'warning', label: 'Terlambat' };
  }

  return { tone: 'success', icon: 'check-circle', label: 'Tepat Waktu' };
};

const useNow = (intervalMs: number) => {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
};

/* -------------------------------------------------------------------------- */
/*  Small presentational components                                           */
/* -------------------------------------------------------------------------- */

// Jam berjalan dipisah supaya hanya komponen ini yang re-render tiap detik.
const LiveClock: React.FC = () => {
  const now = useNow(1000);
  return <AppText style={styles.heroTime}>{now.format('HH:mm:ss')}</AppText>;
};

const StatusBadge: React.FC<StatusInfo> = ({ tone, icon, label }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <AppIcon name={icon} size={14} color={t.fg} style={{ marginRight: 4 }} />
      <AppText style={[styles.badgeText, { color: t.fg }]}>{label}</AppText>
    </View>
  );
};

type StatePanelProps = {
  tone: Tone;
  icon: IconName;
  title: string;
  message: string;
  note?: string;
};

const StatePanel: React.FC<StatePanelProps> = ({ tone, icon, title, message, note }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.statePanel, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={[styles.statePanelIcon, { backgroundColor: color.white }]}>
        <AppIcon name={icon} size={22} color={t.fg} />
      </View>
      <View style={styles.statePanelBody}>
        <AppText style={[styles.statePanelTitle, { color: t.fg }]}>{title}</AppText>
        <AppText style={[styles.statePanelMessage, { color: t.fg }]}>{message}</AppText>
        {note ? <AppText style={[styles.statePanelNote, { color: t.fg }]}>{note}</AppText> : null}
      </View>
    </View>
  );
};

type FaceBannerProps = {
  tone: Tone;
  icon: IconName;
  title: string;
  message: string;
  actionLabel: string;
  onPress: () => void;
};

const FaceBanner: React.FC<FaceBannerProps> = ({ tone, icon, title, message, actionLabel, onPress }) => {
  const t = TONES[tone];
  return (
    <View style={[styles.banner, { backgroundColor: t.bg, borderColor: t.border }]}>
      <View style={[styles.bannerIcon, { backgroundColor: color.white }]}>
        <AppIcon name={icon} size={22} color={t.fg} />
      </View>
      <View style={styles.bannerContent}>
        <AppText style={[styles.bannerTitle, { color: t.fg }]}>{title}</AppText>
        <AppText style={[styles.bannerMessage, { color: ui.body }]}>{message}</AppText>
        <TouchableOpacity style={[styles.bannerButton, { backgroundColor: t.fg }]} onPress={onPress} activeOpacity={0.85} accessibilityRole="button">
          <AppText style={styles.bannerButtonText}>{actionLabel}</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type TimeCellProps = {
  icon: IconName;
  tint: string;
  label: string;
  time: string;
  extra?: string | null;
};

const TimeCell: React.FC<TimeCellProps> = ({ icon, tint, label, time, extra }) => (
  <View style={styles.timeCell}>
    <View style={styles.timeCellHeader}>
      <AppIcon name={icon} size={16} color={tint} />
      <AppText style={styles.timeCellLabel}>{label}</AppText>
    </View>
    <AppText style={styles.timeCellValue}>{time}</AppText>
    {extra ? <AppText style={styles.timeCellExtra}>{extra}</AppText> : null}
  </View>
);

type MenuTileProps = {
  icon: IconName;
  tint: string;
  background: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const MenuTile: React.FC<MenuTileProps> = ({ icon, tint, background, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuTile} onPress={onPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={title}>
    <View style={[styles.menuIcon, { backgroundColor: background }]}>
      <AppIcon name={icon} size={22} color={tint} />
    </View>
    <View style={styles.menuText}>
      <AppText style={styles.menuTitle} numberOfLines={1}>
        {title}
      </AppText>
      <AppText style={styles.menuSubtitle} numberOfLines={1}>
        {subtitle}
      </AppText>
    </View>
  </TouchableOpacity>
);

/* -------------------------------------------------------------------------- */
/*  Screen                                                                    */
/* -------------------------------------------------------------------------- */

const OtherDashboardScreen: React.FC = () => {
  const { auth } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RouteParamList>>();
  const modal = useModal();
  const now = useNow(30000);
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

  const workStartTime = todayData?.branch?.work_start_time || '08:00';
  const workEndTime = todayData?.branch?.work_end_time || '17:00';
  const gracePeriod = todayData?.branch?.grace_period_minutes;
  const isClockOutAllowed = !now.isBefore(getWorkEnd(workEndTime, now));

  const openFaceCamera = (mode: FaceMode) => {
    navigation.navigate('FaceCamera', {
      mode,
      onSuccess: () => fetchTodayData(),
    });
  };

  const handleFaceAction = (mode: FaceMode) => {
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
          () => openFaceCamera('register'),
        );
        return;
      }
    }

    if (mode !== 'register' && todayData && !todayData.is_face_registered) {
      modal.confirm.show(
        'Wajah Belum Terdaftar',
        'Anda harus mendaftarkan master wajah terlebih dahulu sebelum melakukan presensi. Apakah Anda ingin mendaftarkan wajah sekarang?',
        () => openFaceCamera('register'),
      );
      return;
    }

    if (mode === 'clock-in' && dayjs().isAfter(getWorkEnd(workEndTime))) {
      modal.result.error(
        'Jam Masuk Berakhir',
        `Waktu presensi masuk telah berakhir karena jam pulang operasional kantor cabang Anda adalah pukul ${workEndTime}. Anda tercatat Tidak Hadir (Alpa).`,
      );
      fetchTodayData();
      return;
    }

    if (mode === 'clock-out' && dayjs().isBefore(getWorkEnd(workEndTime))) {
      modal.result.error('Belum Jam Pulang', `Presensi pulang belum dibuka. Jam pulang operasional kantor cabang Anda adalah pukul ${workEndTime}.`);
      return;
    }

    openFaceCamera(mode);
  };

  const status = getStatus(todayData);
  const attendance = todayData?.attendance;
  const leave = todayData?.active_leave;
  const showAbsent = todayData?.is_absent || attendance?.status === 'absent' || (!attendance?.clock_in_at && isClockOutAllowed);
  const initials = getInitials(auth?.full_name);

  const renderAttendanceBody = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={color.primary} />
        </View>
      );
    }

    if (todayData?.is_holiday) {
      return (
        <StatePanel
          tone="neutral"
          icon="celebration"
          title={todayData.holiday_name ? `Libur (${todayData.holiday_name})` : 'Hari Libur Kantor'}
          message="Hari ini kantor operasional libur. Anda tidak memiliki kewajiban presensi hari ini."
        />
      );
    }

    if (leave) {
      return (
        <StatePanel
          tone="info"
          icon="beach-access"
          title={LEAVE_TITLE_LABEL[leave.type] ?? 'Sedang Cuti Kerja'}
          message={`Alasan: ${leave.reason}`}
          note={`Periode: ${dayjs(leave.start_date).format('DD MMM')} - ${dayjs(leave.end_date).format('DD MMM YYYY')}`}
        />
      );
    }

    if (showAbsent) {
      return (
        <StatePanel
          tone="danger"
          icon="error-outline"
          title="Tidak Hadir (Alpa)"
          message={`Jam operasional kantor cabang hari ini telah berakhir (${workEndTime}). Anda tercatat tidak melakukan presensi masuk (Alpa).`}
        />
      );
    }

    return (
      <>
        <View style={styles.timesRow}>
          <TimeCell
            icon="login"
            tint="#16a34a"
            label="Jam Masuk"
            time={attendance?.clock_in_at ? dayjs(attendance.clock_in_at).format('HH:mm') : '--:--'}
            extra={attendance?.similarity_score ? `Kecocokan ${Math.round(attendance.similarity_score * 100)}%` : null}
          />
          <View style={styles.timesDivider} />
          <TimeCell
            icon="logout"
            tint="#dc2626"
            label="Jam Pulang"
            time={attendance?.clock_out_at ? dayjs(attendance.clock_out_at).format('HH:mm') : '--:--'}
          />
        </View>

        {!attendance?.clock_in_at ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color.primary }]}
            onPress={() => handleFaceAction('clock-in')}
            activeOpacity={0.85}
            accessibilityRole="button">
            <AppIcon name="photo-camera" size={20} color={color.white} />
            <AppText style={styles.actionButtonText}>Presensi Masuk</AppText>
          </TouchableOpacity>
        ) : !attendance?.clock_out_at ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isClockOutAllowed ? '#ea580c' : '#94a3b8' }]}
            onPress={() => handleFaceAction('clock-out')}
            activeOpacity={0.85}
            accessibilityRole="button">
            <AppIcon name={isClockOutAllowed ? 'photo-camera' : 'schedule'} size={20} color={color.white} />
            <AppText style={styles.actionButtonText}>{isClockOutAllowed ? 'Presensi Pulang' : `Presensi Pulang (${workEndTime})`}</AppText>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBox}>
            <AppIcon name="verified" size={20} color="#16a34a" style={{ marginRight: 8 }} />
            <AppText style={styles.completedText}>Presensi Hari Ini Lengkap</AppText>
          </View>
        )}
      </>
    );
  };

  const menuItems: MenuTileProps[] = [
    {
      icon: 'add-circle-outline',
      tint: '#0284c7',
      background: '#e0f2fe',
      title: 'Ajukan Cuti',
      subtitle: 'Buat pengajuan baru',
      onPress: () => navigation.navigate('LeaveRequestCreate'),
    },
    {
      icon: 'event-note',
      tint: '#d97706',
      background: '#fef3c7',
      title: 'Daftar Cuti',
      subtitle: 'Pantau status',
      onPress: () => navigation.navigate('LeaveRequestList'),
    },
    {
      icon: 'history',
      tint: '#16a34a',
      background: '#dcfce7',
      title: 'Riwayat Absen',
      subtitle: 'Lihat kehadiran',
      onPress: () => navigation.navigate('Attendance'),
    },
    {
      icon: 'face',
      tint: '#7c3aed',
      background: '#f3e8ff',
      title: 'Master Wajah',
      subtitle: 'Kelola biometrik',
      onPress: () => handleFaceAction('register'),
    },
  ];

  return (
    <AppLayout
      scrollable={true}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTodayData(true)} colors={[color.primary]} />}>
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {initials ? <AppText style={styles.avatarText}>{initials}</AppText> : <AppIcon name="person" size={26} color={color.primary} />}
          </View>
          <View style={styles.headerInfo}>
            <AppText style={styles.greeting}>{getGreeting(now.hour())}</AppText>
            <AppText style={styles.userName} numberOfLines={1}>
              {auth?.full_name || 'Karyawan'}
            </AppText>
            <View style={styles.branchRow}>
              <AppIcon name="business" size={13} color={ui.muted} style={{ marginRight: 4 }} />
              <AppText style={styles.branchText} numberOfLines={1}>
                {todayData?.branch?.name || 'Kantor Cabang'}
              </AppText>
            </View>
          </View>
        </View>
      </Card>

      {/* Face registration banners */}
      {todayData && !todayData.is_face_registered && (
        <FaceBanner
          tone="warning"
          icon="face"
          title="Biometrik Wajah Belum Terdaftar"
          message="Daftarkan foto wajah master Anda untuk mengaktifkan fitur presensi."
          actionLabel="Daftarkan Wajah Sekarang"
          onPress={() => handleFaceAction('register')}
        />
      )}

      {todayData && todayData.is_face_registered && todayData.can_update_face && (
        <FaceBanner
          tone="info"
          icon="lock-open"
          title="Izin Ubah Wajah Diberikan"
          message="Admin telah memberikan akses untuk memperbarui master wajah Anda (1 kali)."
          actionLabel="Perbarui Wajah Sekarang"
          onPress={() => handleFaceAction('register')}
        />
      )}

      {/* Hero: tanggal, jam berjalan, dan jadwal cabang */}
      <View style={styles.hero}>
        <AppText style={styles.heroDate}>{now.format('dddd, DD MMMM YYYY')}</AppText>
        <LiveClock />

        <View style={styles.heroSchedule}>
          <View style={styles.heroScheduleItem}>
            <AppText style={styles.heroScheduleLabel}>Jadwal Masuk</AppText>
            <AppText style={styles.heroScheduleValue}>{workStartTime}</AppText>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroScheduleItem}>
            <AppText style={styles.heroScheduleLabel}>Jadwal Pulang</AppText>
            <AppText style={styles.heroScheduleValue}>{workEndTime}</AppText>
          </View>
          {gracePeriod ? (
            <>
              <View style={styles.heroDivider} />
              <View style={styles.heroScheduleItem}>
                <AppText style={styles.heroScheduleLabel}>Toleransi</AppText>
                <AppText style={styles.heroScheduleValue}>{gracePeriod} menit</AppText>
              </View>
            </>
          ) : null}
        </View>
      </View>

      {/* Presensi hari ini */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <AppText style={styles.cardTitle}>Presensi Hari Ini</AppText>
          {status ? <StatusBadge {...status} /> : null}
        </View>
        {renderAttendanceBody()}
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <AppText style={styles.sectionHeading}>Menu & Layanan</AppText>
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <MenuTile key={item.title} {...item} />
          ))}
        </View>
      </View>
    </AppLayout>
  );
};

export default OtherDashboardScreen;

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: color.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: color.primary,
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: ui.muted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 19,
    fontWeight: '700',
    color: ui.ink,
    marginTop: 1,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  branchText: {
    flexShrink: 1,
    fontSize: 12,
    color: ui.muted,
    fontWeight: '500',
  },

  /* Hero */
  hero: {
    backgroundColor: color.primary,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 5,
  },
  heroDate: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  heroTime: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1,
    color: color.white,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  heroSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroScheduleItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroScheduleLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  heroScheduleValue: {
    fontSize: 15,
    fontWeight: '700',
    color: color.white,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  /* Face banners */
  banner: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bannerButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: color.white,
  },

  /* Attendance card */
  card: {
    backgroundColor: color.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ui.line,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: ui.ink,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 28,
    alignItems: 'center',
  },

  /* State panel (libur / cuti / alpa) */
  statePanel: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statePanelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statePanelBody: {
    flex: 1,
  },
  statePanelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  statePanelMessage: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    opacity: 0.9,
  },
  statePanelNote: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },

  /* Clock in / out */
  timesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.line,
    paddingVertical: 14,
    marginBottom: 14,
  },
  timesDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: ui.line,
  },
  timeCell: {
    flex: 1,
    alignItems: 'center',
  },
  timeCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeCellLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: ui.muted,
  },
  timeCellValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: ui.ink,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  timeCellExtra: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
    marginTop: 2,
  },

  /* Action */
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: 14,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: color.white,
  },
  completedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
  },

  /* Menu */
  menuSection: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: ui.ink,
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  menuTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: ui.line,
    borderRadius: 16,
    padding: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: ui.ink,
  },
  menuSubtitle: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
});
