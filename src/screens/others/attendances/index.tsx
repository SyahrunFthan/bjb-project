import React, { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { getAttendanceHistory } from '@/api/attendance';
import { color } from '@/assets/color';
import AppLayout from '@/components/AppLayout';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { AttendanceRecord } from '@/model/attendance';

dayjs.locale('id');

const AttendanceScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const fetchHistory = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) setRefreshing(true);
        else setLoading(true);

        const month = currentDate.month() + 1;
        const year = currentDate.year();
        const res = await getAttendanceHistory(month, year);
        setHistory(res.attendances || []);
      } catch (error) {
        console.error('Error fetching attendance history:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentDate],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => prev.add(1, 'month'));
  };

  // Stats
  const totalPresent = history.filter(h => h.status === 'present').length;
  const totalLate = history.filter(h => h.status === 'late').length;
  const totalLeave = history.filter(h => ['on_leave', 'sick', 'permit'].includes(h.status)).length;
  const totalAbsent = history.filter(h => h.status === 'absent').length;

  const renderStatusBadge = (item: AttendanceRecord) => {
    switch (item.status) {
      case 'present':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#dcfce7' }]}>
            <AppIcon name="check-circle" size={13} color="#15803d" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#15803d' }]}>Tepat Waktu</AppText>
          </View>
        );
      case 'late':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#fef3c7' }]}>
            <AppIcon name="warning" size={13} color="#b45309" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#b45309' }]}>Terlambat</AppText>
          </View>
        );
      case 'sick':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
            <AppIcon name="healing" size={13} color="#b91c1c" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#b91c1c' }]}>Izin Sakit</AppText>
          </View>
        );
      case 'permit':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#f1f5f9' }]}>
            <AppIcon name="event" size={13} color="#475569" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#475569' }]}>Izin</AppText>
          </View>
        );
      case 'on_leave':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#e0e7ff' }]}>
            <AppIcon name="beach-access" size={13} color="#4338ca" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#4338ca' }]}>Cuti</AppText>
          </View>
        );
      case 'absent':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
            <AppIcon name="cancel" size={13} color="#dc2626" style={{ marginRight: 4 }} />
            <AppText style={[styles.statusBadgeText, { color: '#dc2626' }]}>Alpa</AppText>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#f3f4f6' }]}>
            <AppText style={[styles.statusBadgeText, { color: '#6b7280' }]}>{item.status}</AppText>
          </View>
        );
    }
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    return (
      <View style={styles.historyCard}>
        <View style={styles.cardTop}>
          <View>
            <AppText style={styles.itemDate}>{dayjs(item.attendance_date).format('dddd, DD MMMM YYYY')}</AppText>
            {item.similarity_score ? (
              <AppText style={styles.itemSimilarity}>Kecocokan Biometrik: {Math.round(item.similarity_score * 100)}%</AppText>
            ) : null}
          </View>
          {renderStatusBadge(item)}
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeBox}>
            <AppIcon name="login" size={14} color="#16a34a" style={{ marginRight: 4 }} />
            <AppText style={styles.timeLabel}>Masuk: </AppText>
            <AppText style={styles.timeValue}>{item.clock_in_at ? dayjs(item.clock_in_at).format('HH:mm') : '-'}</AppText>
          </View>

          <View style={styles.timeBox}>
            <AppIcon name="logout" size={14} color="#dc2626" style={{ marginRight: 4 }} />
            <AppText style={styles.timeLabel}>Pulang: </AppText>
            <AppText style={styles.timeValue}>{item.clock_out_at ? dayjs(item.clock_out_at).format('HH:mm') : '-'}</AppText>
          </View>
        </View>

        {item.notes ? (
          <View style={styles.notesBox}>
            <AppText style={styles.notesText}>{item.notes}</AppText>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <AppLayout
      scrollable={true}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchHistory(true)} colors={[color.primary]} />}>
      {/* Month Navigator Header */}
      <View style={styles.monthNavCard}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevMonth}>
          <AppIcon name="chevron-left" size={24} color={color.primary} />
        </TouchableOpacity>
        <AppText style={styles.monthTitle}>{currentDate.format('MMMM YYYY')}</AppText>
        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <AppIcon name="chevron-right" size={24} color={color.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#16a34a' }]}>
          <AppText style={styles.statNumber}>{totalPresent}</AppText>
          <AppText style={styles.statLabel}>Hadir</AppText>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#d97706' }]}>
          <AppText style={styles.statNumber}>{totalLate}</AppText>
          <AppText style={styles.statLabel}>Terlambat</AppText>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#6366f1' }]}>
          <AppText style={styles.statNumber}>{totalLeave}</AppText>
          <AppText style={styles.statLabel}>Izin/Cuti</AppText>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
          <AppText style={styles.statNumber}>{totalAbsent}</AppText>
          <AppText style={styles.statLabel}>Alpa</AppText>
        </View>
      </View>

      {/* Attendance Log List */}
      <View style={styles.listHeader}>
        <AppText style={styles.listTitle}>Catatan Presensi Harian</AppText>
        <AppText style={styles.listCount}>{history.length} Catatan</AppText>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat data presensi...</AppText>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyBox}>
          <AppIcon name="event-busy" size={48} color="#94a3b8" />
          <AppText style={styles.emptyTitle}>Belum Ada Catatan Presensi</AppText>
          <AppText style={styles.emptySubtitle}>Tidak ada data presensi pada bulan {currentDate.format('MMMM YYYY')}.</AppText>
        </View>
      ) : (
        <FlatList data={history} keyExtractor={item => item.id} renderItem={renderItem} scrollEnabled={false} />
      )}
    </AppLayout>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  monthNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderLeftWidth: 4,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  listCount: {
    fontSize: 12,
    color: '#64748b',
  },
  historyCard: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemSimilarity: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  timeValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  notesBox: {
    marginTop: 8,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  emptyBox: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
