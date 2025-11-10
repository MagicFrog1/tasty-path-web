import { ENV_CONFIG } from '../../env.config'; 

export interface DietConfig {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_boost' | 'diabetes_control' | 'heart_health' | 'digestive_health' | 'sleep_improvement';
  dietaryPreferences?: string[];
  allergies?: string[];
  budget?: number;
  cookingTime?: number;
}

export interface NutritionResponse {
  success: boolean;
  data?: WeeklyMealPlan;
  error?: string;
}

export interface WeeklyMealPlan {
  monday: DayMeals;
  tuesday: DayMeals;
  wednesday: DayMeals;
  thursday: DayMeals;
  friday: DayMeals;
  saturday: DayMeals;
  sunday: DayMeals;
  nutritionAdvice: string;
  shoppingList: string[];
  estimatedCalories: number;
  estimatedCost: number;
}

export interface DayMeals {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snacks?: Meal;
}

export interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  tags: string[];
}

export interface RecipeGenerationRequest {
  mealType: string;
  dietaryPreferences: string[];
  allergies: string[];
  availableIngredients?: string[];
  maxPrepTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface RecipeResponse {
  success: boolean;
  data?: Meal;
  error?: string;
}

class NutritionService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = ENV_CONFIG.OPENAI_API_KEY;
    this.apiUrl = ENV_CONFIG.OPENAI_API_URL;
    this.model = ENV_CONFIG.OPENAI_MODEL;
  }

  // Calcular Metabolismo Basal (MCI) usando la fórmula de Mifflin-St Jeor
  calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  // Calcular Tasa Metabólica Total (TMT) incluyendo nivel de actividad
  calculateTMT(bmr: number, activityLevel: string): number {
    const activityMultipliers = {
      'sedentary': 1.2,      // Poco o ningún ejercicio
      'light': 1.375,        // Ejercicio ligero 1-3 días/semana
      'moderate': 1.55,      // Ejercicio moderado 3-5 días/semana
      'active': 1.725,       // Ejercicio intenso 6-7 días/semana
      'very_active': 1.9     // Ejercicio muy intenso, trabajo físico
    };
    
    return bmr * (activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2);
  }

  // Calcular IMC
  calculateBMI(weight: number, height: number): number {
    return weight / Math.pow(height / 100, 2);
  }

  // Generar dieta personalizada completa
  async generatePersonalizedDiet(config: DietConfig): Promise<NutritionResponse> {
    try {
      const prompt = this.createNutritionPrompt(config);
      const response = await this.callOpenAI(prompt);
      
      if (response.success && response.data) {
        return this.parseNutritionResponse(response.data);
      } else {
        throw new Error(response.error || 'Error en la respuesta de OpenAI');
      }
    } catch (error) {
      console.error('Error generando dieta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Generar receta específica
  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeResponse> {
    try {
      const prompt = this.createRecipePrompt(request);
      const response = await this.callOpenAI(prompt);
      
      if (response.success && response.data) {
        return this.parseRecipeResponse(response.data);
      } else {
        throw new Error(response.error || 'Error en la respuesta de OpenAI');
      }
    } catch (error) {
      console.error('Error generando receta:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // Crear prompt para dieta nutricional
  private createNutritionPrompt(config: DietConfig): string {
    const objective = config.objective || 'weight_loss';
    const objectiveDescriptions = {
      weight_loss: 'pérdida de peso con déficit calórico moderado',
      muscle_gain: 'ganancia de masa muscular con excedente calórico controlado',
      maintenance: 'mantenimiento del peso actual con equilibrio nutricional',
      energy_boost: 'aumento de energía y vitalidad',
      diabetes_control: 'control de niveles de glucosa en sangre',
      heart_health: 'salud cardiovascular y reducción de colesterol',
      digestive_health: 'mejora de la salud digestiva',
      sleep_improvement: 'mejora de la calidad del sueño'
    };

    // Calcular MCI y TMT
    const bmr = this.calculateBMR(config.weight, config.height, config.age, config.gender);
    const tmt = this.calculateTMT(bmr, config.activityLevel);
    const bmi = this.calculateBMI(config.weight, config.height);

    // Ajustar calorías según objetivo
    let targetCalories = tmt;
    if (objective === 'weight_loss') {
      targetCalories = tmt * 0.85; // Déficit del 15%
    } else if (objective === 'muscle_gain') {
      targetCalories = tmt * 1.1; // Excedente del 10%
    }

    return `Genera un plan semanal de comidas VARIADO para:
- Objetivo: ${objectiveDescriptions[objective]}
- Calorías: ${Math.round(targetCalories)} cal/día
- Preferencias: ${config.dietaryPreferences?.join(', ') || 'ninguna'}
- Alergias: ${config.allergies?.join(', ') || 'ninguna'}
- Presupuesto: €${config.budget || 60}/semana

REGLAS:
- NO repitas menús entre días
- Varía proteínas, carbohidratos y verduras
- Cada comida debe ser única

RESPONDE ÚNICAMENTE EN FORMATO JSON válido:
{
  "monday": {
    "breakfast": {
      "name": "Nombre del plato",
      "calories": 300,
      "protein": 15,
      "carbs": 40,
      "fat": 8,
      "fiber": 5,
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "instructions": ["Paso 1", "Paso 2"],
      "prepTime": 10,
      "cookTime": 15,
      "difficulty": "easy",
      "servings": 1
    },
    "lunch": {
      "name": "Nombre del plato",
      "calories": 450,
      "protein": 25,
      "carbs": 50,
      "fat": 12,
      "fiber": 8,
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "instructions": ["Paso 1", "Paso 2"],
      "prepTime": 15,
      "cookTime": 20,
      "difficulty": "medium",
      "servings": 1
    },
    "dinner": {
      "name": "Nombre del plato",
      "calories": 400,
      "protein": 20,
      "carbs": 45,
      "fat": 10,
      "fiber": 6,
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "instructions": ["Paso 1", "Paso 2"],
      "prepTime": 12,
      "cookTime": 18,
      "difficulty": "easy",
      "servings": 1
    }
  },
  "tuesday": {...},
  "wednesday": {...},
  "thursday": {...},
  "friday": {...},
  "saturday": {...},
  "sunday": {...},
  "nutritionAdvice": "Consejo nutricional",
  "shoppingList": ["ingrediente 1", "ingrediente 2"],
  "estimatedCalories": ${Math.round(targetCalories)},
  "estimatedCost": 65
}

IMPORTANTE: 
- Responde ÚNICAMENTE con el JSON completo
- Asegúrate de que el JSON sea válido y esté completo
- No incluyas texto adicional fuera del JSON
- Verifica que todas las llaves estén cerradas correctamente`;
  }

  // Crear prompt para generación de recetas
  private createRecipePrompt(request: RecipeGenerationRequest): string {
    return `Actúa como un chef profesional experto. Necesito que generes una receta completa para ${request.mealType} con las siguientes especificaciones:

TIPO DE COMIDA: ${request.mealType}
PREFERENCIAS DIETÉTICAS: ${request.dietaryPreferences.join(', ')}
ALERGIAS: ${request.allergies.join(', ')}
${request.availableIngredients ? `INGREDIENTES DISPONIBLES: ${request.availableIngredients.join(', ')}` : ''}
${request.maxPrepTime ? `TIEMPO MÁXIMO DE PREPARACIÓN: ${request.maxPrepTime} minutos` : ''}
${request.difficulty ? `NIVEL DE DIFICULTAD: ${request.difficulty}` : ''}

INSTRUCCIONES:
1. Crea una receta completa y detallada
2. La receta debe ser:
   - Nutritiva y equilibrada
   - Fácil de seguir
   - Con ingredientes accesibles
   - Adaptada a las preferencias y restricciones

3. Incluye:
   - Nombre atractivo
   - Descripción del plato
   - Lista de ingredientes con cantidades exactas
   - Instrucciones paso a paso
   - Tiempos de preparación y cocción
   - Información nutricional completa
   - Nivel de dificultad
   - Número de porciones
   - Etiquetas relevantes

RESPONDE ÚNICAMENTE EN FORMATO JSON válido con esta estructura:
{
  "name": "...",
  "description": "...",
  "ingredients": [...],
  "instructions": [...],
  "prepTime": X,
  "cookTime": X,
  "calories": X,
  "protein": X,
  "carbs": X,
  "fat": X,
  "fiber": X,
  "difficulty": "...",
  "servings": X,
  "tags": [...]
}

IMPORTANTE: Asegúrate de que el JSON sea válido. No incluyas texto adicional fuera del JSON.`;
  }

  // Llamar a la API de OpenAI
  private async callOpenAI(prompt: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto nutricionista y chef profesional. Responde siempre en formato JSON válido y completo.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return {
          success: true,
          data: data.choices[0].message.content
        };
      } else {
        throw new Error('Respuesta inesperada de OpenAI');
      }
    } catch (error) {
      console.error('Error llamando a OpenAI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de red'
      };
    }
  }

  // Parsear respuesta de nutrición
  private parseNutritionResponse(responseText: string): NutritionResponse {
    try {
      // Limpiar la respuesta de posibles caracteres extra
      const cleanResponse = responseText.trim();
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
      const parsedData = JSON.parse(jsonString);
      
      // Validar estructura básica
      if (!parsedData.monday || !parsedData.nutritionAdvice) {
        throw new Error('Estructura de respuesta incompleta');
      }
      
      return {
        success: true,
        data: parsedData as WeeklyMealPlan
      };
    } catch (error) {
      console.error('Error parseando respuesta de nutrición:', error);
      return {
        success: false,
        error: 'Error parseando la respuesta de la IA'
      };
    }
  }

  // Parsear respuesta de receta
  private parseRecipeResponse(responseText: string): RecipeResponse {
    try {
      const cleanResponse = responseText.trim();
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const jsonString = cleanResponse.substring(jsonStart, jsonEnd);
      const parsedData = JSON.parse(jsonString);
      
      // Validar estructura básica
      if (!parsedData.name || !parsedData.ingredients || !parsedData.instructions) {
        throw new Error('Estructura de receta incompleta');
      }
      
      return {
        success: true,
        data: parsedData as Meal
      };
    } catch (error) {
      console.error('Error parseando respuesta de receta:', error);
      return {
        success: false,
        error: 'Error parseando la respuesta de la IA'
      };
    }
  }

  // Generar dieta de respaldo si falla la IA
  generateFallbackDiet(config: DietConfig): WeeklyMealPlan {
    return {
      monday: {
        breakfast: {
          name: 'Avena con frutas',
          description: 'Desayuno nutritivo y energético',
          ingredients: ['Avena', 'Leche desnatada', 'Plátano', 'Miel'],
          instructions: ['Cocinar avena con leche', 'Agregar frutas y miel'],
          prepTime: 5,
          cookTime: 10,
          calories: 300,
          protein: 10,
          carbs: 50,
          fat: 5,
          fiber: 6,
          difficulty: 'easy',
          servings: 1,
          tags: ['desayuno', 'avena', 'frutas']
        }
      },
      tuesday: {
        breakfast: {
          name: 'Yogur con granola',
          description: 'Desayuno proteico',
          ingredients: ['Yogur griego', 'Granola', 'Fresas'],
          instructions: ['Servir yogur', 'Agregar granola y frutas'],
          prepTime: 3,
          cookTime: 0,
          calories: 250,
          protein: 15,
          carbs: 30,
          fat: 8,
          fiber: 4,
          difficulty: 'easy',
          servings: 1,
          tags: ['desayuno', 'yogur', 'granola']
        }
      },
      wednesday: {
        breakfast: {
          name: 'Tostadas integrales',
          description: 'Desayuno clásico',
          ingredients: ['Pan integral', 'Aguacate', 'Huevo'],
          instructions: ['Tostar pan', 'Agregar aguacate y huevo'],
          prepTime: 5,
          cookTime: 8,
          calories: 320,
          protein: 15,
          carbs: 25,
          fat: 18,
          fiber: 5,
          difficulty: 'easy',
          servings: 1,
          tags: ['desayuno', 'tostadas', 'aguacate']
        }
      },
      thursday: {
        breakfast: {
          name: 'Smoothie de proteínas',
          description: 'Desayuno líquido nutritivo',
          ingredients: ['Leche desnatada', 'Plátano', 'Proteína en polvo'],
          instructions: ['Mezclar ingredientes', 'Batir hasta suave'],
          prepTime: 5,
          cookTime: 0,
          calories: 280,
          protein: 20,
          carbs: 30,
          fat: 4,
          fiber: 3,
          difficulty: 'easy',
          servings: 1,
          tags: ['desayuno', 'smoothie', 'proteínas']
        }
      },
      friday: {
        breakfast: {
          name: 'Cereal con leche',
          description: 'Desayuno tradicional',
          ingredients: ['Cereal integral', 'Leche desnatada', 'Frutos rojos'],
          instructions: ['Servir cereal', 'Agregar leche y frutas'],
          prepTime: 3,
          cookTime: 0,
          calories: 260,
          protein: 8,
          carbs: 45,
          fat: 4,
          fiber: 6,
          difficulty: 'easy',
          servings: 1,
          tags: ['desayuno', 'cereal', 'leche']
        }
      },
      saturday: {
        breakfast: {
          name: 'Panqueques de avena',
          description: 'Desayuno especial de fin de semana',
          ingredients: ['Avena', 'Huevo', 'Leche', 'Miel'],
          instructions: ['Mezclar ingredientes', 'Cocinar en sartén'],
          prepTime: 10,
          cookTime: 15,
          calories: 340,
          protein: 12,
          carbs: 52,
          fat: 10,
          fiber: 6,
          difficulty: 'medium',
          servings: 2,
          tags: ['desayuno', 'panqueques', 'avena']
        }
      },
      sunday: {
        breakfast: {
          name: 'Tortilla española',
          description: 'Desayuno tradicional español',
          ingredients: ['Huevos', 'Patatas', 'Cebolla', 'Aceite'],
          instructions: ['Freír patatas', 'Batir huevos', 'Cocinar'],
          prepTime: 15,
          cookTime: 20,
          calories: 380,
          protein: 18,
          carbs: 28,
          fat: 22,
          fiber: 4,
          difficulty: 'medium',
          servings: 2,
          tags: ['desayuno', 'tortilla', 'patatas']
        }
      },
      nutritionAdvice: 'Este es un plan básico de respaldo. Para obtener un plan personalizado completo, intenta generar uno nuevo.',
      shoppingList: ['Avena', 'Leche desnatada', 'Plátanos', 'Miel', 'Yogur griego', 'Granola', 'Fresas', 'Pan integral', 'Aguacate', 'Huevos', 'Cereal integral', 'Frutos rojos', 'Patatas', 'Cebolla'],
      estimatedCalories: 1800,
      estimatedCost: 45
    };
  }
}

export const nutritionService = new NutritionService();
