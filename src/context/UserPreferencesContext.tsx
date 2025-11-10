import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  // Preferencias dietéticas
  dietaryPreferences: string[];
  // Alergias alimentarias
  allergies: string[];
  // Estilos de cocina preferidos
  cuisinePreferences: string[];
  // Restricciones específicas
  restrictions: string[];
  // Objetivos de salud
  healthGoals: string[];
  // Preferencias de ingredientes
  ingredientPreferences: {
    proteins: string[];
    vegetables: string[];
    grains: string[];
    fruits: string[];
    dairy: string[];
  };
  // Nivel de cocina
  cookingLevel: 'beginner' | 'intermediate' | 'advanced';
  // Tiempo máximo de preparación
  maxPrepTime: number;
  // Presupuesto semanal
  weeklyBudget: number;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  savePreferences: () => Promise<void>;
  loadPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  dietaryPreferences: ['saludable', 'equilibrado'],
  allergies: [],
  cuisinePreferences: ['mediterránea', 'asiática', 'mexicana', 'italiana'],
  restrictions: [],
  healthGoals: ['mantener peso', 'energía'],
  ingredientPreferences: {
    proteins: ['pollo', 'pescado', 'legumbres', 'tofu'],
    vegetables: ['brócoli', 'espinacas', 'zanahorias', 'tomates'],
    grains: ['quinoa', 'arroz integral', 'avena', 'pasta integral'],
    fruits: ['manzanas', 'plátanos', 'fresas', 'arándanos'],
    dairy: ['yogur griego', 'queso cottage', 'leche de almendras']
  },
  cookingLevel: 'intermediate',
  maxPrepTime: 30,
  weeklyBudget: 120
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar preferencias guardadas al inicializar
  useEffect(() => {
    loadPreferences();
  }, []);

  // Función para cargar preferencias guardadas
  const loadPreferences = async () => {
    try {
      console.log('🔄 Cargando preferencias del usuario...');
      
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
        console.log('✅ Preferencias cargadas:', parsedPreferences.dietaryPreferences);
      } else {
        console.log('ℹ️ No hay preferencias guardadas, usando valores por defecto');
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('❌ Error al cargar preferencias:', error);
      setIsInitialized(true);
    }
  };

  // Función para guardar preferencias
  const savePreferences = async () => {
    try {
      console.log('💾 Guardando preferencias del usuario...');
      
      await AsyncStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      console.log('✅ Preferencias guardadas exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar preferencias:', error);
    }
  };

  // Función para actualizar preferencias
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      console.log('✏️ Preferencias actualizadas:', updates);
      return updated;
    });
  };

  // Función para resetear preferencias
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    console.log('🔄 Preferencias reseteadas a valores por defecto');
  };

  // Guardar automáticamente cada vez que cambien las preferencias
  useEffect(() => {
    if (isInitialized) {
      savePreferences();
    }
  }, [preferences, isInitialized]);

  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      updatePreferences,
      resetPreferences,
      savePreferences,
      loadPreferences,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
