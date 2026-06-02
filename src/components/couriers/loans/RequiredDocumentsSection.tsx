import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { color } from '@/assets/color';
import AppIcon from '@/components/Icon';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import SectionCard from '@/components/ui/SectionCard';
import { RequirementDocument, CustomerDocument } from '@/model/loan';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { uploadCustomerDocSimulated, uploadCustomerDocument } from '@/api/loan';
import { ModalProps } from '@/contexts/ModalContext';

interface Props {
  customerId?: string;
  requirementDocs: RequirementDocument[];
  uploadedDocs: CustomerDocument[];
  setUploadedDocs: React.Dispatch<React.SetStateAction<CustomerDocument[]>>;
  loadingDocs: boolean;
  modal: ModalProps;
}

interface SimulatedOption {
  label: string;
  file: string;
}

const RequiredDocumentsSection = ({
  customerId,
  requirementDocs,
  uploadedDocs,
  setUploadedDocs,
  loadingDocs,
  modal,
}: Props) => {
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [activeReqDoc, setActiveReqDoc] = useState<RequirementDocument | null>(null);

  const handleOpenUpload = (reqDoc: RequirementDocument) => {
    setActiveReqDoc(reqDoc);
    setUploadModalVisible(true);
  };

  const handleSimulateUpload = (fileName: string) => {
    if (!customerId || !activeReqDoc) return;
    setUploadModalVisible(false);

    uploadCustomerDocSimulated(customerId, activeReqDoc.id, fileName, modal, newDoc => {
      setUploadedDocs(prev => {
        const filtered = prev.filter(doc => doc.requirement_document_id !== activeReqDoc.id);
        return [newDoc, ...filtered];
      });
    });
  };

  const handleLaunchCamera = async () => {
    if (!customerId || !activeReqDoc) return;
    setUploadModalVisible(false);

    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Izin Kamera',
            message: 'Aplikasi membutuhkan akses kamera untuk memotret dokumen.',
            buttonNeutral: 'Tanya Nanti',
            buttonNegative: 'Batal',
            buttonPositive: 'Setuju',
          }
        );
        if (hasPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          modal.result.error('Izin Ditolak', 'Aplikasi tidak memiliki izin untuk menggunakan kamera.');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        modal.result.error('Kamera Gagal', result.errorMessage || 'Gagal membuka kamera.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        uploadCustomerDocument(
          customerId,
          activeReqDoc.id,
          asset.fileName || 'camera_photo.jpg',
          asset.uri as string,
          asset.type as string,
          modal,
          newDoc => {
            setUploadedDocs(prev => {
              const filtered = prev.filter(doc => doc.requirement_document_id !== activeReqDoc.id);
              return [newDoc, ...filtered];
            });
          },
        );
      }
    } catch (err) {
      console.error('launchCamera error:', err);
      modal.result.error('Kesalahan', 'Terjadi kesalahan sistem saat membuka kamera.');
    }
  };

  const handleLaunchGallery = async () => {
    if (!customerId || !activeReqDoc) return;
    setUploadModalVisible(false);

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        modal.result.error('Galeri Gagal', result.errorMessage || 'Gagal membuka galeri.');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        uploadCustomerDocument(
          customerId,
          activeReqDoc.id,
          asset.fileName || 'gallery_photo.jpg',
          asset.uri as string,
          asset.type as string,
          modal,
          newDoc => {
            setUploadedDocs(prev => {
              const filtered = prev.filter(doc => doc.requirement_document_id !== activeReqDoc.id);
              return [newDoc, ...filtered];
            });
          },
        );
      }
    } catch (err) {
      console.error('launchImageLibrary error:', err);
      modal.result.error('Kesalahan', 'Terjadi kesalahan sistem saat membuka galeri.');
    }
  };

  const getSimulatedFileOptions = (docName: string): SimulatedOption[] => {
    const normalized = docName.toLowerCase();
    if (normalized.includes('ktp') || normalized.includes('identitas')) {
      return [
        { label: 'Ambil Foto KTP (Kamera)', file: 'ktp_nasabah_asli.jpg' },
        { label: 'Pilih dari Galeri (Scan KTP)', file: 'scan_ktp_color.jpg' },
        { label: 'File Dokumen (ktp_verified.pdf)', file: 'ktp_verified.pdf' },
      ];
    } else if (normalized.includes('keluarga') || normalized.includes('kk')) {
      return [
        { label: 'Ambil Foto KK (Kamera)', file: 'kartu_keluarga_terbaru.jpg' },
        { label: 'Pilih dari Galeri (Scan KK)', file: 'scan_kartu_keluarga.jpg' },
        { label: 'File Dokumen (kk_digital.pdf)', file: 'kk_digital.pdf' },
      ];
    } else if (normalized.includes('gaji') || normalized.includes('slip') || normalized.includes('pendapatan')) {
      return [
        { label: 'Pilih Slip Gaji Bulan Ini (PDF)', file: 'slip_gaji_mei_2026.pdf' },
        { label: 'Foto Slip Gaji (Kamera)', file: 'foto_slip_gaji.jpg' },
        { label: 'Surat Keterangan Penghasilan.pdf', file: 'surat_penghasilan.pdf' },
      ];
    } else {
      return [
        { label: 'Ambil Foto Dokumen (Kamera)', file: `foto_${normalized.replace(/\s+/g, '_')}.jpg` },
        { label: 'Pilih Dokumen PDF (File)', file: `${normalized.replace(/\s+/g, '_')}_document.pdf` },
      ];
    }
  };

  const totalRequiredDocs = requirementDocs.filter(d => d.is_required).length;
  const uploadedRequiredDocsCount = requirementDocs
    .filter(d => d.is_required)
    .filter(d => uploadedDocs.some(u => u.requirement_document_id === d.id)).length;

  return (
    <>
      <SectionCard
        icon="folder-open"
        iconBg="#DCFCE7"
        iconColor="#15803D"
        title={`Dokumen Persyaratan ${customerId ? `(${uploadedRequiredDocsCount}/${totalRequiredDocs})` : ''}`}>
        {!customerId ? (
          <View style={styles.documentPlaceholder}>
            <AppIcon name="lock" size={24} color={color.neutral} />
            <AppText style={styles.placeholderText}>Pilih nasabah terlebih dahulu untuk melihat dan mengunggah dokumen persyaratan.</AppText>
          </View>
        ) : loadingDocs ? (
          <View style={styles.docsSpinner}>
            <ActivityIndicator size="small" color={color.primary} />
            <AppText style={styles.loadingText}>Memuat status dokumen...</AppText>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {requirementDocs.map(doc => {
              const uploaded = uploadedDocs.find(u => u.requirement_document_id === doc.id);
              return (
                <View key={doc.id} style={styles.docItem}>
                  <View style={styles.docInfo}>
                    <View style={styles.docNameRow}>
                      <AppText variant="medium" style={styles.docName}>
                        {doc.name}
                      </AppText>
                      <View style={[styles.badge, doc.is_required ? styles.badgeRequired : styles.badgeOptional]}>
                        <AppText style={[styles.badgeText, doc.is_required ? styles.badgeRequiredText : styles.badgeOptionalText]}>
                          {doc.is_required ? 'Wajib' : 'Opsional'}
                        </AppText>
                      </View>
                    </View>

                    {uploaded ? (
                      <View style={styles.docStatusUploaded}>
                        <AppIcon name="check-circle" size={14} color="#15803D" />
                        <AppText style={styles.uploadedText} numberOfLines={1}>
                          Sudah diunggah ({uploaded.file_name})
                        </AppText>
                      </View>
                    ) : (
                      <View style={styles.docStatusEmpty}>
                        <AppIcon name="warning" size={14} color="#A16207" />
                        <AppText style={styles.emptyText}>Belum diunggah</AppText>
                      </View>
                    )}
                  </View>

                  <Button
                    title={uploaded ? 'Ganti' : 'Unggah'}
                    type={uploaded ? 'outline' : 'default'}
                    size="small"
                    onPress={() => handleOpenUpload(doc)}
                    style={styles.uploadBtn}
                  />
                </View>
              );
            })}
          </View>
        )}
      </SectionCard>

      <Modal visible={uploadModalVisible} transparent={true} animationType="slide" onRequestClose={() => setUploadModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setUploadModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="bold" style={styles.modalTitle}>
                {activeReqDoc ? `Unggah: ${activeReqDoc.name}` : 'Unggah Dokumen'}
              </AppText>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <AppIcon name="close" size={24} color={color.black} />
              </TouchableOpacity>
            </View>

            <AppText style={styles.modalSubtitle}>Pilih metode pengambilan dokumen di bawah ini:</AppText>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
              <TouchableOpacity style={styles.optionItem} onPress={handleLaunchCamera} activeOpacity={0.7}>
                <View style={styles.optionIconContainer}>
                  <AppIcon name="photo-camera" size={20} color={color.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="medium" style={styles.optionLabel}>
                    Ambil Foto dari Kamera
                  </AppText>
                  <AppText style={styles.optionFile}>Memotret dokumen secara langsung</AppText>
                </View>
                <AppIcon name="chevron-right" size={20} color={color.neutral} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem} onPress={handleLaunchGallery} activeOpacity={0.7}>
                <View style={styles.optionIconContainer}>
                  <AppIcon name="photo-library" size={20} color={color.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="medium" style={styles.optionLabel}>
                    Pilih Foto dari Galeri
                  </AppText>
                  <AppText style={styles.optionFile}>Memilih foto dokumen dari galeri hp</AppText>
                </View>
                <AppIcon name="chevron-right" size={20} color={color.neutral} />
              </TouchableOpacity>

              <View style={styles.simulatedSection}>
                <AppText style={styles.simulatedTitle}>— ATAU SIMULASI UPLOAD —</AppText>
                {activeReqDoc &&
                  getSimulatedFileOptions(activeReqDoc.name).map((opt, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.optionItem, { marginTop: 8 }]}
                      onPress={() => handleSimulateUpload(opt.file)}
                      activeOpacity={0.7}>
                      <View style={styles.optionIconContainer}>
                        <AppIcon name={opt.file.endsWith('.pdf') ? 'picture-as-pdf' : 'image'} size={20} color={color.neutral} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText variant="medium" style={[styles.optionLabel, { color: color.neutral }]}>
                          {opt.label}
                        </AppText>
                        <AppText style={styles.optionFile}>Simulasi file: {opt.file}</AppText>
                      </View>
                      <AppIcon name="chevron-right" size={20} color={color.neutral} />
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default RequiredDocumentsSection;

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: color.neutral,
  },
  documentPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 18,
  },
  docsSpinner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFD',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: color.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  docInfo: {
    flex: 1,
    marginRight: 10,
    gap: 4,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docName: {
    fontSize: 13,
    color: color.black,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeRequired: {
    backgroundColor: color.tertiary + '15',
  },
  badgeOptional: {
    backgroundColor: color.neutral + '15',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  badgeRequiredText: {
    color: color.tertiary,
  },
  badgeOptionalText: {
    color: color.neutral,
  },
  docStatusUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadedText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '500',
    flex: 1,
  },
  docStatusEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    fontSize: 11,
    color: '#A16207',
    fontWeight: '500',
  },
  uploadBtn: {
    minWidth: 70,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: color.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: color.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: color.black,
  },
  modalSubtitle: {
    fontSize: 13,
    color: color.neutral,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: color.border,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: color.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    color: color.black,
  },
  optionFile: {
    fontSize: 11,
    color: color.neutral,
    marginTop: 2,
  },
  simulatedSection: {
    marginTop: 16,
    paddingBottom: 20,
  },
  simulatedTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: color.neutral,
    textAlign: 'center',
    marginBottom: 8,
  },
});
