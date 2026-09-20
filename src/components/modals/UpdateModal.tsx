import React, { useEffect } from 'react';
import {
  BackHandler,
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';

interface UpdateModalProps {
  visible: boolean;
  forceUpdate: boolean;
  title: string;
  message: string;
  latestVersionName?: string;
  notes?: string[];
  updateUrl: string;
  onClose?: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  forceUpdate,
  title,
  message,
  latestVersionName,
  notes = [],
  updateUrl,
  onClose,
}) => {
  // Cegah tombol back hardware Android jika update bersifat wajib (force update)
  useEffect(() => {
    if (!visible || !forceUpdate) return;

    const onBackPress = () => true; // Swallow back press
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => subscription.remove();
  }, [visible, forceUpdate]);

  const handleOpenStore = async () => {
    try {
      const targetUrl = updateUrl || 'https://play.google.com/store/apps/details?id=com.koprasione';
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        // Fallback ke browser jika market:// protocol gagal
        await Linking.openURL('https://play.google.com/store/apps/details?id=com.koprasione');
      }
    } catch (err) {
      console.warn('Gagal membuka tautan Play Store:', err);
      // Fallback terakhir
      try {
        await Linking.openURL('https://play.google.com/store/apps/details?id=com.koprasione');
      } catch (fallbackErr) {
        console.error('Fallback URL juga gagal:', fallbackErr);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!forceUpdate && onClose) {
          onClose();
        }
      }}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Badge & Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: forceUpdate ? '#fee2e2' : color.primary + '18' }]}>
              <AppIcon
                name={forceUpdate ? 'system-security-update-warning' : 'system-update'}
                size={38}
                color={forceUpdate ? '#dc2626' : color.primary}
              />
            </View>
          </View>

          {latestVersionName ? (
            <View style={styles.versionBadge}>
              <AppText style={styles.versionBadgeText}>Versi Baru {latestVersionName}</AppText>
            </View>
          ) : null}

          {/* Title & Description */}
          <AppText style={styles.title}>{title}</AppText>
          <AppText style={styles.message}>{message}</AppText>

          {/* Release Notes */}
          {notes && notes.length > 0 ? (
            <View style={styles.notesCard}>
              <AppText style={styles.notesHeader}>Yang baru di versi ini:</AppText>
              {notes.map((item, index) => (
                <View key={index} style={styles.noteItem}>
                  <AppIcon name="check-circle" size={14} color="#16a34a" style={{ marginTop: 2 }} />
                  <AppText style={styles.noteText}>{item}</AppText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: color.primary }]}
              onPress={handleOpenStore}
              activeOpacity={0.85}>
              <AppIcon name="launch" size={18} color={color.white} style={{ marginRight: 8 }} />
              <AppText style={styles.primaryButtonText}>Perbarui Sekarang</AppText>
            </TouchableOpacity>

            {!forceUpdate && onClose ? (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <AppText style={styles.secondaryButtonText}>Nanti Saja</AppText>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  notesCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 18,
  },
  notesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  buttonStack: {
    width: '100%',
    gap: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: color.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
});
