import api from '@/lib/api';
import { getData } from '@/lib/storage';
import { User } from '@/model/user';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createNotificationChannel, registerDeviceForNotifications, setupNotificationListeners } from '@/lib/notification';
import { useModal } from '@/hooks/useModal';
import { fetchNotifications } from '@/api/notification';

interface AuthContextProps {
  auth: User | null;
  setAuth: (auth: User | null) => void;
  hasUnreadNotification: boolean;
  setHasUnreadNotification: (val: boolean) => void;
  refreshUnreadStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<User | null>(null);
  const [hasUnreadNotification, setHasUnreadNotification] = useState<boolean>(false);
  const modal = useModal();

  const refreshUnreadStatus = async () => {
    const storeAuth = await getData('auth');
    if (storeAuth) {
      try {
        const data = await fetchNotifications();
        setHasUnreadNotification(data.some(n => !n.is_read));
      } catch (error) {
        console.log('[AuthContext] Error fetching notifications:', error);
      }
    }
  };

  useEffect(() => {
    const loadAuth = async () => {
      const storeAuth = await getData('auth');
      setAuth(storeAuth ?? null);
    };

    loadAuth();
  }, []);

  // Register device for notifications when user logs in
  useEffect(() => {
    if (auth) {
      registerDeviceForNotifications();
      refreshUnreadStatus();
    }
  }, [auth]);

  // Create Android notification channel + setup listeners on mount
  useEffect(() => {
    // Create the Android notification channel (must be done before any notification arrives)
    createNotificationChannel();

    const unsubscribe = setupNotificationListeners(modal, (title, body) => {
      modal.result.success(title, body);
      setHasUnreadNotification(true);
    });
    return () => {
      unsubscribe();
    };
  }, [modal]);

  const value = useMemo(() => ({
    auth,
    setAuth,
    hasUnreadNotification,
    setHasUnreadNotification,
    refreshUnreadStatus,
  }), [auth, hasUnreadNotification]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

