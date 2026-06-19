import { ModalProps } from '@/contexts/ModalContext';
import api from '@/lib/api';
import { processFail, processFinish, processStart } from '@/lib/process';
import { AxiosError } from 'axios';
import { Dispatch, SetStateAction } from 'react';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all notifications for the authenticated customer
 */
export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  try {
    const response = await api.get('/mobile/customers/notifications');
    return response.data?.data || [];
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for the authenticated customer
 */
export const markNotificationsAsReadApi = async (): Promise<boolean> => {
  try {
    const response = await api.put('/mobile/customers/notifications/read');
    return response.status === 200;
  } catch (error) {
    console.error('[API] Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Clear/Delete all notifications for the authenticated customer
 */

interface ClearProps {
  modal: ModalProps;
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>;
}
export const clearNotificationsApi = async ({ modal, setNotifications }: ClearProps) => {
  try {
    processStart(modal, 'Loading', 'Sedang menghapus data...');
    const response = await api.delete('/mobile/customers/notifications');
    if (response.status == 200) {
      setNotifications([]);
    }
  } catch (error) {
    const axiosError = error as AxiosError<Error>;
    processFail(modal, 'Kesalahan', axiosError.response?.data?.message || 'Ada kesalahan saat membersihkan pemberitahuan');
  } finally {
    processFinish(modal, () => {});
  }
};
