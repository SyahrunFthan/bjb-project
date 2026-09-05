import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail } from '@/lib/process';
import { RecentPayment } from '@/model/dashboard';
import { CustomerMonitoringItem, Installment, MonitoringSummary } from '@/model/loan';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface PaymentMeta {
  total?: number;
  page?: number;
  limit?: number;
  has_more?: boolean;
}

interface PaymentActivityProps {
  modal: ModalProps;
  search: string;
  page?: number;
  limit?: number;
  setRecentPayments: (list: RecentPayment[], meta?: PaymentMeta) => void;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
}

export const recentPaymentGet = async ({ modal, search, page = 1, limit = 20, setLoading, setRecentPayments, setRefreshing }: PaymentActivityProps) => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/payments/activity`, {
      params: { search, page, limit },
    });
    if (response.status === 200) {
      setRecentPayments(response.data.data, response.data.meta);
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
  date?: string;
  page?: number;
  limit?: number;
  setDataList: (
    list: CustomerMonitoringItem[],
    meta?: { total?: number; page?: number; limit?: number; has_more?: boolean },
    summary?: MonitoringSummary
  ) => void;
  setSummary?: (summary: MonitoringSummary) => void;
  setLoading?: Dispatch<SetStateAction<boolean>>;
  setRefreshing?: Dispatch<SetStateAction<boolean>>;
}

export const monitoringGetItems = async ({
  modal,
  month,
  date,
  search,
  page = 1,
  limit = 20,
  setDataList,
  setSummary,
  status,
  setLoading,
  setRefreshing,
}: PaymentMonitoringProps) => {
  try {
    const response = await api.get(`/mobile/payments/monitoring`, {
      params: {
        search,
        status: status !== 'ALL' ? status : undefined,
        month,
        date,
        page,
        limit,
      },
    });

    if (response.data.summary && setSummary) {
      setSummary(response.data.summary);
    }
    setDataList(response.data.data, response.data.meta, response.data.summary);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Ada kesalahan saat mengambil data');
  } finally {
    setLoading?.(false);
    setRefreshing?.(false);
  }
};
