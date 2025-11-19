import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { storage } from '../utils/storage';

interface UserData {
  id: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  isNewUser?: boolean;
  hasSelectedPlan?: boolean;
  hasUsedFreePlan?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  markPlanSelected: () => Promise<void>;
  markFreePlanUsed: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'tastypath:user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar estado de autenticación al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const persistUser = useCallback((userData: UserData | null) => {
    if (userData) {
      storage.set(USER_STORAGE_KEY, userData);
    } else {
      storage.remove(USER_STORAGE_KEY);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedUser = storage.get<UserData>(USER_STORAGE_KEY);
      if (storedUser?.isLoggedIn) {
        const normalizedUser = {
          ...storedUser,
          hasSelectedPlan: storedUser.hasSelectedPlan ?? !storedUser.isNewUser,
        };
        setUser(normalizedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error comprobando autenticación:', error);
    } finally {
      setIsLoading(false);
    }
    return Promise.resolve();
  }, []);

  const login = useCallback(async (userData: UserData) => {
    const normalizedUser = {
      ...userData,
      isLoggedIn: true,
      hasSelectedPlan: userData.hasSelectedPlan ?? false,
    };
    setUser(normalizedUser);
    persistUser(normalizedUser);
  }, [persistUser]);

  const logout = useCallback(async () => {
      setUser(null);
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback((updates: Partial<UserData>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      persistUser(updatedUser);
      return updatedUser;
    });
  }, [persistUser]);

  const markPlanSelected = useCallback(async () => {
    updateUser({ hasSelectedPlan: true, isNewUser: false });
    return Promise.resolve();
  }, [updateUser]);

  const markFreePlanUsed = useCallback(async () => {
    updateUser({ hasUsedFreePlan: true });
    return Promise.resolve();
  }, [updateUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    markPlanSelected,
    markFreePlanUsed,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
