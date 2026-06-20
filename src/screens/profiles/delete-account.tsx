import React, { useState } from 'react';
import { 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '@/assets/color';
import { AppText } from '@/components/AppText';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { authDeleteAccount } from '@/api/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RouteParamList, 'DeleteAccount'>;

const DeleteAccountScreen = ({ navigation }: Props) => {
  const { setAuth } = useAuth();
  const modal = useModal();
  const [confirmation, setConfirmation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const isValidConfirmation = confirmation === 'HAPUS AKUN SAYA';

  const handleDelete = () => {
    if (!isValidConfirmation) return;
    
    authDeleteAccount({
      modal,
      setProcessing: setIsProcessing,
      navigation,
      setAuth,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">Hapus Akun</AppText>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Warning Banner */}
          <View style={styles.warningCard}>
            <View style={styles.warningIconContainer}>
              <AppIcon name="delete-forever" size={24} color={color.tertiary} />
            </View>
            <View style={styles.warningTextContainer}>
              <AppText variant="bold" style={styles.warningTitle}>
                Pemberitahuan Penting
              </AppText>
              <AppText style={styles.warningDesc}>
                Menghapus akun akan mencabut seluruh hak akses masuk Anda ke aplikasi Koperasi Pinjaman PT. Bare Jaya Berdikari. Tindakan ini permanen.
              </AppText>
            </View>
          </View>

          {/* Retention Policy Box */}
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <AppIcon name="security" size={18} color={color.primary} />
              <AppText variant="bold" style={styles.policyTitle}>Kebijakan Retensi Data Koperasi</AppText>
            </View>
            <AppText style={styles.policyDesc}>
              Sesuai dengan ketentuan operasional Kementerian Koperasi & UKM RI, data keanggotaan, histori transaksi pinjaman, dan laporan audit Anda <AppText variant="bold">TIDAK akan dihapus</AppText> dari basis data utama demi pematutan laporan keuangan koperasi secara berkala. Hanya akun login (kredensial aplikasi) Anda saja yang akan dinonaktifkan sepenuhnya.
            </AppText>
          </View>

          {/* Confirmation Prompt */}
          <View style={styles.formCard}>
            <AppText variant="medium" style={styles.promptLabel}>
              Ketik kalimat konfirmasi di bawah ini untuk melanjutkan:
            </AppText>
            
            <View style={styles.targetPhraseBox}>
              <AppText variant="bold" style={styles.targetPhrase}>
                HAPUS AKUN SAYA
              </AppText>
            </View>

            <Input
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="Ketik kalimat konfirmasi di sini"
              autoCapitalize="characters"
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Hapus Akun Sekarang"
              onPress={handleDelete}
              disabled={!isValidConfirmation || isProcessing}
              style={[
                styles.deleteButton,
                isValidConfirmation && !isProcessing ? { backgroundColor: color.tertiary } : null
              ]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 0.5,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: color.black,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  warningIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 4,
  },
  warningDesc: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 16,
  },
  policyCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 13,
    color: '#1E40AF',
  },
  policyDesc: {
    fontSize: 11,
    color: '#2563EB',
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  promptLabel: {
    fontSize: 12,
    color: color.black,
    lineHeight: 18,
    marginBottom: 12,
  },
  targetPhraseBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginBottom: 16,
  },
  targetPhrase: {
    fontSize: 15,
    color: '#475569',
    letterSpacing: 1.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  deleteButton: {
    width: '100%',
  },
});
