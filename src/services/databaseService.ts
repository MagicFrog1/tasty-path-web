import { supabase } from './supabase';
import { Database } from './supabase';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

type UserDietConfig = Database['public']['Tables']['user_diet_configs']['Row'];
type UserDietConfigInsert = Database['public']['Tables']['user_diet_configs']['Insert'];
type UserDietConfigUpdate = Database['public']['Tables']['user_diet_configs']['Update'];

type WeeklyPlan = Database['public']['Tables']['weekly_plans']['Row'];
type WeeklyPlanInsert = Database['public']['Tables']['weekly_plans']['Insert'];
type WeeklyPlanUpdate = Database['public']['Tables']['weekly_plans']['Update'];

type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];
type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert'];
type ShoppingItemUpdate = Database['public']['Tables']['shopping_items']['Update'];

export class DatabaseService {
  // ===== PERFILES DE USUARIO =====
  
  static async createUserProfile(profile: UserProfileInsert): Promise<UserProfile | null> {
    try {
      // Verificar que hay una sesión activa
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.error('❌ No hay sesión activa al intentar crear perfil');
        console.error('💡 Verifica que la sesión esté establecida después de signUp');
      } else {
        console.log('✅ Sesión activa encontrada:', sessionData.session.user.id);
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error de Supabase al crear perfil:', error);
        
        // Mensajes de error más específicos
        if (error.code === 'PGRST116' || error.message?.includes('401') || error.message?.includes('permission denied')) {
          console.error('💡 Error 401: Las políticas RLS pueden estar bloqueando la inserción');
          console.error('💡 Verifica en Supabase Dashboard → Authentication → Policies que existe una política para INSERT');
          console.error('💡 La política debe permitir: INSERT WHERE auth.uid() = id');
        }
        
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Error al crear perfil de usuario:', error);
      console.error('Código de error:', error?.code);
      console.error('Mensaje de error:', error?.message);
      return null;
    }
  }

  static async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Usar maybeSingle en lugar de single para evitar error 406 cuando no existe
      
      if (error) {
        console.error('Error al obtener perfil de usuario:', error);
        // Si es un error 406, significa que no hay perfil, retornar null
        if (error.code === 'PGRST116' || error.message?.includes('406')) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      return null;
    }
  }

  static async updateUserProfile(id: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar perfil de usuario:', error);
      return null;
    }
  }

  // ===== CONFIGURACIÓN DE DIETA =====
  
  static async createUserDietConfig(config: UserDietConfigInsert): Promise<UserDietConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_diet_configs')
        .insert(config)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear configuración de dieta:', error);
      return null;
    }
  }

  static async getUserDietConfig(userId: string): Promise<UserDietConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_diet_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Usar maybeSingle para evitar error 406 cuando no existe
      
      if (error) {
        // Si es un error 406, significa que no hay configuración, retornar null
        if (error.code === 'PGRST116' || error.message?.includes('406')) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error al obtener configuración de dieta:', error);
      return null;
    }
  }

  static async updateUserDietConfig(userId: string, updates: UserDietConfigUpdate): Promise<UserDietConfig | null> {
    try {
      const { data, error } = await supabase
        .from('user_diet_configs')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar configuración de dieta:', error);
      return null;
    }
  }

  // ===== PLANES SEMANALES =====
  
  static async createWeeklyPlan(plan: WeeklyPlanInsert): Promise<WeeklyPlan | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .insert(plan)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear plan semanal:', error);
      return null;
    }
  }

  static async getWeeklyPlans(userId: string): Promise<WeeklyPlan[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener planes semanales:', error);
      return [];
    }
  }

  static async getWeeklyPlan(id: string): Promise<WeeklyPlan | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener plan semanal:', error);
      return null;
    }
  }

  static async updateWeeklyPlan(id: string, updates: WeeklyPlanUpdate): Promise<WeeklyPlan | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar plan semanal:', error);
      return null;
    }
  }

  static async deleteWeeklyPlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('weekly_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar plan semanal:', error);
      return false;
    }
  }

  static async getActiveWeeklyPlan(userId: string): Promise<WeeklyPlan | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle(); // Usar maybeSingle para evitar error 406 cuando no existe
      
      if (error) {
        // Si es un error 406, significa que no hay plan activo, retornar null
        if (error.code === 'PGRST116' || error.message?.includes('406')) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error al obtener plan activo:', error);
      return null;
    }
  }

  // ===== LISTA DE COMPRAS =====
  
  static async createShoppingItem(item: ShoppingItemInsert): Promise<ShoppingItem | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear item de compras:', error);
      return null;
    }
  }

  static async getShoppingItems(userId: string): Promise<ShoppingItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener items de compras:', error);
      return [];
    }
  }

  static async getShoppingItemsByPlan(planId: string): Promise<ShoppingItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener items de compras por plan:', error);
      return [];
    }
  }

  static async updateShoppingItem(id: string, updates: ShoppingItemUpdate): Promise<ShoppingItem | null> {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar item de compras:', error);
      return null;
    }
  }

  static async deleteShoppingItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar item de compras:', error);
      return false;
    }
  }

  static async toggleShoppingItem(id: string, isChecked: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ is_checked: isChecked })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al alternar item de compras:', error);
      return false;
    }
  }

  // ===== FUNCIONES DE UTILIDAD =====
  
  static async clearAllUserData(userId: string): Promise<boolean> {
    try {
      // Eliminar en orden para respetar las foreign keys
      await supabase.from('shopping_items').delete().eq('user_id', userId);
      await supabase.from('weekly_plans').delete().eq('user_id', userId);
      await supabase.from('user_diet_configs').delete().eq('user_id', userId);
      await supabase.from('user_profiles').delete().eq('id', userId);
      
      return true;
    } catch (error) {
      console.error('Error al limpiar datos del usuario:', error);
      return false;
    }
  }

  static async getDatabaseStats(userId: string): Promise<{
    totalPlans: number;
    activePlans: number;
    totalShoppingItems: number;
    completedShoppingItems: number;
  }> {
    try {
      const [plans, shoppingItems] = await Promise.all([
        this.getWeeklyPlans(userId),
        this.getShoppingItems(userId)
      ]);

      return {
        totalPlans: plans.length,
        activePlans: plans.filter(p => p.status === 'active').length,
        totalShoppingItems: shoppingItems.length,
        completedShoppingItems: shoppingItems.filter(i => i.is_checked).length,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de la base de datos:', error);
      return {
        totalPlans: 0,
        activePlans: 0,
        totalShoppingItems: 0,
        completedShoppingItems: 0,
      };
    }
  }
}
