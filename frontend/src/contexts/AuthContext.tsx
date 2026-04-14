import { ReactNode, useEffect, useState } from 'react';

import { User } from '@/data/mockData';
import { getCurrentSession, logoutSession } from '@/services/authService';
import { AuthContext } from './authContextValue';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const sessionUser = await getCurrentSession();
        if (isMounted && sessionUser) {
          setUser(sessionUser);
        }
      } catch (error) {
        console.error('Failed to hydrate auth session:', error);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (u: User) => {
    setUser(u);
    setIsAuthReady(true);
  };

  const logout = async () => {
    try {
      await logoutSession('all');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setIsAuthReady(true);
      toast.success("Đăng xuất thành công!");
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
