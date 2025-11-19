/**
 * Servicio Optimizado de Alimentos
 * Integra los ingredientes más comunes con la base de datos completa
 */

import { Food } from './CompleteFoodDatabase';
import { COMMON_INGREDIENTS, SIMPLE_SNACKS, CommonIngredient } from './CommonIngredients';

export interface OptimizedMealPlan {
  breakfast: Food[];
  lunch: Food[];
  dinner: Food[];
  snacks: {
    morning: Food[];
    afternoon: Food[];
  };
  shoppingList: {
    proteins: Food[];
    carbohydrates: Food[];
    vegetables: Food[];
    fruits: Food[];
    dairy: Food[];
    pantry: Food[];
  };
}

export interface SnackRecommendation {
  id: string;
  name_es: string;
  food: Food;
  serving_size: string;
  is_direct_food: boolean;
  preparation_time: 'instant' | 'quick' | 'cooked';
}

class OptimizedFoodService {
  
  /**
   * Obtener ingredientes más comunes para cocinar
   */
  getCommonCookingIngredients(): string[] {
    return COMMON_INGREDIENTS
      .filter(ingredient => !ingredient.is_simple_snack)
      .map(ingredient => ingredient.id);
  }

  /**
   * Obtener snacks simplificados
   */
  getSimpleSnacks(): SnackRecommendation[] {
    return SIMPLE_SNACKS.map(snack => {
      const food = this.getFoodById(snack.id.replace('_snack', ''));
      return {
        id: snack.id,
        name_es: snack.name_es,
        food: food || this.getFallbackFood(),
        serving_size: snack.serving,
        is_direct_food: snack.is_direct,
        preparation_time: snack.is_direct ? 'instant' : 'quick'
      };
    });
  }

  /**
   * Generar plan de comidas optimizado con ingredientes comunes
   */
  generateOptimizedMealPlan(preferences: {
    is_vegan?: boolean;
    is_vegetarian?: boolean;
    high_protein?: boolean;
    low_carb?: boolean;
  }): OptimizedMealPlan {
    
    // Filtrar ingredientes comunes según preferencias
    const availableIngredients = this.getFilteredCommonIngredients(preferences);
    
    return {
      breakfast: this.generateBreakfast(availableIngredients, preferences),
      lunch: this.generateLunch(availableIngredients, preferences),
      dinner: this.generateDinner(availableIngredients, preferences),
      snacks: {
        morning: this.generateMorningSnacks(),
        afternoon: this.generateAfternoonSnacks()
      },
      shoppingList: this.generateShoppingList(availableIngredients)
    };
  }

  /**
   * Obtener snacks directos para diferentes momentos del día
   */
  getDirectSnacksForTime(timeOfDay: 'morning' | 'afternoon' | 'evening'): SnackRecommendation[] {
    const baseSnacks = this.getSimpleSnacks();
    
    switch (timeOfDay) {
      case 'morning':
        return baseSnacks.filter(snack => 
          snack.name_es.includes('Yogur') || 
          snack.name_es.includes('Manzana') ||
          snack.name_es.includes('Almendras')
        );
      
      case 'afternoon':
        return baseSnacks.filter(snack => 
          snack.name_es.includes('Plátano') ||
          snack.name_es.includes('Queso') ||
          snack.name_es.includes('Pepino')
        );
      
      case 'evening':
        return baseSnacks.filter(snack => 
          snack.name_es.includes('Huevo') ||
          snack.name_es.includes('Atún') ||
          snack.name_es.includes('Aguacate')
        );
      
      default:
        return baseSnacks;
    }
  }

  /**
   * Obtener lista de compras optimizada con ingredientes comunes
   */
  getOptimizedShoppingList(categories: string[] = []): {
    essential: string[];
    optional: string[];
    snacks: string[];
  } {
    const essential = COMMON_INGREDIENTS
      .filter(ingredient => 
        ['Proteínas', 'Carbohidratos', 'Vegetales'].includes(ingredient.category)
      )
      .slice(0, 50) // Top 50 ingredientes esenciales
      .map(ingredient => ingredient.name_es);

    const optional = COMMON_INGREDIENTS
      .filter(ingredient => 
        ['Condimentos', 'Hierbas', 'Frutos Secos'].includes(ingredient.category)
      )
      .slice(0, 30) // Top 30 ingredientes opcionales
      .map(ingredient => ingredient.name_es);

    const snacks = SIMPLE_SNACKS
      .filter(snack => snack.is_direct)
      .map(snack => snack.name_es);

    return { essential, optional, snacks };
  }

  /**
   * Métodos privados
   */
  private getFoodById(id: string): Food | null {
    // Esta función debería conectarse con CompleteFoodDatabase
    // Por ahora retornamos null para evitar errores
    return null;
  }

  private getFallbackFood(): Food {
    return {
      id: 'fallback',
      name: 'fallback',
      name_es: 'Alimento Genérico',
      category: 'General',
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 5,
      is_vegan: true,
      is_vegetarian: true,
      is_gluten_free: true,
      is_dairy_free: true,
      is_keto_friendly: false,
      is_low_sodium: true,
      is_high_protein: false,
      is_high_fiber: false,
      is_organic: false
    };
  }

  private getFilteredCommonIngredients(preferences: any): CommonIngredient[] {
    return COMMON_INGREDIENTS.filter(ingredient => {
      // Aplicar filtros según preferencias
      if (preferences.is_vegan && ingredient.category === 'Proteínas') {
        return ['lentils', 'chickpeas', 'black_beans', 'tofu', 'tempeh'].includes(ingredient.id);
      }
      if (preferences.is_vegetarian && ingredient.category === 'Proteínas') {
        return !['ground_beef', 'beef_steak', 'pork_tenderloin', 'tuna', 'salmon', 'cod', 'shrimp'].includes(ingredient.id);
      }
      return true;
    });
  }

  private generateBreakfast(ingredients: CommonIngredient[], preferences: any): Food[] {
    // Lógica para generar desayuno
    return [];
  }

  private generateLunch(ingredients: CommonIngredient[], preferences: any): Food[] {
    // Lógica para generar almuerzo
    return [];
  }

  private generateDinner(ingredients: CommonIngredient[], preferences: any): Food[] {
    // Lógica para generar cena
    return [];
  }

  private generateMorningSnacks(): Food[] {
    // Snacks de mañana (yogur, manzana, etc.)
    return [];
  }

  private generateAfternoonSnacks(): Food[] {
    // Snacks de tarde (plátano, queso, etc.)
    return [];
  }

  private generateShoppingList(ingredients: CommonIngredient[]): any {
    // Organizar lista de compras por categorías
    return {
      proteins: [],
      carbohydrates: [],
      vegetables: [],
      fruits: [],
      dairy: [],
      pantry: []
    };
  }
}

export default new OptimizedFoodService();
