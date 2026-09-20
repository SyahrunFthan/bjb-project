import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Image, Modal, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

import { MaterialIconsIconName } from '@react-native-vector-icons/material-icons/static';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import Config from 'react-native-config';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelLeaveRequest, fetchLeaveRequestDetail } from '@/api/leaveRequest';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import Card from '@/components/Card';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { LeaveRequest, LeaveStatus } from '@/model/leaveRequest';
import { RouteParamList } from '@/types/navigation';

import { getLeaveTypeLabel } from '@/constants/leaveRequest';
import 'dayjs/locale/id';

dayjs.locale('id');

type Props = NativeStackScreenProps<RouteParamList, 'LeaveRequestDetail'>;

const LeaveRequestDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const modal = useModal();

  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);

  const loadData = () => {
    fetchLeaveRequestDetail(id, setLeave, setLoading, modal);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCancel = () => {
    modal.confirm.show('Batalkan Permohonan?', 'Apakah Anda yakin ingin membatalkan pengajuan cuti/izin ini?', () => {
      cancelLeaveRequest({
        id,
        modal,
        setProcessing,
        onSuccess: () => {
          loadData();
        },
      });
    });
  };

  const getStatusConfig = (
    status: LeaveStatus,
  ): {
    title: string;
    subtitle: string;
    bg: string;
    border: string;
    text: string;
    icon: MaterialIconsIconName;
  } => {
    switch (status) {
      case 'approved':
        return {
          title: 'Pengajuan Disetujui',
          subtitle: 'Permohonan Anda telah disetujui oleh atasan.',
          bg: '#DCFCE7',
          border: '#86EFAC',
          text: '#15803D',
          icon: 'check-circle',
        };
      case 'rejected':
        return {
          title: 'Pengajuan Ditolak',
          subtitle: 'Permohonan Anda tidak disetujui oleh atasan.',
          bg: '#FEE2E2',
          border: '#FCA5A5',
          text: '#B91C1C',
          icon: 'cancel',
        };
      case 'cancelled':
        return {
          title: 'Pengajuan Dibatalkan',
          subtitle: 'Permohonan ini telah dibatalkan oleh Anda.',
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#64748B',
          icon: 'remove-circle-outline',
        };
      case 'completed':
        return {
          title: 'Selesai',
          subtitle: 'Pengajuan ini telah selesai',
          bg: '#DCFCE7',
          border: '#86EFAC',
          text: '#15803D',
          icon: 'check-circle',
        };
      case 'pending':
      default:
        return {
          title: 'Menunggu Persetujuan',
          subtitle: 'Permohonan sedang menunggu peninjauan atasan.',
          bg: '#FEF9C3',
          border: '#FDE047',
          text: '#A16207',
          icon: 'hourglass-top',
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={color.white} barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <AppIcon name="arrow-back" size={20} color={color.black} />
          </TouchableOpacity>
          <AppText style={styles.headerTitle} variant="bold">
            Detail Pengajuan
          </AppText>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat detail...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (!leave) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={color.white} barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <AppIcon name="arrow-back" size={20} color={color.black} />
          </TouchableOpacity>
          <AppText style={styles.headerTitle} variant="bold">
            Detail Pengajuan
          </AppText>
        </View>
        <View style={styles.loadingContainer}>
          <AppText style={styles.loadingText}>Data pengajuan tidak ditemukan.</AppText>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(leave.status);
  const startFormatted = dayjs(leave.start_date).format('dddd, DD MMMM YYYY');
  const endFormatted = dayjs(leave.end_date).format('dddd, DD MMMM YYYY');
  const createdFormatted = dayjs(leave.createdAt).format('DD MMM YYYY, HH:mm');

  const fullAttachmentUrl = leave.attachment_url
    ? leave.attachment_url.startsWith('http')
      ? leave.attachment_url
      : `${Config.API_URL}${leave.attachment_url}`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="bold">
          Detail Pengajuan
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
          <View style={[styles.statusIconBox, { backgroundColor: statusConfig.text + '20' }]}>
            <AppIcon name={statusConfig.icon} size={24} color={statusConfig.text} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bold" style={[styles.statusTitle, { color: statusConfig.text }]}>
              {statusConfig.title}
            </AppText>
            <AppText style={[styles.statusSubtitle, { color: statusConfig.text }]}>{statusConfig.subtitle}</AppText>
          </View>
        </View>

        {/* Rejection Note Alert if rejected */}
        {leave.status === 'rejected' && leave.rejection_note && (
          <View style={styles.rejectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <AppIcon name="error-outline" size={16} color="#DC2626" />
              <AppText variant="bold" style={{ color: '#DC2626', fontSize: 13 }}>
                Catatan Penolakan:
              </AppText>
            </View>
            <AppText style={styles.rejectionText}>{leave.rejection_note}</AppText>
          </View>
        )}

        {/* Card: Rincian Permohonan */}
        <Card style={styles.detailCard} variant="elevated">
          <AppText variant="bold" style={styles.sectionHeading}>
            Informasi Permohonan
          </AppText>

          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Jenis Pengajuan</AppText>
            <View style={styles.typeBadge}>
              <AppText variant="bold" style={styles.typeBadgeText}>
                {getLeaveTypeLabel(leave.type)}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Total Durasi</AppText>
            <AppText variant="bold" style={styles.infoValueHighlight}>
              {leave.total_days} Hari Kerja
            </AppText>
          </View>

          <View style={styles.divider} />

          {leave.start_date === leave.end_date ? (
            <View style={styles.infoBlock}>
              <AppText style={styles.infoLabel}>Tanggal Pelaksanaan</AppText>
              <AppText variant="semiBold" style={styles.infoValue}>
                {startFormatted}
              </AppText>
            </View>
          ) : (
            <>
              <View style={styles.infoBlock}>
                <AppText style={styles.infoLabel}>Tanggal Mulai</AppText>
                <AppText variant="semiBold" style={styles.infoValue}>
                  {startFormatted}
                </AppText>
              </View>

              <View style={styles.infoBlock}>
                <AppText style={styles.infoLabel}>Tanggal Selesai</AppText>
                <AppText variant="semiBold" style={styles.infoValue}>
                  {endFormatted}
                </AppText>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <AppText style={styles.infoLabel}>Waktu Pengajuan</AppText>
            <AppText style={styles.infoValue}>{createdFormatted}</AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <AppText style={styles.infoLabel}>Keterangan & Alasan</AppText>
            <AppText style={styles.reasonBlockText}>{leave.reason}</AppText>
          </View>
        </Card>

        {/* Card: Petugas Pengganti / Handover */}
        <Card style={styles.detailCard} variant="elevated">
          <AppText variant="bold" style={styles.sectionHeading}>
            Petugas Pengganti (Backup Penagihan)
          </AppText>

          {leave.replacement_employee ? (
            <View style={styles.replacementBox}>
              <View style={styles.avatarCircle}>
                <AppIcon name="person" size={22} color={color.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bold" style={styles.replacementName}>
                  {leave.replacement_employee.full_name}
                </AppText>
                <AppText style={styles.replacementId}>ID Petugas: {leave.replacement_employee.employee_id}</AppText>
              </View>
            </View>
          ) : (
            <View style={styles.emptyReplacementBox}>
              <AppIcon name="info-outline" size={16} color="#94A3B8" />
              <AppText style={styles.emptyReplacementText}>
                {leave.status === 'pending'
                  ? 'Akan ditentukan oleh Pimpinan Cabang saat persetujuan.'
                  : 'Tidak ada petugas pengganti yang ditugaskan.'}
              </AppText>
            </View>
          )}
        </Card>

        {/* Card: Lampiran Surat Dokter / Berkas Bukti */}
        {fullAttachmentUrl && (
          <Card style={styles.detailCard} variant="elevated">
            <AppText variant="bold" style={styles.sectionHeading}>
              Lampiran Surat Dokter / Berkas
            </AppText>

            <TouchableOpacity activeOpacity={0.85} onPress={() => setImageModalVisible(true)} style={styles.attachmentPreviewContainer}>
              <Image source={{ uri: fullAttachmentUrl }} style={styles.attachmentImage} resizeMode="cover" />
              <View style={styles.zoomOverlay}>
                <AppIcon name="zoom-in" size={18} color={color.white} />
                <AppText variant="semiBold" style={styles.zoomText}>
                  Ketuk untuk memperbesar foto
                </AppText>
              </View>
            </TouchableOpacity>
          </Card>
        )}

        {/* Cancel Button (hanya jika pending) */}
        {leave.status === 'pending' && (
          <View style={styles.cancelContainer}>
            <Button
              title={processing ? 'Sedang Membatalkan...' : 'Batalkan Permohonan'}
              loading={processing}
              disabled={processing}
              onPress={handleCancel}
              style={styles.cancelBtn}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal Zoom Gambar Surat Dokter */}
      {fullAttachmentUrl && (
        <Modal visible={imageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
          <View style={styles.imageModalContainer}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setImageModalVisible(false)} activeOpacity={0.7}>
              <AppIcon name="close" size={24} color={color.white} />
            </TouchableOpacity>
            <Image source={{ uri: fullAttachmentUrl }} style={styles.fullScreenImage} resizeMode="contain" />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default LeaveRequestDetailScreen;

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
    fontSize: 16,
    color: color.black,
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    marginBottom: 14,
  },
  rejectionText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  detailCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoBlock: {
    paddingVertical: 6,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
  },
  infoValueHighlight: {
    fontSize: 14,
    color: color.primary,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    color: color.primary,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  reasonBlockText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  replacementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replacementName: {
    fontSize: 13,
    color: '#0F172A',
  },
  replacementId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emptyReplacementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  emptyReplacementText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  attachmentPreviewContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    height: 200,
    backgroundColor: '#0F172A',
  },
  attachmentImage: {
    width: '100%',
    height: '100%',
  },
  zoomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  zoomText: {
    fontSize: 11,
    color: color.white,
  },
  cancelContainer: {
    marginTop: 6,
  },
  cancelBtn: {
    backgroundColor: '#DC2626',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenImage: {
    width: '94%',
    height: '80%',
  },
});
