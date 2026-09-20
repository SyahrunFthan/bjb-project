import { Dispatch, SetStateAction } from 'react';

import { AxiosError } from 'axios';

import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail, processFinish, processStart, processSuccess } from '@/lib/process';
import { Colleague, LeaveRequest } from '@/model/leaveRequest';

interface ErrorResponse {
  message?: string;
}

export interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface LeaveRequestCreateParams {
  type: string;
  start_date?: string;
  end_date?: string;
  reason: string;
  replacement_employee_id?: string;
  file?: SelectedFile | null;
}

export const fetchLeaveRequests = async (
  status: string,
  setData: Dispatch<SetStateAction<LeaveRequest[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
  setRefreshing?: Dispatch<SetStateAction<boolean>>,
): Promise<void> => {
  try {
    if (!setRefreshing) {
      setLoading(true);
    }
    const response = await api.get(`/mobile/leave-requests?status=${status}`);
    const listData = (response.data?.data || []) as LeaveRequest[];
    setData(listData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching leave requests:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal memuat daftar pengajuan cuti/izin.');
  } finally {
    setLoading(false);
    if (setRefreshing) {
      setRefreshing(false);
    }
  }
};

export const fetchLeaveRequestDetail = async (
  id: string,
  setData: Dispatch<SetStateAction<LeaveRequest | null>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    setLoading(true);
    const response = await api.get(`/mobile/leave-requests/${id}`);
    const detailData = response.data as LeaveRequest;
    setData(detailData);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching leave request detail:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal memuat detail pengajuan cuti/izin.');
  } finally {
    setLoading(false);
  }
};

export const fetchColleagues = async (
  setColleagues: Dispatch<SetStateAction<Colleague[]>>,
  modal: ModalProps,
): Promise<void> => {
  try {
    const response = await api.get('/mobile/leave-requests/colleagues');
    const list = (response.data || []) as Colleague[];
    setColleagues(list);
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error fetching colleagues:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal memuat daftar rekan kerja.');
  }
};

export const createLeaveRequest = async ({
  params,
  modal,
  setProcessing,
  onSuccess,
}: {
  params: LeaveRequestCreateParams;
  modal: ModalProps;
  setProcessing: (val: boolean) => void;
  onSuccess: () => void;
}): Promise<void> => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang mengirim pengajuan...');

    const formData = new FormData();
    formData.append('type', params.type);
    if (params.start_date) {
      formData.append('start_date', params.start_date);
    }
    if (params.end_date) {
      formData.append('end_date', params.end_date);
    }
    formData.append('reason', params.reason);

    if (params.replacement_employee_id) {
      formData.append('replacement_employee_id', params.replacement_employee_id);
    }

    if (params.file) {
      formData.append(
        'file',
        {
          uri: params.file.uri,
          name: params.file.name,
          type: params.file.type,
        } as unknown as Blob,
      );
    }

    const response = await api.post('/mobile/leave-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 201 || response.status === 200) {
      processSuccess(
        modal,
        'Berhasil',
        response.data?.message || 'Permohonan cuti/izin berhasil dikirim dan menunggu persetujuan.',
        () => {
          onSuccess();
        },
      );
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal mengirim pengajuan.');
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error creating leave request:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal mengirim pengajuan.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};

export const cancelLeaveRequest = async ({
  id,
  modal,
  setProcessing,
  onSuccess,
}: {
  id: string;
  modal: ModalProps;
  setProcessing: (val: boolean) => void;
  onSuccess: () => void;
}): Promise<void> => {
  try {
    setProcessing(true);
    processStart(modal, 'Sedang membatalkan pengajuan...');

    const response = await api.put(`/mobile/leave-requests/${id}/cancel`);

    if (response.status === 200) {
      processSuccess(
        modal,
        'Berhasil',
        response.data?.message || 'Permohonan berhasil dibatalkan.',
        () => {
          onSuccess();
        },
      );
    } else {
      processFail(modal, 'Gagal', response.data?.message || 'Gagal membatalkan pengajuan.');
    }
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    console.error('Error cancelling leave request:', error);
    processFail(modal, 'Gagal', axiosError.response?.data?.message || 'Gagal membatalkan pengajuan.');
  } finally {
    processFinish(modal, () => {
      setProcessing(false);
    });
  }
};
