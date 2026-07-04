import { getData, removeData, storeData } from '@/lib/storage';
import { isSensorAvailable, simplePrompt as biometricPrompt } from '@sbaiahmed1/react-native-biometrics';
import { useCallback, useEffect, useState } from 'react';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

interface UseBiometricReturn {
  isBiometricAvailable: boolean;
  biometricType: string | null;
  isBiometricEnabled: boolean;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticate: (promptMessage?: string) => Promise<boolean>;
}

export const useBiometric = (): UseBiometricReturn => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { available, biometryType } = await isSensorAvailable();
        setIsBiometricAvailable(available);
        if (available && biometryType) {
          setBiometricType(biometryType);
        }
        const enabled = await getData(BIOMETRIC_ENABLED_KEY);
        setIsBiometricEnabled(!!enabled);
      } catch {
        setIsBiometricAvailable(false);
      }
    };
    init();
  }, []);

  const enableBiometric = useCallback(async () => {
    await storeData(BIOMETRIC_ENABLED_KEY, true);
    setIsBiometricEnabled(true);
  }, []);

  const disableBiometric = useCallback(async () => {
    await removeData(BIOMETRIC_ENABLED_KEY);
    setIsBiometricEnabled(false);
  }, []);

  const authenticate = useCallback(async (promptMessage = 'Verifikasi identitas Anda'): Promise<boolean> => {
    try {
      const { success } = await biometricPrompt(promptMessage);
      return success;
    } catch {
      return false;
    }
  }, []);

  return {
    isBiometricAvailable,
    biometricType,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    authenticate,
  };
};

export const getBiometricLabel = (biometryType: string | null): string => {
  if (biometryType === 'FaceID') return 'Face ID';
  if (biometryType === 'TouchID') return 'Touch ID';
  return 'Fingerprint';
};
