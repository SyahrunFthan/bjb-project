import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { getData, storeData } from '@/lib/storage';
import { AuthFormValues } from '@/model/auth';
import { User } from '@/model/user';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface LoginProps {
  modal: ModalProps;
  values: AuthFormValues;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, 'Auth'>;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
  setAuth: (auth: User | null) => void;
}

export const authLogin = async ({ modal, setProcessing, values, resetForm, setErrors, navigation, setAuth }: LoginProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang mencoba login');
    const response = await api.post('/auth/login/mobile', values);
    if (response.status == 200) {
      const { userData, accessToken } = response.data;
      setAccessToken(accessToken);
      await storeData('auth', userData);
      setAuth(userData);
      processSuccess(modal, 'Berhasil', 'Anda berhasil login', () => {
        processFinish(modal);
        setProcessing(false);
        resetForm();

        if (!userData.registration_at) {
          navigation.replace('Boarding');
        } else {
          if (userData.role_level == 3) {
            navigation.replace('Courier');
          } else if (userData.role_level == 4) {
            navigation.replace('Customer');
          }
        }
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;

    if (axiosError.response?.status == 400) {
      setErrors(axiosError.response?.data);
    } else {
      processFail(modal, 'Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface ChangePasswordProps {
  modal: ModalProps;
  values: {
    current_password?: string;
    password: string;
    confirm_password: string;
  };
  userId: string;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, 'Boarding'>;
  setAuth: (auth: User | null) => void;
  setErrors: (errors: Record<string, string>) => void;
}

export const authChangePasswordBoarding = async ({ modal, values, userId, setProcessing, navigation, setAuth, setErrors }: ChangePasswordProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang memproses perubahan password');
    const response = await api.put(`/auth/change-password/${userId}`, values);
    if (response.status == 200) {
      const storeAuth = await getData('auth');
      if (storeAuth) {
        storeAuth.registration_at = new Date().toISOString();
        await storeData('auth', storeAuth);
        setAuth(storeAuth);
      }

      processSuccess(modal, 'Berhasil', 'Password Anda berhasil diperbarui', () => {
        processFinish(modal);
        setProcessing(false);

        const role = storeAuth?.role_level ?? storeAuth?.user?.role_level;
        if (role === 3) {
          navigation.replace('Courier');
        } else if (role === 4) {
          navigation.replace('Customer');
        } else {
          navigation.replace('Start');
        }
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;

    if (axiosError.response?.status == 400) {
      setErrors(axiosError.response?.data);
      processFail(modal, 'Gagal', 'Ada kesalahan pada pengisian data');
    } else {
      processFail(modal, 'Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface SendEmailVerificationProps {
  modal: ModalProps;
  setSending: (sending: boolean) => void;
}

export const authSendEmailVerification = async ({ modal, setSending }: SendEmailVerificationProps) => {
  try {
    setSending(true);
    processStart(modal, 'Mengirim link verifikasi email...');
    const response = await api.post('/auth/send-verification');
    if (response.status === 200) {
      processSuccess(modal, 'Sukses', response.data.message || 'Tautan verifikasi email berhasil dikirim.');
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengirim email verifikasi.');
  } finally {
    processFinish(modal, () => {
      setSending(false);
    });
  }
};

interface DeleteAccountProps {
  modal: ModalProps;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, any>;
  setAuth: (auth: User | null) => void;
}

export const authDeleteAccount = async ({ modal, setProcessing, navigation, setAuth }: DeleteAccountProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang memproses penghapusan akun...');
    const response = await api.delete('/auth/delete-account');
    if (response.status === 200) {
      setAccessToken('');
      await storeData('auth', null);
      setAuth(null);
      processSuccess(modal, 'Berhasil', 'Akun Anda telah berhasil dihapus.', () => {
        processFinish(modal);
        setProcessing(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Start' }],
        });
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menghapus akun.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface RegularChangePasswordProps {
  modal: ModalProps;
  values: {
    current_password?: string;
    password: string;
    confirm_password: string;
  };
  userId: string;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, any>;
  setErrors: (errors: Record<string, string>) => void;
  onSuccess?: () => void;
}

export const authChangePassword = async ({ modal, values, userId, setProcessing, navigation, setErrors, onSuccess }: RegularChangePasswordProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang memproses perubahan password');
    const response = await api.put(`/auth/change-password/${userId}`, values);
    if (response.status == 200) {
      processSuccess(modal, 'Berhasil', 'Password Anda berhasil diperbarui', () => {
        processFinish(modal);
        setProcessing(false);
        onSuccess?.();
        navigation.goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;

    if (axiosError.response?.status == 400) {
      setErrors(axiosError.response?.data);
      processFail(modal, 'Gagal', 'Ada kesalahan pada pengisian data');
    } else {
      processFail(modal, 'Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

interface LogoutProps {
  modal: ModalProps;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, any>;
  setAuth: (auth: User | null) => void;
}

export const authLogout = async ({ modal, setProcessing, navigation, setAuth }: LogoutProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang keluar...');
    const response = await api.delete('/auth/logout');
    if (response.status === 200) {
      setAccessToken(null);
      await storeData('auth', null);
      setAuth(null);
      processSuccess(modal, 'Berhasil', 'Anda berhasil keluar dari aplikasi', () => {
        processFinish(modal);
        setProcessing(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Start' }],
        });
      });
    }
  } catch (error) {
    // If request fails (e.g. offline), still force local logout
    setAccessToken(null);
    await storeData('auth', null);
    setAuth(null);
    processSuccess(modal, 'Berhasil', 'Anda keluar dari aplikasi', () => {
      processFinish(modal);
      setProcessing(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }],
      });
    });
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
