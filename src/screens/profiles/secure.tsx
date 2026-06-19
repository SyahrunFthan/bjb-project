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
import { authChangePassword } from '@/api/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<RouteParamList, 'Secure'>;

const SecureScreen = ({ navigation }: Props) => {
  const { auth } = useAuth();
  const modal = useModal();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Password rules checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const handleInputChange = (field: string, val: string) => {
    if (field === 'current_password') setCurrentPassword(val);
    if (field === 'password') setNewPassword(val);
    if (field === 'confirm_password') setConfirmPassword(val);

    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleUpdate = () => {
    const localErrors: Record<string, string> = {};

    if (!currentPassword) {
      localErrors.current_password = 'Password saat ini wajib diisi';
    }

    if (!newPassword) {
      localErrors.password = 'Password baru wajib diisi';
    } else {
      if (!hasMinLength) localErrors.password = 'Password minimal 8 karakter';
      else if (!hasUppercase) localErrors.password = 'Password harus mengandung minimal satu huruf kapital';
      else if (!hasLowercase) localErrors.password = 'Password harus mengandung minimal satu huruf kecil';
      else if (!hasNumber) localErrors.password = 'Password harus mengandung minimal satu angka';
      else if (!hasSpecial) localErrors.password = 'Password harus mengandung minimal satu karakter spesial';
    }

    if (!confirmPassword) {
      localErrors.confirm_password = 'Konfirmasi password wajib diisi';
    } else if (confirmPassword !== newPassword) {
      localErrors.confirm_password = 'Konfirmasi password tidak cocok';
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    if (!auth?.id) {
      modal.result.error('Error', 'Sesi pengguna tidak valid. Silakan login kembali.');
      return;
    }

    authChangePassword({
      modal,
      values: {
        current_password: currentPassword,
        password: newPassword,
        confirm_password: confirmPassword,
      },
      userId: auth.id,
      setProcessing: setIsProcessing,
      navigation,
      setErrors,
      onSuccess: () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    });
  };

  const renderRule = (isValid: boolean, text: string) => (
    <View style={styles.ruleItem}>
      <AppIcon 
        name={isValid ? 'check-circle' : 'radio-button-unchecked'} 
        size={16} 
        color={isValid ? '#10B981' : color.neutral} 
      />
      <AppText style={[styles.ruleText, isValid ? styles.ruleTextValid : null]}>
        {text}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={color.white} barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="arrow-back" size={20} color={color.black} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle} variant="semiBold">Keamanan Akun</AppText>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <AppIcon name="lock" size={24} color={color.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <AppText variant="bold" style={styles.infoTitle}>
                Ubah Password Akun
              </AppText>
              <AppText style={styles.infoDesc}>
                Untuk menjaga keamanan akun Anda, ganti kata sandi secara berkala dengan kombinasi karakter yang unik.
              </AppText>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Current Password Input */}
            <Input
              label="Password Saat Ini"
              value={currentPassword}
              onChangeText={(val) => handleInputChange('current_password', val)}
              secureTextEntry={!showCurrentPassword}
              placeholder="Masukkan password saat ini"
              error={errors.current_password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <AppIcon 
                    name={showCurrentPassword ? 'visibility-off' : 'visibility'} 
                    size={20} 
                    color={color.neutral} 
                  />
                </TouchableOpacity>
              }
            />

            {/* New Password Input */}
            <Input
              label="Password Baru"
              value={newPassword}
              onChangeText={(val) => handleInputChange('password', val)}
              secureTextEntry={!showNewPassword}
              placeholder="Masukkan password baru"
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <AppIcon 
                    name={showNewPassword ? 'visibility-off' : 'visibility'} 
                    size={20} 
                    color={color.neutral} 
                  />
                </TouchableOpacity>
              }
            />

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.rulesContainer}>
                <AppText variant="semiBold" style={styles.rulesLabel}>Kriteria Password Baru:</AppText>
                {renderRule(hasMinLength, 'Minimal 8 karakter')}
                {renderRule(hasUppercase, 'Minimal satu huruf kapital (A-Z)')}
                {renderRule(hasLowercase, 'Minimal satu huruf kecil (a-z)')}
                {renderRule(hasNumber, 'Minimal satu angka (0-9)')}
                {renderRule(hasSpecial, 'Minimal satu karakter spesial (contoh: @, #, $, dll.)')}
              </View>
            )}

            {/* Confirm New Password Input */}
            <Input
              label="Konfirmasi Password Baru"
              value={confirmPassword}
              onChangeText={(val) => handleInputChange('confirm_password', val)}
              secureTextEntry={!showConfirmPassword}
              placeholder="Ulangi password baru"
              error={errors.confirm_password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <AppIcon 
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                    size={20} 
                    color={color.neutral} 
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Perbarui Password"
              onPress={handleUpdate}
              disabled={isProcessing}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SecureScreen;

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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 11,
    color: '#2563EB',
    lineHeight: 16,
  },
  formContainer: {
    backgroundColor: color.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  rulesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  rulesLabel: {
    fontSize: 11,
    color: color.neutral,
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ruleText: {
    fontSize: 11,
    color: color.neutral,
  },
  ruleTextValid: {
    color: '#065F46',
    fontWeight: '500',
  },
  actionButton: {
    marginTop: 8,
    width: '100%',
  },
});
