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
  plansCreated: number;
  remainingPlans: number;
  upgradeRequired: boolean;
}

export const useSubscriptionRestrictions = (): SubscriptionRestrictions => {
  const { currentPlan } = useSubscription();
  const { weeklyPlans } = useWeeklyPlan();

  const isFreePlan = !currentPlan || currentPlan.plan === 'free';
  const isPremiumPlan = currentPlan && ['weekly', 'monthly', 'annual'].includes(currentPlan.plan);
  
  const plansCreated = weeklyPlans.length;
  
  // Restricciones para plan gratuito
  const freePlanRestrictions: SubscriptionRestrictions = {
    canCreatePlan: plansCreated < 1, // Solo 1 plan permitido
    canUseAdvancedFeatures: false,
    canUseAllGoals: false, // Solo "Mantenimiento" permitido
    canUseAllDietaryPreferences: false, // Solo opciones básicas
    canUseAllAllergens: false, // Solo alérgenos básicos
    canUseSpecialRequirements: false, // Sin acceso a requisitos especiales
    canUseExoticIngredients: false,
    canUseInternationalSpices: false,
    canSetCustomCookingTime: false, // Tiempo fijo
    canSetFamilySize: false, // Solo 1 persona
    maxPlansAllowed: 1,
    plansCreated,
    remainingPlans: Math.max(0, 1 - plansCreated),
    upgradeRequired: plansCreated >= 1,
  };

  // Sin restricciones para planes premium
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
    plansCreated,
    remainingPlans: -1, // Ilimitado
    upgradeRequired: false,
  };

  // Determinar restricciones basadas en el plan actual
  switch (currentPlan?.plan) {
    case 'weekly':
    case 'monthly':
    case 'annual':
      return premiumPlanRestrictions;
    
    case 'free':
    default:
      // Temporalmente, se otorgan las mismas características que el plan premium.
      return premiumPlanRestrictions;
  }
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
