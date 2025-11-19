import { DatabaseService } from '../services/databaseService';
import { supabase } from '../services/supabase';

export class DatabaseTester {
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Probando conexión a Supabase...');
      
      // Probar conexión básica
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ Error de conexión:', error);
        return false;
      }
      
      console.log('✅ Conexión exitosa a Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      return false;
    }
  }

  static async testTables(): Promise<{
    user_profiles: boolean;
    user_diet_configs: boolean;
    weekly_plans: boolean;
    shopping_items: boolean;
  }> {
    const results = {
      user_profiles: false,
      user_diet_configs: false,
      weekly_plans: false,
      shopping_items: false
    };

    try {
      console.log('📋 Verificando tablas...');

      // Verificar user_profiles
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);
        
        if (!error) {
          results.user_profiles = true;
          console.log('✅ Tabla user_profiles: OK');
        } else {
          console.log('❌ Tabla user_profiles: Error', error.message);
        }
      } catch (error) {
        console.log('❌ Tabla user_profiles: No existe');
      }

      // Verificar user_diet_configs
      try {
        const { data, error } = await supabase
          .from('user_diet_configs')
          .select('id')
          .limit(1);
        
        if (!error) {
          results.user_diet_configs = true;
          console.log('✅ Tabla user_diet_configs: OK');
        } else {
          console.log('❌ Tabla user_diet_configs: Error', error.message);
        }
      } catch (error) {
        console.log('❌ Tabla user_diet_configs: No existe');
      }

      // Verificar weekly_plans
      try {
        const { data, error } = await supabase
          .from('weekly_plans')
          .select('id')
          .limit(1);
        
        if (!error) {
          results.weekly_plans = true;
          console.log('✅ Tabla weekly_plans: OK');
        } else {
          console.log('❌ Tabla weekly_plans: Error', error.message);
        }
      } catch (error) {
        console.log('❌ Tabla weekly_plans: No existe');
      }

      // Verificar shopping_items
      try {
        const { data, error } = await supabase
          .from('shopping_items')
          .select('id')
          .limit(1);
        
        if (!error) {
          results.shopping_items = true;
          console.log('✅ Tabla shopping_items: OK');
        } else {
          console.log('❌ Tabla shopping_items: Error', error.message);
        }
      } catch (error) {
        console.log('❌ Tabla shopping_items: No existe');
      }

    } catch (error) {
      console.error('❌ Error al verificar tablas:', error);
    }

    return results;
  }

  static async testCRUDOperations(): Promise<boolean> {
    try {
      console.log('🧪 Probando operaciones CRUD...');

      // Crear usuario de prueba
      const testUserId = 'test-user-' + Date.now();
      const testProfile = {
        id: testUserId,
        email: `test-${Date.now()}@example.com`,
        name: 'Usuario de Prueba',
        weight: 70.0,
        height: 170.0,
        age: 25,
        gender: 'male' as const,
        activity_level: 'moderate' as const
      };

      console.log('📝 Creando perfil de usuario...');
      const createdProfile = await DatabaseService.createUserProfile(testProfile);
      if (!createdProfile) {
        console.log('❌ Error al crear perfil');
        return false;
      }
      console.log('✅ Perfil creado:', createdProfile.id);

      // Crear configuración de dieta
      console.log('🍽️ Creando configuración de dieta...');
      const testDietConfig = {
        user_id: testUserId,
        goals: ['Pérdida de peso'],
        dietary_preferences: ['Vegetariana'],
        allergens: [],
        weekly_budget: 50.00,
        cooking_time_weekdays: 30,
        cooking_time_weekends: 60,
        meal_count_breakfast: true,
        meal_count_lunch: true,
        meal_count_dinner: true,
        meal_count_snacks: false,
        special_requirements: []
      };

      const createdDietConfig = await DatabaseService.createUserDietConfig(testDietConfig);
      if (!createdDietConfig) {
        console.log('❌ Error al crear configuración de dieta');
        return false;
      }
      console.log('✅ Configuración de dieta creada:', createdDietConfig.id);

      // Crear plan semanal
      console.log('📅 Creando plan semanal...');
      const testPlan = {
        user_id: testUserId,
        name: 'Plan de Prueba',
        description: 'Plan de prueba para testing',
        week_start: new Date().toISOString().split('T')[0],
        week_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_meals: 21,
        total_calories: 15000,
        total_cost: 50.00,
        status: 'draft' as const,
        nutrition_goals_protein: 20,
        nutrition_goals_carbs: 50,
        nutrition_goals_fat: 30,
        nutrition_goals_fiber: 25,
        progress_completed_meals: 0,
        progress_total_meals: 21,
        progress_percentage: 0
      };

      const createdPlan = await DatabaseService.createWeeklyPlan(testPlan);
      if (!createdPlan) {
        console.log('❌ Error al crear plan semanal');
        return false;
      }
      console.log('✅ Plan semanal creado:', createdPlan.id);

      // Crear item de compras
      console.log('🛒 Creando item de compras...');
      const testShoppingItem = {
        user_id: testUserId,
        plan_id: createdPlan.id,
        name: 'Manzana de Prueba',
        category: 'Frutas',
        quantity: '5',
        unit: 'unidades',
        price: 2.50,
        priority: 'medium' as const
      };

      const createdShoppingItem = await DatabaseService.createShoppingItem(testShoppingItem);
      if (!createdShoppingItem) {
        console.log('❌ Error al crear item de compras');
        return false;
      }
      console.log('✅ Item de compras creado:', createdShoppingItem.id);

      // Probar operaciones de lectura
      console.log('📖 Probando operaciones de lectura...');
      
      const retrievedProfile = await DatabaseService.getUserProfile(testProfile.email);
      if (!retrievedProfile) {
        console.log('❌ Error al obtener perfil');
        return false;
      }

      const retrievedDietConfig = await DatabaseService.getUserDietConfig(testUserId);
      if (!retrievedDietConfig) {
        console.log('❌ Error al obtener configuración de dieta');
        return false;
      }

      const retrievedPlans = await DatabaseService.getWeeklyPlans(testUserId);
      if (retrievedPlans.length === 0) {
        console.log('❌ Error al obtener planes semanales');
        return false;
      }

      const retrievedShoppingItems = await DatabaseService.getShoppingItems(testUserId);
      if (retrievedShoppingItems.length === 0) {
        console.log('❌ Error al obtener items de compras');
        return false;
      }

      console.log('✅ Operaciones de lectura exitosas');

      // Probar operaciones de actualización
      console.log('✏️ Probando operaciones de actualización...');
      
      const updatedProfile = await DatabaseService.updateUserProfile(testUserId, { 
        weight: 75.0 
      });
      if (!updatedProfile || updatedProfile.weight !== 75.0) {
        console.log('❌ Error al actualizar perfil');
        return false;
      }

      const updatedPlan = await DatabaseService.updateWeeklyPlan(createdPlan.id, { 
        progress_percentage: 25 
      });
      if (!updatedPlan || updatedPlan.progress_percentage !== 25) {
        console.log('❌ Error al actualizar plan');
        return false;
      }

      const updatedShoppingItem = await DatabaseService.toggleShoppingItem(createdShoppingItem.id, true);
      if (!updatedShoppingItem) {
        console.log('❌ Error al actualizar item de compras');
        return false;
      }

      console.log('✅ Operaciones de actualización exitosas');

      // Limpiar datos de prueba
      console.log('🧹 Limpiando datos de prueba...');
      await DatabaseService.deleteWeeklyPlan(createdPlan.id);
      await DatabaseService.deleteShoppingItem(createdShoppingItem.id);
      
      // No eliminamos el perfil y dieta config para evitar problemas de foreign key
      console.log('⚠️ Perfil y configuración de dieta de prueba se mantienen para evitar problemas de foreign key');

      console.log('✅ Todas las operaciones CRUD funcionan correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error en operaciones CRUD:', error);
      return false;
    }
  }

  static async runFullTest(): Promise<void> {
    console.log('🚀 INICIANDO PRUEBA COMPLETA DE BASE DE DATOS');
    console.log('================================================');

    // Probar conexión
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      console.log('❌ No se puede continuar sin conexión');
      return;
    }

    console.log('');

    // Verificar tablas
    const tablesOk = await this.testTables();
    const allTablesExist = Object.values(tablesOk).every(exists => exists);
    
    if (!allTablesExist) {
      console.log('❌ Algunas tablas no existen. Ejecuta el script init.sql primero.');
      return;
    }

    console.log('');

    // Probar operaciones CRUD
    const crudOk = await this.testCRUDOperations();

    console.log('');
    console.log('================================================');
    
    if (crudOk) {
      console.log('🎉 PRUEBA COMPLETA EXITOSA');
      console.log('✅ La base de datos está funcionando correctamente');
    } else {
      console.log('❌ PRUEBA COMPLETA FALLIDA');
      console.log('🔧 Revisa los errores anteriores');
    }
  }
}

// Función para ejecutar desde la consola
export const testDatabase = () => {
  DatabaseTester.runFullTest();
};
