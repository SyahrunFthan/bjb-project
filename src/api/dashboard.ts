import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail } from '@/lib/process';
import { CourierDashboard, CourierDashboardResponse } from '@/model/dashboard';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

interface DashboardCourierProps {
  modal: ModalProps;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setRefreshing: Dispatch<SetStateAction<boolean>>;
  setDashboardData: Dispatch<SetStateAction<CourierDashboard | null>>;
}

export const dashboardCourierGet = async ({ setLoading, setRefreshing, setDashboardData, modal }: DashboardCourierProps) => {
  try {
    setLoading(true);
    const response = await api.get<CourierDashboardResponse>('/dashboard');
    setDashboardData(response.data?.data);
  } catch (err) {
    const axiosError = err as AxiosError<Error>;
    processFail(modal, 'Error', axiosError.response?.data?.message || 'Network Error');
  } finally {
    setTimeout(() => {
      setLoading(false);
      setRefreshing(false);
    }, 200);
  }
};
