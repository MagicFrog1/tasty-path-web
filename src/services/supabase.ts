import { createClient } from '@supabase/supabase-js';

// Supabase: URL y anon key provistos por el usuario
const supabaseUrl = 'https://mxpxmdpydstdbhzxnxgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cHhtZHB5ZHN0ZGJoenhueGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjQwMDQsImV4cCI6MjA3MzIwMDAwNH0.tK1WnB28V2a9py7QVsw5p30hVtoMMyu7euE45Y8eaP4';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
