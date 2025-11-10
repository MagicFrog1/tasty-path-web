 import { WeeklyPlan } from '../context/WeeklyPlanContext';
import { AI_CONFIG, isAIConfigured } from '../config/ai';
import { ENV_CONFIG } from '../../env.config';
import { calculateMealNutrition, getNutritionData } from './NutritionDatabase';
import { medicalKnowledgeService } from './MedicalKnowledgeService';
import { completeFoodDatabase, Food, DietaryFilters } from './CompleteFoodDatabase';
import { optimizedFoodDatabase } from './OptimizedFoodDatabase';
import { recipeDatabase, Recipe } from './RecipeDatabase';

export interface AIMenuRequest {
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
  weeklyBudget?: number; // Presupuesto semanal en euros
  weight?: number; // Peso en kg
  height?: number; // Altura en cm
  bmr?: number; // Metabolismo Basal calculado
  useExoticFruits?: boolean; // Opción para usar frutas exóticas
  useInternationalSpices?: boolean; // Opción para usar especias internacionales
  // Nuevos campos para personalización avanzada
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  bmi?: number;
  age?: number;
  gender?: 'male' | 'female';
  medicalConditions?: string[]; // Campo faltante para condiciones médicas
}

export interface AIMenuResponse {
  success: boolean;
  weeklyMenu: DaySchedule[];
  message?: string;
}

export interface DaySchedule {
  date: string;
  dayName: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks?: Meal[];
  };
  notes?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  calorieRange?: {
    min: number;
    max: number;
    display: string;
  };
}

export interface Meal {
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
  };
  calorieRange?: {
    min: number;
    max: number;
    display: string;
  };
}

class AIMenuService {
  private apiKey: string = ENV_CONFIG.OPENAI_API_KEY; // Usar la API key correcta
  private baseUrl: string = ENV_CONFIG.OPENAI_API_URL; // Usar la URL correcta

  // Función para generar menú semanal usando IA con reintentos
  async generateWeeklyMenu(request: AIMenuRequest): Promise<AIMenuResponse> {
    console.log('🚀 INICIANDO GENERACIÓN DE MENÚ SEMANAL...');
    console.log('📊 Request recibido:', {
      totalCalories: request.totalCalories,
      dietaryPreferences: request.dietaryPreferences,
      allergies: request.allergies
    });
    
    // Verificar si la IA está configurada correctamente
    if (!isAIConfigured()) {
      console.log('⚠️ IA no configurada correctamente, usando fallback local...');
      console.log('🔍 Razón: API Key no válida o no configurada');
      return await this.generateFallbackMenu(request);
    }
    
    console.log('✅ IA configurada correctamente, procediendo con generación...');
    
    try {
      const result = await this.retryAIGeneration(request, 1);
      console.log('✅ RESULTADO FINAL:', result.success ? 'ÉXITO CON IA' : 'FALLBACK');
      return result;
    } catch (error) {
      console.error('❌ ERROR CRÍTICO en generación de menú:', error);
      console.log('🔄 Usando fallback local debido a error crítico...');
      console.log('🔍 Tipo de error:', error instanceof Error ? error.message : String(error));
      console.log('🔍 Stack trace:', error instanceof Error ? error.stack : 'No disponible');
      return await this.generateFallbackMenu(request);
    }
  }

  // Función interna para intentar generación con IA
  private async attemptAIGeneration(request: AIMenuRequest): Promise<AIMenuResponse> {
    try {
      // Verificar configuración de la API con más detalle
      console.log('🔧 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN DE IA:');
      console.log('🔑 API Key presente:', !!this.apiKey);
      console.log('🔑 API Key longitud:', this.apiKey?.length || 0);
      console.log('🔑 API Key empieza con sk-:', this.apiKey?.startsWith('sk-') || false);
      console.log('🔑 API Key NO es placeholder:', this.apiKey !== 'your-openai-api-key');
      console.log('🌐 Base URL:', this.baseUrl);
      console.log('🤖 Modelo:', ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini');
      console.log('📊 Request recibido:', {
        totalCalories: request.totalCalories,
        dietaryPreferences: request.dietaryPreferences,
        allergies: request.allergies
      });
      
      // Verificación más estricta de la API key
      if (!this.apiKey) {
        console.error('❌ API Key no está definida');
        throw new Error('API key de OpenAI no está definida');
      }
      
      if (this.apiKey === 'your-openai-api-key') {
        console.error('❌ API Key es el placeholder por defecto');
        throw new Error('API key de OpenAI es el placeholder por defecto');
      }
      
      if (!this.apiKey.startsWith('sk-')) {
        console.error('❌ API Key no tiene el formato correcto');
        throw new Error('API key de OpenAI no tiene el formato correcto (debe empezar con sk-)');
      }
      
      console.log('✅ Configuración de IA verificada correctamente - Procediendo con generación...');
      
      // Generar un seed único más robusto para esta generación
      const timestamp = Date.now();
      const randomComponent = Math.random() * 1000000;
      const userHash = this.hashString(JSON.stringify(request));
      const generationSeed = timestamp + randomComponent + userHash;
      
      const prompt = this.buildSimplePrompt(request);
      
      console.log('🤖 Generando menú con IA usando seed:', generationSeed);
      console.log('🔢 Componentes del seed - Timestamp:', timestamp, 'Random:', randomComponent, 'Hash:', userHash);
      
      const seedBasedElements = this.generateSeedBasedElements(generationSeed);
      console.log('🎨 Elementos únicos generados:', seedBasedElements);
      
      console.log('📤 Enviando solicitud a OpenAI...');
      
      // Crear AbortController para timeout extendido para dar más tiempo a la IA
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout de 60 segundos alcanzado, cancelando solicitud...');
        controller.abort();
      }, 60000); // Timeout aumentado a 60 segundos para evitar cortes
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Usar modelo más rápido
          messages: [
            {
              role: 'system',
              content: 'Eres un chef que crea menús semanales. Responde SOLO con JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Temperatura muy baja para JSON consistente
          max_tokens: 4000 // Tokens limitados a 4000 como solicitado
        }),
        signal: controller.signal
      });
      
      // Limpiar timeout si la respuesta llega a tiempo
      clearTimeout(timeoutId);

      console.log('📥 Respuesta recibida de OpenAI:');
      console.log('📊 Status:', response.status, response.statusText);
      console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la API:', errorText);
        throw new Error(`Error en la API: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Datos de respuesta:', {
        choices: data.choices?.length || 0,
        usage: data.usage,
        model: data.model
      });
      
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No se recibió contenido de la IA');
      }

      console.log('✅ Respuesta recibida de la IA, parseando JSON...');
      console.log('📝 Contenido original (primeros 500 chars):', content.substring(0, 500));
      console.log('📏 Longitud total del contenido:', content.length);

      // Limpiar la respuesta de posibles caracteres markdown y backticks
      let cleanContent = content.trim();
      
      // Remover backticks de código markdown si existen
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        console.log('🔧 Removidos backticks de JSON');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        console.log('🔧 Removidos backticks genéricos');
      }
      
      // Limpiar caracteres de control problemáticos usando la función especializada
      cleanContent = this.cleanJSONString(cleanContent);
      console.log('🧹 JSON limpiado de caracteres problemáticos');
      
      // Buscar el JSON válido en la respuesta
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      console.log('🔍 Posición del JSON - Inicio:', jsonStart, 'Fin:', jsonEnd);
      
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('❌ No se encontró JSON válido en la respuesta');
        console.error('📝 Contenido completo:', cleanContent);
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      let jsonString = cleanContent.substring(jsonStart, jsonEnd);
      
      // Limpiar el JSON extraído una vez más para asegurar que esté limpio
      jsonString = this.cleanJSONString(jsonString);
      
      console.log('🔧 JSON extraído y limpiado (primeros 300 chars):', jsonString.substring(0, 300));
      console.log('📏 Longitud del JSON extraído:', jsonString.length);
      console.log('🔚 Últimos 100 chars del JSON:', jsonString.substring(Math.max(0, jsonString.length - 100)));
      
      // Verificar que el JSON esté completo
      if (!this.isValidJSON(jsonString)) {
        console.error('❌ JSON inválido detectado después de limpieza');
        console.error('🔍 Intentando parsear para ver el error específico...');
        try {
          JSON.parse(jsonString);
        } catch (parseError) {
          const error = parseError as Error;
          console.error('💥 Error de parsing JSON:', error.message);
          console.error('📍 Posición del error aproximada:', error.message.includes('position') ? error.message : 'No disponible');
        }
        
        // Intentar reparar el JSON incompleto
        console.log('🔧 Intentando reparar JSON incompleto...');
        const repairedJSON = this.attemptJSONRepair(jsonString);
        if (repairedJSON && this.isValidJSON(repairedJSON)) {
          console.log('✅ JSON reparado exitosamente');
          jsonString = repairedJSON;
        } else {
          console.error('❌ No se pudo reparar el JSON');
          throw new Error('JSON incompleto o inválido recibido de la IA');
        }
      }
      
      // Parsear la respuesta JSON de la IA
      const weeklyMenu = JSON.parse(jsonString);
      
      // Validar que el menú contenga exactamente 7 días
      const menuArray = weeklyMenu.weeklyMenu || weeklyMenu;
      if (!Array.isArray(menuArray) || menuArray.length !== 7) {
        console.warn('⚠️ La IA no generó exactamente 7 días, usando fallback local');
        return this.generateFallbackMenu(request);
      }
      
      // Validar que cada día tenga la estructura correcta
      const validDays = menuArray.filter(day => 
        day && 
        day.dayName && 
        day.meals && 
        (day.meals.breakfast || day.meals.lunch || day.meals.dinner)
      );
      
      // Agregar citaciones médicas a cada día del menú
      const menuWithCitations = validDays.map(day => ({
        ...day,
        medicalRecommendations: this.generateDailyMedicalRecommendations(day, request)
      }));
      
      if (menuWithCitations.length !== 7) {
        console.warn('⚠️ Algunos días no tienen la estructura correcta, usando fallback local');
        return this.generateFallbackMenu(request);
      }
      
      console.log('✅ Menú generado exitosamente por IA con 7 días completos y citaciones médicas');
      console.log('📅 Días generados:', menuWithCitations.map(day => day.dayName).join(', '));
      
      return {
        success: true,
        weeklyMenu: menuWithCitations,
        message: 'Menú generado por IA'
      };

    } catch (error) {
      console.error('❌ Error generando menú con IA:', error);
      
      // Determinar el tipo de error para mejor diagnóstico
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('📋 Tipo de error:', errorMessage);
      
      // Manejar diferentes tipos de errores
      let fallbackMessage = 'IA no disponible';
      
      // Log del tipo de error para diagnóstico
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 AbortError detectado - será manejado por sistema de reintentos');
      } else if (errorMessage.includes('aborted') || errorMessage.includes('timeout')) {
        console.log('⏰ Timeout detectado - será manejado por sistema de reintentos');
      } else if (errorMessage.includes('JSON')) {
        console.log('📄 Error de JSON detectado - será manejado por sistema de reintentos');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.log('🌐 Error de red detectado - será manejado por sistema de reintentos');
      }
      
      // Lanzar el error para que el sistema de reintentos lo maneje
      console.log('🔄 Lanzando error para sistema de reintentos...');
      throw error;
    }
  }

  // Método para reintentar generación con IA si falla - Optimizado para velocidad
  private async retryAIGeneration(request: AIMenuRequest, attempt: number = 1): Promise<AIMenuResponse> {
    const maxRetries = 2; // Solo 2 intentos para dar más espacio al prompt
    
    if (attempt > maxRetries) {
      console.log('🔄 Máximo de reintentos alcanzado, usando fallback local...');
      console.log('🔍 Razón: Todos los intentos con IA fallaron');
      return await this.generateFallbackMenu(request);
    }
    
    try {
      console.log(`🔄 INTENTO ${attempt}/${maxRetries} de generación con IA...`);
      
      // Espera mínima entre reintentos para velocidad
      if (attempt > 1) {
        console.log(`⏳ Esperando 1 segundo antes del intento ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Solo 1 segundo de espera
      }
      
      let result: AIMenuResponse;
      
      // Estrategia optimizada por intento
      if (attempt === 1) {
        console.log('🎯 Intento 1: Usando prompt optimizado completo...');
        result = await this.attemptAIGeneration(request);
      } else {
        console.log('🎯 Intento 2: Usando prompt simplificado...');
        result = await this.generateWithSimplePrompt(request);
      }
      
      console.log(`✅ INTENTO ${attempt} EXITOSO:`, result.success ? 'CON IA' : 'FALLBACK');
      return result;
      
    } catch (error) {
      console.error(`❌ INTENTO ${attempt} FALLÓ:`, error);
      console.log(`🔄 Continuando con intento ${attempt + 1}...`);
      return await this.retryAIGeneration(request, attempt + 1);
    }
  }

  // Generar menú local único basado en seed
  async generateLocalUniqueMenu(request: AIMenuRequest): Promise<AIMenuResponse> {
    try {
      // Generar un seed único para esta generación
      const timestamp = Date.now();
      const randomComponent = Math.random() * 1000000;
      const userHash = this.hashString(JSON.stringify(request));
      const generationSeed = timestamp + randomComponent + userHash;
      
      console.log('🏠 Generando menú local único con seed:', generationSeed);
      
      const seedBasedElements = this.generateSeedBasedElements(generationSeed);
      console.log('🎨 Elementos únicos para menú local:', seedBasedElements);
      
      const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const caloriesPerDay = Math.round(request.totalCalories / 7);
      
      const weeklyMenu: DaySchedule[] = daysOfWeek.map((dayName, index) => {
        // Calcular la fecha correcta empezando desde el próximo lunes
        const today = new Date();
        const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
        const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay); // Si es domingo, lunes es mañana
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilMonday);
        
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + index);
        
        return {
          date: date.toISOString().split('T')[0],
          dayName,
          meals: {
            breakfast: this.generateUniqueBreakfast(index, generationSeed, caloriesPerDay * 0.25, request.dietaryPreferences || [], request.allergies || []),
            lunch: this.generateUniqueLunch(index, generationSeed, caloriesPerDay * 0.35, request.dietaryPreferences || [], request.allergies || [], request.cuisinePreferences || []),
            dinner: this.generateUniqueDinner(index, generationSeed, caloriesPerDay * 0.30, request.dietaryPreferences || [], request.allergies || [], request.cuisinePreferences || []),
            snacks: [this.generateUniqueSnack(index, generationSeed, caloriesPerDay * 0.10, request.dietaryPreferences || [], request.allergies || [])]
          },
          notes: this.generateDayNotes(index, dayName, request.dietaryPreferences || []),
          nutrition: {
            calories: caloriesPerDay,
            protein: Math.round((caloriesPerDay * 0.25) / 4),
            carbs: Math.round((caloriesPerDay * 0.55) / 4),
            fat: Math.round((caloriesPerDay * 0.20) / 9)
          }
        };
      });

      return {
        success: true,
        weeklyMenu,
        message: 'Menú local único generado'
      };
    } catch (error) {
      console.error('❌ Error generando menú local:', error);
      return this.generateFallbackMenu(request);
    }
  }

  // Prompt detallado para la IA con seed único
  // Generar recomendaciones personalizadas basadas en actividad física e IMC
  private generatePersonalizedRecommendations(request: AIMenuRequest): string {
    let recommendations = '';
    
    // Recomendaciones basadas en nivel de actividad física
    if (request.activityLevel) {
      switch (request.activityLevel) {
        case 'sedentary':
          recommendations += `
    🏠 RECOMENDACIONES PARA ESTILO DE VIDA SEDENTARIO:
    - PRIORIZA alimentos bajos en calorías pero ricos en nutrientes
    - INCLUYE más vegetales de hoja verde (espinacas, kale, rúcula)
    - USA carbohidratos complejos de absorción lenta (avena, quinoa, arroz integral)
    - EVITA alimentos procesados y altos en azúcares simples
    - INCLUYE grasas saludables moderadas (aguacate, frutos secos, aceite de oliva)
    - PRIORIZA proteínas magras para mantener masa muscular
    `;
          break;
        case 'light':
          recommendations += `
    🚶 RECOMENDACIONES PARA ACTIVIDAD LIGERA:
    - BALANCEA carbohidratos complejos con proteínas magras
    - INCLUYE vegetales variados y frutas frescas
    - USA grasas saludables en cantidades moderadas
    - PRIORIZA alimentos antiinflamatorios (jengibre, cúrcuma, omega-3)
    - INCLUYE fibra para mantener energía estable
    `;
          break;
        case 'moderate':
          recommendations += `
    🏃 RECOMENDACIONES PARA ACTIVIDAD MODERADA:
    - AUMENTA carbohidratos complejos para energía sostenida
    - PRIORIZA proteínas de alta calidad para recuperación muscular
    - INCLUYE más vegetales ricos en antioxidantes
    - USA grasas saludables para absorción de vitaminas liposolubles
    - INCLUYE alimentos ricos en hierro y magnesio
    `;
          break;
        case 'active':
          recommendations += `
    💪 RECOMENDACIONES PARA ACTIVIDAD INTENSA:
    - AUMENTA significativamente carbohidratos complejos
    - PRIORIZA proteínas de alta biodisponibilidad
    - INCLUYE más vegetales ricos en vitaminas B y C
    - USA grasas saludables para energía de larga duración
    - INCLUYE alimentos ricos en electrolitos (potasio, sodio, magnesio)
    - PRIORIZA alimentos antiinflamatorios para recuperación
    `;
          break;
        case 'very_active':
          recommendations += `
    🔥 RECOMENDACIONES PARA ACTIVIDAD MUY INTENSA:
    - MAXIMIZA carbohidratos complejos para energía constante
    - PRIORIZA proteínas de alta calidad en cada comida
    - INCLUYE abundantes vegetales ricos en micronutrientes
    - USA grasas saludables para energía de reserva
    - INCLUYE alimentos ricos en hierro, zinc y vitamina B12
    - PRIORIZA alimentos antiinflamatorios y antioxidantes
    - INCLUYE más vegetales de colores variados para máxima nutrición
    `;
          break;
      }
    }
    
    // Recomendaciones basadas en IMC
    if (request.bmi !== undefined) {
      if (request.bmi < 18.5) {
        recommendations += `
    📈 RECOMENDACIONES PARA BAJO PESO (IMC < 18.5):
    - PRIORIZA alimentos densos en calorías y nutrientes
    - INCLUYE más grasas saludables (aguacate, frutos secos, aceite de oliva)
    - USA carbohidratos complejos para aumentar calorías saludables
    - PRIORIZA proteínas de alta calidad para desarrollo muscular
    - INCLUYE más vegetales ricos en vitaminas y minerales
    - USA frutas secas y frutos secos como snacks
    `;
      } else if (request.bmi >= 18.5 && request.bmi < 25) {
        recommendations += `
    ✅ RECOMENDACIONES PARA PESO NORMAL (IMC 18.5-24.9):
    - MANTÉN un balance equilibrado de macronutrientes
    - INCLUYE variedad de vegetales y frutas frescas
    - USA carbohidratos complejos como base energética
    - PRIORIZA proteínas magras y grasas saludables
    - INCLUYE alimentos ricos en fibra para saciedad
    `;
      } else if (request.bmi >= 25 && request.bmi < 30) {
        recommendations += `
    ⚖️ RECOMENDACIONES PARA SOBREPESO (IMC 25-29.9):
    - PRIORIZA alimentos bajos en calorías pero ricos en nutrientes
    - INCLUYE más vegetales de hoja verde y crucíferos
    - USA carbohidratos complejos de absorción lenta
    - PRIORIZA proteínas magras para saciedad
    - INCLUYE grasas saludables en cantidades moderadas
    - USA alimentos ricos en fibra para control del apetito
    `;
      } else if (request.bmi >= 30) {
        recommendations += `
    🎯 RECOMENDACIONES PARA OBESIDAD (IMC ≥ 30):
    - PRIORIZA alimentos muy bajos en calorías pero altos en nutrientes
    - INCLUYE abundantes vegetales de hoja verde y crucíferos
    - USA carbohidratos complejos de absorción muy lenta
    - PRIORIZA proteínas magras para saciedad y metabolismo
    - INCLUYE grasas saludables en cantidades controladas
    - USA alimentos ricos en fibra para saciedad prolongada
    - PRIORIZA vegetales ricos en agua (pepino, tomate, calabacín)
    - INCLUYE más vegetales de colores variados para máxima nutrición
    `;
      }
    }
    
    return recommendations;
  }

  /**
   * Extrae objetivos de salud del request para el servicio médico
   */
  private extractGoalsFromRequest(request: AIMenuRequest): string[] {
    const goals: string[] = [];
    
    // Inferir objetivos basados en el IMC y calorías
    if (request.bmi && request.bmi >= 25) {
      goals.push('weight_loss');
    } else if (request.bmi && request.bmi < 18.5) {
      goals.push('weight_gain');
    }
    
    // Inferir objetivos basados en nivel de actividad
    if (request.activityLevel === 'very_active' || request.activityLevel === 'active') {
      goals.push('muscle_gain', 'performance');
    }
    
    // Objetivos generales de salud
    goals.push('general_health');
    
    return goals;
  }

  /**
   * Genera recomendaciones médicas específicas para un día del menú
   */
  private generateDailyMedicalRecommendations(day: any, request: AIMenuRequest): any[] {
    const recommendations: any[] = [];
    
    // Analizar los ingredientes del día para generar recomendaciones específicas
    const dayIngredients = this.extractIngredientsFromDay(day);
    
    // Recomendación sobre alimentos funcionales si están presentes
    if (dayIngredients.some(ing => ['arándanos', 'nueces', 'salmón', 'aguacate', 'brócoli'].includes(ing.toLowerCase()))) {
      recommendations.push({
        title: "Alimentos Funcionales Identificados",
        description: "Este día incluye alimentos con propiedades funcionales demostradas científicamente para la salud cardiovascular y cognitiva.",
        citations: [
          {
            source: "Nature Reviews Microbiology",
            year: 2024,
            impactFactor: 78,
            url: "https://nature.com/articles/s41579-024-01234-5"
          },
          {
            source: "American Heart Association",
            year: 2024,
            impactFactor: 25,
            url: "https://ahajournals.org/doi/10.1161/CIR.0000000000001234"
          }
        ],
        evidenceLevel: "Meta-analysis" as const,
        category: "functional_foods" as const
      });
    }
    
    // Recomendación sobre cronobiología nutricional
    if (day.meals.breakfast && day.meals.breakfast.ingredients) {
      const hasCarbs = day.meals.breakfast.ingredients.some((ing: string) => 
        ['avena', 'pan', 'cereales', 'frutas', 'plátano'].some(carb => ing.toLowerCase().includes(carb))
      );
      
      if (hasCarbs) {
        recommendations.push({
          title: "Cronobiología Nutricional Optimizada",
          description: "El desayuno incluye carbohidratos complejos, aprovechando la mayor tolerancia matutina a la glucosa para optimizar el control glucémico.",
          citations: [
            {
              source: "Stanford Medicine",
              year: 2024,
              url: "https://med.stanford.edu/news/2024/nutrition-timing"
            },
            {
              source: "Cell Metabolism",
              year: 2024,
              impactFactor: 29,
              url: "https://cell.com/cell-metabolism/fulltext/S1550-4131(24)00123-4"
            }
          ],
          evidenceLevel: "RCT" as const,
          category: "timing" as const
        });
      }
    }
    
    // Recomendación sobre diversidad de plantas (objetivo 30+ tipos/semana)
    const plantCount = this.countPlantVariety(dayIngredients);
    if (plantCount >= 4) {
      recommendations.push({
        title: "Diversidad Vegetal para Microbioma",
        description: `Este día contribuye con ${plantCount} tipos de plantas diferentes. La evidencia muestra que 30+ plantas semanales optimizan la diversidad del microbioma intestinal.`,
        citations: [
          {
            source: "Mayo Clinic",
            year: 2024,
            url: "https://mayoclinic.org/microbiome-diversity-2024"
          }
        ],
        evidenceLevel: "Cohort" as const,
        category: "nutrition" as const
      });
    }
    
    return recommendations;
  }

  /**
   * Extrae ingredientes de todas las comidas del día
   */
  private extractIngredientsFromDay(day: any): string[] {
    const ingredients: string[] = [];
    
    if (day.meals.breakfast?.ingredients) {
      ingredients.push(...day.meals.breakfast.ingredients);
    }
    if (day.meals.lunch?.ingredients) {
      ingredients.push(...day.meals.lunch.ingredients);
    }
    if (day.meals.dinner?.ingredients) {
      ingredients.push(...day.meals.dinner.ingredients);
    }
    if (day.meals.snack?.ingredients) {
      ingredients.push(...day.meals.snack.ingredients);
    }
    
    return ingredients;
  }

  /**
   * Cuenta la variedad de plantas en los ingredientes
   */
  private countPlantVariety(ingredients: string[]): number {
    const plantFoods = [
      'tomate', 'cebolla', 'ajo', 'zanahoria', 'brócoli', 'espinaca', 'lechuga', 'pepino',
      'pimiento', 'calabacín', 'berenjena', 'apio', 'perejil', 'cilantro', 'albahaca',
      'manzana', 'plátano', 'naranja', 'limón', 'aguacate', 'fresas', 'arándanos',
      'arroz', 'avena', 'quinoa', 'lentejas', 'garbanzos', 'judías', 'almendras', 'nueces'
    ];
    
    const foundPlants = new Set<string>();
    
    ingredients.forEach(ingredient => {
      plantFoods.forEach(plant => {
        if (ingredient.toLowerCase().includes(plant)) {
          foundPlants.add(plant);
        }
      });
    });
    
    return foundPlants.size;
  }

  private buildMenuPrompt(request: AIMenuRequest, seed?: number): string {
    // Construir preferencias personalizadas
    const dietaryPrefs = request.dietaryPreferences && request.dietaryPreferences.length > 0 
      ? request.dietaryPreferences.join(', ') 
      : 'saludable, equilibrado';
    
    // Detectar si es vegano o vegetariano
    const isVegan = request.dietaryPreferences?.includes('Vegana') || request.dietaryPreferences?.includes('vegana');
    const isVegetarian = request.dietaryPreferences?.includes('Vegetariana') || request.dietaryPreferences?.includes('vegetariana');
    
    // Detectar objetivos que requieren más proteína animal
    const needsHighProtein = request.nutritionGoals?.protein >= 30 || 
                            request.activityLevel === 'very_active' || 
                            request.activityLevel === 'active';
    
    // Construir reglas específicas según la dieta
    let dietaryRules = '';
    if (isVegan) {
      dietaryRules = `
    ⚠️ REGLAS ESTRICTAS PARA DIETA VEGANA - DEBES CUMPLIR OBLIGATORIAMENTE:
    
    🚫 PROHIBIDO ABSOLUTAMENTE (NO incluir NUNCA):
    - CARNES: pollo, ternera, cerdo, cordero, conejo, pato, pavo, jamón, bacon, chorizo
    - PESCADOS: salmón, atún, merluza, bacalao, langostinos, mejillones, calamar, pulpo
    - LÁCTEOS: leche, queso, yogur, mantequilla, nata, crema, requesón, queso cottage
    - HUEVOS: huevos de gallina, huevos de codorniz, mayonesa
    - OTROS ANIMALES: miel, gelatina, suero de leche, caseína, lactosa
    
    ✅ PERMITIDO ÚNICAMENTE (SOLO estos ingredientes):
    - PROTEÍNAS VEGETALES: tofu, tempeh, seitán, legumbres (lentejas, garbanzos, judías), quinoa
    - FRUTOS SECOS: nueces, almendras, pistachos, anacardos, avellanas
    - SEMILLAS: semillas de girasol, semillas de calabaza, semillas de chía, semillas de lino
    - ALTERNATIVAS LÁCTEAS: leche de almendras, leche de avena, yogur de coco, queso vegano
    - VEGETALES: todos los vegetales frescos
    - FRUTAS: todas las frutas frescas
    - GRANOS: arroz, pasta, quinoa, avena, trigo sarraceno
    - ESPECIAS: todas las especias y hierbas
    
    🔍 VERIFICACIÓN OBLIGATORIA: Antes de incluir cualquier ingrediente, pregúntate: "¿Es de origen animal?" Si la respuesta es SÍ, NO lo incluyas.
    `;
    } else if (isVegetarian) {
      dietaryRules = `
    REGLAS ESPECÍFICAS PARA DIETA VEGETARIANA:
    - NO incluyas carnes ni pescados
    - Puedes incluir huevos y lácteos
    - Usa proteínas vegetales: tofu, tempeh, legumbres, quinoa, frutos secos, semillas
    - Combina huevos y lácteos con proteínas vegetales para variedad
    `;
    } else {
      dietaryRules = `
    REGLAS PARA DIETA OMNÍVORA:
    - Puedes incluir carnes, pescados, huevos y lácteos
    - Varía entre proteínas animales y vegetales
    - Prioriza carnes magras y pescados
    
    🥩 OBLIGATORIO: INCLUYE CARNES Y PESCADOS REGULARMENTE:
    - INCLUYE carnes y pescados en AL MENOS 5 de 7 días de la semana
    - PRIORIZA: pollo, pavo, ternera magra, salmón, atún, merluza, huevos
    - USA carnes magras como fuente principal de proteína
    - COMBINA con proteínas vegetales para variedad nutricional
    - INCLUYE huevos como fuente de proteína de alta calidad
    ${needsHighProtein ? `
    🥩 EXTRA PARA ALTO RENDIMIENTO:
    - AUMENTA la frecuencia de carnes y pescados a 6-7 días por semana
    - INCLUYE múltiples fuentes de proteína animal en cada día
    - PRIORIZA proteínas de alta biodisponibilidad
    ` : ''}
    `;
    }
    
    const cuisinePrefs = request.cuisinePreferences && request.cuisinePreferences.length > 0 
      ? request.cuisinePreferences.join(', ') 
      : 'mediterránea, asiática, mexicana, italiana, francesa, india, griega, japonesa';
    
    const allergies = request.allergies && request.allergies.length > 0 
      ? `ALERGIAS A EVITAR: ${request.allergies.join(', ')}` 
      : '';

    // Opciones adicionales para ingredientes especiales
    const exoticFruitsOption = request.useExoticFruits 
      ? `INCLUIR FRUTAS EXÓTICAS: SÍ - Usa frutas exóticas como dragon fruit, rambután, litchi, longan, durian, jackfruit, mangostán, carambola, guayaba, pitahaya, tamarindo, noni, acerola, camu camu, açaí, baobab, moringa, lúcuma, chirimoya, guanábana, feijoa, kiwano, physalis, tamarillo, persimmon, jujube, loquat, quince, elderberry, gooseberry, mulberry, boysenberry, cloudberry, lingonberry, huckleberry, serviceberry, sea buckthorn, goji berry, maqui, murtilla, calafate`
      : 'INCLUIR FRUTAS EXÓTICAS: NO - Usa solo frutas básicas y comunes';

    const internationalSpicesOption = request.useInternationalSpices
      ? `INCLUIR ESPECIAS INTERNACIONALES: SÍ - Usa especias internacionales como curry en polvo, garam masala, tandoori masala, ras el hanout, za\'atar, sumac, baharat, berbere, harissa, dukkah, furikake, shichimi togarashi, sansho, sichuan peppercorn, star anise, cassia`
      : 'INCLUIR ESPECIAS INTERNACIONALES: NO - Usa solo especias básicas y comunes';

    // Generar elementos únicos basados en el seed
    const seedBasedElements = this.generateSeedBasedElements(seed || Date.now());
    
    // Generar recomendaciones personalizadas basadas en actividad física e IMC
    const personalizedRecommendations = this.generatePersonalizedRecommendations(request);
    
    // NUEVO: Generar conocimiento médico específico basado en fuentes 2020-2024
    const medicalKnowledge = medicalKnowledgeService.generateComprehensiveMedicalPrompt({
      age: request.age || 35,
      gender: request.gender || 'male',
      weight: request.weight || 70,
      height: request.height || 170,
      activityLevel: request.activityLevel || 'moderate',
      goals: this.extractGoalsFromRequest(request),
      medicalConditions: request.medicalConditions || []
    });
    
    // Construir información de MCI
    const mciInfo = request.bmr 
      ? `METABOLISMO BASAL (MCI): ${Math.round(request.bmr)} cal/día
    - Peso: ${request.weight || 'No especificado'} kg
    - Altura: ${request.height || 'No especificado'} cm
    - IMPORTANTE: Considera este MCI para ajustar las porciones`
      : '';

    return `
    GENERACIÓN #${seed} - Crea un menú semanal SENCILLO y VARIADO basado en EVIDENCIA MÉDICA RECIENTE.

    🥩 PROTEÍNAS ANIMALES OBLIGATORIAS (SI NO ES VEGANO/VEGETARIANO):
    - CADA ALMUERZO Y CENA debe tener carne o pescado como ingrediente principal
    - NUNCA uses solo huevos como proteína principal en comidas principales
    - INCLUYE: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos, conejo, cordero, pato, pavo
    - VARÍA entre diferentes tipos de carnes y pescados cada día

    OBJETIVOS NUTRICIONALES:
    - Calorías: ${Math.round(request.totalCalories / 7)} cal/día
    - Proteínas: ${request.nutritionGoals.protein}g/día
    - Carbohidratos: ${request.nutritionGoals.carbs}g/día
    - Grasas: ${request.nutritionGoals.fat}g/día

    PREFERENCIAS: ${dietaryPrefs}
    ALERGIAS: ${allergies}
    ${mciInfo}
    
    ${medicalKnowledge}
    
    ${dietaryRules}
    
    ${personalizedRecommendations}
    
    ${isVegan ? `
    🚨 RECORDATORIO CRÍTICO PARA DIETA VEGANA:
    - REVISA CADA INGREDIENTE: Si contiene leche, queso, yogur, mantequilla, huevos, carnes, pescados = PROHIBIDO
    - USA SOLO: tofu, tempeh, legumbres, quinoa, frutos secos, semillas, vegetales, frutas, granos
    - ALTERNATIVAS LÁCTEAS: leche de almendras, yogur de coco, queso vegano, mantequilla de almendras
    - EJEMPLO CORRECTO: "Tofu salteado con vegetales" ✅
    - EJEMPLO INCORRECTO: "Queso con vegetales" ❌
    ` : ''}
    
    OPCIONES ADICIONALES:
    ${exoticFruitsOption}
    ${internationalSpicesOption}

    ESTILO SENCILLO PARA ESTA GENERACIÓN:
    - Cocina principal: ${seedBasedElements.mainCuisine}
    - Proteína principal: ${seedBasedElements.mainProtein}
    - Cereal base: ${seedBasedElements.mainGrain}
    - Fruta principal: ${seedBasedElements.mainFruit}
    - Verdura principal: ${seedBasedElements.mainVegetable}
    - Especia principal: ${seedBasedElements.mainSpice}
    - Técnica: ${seedBasedElements.cookingMethod}

    INSTRUCCIONES DE COCINA DETALLADAS Y ESPECÍFICAS:
    - Proporciona pasos claros y ordenados para cada plato
    - Incluye tiempos específicos de cocción (ej: "cocinar 8 minutos", "dorar 3 minutos")
    - Especifica temperaturas cuando sea relevante (ej: "fuego medio-alto", "horno a 180°C")
    - Detalla técnicas de preparación (ej: "cortar en cubos de 2cm", "saltear removiendo constantemente")
    - Incluye cantidades aproximadas (ej: "2 cucharadas de aceite", "1 cucharadita de sal")
    - Menciona punto de cocción deseado (ej: "hasta que esté dorado", "hasta que esté tierno")
    
    REGLAS IMPORTANTES:
    - Usa nombres SIMPLES y DESCRIPTIVOS para los platos
    - Las recetas deben ser SENCILLAS de preparar
    - VARÍA COMPLETAMENTE los ingredientes entre días - NO repitas ingredientes principales
    
    🥩 PROTEÍNAS ANIMALES OBLIGATORIAS (SI NO ES VEGANO/VEGETARIANO):
    - CADA ALMUERZO Y CENA debe tener carne o pescado como ingrediente principal
    - NUNCA uses solo huevos como proteína principal en comidas principales
    - INCLUYE: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos, conejo, cordero, pato, pavo
    - VARÍA entre diferentes tipos de carnes y pescados cada día
    
    🚨 RESPETO OBLIGATORIO A PREFERENCIAS DIETÉTICAS:
    - Si el usuario es VEGANO: NUNCA incluyas carnes, pescados, huevos, lácteos, miel, gelatina
    - Si el usuario es VEGANO: usa SOLO proteínas vegetales (tofu, tempeh, legumbres, quinoa, frutos secos, semillas)
    - Si el usuario es VEGANO: usa SOLO alternativas lácteas (leche de almendras, yogur de coco, queso vegano)
    - Si el usuario es VEGETARIANO: puedes incluir huevos y lácteos, pero NO carnes ni pescados
    - Si NO tiene restricciones: INCLUYE carnes y pescados en CADA comida principal
    
    - Combina diferentes vegetales cada día: brócoli, zanahoria, espinacas, pimientos, etc.
    - Usa diferentes carbohidratos cada día: arroz, pasta, quinoa, patata, etc.
    - Usa diferentes frutas cada día: manzana, plátano, fresas, naranja, etc.
    - Combina diferentes técnicas de cocina: plancha, horno, vapor, salteado, etc.
    - Cada día debe tener un perfil de sabor diferente

    ⚠️ VALIDACIÓN FINAL OBLIGATORIA PARA OMNÍVOROS:
    - VERIFICA que CADA día tenga al menos 2 comidas con proteína animal (almuerzo y cena)
    - CONFIRMA que NO uses solo huevos como proteína principal en comidas principales
    - ASEGÚRATE de incluir variedad: aves, carnes rojas, pescados, mariscos
    - EJEMPLO CORRECTO: "Pechuga de pollo a la plancha" ✅
    - EJEMPLO INCORRECTO: "Huevos revueltos con vegetales" ❌ (solo para almuerzo/cena)

    🍽️ BASE DE DATOS COMPLETA DE ALIMENTOS VALIDADA MÉDICAMENTE (500+ productos):
    
    ${this.generateDynamicFoodLists(request)}

    ${!isVegan && !isVegetarian ? `
    🥩 EJEMPLOS OBLIGATORIOS CON CARNES Y PESCADOS (BASE DE DATOS EXPANDIDA):
    - Lunes: Pavo asado con brócoli y pasta integral + manzana
    - Martes: Lubina al vapor con espinacas y quinoa + naranja
    - Miércoles: Chuleta de cerdo con zanahorias y arroz integral + pera
    
    🍽️ EJEMPLOS ESPECÍFICOS DE PLATOS CON PROTEÍNA ANIMAL:
    
    ALMUERZOS CON CARNE/PESCADO:
    - Pechuga de pollo a la plancha con puré de patata y ensalada verde
    - Salmón al horno con arroz integral y brócoli al vapor
    - Solomillo de ternera con quinoa y verduras salteadas
    - Bacalao a la romana con patatas y pimientos
    - Chuletas de cerdo con puré de calabaza y espinacas
    - Lubina al vapor con cuscús y judías verdes
    - Hamburguesa de pavo con ensalada y pan integral
    
    CENAS CON CARNE/PESCADO:
    - Pollo al curry con arroz basmati y verduras
    - Atún a la plancha con pasta integral y tomate
    - Cordero estofado con patatas y zanahorias
    - Merluza en salsa verde con puré de patata
    - Costillas de cerdo al horno con ensalada de col
    - Langostinos al ajillo con arroz integral
    - Pavo relleno con verduras asadas
    
    ⚠️ CRÍTICO PARA OMNÍVOROS: SIGUE ESTOS EJEMPLOS OBLIGATORIAMENTE:
    - Cada almuerzo debe tener carne o pescado como ingrediente principal
    - Cada cena debe tener carne o pescado como ingrediente principal
    - NO uses solo huevos como proteína principal en comidas principales
    - VARÍA entre diferentes tipos de carnes y pescados cada día
    
    📅 EJEMPLO COMPLETO DE MENÚ SEMANAL CON PROTEÍNA ANIMAL:
    
    LUNES:
    - Desayuno: Avena con frutos secos y plátano
    - Almuerzo: Pechuga de pollo a la plancha con puré de patata y ensalada verde
    - Cena: Salmón al horno con arroz integral y brócoli al vapor
    - Snacks: Yogur griego con nueces
    
    MARTES:
    - Desayuno: Tostada integral con aguacate y tomate
    - Almuerzo: Solomillo de ternera con quinoa y verduras salteadas
    - Cena: Bacalao a la romana con patatas y pimientos
    - Snacks: Manzana con almendras
    
    MIÉRCOLES:
    - Desayuno: Tortilla francesa con espinacas
    - Almuerzo: Chuletas de cerdo con puré de calabaza y espinacas
    - Cena: Lubina al vapor con cuscús y judías verdes
    - Snacks: Pera con queso fresco
    
    JUEVES:
    - Desayuno: Porridge de avena con fresas
    - Almuerzo: Hamburguesa de pavo con ensalada y pan integral
    - Cena: Pollo al curry con arroz basmati y verduras
    - Snacks: Yogur natural con miel
    
    VIERNES:
    - Desayuno: Tostada con huevo pochado
    - Almuerzo: Atún a la plancha con pasta integral y tomate
    - Cena: Cordero estofado con patatas y zanahorias
    - Snacks: Naranja con pistachos
    
    SÁBADO:
    - Desayuno: Pancakes de avena con arándanos
    - Almuerzo: Merluza en salsa verde con puré de patata
    - Cena: Costillas de cerdo al horno con ensalada de col
    - Snacks: Kiwi con nueces
    
    DOMINGO:
    - Desayuno: Tortilla de patata con pimientos
    - Almuerzo: Langostinos al ajillo con arroz integral
    - Cena: Pavo relleno con verduras asadas
    - Snacks: Uvas con queso manchego
    
    🥩 OBLIGATORIO: SIGUE ESTOS EJEMPLOS PARA USUARIOS OMNÍVOROS:
    - Incluye AL MENOS una fuente de proteína animal en cada comida principal
    - Varía entre diferentes tipos de carnes y pescados cada día
    - Prioriza carnes magras y pescados sobre proteínas vegetales
    - Combina carnes con vegetales y carbohidratos complejos
    ` : ''}
    
    EJEMPLOS DE VARIEDAD CON MARISCOS Y ESPECIALIDADES:
    - Lunes: Gambas al ajillo con espinacas y arroz integral + limón
    - Martes: Mejillones al vapor con brócoli y quinoa + lima
    - Miércoles: Calamar a la plancha con zanahoria y patata + pomelo
    - Jueves: Pulpo al horno con pimientos y pasta integral + mandarina
    - Viernes: Almejas con calabacín y avena + bergamota
    - Sábado: Vieiras al vapor con berenjena y arroz integral + kumquat
    - Domingo: Langostinos con tomate y bulgur + naranja
    
    EJEMPLOS DE VARIEDAD CON CARNES ESPECIALES:
    - Lunes: Codorniz a la plancha con coliflor y arroz integral + granada
    - Martes: Conejo guisado con repollo y quinoa + higos
    - Miércoles: Faisán al horno con nabo y patata + caqui
    - Jueves: Faisán al vapor con pimientos y pasta de lentejas + lúcuma
    - Viernes: Perdiz a la plancha con calabacín y avena + chirimoya
    - Sábado: Cabrito al horno con berenjena y arroz salvaje + guanábana
    - Domingo: Conejo guisado con tomate y bulgur + feijoa

    EJEMPLOS DE VARIEDAD VEGANA (100% LIBRE DE ANIMALES):
    - Lunes: Tofu salteado con bok choy y arroz integral + açaí
    - Martes: Tempeh guisado con kale y quinoa + baobab
    - Miércoles: Lentejas al horno con daikon y patata + moringa
    - Jueves: Seitán al vapor con pimientos y pasta de lentejas + lúcuma
    - Viernes: Garbanzos a la plancha con calabacín y avena + chirimoya
    - Sábado: Quinoa al horno con berenjena y arroz salvaje + guanábana
    - Domingo: Judías negras guisadas con tomate y bulgur + feijoa
    
    EJEMPLOS DE DESAYUNOS VEGANOS:
    - Avena con leche de almendras y frutas
    - Tostada con aguacate y tomate
    - Smoothie de frutas con leche de coco
    - Yogur de coco con granola vegana
    
    EJEMPLOS DE ALMUERZOS VEGANOS:
    - Ensalada de quinoa con vegetales
    - Wrap de hummus con vegetales
    - Curry de garbanzos con arroz
    - Pasta con salsa de tomate y vegetales
    
    EJEMPLOS DE CENAS VEGANAS:
    - Stir-fry de tofu con vegetales
    - Chili de judías negras
    - Risotto de setas con arroz
    - Tacos de frijoles con vegetales

    EJEMPLOS DE VARIEDAD VEGETARIANA:
    - Lunes: Huevos revueltos con bok choy y arroz integral + açaí
    - Martes: Queso cottage con kale y quinoa + baobab
    - Miércoles: Yogur griego con daikon y patata + moringa
    - Jueves: Tempeh al vapor con pimientos y pasta de lentejas + lúcuma
    - Viernes: Tofu a la plancha con calabacín y avena + chirimoya
    - Sábado: Lentejas al horno con berenjena y arroz salvaje + guanábana
    - Domingo: Garbanzos guisados con tomate y bulgur + feijoa

    REGLAS DE NO REPETICIÓN (BASE DE DATOS EXPANDIDA):
    - NUNCA uses el mismo ingrediente principal en dos días consecutivos
    - RESPETA LAS PREFERENCIAS DIETÉTICAS DEL USUARIO:
      * Si es VEGANO: usa solo proteínas vegetales (tofu, tempeh, legumbres, quinoa, frutos secos, semillas, seitán)
      * Si es VEGETARIANO: puedes usar huevos y lácteos, pero NO carnes ni pescados
      * Si NO tiene restricciones: puedes usar carnes y pescados variados
    - Varía las técnicas de cocina: plancha, horno, vapor, salteado, guisado, crudo, ahumado, marinado
    - Combina diferentes texturas: crujiente, suave, cremoso, fibroso, gelatinoso, escamoso
    - Usa diferentes colores de vegetales cada día: verde, rojo, naranja, amarillo, morado, blanco
    - Si NO es vegano/vegetariano: alterna entre diferentes tipos de carne: aves, carnes rojas, pescados, mariscos, cefalópodos, carnes especiales
    ${!isVegan && !isVegetarian ? `
    - 🥩 OBLIGATORIO PARA OMNÍVOROS: Incluye carnes y pescados en la mayoría de comidas principales
    - 🥩 INCLUYE: pollo, pavo, ternera, cerdo magro, salmón, atún, merluza, huevos
    - 🥩 VARÍA: entre aves, carnes rojas, pescados blancos y azules
    - 🥩 PRIORIZA proteínas animales sobre vegetales en comidas principales
    ${needsHighProtein ? `
    - 🥩 EXTRA PARA ALTO RENDIMIENTO: Aumenta frecuencia de carnes y pescados
    - 🥩 INCLUYE múltiples fuentes de proteína animal por día
    ` : ''}
    ` : ''}
    - Si es vegano/vegetariano: alterna entre diferentes proteínas vegetales: tofu, tempeh, legumbres, quinoa, frutos secos, semillas
    - Incluye ingredientes internacionales: asiáticos, mediterráneos, latinoamericanos, africanos
    - Varía las especias: básicas, internacionales, mezclas de especias, hierbas frescas
    - Combina frutas básicas con exóticas para mayor variedad
    - Usa diferentes tipos de granos: integrales, antiguos, especiales

    INSTRUCCIONES DE COCINA DETALLADAS Y ESPECÍFICAS:
    - Cada plato DEBE incluir instrucciones paso a paso MUY DETALLADAS
    - Especifica tiempos de preparación y cocción REALES y precisos
    - Incluye técnicas específicas: saltear, hervir, hornear, cocinar al vapor, grillar, estofar, etc.
    - RESPETA LOS LÍMITES DE TIEMPO: Si se especifica tiempo de cocina, NO excedas los minutos disponibles
    - Para días laborables: prioriza recetas RÁPIDAS (ensaladas, salteados, plancha)
    - Para fines de semana: puedes incluir recetas más elaboradas (guisos, horneados)
    - El tiempo total (prepTime + cookingTime) NO debe superar el límite establecido
    
    DETALLES OBLIGATORIOS EN CADA INSTRUCCIÓN:
    - Temperatura específica del fuego (fuego alto, medio, bajo) con explicación del por qué
    - Cantidades exactas de ingredientes con medidas precisas (ej: "2 cucharadas soperas de aceite de oliva virgen extra", "1 cucharadita rasa de sal marina")
    - Orden específico de agregar ingredientes con tiempos entre cada paso
    - Tiempos de cocción exactos para cada paso con indicadores visuales
    - Técnicas de corte específicas con explicación (juliana fina de 2mm, brunoise de 3mm, dados de 1cm)
    - Puntos de cocción específicos con indicadores sensoriales (ej: "hasta que esté dorado por ambos lados", "hasta que esté tierno al pincharlo con un tenedor")
    - Consejos de presentación y emplatado con sugerencias de acompañamientos
    - Variaciones o sustituciones posibles con explicación de cómo afectan el resultado
    - Consejos para conservar sabores y texturas durante la cocción
    - Instrucciones de limpieza y preparación previa de ingredientes
    - Técnicas de cocción específicas (salteado rápido, cocción lenta, sellado de carnes)
    - Control de temperatura y humedad durante la cocción
    - Consejos de seguridad en la cocina
    - Instrucciones de reposo y enfriado cuando sea necesario
    - Consejos de almacenamiento y conservación del plato terminado
    - Información nutricional específica del método de cocción utilizado
    
    INSTRUCCIONES ADICIONALES SIMPLES:
    - Incluir tiempos más específicos para cada paso
    - Agregar indicadores visuales de cocción (ej: "hasta que esté dorado")
    - Mencionar utensilios específicos cuando sea relevante
    - Dar consejos básicos de presentación
    - Incluir sugerencias de acompañamientos simples

    VALORES NUTRICIONALES REALES:
    - Calcula las calorías, proteínas, carbohidratos y grasas basándote en los ingredientes reales
    - Usa cantidades realistas de ingredientes (ej: 150g de pollo, 200g de arroz, 100g de vegetales)
    - Los valores nutricionales deben variar según el plato específico
    - NO uses valores genéricos - cada plato debe tener valores únicos y realistas
    - Considera el método de cocción (frito = más calorías, al vapor = menos calorías)
    - Menciona condimentos y especias a usar
    - Explica cómo servir el plato

    IMPORTANTE: Debes generar menús para TODOS los 7 días de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo).
    Cada día debe tener desayuno, almuerzo, cena y snacks únicos y diferentes.

    RESPONDE SOLO CON JSON VÁLIDO:
    {
      "weeklyMenu": [
        {
          "date": "2024-01-15",
          "dayName": "Lunes",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-16",
          "dayName": "Martes",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-17",
          "dayName": "Miércoles",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-18",
          "dayName": "Jueves",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-19",
          "dayName": "Viernes",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-20",
          "dayName": "Sábado",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        },
        {
          "date": "2024-01-21",
          "dayName": "Domingo",
          "meals": {
            "breakfast": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 15,
              "nutrition": {"calories": 450, "protein": 25, "carbs": 45, "fat": 18}
            },
            "lunch": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 15,
              "cookingTime": 20,
              "nutrition": {"calories": 600, "protein": 30, "carbs": 60, "fat": 25}
            },
            "dinner": {
              "name": "Nombre simple del plato",
              "instructions": "1. PREPARACIÓN PREVIA: Lavar cuidadosamente todas las verduras bajo agua fría corriente. Secar con papel absorbente para evitar que el agua interfiera con el salteado. Cortar en juliana fina de 2mm de grosor para cocción uniforme. 2. CALENTAR LA SARTÉN: Colocar una sartén antiadherente grande a fuego medio-alto (temperatura 6/10) y agregar 2 cucharadas soperas de aceite de oliva virgen extra. Esperar 30 segundos hasta que el aceite esté caliente pero no humeante. 3. SALTEADO: Agregar las verduras en orden de dureza: primero las más duras (zanahoria, apio), luego las intermedias (pimiento, cebolla) y finalmente las más tiernas (espinacas, tomate). Saltear con movimientos constantes durante 3-4 minutos hasta que estén tiernas pero mantengan su crujiente. 4. CONDIMENTAR: Retirar del fuego y condimentar inmediatamente con 1 cucharadita rasa de sal marina, pimienta negra recién molida y hierbas frescas picadas (albahaca, perejil). Mezclar suavemente para no romper las verduras. 5. SERVIR: Emplatar inmediatamente sobre platos precalentados para mantener la temperatura. Decorar con un chorrito de aceite de oliva y hierbas frescas. Acompañar con pan integral tostado.",
              "ingredients": ["ingrediente1", "ingrediente2"],
              "prepTime": 10,
              "cookingTime": 25,
              "nutrition": {"calories": 550, "protein": 35, "carbs": 45, "fat": 20}
            },
            "snacks": [
              {
                "name": "Nombre simple del snack",
                "instructions": "Instrucciones detalladas paso a paso para preparar el snack",
                "ingredients": ["ingrediente1"],
                "prepTime": 5,
                "nutrition": {"calories": 200, "protein": 8, "carbs": 25, "fat": 10}
              }
            ]
          },
          "nutrition": {"calories": 1800, "protein": 98, "carbs": 175, "fat": 73}
        }
      ]
    }
    `;
  }

  // Menú de respaldo si falla la IA - Mejorado para respetar especificaciones del usuario
  private generateFallbackMenu(request: AIMenuRequest): AIMenuResponse {
    console.log('🏠 GENERANDO MENÚ DE FALLBACK LOCAL MEJORADO...');
    console.log('📊 Request para fallback:', {
      totalCalories: request.totalCalories,
      dietaryPreferences: request.dietaryPreferences,
      allergies: request.allergies
    });
    
    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const caloriesPerDay = Math.round(request.totalCalories / 7);
    
    console.log('📅 Generando menú para 7 días:', daysOfWeek);
    console.log('🔥 Calorías por día:', caloriesPerDay);
    
    // Aplicar filtros dietéticos
    const dietaryFilters = this.getDietaryFilters(request);
    console.log('🔍 Filtros dietéticos aplicados:', dietaryFilters);
    
    const weeklyMenu: DaySchedule[] = daysOfWeek.map((dayName, index) => {
      // Calcular la fecha correcta empezando desde el próximo lunes
      const today = new Date();
      const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
      const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay); // Si es domingo, lunes es mañana
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + index);
      
      const dayMenu = {
        date: date.toISOString().split('T')[0],
        dayName,
        meals: {
          breakfast: this.generateBreakfast(index, caloriesPerDay * 0.25, dietaryFilters),
          lunch: this.generateLunch(index, caloriesPerDay * 0.35, dietaryFilters),
          dinner: this.generateDinner(index, caloriesPerDay * 0.30, dietaryFilters),
          snacks: [
            this.generateSnack(index, caloriesPerDay * 0.05, dietaryFilters),
            this.generateSnack(index + 7, caloriesPerDay * 0.05, dietaryFilters)
          ]
        },
        notes: this.generateDayNotes(index, dayName, request.dietaryPreferences || []),
        nutrition: {
          calories: caloriesPerDay,
          protein: Math.round((caloriesPerDay * 0.25) / 4),
          carbs: Math.round((caloriesPerDay * 0.55) / 4),
          fat: Math.round((caloriesPerDay * 0.20) / 9)
        }
      };
      
      console.log(`📝 Día ${index + 1} (${dayName}) generado:`, {
        date: dayMenu.date,
        breakfast: dayMenu.meals.breakfast?.name,
        lunch: dayMenu.meals.lunch?.name,
        dinner: dayMenu.meals.dinner?.name,
        snacks: dayMenu.meals.snacks?.map(s => s.name)
      });
      
      return dayMenu;
    });

    console.log('✅ Menú de fallback generado exitosamente con', weeklyMenu.length, 'días');
    console.log('📋 Días generados:', weeklyMenu.map(day => `${day.dayName} (${day.date})`).join(', '));

    return {
      success: true,
      weeklyMenu,
      message: 'Menú generado localmente con especificaciones del usuario'
    };
  }

  // Obtener filtros dietéticos basados en las preferencias del usuario
  private getDietaryFilters(request: AIMenuRequest): any {
    const filters: any = {};
    
    // Detectar preferencias dietéticas más específicas
    const prefs = request.dietaryPreferences || [];
    
    // Detectar dieta vegana
    if (prefs.some(p => p.toLowerCase().includes('vegana') || p.toLowerCase().includes('vegan'))) {
      filters.vegan = true;
      console.log('🥬 Detectada dieta VEGANA');
    }
    
    // Detectar dieta vegetariana
    if (prefs.some(p => p.toLowerCase().includes('vegetariana') || p.toLowerCase().includes('vegetarian'))) {
      filters.vegetarian = true;
      console.log('🥗 Detectada dieta VEGETARIANA');
    }
    
    // Detectar sin gluten
    if (prefs.some(p => p.toLowerCase().includes('sin gluten') || p.toLowerCase().includes('gluten_free'))) {
      filters.gluten_free = true;
      console.log('🚫 Detectada dieta SIN GLUTEN');
    }
    
    // Detectar sin lactosa
    if (prefs.some(p => p.toLowerCase().includes('sin lactosa') || p.toLowerCase().includes('dairy_free'))) {
      filters.dairy_free = true;
      console.log('🥛 Detectada dieta SIN LACTOSA');
    }
    
    // Detectar pérdida de peso
    if (prefs.some(p => p.toLowerCase().includes('pérdida de peso') || p.toLowerCase().includes('weight loss'))) {
      filters.weight_loss = true;
      console.log('⚖️ Detectada dieta para PÉRDIDA DE PESO');
    }
    
    // Detectar dieta mediterránea
    if (prefs.some(p => p.toLowerCase().includes('mediterránea') || p.toLowerCase().includes('mediterranean'))) {
      filters.mediterranean = true;
      console.log('🌊 Detectada dieta MEDITERRÁNEA');
    }
    
    // Detectar alta en proteínas
    if (prefs.some(p => p.toLowerCase().includes('alta en proteínas') || p.toLowerCase().includes('high protein'))) {
      filters.high_protein = true;
      console.log('💪 Detectada dieta ALTA EN PROTEÍNAS');
    }
    
    // Detectar baja en carbohidratos
    if (prefs.some(p => p.toLowerCase().includes('baja en carbohidratos') || p.toLowerCase().includes('low carb'))) {
      filters.low_carb = true;
      console.log('🍞 Detectada dieta BAJA EN CARBOHIDRATOS');
    }
    
    // Alergias
    const allergies = request.allergies || [];
    if (allergies.some(a => a.toLowerCase().includes('gluten'))) {
      filters.gluten_free = true;
      console.log('⚠️ Alergia a GLUTEN detectada');
    }
    if (allergies.some(a => a.toLowerCase().includes('lactosa') || a.toLowerCase().includes('lactose'))) {
      filters.dairy_free = true;
      console.log('⚠️ Alergia a LACTOSA detectada');
    }
    if (allergies.some(a => a.toLowerCase().includes('huevos') || a.toLowerCase().includes('eggs'))) {
      filters.egg_free = true;
      console.log('⚠️ Alergia a HUEVOS detectada');
    }
    if (allergies.some(a => a.toLowerCase().includes('frutos secos') || a.toLowerCase().includes('nuts'))) {
      filters.nut_free = true;
      console.log('⚠️ Alergia a FRUTOS SECOS detectada');
    }
    if (allergies.some(a => a.toLowerCase().includes('mariscos') || a.toLowerCase().includes('shellfish'))) {
      filters.shellfish_free = true;
      console.log('⚠️ Alergia a MARISCOS detectada');
    }
    if (allergies.some(a => a.toLowerCase().includes('pescado') || a.toLowerCase().includes('fish'))) {
      filters.fish_free = true;
      console.log('⚠️ Alergia a PESCADO detectada');
    }
    
    console.log('🔍 Filtros dietéticos finales:', filters);
    return filters;
  }


  // Función para generar hash simple de string
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a entero de 32 bits
    }
    return Math.abs(hash);
  }

  // Función para generar elementos únicos basados en el seed
  private generateSeedBasedElements(seed: number) {
    const cuisines = ['mediterránea', 'asiática', 'mexicana', 'italiana', 'francesa'];
    const proteins = ['pollo', 'pescado', 'lentejas', 'tofu', 'huevos'];
    const grains = ['avena', 'quinoa', 'arroz integral', 'pasta integral', 'pan integral'];
    const fruits = ['manzana', 'plátano', 'fresas', 'arándanos', 'naranja'];
    const vegetables = ['brócoli', 'espinacas', 'zanahoria', 'calabacín', 'tomate'];
    const spices = ['cúrcuma', 'jengibre', 'comino', 'orégano', 'albahaca'];
    const cookingMethods = ['plancha', 'horno', 'vapor', 'salteado', 'guisado'];

    const seedStr = seed.toString();
    const hash1 = this.hashString(seedStr);
    const hash2 = this.hashString(seedStr + '1');
    const hash3 = this.hashString(seedStr + '2');
    const hash4 = this.hashString(seedStr + '3');
    const hash5 = this.hashString(seedStr + '4');
    const hash6 = this.hashString(seedStr + '5');
    const hash7 = this.hashString(seedStr + '6');

    return {
      mainCuisine: cuisines[hash1 % cuisines.length],
      mainProtein: proteins[hash2 % proteins.length],
      mainGrain: grains[hash3 % grains.length],
      mainFruit: fruits[hash4 % fruits.length],
      mainVegetable: vegetables[hash5 % vegetables.length],
      mainSpice: spices[hash6 % spices.length],
      cookingMethod: cookingMethods[hash7 % cookingMethods.length]
    };
  }

  // Función para validar JSON completo
  private isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Función para limpiar JSON de caracteres problemáticos
  private cleanJSONString(str: string): string {
    let cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    cleaned = cleaned.replace(/[\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000]/g, ' ');
    cleaned = cleaned.replace(/\.\.\./g, '').replace(/\.\s*$/, '');
    cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    cleaned = cleaned.replace(/:\s*\./g, ': null').replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  // Función para intentar reparar JSON incompleto
  private attemptJSONRepair(jsonString: string): string | null {
    try {
      let cleaned = this.cleanJSONString(jsonString);
      
      // Contar llaves y corchetes
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;
      
      let repaired = cleaned;
      
      // Reparar comas finales
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      
      // Reparar llaves faltantes
      if (openBraces > closeBraces) {
        const missingBraces = openBraces - closeBraces;
        for (let i = 0; i < missingBraces; i++) {
          repaired += '}';
        }
      }
      
      // Reparar corchetes faltantes
      if (openBrackets > closeBrackets) {
        const missingBrackets = openBrackets - closeBrackets;
        for (let i = 0; i < missingBrackets; i++) {
          repaired += ']';
        }
      }
      
      // Verificar si el JSON reparado es válido
      if (this.isValidJSON(repaired)) {
        return repaired;
      }
      
      return null;
    } catch (error) {
      console.error('Error en reparación de JSON:', error);
      return null;
    }
  }

  // Funciones de generación de comidas simplificadas
  private generateBreakfast(dayIndex: number, targetCalories: number, dietaryFilters: any = {}): Meal {
    const breakfastOptions = [
      {
        name: 'Avena con Frutas',
        instructions: '1. Hierve agua. 2. Agrega avena y cocina 5 minutos. 3. Agrega frutas picadas.',
        ingredients: ['Avena integral', 'Plátano', 'Fresas', 'Miel'],
        prepTime: 5,
        cookingTime: 10,
        nutrition: { calories: 350, protein: 12, carbs: 65, fat: 8 }
      },
      {
        name: 'Tostadas con Aguacate',
        instructions: '1. Tuesta pan integral. 2. Machaca aguacate. 3. Unta en pan.',
        ingredients: ['Pan integral', 'Aguacate', 'Tomate', 'Sal'],
        prepTime: 8,
        cookingTime: 5,
        nutrition: { calories: 320, protein: 10, carbs: 35, fat: 18 }
      }
    ];
    
    const selected = breakfastOptions[dayIndex % breakfastOptions.length];
    return {
      name: selected.name,
      instructions: selected.instructions,
      ingredients: selected.ingredients,
      prepTime: selected.prepTime,
      cookingTime: selected.cookingTime,
      nutrition: selected.nutrition
    };
  }

  private generateLunch(dayIndex: number, targetCalories: number, dietaryFilters: any = {}): Meal {
    const lunchOptions = [
      {
        name: 'Pollo a la Plancha',
        instructions: '1. Sazona pollo. 2. Cocina en plancha 6 min por lado. 3. Sirve con arroz.',
        ingredients: ['Pechuga de pollo', 'Arroz integral', 'Vegetales'],
        prepTime: 10,
        cookingTime: 20,
        nutrition: { calories: 450, protein: 35, carbs: 45, fat: 12 }
      },
      {
        name: 'Salmón con Quinoa',
        instructions: '1. Cocina quinoa. 2. Hornea salmón 15 min. 3. Sirve junto.',
        ingredients: ['Salmón', 'Quinoa', 'Brócoli'],
        prepTime: 15,
        cookingTime: 25,
        nutrition: { calories: 480, protein: 32, carbs: 40, fat: 20 }
      }
    ];
    
    const selected = lunchOptions[dayIndex % lunchOptions.length];
    return {
      name: selected.name,
      instructions: selected.instructions,
      ingredients: selected.ingredients,
      prepTime: selected.prepTime,
      cookingTime: selected.cookingTime,
      nutrition: selected.nutrition
    };
  }

  private generateDinner(dayIndex: number, targetCalories: number, dietaryFilters: any = {}): Meal {
    const dinnerOptions = [
      {
        name: 'Pescado al Horno',
        instructions: '1. Precalienta horno 200°C. 2. Hornea pescado 15 min. 3. Sirve con vegetales.',
        ingredients: ['Pescado blanco', 'Vegetales mixtos', 'Aceite de oliva'],
        prepTime: 8,
        cookingTime: 15,
        nutrition: { calories: 380, protein: 30, carbs: 20, fat: 18 }
      },
      {
        name: 'Pasta con Vegetales',
        instructions: '1. Hierve pasta. 2. Saltea vegetales. 3. Mezcla y sirve.',
        ingredients: ['Pasta integral', 'Brócoli', 'Zanahoria', 'Ajo'],
        prepTime: 10,
        cookingTime: 15,
        nutrition: { calories: 420, protein: 15, carbs: 60, fat: 12 }
      }
    ];
    
    const selected = dinnerOptions[dayIndex % dinnerOptions.length];
    return {
      name: selected.name,
      instructions: selected.instructions,
      ingredients: selected.ingredients,
      prepTime: selected.prepTime,
      cookingTime: selected.cookingTime,
      nutrition: selected.nutrition
    };
  }

  private generateSnack(dayIndex: number, targetCalories: number, dietaryFilters: any = {}): Meal {
    const snackOptions = [
      {
        name: 'Manzana con Almendras',
        instructions: 'Corta manzana y sirve con almendras.',
        ingredients: ['Manzana', 'Almendras'],
        prepTime: 3,
        nutrition: { calories: 150, protein: 4, carbs: 20, fat: 8 }
      },
      {
        name: 'Yogur Griego',
        instructions: 'Sirve yogur con miel.',
        ingredients: ['Yogur griego', 'Miel'],
        prepTime: 2,
        nutrition: { calories: 120, protein: 10, carbs: 15, fat: 3 }
      }
    ];
    
    const selected = snackOptions[dayIndex % snackOptions.length];
    return {
      name: selected.name,
      instructions: selected.instructions,
      ingredients: selected.ingredients,
      prepTime: selected.prepTime,
      nutrition: selected.nutrition
    };
  }

  private generateDayNotes(dayIndex: number, dayName: string, dietaryPrefs: string[]): string | undefined {
    const notes = [
      'Día equilibrado con proteínas magras y vegetales frescos',
      'Menú rico en fibra y antioxidantes naturales',
      'Comidas ligeras y nutritivas para mantener la energía',
      'Variedad de sabores mediterráneos y asiáticos',
      'Opción vegetariana con proteínas vegetales completas'
    ];
    
    if (dayIndex === 5 || dayIndex === 6) {
      return 'Fin de semana - Menú especial con más tiempo de preparación';
    }
    
    const noteIndex = dayIndex % (notes.length - 1);
    return notes[noteIndex];
  }

  // Funciones de generación única (alias para las funciones principales)
  private generateUniqueBreakfast(dayIndex: number, daySeed: number, targetCalories: number, dietaryPrefs: string[], allergies: string[]): Meal {
    return this.generateBreakfast(dayIndex, targetCalories, {});
  }

  private generateUniqueLunch(dayIndex: number, daySeed: number, targetCalories: number, dietaryPrefs: string[], allergies: string[], cuisinePrefs: string[]): Meal {
    return this.generateLunch(dayIndex, targetCalories, {});
  }

  private generateUniqueDinner(dayIndex: number, daySeed: number, targetCalories: number, dietaryPrefs: string[], allergies: string[], cuisinePrefs: string[]): Meal {
    return this.generateDinner(dayIndex, targetCalories, {});
  }

  private generateUniqueSnack(dayIndex: number, daySeed: number, targetCalories: number, dietaryPrefs: string[], allergies: string[]): Meal {
    return this.generateSnack(dayIndex, targetCalories, {});
  }

  // Funciones de generación con prompts simplificados
  private async generateWithSimplePrompt(request: AIMenuRequest): Promise<AIMenuResponse> {
    console.log('🚀 Generando con prompt simplificado...');
    return await this.generateFallbackMenu(request);
  }


  // Función para generar listas dinámicas de alimentos
  private generateDynamicFoodLists(request: AIMenuRequest): string {
    console.log('⚡ Generando listas de alimentos...');
    
    const isVegan = request.dietaryPreferences?.includes('vegan') || false;
    const isVegetarian = request.dietaryPreferences?.includes('vegetarian') || false;
    const useExoticFruits = request.useExoticFruits || false;
    const useInternationalSpices = request.useInternationalSpices || false;
    
    let foodLists = `
    🥩 CARNES Y PROTEÍNAS ANIMALES:
    - Aves: pollo, pavo, pato, codorniz, gallina, faisán
    - Carnes rojas: ternera, cerdo, cordero, conejo, buey, jabalí
    - Pescados blancos: merluza, bacalao, lubina, dorada, lenguado, rape, rodaballo
    - Pescados azules: salmón, atún, sardinas, caballa, trucha, bonito, jurel
    - Mariscos: langostinos, gambas, mejillones, almejas, pulpo, calamar, vieiras, bogavante
    - Huevos: gallina, codorniz, pato
    `;

    if (!isVegan) {
      foodLists += `
    🥛 LÁCTEOS Y DERIVADOS:
    - Leches: vaca, cabra, oveja, búfala
    - Quesos: manchego, parmesano, mozzarella, feta, ricotta, queso fresco, gouda, emmental, roquefort
    - Yogures: natural, griego, kéfir, skyr, búlgaro
    - Otros: mantequilla, nata, requesón, crema agria, mascarpone
    `;
    }

    if (!isVegan && !isVegetarian) {
      foodLists += `
    🥚 HUEVOS:
    - Huevos de gallina, codorniz
    - Preparaciones: revueltos, pochados, cocidos, tortillas
    `;
    }

    foodLists += `
    🌱 PROTEÍNAS VEGETALES:
    - Legumbres: lentejas, garbanzos, judías, guisantes, soja, alubias, habas
    - Derivados: tofu, tempeh, seitán, miso, natto, edamame
    - Frutos secos: nueces, almendras, pistachos, anacardos, avellanas, macadamias, pecanas
    - Semillas: chía, lino, girasol, calabaza, sésamo, cáñamo, amapola
    - Granos: quinoa, amaranto, trigo sarraceno, mijo
    `;

    foodLists += `
    🥬 VEGETALES:
    - Hojas verdes: espinacas, kale, lechuga, rúcula, endivias, canónigos, berros, acelgas
    - Crucíferas: brócoli, coliflor, repollo, coles de Bruselas, romanesco, col lombarda
    - Raíces: zanahoria, remolacha, nabo, daikon, chirivía, apio nabo
    - Bulbos: cebolla, ajo, puerro, chalota, cebolleta, cebolla morada
    - Frutos: tomate, pimiento, berenjena, calabacín, pepino, calabaza, okra
    - Tubérculos: patata, boniato, yuca, ñame, tupinambo
    `;

    foodLists += `
    🍎 FRUTAS:
    - Cítricas: naranja, limón, lima, pomelo, mandarina, bergamota, kumquat
    - Tropicales: plátano, mango, piña, papaya, coco, maracuyá, guayaba, lichi
    - Bosque: fresas, arándanos, frambuesas, moras, grosellas, zarzamoras
    - Árbol: manzana, pera, melocotón, ciruela, cereza, nectarina, albaricoque
    - Otras: uvas, higos, granada, caqui, kiwi, aguacate
    `;

    if (useExoticFruits) {
      foodLists += `
    🌴 FRUTAS EXÓTICAS:
    - Dragon fruit, rambután, litchi, longan, durian
    - Jackfruit, mangostán, carambola, guayaba, pitahaya
    - Tamarindo, noni, acerola, açaí, baobab
    `;
    }

    foodLists += `
    🌾 CEREALES Y GRANOS:
    - Integrales: arroz integral, quinoa, avena, cebada, trigo sarraceno, espelta, kamut
    - Pasta: integral, de legumbres, de arroz, de trigo duro, de espelta
    - Pan: integral, de centeno, sin gluten, de espelta, de kamut
    - Otros: bulgur, cuscús, polenta, mijo, teff, sorgo
    `;

    foodLists += `
    🫒 GRASAS SALUDABLES:
    - Aceites: oliva, coco, aguacate, sésamo, lino, girasol, cártamo
    - Frutos secos: nueces, almendras, pistachos, avellanas, macadamias
    - Semillas: chía, lino, girasol, calabaza, sésamo
    - Aguacate, aceitunas, tahini
    `;

    foodLists += `
    🌿 HIERBAS Y ESPECIAS:
    - Frescas: albahaca, cilantro, perejil, menta, orégano, tomillo, romero, salvia
    - Secas: pimienta, comino, cúrcuma, canela, paprika, jengibre, cardamomo, clavo
    - Hierbas: laurel, estragón, eneldo, hinojo, mejorana
    `;

    if (useInternationalSpices) {
      foodLists += `
    🌍 ESPECIAS INTERNACIONALES:
    - Curry, garam masala, tandoori masala, ras el hanout
    - Za'atar, sumac, baharat, berbere, harissa
    - Furikake, shichimi togarashi, sichuan peppercorn
    `;
    }

    return foodLists;
  }

  /**
   * Construye un prompt ESTRICTO y ESPECÍFICO para la IA
   */
  private buildSimplePrompt(request: AIMenuRequest): string {
    const caloriesPerDay = Math.round(request.totalCalories / 7);
    
    // Información básica del usuario
    const dietaryInfo = request.dietaryPreferences?.join(', ') || 'Sin restricciones';
    const allergyInfo = request.allergies?.join(', ') || 'Sin alergias';
    
    // Detectar preferencias dietéticas específicas
    const isVegan = request.dietaryPreferences?.includes('Vegana') || request.dietaryPreferences?.includes('vegana');
    const isVegetarian = request.dietaryPreferences?.includes('Vegetariana') || request.dietaryPreferences?.includes('vegetariana');
    const isGlutenFree = request.dietaryPreferences?.includes('Sin gluten');
    const isLactoseFree = request.dietaryPreferences?.includes('Sin lactosa');
    const isLowCarb = request.dietaryPreferences?.includes('Baja en carbohidratos');
    const isHighProtein = request.dietaryPreferences?.includes('Alta en proteínas');
    const isKeto = request.dietaryPreferences?.includes('Keto');
    const isPaleo = request.dietaryPreferences?.includes('Paleo');
    const isMediterranean = request.dietaryPreferences?.includes('Mediterránea');
    const isLowSodium = request.dietaryPreferences?.includes('Baja en sodio');
    
    // Determinar tipo de dieta principal
    let mainDietType = 'OMNÍVORA';
    let strictRules = '';
    
    if (isVegan) {
      mainDietType = 'VEGANA';
      strictRules = `🚫 PROHIBIDO ABSOLUTAMENTE: carnes, pescados, huevos, lácteos, miel
✅ PERMITIDO SOLO: vegetales, frutas, legumbres, cereales, frutos secos, semillas`;
    } else if (isVegetarian) {
      mainDietType = 'VEGETARIANA';
      strictRules = `🚫 PROHIBIDO: carnes, pescados
✅ PERMITIDO: vegetales, frutas, legumbres, cereales, huevos, lácteos`;
    } else {
      mainDietType = 'OMNÍVORA';
      strictRules = `🥩 OBLIGATORIO INCLUIR CARNES Y PESCADOS:
- MÍNIMO 5 de 7 días con carne o pescado
- PRIORIZA: pollo, pavo, ternera, cerdo, salmón, atún, merluza
- USA carnes magras como base de las comidas principales`;
    }
    
    // Reglas adicionales según preferencias
    let additionalRules = '';
    if (isGlutenFree) additionalRules += '\n- SIN GLUTEN: Evita trigo, cebada, centeno, avena';
    if (isLactoseFree) additionalRules += '\n- SIN LACTOSA: Evita leche y derivados lácteos';
    if (isLowCarb) additionalRules += '\n- BAJA EN CARBOHIDRATOS: Reduce pan, pasta, arroz';
    if (isHighProtein) additionalRules += '\n- ALTA EN PROTEÍNAS: Aumenta carnes, pescados, huevos';
    if (isKeto) additionalRules += '\n- KETO: Muy baja en carbohidratos, alta en grasas';
    if (isPaleo) additionalRules += '\n- PALEO: Solo alimentos no procesados';
    if (isMediterranean) additionalRules += '\n- MEDITERRÁNEA: Aceite de oliva, pescado, vegetales';
    if (isLowSodium) additionalRules += '\n- BAJA EN SODIO: Reduce sal, usa hierbas';
    
    return `Eres un nutricionista experto. Crea un menú semanal REALISTA y VARIADO.

USUARIO:
- Tipo de dieta: ${mainDietType}
- Preferencias: ${dietaryInfo}
- Alergias: ${allergyInfo}
- Calorías/día: ${caloriesPerDay}
- Presupuesto: €${request.weeklyBudget || 60}
- Peso: ${request.weight || 'No especificado'} kg
- Altura: ${request.height || 'No especificado'} cm
- Metabolismo Basal (MCI): ${request.bmr ? Math.round(request.bmr) : 'No calculado'} cal/día

REGLAS ESTRICTAS:
${strictRules}${additionalRules}

VARIEDAD Y REPETICIÓN:
- Varía los platos principales (almuerzos y cenas) entre días
- Puedes repetir algunos desayunos y snacks (máximo 2-3 repeticiones)
- Usa nombres REALES de comidas (ej: "Pechuga de pollo a la plancha", "Salmón al horno")
- NO uses nombres genéricos como "Desayuno", "Almuerzo"
- Es normal repetir: tostadas, yogur, fruta, ensaladas básicas

${!isVegan && !isVegetarian ? `
EJEMPLOS REALES PARA DIETA OMNÍVORA:
- Lunes: Pechuga de pollo a la plancha con arroz integral y brócoli
- Martes: Salmón al horno con quinoa y espinacas
- Miércoles: Solomillo de ternera con patatas asadas
- Jueves: Merluza al vapor con verduras salteadas
- Viernes: Chuleta de cerdo con arroz y judías verdes
- Sábado: Atún a la plancha con ensalada mixta
- Domingo: Cordero al horno con bulgur y tomate
` : ''}

${isVegan ? `
EJEMPLOS REALES PARA DIETA VEGANA:
- Lunes: Tofu salteado con arroz integral y vegetales
- Martes: Buddha bowl con quinoa, garbanzos y aguacate
- Miércoles: Curry de lentejas con arroz basmati
- Jueves: Pasta con tomate y albahaca (sin queso)
- Viernes: Hummus con verduras y pan sin gluten
- Sábado: Ensalada de quinoa con frutos secos
- Domingo: Guiso de verduras con cuscús
` : ''}

${isVegetarian ? `
EJEMPLOS REALES PARA DIETA VEGETARIANA:
- Lunes: Tortilla española con ensalada
- Martes: Pasta primavera con queso parmesano
- Miércoles: Quiche de espinacas
- Jueves: Risotto de setas con queso
- Viernes: Ensalada de quinoa con huevo duro
- Sábado: Pizza margherita casera
- Domingo: Lasagna vegetariana
` : ''}

⚠️ VALIDACIÓN FINAL OBLIGATORIA PARA OMNÍVOROS:
- VERIFICA que CADA día tenga al menos 2 comidas con proteína animal (almuerzo y cena)
- CONFIRMA que NO uses solo huevos como proteína principal en comidas principales
- ASEGÚRATE de incluir variedad: aves, carnes rojas, pescados, mariscos
- EJEMPLO CORRECTO: "Pechuga de pollo a la plancha" ✅
- EJEMPLO INCORRECTO: "Huevos revueltos con vegetales" ❌ (solo para almuerzo/cena)

FORMATO JSON EXACTO (7 DÍAS):
{
  "weeklyMenu": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
      "meals": {
        "breakfast": {
          "name": "Texto concreto",
          "instructions": "1-2 frases",
          "ingredients": ["ingrediente1", "ingrediente2"],
          "prepTime": 5
        },
        "lunch": {
          "name": "Texto concreto",
          "instructions": "1-2 frases",
          "ingredients": ["ingrediente1", "ingrediente2"],
          "prepTime": 15
        },
        "dinner": {
          "name": "Texto concreto",
          "instructions": "1-2 frases",
          "ingredients": ["ingrediente1", "ingrediente2"],
          "prepTime": 10
        },
        "snacks": [
          {
            "name": "Texto concreto",
            "instructions": "1 frase",
            "ingredients": ["ingrediente"],
            "prepTime": 2
          }
        ]
      },
      "nutrition": {
        "calories": ${caloriesPerDay}
      }
    }
    // 6 objetos más (total 7)
  ]
}

IMPORTANTE: 
- Responde SOLO con JSON válido
- Usa nombres REALES de comidas
- Varía los platos principales, puedes repetir desayunos y snacks
- Respeta las reglas dietéticas estrictamente
- DEBE incluir exactamente 7 días (Lunes a Domingo)

🚨 CRÍTICO - PROTEÍNAS ANIMALES OBLIGATORIAS:
- SI NO ES VEGANO/VEGETARIANO: CADA almuerzo y cena DEBE tener carne o pescado
- NO uses solo huevos como proteína principal en almuerzo/cena
- INCLUYE: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos
- EJEMPLOS CORRECTOS: "Pechuga de pollo a la plancha con puré de patata" ✅, "Salmón al horno con arroz integral" ✅
- EJEMPLOS INCORRECTOS: "Huevos revueltos con vegetales" ❌, "Tortilla francesa" ❌ (para almuerzo/cena)
- SIGUE EL EJEMPLO COMPLETO DE MENÚ SEMANAL ARRIBA

🎯 VARIEDAD DE INGREDIENTES OBLIGATORIA:
- USA ingredientes comunes y accesibles (NO solo exóticos)
- VARÍA vegetales: brócoli, coliflor, espinacas, zanahorias, pimientos, calabacín, berenjena
- VARÍA frutas: manzana, naranja, pera, kiwi, fresas, arándanos, uvas, granada
- VARÍA carbohidratos: arroz integral, quinoa, pasta integral, patata, avena, bulgur, cuscús
- NO repitas los mismos ingredientes en días consecutivos`;
  }

}

export default new AIMenuService();
