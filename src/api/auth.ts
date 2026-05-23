import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { setAccessToken } from '@/lib/auth';
import { storeData } from '@/lib/storage';
import { AuthFormValues } from '@/model/auth';
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

        if (userData.role_level == 3) {
          navigation.replace('Courier');
        } else if (userData.role_level == 4) {
          navigation.replace('Customer');
        }
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError<Record<string, string>>;
    console.log(axiosError.response);

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
