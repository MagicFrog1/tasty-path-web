import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { revenueCatService, SubscriptionProduct } from '../services/RevenueCatService';
import { useAuth } from './AuthContext';

interface RevenueCatContextType {
  // Estado de RevenueCat
  isInitialized: boolean;
  isLoading: boolean;
  hasPremiumAccess: boolean;
  products: SubscriptionProduct[];
  
  // Acciones
  purchaseProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(undefined);

export const useRevenueCatContext = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCatContext debe ser usado dentro de RevenueCatProvider');
  }
  return context;
};

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  // --- Lógica de RevenueCat integrada ---
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await revenueCatService.getSubscriptionStatus();
      setHasPremiumAccess(status.isPremium);
    } catch (error) {
      console.error('Error actualizando estado de suscripción:', error);
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await revenueCatService.purchaseProduct(productId);
      if (result.success) {
        await refreshSubscriptionStatus();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error inesperado en la compra' };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus]);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await revenueCatService.restorePurchases();
      if (result.success) {
        await refreshSubscriptionStatus();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error restaurando compras' };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus]);

  const initialize = useCallback(async (userId?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await revenueCatService.initialize(userId);
      setIsInitialized(success);
      if (success) {
        const loadedProducts = await revenueCatService.loadOfferings();
        setProducts(loadedProducts);
        await refreshSubscriptionStatus();
      }
      return success;
    } catch (error) {
      console.error('Error inicializando RevenueCat:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus]);

  // Inicializar RevenueCat cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id && !isInitialized) {
      initialize(user.id);
    }
  }, [user?.id, isInitialized, initialize]);

  // Actualizar estado de suscripción cuando cambie
  useEffect(() => {
    if (isInitialized) {
      refreshSubscriptionStatus();
    }
  }, [isInitialized, refreshSubscriptionStatus]);

  const value: RevenueCatContextType = {
    isInitialized,
    isLoading,
    hasPremiumAccess,
    products,
    purchaseProduct,
    restorePurchases,
    refreshSubscriptionStatus
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};
