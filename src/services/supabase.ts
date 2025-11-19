import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '../../env.config';

// Supabase: URL y anon key desde variables de entorno
const supabaseUrl = ENV_CONFIG.SUPABASE_URL;
const supabaseKey = ENV_CONFIG.SUPABASE_ANON_KEY;

// Debug: Verificar qué variables están disponibles
console.log('🔍 Debug - Variables de entorno disponibles:');
console.log('  - NEXT_PUBLIC_SUPABASE_URL:', import.meta?.env?.NEXT_PUBLIC_SUPABASE_URL || 'NO DISPONIBLE');
console.log('  - VITE_SUPABASE_URL:', import.meta?.env?.VITE_SUPABASE_URL || 'NO DISPONIBLE');
console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', import.meta?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DISPONIBLE' : 'NO DISPONIBLE');
console.log('  - VITE_SUPABASE_ANON_KEY:', import.meta?.env?.VITE_SUPABASE_ANON_KEY ? 'DISPONIBLE' : 'NO DISPONIBLE');

// Validar que las credenciales estén configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase no está configurado correctamente.');
  console.error('💡 Verifica las variables de entorno en Vercel:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL (prioridad) o VITE_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY (prioridad) o VITE_SUPABASE_ANON_KEY');
  console.error('📝 Valores actuales:');
  console.error('   - SUPABASE_URL:', supabaseUrl || 'VACÍO');
  console.error('   - SUPABASE_ANON_KEY:', supabaseKey ? 'CONFIGURADA' : 'VACÍA');
}

// Log de configuración (sin exponer la key completa)
console.log('🔧 Configuración de Supabase:');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key configurada:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA');

// Crear cliente de Supabase con opciones de reintento
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      }).catch((error) => {
        console.error('❌ Error de conexión a Supabase:', error);
        console.error('📍 URL intentada:', url);
        
        // Si es un error de DNS, proporcionar ayuda
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          console.error('💡 Posibles soluciones:');
          console.error('   1. Verifica que el proyecto de Supabase esté activo (no pausado)');
          console.error('   2. Verifica que la URL de Supabase sea correcta en Vercel');
          console.error('   3. Verifica que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en Vercel');
          console.error('   4. Revisa el dashboard de Supabase: https://app.supabase.com/');
        }
        
        throw error;
      });
    },
  },
});

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string;
          member_since: string;
          last_login: string;
          weight: number;
          height: number;
          age: number;
          gender: 'male' | 'female';
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar?: string;
          member_since?: string;
          last_login?: string;
          weight?: number;
          height?: number;
          age?: number;
          gender?: 'male' | 'female';
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string;
          member_since?: string;
          last_login?: string;
          weight?: number;
          height?: number;
          age?: number;
          gender?: 'male' | 'female';
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_diet_configs: {
        Row: {
          id: string;
          user_id: string;
          goals: string[];
          dietary_preferences: string[];
          allergens: string[];
          weekly_budget: number;
          cooking_time_weekdays: number;
          cooking_time_weekends: number;
          meal_count_breakfast: boolean;
          meal_count_lunch: boolean;
          meal_count_dinner: boolean;
          meal_count_snacks: boolean;
          special_requirements: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          goals: string[];
          dietary_preferences: string[];
          allergens: string[];
          weekly_budget: number;
          cooking_time_weekdays: number;
          cooking_time_weekends: number;
          meal_count_breakfast: boolean;
          meal_count_lunch: boolean;
          meal_count_dinner: boolean;
          meal_count_snacks: boolean;
          special_requirements: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          goals?: string[];
          dietary_preferences?: string[];
          allergens?: string[];
          weekly_budget?: number;
          cooking_time_weekdays?: number;
          cooking_time_weekends?: number;
          meal_count_breakfast?: boolean;
          meal_count_lunch?: boolean;
          meal_count_dinner?: boolean;
          meal_count_snacks?: boolean;
          special_requirements?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      weekly_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          week_start: string;
          week_end: string;
          total_meals: number;
          total_calories: number;
          total_cost: number;
          status: 'active' | 'completed' | 'draft';
          nutrition_goals_protein: number;
          nutrition_goals_carbs: number;
          nutrition_goals_fat: number;
          nutrition_goals_fiber: number;
          progress_completed_meals: number;
          progress_total_meals: number;
          progress_percentage: number;
          config: any;
          meals: any;
          estimated_calories: number;
          nutrition_advice: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          week_start: string;
          week_end: string;
          total_meals: number;
          total_calories: number;
          total_cost: number;
          status: 'active' | 'completed' | 'draft';
          nutrition_goals_protein: number;
          nutrition_goals_carbs: number;
          nutrition_goals_fat: number;
          nutrition_goals_fiber: number;
          progress_completed_meals: number;
          progress_total_meals: number;
          progress_percentage: number;
          config?: any;
          meals?: any;
          estimated_calories?: number;
          nutrition_advice?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          week_start?: string;
          week_end?: string;
          total_meals?: number;
          total_calories?: number;
          total_cost?: number;
          status?: 'active' | 'completed' | 'draft';
          nutrition_goals_protein?: number;
          nutrition_goals_carbs?: number;
          nutrition_goals_fat?: number;
          nutrition_goals_fiber?: number;
          progress_completed_meals?: number;
          progress_total_meals?: number;
          progress_percentage?: number;
          config?: any;
          meals?: any;
          estimated_calories?: number;
          nutrition_advice?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      shopping_items: {
        Row: {
          id: string;
          user_id: string;
          plan_id?: string;
          name: string;
          category: string;
          quantity: string;
          unit: string;
          price: number;
          estimated_price?: number;
          is_checked: boolean;
          notes?: string;
          priority: 'high' | 'medium' | 'low';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id?: string;
          name: string;
          category: string;
          quantity: string;
          unit: string;
          price: number;
          estimated_price?: number;
          is_checked?: boolean;
          notes?: string;
          priority?: 'high' | 'medium' | 'low';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          name?: string;
          category?: string;
          quantity?: string;
          unit?: string;
          price?: number;
          estimated_price?: number;
          is_checked?: boolean;
          notes?: string;
          priority?: 'high' | 'medium' | 'low';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
