import { authLogin, authLoginWithBiometric } from '@/api/auth';
import { color } from '@/assets/color';
import { AppLogo } from '@/assets/images';
import AuthBackground from '@/components/AuthBackground';
import Button from '@/components/Button';
import AppIcon from '@/components/Icon';
import Input from '@/components/Input';
import TermsModal from '@/components/TermsModal';
import { useAuth } from '@/contexts/AuthContext';
import { Rules, useFormContext } from '@/contexts/FormContext';
import { getBiometricLabel, useBiometric } from '@/hooks/useBiometric';
import { useModal } from '@/hooks/useModal';
import { getData, storeData } from '@/lib/storage';
import { AuthFormValues } from '@/model/auth';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AuthScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RouteParamList, 'Auth'> }) => {
  const { setAuth } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { values, errors, register, unregister, setValue, validateForm, resetForm, setErrors } = useFormContext();
  const modal = useModal();
  const [accepted, setAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const { isBiometricAvailable, isBiometricEnabled, biometricType, enableBiometric, authenticate } = useBiometric();

  useEffect(() => {
    const checkTerms = async () => {
      const hasAccepted = await getData('has_accepted_terms');
      if (hasAccepted) {
        setAccepted(true);
      } else {
        setShowTermsModal(true);
      }
    };
    checkTerms();
  }, []);

  useEffect(() => {
    register('email', [Rules.required('Email wajib diisi'), Rules.email('Format email tidak valid')]);
    register('password', [Rules.required('Password wajib diisi')]);
    return () => {
      unregister('email');
      unregister('password');
    };
  }, [register, unregister]);

  const handleAcceptTerms = async () => {
    await storeData('has_accepted_terms', true);
    setAccepted(true);
    setShowTermsModal(false);
  };

  // Auto-trigger biometric if enabled when screen mounts
  useEffect(() => {
    const tryBiometric = async () => {
      if (isBiometricAvailable && isBiometricEnabled) {
        const hasAuth = await getData('auth');
        if (!hasAuth) return;
        const success = await authenticate('Masuk ke Koperasi BJB');
        if (success) {
          authLoginWithBiometric({ modal, navigation, setAuth, setProcessing });
        }
      }
    };
    tryBiometric();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBiometricAvailable, isBiometricEnabled]);

  const handleBiometricLogin = async () => {
    const success = await authenticate('Masuk ke Koperasi BJB');
    if (success) {
      authLoginWithBiometric({ modal, navigation, setAuth, setProcessing });
    }
  };

  const promptEnableBiometric = () => {
    if (!isBiometricAvailable || isBiometricEnabled) return;
    Alert.alert('Aktifkan Login Biometrik?', `Gunakan ${getBiometricLabel(biometricType)} untuk masuk lebih cepat di lain waktu.`, [
      { text: 'Nanti', style: 'cancel' },
      {
        text: 'Aktifkan',
        onPress: async () => {
          await enableBiometric();
        },
      },
    ]);
  };

  const handleLogin = () => {
    if (!accepted) {
      setShowTermsModal(true);
      return;
    }
    if (validateForm()) {
      authLogin({
        navigation,
        modal,
        resetForm,
        setErrors,
        setProcessing,
        values: values as unknown as AuthFormValues,
        setAuth,
        onSuccess: promptEnableBiometric,
      });
    }
  };

  return (
    <AuthBackground>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.subtitle}>Secure access to your data</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="EMAIL"
            placeholder="Enter your email"
            value={values.email as string}
            onChangeText={val => setValue('email', val)}
            error={errors.email}
            leftIcon={<AppIcon name="person" size={20} color={color.neutral} />}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="PASSWORD"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={values.password as string}
            onChangeText={val => setValue('password', val)}
            error={errors.password}
            leftIcon={<AppIcon name="lock" size={20} color={color.neutral} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <AppIcon name="visibility-off" size={20} color={color.neutral} />
                ) : (
                  <AppIcon name="visibility" size={20} color={color.neutral} />
                )}
              </TouchableOpacity>
            }
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Login" disabled={processing} size="large" style={styles.loginButton} onPress={handleLogin} />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.biometricContainer}>
            <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin} disabled={processing} activeOpacity={0.7}>
              <AppIcon name={Platform.OS === 'android' ? 'fingerprint' : 'face'} size={32} color={color.primary} />
              <Text style={styles.biometricText}>{getBiometricLabel(biometricType)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TermsModal visible={showTermsModal} onAccept={handleAcceptTerms} onClose={() => setShowTermsModal(false)} />
    </AuthBackground>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: color.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 36,
    height: 36,
    tintColor: color.white,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: color.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: color.neutral,
    textAlign: 'center',
  },
  card: {
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: color.primary,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    borderRadius: 12,
    height: 56,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: color.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: color.neutral,
    fontWeight: '600',
  },
  biometricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  biometricButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  biometricText: {
    fontSize: 12,
    color: color.neutral,
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: color.neutral,
  },
  registerText: {
    color: color.primary,
    fontWeight: '700',
  },
});
