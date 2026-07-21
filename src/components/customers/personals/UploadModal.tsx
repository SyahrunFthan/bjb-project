import { uploadCustomerDocument } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { CustomerDocument, RequirementDocument } from '@/model/loan';
import { errorCodes, isErrorWithCode, pick } from '@react-native-documents/picker';
import React from 'react';
import { Modal, PermissionsAndroid, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
  customerId?: string;
  activeReqDoc: RequirementDocument | null;
  onUploadSuccess: (newDoc: CustomerDocument) => void;
}

export const UploadModal = ({ visible, onClose, customerId, activeReqDoc, onUploadSuccess }: Props) => {
  const modal = useModal();

  const handleLaunchFilePicker = async () => {
    if (!customerId || !activeReqDoc) return;
    onClose();

    try {
      const result = await pick({
        type: ['application/pdf'],
      });

      if (result && result.length > 0) {
        const file = result[0];
        uploadCustomerDocument(customerId, activeReqDoc.id, file.name || 'document.pdf', file.uri, file.type || 'application/pdf', modal, newDoc => {
          onUploadSuccess(newDoc);
        });
      }
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.warn('DocumentPicker error:', err);
      modal.result.error('Pilih Berkas Gagal', 'Gagal memilih dokumen PDF.');
    }
  };

  const handleLaunchCamera = async () => {
    if (!customerId || !activeReqDoc) return;
    onClose();

    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: 'Izin Kamera',
          message: 'Aplikasi membutuhkan akses kamera untuk memotret dokumen.',
          buttonNeutral: 'Tanya Nanti',
          buttonNegative: 'Batal',
          buttonPositive: 'Setuju',
        });
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
            onUploadSuccess(newDoc);
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
    onClose();

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
            onUploadSuccess(newDoc);
          },
        );
      }
    } catch (err) {
      console.error('launchImageLibrary error:', err);
      modal.result.error('Kesalahan', 'Terjadi kesalahan sistem saat membuka galeri.');
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <AppText variant="bold" style={styles.modalTitle}>
              {activeReqDoc ? `Unggah: ${activeReqDoc.name}` : 'Unggah Dokumen'}
            </AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <AppIcon name="close" size={24} color={color.black} />
            </TouchableOpacity>
          </View>

          {activeReqDoc?.document_type === 'pdf' && (
            <View style={styles.pdfAlertBanner}>
              <AppIcon name="info" size={16} color="#DC2626" />
              <AppText style={styles.pdfAlertText}>PENTING: Dokumen ini wajib diunggah dalam format berkas PDF digital (bukan foto/kamera).</AppText>
            </View>
          )}

          <AppText style={styles.modalSubtitle}>Pilih metode pengambilan dokumen di bawah ini:</AppText>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
            {(activeReqDoc?.document_type === 'pdf' || activeReqDoc?.document_type === 'all') && (
              <TouchableOpacity style={styles.optionItem} onPress={handleLaunchFilePicker} activeOpacity={0.7}>
                <View style={[styles.optionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <AppIcon name="picture-as-pdf" size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="medium" style={[styles.optionLabel, { color: '#DC2626', fontWeight: '600' }]}>
                    Pilih Berkas PDF dari HP
                  </AppText>
                  <AppText style={styles.optionFile}>Pilih dokumen .pdf dari penyimpanan perangkat</AppText>
                </View>
                <AppIcon name="chevron-right" size={20} color={color.neutral} />
              </TouchableOpacity>
            )}

            {activeReqDoc?.document_type !== 'pdf' && (
              <>
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
              </>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: color.neutral,
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 10,
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
  pdfAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 14,
  },
  pdfAlertText: {
    flex: 1,
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '500',
    lineHeight: 16,
  },
});
