import { useRevenueCatContext } from '../context/RevenueCatContext';
import { useAuth } from '../context/AuthContext';

export const usePremiumAccess = () => {
  const { hasPremiumAccess: revenueCatPremium } = useRevenueCatContext();
  const { user } = useAuth();

  // El usuario tiene acceso premium si:
  // 1. Tiene una suscripción activa en RevenueCat, O
  // 2. Está usando el plan gratuito (trial) y no lo ha usado antes
  const hasPremiumAccess = true; // revenueCatPremium || (user?.hasSelectedPlan && !user?.hasUsedFreePlan);

  return {
    hasPremiumAccess,
    isTrialUser: false, //user?.hasSelectedPlan && !user?.hasUsedFreePlan && !revenueCatPremium,
    isSubscribedUser: true, // revenueCatPremium,
  };
};
