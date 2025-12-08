/**
 * SERVICIO DE IA MEJORADO PARA MENÚS - TastyPath
 * Integra la base de datos completa de alimentos con +500 productos
 * Validado con fuentes médicas de Harvard, AHA, Mayo Clinic, etc.
 */

import { WeeklyPlan } from '../context/WeeklyPlanContext';
import { AI_CONFIG, isAIConfigured } from '../config/ai';
import { ENV_CONFIG } from '../../env.config';
import { medicalKnowledgeService } from './MedicalKnowledgeService';
import { completeFoodDatabase, Food, DietaryFilters, MealRecommendation } from './CompleteFoodDatabase';

export interface EnhancedAIMenuRequest {
  nutritionGoals: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  totalCalories: number;
  dietaryPreferences?: string[];
  allergies?: string[];
  cuisinePreferences?: string[];
  cookingTime?: {
    weekdays: number;
    weekends: number;
  };
  useExoticFruits?: boolean;
  useInternationalSpices?: boolean;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  bmi?: number;
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female';
  medicalConditions?: string[];
  
  // Nuevos campos para la base de datos mejorada
  preferredProteinSources?: ('animal' | 'plant' | 'mixed')[];
  seasonalPreference?: boolean;
  organicPreference?: boolean;
  lowSodiumPreference?: boolean;
}

export interface EnhancedAIMenuResponse {
  success: boolean;
  weeklyMenu: EnhancedDaySchedule[];
  message?: string;
  nutritionalAnalysis?: {
    totalNutrition: any;
    medicalValidation: string[];
    seasonalScore: number;
    diversityScore: number;
  };
}

export interface EnhancedDaySchedule {
  date: string;
  dayName: string;
  meals: {
    breakfast?: EnhancedMeal;
    lunch?: EnhancedMeal;
    dinner?: EnhancedMeal;
    snacks?: EnhancedMeal[];
  };
  notes?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    micronutrients: {
      sodium: number;
      potassium: number;
      calcium: number;
      iron: number;
      vitamin_c: number;
    };
  };
  medicalValidation: string[];
  seasonalFoods: string[];
  diversityScore: number;
}

export interface EnhancedMeal {
  name: string;
  instructions: string;
  ingredients: string[];
  prepTime: number;
  cookingTime?: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  selectedFoods: Food[];
  medicalBenefits: string[];
  cookingMethods: string[];
  seasonalIngredients: string[];
}

class EnhancedAIMenuService {
  // La API key ya no se expone al cliente - todas las llamadas van a /api/openai
  private baseUrl: string = '/api/openai';

  /**
   * Genera menú semanal usando la base de datos completa de alimentos
   */
  async generateWeeklyMenuWithFoodDatabase(request: EnhancedAIMenuRequest): Promise<EnhancedAIMenuResponse> {
    try {
      console.log('🔧 Iniciando generación de menú con base de datos completa de alimentos...');
      
      // La API key se maneja en el servidor a través de /api/openai

      // 1. Obtener alimentos recomendados basados en el perfil del usuario
      const recommendedFoods = this.getRecommendedFoodsForUser(request);
      console.log('🍎 Alimentos recomendados obtenidos:', recommendedFoods.foods.length);

      // 2. Generar conocimiento médico personalizado
      const medicalContext = this.generateMedicalContext(request);
      console.log('🔬 Contexto médico generado');

      // 3. Crear prompt enriquecido con la base de datos
      const enhancedPrompt = this.buildEnhancedPrompt(request, recommendedFoods, medicalContext);
      console.log('📝 Prompt mejorado creado');

      // 4. Generar seed único para variabilidad
      const generationSeed = this.generateUniqueSeed(request);
      console.log('🎲 Seed de generación:', generationSeed);

      // 5. Llamar a la API de OpenAI
      const response = await this.callOpenAIAPI(enhancedPrompt, generationSeed);
      console.log('🤖 Respuesta de IA recibida');

      // 6. Procesar y enriquecer la respuesta
      const enhancedMenu = this.processAndEnhanceResponse(response, recommendedFoods);
      console.log('✨ Menú enriquecido procesado');

      return {
        success: true,
        weeklyMenu: enhancedMenu,
        nutritionalAnalysis: this.analyzeWeeklyNutrition(enhancedMenu, recommendedFoods)
      };

    } catch (error) {
      console.error('❌ Error en generación de menú mejorado:', error);
      return {
        success: false,
        weeklyMenu: [],
        message: `Error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Obtiene alimentos recomendados de la base de datos según el perfil del usuario
   */
  private getRecommendedFoodsForUser(request: EnhancedAIMenuRequest): MealRecommendation {
    // Determinar objetivo principal
    let primaryGoal: 'weight_loss' | 'muscle_gain' | 'heart_health' | 'general_health' = 'general_health';
    
    if (request.bmi && request.bmi >= 25) {
      primaryGoal = 'weight_loss';
    } else if (request.activityLevel === 'very_active' || request.activityLevel === 'active') {
      primaryGoal = 'muscle_gain';
    } else if (request.medicalConditions?.includes('hipertension') || request.medicalConditions?.includes('colesterol')) {
      primaryGoal = 'heart_health';
    }

    // Crear filtros dietéticos
    const filters: DietaryFilters = {};
    
    if (request.dietaryPreferences?.includes('vegan')) {
      filters.vegan = true;
    }
    if (request.dietaryPreferences?.includes('vegetarian')) {
      filters.vegetarian = true;
    }
    if (request.dietaryPreferences?.includes('gluten_free')) {
      filters.gluten_free = true;
    }
    if (request.dietaryPreferences?.includes('dairy_free')) {
      filters.dairy_free = true;
    }
    if (request.dietaryPreferences?.includes('keto')) {
      filters.keto_friendly = true;
    }
    if (request.lowSodiumPreference) {
      filters.low_sodium = true;
    }

    // Obtener recomendaciones de la base de datos
    return completeFoodDatabase.generateMealRecommendations(
      primaryGoal,
      filters,
      request.totalCalories / 7 // Calorías promedio por día
    );
  }

  /**
   * Genera contexto médico personalizado
   */
  private generateMedicalContext(request: EnhancedAIMenuRequest): string {
    const userProfile = {
      age: request.age || 30,
      gender: request.gender || 'male',
      weight: request.weight || 70,
      height: request.height || 170,
      activityLevel: request.activityLevel || 'moderate',
      goals: this.extractGoalsFromRequest(request),
      medicalConditions: request.medicalConditions || []
    };

    return medicalKnowledgeService.generateComprehensiveMedicalPrompt(userProfile);
  }

  /**
   * Construye prompt enriquecido con la base de datos completa
   */
  private buildEnhancedPrompt(
    request: EnhancedAIMenuRequest, 
    recommendations: MealRecommendation,
    medicalContext: string
  ): string {
    const currentMonth = new Date().getMonth() + 1;
    const seasonalFoods = completeFoodDatabase.getSeasonalFoods(currentMonth);
    const categories = completeFoodDatabase.getCategories();
    
    // Obtener alimentos específicos por categoría para mayor variedad
    const proteins = completeFoodDatabase.getFoodsByCategory('Carnes')
      .concat(completeFoodDatabase.getFoodsByCategory('Pescados'))
      .concat(completeFoodDatabase.getFoodsByCategory('Legumbres'))
      .filter(food => {
        if (request.dietaryPreferences?.includes('vegan')) return food.is_vegan;
        if (request.dietaryPreferences?.includes('vegetarian')) return food.is_vegetarian;
        return true;
      });

    const vegetables = completeFoodDatabase.getFoodsByCategory('Verduras');
    const fruits = completeFoodDatabase.getFoodsByCategory('Frutas');
    const grains = completeFoodDatabase.getFoodsByCategory('Cereales');
    const nuts = completeFoodDatabase.getFoodsByCategory('Frutos Secos');
    const spices = completeFoodDatabase.getFoodsByCategory('Especias');

    return `
${medicalContext}

🍽️ BASE DE DATOS COMPLETA DE ALIMENTOS DISPONIBLES (500+ productos validados médicamente):

📊 ESTADÍSTICAS DE LA BASE DE DATOS:
- Total de alimentos: ${completeFoodDatabase.getDatabaseStats().total_foods}
- Alimentos veganos: ${completeFoodDatabase.getDatabaseStats().vegan_foods}
- Alimentos sin gluten: ${completeFoodDatabase.getDatabaseStats().gluten_free_foods}
- Alimentos altos en proteína: ${completeFoodDatabase.getDatabaseStats().high_protein_foods}
- Categorías disponibles: ${categories.join(', ')}

🥩 PROTEÍNAS DISPONIBLES (${proteins.length} opciones):
${proteins.slice(0, 20).map(f => `${f.name_es} (${f.calories} kcal, ${f.protein}g proteína)`).join(', ')}
${proteins.length > 20 ? `... y ${proteins.length - 20} más` : ''}

🥬 VERDURAS DISPONIBLES (${vegetables.length} opciones):
${vegetables.slice(0, 15).map(f => `${f.name_es} (${f.calories} kcal, ${f.fiber || 0}g fibra)`).join(', ')}
${vegetables.length > 15 ? `... y ${vegetables.length - 15} más` : ''}

🍎 FRUTAS DISPONIBLES (${fruits.length} opciones):
${fruits.slice(0, 15).map(f => `${f.name_es} (${f.calories} kcal, ${f.vitamin_c || 0}mg Vit C)`).join(', ')}
${fruits.length > 15 ? `... y ${fruits.length - 15} más` : ''}

🌾 CEREALES DISPONIBLES (${grains.length} opciones):
${grains.slice(0, 10).map(f => `${f.name_es} (${f.calories} kcal, ${f.fiber || 0}g fibra)`).join(', ')}
${grains.length > 10 ? `... y ${grains.length - 10} más` : ''}

🥜 FRUTOS SECOS Y SEMILLAS (${nuts.length} opciones):
${nuts.slice(0, 10).map(f => `${f.name_es} (${f.calories} kcal, ${f.protein}g proteína)`).join(', ')}
${nuts.length > 10 ? `... y ${nuts.length - 10} más` : ''}

🌿 ESPECIAS Y CONDIMENTOS (${spices.length} opciones):
${spices.slice(0, 15).map(f => f.name_es).join(', ')}
${spices.length > 15 ? `... y ${spices.length - 15} más` : ''}

🌱 ALIMENTOS DE TEMPORADA ACTUAL (Mes ${currentMonth}):
${seasonalFoods.slice(0, 20).map(f => f.name_es).join(', ')}

🎯 ALIMENTOS RECOMENDADOS PARA ESTE USUARIO:
${recommendations.foods.map(f => `${f.name_es} (${f.calories} kcal, ${f.protein}g proteína)`).join(', ')}

📋 VALIDACIÓN MÉDICA:
${recommendations.medical_validation.join('\n')}

🍳 MÉTODOS DE COCCIÓN SUGERIDOS:
${recommendations.cooking_suggestions.join(', ')}

📅 NOTAS ESTACIONALES:
${recommendations.seasonal_notes}

🎯 OBJETIVOS NUTRICIONALES:
- Calorías totales diarias: ${request.totalCalories}
- Proteína objetivo: ${request.nutritionGoals.protein}g
- Carbohidratos objetivo: ${request.nutritionGoals.carbs}g  
- Grasas objetivo: ${request.nutritionGoals.fat}g
- Fibra objetivo: ${request.nutritionGoals.fiber}g

🚫 RESTRICCIONES DIETÉTICAS:
${request.dietaryPreferences?.join(', ') || 'Ninguna'}

🚨 ALERGIAS:
${request.allergies?.join(', ') || 'Ninguna'}

⏰ TIEMPO DISPONIBLE:
- Días laborables: ${request.cookingTime?.weekdays || 30} minutos
- Fines de semana: ${request.cookingTime?.weekends || 60} minutos

🌍 PREFERENCIAS DE COCINA:
${request.cuisinePreferences?.join(', ') || 'Sin preferencias específicas'}

📝 INSTRUCCIONES ESPECÍFICAS PARA LA IA:

1. **USA EXCLUSIVAMENTE ALIMENTOS DE LA BASE DE DATOS PROPORCIONADA**
   - Selecciona alimentos de las listas anteriores
   - Prioriza alimentos recomendados para este usuario
   - Incluye alimentos de temporada cuando sea posible
   - Respeta todas las restricciones dietéticas

2. **VALIDACIÓN MÉDICA OBLIGATORIA**
   - Cada recomendación debe basarse en las fuentes médicas proporcionadas
   - Cita las fuentes cuando hagas recomendaciones específicas
   - Aplica el conocimiento médico personalizado del usuario
   - Respeta los protocolos nutricionales por condición médica

3. **DIVERSIDAD NUTRICIONAL (30+ PLANTAS POR SEMANA)**
   - Incluye al menos 30 tipos diferentes de plantas en la semana
   - Varía colores de vegetales y frutas diariamente
   - Alterna entre diferentes fuentes de proteína
   - Usa especias y hierbas variadas para máxima diversidad

4. **CÁLCULOS NUTRICIONALES PRECISOS**
   - Usa los valores nutricionales exactos de la base de datos
   - Calcula porciones realistas (ej: 150g proteína, 200g carbohidratos, 100g vegetales)
   - Ajusta cantidades para cumplir objetivos calóricos
   - Incluye micronutrientes cuando sea relevante

5. **ESTACIONALIDAD Y SOSTENIBILIDAD**
   - Prioriza alimentos de temporada actual (mes ${currentMonth})
   - Sugiere alternativas locales cuando sea posible
   - Considera la huella ambiental en las recomendaciones

6. **MÉTODOS DE COCCIÓN OPTIMIZADOS**
   - Usa métodos de cocción específicos de cada alimento
   - Respeta los tiempos de preparación disponibles
   - Incluye técnicas que preserven nutrientes
   - Sugiere preparaciones que maximicen biodisponibilidad

7. **PERSONALIZACIÓN AVANZADA**
   ${request.preferredProteinSources?.includes('plant') ? '- PRIORIZA proteínas vegetales de la base de datos' : ''}
   ${request.organicPreference ? '- PREFIERE alimentos orgánicos cuando estén disponibles' : ''}
   ${request.lowSodiumPreference ? '- SELECCIONA alimentos bajos en sodio' : ''}
   ${request.useExoticFruits ? '- INCLUYE frutas exóticas de la base de datos' : ''}
   ${request.useInternationalSpices ? '- USA especias internacionales variadas' : ''}

RESPONDE CON JSON VÁLIDO INCLUYENDO:
- Alimentos específicos de la base de datos
- Valores nutricionales precisos calculados
- Validación médica para cada día
- Lista de alimentos estacionales utilizados
- Puntuación de diversidad nutricional

{
  "weeklyMenu": [
    {
      "date": "2024-01-15",
      "dayName": "Lunes",
      "meals": {
        "breakfast": {
          "name": "Nombre específico del plato",
          "instructions": "Instrucciones detalladas paso a paso usando alimentos de la base de datos",
          "ingredients": ["Lista de ingredientes específicos de la base de datos"],
          "prepTime": 10,
          "cookingTime": 15,
          "nutrition": {
            "calories": 450,
            "protein": 25,
            "carbs": 45,
            "fat": 18,
            "fiber": 8
          },
          "selectedFoods": ["IDs de alimentos de la base de datos usados"],
          "medicalBenefits": ["Beneficios médicos específicos con fuentes"],
          "cookingMethods": ["Métodos de cocción utilizados"],
          "seasonalIngredients": ["Ingredientes de temporada usados"]
        },
        "lunch": { /* estructura similar */ },
        "dinner": { /* estructura similar */ },
        "snacks": [{ /* estructura similar */ }]
      },
      "nutrition": {
        "calories": 1800,
        "protein": 98,
        "carbs": 175,
        "fat": 73,
        "fiber": 35,
        "micronutrients": {
          "sodium": 2200,
          "potassium": 3500,
          "calcium": 1000,
          "iron": 18,
          "vitamin_c": 90
        }
      },
      "medicalValidation": ["Validaciones médicas específicas para este día"],
      "seasonalFoods": ["Alimentos de temporada utilizados"],
      "diversityScore": 8.5
    }
    // ... resto de días de la semana
  ]
}

IMPORTANTE: 
- USA SOLO alimentos de las listas proporcionadas
- CALCULA valores nutricionales basándote en los datos exactos de la base de datos
- INCLUYE validación médica en cada recomendación
- MAXIMIZA la diversidad nutricional (objetivo: 30+ plantas/semana)
- RESPETA todas las restricciones dietéticas del usuario
- PRIORIZA alimentos de temporada actual
`;
  }

  /**
   * Genera seed único para variabilidad
   */
  private generateUniqueSeed(request: EnhancedAIMenuRequest): number {
    const timestamp = Date.now();
    const userHash = this.hashString(JSON.stringify(request));
    const randomComponent = Math.random() * 1000000;
    return timestamp + userHash + randomComponent;
  }

  /**
   * Llama a la API de OpenAI con el prompt mejorado
   */
  private async callOpenAIAPI(prompt: string, seed: number): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un chef nutricional experto que usa una base de datos médica validada de +500 alimentos. Generación #${seed}. Cada menú debe ser único y basado en evidencia científica.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9, // Alta creatividad pero controlada
          max_tokens: 8000 // Más tokens para respuestas detalladas
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content;

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Procesa y enriquece la respuesta de la IA
   */
  private processAndEnhanceResponse(
    aiResponse: string, 
    recommendations: MealRecommendation
  ): EnhancedDaySchedule[] {
    try {
      // Limpiar y parsear JSON
      const cleanResponse = this.cleanJSONResponse(aiResponse);
      const parsedMenu = JSON.parse(cleanResponse);
      
      // Enriquecer cada día con información adicional
      return parsedMenu.weeklyMenu.map((day: any) => this.enhanceDay(day, recommendations));
      
    } catch (error) {
      console.error('Error procesando respuesta de IA:', error);
      throw new Error('No se pudo procesar la respuesta de la IA');
    }
  }

  /**
   * Enriquece un día específico con información de la base de datos
   */
  private enhanceDay(day: any, recommendations: MealRecommendation): EnhancedDaySchedule {
    const enhancedMeals: any = {};
    
    // Enriquecer cada comida
    Object.keys(day.meals).forEach(mealType => {
      const meal = day.meals[mealType];
      if (Array.isArray(meal)) {
        // Para snacks (array)
        enhancedMeals[mealType] = meal.map(snack => this.enhanceMeal(snack, recommendations));
      } else if (meal) {
        // Para comidas individuales
        enhancedMeals[mealType] = this.enhanceMeal(meal, recommendations);
      }
    });

    // Calcular diversidad nutricional del día
    const diversityScore = this.calculateDiversityScore(day);
    
    // Identificar alimentos estacionales usados
    const seasonalFoods = this.identifySeasonalFoods(day);
    
    // Generar validación médica específica
    const medicalValidation = this.generateDayMedicalValidation(day, recommendations);

    return {
      ...day,
      meals: enhancedMeals,
      medicalValidation,
      seasonalFoods,
      diversityScore,
      nutrition: {
        ...day.nutrition,
        micronutrients: this.calculateMicronutrients(day)
      }
    };
  }

  /**
   * Enriquece una comida específica con información de la base de datos
   */
  private enhanceMeal(meal: any, recommendations: MealRecommendation): EnhancedMeal {
    // Buscar alimentos de la base de datos que coincidan con los ingredientes
    const selectedFoods = this.matchIngredientsToDatabase(meal.ingredients);
    
    // Obtener beneficios médicos de los alimentos seleccionados
    const medicalBenefits = this.extractMedicalBenefits(selectedFoods);
    
    // Obtener métodos de cocción de los alimentos
    const cookingMethods = this.extractCookingMethods(selectedFoods);
    
    // Identificar ingredientes estacionales
    const seasonalIngredients = this.identifySeasonalIngredients(selectedFoods);

    return {
      ...meal,
      selectedFoods,
      medicalBenefits,
      cookingMethods,
      seasonalIngredients,
      nutrition: {
        ...meal.nutrition,
        fiber: this.calculateFiber(selectedFoods)
      }
    };
  }

  /**
   * Busca alimentos en la base de datos que coincidan con los ingredientes
   */
  private matchIngredientsToDatabase(ingredients: string[]): Food[] {
    const matchedFoods: Food[] = [];
    
    ingredients.forEach(ingredient => {
      const matches = completeFoodDatabase.searchFoodsByName(ingredient);
      if (matches.length > 0) {
        matchedFoods.push(matches[0]); // Tomar la mejor coincidencia
      }
    });
    
    return matchedFoods;
  }

  /**
   * Extrae beneficios médicos de los alimentos seleccionados
   */
  private extractMedicalBenefits(foods: Food[]): string[] {
    const benefits: string[] = [];
    
    foods.forEach(food => {
      if (food.medical_sources && food.medical_sources.length > 0) {
        if (food.category === 'Pescados' && food.subcategory === 'Azul') {
          benefits.push(`Omega-3 para salud cardiovascular (${food.medical_sources[0]})`);
        }
        if (food.is_high_fiber) {
          benefits.push(`Alto contenido en fibra para salud digestiva (${food.medical_sources[0]})`);
        }
        if (food.category === 'Verduras' && food.subcategory === 'Crucíferas') {
          benefits.push(`Compuestos anticancerígenos (${food.medical_sources[0]})`);
        }
        if (food.name === 'turmeric') {
          benefits.push(`Propiedades antiinflamatorias (${food.medical_sources[0]})`);
        }
      }
    });
    
    return benefits;
  }

  /**
   * Extrae métodos de cocción de los alimentos
   */
  private extractCookingMethods(foods: Food[]): string[] {
    const methods = new Set<string>();
    
    foods.forEach(food => {
      if (food.cooking_methods) {
        food.cooking_methods.forEach(method => methods.add(method));
      }
    });
    
    return Array.from(methods);
  }

  /**
   * Identifica ingredientes estacionales
   */
  private identifySeasonalIngredients(foods: Food[]): string[] {
    const currentMonth = new Date().getMonth() + 1;
    
    return foods
      .filter(food => food.seasonality && food.seasonality.includes(currentMonth))
      .map(food => food.name_es);
  }

  /**
   * Calcula puntuación de diversidad nutricional
   */
  private calculateDiversityScore(day: any): number {
    const uniqueIngredients = new Set<string>();
    const plantFoods = new Set<string>();
    
    // Extraer todos los ingredientes del día
    Object.values(day.meals).forEach((meal: any) => {
      if (Array.isArray(meal)) {
        meal.forEach(snack => {
          if (snack.ingredients) snack.ingredients.forEach((ing: string) => uniqueIngredients.add(ing));
        });
      } else if (meal && meal.ingredients) {
        meal.ingredients.forEach((ing: string) => uniqueIngredients.add(ing));
      }
    });

    // Contar plantas diferentes
    uniqueIngredients.forEach(ingredient => {
      const matches = completeFoodDatabase.searchFoodsByName(ingredient);
      if (matches.length > 0) {
        const food = matches[0];
        if (['Verduras', 'Frutas', 'Legumbres', 'Cereales', 'Frutos Secos', 'Especias'].includes(food.category)) {
          plantFoods.add(food.name);
        }
      }
    });

    // Puntuación basada en diversidad (máximo 10)
    return Math.min(10, (plantFoods.size / 5) * 10); // 5+ plantas = puntuación máxima
  }

  /**
   * Calcula micronutrientes del día
   */
  private calculateMicronutrients(day: any): any {
    // Implementación simplificada - en producción usar datos exactos de la base de datos
    return {
      sodium: 2200,
      potassium: 3500,
      calcium: 1000,
      iron: 18,
      vitamin_c: 90
    };
  }

  /**
   * Genera validación médica específica para el día
   */
  private generateDayMedicalValidation(day: any, recommendations: MealRecommendation): string[] {
    const validations: string[] = [];
    
    // Validaciones basadas en los alimentos recomendados
    recommendations.medical_validation.forEach(validation => {
      validations.push(validation);
    });
    
    // Validaciones adicionales basadas en el contenido del día
    const dayIngredients = this.extractAllIngredients(day);
    const hasOmega3Foods = dayIngredients.some(ing => 
      ['salmón', 'sardinas', 'nueces', 'semillas de chía'].includes(ing.toLowerCase())
    );
    
    if (hasOmega3Foods) {
      validations.push('Día rico en Omega-3 para salud cardiovascular y cerebral (AHA 2024)');
    }
    
    return validations;
  }

  /**
   * Analiza la nutrición de toda la semana
   */
  private analyzeWeeklyNutrition(menu: EnhancedDaySchedule[], recommendations: MealRecommendation): any {
    const totalNutrition = {
      calories: menu.reduce((sum, day) => sum + day.nutrition.calories, 0),
      protein: menu.reduce((sum, day) => sum + day.nutrition.protein, 0),
      carbs: menu.reduce((sum, day) => sum + day.nutrition.carbs, 0),
      fat: menu.reduce((sum, day) => sum + day.nutrition.fat, 0),
      fiber: menu.reduce((sum, day) => sum + day.nutrition.fiber, 0)
    };

    const averageDiversityScore = menu.reduce((sum, day) => sum + day.diversityScore, 0) / menu.length;
    const totalSeasonalFoods = new Set(menu.flatMap(day => day.seasonalFoods)).size;

    return {
      totalNutrition,
      medicalValidation: recommendations.medical_validation,
      seasonalScore: (totalSeasonalFoods / 30) * 10, // Puntuación sobre 10
      diversityScore: averageDiversityScore
    };
  }

  /**
   * Funciones auxiliares
   */
  private extractGoalsFromRequest(request: EnhancedAIMenuRequest): string[] {
    const goals: string[] = [];
    
    if (request.bmi && request.bmi >= 25) goals.push('weight_loss');
    if (request.bmi && request.bmi < 18.5) goals.push('weight_gain');
    if (request.activityLevel === 'very_active') goals.push('muscle_gain');
    if (request.medicalConditions?.includes('diabetes')) goals.push('diabetes_management');
    if (request.medicalConditions?.includes('hipertension')) goals.push('heart_health');
    
    goals.push('general_health');
    return goals;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private cleanJSONResponse(response: string): string {
    let clean = response.trim();
    
    // Remover markdown
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Encontrar JSON válido
    const jsonStart = clean.indexOf('{');
    const jsonEnd = clean.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      clean = clean.substring(jsonStart, jsonEnd);
    }
    
    return clean;
  }

  private extractAllIngredients(day: any): string[] {
    const ingredients: string[] = [];
    
    Object.values(day.meals).forEach((meal: any) => {
      if (Array.isArray(meal)) {
        meal.forEach(snack => {
          if (snack.ingredients) ingredients.push(...snack.ingredients);
        });
      } else if (meal && meal.ingredients) {
        ingredients.push(...meal.ingredients);
      }
    });
    
    return ingredients;
  }

  private calculateFiber(foods: Food[]): number {
    return foods.reduce((total, food) => total + (food.fiber || 0), 0);
  }

  private identifySeasonalFoods(day: any): string[] {
    const currentMonth = new Date().getMonth() + 1;
    const ingredients = this.extractAllIngredients(day);
    const seasonalFoods: string[] = [];
    
    ingredients.forEach(ingredient => {
      const matches = completeFoodDatabase.searchFoodsByName(ingredient);
      if (matches.length > 0) {
        const food = matches[0];
        if (food.seasonality && food.seasonality.includes(currentMonth)) {
          seasonalFoods.push(food.name_es);
        }
      }
    });
    
    return seasonalFoods;
  }
}

// Instancia singleton
export const enhancedAIMenuService = new EnhancedAIMenuService();
export default enhancedAIMenuService;
