import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { Employee } from '@/model/employee';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface ProfileUpdateProps {
  modal: ModalProps;
  values: any;
  setProcessing: (processing: boolean) => void;
  onSuccess?: () => void;
}

interface ProfileFetchProps {
  modal: ModalProps;
  setData: (data: Employee) => void;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const employeeProfileFetched = async ({ setData, modal, setRefreshing }: ProfileFetchProps) => {
  try {
    processStart(modal, 'Memuat profile...');
    const response = await api.get('/mobile/employees/profile');
    if (response.data?.success) {
      setData(response.data.data);
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal memuat profil');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal memuat profil');
  } finally {
    processFinish(modal, () => {
      if (setRefreshing) setRefreshing(false);
    });
  }
};

export const employeeProfileUpdated = async ({ modal, values, setProcessing, onSuccess }: ProfileUpdateProps) => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang menyimpan profil...');
    const response = await api.put('/mobile/employees/profile', values);
    if (response.data?.success) {
      processSuccess(modal, 'Berhasil', 'Data pribadi berhasil diperbarui', () => {
        onSuccess?.();
      });
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal menyimpan profil');
    }
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal menyimpan profil');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
