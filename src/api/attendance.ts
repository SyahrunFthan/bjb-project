import { AxiosResponse } from 'axios';

import api from '@/lib/api';
import { AttendanceHistoryResponse, AttendanceRecord, TodayAttendanceResponse } from '@/model/attendance';

/**
 * Mendapatkan status kehadiran hari ini dan jam operasional cabang
 */
export const getTodayAttendance = async (): Promise<TodayAttendanceResponse> => {
  const res: AxiosResponse<TodayAttendanceResponse> = await api.get('/mobile/attendances/today');
  return res.data;
};

/**
 * Mengecek status pendaftaran biometrik wajah pegawai
 */
export const getFaceStatus = async (): Promise<{
  registered: boolean;
  can_update: boolean;
  photo_url: string | null;
}> => {
  const res = await api.get('/mobile/attendances/face-status');
  return res.data;
};

/**
 * Helper untuk membuat FormData dari URI gambar kamera
 */
const createPhotoFormData = (imageUri: string): FormData => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || `face_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('photo', {
    uri: imageUri,
    name: filename,
    type,
  } as unknown as Blob);

  return formData;
};

/**
 * Mendaftarkan master wajah biometrik
 */
export const registerFace = async (imageUri: string): Promise<{ message: string; data: { photo_url: string } }> => {
  const formData = createPhotoFormData(imageUri);
  const res = await api.post('/mobile/attendances/register-face', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Presensi Masuk (Clock In) dengan verifikasi wajah dan validasi radius GPS
 */
export const clockIn = async (
  imageUri: string,
  latitude?: number | null,
  longitude?: number | null,
): Promise<{ message: string; data: AttendanceRecord }> => {
  const formData = createPhotoFormData(imageUri);
  if (latitude != null) {
    formData.append('latitude', String(latitude));
  }
  if (longitude != null) {
    formData.append('longitude', String(longitude));
  }
  const res = await api.post('/mobile/attendances/clock-in', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Presensi Pulang (Clock Out) dengan verifikasi wajah dan validasi radius GPS
 */
export const clockOut = async (
  imageUri: string,
  latitude?: number | null,
  longitude?: number | null,
): Promise<{ message: string; data: AttendanceRecord }> => {
  const formData = createPhotoFormData(imageUri);
  if (latitude != null) {
    formData.append('latitude', String(latitude));
  }
  if (longitude != null) {
    formData.append('longitude', String(longitude));
  }
  const res = await api.post('/mobile/attendances/clock-out', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Mendapatkan riwayat absensi bulanan
 */
export const getAttendanceHistory = async (month: number, year: number): Promise<AttendanceHistoryResponse> => {
  const res: AxiosResponse<AttendanceHistoryResponse> = await api.get(`/mobile/attendances/history?month=${month}&year=${year}`);
  return res.data;
};
