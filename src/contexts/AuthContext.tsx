import api from '@/lib/api';
import { getData } from '@/lib/storage';
import { User } from '@/model/user';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextProps {
  auth: User | null;
  setAuth: (auth: User | null) => void;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<User | null>(null);

  useEffect(() => {
    const loadAuth = async () => {
      const storeAuth = await getData('auth');
      setAuth(storeAuth ?? null);
    };

    loadAuth();
  }, []);

  const value = useMemo(() => ({ auth, setAuth }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
