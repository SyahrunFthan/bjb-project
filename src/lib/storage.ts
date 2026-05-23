import AsyncStorage from '@react-native-async-storage/async-storage';

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
