import { authChangePasswordBoarding } from '@/api/auth';
import { color } from '@/assets/color';
import { AppLogo } from '@/assets/images';
import AuthBackground from '@/components/AuthBackground';
import Button from '@/components/Button';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';
import { getData } from '@/lib/storage';
import { RouteParamList } from '@/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = NativeStackScreenProps<RouteParamList, 'Boarding'>;

const BoardingScreen = ({ navigation }: Props) => {
  const { auth, setAuth } = useAuth();
  const modal = useModal();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, val: string) => {
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

  const handleUpdatePassword = async () => {
    const localErrors: Record<string, string> = {};

    if (!newPassword) {
      localErrors.password = 'Password baru wajib diisi';
    } else {
      if (newPassword.length < 8) {
        localErrors.password = 'Password minimal 8 karakter';
      }
      if (!/[A-Z]/.test(newPassword)) {
        localErrors.password = 'Password harus mengandung minimal satu huruf kapital';
      }
      if (!/[a-z]/.test(newPassword)) {
        localErrors.password = 'Password harus mengandung minimal satu huruf kecil';
      }
      if (!/[0-9]/.test(newPassword)) {
        localErrors.password = 'Password harus mengandung minimal satu angka';
      }
      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        localErrors.password = 'Password harus mengandung minimal satu karakter spesial';
      }
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

    const storeAuth = await getData('auth');

    if (!storeAuth?.id) {
      modal.result.error('Error', 'Sesi pengguna tidak valid. Silakan login kembali.');
      return;
    }

    authChangePasswordBoarding({
      modal,
      values: {
        password: newPassword,
        confirm_password: confirmPassword,
      },
      userId: storeAuth.id,
      setProcessing,
      navigation,
      setAuth,
      setErrors,
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == 'android' ? 'padding' : 'height'} enabled>
      <AuthBackground>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Aktivasi Keamanan</Text>
            <Text style={styles.subtitle}>
              Untuk melindungi akun Anda, Anda wajib mengubah kata sandi sementara yang diberikan sebelum masuk ke dashboard.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.securityBadge}>
              <AppIcon name="security" size={24} color={color.primary} />
              <Text style={styles.securityBadgeText}>Ubah Password Pertama Kali</Text>
            </View>

            <Input
              label="Password"
              placeholder="Masukkan password"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={val => handleInputChange('password', val)}
              error={errors.password}
              leftIcon={<AppIcon name="lock" size={20} color={color.neutral} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <AppIcon name={showNewPassword ? 'visibility-off' : 'visibility'} size={20} color={color.neutral} />
                </TouchableOpacity>
              }
              autoCapitalize="none"
            />

            <Input
              label="Konfirmasi Password"
              placeholder="Masukkan password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={val => handleInputChange('confirm_password', val)}
              error={errors.confirm_password}
              leftIcon={<AppIcon name="verified-user" size={20} color={color.neutral} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <AppIcon name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={20} color={color.neutral} />
                </TouchableOpacity>
              }
              autoCapitalize="none"
            />

            <Button
              title="Simpan & Lanjutkan"
              disabled={processing}
              loading={processing}
              style={styles.submitButton}
              onPress={handleUpdatePassword}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>PT. Bare Jaya Berdikari</Text>
          </View>
        </ScrollView>
      </AuthBackground>
    </KeyboardAvoidingView>
  );
};

export default BoardingScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: color.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: color.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: color.neutral,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: color.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: color.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0F4FF',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: color.primary,
  },
  submitButton: {
    marginTop: 8,
    width: '100%',
    height: 48,
    borderRadius: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: color.neutral,
    fontWeight: '500',
  },
});
