import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { color } from '@/assets/color';
import AppIcon from '@/components/Icon';
import { AppText } from '@/components/AppText';
import Button from '@/components/Button';
import SectionCard from '@/components/ui/SectionCard';
import { RequirementDocument, CustomerDocument } from '@/model/loan';
import { ModalProps } from '@/contexts/ModalContext';
import { UploadModal } from '@/components/customers/personals/UploadModal';

interface Props {
  customerId?: string;
  requirementDocs: RequirementDocument[];
  uploadedDocs: CustomerDocument[];
  setUploadedDocs: React.Dispatch<React.SetStateAction<CustomerDocument[]>>;
  loadingDocs: boolean;
  modal: ModalProps;
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

      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        customerId={customerId}
        activeReqDoc={activeReqDoc}
        onUploadSuccess={newDoc => {
          if (!activeReqDoc) return;
          setUploadedDocs(prev => {
            const filtered = prev.filter(doc => doc.requirement_document_id !== activeReqDoc.id);
            return [newDoc, ...filtered];
          });
        }}
      />
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
});
