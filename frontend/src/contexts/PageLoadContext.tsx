import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageLoadContextType {
  isLoading: boolean;
  triggerPageLoad: () => void;
}

const PageLoadContext = createContext<PageLoadContextType | undefined>(undefined);

export function PageLoadProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const triggerPageLoad = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  useEffect(() => {
    triggerPageLoad();
  }, [location.pathname]);

  return (
    <PageLoadContext.Provider value={{ isLoading, triggerPageLoad }}>
      {children}
    </PageLoadContext.Provider>
  );
}

export function usePageLoad() {
  const context = useContext(PageLoadContext);
  if (!context) {
    throw new Error('usePageLoad must be used within PageLoadProvider');
  }
  return context;
}
