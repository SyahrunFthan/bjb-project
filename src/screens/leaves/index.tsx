import React, { useCallback, useState } from 'react';

import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { MaterialIconsIconName } from '@react-native-vector-icons/material-icons/static';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchLeaveRequests } from '@/api/leaveRequest';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { LeaveRequest, LeaveStatus } from '@/model/leaveRequest';
import { RouteParamList } from '@/types/navigation';

import EmptyData from '@/components/ui/EmptyData';
import { getLeaveTypeLabel } from '@/constants/leaveRequest';
import 'dayjs/locale/id';

dayjs.locale('id');

type Props = NativeStackScreenProps<RouteParamList, 'LeaveRequestList'>;

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Menunggu', value: 'pending' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Ditolak', value: 'rejected' },
  { label: 'Selesai', value: 'completed' },
];

const LeaveRequestListScreen = ({ navigation }: Props) => {
  const modal = useModal();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const loadData = useCallback(
    (isRefresh = false) => {
      fetchLeaveRequests(activeTab, setRequests, setLoading, modal, isRefresh ? setRefreshing : undefined);
    },
    [activeTab, modal],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const getStatusBadge = (status: LeaveStatus): { label: string; bg: string; text: string; icon: MaterialIconsIconName } => {
    switch (status) {
      case 'approved':
        return { label: 'Disetujui', bg: '#DCFCE7', text: '#15803D', icon: 'check-circle' };
      case 'rejected':
        return { label: 'Ditolak', bg: '#FEE2E2', text: '#B91C1C', icon: 'cancel' };
      case 'cancelled':
        return { label: 'Dibatalkan', bg: '#F3F4F6', text: '#6B7280', icon: 'remove-circle-outline' };
      case 'completed':
        return { label: 'Selesai', bg: '#DCFCE7', text: '#15803D', icon: 'check-circle' };
      case 'pending':
      default:
        return { label: 'Menunggu', bg: '#FEF9C3', text: '#A16207', icon: 'hourglass-top' };
    }
  };

  const getTypeBadge = (type: string): { label: string; bg: string; text: string; icon: MaterialIconsIconName } => {
    switch (type) {
      case 'marriage_employee':
        return { label: 'Karyawan Menikah', bg: '#FDF2F8', text: '#BE185D', icon: 'favorite' };
      case 'marriage_sibling':
        return { label: 'Saudara Menikah', bg: '#FDF4FF', text: '#A21CAF', icon: 'favorite-border' };
      case 'child_circumcision_baptism':
        return { label: 'Khitan/Baptis Anak', bg: '#FEF3C7', text: '#B45309', icon: 'child-care' };
      case 'death_main_family':
        return { label: 'Duka Cita Inti', bg: '#F1F5F9', text: '#334155', icon: 'sentiment-very-dissatisfied' };
      case 'wife_childbirth_miscarriage':
        return { label: 'Istri Melahirkan', bg: '#FCE7F3', text: '#9D174D', icon: 'pregnant-woman' };
      case 'death_household_member':
        return { label: 'Duka Serumah', bg: '#F3F4F6', text: '#4B5563', icon: 'home' };
      case 'sick_leave':
        return { label: 'Izin Sakit', bg: '#FFF1F2', text: '#E11D48', icon: 'medical-services' };
      case 'urgent_personal':
        return { label: 'Cuti Penting', bg: '#EFF6FF', text: '#1D4ED8', icon: 'priority-high' };
      case 'annual_leave':
        return { label: 'Cuti Tahunan', bg: '#EFF6FF', text: '#2563EB', icon: 'beach-access' };
      case 'permit':
        return { label: 'Izin Pribadi', bg: '#FAF5FF', text: '#9333EA', icon: 'event-note' };
      case 'maternity_leave':
        return { label: 'Cuti Khusus', bg: '#ECFDF5', text: '#059669', icon: 'family-restroom' };
      default:
        return { label: getLeaveTypeLabel(type), bg: '#F1F5F9', text: '#475569', icon: 'assignment' };
    }
  };

  const renderItem = ({ item }: { item: LeaveRequest }) => {
    const status = getStatusBadge(item.status);
    const type = getTypeBadge(item.type);
    const startFormatted = dayjs(item.start_date).format('DD MMM YYYY');
    const endFormatted = dayjs(item.end_date).format('DD MMM YYYY');

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('LeaveRequestDetail', { id: item.id })}>
        <Card style={styles.cardItem} variant="elevated">
          {/* Header Row: Type Badge & Status Badge */}
          <View style={styles.cardHeader}>
            <View style={[styles.badgeContainer, { backgroundColor: type.bg }]}>
              <AppIcon name={type.icon} size={13} color={type.text} />
              <AppText variant="semiBold" style={[styles.badgeText, { color: type.text }]}>
                {type.label}
              </AppText>
            </View>

            <View style={[styles.badgeContainer, { backgroundColor: status.bg }]}>
              <AppIcon name={status.icon} size={12} color={status.text} />
              <AppText variant="bold" style={[styles.badgeText, { color: status.text }]}>
                {status.label}
              </AppText>
            </View>
          </View>

          {/* Date Range & Total Days */}
          <View style={styles.dateRow}>
            <AppIcon name="date-range" size={16} color={color.primary} />
            <AppText variant="bold" style={styles.dateText}>
              {startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`}
            </AppText>
            <View style={styles.daysPill}>
              <AppText variant="bold" style={styles.daysPillText}>
                {item.total_days} Hari Kerja
              </AppText>
            </View>
          </View>

          {/* Reason */}
          <AppText style={styles.reasonText} numberOfLines={2}>
            {item.reason}
          </AppText>

          {/* Footer Info: Replacement / Attachment */}
          <View style={styles.cardFooter}>
            {item.replacement_employee ? (
              <View style={styles.footerInfoItem}>
                <AppIcon name="swap-horiz" size={14} color="#64748B" />
                <AppText style={styles.footerInfoText} numberOfLines={1}>
                  Backup: {item.replacement_employee.full_name}
                </AppText>
              </View>
            ) : (
              <View />
            )}

            {item.attachment_url && (
              <View style={styles.attachmentBadge}>
                <AppIcon name="attach-file" size={12} color="#2563EB" />
                <AppText style={styles.attachmentText}>Surat Dokter</AppText>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="bold">
          Riwayat Cuti & Izin
        </AppText>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        {FILTER_TABS.map(tab => {
          const isActive = activeTab === tab.value;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              activeOpacity={0.7}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}>
              <AppText variant={isActive ? 'bold' : 'medium'} style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat pengajuan...</AppText>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={[color.primary]} />}
          ListEmptyComponent={
            <EmptyData
              description={
                activeTab === 'all'
                  ? 'Anda belum pernah membuat pengajuan cuti, sakit, atau izin.'
                  : `Tidak ada pengajuan dengan status '${activeTab}'.`
              }
            />
          }
        />
      )}

      {/* Bottom Floating Action Bar */}
      <View style={styles.bottomBar}>
        <Button title="+ Ajukan Cuti / Izin" onPress={() => navigation.navigate('LeaveRequestCreate')} />
      </View>
    </SafeAreaView>
  );
};

export default LeaveRequestListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    height: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    color: color.black,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: color.primary,
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
  },
  tabTextActive: {
    color: color.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 85,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  cardItem: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  daysPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#BFDBFE',
  },
  daysPillText: {
    fontSize: 11,
    color: '#1D4ED8',
  },
  reasonText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '65%',
  },
  footerInfoText: {
    fontSize: 11,
    color: '#64748B',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attachmentText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 4,
  },
});
