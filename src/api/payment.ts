import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail } from '@/lib/process';
import { RecentPayment } from '@/model/dashboard';
import { Installment } from '@/model/loan';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface PaymentActivityProps {
  modal: ModalProps;
  search: string;
  setRecentPayments: Dispatch<SetStateAction<RecentPayment[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const recentPaymentGet = async ({ modal, search, setLoading, setRecentPayments, setRefreshing }: PaymentActivityProps) => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/payments/activity?search=${search}`);
    if (response.status === 200) {
      setRecentPayments(response.data);
    }
  } catch (error) {
    const axiosError = error as AxiosError<Error>;
    processFail(modal, 'Gagal', axiosError.response?.data.message || 'Ada kesalahan saat mengambil data');
  } finally {
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 200);
  }
};

interface PaymentMonitoringProps {
  modal: ModalProps;
  status: string;
  search: string;
  month: string;
  setDataList: Dispatch<SetStateAction<Installment[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const monitoringGetItems = async ({ modal, month, search, setDataList, status, setLoading, setRefreshing }: PaymentMonitoringProps) => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/payments/monitoring`, {
      params: {
        search,
        status: status !== 'ALL' ? status : undefined,
        month,
      },
    });
    setDataList(response.data.data);
  } catch (error) {
    const axiosError = error as AxiosError<Error>;
    processFail(modal, 'Gagal', axiosError.response?.data.message || 'Ada kesalahan saat mengambil data');
  } finally {
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 200);
  }
};
