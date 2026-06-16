import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { storeData, getData } from '@/lib/storage';
import { AuthFormValues } from '@/model/auth';
import { User } from '@/model/user';
import { RouteParamList } from '@/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface LoginProps {
  process: ModalProps['process'];
  result: ModalProps['result'];
  values: AuthFormValues;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, 'Auth'>;
  setErrors: (errors: Record<string, string>) => void;
  resetForm: () => void;
}

export const authLogin = async ({ process, result, setProcessing, values, resetForm, setErrors, navigation }: LoginProps) => {
  try {
    setProcessing(true);
    process.show('Sedang mencoba login');
    const response = await api.post('/auth/login/mobile', values);
    if (response.status == 200) {
      const { userData, accessToken } = response.data;
      setAccessToken(accessToken);
      await storeData('auth', userData);
      result.success('Berhasil', 'Anda berhasil login', () => {
        process.hide();
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
      result.error('Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    process.hide();
    setProcessing(false);
  }
};

interface ChangePasswordProps {
  process: ModalProps['process'];
  result: ModalProps['result'];
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

export const authChangePasswordBoarding = async ({
  process,
  result,
  values,
  userId,
  setProcessing,
  navigation,
  setAuth,
  setErrors,
}: ChangePasswordProps) => {
  try {
    setProcessing(true);
    process.show('Sedang memproses perubahan password');
    const response = await api.put(`/auth/change-password/${userId}`, values);
    if (response.status == 200) {
      const storeAuth = await getData('auth');
      if (storeAuth) {
        storeAuth.registration_at = new Date().toISOString();
        await storeData('auth', storeAuth);
        setAuth(storeAuth);
      }

      result.success('Berhasil', 'Password Anda berhasil diperbarui', () => {
        process.hide();
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
      result.error('Gagal', 'Ada kesalahan pada pengisian data');
    } else {
      result.error('Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    process.hide();
    setProcessing(false);
  }
};

interface SendEmailVerificationProps {
  process: ModalProps['process'];
  result: ModalProps['result'];
  setSending: (sending: boolean) => void;
}

export const authSendEmailVerification = async ({
  process,
  result,
  setSending,
}: SendEmailVerificationProps) => {
  try {
    setSending(true);
    process.show('Mengirim link verifikasi email...');
    const response = await api.post('/auth/send-verification');
    if (response.status === 200) {
      result.success('Sukses', response.data.message || 'Tautan verifikasi email berhasil dikirim.');
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;
    result.error('Gagal', axiosError.response?.data?.message || 'Gagal mengirim email verifikasi.');
  } finally {
    process.hide();
    setSending(false);
  }
};

interface DeleteAccountProps {
  process: ModalProps['process'];
  result: ModalProps['result'];
  setProcessing: Dispatch<SetStateAction<boolean>>;
  navigation: NativeStackNavigationProp<RouteParamList, any>;
  setAuth: (auth: User | null) => void;
}

export const authDeleteAccount = async ({
  process,
  result,
  setProcessing,
  navigation,
  setAuth,
}: DeleteAccountProps) => {
  try {
    setProcessing(true);
    process.show('Sedang memproses penghapusan akun...');
    const response = await api.delete('/auth/delete-account');
    if (response.status === 200) {
      setAccessToken('');
      await storeData('auth', null);
      setAuth(null);
      result.success('Berhasil', 'Akun Anda telah berhasil dihapus.', () => {
        process.hide();
        setProcessing(false);
        navigation.replace('Start');
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;
    result.error('Gagal', axiosError.response?.data?.message || 'Gagal menghapus akun.');
  } finally {
    process.hide();
    setProcessing(false);
  }
};

interface RegularChangePasswordProps {
  process: ModalProps['process'];
  result: ModalProps['result'];
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

export const authChangePassword = async ({
  process,
  result,
  values,
  userId,
  setProcessing,
  navigation,
  setErrors,
  onSuccess,
}: RegularChangePasswordProps) => {
  try {
    setProcessing(true);
    process.show('Sedang memproses perubahan password');
    const response = await api.put(`/auth/change-password/${userId}`, values);
    if (response.status == 200) {
      result.success('Berhasil', 'Password Anda berhasil diperbarui', () => {
        process.hide();
        setProcessing(false);
        onSuccess?.();
        navigation.goBack();
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;

    if (axiosError.response?.status == 400) {
      setErrors(axiosError.response?.data);
      result.error('Gagal', 'Ada kesalahan pada pengisian data');
    } else {
      result.error('Error', axiosError.response?.data?.message || 'Network Error');
    }
  } finally {
    process.hide();
    setProcessing(false);
  }
};
