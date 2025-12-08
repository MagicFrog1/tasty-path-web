import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import PremiumBlock from './PremiumBlock';

interface PremiumRouteProps {
  children: React.ReactNode;
  allowFree?: boolean; // Si es true, permite acceso gratuito con restricciones
}

/**
 * Componente que protege rutas que requieren suscripción premium
 * Si allowFree es true, permite acceso pero con restricciones (ej: generador con límite mensual)
 */
export const PremiumRoute: React.FC<PremiumRouteProps> = ({ children, allowFree = false }) => {
  const { currentPlan, isLoading } = useSubscription();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // ============================================
  // ⚠️ MODO TESTING: PERMITIR ACCESO A TODOS
  // Para revertir, descomentar el código original abajo
  // ============================================
  return <>{children}</>;
  // ============================================
  // FIN MODO TESTING
  // ============================================

  /* CÓDIGO ORIGINAL - DESCOMENTAR PARA REVERTIR:
  const isPremium = currentPlan?.isActive === true && 
                   ['weekly', 'monthly', 'annual'].includes(currentPlan.plan || 'free');

  // Si es premium, permitir acceso completo
  if (isPremium) {
    return <>{children}</>;
  }

  // Si allowFree es true, permitir acceso pero con restricciones (se manejan en los componentes)
  if (allowFree) {
    return <>{children}</>;
  }

  // Si no es premium y no permite acceso gratuito, mostrar bloqueo
  return <PremiumBlock />;
  */
};

export default PremiumRoute;










