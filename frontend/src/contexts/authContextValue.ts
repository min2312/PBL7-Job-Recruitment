import { createContext } from 'react';

import { User } from '@/data/mockData';

export interface AuthContextType {
  user: User | null;
  isAuthReady: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthReady: false,
  login: () => {},
  logout: async () => {},
});