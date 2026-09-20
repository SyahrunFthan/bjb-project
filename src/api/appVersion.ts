import api from '@/lib/api';
import { AppVersionResponse } from '@/model/appVersion';
import { APP_VERSION } from '@/constants/appVersion';
import { Platform } from 'react-native';

export const checkAppVersion = async (): Promise<AppVersionResponse | null> => {
  try {
    const response = await api.get<AppVersionResponse>('/settings/app-version', {
      params: {
        version_code: APP_VERSION.code,
        platform: Platform.OS,
      },
    });
    return response.data;
  } catch (error) {
    console.warn('Failed to check app version:', error);
    return null;
  }
};
