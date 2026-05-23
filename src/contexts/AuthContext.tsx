import api from '@/lib/api';
import { getData } from '@/lib/storage';
import { User } from '@/model/user';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
