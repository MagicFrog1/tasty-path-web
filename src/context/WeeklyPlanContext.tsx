import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../utils/storage';

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  weekEnd: string;
  totalMeals: number;
  totalCalories: number;
  totalCost: number;
  status: 'active' | 'completed' | 'draft';
  name: string;
  description: string;
  nutritionGoals: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  progress: {
    completedMeals: number;
    totalMeals: number;
    percentage: number;
  };
  config?: any;
  meals?: any;
  estimatedCalories?: number;
  nutritionAdvice?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WeeklyPlanContextType {
  activePlan: WeeklyPlan | null;
  setActivePlan: (plan: WeeklyPlan | null) => void;
  weeklyPlans: WeeklyPlan[];
  setWeeklyPlans: (plans: WeeklyPlan[]) => void;
  addWeeklyPlan: (plan: WeeklyPlan) => void;
  updateWeeklyPlan: (planId: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (planId: string) => void;
  getPlanById: (planId: string) => WeeklyPlan | undefined;
  updatePlanProgress: (planId: string, completedMeals: number) => void;
  saveAllData: () => Promise<void>;
  loadAllData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const WeeklyPlanContext = createContext<WeeklyPlanContextType | undefined>(undefined);

const WEEKLY_PLANS_KEY = 'tastypath:weeklyPlans';
const ACTIVE_PLAN_KEY = 'tastypath:activePlan';

export const useWeeklyPlan = () => {
  const context = useContext(WeeklyPlanContext);
  if (context === undefined) {
    throw new Error('useWeeklyPlan must be used within a WeeklyPlanProvider');
  }
  return context;
};

interface WeeklyPlanProviderProps {
  children: ReactNode;
}

export const WeeklyPlanProvider: React.FC<WeeklyPlanProviderProps> = ({ children }) => {
  const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { markFreePlanUsed } = useAuth();

  const loadAllData = useCallback(async () => {
    try {
      const savedPlans = storage.get<WeeklyPlan[]>(WEEKLY_PLANS_KEY, []);
      const savedActivePlan = storage.get<WeeklyPlan | null>(ACTIVE_PLAN_KEY, null);
      
      if (savedPlans) {
        setWeeklyPlans(savedPlans);
      }
      if (savedActivePlan) {
        setActivePlan(savedActivePlan);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const saveAllData = useCallback(async () => {
    storage.set(WEEKLY_PLANS_KEY, weeklyPlans);
    if (activePlan) {
      storage.set(ACTIVE_PLAN_KEY, activePlan);
    } else {
      storage.remove(ACTIVE_PLAN_KEY);
    }
  }, [weeklyPlans, activePlan]);

  useEffect(() => {
    if (isInitialized) {
      saveAllData();
    }
  }, [isInitialized, saveAllData]);

  const clearAllData = useCallback(async () => {
    storage.remove(WEEKLY_PLANS_KEY);
    storage.remove(ACTIVE_PLAN_KEY);
    setWeeklyPlans([]);
    setActivePlan(null);
  }, []);

  const addWeeklyPlan = async (plan: WeeklyPlan) => {
    const planWithTimestamps = {
      ...plan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (weeklyPlans.length === 0) {
      try {
        await markFreePlanUsed();
      } catch (error) {
        console.error('Error marcando plan gratuito como usado:', error);
      }
    }

    setWeeklyPlans(prevPlans => {
      const updatedPlans = prevPlans.map(p => ({ 
        ...p, 
        status: 'draft' as const,
        updatedAt: new Date().toISOString(),
      }));
      
      const newPlan = { ...planWithTimestamps, status: 'active' as const };
      setActivePlan(newPlan);
      
      return [...updatedPlans, newPlan];
    });
  };

  const updateWeeklyPlan = async (planId: string, updates: Partial<WeeklyPlan>) => {
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setWeeklyPlans(prevPlans => {
      const planExists = prevPlans.find(plan => plan.id === planId);
      if (!planExists) {
        return prevPlans;
      }
      
      return prevPlans.map(plan =>
        plan.id === planId ? { ...plan, ...updatesWithTimestamp } : plan
      );
    });
    
    if (activePlan?.id === planId) {
      const updatedActivePlan = activePlan ? { ...activePlan, ...updatesWithTimestamp } : null;
      setActivePlan(updatedActivePlan);
    }
  };

  const deleteWeeklyPlan = (planId: string) => {
    const planToDelete = weeklyPlans.find(plan => plan.id === planId);
    if (!planToDelete) {
      return Promise.resolve();
    }
    
    setWeeklyPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));

    if (activePlan?.id === planId) {
      setActivePlan(null);
    }

    return Promise.resolve();
  };

  const getPlanById = (planId: string) => {
    return weeklyPlans.find(plan => plan.id === planId);
  };

  const updatePlanProgress = async (planId: string, completedMeals: number) => {
    setWeeklyPlans(prevPlans =>
      prevPlans.map(plan => {
        if (plan.id !== planId) return plan;
          const newPercentage = Math.round((completedMeals / plan.totalMeals) * 100);
          return {
            ...plan,
            progress: {
              ...plan.progress,
              completedMeals,
            percentage: newPercentage,
            },
          updatedAt: new Date().toISOString(),
          };
      })
    );

    if (activePlan?.id === planId) {
      const updatedActivePlan = activePlan
        ? {
        ...activePlan,
        progress: {
          ...activePlan.progress,
          completedMeals,
              percentage: Math.round((completedMeals / activePlan.totalMeals) * 100),
        },
            updatedAt: new Date().toISOString(),
          }
        : null;
      
      setActivePlan(updatedActivePlan);
    }
  };

  return (
    <WeeklyPlanContext.Provider value={{
      activePlan,
      setActivePlan,
      weeklyPlans,
      setWeeklyPlans,
      addWeeklyPlan,
      updateWeeklyPlan,
      deleteWeeklyPlan,
      getPlanById,
      updatePlanProgress,
      saveAllData,
      loadAllData,
      clearAllData,
    }}>
      {children}
    </WeeklyPlanContext.Provider>
  );
};
