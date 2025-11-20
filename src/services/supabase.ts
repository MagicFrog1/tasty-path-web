import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '../../env.config';

// Supabase: URL y anon key desde variables de entorno
// Obtener directamente de import.meta.env primero, luego de ENV_CONFIG
const supabaseUrl = 
  import.meta?.env?.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta?.env?.VITE_SUPABASE_URL ||
  ENV_CONFIG.SUPABASE_URL ||
  'https://zftqkqnjpjnmwfwsmxdy.supabase.co';

const supabaseKey = 
  import.meta?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta?.env?.VITE_SUPABASE_ANON_KEY ||
  ENV_CONFIG.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdHFrcW5qcGpubXdmd3NteGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzc1MDgsImV4cCI6MjA3OTIxMzUwOH0.508D-ThuIWMsS9---T9OF1I2q4_cvbJX2H95D7S99jE';

// Debug: Verificar qué variables están disponibles
console.log('🔍 Debug - Variables de entorno disponibles:');
console.log('  - import.meta.env.NEXT_PUBLIC_SUPABASE_URL:', import.meta?.env?.NEXT_PUBLIC_SUPABASE_URL || 'NO DISPONIBLE');
console.log('  - import.meta.env.VITE_SUPABASE_URL:', import.meta?.env?.VITE_SUPABASE_URL || 'NO DISPONIBLE');
console.log('  - import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY:', import.meta?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DISPONIBLE' : 'NO DISPONIBLE');
console.log('  - import.meta.env.VITE_SUPABASE_ANON_KEY:', import.meta?.env?.VITE_SUPABASE_ANON_KEY ? 'DISPONIBLE' : 'NO DISPONIBLE');
console.log('  - ENV_CONFIG.SUPABASE_URL:', ENV_CONFIG.SUPABASE_URL ? 'DISPONIBLE' : 'NO DISPONIBLE');
console.log('  - ENV_CONFIG.SUPABASE_ANON_KEY:', ENV_CONFIG.SUPABASE_ANON_KEY ? 'DISPONIBLE' : 'NO DISPONIBLE');

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
console.log('📍 URL final:', supabaseUrl);
console.log('🔑 Key configurada:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA');
console.log('🔑 Key completa (primeros 50 chars):', supabaseKey ? `${supabaseKey.substring(0, 50)}...` : 'NO CONFIGURADA');

// Validación crítica
if (!supabaseUrl || !supabaseKey || supabaseKey === '') {
  console.error('❌ ERROR CRÍTICO: Supabase no está configurado correctamente');
  console.error('📍 URL:', supabaseUrl || 'VACÍA');
  console.error('🔑 KEY:', supabaseKey || 'VACÍA');
  throw new Error('Supabase URL o ANON_KEY no configurados. Verifica las variables de entorno en Vercel.');
}

// Validar que tenemos las credenciales antes de crear el cliente
if (!supabaseUrl || supabaseUrl === '' || !supabaseKey || supabaseKey === '') {
  const errorMsg = '❌ ERROR CRÍTICO: Supabase no está configurado. Verifica las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel.';
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Crear cliente de Supabase con opciones de reintento
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    fetch: (url, options = {}) => {
      // Asegurar que siempre incluimos los headers necesarios
      const headers = new Headers(options?.headers);
      headers.set('apikey', supabaseKey);
      headers.set('Authorization', `Bearer ${supabaseKey}`);
      
      return fetch(url, {
        ...options,
        headers: headers,
      }).catch((error) => {
        console.error('❌ Error de conexión a Supabase:', error);
        console.error('📍 URL intentada:', url);
        console.error('🔑 Key usada:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA');
        
        // Si es un error de DNS, proporcionar ayuda
        if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
          console.error('💡 Posibles soluciones:');
          console.error('   1. Verifica que el proyecto de Supabase esté activo (no pausado)');
          console.error('   2. Verifica que la URL de Supabase sea correcta en Vercel');
          console.error('   3. Verifica que las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas en Vercel');
          console.error('   4. Revisa el dashboard de Supabase: https://app.supabase.com/');
        } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          console.error('💡 Error 401 - Posibles soluciones:');
          console.error('   1. Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY esté configurada correctamente en Vercel');
          console.error('   2. Verifica que la clave anónima sea correcta (debe empezar con eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9)');
          console.error('   3. Redespliega la aplicación después de agregar/modificar variables de entorno');
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
