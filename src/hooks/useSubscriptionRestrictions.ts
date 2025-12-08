import { useMemo } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';

export interface SubscriptionRestrictions {
  canCreatePlan: boolean;
  canUseAdvancedFeatures: boolean;
  canUseAllGoals: boolean;
  canUseAllDietaryPreferences: boolean;
  canUseAllAllergens: boolean;
  canUseSpecialRequirements: boolean;
  canUseExoticIngredients: boolean;
  canUseInternationalSpices: boolean;
  canSetCustomCookingTime: boolean;
  canSetFamilySize: boolean;
  maxPlansAllowed: number;
  maxSavedPlans: number; // Máximo de planes guardados simultáneamente
  plansCreated: number;
  plansCreatedThisMonth: number;
  remainingPlans: number;
  upgradeRequired: boolean;
  isPremium: boolean;
  canGenerateThisMonth: boolean;
  canHaveMoreSavedPlans: boolean; // Si puede tener más planes guardados
  nextGenerationDate: string | null;
}

/**
 * Verifica si un plan fue creado este mes (basado en createdAt)
 */
const getPlansCreatedThisMonth = (weeklyPlans: any[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return weeklyPlans.filter(plan => {
    if (!plan.createdAt) return false;
    const planDate = new Date(plan.createdAt);
    return planDate.getMonth() === currentMonth && planDate.getFullYear() === currentYear;
  }).length;
};

/**
 * Calcula la fecha del próximo mes cuando puede generar un nuevo plan
 */
const getNextGenerationDate = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
};

/**
 * Lee de almacenamiento local la información de uso mensual del plan gratuito
 * para que borrar planes NO reinicie el contador mensual.
 */
const getFreePlanMonthlyUsage = () => {
  if (typeof window === 'undefined') {
    return {
      hasGeneratedThisMonth: false,
      nextDateFromStorage: null as string | null,
    };
  }

  try {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const lastMonthKey = window.localStorage.getItem('tastypath:freePlan:lastMonthKey');
    const nextDateFromStorage = window.localStorage.getItem('tastypath:freePlan:nextGenerationDate');

    const hasGeneratedThisMonth = lastMonthKey === currentKey;

    return {
      hasGeneratedThisMonth,
      nextDateFromStorage: nextDateFromStorage || null,
    };
  } catch {
    return {
      hasGeneratedThisMonth: false,
      nextDateFromStorage: null as string | null,
    };
  }
};

export const useSubscriptionRestrictions = (): SubscriptionRestrictions => {
  const { currentPlan } = useSubscription();
  const { weeklyPlans } = useWeeklyPlan();

  return useMemo(() => {
    const isPremium = currentPlan?.isActive === true && 
                     ['weekly', 'monthly', 'annual'].includes(currentPlan.plan || 'free');
    
    const plansCreated = weeklyPlans.length;

    // Cálculo por defecto basado en planes existentes
    let plansCreatedThisMonth = getPlansCreatedThisMonth(weeklyPlans);
    let canGenerateThisMonth = isPremium ? true : plansCreatedThisMonth < 1;
    let nextGenerationDate: string | null = null;

    // Para usuarios gratuitos usamos un contador mensual independiente de los planes guardados:
    // aunque borre el plan, sigue contando como que ya ha usado el plan de este mes.
    if (!isPremium) {
      const { hasGeneratedThisMonth, nextDateFromStorage } = getFreePlanMonthlyUsage();

      if (hasGeneratedThisMonth) {
        plansCreatedThisMonth = 1;
        canGenerateThisMonth = false;
        nextGenerationDate = nextDateFromStorage || getNextGenerationDate();
      } else {
        plansCreatedThisMonth = 0;
        canGenerateThisMonth = true;
        nextGenerationDate = null;
      }
    }
    
    // Para usuarios gratuitos: solo pueden tener 1 plan guardado a la vez
    const canHaveMoreSavedPlans = isPremium ? true : plansCreated < 1;
    
    // Restricciones para usuarios NO premium
    const freePlanRestrictions: SubscriptionRestrictions = {
      canCreatePlan: canGenerateThisMonth && canHaveMoreSavedPlans, // Solo 1 plan al mes Y solo 1 plan guardado a la vez
      canUseAdvancedFeatures: false,
      canUseAllGoals: false,
      canUseAllDietaryPreferences: false,
      canUseAllAllergens: false,
      canUseSpecialRequirements: false,
      canUseExoticIngredients: false,
      canUseInternationalSpices: false,
      canSetCustomCookingTime: false,
      canSetFamilySize: false,
      maxPlansAllowed: 1, // 1 plan al mes
      maxSavedPlans: 1, // Solo 1 plan guardado a la vez
      plansCreated,
      plansCreatedThisMonth,
      remainingPlans: Math.max(0, 1 - plansCreatedThisMonth),
      upgradeRequired: !canGenerateThisMonth || !canHaveMoreSavedPlans,
      isPremium: false,
      canGenerateThisMonth,
      canHaveMoreSavedPlans,
      nextGenerationDate: canGenerateThisMonth ? null : (nextGenerationDate ?? getNextGenerationDate()),
    };

    // Sin restricciones para usuarios premium
    const premiumPlanRestrictions: SubscriptionRestrictions = {
      canCreatePlan: true,
      canUseAdvancedFeatures: true,
      canUseAllGoals: true,
      canUseAllDietaryPreferences: true,
      canUseAllAllergens: true,
      canUseSpecialRequirements: true,
      canUseExoticIngredients: true,
      canUseInternationalSpices: true,
      canSetCustomCookingTime: true,
      canSetFamilySize: true,
      maxPlansAllowed: -1, // Ilimitado
      maxSavedPlans: -1, // Ilimitado
      plansCreated,
      plansCreatedThisMonth,
      remainingPlans: -1, // Ilimitado
      upgradeRequired: false,
      isPremium: true,
      canGenerateThisMonth: true,
      canHaveMoreSavedPlans: true,
      nextGenerationDate: null,
    };

    // Determinar restricciones basadas en el plan actual
    if (isPremium) {
      return premiumPlanRestrictions;
    }

    return freePlanRestrictions;
  }, [currentPlan, weeklyPlans]);
};

// Opciones permitidas para usuarios gratuitos
export const FREE_PLAN_OPTIONS = {
  goals: ['Mantenimiento'],
  dietaryPreferences: ['Vegetariana', 'Vegana'],
  allergens: ['Gluten', 'Lactosa'],
  specialRequirements: [], // Sin requisitos especiales para usuarios gratuitos
  familySize: 1,
};

// Opciones completas para usuarios premium
export const PREMIUM_PLAN_OPTIONS = {
  goals: [
    'Pérdida de peso',
    'Mantenimiento',
    'Aumento de masa muscular',
    'Control de diabetes',
    'Salud cardiovascular',
  ],
  dietaryPreferences: [
    'Vegetariana',
    'Vegana',
    'Sin gluten',
    'Sin lactosa',
    'Baja en carbohidratos',
    'Alta en proteínas',
  ],
  allergens: [
    'Gluten',
    'Lactosa',
    'Huevos',
    'Frutos secos',
    'Mariscos',
    'Soja',
    'Pescado',
    'Cacahuetes',
    'Sésamo',
    'Mostaza',
  ],
  specialRequirements: [
    'Baja en calorías',
    'Alta en fibra',
    'Rica en antioxidantes',
    'Baja en grasas',
    'Sin azúcar añadido',
    'Orgánica',
    'Local y de temporada',
    'Sin conservantes',
  ],
};
