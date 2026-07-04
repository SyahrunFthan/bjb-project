import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

// --- Secure Credential Storage (Android Keystore / iOS Keychain) ---
// Menggunakan react-native-encrypted-storage:
// - Android: EncryptedSharedPreferences (Android Keystore System, hardware-backed)
// - iOS: Keychain Services
// Data TIDAK dapat dibaca meskipun device di-root.

const SECURE_KEY = 'user_credentials';

export const storeSecureCredentials = async (email: string, password: string): Promise<void> => {
  await EncryptedStorage.setItem(SECURE_KEY, JSON.stringify({ email, password }));
};

export const getSecureCredentials = async (): Promise<{ email: string; password: string } | null> => {
  try {
    const raw = await EncryptedStorage.getItem(SECURE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const removeSecureCredentials = async (): Promise<void> => {
  await EncryptedStorage.removeItem(SECURE_KEY);
};

// --- General Storage ---

export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw error;
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (error) {
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};
