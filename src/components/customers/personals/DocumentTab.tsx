import { fetchCustomerDocuments, fetchRequirementDocs } from '@/api/loan';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import { useModal } from '@/hooks/useModal';
import { CustomerDocument, RequirementDocument } from '@/model/loan';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { UploadModal } from './UploadModal';

interface Props {
  customerId: string;
  refreshing?: boolean;
}

export const DocumentTab = ({ customerId, refreshing }: Props) => {
  const modal = useModal();

  const [requirementDocs, setRequirementDocs] = useState<RequirementDocument[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<CustomerDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [activeReqDoc, setActiveReqDoc] = useState<RequirementDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!customerId) return;
    try {
      await fetchRequirementDocs(setRequirementDocs, setLoadingDocs, modal);
      await fetchCustomerDocuments(customerId, setUploadedDocs, setLoadingDocs, modal);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  }, [customerId, modal]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshing]);

  const handleOpenUpload = (reqDoc: RequirementDocument) => {
    setActiveReqDoc(reqDoc);
    setUploadModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.tabSectionTitle}>
        Dokumen Persyaratan
      </AppText>
      {loadingDocs ? (
        <View style={styles.docsSpinner}>
          <ActivityIndicator size="small" color={color.primary} />
          <AppText style={styles.loadingText}>Memuat status dokumen...</AppText>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {requirementDocs.map(doc => {
            const uploaded = uploadedDocs.find(u => u.requirement_document_id === doc.id);
            return (
              <View key={doc.id} style={[styles.docItem, uploaded ? styles.docItemUploaded : styles.docItemEmpty]}>
                <View style={[styles.docLeftIconContainer, uploaded ? styles.docLeftIconUploaded : styles.docLeftIconEmpty]}>
                  <AppIcon name={uploaded ? 'article' : 'insert-drive-file'} size={22} color={uploaded ? '#10B981' : '#F59E0B'} />
                </View>

                <View style={styles.docInfo}>
                  <View style={styles.docNameRow}>
                    <AppText variant="semiBold" style={styles.docName}>
                      {doc.name}
                    </AppText>
                    <View style={[styles.badge, doc.is_required ? styles.badgeRequired : styles.badgeOptional]}>
                      <AppText style={[styles.badgeText, doc.is_required ? styles.badgeRequiredText : styles.badgeOptionalText]}>
                        {doc.is_required ? 'Wajib' : 'Opsional'}
                      </AppText>
                    </View>
                  </View>

                  {uploaded ? (
                    <AppText style={styles.uploadedText} numberOfLines={1}>
                      {uploaded.file_name}
                    </AppText>
                  ) : (
                    <AppText style={styles.emptyText}>Belum diunggah</AppText>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.actionIconButton, uploaded ? styles.actionIconBtnEdit : styles.actionIconBtnAdd]}
                  onPress={() => handleOpenUpload(doc)}
                  activeOpacity={0.7}>
                  <AppIcon name={uploaded ? 'edit' : 'add-photo-alternate'} size={18} color={uploaded ? color.primary : color.white} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <UploadModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        customerId={customerId}
        activeReqDoc={activeReqDoc}
        onUploadSuccess={newDoc => {
          setUploadedDocs(prev => {
            const filtered = prev.filter(doc => doc.requirement_document_id !== activeReqDoc?.id);
            return [newDoc, ...filtered];
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabSectionTitle: {
    fontSize: 15,
    color: color.black,
    marginBottom: 16,
    paddingLeft: 4,
  },
  docsSpinner: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
    color: color.neutral,
  },
  listContainer: {
    gap: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1.5,
  },
  docItemUploaded: {
    borderLeftColor: '#10B981',
  },
  docItemEmpty: {
    borderLeftColor: '#F59E0B',
  },
  docLeftIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docLeftIconUploaded: {
    backgroundColor: '#EFFDF5',
  },
  docLeftIconEmpty: {
    backgroundColor: '#FFFBEB',
  },
  docInfo: {
    flex: 1,
    marginRight: 12,
    gap: 3,
  },
  docNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  docName: {
    fontSize: 14,
    color: color.black,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
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
  uploadedText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionIconBtnAdd: {
    backgroundColor: color.primary,
    borderColor: color.primary,
  },
  actionIconBtnEdit: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
});
