import axios from 'axios';
import Config from 'react-native-config';
import { getAccessToken, setAccessToken } from '@/lib/auth';
import { removeData } from '@/lib/storage';
import { reset } from '@/lib/navigate';

const api = axios.create({
  baseURL: Config.API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': Config.API_KEY,
  },
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 503 && error.response?.data?.error === 'MaintenanceMode') {
      reset('Maintenance');
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.get(`${Config.API_URL}/auth/refresh-token`, {
          withCredentials: true,
          headers: {
            'x-api-key': Config.API_KEY,
          },
        });

        const newAccessToken = res.data?.accessToken;
        setAccessToken(newAccessToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (error) {
        await removeData('auth');
        setAccessToken(null);
        reset('Auth');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
