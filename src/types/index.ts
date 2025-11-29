// Tipos para la aplicación TastyPath

export interface User {
  id: string;
  name: string;
  email: string;
  goals: 'weight_loss' | 'maintenance' | 'muscle_gain';
  dietaryPreferences: string[];
  weeklyBudget: number;
  cookingTime: {
    weekdays: number; // en minutos
    weekends: number; // en minutos
  };
  isPremium: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingTime: number; // en minutos
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutritionInfo: NutritionInfo;
  tags: string[];
  isPremium: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  price: number;
  category: 'fruits_vegetables' | 'dairy' | 'meat' | 'grains' | 'spices' | 'other';
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string; // fecha ISO
  meals: {
    [day: string]: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snacks?: Recipe[];
    };
  };
  totalCost: number;
  totalCalories: number;
}

export interface ShoppingList {
  id: string;
  mealPlanId: string;
  items: ShoppingItem[];
  totalCost: number;
  organizedByCategory: {
    [category: string]: ShoppingItem[];
  };
}

export interface ShoppingItem {
  ingredient: Ingredient;
  quantity: number;
  totalPrice: number;
  isChecked: boolean;
}

export interface FilterOptions {
  maxCookingTime?: number;
  maxBudget?: number;
  dietaryRestrictions: string[];
  categories: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Tipos para el sistema de planes de suscripción
export type SubscriptionPlan = 'free' | 'trial' | 'weekly' | 'monthly' | 'annual';

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  startDate: string; // fecha ISO
  endDate: string; // fecha ISO
  isActive: boolean;
  autoRenew: boolean;
  price: number;
  currency: string;
  trialDays?: number;
  transactionId?: string;
  subscriptionId?: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface PlanOption {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  originalPrice?: number;
  features: PlanFeature[];
  isPopular?: boolean;
  isBestValue?: boolean;
  trialDays?: number;
}
