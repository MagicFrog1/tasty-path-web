import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SubscriptionPlan, SubscriptionDetails, PlanOption } from '../types';
import PaymentService, { PaymentResponse } from '../services/PaymentService';
import { storage } from '../utils/storage';
import { getUserSubscription } from '../services/subscriptionService';
import { supabase } from '../services/supabase';

interface SubscriptionContextType {
  currentPlan: SubscriptionDetails | null;
  availablePlans: PlanOption[];
  isLoading: boolean;
  selectPlan: (plan: SubscriptionPlan) => Promise<void>;
  processPayment: (plan: SubscriptionPlan, paymentResult: PaymentResponse) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  checkSubscriptionStatus: (userId?: string | null) => Promise<void>;
  isTrialActive: () => boolean;
  daysLeftInTrial: () => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

const SUBSCRIPTION_STORAGE_KEY = 'tastypath:subscription';

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Planes disponibles
  const availablePlans: PlanOption[] = [
    {
      id: 'free',
      name: 'Plan Gratuito',
      price: 0,
      period: '3 días',
      trialDays: 3,
      features: [
        { id: 'ai_plans', name: 'Planes IA', description: 'Generación de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'nutrition_tracking', name: 'Seguimiento Nutricional', description: 'Análisis detallado de nutrientes', available: true },
        { id: 'premium_recipes', name: 'Recetas Premium', description: 'Recetas exclusivas y avanzadas', available: false },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: false },
        { id: 'export_reports', name: 'Exportar Reportes', description: 'Descarga de reportes en PDF', available: false },
      ],
    },
    {
      id: 'trial',
      name: 'Plan de Prueba',
      price: 0,
      period: 'gratis',
      trialDays: 0,
      features: [
        { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'plan_generator', name: 'Generador de Planes', description: 'Acceso a todas las funciones de generador de planes', available: true },
        { id: 'premium_recipes', name: 'Recetas Premium', description: 'Recetas exclusivas y avanzadas', available: true },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
      ],
    },
    {
      id: 'weekly',
      name: 'Plan Semanal',
      price: 3.49,
      period: 'por semana',
      features: [
        { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'plan_generator', name: 'Generador de Planes', description: 'Acceso a todas las funciones de generador de planes', available: true },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
      ],
    },
    {
      id: 'monthly',
      name: 'Plan Mensual',
      price: 2.49,
      period: 'por mes',
      originalPrice: 13.96, // 3.49 * 4 semanas
      isPopular: true,
      features: [
        { id: 'ai_plans', name: 'Planes IA', description: 'Generación de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'nutrition_tracking', name: 'Seguimiento Nutricional', description: 'Análisis detallado de nutrientes', available: true },
        { id: 'premium_recipes', name: 'Recetas Premium', description: 'Recetas exclusivas y avanzadas', available: true },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
        { id: 'export_reports', name: 'Exportar Reportes', description: 'Descarga de reportes en PDF', available: true },
      ],
    },
    {
      id: 'annual',
      name: 'Plan Anual',
      price: 19.99,
      period: 'por año',
      originalPrice: 29.88, // 2.49 * 12 meses
      isBestValue: true,
      features: [
        { id: 'ai_plans', name: 'Planes IA', description: 'Generación de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'nutrition_tracking', name: 'Seguimiento Nutricional', description: 'Análisis detallado de nutrientes', available: true },
        { id: 'premium_recipes', name: 'Recetas Premium', description: 'Recetas exclusivas y avanzadas', available: true },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
        { id: 'export_reports', name: 'Exportar Reportes', description: 'Descarga de reportes en PDF', available: true },
      ],
    },
  ];

  const checkSubscriptionStatus = useCallback(async (userId?: string | null) => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando estado de suscripción...');
      
      // Si tenemos userId, intentar obtener la suscripción desde Supabase
      if (userId) {
        try {
          // Verificar que el usuario esté autenticado antes de consultar
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.warn('⚠️ Usuario no autenticado, usando localStorage como fallback');
          } else {
            const dbSubscription = await getUserSubscription(userId);
            
            if (dbSubscription) {
              console.log('✅ Suscripción encontrada en Supabase:', dbSubscription);
              
              // Convertir la suscripción de Supabase al formato SubscriptionDetails
              const subscriptionDetails: SubscriptionDetails = {
                plan: dbSubscription.plan || 'free',
                startDate: dbSubscription.current_period_start || new Date().toISOString(),
                endDate: dbSubscription.current_period_end || new Date().toISOString(),
                isActive: dbSubscription.is_premium && (dbSubscription.status === 'active' || dbSubscription.status === 'trialing'),
                autoRenew: !dbSubscription.cancel_at_period_end,
                price: 0, // Se puede obtener desde Stripe si es necesario
                currency: 'EUR',
                trialDays: 0,
                subscriptionId: dbSubscription.stripe_subscription_id || undefined,
              };
              
              setCurrentPlan(subscriptionDetails);
              // También guardar en localStorage como respaldo
              storage.set(SUBSCRIPTION_STORAGE_KEY, subscriptionDetails);
              return;
            } else {
              console.log('ℹ️ No se encontró suscripción en Supabase para el usuario');
            }
          }
        } catch (error: any) {
          console.error('⚠️ Error obteniendo suscripción de Supabase:', {
            message: error?.message,
            status: error?.status,
            code: error?.code,
          });
          // Continuar con el flujo de localStorage como fallback
        }
      }
      
      // Fallback: Verificar localStorage
      const subscriptionData = storage.get<SubscriptionDetails>(SUBSCRIPTION_STORAGE_KEY);
      
      if (subscriptionData) {
        console.log('📦 Suscripción encontrada en localStorage:', subscriptionData);
        setCurrentPlan(subscriptionData);
      } else {
        // Si no hay suscripción, establecer plan gratuito por defecto
        const freePlan: SubscriptionDetails = {
          plan: 'free',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días
          isActive: true,
          autoRenew: false,
          price: 0,
          currency: 'EUR',
          trialDays: 3,
        };
        console.log('🆓 Estableciendo plan gratuito por defecto:', freePlan);
        setCurrentPlan(freePlan);
        storage.set(SUBSCRIPTION_STORAGE_KEY, freePlan);
      }
    } catch (error) {
      console.error('❌ Error verificando estado de suscripción:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar estado de suscripción al cargar la app
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const selectPlan = async (plan: SubscriptionPlan) => {
    try {
      const selectedPlan = availablePlans.find(p => p.id === plan);
      if (!selectedPlan) throw new Error('Plan no encontrado');

      const now = new Date();
      let endDate: Date;

      switch (plan) {
        case 'free':
          endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 días
          break;
        case 'trial':
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
          break;
        case 'weekly':
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 semana
          break;
        case 'monthly':
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días
          break;
        case 'annual':
          endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 días
          break;
        default:
          endDate = now;
      }

      const subscription: SubscriptionDetails = {
        plan,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        isActive: true,
        autoRenew: plan !== 'free',
        price: selectedPlan.price,
        currency: 'EUR',
        trialDays: selectedPlan.trialDays,
      };

      setCurrentPlan(subscription);
      storage.set(SUBSCRIPTION_STORAGE_KEY, subscription);
    } catch (error) {
      console.error('Error selecting plan:', error);
      throw error;
    }
  };

  const processPayment = async (plan: SubscriptionPlan, paymentResult: PaymentResponse) => {
    try {
      console.log('💳 Procesando pago exitoso:', paymentResult);
      
      const selectedPlan = availablePlans.find(p => p.id === plan);
      if (!selectedPlan) throw new Error('Plan no encontrado');

      // Crear suscripción con datos del pago
      const subscription: SubscriptionDetails = {
        plan,
        startDate: paymentResult.startDate,
        endDate: paymentResult.endDate,
        isActive: true,
        autoRenew: true,
        price: paymentResult.amount,
        currency: paymentResult.currency,
        trialDays: 0, // No es trial, es pago real
        transactionId: paymentResult.transactionId,
        subscriptionId: paymentResult.subscriptionId,
      };

      setCurrentPlan(subscription);
      storage.set(SUBSCRIPTION_STORAGE_KEY, subscription);
      
      console.log('✅ Suscripción activada exitosamente:', subscription);
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      if (currentPlan) {
        const updatedPlan: SubscriptionDetails = {
          ...currentPlan,
          isActive: false,
          autoRenew: false,
        };
        setCurrentPlan(updatedPlan);
        storage.set(SUBSCRIPTION_STORAGE_KEY, updatedPlan);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    try {
      await selectPlan(plan);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const isTrialActive = (): boolean => {
    if (!currentPlan || currentPlan.plan !== 'free') return false;
    const now = new Date();
    const endDate = new Date(currentPlan.endDate);
    return now < endDate;
  };

  const daysLeftInTrial = (): number => {
    if (!isTrialActive()) return 0;
    const now = new Date();
    const endDate = new Date(currentPlan!.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Asegurar que no devuelva valores negativos
    return Math.max(0, days);
  };

  const value: SubscriptionContextType = {
    currentPlan,
    availablePlans,
    isLoading,
    selectPlan,
    processPayment,
    cancelSubscription,
    updateSubscription,
    checkSubscriptionStatus,
    isTrialActive,
    daysLeftInTrial,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
