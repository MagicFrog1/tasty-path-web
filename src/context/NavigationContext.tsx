import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface NavigationContextType {
  showLoading: boolean;
  setShowLoading: (show: boolean) => void;
  navigateToHome: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [showLoading, setShowLoading] = useState(true);
  const { user } = useAuth();

  // Resetear la pantalla de carga cuando el usuario cambie (login/logout)
  useEffect(() => {
    if (user) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [user]);

  const navigateToHome = () => {
    setShowLoading(false);
  };

  return (
    <NavigationContext.Provider value={{ showLoading, setShowLoading, navigateToHome }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
