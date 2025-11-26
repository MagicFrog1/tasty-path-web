import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../utils/storage';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  memberSince: string;
  lastLogin: string;
  // Datos físicos
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface UserDietConfig {
  goals: string[];
  dietaryPreferences: string[];
  allergens: string[];
  weeklyBudget: number;
  cookingTime: {
    weekdays: number;
    weekends: number;
  };
  mealCount: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  specialRequirements: string[];
}

interface UserProfileContextType {
  profile: UserProfile;
  dietConfig: UserDietConfig;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateDietConfig: (updates: Partial<UserDietConfig>) => void;
  getDietConfigForAI: () => {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    objective?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_boost' | 'diabetes_control' | 'heart_health' | 'digestive_health' | 'sleep_improvement';
    dietaryPreferences?: string[];
    allergies?: string[];
    budget?: number;
    cookingTime?: {
      weekdays: number;
      weekends: number;
    };
  };
  clearAllData: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || 'Usuario',
    email: user?.email || 'usuario@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
    isPremium: false,
    memberSince: 'Enero 2024',
    lastLogin: 'Hace 2 horas',
    // Datos físicos por defecto
    weight: 70,
    height: 170,
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
  });

  const [dietConfig, setDietConfig] = useState<UserDietConfig>({
    goals: ['Pérdida de peso'],
    dietaryPreferences: ['Vegetariana'],
    allergens: [],
    weeklyBudget: 60,
    cookingTime: {
      weekdays: 30,
      weekends: 90,
    },
    mealCount: {
      breakfast: true,
      lunch: true,
      dinner: true,
      snacks: false,
    },
    specialRequirements: [],
  });

  // Cargar datos guardados al inicializar
  useEffect(() => {
    loadSavedData();
  }, []);

  const persistProfile = useCallback((value: UserProfile) => {
    storage.set('tastypath:userProfile', value);
  }, []);

  const persistDietConfig = useCallback((value: UserDietConfig) => {
    storage.set('tastypath:userDietConfig', value);
  }, []);

  // Actualizar perfil cuando cambien los datos del usuario autenticado
  useEffect(() => {
    if (user) {
      setProfile(prevProfile => ({
        ...prevProfile,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  // Función para cargar datos guardados
  const loadSavedData = async () => {
    try {
      const savedProfile = storage.get<UserProfile>('tastypath:userProfile');
      const savedDietConfig = storage.get<UserDietConfig>('tastypath:userDietConfig');
      
      if (savedProfile) {
        // Mantener los datos del usuario autenticado
        setProfile({
          ...savedProfile,
          name: user?.name || savedProfile.name,
          email: user?.email || savedProfile.email,
        });
      }
      
      if (savedDietConfig) {
        setDietConfig(savedDietConfig);
      }
    } catch (error) {
      console.error('Error al cargar datos guardados:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    try {
      persistProfile(newProfile);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  };

  const updateDietConfig = async (updates: Partial<UserDietConfig>) => {
    const newDietConfig = { ...dietConfig, ...updates };
    setDietConfig(newDietConfig);
    
    try {
      persistDietConfig(newDietConfig);
    } catch (error) {
      console.error('Error al guardar configuración de dieta:', error);
    }
  };

  const getDietConfigForAI = () => {
    // Mapear los objetivos a los objetivos de la IA
    const goalMap: { [key: string]: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_boost' | 'diabetes_control' | 'heart_health' | 'digestive_health' | 'sleep_improvement' } = {
      'Pérdida de peso': 'weight_loss',
      'Mantenimiento': 'maintenance',
      'Aumento de masa muscular': 'muscle_gain',
      'Mejorar energía': 'energy_boost',
      'Control de diabetes': 'diabetes_control',
      'Salud cardiovascular': 'heart_health',
      'Digestión saludable': 'digestive_health',
      'Mejorar el sueño': 'sleep_improvement',
    };

    return {
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      objective: dietConfig.goals.length > 0 ? goalMap[dietConfig.goals[0]] : 'weight_loss',
      dietaryPreferences: dietConfig.dietaryPreferences,
      allergies: dietConfig.allergens,
      budget: dietConfig.weeklyBudget
    };
  };

  // Función para limpiar todos los datos guardados (útil para testing)
  const clearAllData = async () => {
    try {
      storage.remove('tastypath:userProfile');
      storage.remove('tastypath:userDietConfig');
      setProfile({
        name: user?.name || 'Usuario',
        email: user?.email || 'usuario@email.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
        isPremium: false,
        memberSince: 'Enero 2024',
        lastLogin: 'Hace 2 horas',
        weight: 70,
        height: 170,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
      });
      setDietConfig({
        goals: ['Pérdida de peso'],
        dietaryPreferences: ['Vegetariana'],
        allergens: [],
        weeklyBudget: 60,
        cookingTime: {
          weekdays: 30,
          weekends: 90,
        },
        mealCount: {
          breakfast: true,
          lunch: true,
          dinner: true,
          snacks: false,
        },
        specialRequirements: [],
      });
      window.alert('Datos Limpiados: Todos los datos han sido restablecidos a los valores por defecto.');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  };

  const value: UserProfileContextType = {
    profile,
    dietConfig,
    updateProfile,
    updateDietConfig,
    getDietConfigForAI,
    clearAllData,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
