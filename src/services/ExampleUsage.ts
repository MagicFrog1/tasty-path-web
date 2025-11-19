/**
 * Ejemplo de uso de la Base de Datos Optimizada de Alimentos
 * Muestra cómo usar los ingredientes comunes y snacks simplificados
 */

import completeFoodDatabase from './CompleteFoodDatabase';
import { COMMON_INGREDIENTS, SIMPLE_SNACKS, getDirectSnacks } from './CommonIngredients';

/**
 * Ejemplos de uso de los nuevos métodos optimizados
 */
export class FoodDatabaseExamples {

  /**
   * Ejemplo 1: Obtener ingredientes más comunes para cocinar
   */
  static getCommonIngredientsExample() {
    console.log('=== INGREDIENTES MÁS COMUNES PARA COCINAR ===');
    
    const commonIngredients = completeFoodDatabase.getCommonCookingIngredients();
    console.log(`Total de ingredientes comunes: ${commonIngredients.length}`);
    
    // Mostrar por categorías
    const categories = ['Proteínas', 'Carbohidratos', 'Vegetales', 'Frutas', 'Lácteos'];
    categories.forEach(category => {
      const categoryItems = commonIngredients.filter(food => 
        food.category.toLowerCase().includes(category.toLowerCase())
      );
      console.log(`${category}: ${categoryItems.length} ingredientes`);
    });
    
    return commonIngredients;
  }

  /**
   * Ejemplo 2: Obtener snacks simplificados
   */
  static getSimpleSnacksExample() {
    console.log('\n=== SNACKS SIMPLIFICADOS ===');
    
    const simpleSnacks = completeFoodDatabase.getSimpleSnacks();
    console.log(`Total de snacks disponibles: ${simpleSnacks.length}`);
    
    simpleSnacks.forEach(snack => {
      console.log(`- ${snack.name_es} (${snack.category})`);
    });
    
    return simpleSnacks;
  }

  /**
   * Ejemplo 3: Snacks por momento del día
   */
  static getSnacksByTimeExample() {
    console.log('\n=== SNACKS POR MOMENTO DEL DÍA ===');
    
    const times = ['morning', 'afternoon', 'evening'] as const;
    
    times.forEach(time => {
      const snacks = completeFoodDatabase.getSnacksByTime(time);
      console.log(`\n${time.toUpperCase()}:`);
      snacks.forEach(snack => {
        console.log(`  - ${snack.name_es}`);
      });
    });
  }

  /**
   * Ejemplo 4: Lista de compras optimizada
   */
  static getOptimizedShoppingListExample() {
    console.log('\n=== LISTA DE COMPRAS OPTIMIZADA ===');
    
    const shoppingList = completeFoodDatabase.getOptimizedShoppingList();
    
    Object.entries(shoppingList).forEach(([category, items]) => {
      console.log(`\n${category.toUpperCase()}:`);
      items.slice(0, 5).forEach(item => { // Mostrar solo los primeros 5
        console.log(`  - ${item.name_es}`);
      });
      if (items.length > 5) {
        console.log(`  ... y ${items.length - 5} más`);
      }
    });
    
    return shoppingList;
  }

  /**
   * Ejemplo 5: Usar ingredientes comunes del archivo CommonIngredients.ts
   */
  static getCommonIngredientsFromFileExample() {
    console.log('\n=== INGREDIENTES COMUNES DESDE ARCHIVO ===');
    
    console.log(`Total de ingredientes comunes: ${COMMON_INGREDIENTS.length}`);
    
    // Mostrar snacks directos
    const directSnacks = getDirectSnacks();
    console.log(`\nSnacks directos (sin cocinar):`);
    directSnacks.forEach(snack => {
      console.log(`  - ${snack.name_es} (${snack.serving})`);
    });
    
    return COMMON_INGREDIENTS;
  }

  /**
   * Ejemplo 6: Generar plan de comidas con ingredientes comunes
   */
  static generateMealPlanExample() {
    console.log('\n=== PLAN DE COMIDAS CON INGREDIENTES COMUNES ===');
    
    const commonIngredients = completeFoodDatabase.getCommonCookingIngredients();
    const simpleSnacks = completeFoodDatabase.getSimpleSnacks();
    
    // Simular un plan de comidas
    const mealPlan = {
      breakfast: [
        commonIngredients.find(f => f.id === 'eggs'),
        commonIngredients.find(f => f.id === 'bread'),
        commonIngredients.find(f => f.id === 'milk')
      ].filter(Boolean),
      
      lunch: [
        commonIngredients.find(f => f.id === 'chicken_breast'),
        commonIngredients.find(f => f.id === 'rice'),
        commonIngredients.find(f => f.id === 'broccoli')
      ].filter(Boolean),
      
      dinner: [
        commonIngredients.find(f => f.id === 'salmon'),
        commonIngredients.find(f => f.id === 'potatoes'),
        commonIngredients.find(f => f.id === 'spinach')
      ].filter(Boolean),
      
      snacks: {
        morning: [simpleSnacks.find(f => f.id === 'yogurt')].filter(Boolean),
        afternoon: [simpleSnacks.find(f => f.id === 'bananas')].filter(Boolean)
      }
    };
    
    console.log('Plan de comidas generado:');
    console.log('Desayuno:', mealPlan.breakfast.map(f => f!.name_es).join(', '));
    console.log('Almuerzo:', mealPlan.lunch.map(f => f!.name_es).join(', '));
    console.log('Cena:', mealPlan.dinner.map(f => f!.name_es).join(', '));
    console.log('Snack mañana:', mealPlan.snacks.morning.map(f => f!.name_es).join(', '));
    console.log('Snack tarde:', mealPlan.snacks.afternoon.map(f => f!.name_es).join(', '));
    
    return mealPlan;
  }

  /**
   * Ejecutar todos los ejemplos
   */
  static runAllExamples() {
    console.log('🍽️  EJEMPLOS DE BASE DE DATOS OPTIMIZADA DE ALIMENTOS\n');
    
    this.getCommonIngredientsExample();
    this.getSimpleSnacksExample();
    this.getSnacksByTimeExample();
    this.getOptimizedShoppingListExample();
    this.getCommonIngredientsFromFileExample();
    this.generateMealPlanExample();
    
    console.log('\n✅ Todos los ejemplos ejecutados correctamente');
  }
}

// Exportar para uso en otros archivos
export default FoodDatabaseExamples;
