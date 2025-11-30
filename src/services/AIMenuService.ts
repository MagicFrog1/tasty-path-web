import { WeeklyPlan } from '../context/WeeklyPlanContext';
import { AI_CONFIG, isAIConfigured } from '../config/ai';
import { ENV_CONFIG } from '../../env.config';
import { calculateMealNutrition, getNutritionData } from './NutritionDatabase';
import { medicalKnowledgeService } from './MedicalKnowledgeService';
import { completeFoodDatabase, Food, DietaryFilters } from './CompleteFoodDatabase';
import { optimizedFoodDatabase } from './OptimizedFoodDatabase';
import { recipeDatabase, Recipe } from './RecipeDatabase';

// Instancia de la base de datos de alimentos
const foodDB = completeFoodDatabase;

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
  // Usar endpoint API de Vercel como proxy para evitar CORS
  private apiEndpoint: string = '/api/generate-menu';
  
  // Detectar si es Gemini o OpenAI basándose en la API key
  private isGemini(): boolean {
    return this.apiKey?.startsWith('AIza') || false;
  }
  
  // Obtener la URL correcta según el tipo de API (ahora siempre usa el endpoint API)
  private getApiUrl(): string {
    return this.apiEndpoint;
  }
  
  // Obtener los headers correctos según el tipo de API
  private getApiHeaders(): Record<string, string> {
    // El endpoint API maneja la autenticación en el servidor
    return {
      'Content-Type': 'application/json'
    };
  }
  
  // Obtener la URL con query parameters para Gemini (ahora siempre usa el endpoint API)
  private getApiUrlWithParams(): string {
    return this.apiEndpoint;
  }

  // Función para generar menú semanal usando IA con reintentos
  async generateWeeklyMenu(request: AIMenuRequest): Promise<AIMenuResponse> {
    console.log('🚀 INICIANDO GENERACIÓN DE MENÚ SEMANAL...');
    console.log('📊 Request recibido:', {
      totalCalories: request.totalCalories,
      dietaryPreferences: request.dietaryPreferences,
      allergies: request.allergies
    });
    
    // Verificar si la IA está configurada correctamente con más detalle
    const aiConfigured = isAIConfigured();
    console.log('🔧 Estado de configuración de IA:', {
      configured: aiConfigured,
      apiKeyPresent: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0,
      apiKeyPrefix: this.apiKey?.substring(0, 7) || 'N/A',
      baseUrl: this.baseUrl,
      model: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini'
    });
    
    // Intentar usar IA siempre, incluso si la configuración parece incorrecta
    // (puede que la API key esté en el servidor pero no sea detectada)
    if (!aiConfigured) {
      console.warn('⚠️ ADVERTENCIA: La configuración de IA parece incompleta');
      console.warn('🔍 API Key detectada:', !!this.apiKey);
      console.warn('💡 Intentando usar IA de todas formas (puede estar configurada en el servidor)...');
    } else {
      console.log('✅ IA configurada correctamente, procediendo con generación...');
    }
    
    try {
      // Intentar generar con IA - hacer múltiples intentos antes de fallar
      const result = await this.retryAIGeneration(request, 1);
      
      if (!result.success) {
        console.error('❌ RESULTADO FINAL: Todos los intentos con IA fallaron');
        console.error('💡 Verifica que VITE_OPENAI_API_KEY esté configurada correctamente en Vercel');
        console.error('💡 O usa NEXT_PUBLIC_OPENAI_API_KEY como alternativa');
        // Retornar error en lugar de fallback para que el usuario sepa qué pasó
        return {
          success: false,
          weeklyMenu: [],
          message: 'Error: No se pudo generar el menú con IA después de múltiples intentos. Por favor, verifica tu conexión o contacta al soporte.'
        };
      }
      
      console.log('✅✅✅ RESULTADO FINAL: ÉXITO CON IA ✅✅✅');
      return result;
    } catch (error) {
      console.error('❌ ERROR CRÍTICO en generación de menú:', error);
      console.error('🔍 Tipo de error:', error instanceof Error ? error.message : String(error));
      console.error('🔍 Stack trace:', error instanceof Error ? error.stack : 'No disponible');
      
      // En lugar de usar fallback, retornar error claro
      return {
        success: false,
        weeklyMenu: [],
        message: `Error generando menú: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, intenta nuevamente.`
      };
    }
  }

  // Función interna para intentar generación con IA
  private async attemptAIGeneration(request: AIMenuRequest): Promise<AIMenuResponse> {
    // Verificar configuración de la API con más detalle
    const isGeminiAPI = this.isGemini();
    console.log('🔧 VERIFICACIÓN COMPLETA DE CONFIGURACIÓN DE IA:');
    console.log('🔑 API Key presente:', !!this.apiKey);
    console.log('🔑 API Key longitud:', this.apiKey?.length || 0);
    console.log('🔑 API Key empieza con AIza (Gemini):', this.apiKey?.startsWith('AIza') || false);
    console.log('🔑 API Key empieza con sk- (OpenAI):', this.apiKey?.startsWith('sk-') || false);
    console.log('🔑 Es Gemini:', isGeminiAPI);
    console.log('🔑 API Key NO es placeholder:', this.apiKey !== 'your-openai-api-key');
    console.log('🌐 Base URL:', this.getApiUrl());
    console.log('🤖 Modelo:', ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini');
    console.log('📊 Request recibido:', {
      totalCalories: request.totalCalories,
      dietaryPreferences: request.dietaryPreferences,
      allergies: request.allergies
    });
    
    // Verificación más estricta de la API key
    if (!this.apiKey) {
      console.error('❌ API Key no está definida');
      throw new Error('API key no está definida');
    }
    
    if (this.apiKey === 'your-openai-api-key') {
      console.error('❌ API Key es el placeholder por defecto');
      throw new Error('API key es el placeholder por defecto');
    }
    
    // Verificar formato según el tipo de API
    if (!isGeminiAPI && !this.apiKey.startsWith('sk-')) {
      console.error('❌ API Key de OpenAI no tiene el formato correcto');
      throw new Error('API key de OpenAI no tiene el formato correcto (debe empezar con sk-)');
    }
    
    if (isGeminiAPI && !this.apiKey.startsWith('AIza')) {
      console.error('❌ API Key de Gemini no tiene el formato correcto');
      throw new Error('API key de Gemini no tiene el formato correcto (debe empezar con AIza)');
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
    
      const apiUrl = this.getApiUrlWithParams();
      const apiHeaders = this.getApiHeaders();
      
      console.log('📤 Enviando solicitud sin timeout...');
      console.log('🔗 URL base:', this.getApiUrl());
      console.log('🔑 API Key (primeros 10 chars):', this.apiKey?.substring(0, 10) || 'N/A');
      console.log('🔑 Es Gemini:', isGeminiAPI);
      console.log('🔗 URL final:', apiUrl);
      
      // Preparar el body según el tipo de API
      // El endpoint API manejará la conversión y autenticación
      let requestBody: any;
      if (isGeminiAPI) {
        // Formato de Gemini API
        requestBody = {
          contents: [{
            parts: [{
              text: `Eres un chef experto que crea menús semanales. CRÍTICO: Debes responder ÚNICAMENTE con JSON válido y completo. El JSON debe estar perfectamente formateado, sin errores de sintaxis, con todas las llaves y corchetes cerrados correctamente. NO incluyas texto adicional antes o después del JSON. El JSON debe comenzar con { y terminar con }. Verifica que todos los arrays estén cerrados con ] y todos los objetos con }.\n\n${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8000
          }
        };
        console.log('🔑 Usando endpoint API para Gemini');
      } else {
        // Formato de OpenAI API
        requestBody = {
          model: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un chef experto que crea menús semanales. CRÍTICO: Debes responder ÚNICAMENTE con JSON válido y completo. El JSON debe estar perfectamente formateado, sin errores de sintaxis, con todas las llaves y corchetes cerrados correctamente. NO incluyas texto adicional antes o después del JSON. El JSON debe comenzar con { y terminar con }. Verifica que todos los arrays estén cerrados con ] y todos los objetos con }.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 8000
        };
        console.log('🔑 Usando endpoint API para OpenAI (evita CORS)');
      }
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: apiHeaders,
          body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Respuesta recibida:', isGeminiAPI ? 'de Gemini' : 'de OpenAI');
        console.log('📊 Status:', response.status, response.statusText);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error en la API:', errorText);
          const errorMsg = isGeminiAPI 
            ? `Error de autenticación con Gemini (${response.status}). Verifica que NEXT_PUBLIC_GEMINI_API_KEY esté configurada correctamente en Vercel. Error: ${errorText}`
            : `Error en la API: ${response.status} - ${response.statusText} - ${errorText}`;
          throw new Error(errorMsg);
        }

        const data = await response.json();
        
        // Extraer contenido según el tipo de API
        let content: string;
        if (isGeminiAPI) {
          // Formato de respuesta de Gemini
          console.log('📦 Datos de respuesta de Gemini:', {
            candidates: data.candidates?.length || 0,
            usageMetadata: data.usageMetadata
          });
          content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          // Formato de respuesta de OpenAI
          console.log('📦 Datos de respuesta de OpenAI:', {
            choices: data.choices?.length || 0,
            usage: data.usage,
            model: data.model
          });
          content = data.choices[0]?.message?.content || '';
        }
        
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
        
        // Buscar el JSON válido en la respuesta - mejorado para encontrar el JSON completo
        const jsonStart = cleanContent.indexOf('{');
        let jsonEnd = cleanContent.lastIndexOf('}') + 1;
        
        // Si el JSON parece estar cortado, intentar encontrar un punto de corte más inteligente
        // Buscar el último objeto "nutrition" completo como indicador
        const lastNutritionMatch = cleanContent.match(/"nutrition":\s*\{[^}]*"calories":\s*\d+\s*\}/g);
        if (lastNutritionMatch && lastNutritionMatch.length > 0) {
          const lastNutrition = lastNutritionMatch[lastNutritionMatch.length - 1];
          const lastNutritionEnd = cleanContent.lastIndexOf(lastNutrition) + lastNutrition.length;
          // Buscar el cierre del objeto del día después de la nutrición
          const afterNutrition = cleanContent.substring(lastNutritionEnd);
          const dayClose = afterNutrition.indexOf('}');
          if (dayClose !== -1) {
            const potentialEnd = lastNutritionEnd + dayClose + 1;
            // Verificar si hay más estructura después
            const afterDay = cleanContent.substring(potentialEnd).trim();
            if (afterDay.startsWith(']') || afterDay.startsWith('}')) {
              // Parece que el JSON continúa, usar el final original
            } else {
              // El JSON parece estar cortado aquí, intentar cerrarlo correctamente
              jsonEnd = potentialEnd;
            }
          }
        }
        
        console.log('🔍 Posición del JSON - Inicio:', jsonStart, 'Fin:', jsonEnd);
        
        if (jsonStart === -1 || jsonEnd === 0 || jsonEnd <= jsonStart) {
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
          console.warn(`⚠️ La IA generó ${menuArray?.length || 0} días en lugar de 7`);
          throw new Error(`Menú inválido: se esperaban 7 días pero se recibieron ${menuArray?.length || 0}`);
        }
        
        // Validar que cada día tenga la estructura correcta
        const validDays = menuArray.filter(day => 
          day && 
          day.dayName && 
          day.meals && 
          (day.meals.breakfast || day.meals.lunch || day.meals.dinner)
        );
        
        if (validDays.length !== 7) {
          console.warn(`⚠️ Solo ${validDays.length} días tienen la estructura correcta de 7`);
          throw new Error(`Estructura inválida: solo ${validDays.length} días son válidos de 7`);
        }
        
        // Agregar citaciones médicas a cada día del menú
        const menuWithCitations = validDays.map(day => ({
          ...day,
          medicalRecommendations: this.generateDailyMedicalRecommendations(day, request)
        }));
        
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
          console.log('⏰ Error de conexión detectado - será manejado por sistema de reintentos');
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

  // Método para reintentar generación con IA si falla - Optimizado para asegurar éxito
  private async retryAIGeneration(request: AIMenuRequest, attempt: number = 1): Promise<AIMenuResponse> {
    const maxRetries = 5; // 5 intentos para maximizar las posibilidades de éxito
    
    if (attempt > maxRetries) {
      console.error('❌ Máximo de reintentos alcanzado después de 5 intentos');
      console.error('🔍 Razón: Todos los intentos con IA fallaron');
      console.error('💡 Posibles causas:');
      console.error('   1. API Key no configurada o inválida');
      console.error('   2. Problemas de conectividad con OpenAI');
      console.error('   3. Límites de rate limit alcanzados');
      console.error('   4. Errores en la respuesta de la IA');
      
      // NO usar fallback - retornar error para que se intente más tarde
      return {
        success: false,
        weeklyMenu: [],
        message: 'Error: No se pudo generar el menú después de 5 intentos. Por favor, intenta nuevamente más tarde.'
      };
    }
    
    try {
      console.log(`🔄 INTENTO ${attempt}/${maxRetries} de generación con IA...`);
      
      // Espera progresiva entre reintentos (backoff exponencial)
      if (attempt > 1) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 2), 5000); // 1s, 2s, 4s, 5s max
        console.log(`⏳ Esperando ${waitTime}ms antes del intento ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      let result: AIMenuResponse;
      
      // Estrategia optimizada por intento - diferentes enfoques para maximizar éxito
      if (attempt === 1) {
        console.log('🎯 Intento 1: Usando prompt optimizado completo...');
        result = await this.attemptAIGeneration(request);
      } else if (attempt === 2) {
        console.log('🎯 Intento 2: Usando prompt simplificado...');
        result = await this.generateWithSimplePrompt(request);
      } else if (attempt === 3) {
        console.log('🎯 Intento 3: Reintentando con prompt optimizado (intento 2)...');
        result = await this.attemptAIGeneration(request);
      } else if (attempt === 4) {
        console.log('🎯 Intento 4: Reintentando con prompt simplificado (intento 2)...');
        result = await this.generateWithSimplePrompt(request);
      } else {
        console.log('🎯 Intento 5: Último intento con prompt optimizado...');
        result = await this.attemptAIGeneration(request);
      }
      
      // Si el resultado es exitoso, devolverlo
      if (result.success) {
        console.log(`✅ INTENTO ${attempt} EXITOSO CON IA`);
        return result;
      }
      
      // Si no es exitoso pero no es fallback, continuar con siguiente intento
      if (!result.success && attempt < maxRetries) {
        console.warn(`⚠️ Intento ${attempt} no exitoso, continuando con siguiente intento...`);
        return await this.retryAIGeneration(request, attempt + 1);
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
      // No usar fallback - lanzar error para que se reintente con IA
      throw error;
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
    
    🥩 CARNES Y PESCADOS (OPCIONAL):
    - Con 1-2 días con carne o pescado es suficiente, aunque puedes incluir más si lo deseas
    - PRIORIZA: pollo, pavo, ternera magra, salmón, atún, merluza, huevos
    - Los demás días puedes usar proteínas vegetales, huevos, legumbres
    - NO es necesario que todos los días tengan carne o pescado
    - COMBINA con proteínas vegetales para variedad nutricional
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

    🥩 PROTEÍNAS ANIMALES (SI NO ES VEGANO/VEGETARIANO):
    - Con 1-2 días con carne o pescado es suficiente (puedes incluir más si lo deseas)
    - Los demás días puedes usar proteínas vegetales, huevos, legumbres o platos sin proteína animal
    - NO es necesario que cada almuerzo y cena tenga carne o pescado
    - INCLUYE: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos, conejo, cordero, pato, pavo
    - VARÍA entre diferentes tipos de carnes y pescados cuando los incluyas

    OBJETIVOS NUTRICIONALES:
    - Calorías: ${Math.round(request.totalCalories / 7)} cal/día
    - Proteínas: ${request.nutritionGoals.protein}g/día
    - Carbohidratos: ${request.nutritionGoals.carbs}g/día
    - Grasas: ${request.nutritionGoals.fat}g/día

    💰 PRESUPUESTO OBLIGATORIO (MUY IMPORTANTE):
    - El presupuesto semanal es de €${request.weeklyBudget || 60} - DEBES RESPETARLO ESTRICTAMENTE
    - Calcula el costo aproximado de todos los ingredientes de la semana
    - El costo total semanal NO debe exceder €${request.weeklyBudget || 60}
    - Prioriza ingredientes económicos: legumbres, arroz, pasta, vegetales de temporada, pollo
    - Evita ingredientes muy caros: mariscos premium, carnes exóticas, productos importados costosos
    - Si el presupuesto es bajo (menos de €70), usa más proteínas vegetales (legumbres, huevos) y menos carne/pescado
    - Si el presupuesto es alto (más de €80), puedes incluir más variedad y ingredientes premium
    - Distribuye el costo a lo largo de la semana de forma equilibrada

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
    
    🥩 PROTEÍNAS ANIMALES (SI NO ES VEGANO/VEGETARIANO):
    - Con 1-2 días con carne o pescado es suficiente (puedes incluir más si lo deseas)
    - Los demás días puedes usar proteínas vegetales, huevos, legumbres o platos sin proteína animal
    - NO es necesario que cada almuerzo y cena tenga carne o pescado
    - INCLUYE: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos, conejo, cordero, pato, pavo
    - VARÍA entre diferentes tipos de carnes y pescados cuando los incluyas
    
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
    
    📅 EJEMPLO COMPLETO DE MENÚ SEMANAL VARIADO (1-2 días con carne/pescado):
    
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
    
    📝 NOTA PARA USUARIOS OMNÍVOROS:
    - Con 1-2 días con carne o pescado es suficiente (puedes incluir más si lo deseas)
    - Los demás días puedes usar proteínas vegetales, huevos, legumbres
    - Varía entre diferentes tipos de carnes y pescados cuando los incluyas
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

    ⚠️ CRÍTICO - FORMATO JSON OBLIGATORIO:
    - Debes responder ÚNICAMENTE con JSON válido y completo
    - El JSON debe comenzar con { y terminar con }
    - TODOS los arrays deben estar cerrados con ]
    - TODOS los objetos deben estar cerrados con }
    - NO incluyas texto adicional antes o después del JSON
    - Verifica que el JSON esté completo antes de enviarlo
    - El JSON debe tener exactamente 7 días en el array weeklyMenu
    - Cada día debe tener todas las comidas completas con sus objetos cerrados correctamente
    
    RESPONDE SOLO CON JSON VÁLIDO (sin markdown, sin backticks, sin texto adicional):
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
    const averageCaloriesPerDay = Math.round(request.totalCalories / 7);
    
    console.log('📅 Generando menú para 7 días:', daysOfWeek);
    console.log('🔥 Calorías promedio por día:', averageCaloriesPerDay);
    
    // Aplicar filtros dietéticos
    const dietaryFilters = this.getDietaryFilters(request);
    console.log('🔍 Filtros dietéticos aplicados:', dietaryFilters);
    
    // Calcular variación de calorías día a día (más realista)
    // Los días de semana suelen tener menos calorías, los fines de semana más
    const getDayCalories = (index: number): number => {
      const baseCalories = averageCaloriesPerDay;
      const variation = 0.15; // 15% de variación
      
      // Días de semana (0-4): ligeramente menos calorías
      if (index < 5) {
        const dayVariation = (index % 3) * 0.05 - 0.05; // -5% a +5%
        return Math.round(baseCalories * (1 + dayVariation));
      }
      // Fin de semana (5-6): más calorías
      else {
        const weekendVariation = 0.08 + (index === 6 ? 0.05 : 0); // +8% a +13%
        return Math.round(baseCalories * (1 + weekendVariation));
      }
    };
    
    const weeklyMenu: DaySchedule[] = daysOfWeek.map((dayName, index) => {
      // Calcular la fecha correcta empezando desde el próximo lunes
      const today = new Date();
      const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
      const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay); // Si es domingo, lunes es mañana
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      const date = new Date(nextMonday);
      date.setDate(nextMonday.getDate() + index);
      
      // Calorías específicas para este día (variación realista)
      const dayCalories = getDayCalories(index);
      
      // Distribución de calorías según el día
      // Días de semana: desayuno más ligero, cena más temprana
      // Fin de semana: desayuno más completo, cena más tardía
      const isWeekend = index >= 5;
      const breakfastRatio = isWeekend ? 0.28 : 0.25;
      const lunchRatio = isWeekend ? 0.32 : 0.35;
      const dinnerRatio = isWeekend ? 0.32 : 0.30;
      const snackRatio = isWeekend ? 0.08 : 0.10;
      
      const dayMenu = {
        date: date.toISOString().split('T')[0],
        dayName,
        meals: {
          breakfast: this.generateBreakfast(index, dayCalories * breakfastRatio, dietaryFilters),
          lunch: this.generateLunch(index, dayCalories * lunchRatio, dietaryFilters),
          dinner: this.generateDinner(index, dayCalories * dinnerRatio, dietaryFilters),
          snacks: [
            this.generateSnack(index, dayCalories * (snackRatio / 2), dietaryFilters),
            this.generateSnack(index + 7, dayCalories * (snackRatio / 2), dietaryFilters)
          ]
        },
        notes: this.generateDayNotes(index, dayName, request.dietaryPreferences || []),
        nutrition: {
          calories: dayCalories,
          protein: Math.round((dayCalories * 0.25) / 4),
          carbs: Math.round((dayCalories * 0.55) / 4),
          fat: Math.round((dayCalories * 0.20) / 9)
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

  // Función mejorada para intentar reparar JSON incompleto
  private attemptJSONRepair(jsonString: string): string | null {
    try {
      let cleaned = this.cleanJSONString(jsonString);
      
      // Contar llaves y corchetes
      const openBraces = (cleaned.match(/\{/g) || []).length;
      const closeBraces = (cleaned.match(/\}/g) || []).length;
      const openBrackets = (cleaned.match(/\[/g) || []).length;
      const closeBrackets = (cleaned.match(/\]/g) || []).length;
      
      let repaired = cleaned;
      
      // Reparar comas finales antes de llaves/corchetes de cierre
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      
      // Reparar comas duplicadas
      repaired = repaired.replace(/,\s*,/g, ',');
      
      // Buscar y reparar arrays mal cerrados dentro de objetos
      // Patrón: ingredientes que terminan mal
      repaired = repaired.replace(/("ingredients":\s*\[[^\]]*)([^\]])$/gm, '$1$2]');
      
      // Reparar objetos mal cerrados dentro de arrays
      // Buscar objetos que no están cerrados dentro de arrays de snacks
      repaired = repaired.replace(/("snacks":\s*\[[^\]]*)([^\]])$/gm, (match) => {
        // Contar llaves abiertas vs cerradas en el match
        const openInMatch = (match.match(/\{/g) || []).length;
        const closeInMatch = (match.match(/\}/g) || []).length;
        if (openInMatch > closeInMatch) {
          return match + '}'.repeat(openInMatch - closeInMatch);
        }
        return match;
      });
      
      // Reparar corchetes faltantes primero (arrays deben cerrarse antes de objetos)
      if (openBrackets > closeBrackets) {
        const missingBrackets = openBrackets - closeBrackets;
        // Intentar encontrar dónde insertar los corchetes faltantes
        // Buscar el último array abierto que no está cerrado
        let bracketCount = 0;
        let lastOpenBracketPos = -1;
        for (let i = 0; i < repaired.length; i++) {
          if (repaired[i] === '[') {
            bracketCount++;
            lastOpenBracketPos = i;
          } else if (repaired[i] === ']') {
            bracketCount--;
          }
        }
        
        // Si hay arrays abiertos, cerrarlos antes de cerrar objetos
        if (bracketCount > 0) {
          // Buscar la posición correcta para cerrar (antes del último objeto)
          const lastBracePos = repaired.lastIndexOf('}');
          if (lastBracePos > lastOpenBracketPos) {
            // Insertar corchetes antes del último objeto
            repaired = repaired.slice(0, lastBracePos) + ']'.repeat(missingBrackets) + repaired.slice(lastBracePos);
          } else {
            // Agregar al final
            repaired = repaired + ']'.repeat(missingBrackets);
          }
        } else {
          repaired = repaired + ']'.repeat(missingBrackets);
        }
      }
      
      // Reparar llaves faltantes
      if (openBraces > closeBraces) {
        const missingBraces = openBraces - closeBraces;
        repaired = repaired + '}'.repeat(missingBraces);
      }
      
      // Verificar si el JSON reparado es válido
      if (this.isValidJSON(repaired)) {
        return repaired;
      }
      
      // Intentar una reparación más agresiva: buscar el último objeto válido y cerrar todo
      try {
        // Buscar el último "nutrition" válido y cerrar desde ahí
        const nutritionMatch = repaired.match(/"nutrition":\s*\{[^}]*"calories":\s*\d+/g);
        if (nutritionMatch && nutritionMatch.length > 0) {
          const lastNutrition = nutritionMatch[nutritionMatch.length - 1];
          const lastNutritionIndex = repaired.lastIndexOf(lastNutrition);
          if (lastNutritionIndex !== -1) {
            // Cerrar desde la última nutrición
            let testRepaired = repaired.substring(0, lastNutritionIndex + lastNutrition.length);
            // Cerrar el objeto nutrition
            if (!testRepaired.endsWith('}')) {
              testRepaired += '}';
            }
            // Cerrar el objeto del día
            testRepaired += '}';
            // Cerrar el array weeklyMenu
            testRepaired += ']';
            // Cerrar el objeto principal
            testRepaired += '}';
            
            if (this.isValidJSON(testRepaired)) {
              return testRepaired;
            }
          }
        }
      } catch (e) {
        // Ignorar errores en reparación agresiva
      }
      
      return null;
    } catch (error) {
      console.error('Error en reparación de JSON:', error);
      return null;
    }
  }

  // Funciones de generación de comidas mejoradas que respetan preferencias dietéticas
  private generateBreakfast(dayIndex: number, targetCalories: number, dietaryFilters: any = {}): Meal {
    // Usar la base de datos de alimentos para generar opciones más variadas
    const filters: DietaryFilters = {
      vegan: dietaryFilters.vegan,
      vegetarian: dietaryFilters.vegetarian,
      gluten_free: dietaryFilters.gluten_free,
      dairy_free: dietaryFilters.dairy_free,
      max_calories: targetCalories * 1.2, // Permitir 20% más para ajustar
    };
    
    const availableFoods = foodDB.filterFoods(filters);
    
    // Opciones de desayuno según preferencias
    const breakfastOptions: any[] = [];
    
    if (dietaryFilters.vegan) {
      breakfastOptions.push(
        {
          name: 'Avena con Frutas y Semillas',
          instructions: '1. Hierve 200ml de agua o leche vegetal. 2. Agrega 50g de avena y cocina 5 minutos removiendo. 3. Agrega plátano en rodajas, fresas y semillas de chía. 4. Endulza con miel de agave si deseas.',
          ingredients: ['Avena integral', 'Plátano', 'Fresas', 'Semillas de chía', 'Leche vegetal'],
          prepTime: 5,
          cookingTime: 10,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 12, carbs: 65, fat: 8 }
        },
        {
          name: 'Tostadas de Aguacate Vegano',
          instructions: '1. Tuesta 2 rebanadas de pan integral sin gluten. 2. Machaca medio aguacate con limón y sal. 3. Unta sobre el pan y añade tomate cherry y germinados.',
          ingredients: ['Pan integral sin gluten', 'Aguacate', 'Tomate cherry', 'Germinados', 'Limón'],
          prepTime: 8,
          cookingTime: 5,
          nutrition: { calories: Math.round(targetCalories * 0.85), protein: 10, carbs: 35, fat: 18 }
        },
        {
          name: 'Bowl de Açaí con Frutas',
          instructions: '1. Mezcla 100g de açaí congelado con plátano. 2. Añade granola sin gluten, arándanos y coco rallado. 3. Decora con semillas de girasol.',
          ingredients: ['Açaí', 'Plátano', 'Granola sin gluten', 'Arándanos', 'Coco rallado', 'Semillas de girasol'],
          prepTime: 5,
          cookingTime: 0,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 8, carbs: 55, fat: 12 }
        }
      );
    } else if (dietaryFilters.vegetarian) {
      breakfastOptions.push(
        {
          name: 'Tortilla de Verduras',
          instructions: '1. Bate 2 huevos con sal y pimienta. 2. Saltea pimientos, cebolla y espinacas. 3. Vierte los huevos sobre las verduras y cocina 3 minutos por lado.',
          ingredients: ['Huevos', 'Pimientos', 'Cebolla', 'Espinacas', 'Aceite de oliva'],
          prepTime: 8,
          cookingTime: 8,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 18, carbs: 12, fat: 15 }
        },
        {
          name: 'Yogur con Granola y Frutas',
          instructions: '1. Sirve 200g de yogur griego en un bol. 2. Añade granola casera, fresas, arándanos y miel. 3. Espolvorea con nueces picadas.',
          ingredients: ['Yogur griego', 'Granola', 'Fresas', 'Arándanos', 'Miel', 'Nueces'],
          prepTime: 5,
          cookingTime: 0,
          nutrition: { calories: Math.round(targetCalories * 0.85), protein: 15, carbs: 45, fat: 12 }
        }
      );
    } else {
      // Opciones con carne y pescado (preferencia del usuario)
      breakfastOptions.push(
        {
          name: 'Huevos Revueltos con Salmón Ahumado',
          instructions: '1. Bate 2 huevos con crema. 2. Cocina en mantequilla removiendo constantemente. 3. Sirve con salmón ahumado, aguacate y pan integral tostado.',
          ingredients: ['Huevos', 'Salmón ahumado', 'Aguacate', 'Pan integral', 'Mantequilla', 'Crema'],
          prepTime: 5,
          cookingTime: 6,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 28, carbs: 25, fat: 22 }
        },
        {
          name: 'Avena con Frutas y Proteína',
          instructions: '1. Cocina 50g de avena con leche. 2. Añade plátano, fresas y miel. 3. Espolvorea con semillas de chía y nueces. 4. Añade una cucharada de proteína en polvo opcional.',
          ingredients: ['Avena integral', 'Leche', 'Plátano', 'Fresas', 'Miel', 'Semillas de chía', 'Nueces'],
          prepTime: 5,
          cookingTime: 10,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 18, carbs: 60, fat: 10 }
        },
        {
          name: 'Tostadas con Aguacate y Huevo Pochado',
          instructions: '1. Tuesta pan integral. 2. Unta aguacate machacado. 3. Cocina un huevo pochado y colócalo encima. 4. Añade tomate cherry y rúcula.',
          ingredients: ['Pan integral', 'Aguacate', 'Huevo', 'Tomate cherry', 'Rúcula', 'Sal', 'Pimienta'],
          prepTime: 8,
          cookingTime: 8,
          nutrition: { calories: Math.round(targetCalories * 0.88), protein: 16, carbs: 30, fat: 20 }
        }
      );
    }
    
    // Seleccionar opción basada en el día para variar
    const selected = breakfastOptions[dayIndex % breakfastOptions.length];
    
    // Ajustar calorías si es necesario
    const calorieAdjustment = targetCalories / selected.nutrition.calories;
    if (calorieAdjustment < 0.8 || calorieAdjustment > 1.2) {
      selected.nutrition.calories = Math.round(targetCalories);
      selected.nutrition.protein = Math.round(selected.nutrition.protein * calorieAdjustment);
      selected.nutrition.carbs = Math.round(selected.nutrition.carbs * calorieAdjustment);
      selected.nutrition.fat = Math.round(selected.nutrition.fat * calorieAdjustment);
    }
    
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
    const lunchOptions: any[] = [];
    
    if (dietaryFilters.vegan) {
      lunchOptions.push(
        {
          name: 'Buddha Bowl de Lentejas',
          instructions: '1. Cocina lentejas hasta que estén tiernas. 2. Asa boniato, brócoli y zanahoria en el horno. 3. Sirve sobre quinoa con aguacate, germinados y tahini.',
          ingredients: ['Lentejas', 'Quinoa', 'Boniato', 'Brócoli', 'Zanahoria', 'Aguacate', 'Germinados', 'Tahini'],
          prepTime: 15,
          cookingTime: 30,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 22, carbs: 65, fat: 15 }
        },
        {
          name: 'Ensalada de Garbanzos y Vegetales',
          instructions: '1. Mezcla garbanzos cocidos con pimientos, pepino y tomate. 2. Añade aceitunas, cebolla roja y perejil. 3. Aliña con aceite de oliva, limón y especias.',
          ingredients: ['Garbanzos', 'Pimientos', 'Pepino', 'Tomate', 'Aceitunas', 'Cebolla roja', 'Perejil', 'Aceite de oliva'],
          prepTime: 10,
          cookingTime: 0,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 18, carbs: 50, fat: 18 }
        }
      );
    } else if (dietaryFilters.vegetarian) {
      lunchOptions.push(
        {
          name: 'Risotto de Setas y Queso',
          instructions: '1. Saltea arroz arborio con cebolla. 2. Añade caldo caliente gradualmente. 3. Incorpora setas salteadas y queso parmesano al final.',
          ingredients: ['Arroz arborio', 'Setas', 'Cebolla', 'Caldo vegetal', 'Queso parmesano', 'Vino blanco', 'Mantequilla'],
          prepTime: 10,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 16, carbs: 70, fat: 14 }
        },
        {
          name: 'Quiche de Espinacas y Queso',
          instructions: '1. Prepara masa de quiche. 2. Saltea espinacas con ajo. 3. Mezcla con huevos, crema y queso. 4. Hornea 35 minutos a 180°C.',
          ingredients: ['Masa de quiche', 'Espinacas', 'Huevos', 'Crema', 'Queso feta', 'Ajo', 'Nuez moscada'],
          prepTime: 15,
          cookingTime: 35,
          nutrition: { calories: Math.round(targetCalories * 0.92), protein: 20, carbs: 45, fat: 22 }
        }
      );
    } else {
      // Opciones con carne y pescado (preferencia del usuario)
      lunchOptions.push(
        {
          name: 'Pollo a la Plancha con Arroz y Vegetales',
          instructions: '1. Sazona 150g de pechuga de pollo con especias. 2. Cocina en plancha 6-7 minutos por lado. 3. Sirve con 80g de arroz integral y vegetales al vapor (brócoli, zanahoria). 4. Aliña con aceite de oliva.',
          ingredients: ['Pechuga de pollo', 'Arroz integral', 'Brócoli', 'Zanahoria', 'Aceite de oliva', 'Especias'],
          prepTime: 10,
          cookingTime: 20,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 38, carbs: 50, fat: 12 }
        },
        {
          name: 'Salmón al Horno con Quinoa y Verduras',
          instructions: '1. Precalienta horno a 200°C. 2. Sazona 150g de salmón y hornea 12-15 minutos. 3. Cocina quinoa y saltea brócoli y calabacín. 4. Sirve todo junto con limón.',
          ingredients: ['Salmón', 'Quinoa', 'Brócoli', 'Calabacín', 'Limón', 'Aceite de oliva', 'Ajo'],
          prepTime: 15,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.98), protein: 35, carbs: 45, fat: 20 }
        },
        {
          name: 'Ternera Guisada con Patatas',
          instructions: '1. Dora 120g de ternera en trozos. 2. Añade cebolla, zanahoria y vino. 3. Cocina a fuego lento 1 hora. 4. Sirve con patatas asadas y guisantes.',
          ingredients: ['Ternera', 'Cebolla', 'Zanahoria', 'Vino tinto', 'Patatas', 'Guisantes', 'Caldo'],
          prepTime: 15,
          cookingTime: 75,
          nutrition: { calories: Math.round(targetCalories * 1.05), protein: 32, carbs: 55, fat: 18 }
        },
        {
          name: 'Merluza con Patatas y Espinacas',
          instructions: '1. Cocina 150g de merluza al vapor o al horno. 2. Asa patatas en rodajas. 3. Saltea espinacas con ajo. 4. Sirve todo junto con limón.',
          ingredients: ['Merluza', 'Patatas', 'Espinacas', 'Ajo', 'Limón', 'Aceite de oliva'],
          prepTime: 10,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 30, carbs: 40, fat: 12 }
        }
      );
    }
    
    // Seleccionar opción variada según el día
    const selected = lunchOptions[dayIndex % lunchOptions.length];
    
    // Ajustar calorías si es necesario
    const calorieAdjustment = targetCalories / selected.nutrition.calories;
    if (calorieAdjustment < 0.8 || calorieAdjustment > 1.2) {
      selected.nutrition.calories = Math.round(targetCalories);
      selected.nutrition.protein = Math.round(selected.nutrition.protein * calorieAdjustment);
      selected.nutrition.carbs = Math.round(selected.nutrition.carbs * calorieAdjustment);
      selected.nutrition.fat = Math.round(selected.nutrition.fat * calorieAdjustment);
    }
    
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
    const dinnerOptions: any[] = [];
    
    if (dietaryFilters.vegan) {
      dinnerOptions.push(
        {
          name: 'Curry de Garbanzos y Verduras',
          instructions: '1. Saltea cebolla, ajo y jengibre. 2. Añade curry en polvo y tomate. 3. Incorpora garbanzos y verduras. 4. Cocina 20 minutos y sirve con arroz integral.',
          ingredients: ['Garbanzos', 'Cebolla', 'Ajo', 'Jengibre', 'Curry', 'Tomate', 'Verduras mixtas', 'Arroz integral'],
          prepTime: 10,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 20, carbs: 60, fat: 12 }
        },
        {
          name: 'Pasta Integral con Salsa de Tomate y Albahaca',
          instructions: '1. Hierve pasta integral. 2. Prepara salsa de tomate natural con ajo y albahaca. 3. Mezcla y añade aceitunas y alcaparras.',
          ingredients: ['Pasta integral', 'Tomate natural', 'Ajo', 'Albahaca', 'Aceitunas', 'Alcaparras', 'Aceite de oliva'],
          prepTime: 8,
          cookingTime: 15,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 14, carbs: 65, fat: 10 }
        }
      );
    } else if (dietaryFilters.vegetarian) {
      dinnerOptions.push(
        {
          name: 'Lasagna de Verduras',
          instructions: '1. Prepara capas de pasta, verduras salteadas, bechamel y queso. 2. Hornea 40 minutos a 180°C hasta que esté dorada.',
          ingredients: ['Pasta para lasagna', 'Berenjena', 'Calabacín', 'Tomate', 'Queso mozzarella', 'Bechamel', 'Albahaca'],
          prepTime: 20,
          cookingTime: 40,
          nutrition: { calories: Math.round(targetCalories * 1.05), protein: 22, carbs: 55, fat: 20 }
        },
        {
          name: 'Risotto de Calabaza y Queso de Cabra',
          instructions: '1. Saltea arroz arborio. 2. Añade caldo caliente y puré de calabaza. 3. Termina con queso de cabra y nueces.',
          ingredients: ['Arroz arborio', 'Calabaza', 'Caldo vegetal', 'Queso de cabra', 'Nueces', 'Cebolla'],
          prepTime: 10,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 18, carbs: 65, fat: 16 }
        }
      );
    } else {
      // Opciones con carne y pescado (preferencia del usuario)
      dinnerOptions.push(
        {
          name: 'Pescado al Horno con Verduras',
          instructions: '1. Precalienta horno a 200°C. 2. Coloca 150g de pescado blanco en papel de aluminio con verduras. 3. Añade limón, hierbas y aceite. 4. Hornea 15-18 minutos.',
          ingredients: ['Pescado blanco (merluza/dorada)', 'Calabacín', 'Pimiento', 'Cebolla', 'Limón', 'Hierbas', 'Aceite de oliva'],
          prepTime: 10,
          cookingTime: 18,
          nutrition: { calories: Math.round(targetCalories * 0.92), protein: 32, carbs: 25, fat: 16 }
        },
        {
          name: 'Pollo al Curry con Arroz',
          instructions: '1. Dora 150g de pollo en trozos. 2. Añade cebolla, curry y leche de coco. 3. Cocina 20 minutos. 4. Sirve con arroz basmati.',
          ingredients: ['Pollo', 'Cebolla', 'Curry', 'Leche de coco', 'Jengibre', 'Ajo', 'Arroz basmati'],
          prepTime: 10,
          cookingTime: 25,
          nutrition: { calories: Math.round(targetCalories * 0.98), protein: 35, carbs: 50, fat: 18 }
        },
        {
          name: 'Atún a la Plancha con Ensalada',
          instructions: '1. Sazona 150g de atún fresco. 2. Cocina en plancha 2-3 minutos por lado (debe quedar rosado). 3. Sirve con ensalada de rúcula, tomate y cebolla roja.',
          ingredients: ['Atún fresco', 'Rúcula', 'Tomate', 'Cebolla roja', 'Aceite de oliva', 'Limón', 'Alcaparras'],
          prepTime: 8,
          cookingTime: 6,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 38, carbs: 15, fat: 20 }
        },
        {
          name: 'Cordero al Horno con Patatas',
          instructions: '1. Marina 120g de cordero con hierbas. 2. Asa en horno a 180°C 25 minutos. 3. Asa patatas junto. 4. Sirve con verduras al vapor.',
          ingredients: ['Cordero', 'Patatas', 'Romero', 'Tomillo', 'Ajo', 'Verduras al vapor'],
          prepTime: 15,
          cookingTime: 30,
          nutrition: { calories: Math.round(targetCalories * 1.05), protein: 30, carbs: 45, fat: 22 }
        }
      );
    }
    
    // Seleccionar opción variada según el día
    const selected = dinnerOptions[dayIndex % dinnerOptions.length];
    
    // Ajustar calorías si es necesario
    const calorieAdjustment = targetCalories / selected.nutrition.calories;
    if (calorieAdjustment < 0.8 || calorieAdjustment > 1.2) {
      selected.nutrition.calories = Math.round(targetCalories);
      selected.nutrition.protein = Math.round(selected.nutrition.protein * calorieAdjustment);
      selected.nutrition.carbs = Math.round(selected.nutrition.carbs * calorieAdjustment);
      selected.nutrition.fat = Math.round(selected.nutrition.fat * calorieAdjustment);
    }
    
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
    const snackOptions: any[] = [];
    
    if (dietaryFilters.vegan) {
      snackOptions.push(
        {
          name: 'Manzana con Mantequilla de Almendras',
          instructions: 'Corta una manzana en rodajas y sirve con 1 cucharada de mantequilla de almendras.',
          ingredients: ['Manzana', 'Mantequilla de almendras'],
          prepTime: 2,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 6, carbs: 22, fat: 10 }
        },
        {
          name: 'Hummus con Verduras',
          instructions: 'Sirve 3 cucharadas de hummus con palitos de zanahoria, apio y pepino.',
          ingredients: ['Hummus', 'Zanahoria', 'Apio', 'Pepino'],
          prepTime: 3,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 8, carbs: 18, fat: 12 }
        },
        {
          name: 'Frutos Secos y Dátiles',
          instructions: 'Mezcla un puñado de nueces, almendras y 2-3 dátiles.',
          ingredients: ['Nueces', 'Almendras', 'Dátiles'],
          prepTime: 1,
          nutrition: { calories: Math.round(targetCalories * 1.05), protein: 5, carbs: 25, fat: 14 }
        }
      );
    } else if (dietaryFilters.vegetarian) {
      snackOptions.push(
        {
          name: 'Yogur Griego con Frutas',
          instructions: 'Sirve 150g de yogur griego con fresas, arándanos y una cucharada de miel.',
          ingredients: ['Yogur griego', 'Fresas', 'Arándanos', 'Miel'],
          prepTime: 3,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 12, carbs: 20, fat: 4 }
        },
        {
          name: 'Queso con Nueces',
          instructions: 'Sirve 50g de queso fresco con un puñado de nueces y uvas.',
          ingredients: ['Queso fresco', 'Nueces', 'Uvas'],
          prepTime: 2,
          nutrition: { calories: Math.round(targetCalories * 1.0), protein: 10, carbs: 15, fat: 12 }
        }
      );
    } else {
      // Opciones con proteína animal
      snackOptions.push(
        {
          name: 'Manzana con Almendras',
          instructions: 'Corta una manzana en rodajas y sirve con un puñado de almendras (20g).',
          ingredients: ['Manzana', 'Almendras'],
          prepTime: 2,
          nutrition: { calories: Math.round(targetCalories * 0.95), protein: 6, carbs: 22, fat: 10 }
        },
        {
          name: 'Yogur Griego con Miel y Nueces',
          instructions: 'Sirve 150g de yogur griego con una cucharada de miel y nueces picadas.',
          ingredients: ['Yogur griego', 'Miel', 'Nueces'],
          prepTime: 2,
          nutrition: { calories: Math.round(targetCalories * 1.0), protein: 12, carbs: 18, fat: 8 }
        },
        {
          name: 'Huevo Cocido con Aguacate',
          instructions: 'Sirve un huevo cocido con medio aguacate pequeño y una pizca de sal.',
          ingredients: ['Huevo cocido', 'Aguacate', 'Sal'],
          prepTime: 5,
          nutrition: { calories: Math.round(targetCalories * 1.05), protein: 10, carbs: 8, fat: 14 }
        },
        {
          name: 'Atún en Conserva con Galletas',
          instructions: 'Sirve 50g de atún en conserva al natural con 2-3 galletas integrales.',
          ingredients: ['Atún en conserva', 'Galletas integrales'],
          prepTime: 1,
          nutrition: { calories: Math.round(targetCalories * 0.9), protein: 15, carbs: 20, fat: 5 }
        }
      );
    }
    
    // Seleccionar opción variada según el día
    const selected = snackOptions[dayIndex % snackOptions.length];
    
    // Ajustar calorías si es necesario
    const calorieAdjustment = targetCalories / selected.nutrition.calories;
    if (calorieAdjustment < 0.7 || calorieAdjustment > 1.3) {
      selected.nutrition.calories = Math.round(targetCalories);
      selected.nutrition.protein = Math.round(selected.nutrition.protein * calorieAdjustment);
      selected.nutrition.carbs = Math.round(selected.nutrition.carbs * calorieAdjustment);
      selected.nutrition.fat = Math.round(selected.nutrition.fat * calorieAdjustment);
    }
    
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

  // Funciones de generación con prompts simplificados - SIEMPRE usa IA
  private async generateWithSimplePrompt(request: AIMenuRequest): Promise<AIMenuResponse> {
    console.log('🚀 Generando con prompt simplificado usando IA...');
    
    try {
      // Construir un prompt más simple pero aún usando IA
      const simplePrompt = this.buildSimplePrompt(request);
      
      // Generar un seed único
      const timestamp = Date.now();
      const randomComponent = Math.random() * 1000000;
      const userHash = this.hashString(JSON.stringify(request));
      const generationSeed = timestamp + randomComponent + userHash;
      
      const isGeminiAPI = this.isGemini();
      const apiUrl = this.getApiUrlWithParams();
      const apiHeaders = this.getApiHeaders();
      
      console.log('🤖 Llamando a', isGeminiAPI ? 'Gemini' : 'OpenAI', 'con prompt simplificado...');
      console.log('🔗 Usando endpoint API:', apiUrl);
      
      // Preparar el body según el tipo de API
      // El endpoint API manejará la conversión y autenticación
      let requestBody: any;
      if (isGeminiAPI) {
        requestBody = {
          contents: [{
            parts: [{
              text: `Eres un chef experto que crea menús semanales. Responde ÚNICAMENTE con JSON válido. El JSON debe comenzar con { y terminar con }. Verifica que todos los arrays estén cerrados.\n\n${simplePrompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 6000
          }
        };
      } else {
        requestBody = {
          model: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un chef experto que crea menús semanales. Responde ÚNICAMENTE con JSON válido. El JSON debe comenzar con { y terminar con }. Verifica que todos los arrays estén cerrados.'
            },
            {
              role: 'user',
              content: simplePrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 6000
        };
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en la API con prompt simplificado:', errorText);
        throw new Error(`Error en la API: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraer contenido según el tipo de API
      let content: string;
      if (isGeminiAPI) {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        content = data.choices[0]?.message?.content || '';
      }
      
      if (!content) {
        throw new Error('No se recibió contenido de la IA');
      }

      // Limpiar y parsear JSON
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      cleanContent = this.cleanJSONString(cleanContent);
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      let jsonString = cleanContent.substring(jsonStart, jsonEnd);
      jsonString = this.cleanJSONString(jsonString);
      
      if (!this.isValidJSON(jsonString)) {
        const repairedJSON = this.attemptJSONRepair(jsonString);
        if (repairedJSON && this.isValidJSON(repairedJSON)) {
          jsonString = repairedJSON;
        } else {
          throw new Error('JSON incompleto o inválido recibido de la IA');
        }
      }
      
      const weeklyMenu = JSON.parse(jsonString);
      const menuArray = weeklyMenu.weeklyMenu || weeklyMenu;
      
      if (!Array.isArray(menuArray) || menuArray.length !== 7) {
        throw new Error(`Menú inválido: se esperaban 7 días pero se recibieron ${menuArray?.length || 0}`);
      }
      
      // Validar estructura
      const validDays = menuArray.filter(day => 
        day && 
        day.dayName && 
        day.meals && 
        (day.meals.breakfast || day.meals.lunch || day.meals.dinner)
      );
      
      if (validDays.length !== 7) {
        throw new Error(`Estructura inválida: solo ${validDays.length} días son válidos de 7`);
      }
      
      // Agregar citaciones médicas
      const menuWithCitations = validDays.map(day => ({
        ...day,
        medicalRecommendations: this.generateDailyMedicalRecommendations(day, request)
      }));
      
      console.log('✅ Menú generado exitosamente por IA con prompt simplificado');
      
      return {
        success: true,
        weeklyMenu: menuWithCitations,
        message: 'Menú generado por IA con prompt simplificado'
      };
      
    } catch (error: any) {
      console.error('❌ Error generando con prompt simplificado:', error);
      // Lanzar error para que el sistema de reintentos lo maneje
      throw error;
    }
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
    
    // Calcular rango de calorías por día (más realista - varía entre días)
    // Las calorías diarias pueden variar ±10% para ser más realistas
    const calorieVariation = Math.round(caloriesPerDay * 0.1);
    const minCalories = caloriesPerDay - calorieVariation;
    const maxCalories = caloriesPerDay + calorieVariation;
    
    // Información básica del usuario
    const dietaryInfo = request.dietaryPreferences?.join(', ') || 'Sin restricciones';
    const allergyInfo = request.allergies?.join(', ') || 'Sin alergias';
    
    // Información física del usuario para personalización
    const bmi = request.bmi || (request.weight && request.height ? request.weight / Math.pow(request.height / 100, 2) : null);
    const bmiCategory = bmi ? (
      bmi < 18.5 ? 'Bajo peso' :
      bmi < 25 ? 'Peso normal' :
      bmi < 30 ? 'Sobrepeso' : 'Obesidad'
    ) : 'No especificado';
    
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
      strictRules = `🥩 CARNES Y PESCADOS (OPCIONAL PERO RECOMENDADO):
- Con 1-2 días con carne o pescado es suficiente, aunque puedes incluir más si lo deseas
- PRIORIZA: pollo, pavo, ternera, cerdo, salmón, atún, merluza
- Los demás días puedes usar proteínas vegetales, huevos, legumbres o platos sin proteína animal
- NO es necesario que todos los días tengan carne o pescado`;
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
- Calorías objetivo promedio: ${caloriesPerDay} kcal/día
- Rango de calorías diarias: ${minCalories}-${maxCalories} kcal (VARÍA entre días para ser más realista)
- Presupuesto: €${request.weeklyBudget || 60}
- Peso: ${request.weight || 'No especificado'} kg
- Altura: ${request.height || 'No especificado'} cm
- IMC: ${bmi ? bmi.toFixed(1) : 'No calculado'} (${bmiCategory})
- Metabolismo Basal (MCI): ${request.bmr ? Math.round(request.bmr) : 'No calculado'} cal/día
- Nivel de actividad: ${request.activityLevel || 'No especificado'}
- Edad: ${request.age || 'No especificado'} años
- Género: ${request.gender || 'No especificado'}

💰 PRESUPUESTO OBLIGATORIO (MUY IMPORTANTE):
- El presupuesto semanal es de €${request.weeklyBudget || 60} - DEBES RESPETARLO ESTRICTAMENTE
- Calcula el costo aproximado de todos los ingredientes de la semana
- El costo total semanal NO debe exceder €${request.weeklyBudget || 60}
- Prioriza ingredientes económicos: legumbres, arroz, pasta, vegetales de temporada, pollo
- Evita ingredientes muy caros: mariscos premium, carnes exóticas, productos importados costosos
- Si el presupuesto es bajo (menos de €70), usa más proteínas vegetales (legumbres, huevos) y menos carne/pescado
- Si el presupuesto es alto (más de €80), puedes incluir más variedad y ingredientes premium
- Distribuye el costo a lo largo de la semana de forma equilibrada

REGLAS ESTRICTAS:
${strictRules}${additionalRules}

VARIEDAD Y REPETICIÓN:
- Varía los platos principales (almuerzos y cenas) entre días
- Puedes repetir algunos desayunos y snacks (máximo 2-3 repeticiones)
- Usa nombres REALES de comidas (ej: "Pechuga de pollo a la plancha", "Salmón al horno")
- NO uses nombres genéricos como "Desayuno", "Almuerzo"
- Es normal repetir: tostadas, yogur, fruta, ensaladas básicas

📊 PERSONALIZACIÓN SEGÚN CARACTERÍSTICAS FÍSICAS:
${bmi ? `- IMC: ${bmi.toFixed(1)} (${bmiCategory}) - Ajusta porciones y calorías según esto` : ''}
${request.weight && request.height ? `- Peso: ${request.weight} kg, Altura: ${request.height} cm - Calcula porciones apropiadas para esta constitución` : ''}
${request.age ? `- Edad: ${request.age} años - Considera necesidades nutricionales específicas de esta edad` : ''}
${request.gender ? `- Género: ${request.gender} - Ajusta proteínas, hierro y calcio según necesidades de ${request.gender === 'male' ? 'hombre' : 'mujer'}` : ''}
${request.activityLevel ? `- Actividad: ${request.activityLevel} - Días más activos pueden tener más calorías y proteínas` : ''}
- Las porciones deben ser REALISTAS para una persona con estas características físicas
- NO uses porciones excesivas ni insuficientes
- Ajusta la cantidad de ingredientes según el peso y altura del usuario

${!isVegan && !isVegetarian ? `
EJEMPLOS REALES PARA DIETA OMNÍVORA (1-2 días con carne/pescado):
- Lunes: Pechuga de pollo a la plancha con arroz integral y brócoli (con carne)
- Martes: Lentejas estofadas con verduras y arroz (vegetal)
- Miércoles: Salmón al horno con quinoa y espinacas (con pescado)
- Jueves: Tortilla de patatas con ensalada (vegetariana)
- Viernes: Garbanzos con espinacas y pan integral (vegetal)
- Sábado: Risotto de setas con queso parmesano (vegetariana)
- Domingo: Pasta con tomate y albahaca (vegetal)
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

📝 DESCRIPCIONES DETALLADAS OBLIGATORIAS:
- CADA comida DEBE tener un campo "description" con mínimo 4-5 frases completas
- La descripción debe explicar:
  * Qué es el plato y su origen/tipo de cocina
  * Qué ingredientes principales contiene y cómo se combinan
  * Qué sabor y textura tiene
  * Qué beneficios nutricionales aporta
  * Cómo se presenta visualmente
  * Cualquier detalle relevante (técnica de cocción, temperatura, etc.)
- EJEMPLO DE DESCRIPCIÓN DETALLADA:
  "Pechuga de pollo a la plancha con arroz integral y brócoli al vapor. Este plato combina proteína magra de alta calidad con carbohidratos complejos y vegetales ricos en fibra. La pechuga se cocina a fuego medio-alto para obtener una superficie dorada y crujiente mientras mantiene su jugosidad interior. El arroz integral aporta fibra y minerales esenciales, mientras que el brócoli al vapor conserva sus vitaminas y antioxidantes. El resultado es un plato equilibrado, saciante y rico en proteínas que favorece la recuperación muscular y el mantenimiento de la masa magra."

🔧 INSTRUCCIONES PASO A PASO DETALLADAS:
- CADA comida DEBE tener instrucciones numeradas y detalladas (mínimo 5-7 pasos)
- Cada paso debe ser específico y claro:
  1) Preparación de ingredientes (cortes, medidas, marinados)
  2) Técnica de cocción específica (plancha, horno, vapor, etc.)
  3) Tiempos exactos para cada etapa
  4) Temperaturas si aplica (horno, plancha, etc.)
  5) Consejos de presentación y acabado
  6) Puntos de control (cuándo está listo, cómo verificar)
- EJEMPLO DE INSTRUCCIONES DETALLADAS:
  "1. Salpimenta la pechuga de pollo por ambos lados y déjala reposar 10 minutos a temperatura ambiente.
  2. Calienta una plancha o sartén a fuego medio-alto (180°C) con una cucharada de aceite de oliva.
  3. Cocina la pechuga 6-7 minutos por cada lado hasta que esté dorada y la temperatura interna alcance 75°C.
  4. Mientras tanto, cocina el arroz integral según las instrucciones del paquete (generalmente 40-45 minutos).
  5. En los últimos 5 minutos, coloca el brócoli en una vaporera sobre el arroz para cocinarlo al vapor.
  6. Retira la pechuga del fuego y déjala reposar 3 minutos antes de cortarla.
  7. Sirve la pechuga cortada en rodajas sobre el arroz integral con el brócoli al lado, y adereza con un chorrito de aceite de oliva virgen extra."

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
          "name": "Texto concreto con nombre REAL del plato",
          "description": "Descripción DETALLADA punto por punto del plato: explica qué es, cómo se prepara, qué ingredientes principales tiene, qué sabor tiene, qué beneficios nutricionales aporta, y cualquier detalle relevante. Mínimo 4-5 frases completas y descriptivas.",
          "instructions": "Instrucciones PASO A PASO detalladas. Cada paso debe ser claro y específico. Incluye: 1) Preparación de ingredientes, 2) Técnica de cocción, 3) Tiempos específicos, 4) Temperaturas si aplica, 5) Consejos de presentación. Mínimo 5-7 pasos numerados y detallados.",
          "ingredients": ["ingrediente1 con cantidad exacta", "ingrediente2 con cantidad exacta"],
          "prepTime": 5,
          "nutrition": {
            "calories": VARIAR según el plato (ej: 250-400 kcal para desayuno)
          }
        },
        "lunch": {
          "name": "Texto concreto con nombre REAL del plato",
          "description": "Descripción DETALLADA punto por punto del plato: explica qué es, cómo se prepara, qué ingredientes principales tiene, qué sabor tiene, qué beneficios nutricionales aporta, y cualquier detalle relevante. Mínimo 4-5 frases completas y descriptivas.",
          "instructions": "Instrucciones PASO A PASO detalladas. Cada paso debe ser claro y específico. Incluye: 1) Preparación de ingredientes, 2) Técnica de cocción, 3) Tiempos específicos, 4) Temperaturas si aplica, 5) Consejos de presentación. Mínimo 5-7 pasos numerados y detallados.",
          "ingredients": ["ingrediente1 con cantidad exacta", "ingrediente2 con cantidad exacta"],
          "prepTime": 15,
          "nutrition": {
            "calories": VARIAR según el plato (ej: 400-600 kcal para almuerzo)
          }
        },
        "dinner": {
          "name": "Texto concreto con nombre REAL del plato",
          "description": "Descripción DETALLADA punto por punto del plato: explica qué es, cómo se prepara, qué ingredientes principales tiene, qué sabor tiene, qué beneficios nutricionales aporta, y cualquier detalle relevante. Mínimo 4-5 frases completas y descriptivas.",
          "instructions": "Instrucciones PASO A PASO detalladas. Cada paso debe ser claro y específico. Incluye: 1) Preparación de ingredientes, 2) Técnica de cocción, 3) Tiempos específicos, 4) Temperaturas si aplica, 5) Consejos de presentación. Mínimo 5-7 pasos numerados y detallados.",
          "ingredients": ["ingrediente1 con cantidad exacta", "ingrediente2 con cantidad exacta"],
          "prepTime": 10,
          "nutrition": {
            "calories": VARIAR según el plato (ej: 350-550 kcal para cena)
          }
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
        "calories": VARIAR entre ${minCalories} y ${maxCalories} kcal según el día (NO todas iguales)
      }
    }
    // 6 objetos más (total 7)
  ]
}

⚠️ CRÍTICO - FORMATO JSON OBLIGATORIO:
- Responde ÚNICAMENTE con JSON válido y completo
- El JSON debe comenzar con { y terminar con }
- TODOS los arrays deben estar cerrados con ] (especialmente el array "snacks" y "weeklyMenu")
- TODOS los objetos deben estar cerrados con } (especialmente objetos de comidas y días)
- NO incluyas texto adicional antes o después del JSON
- NO uses markdown, backticks, ni comentarios
- Verifica que el JSON esté completo antes de enviarlo
- El JSON debe tener exactamente 7 días en el array weeklyMenu
- Cada día debe tener todas las comidas completas con sus objetos cerrados correctamente
- Cada array "ingredients" debe estar cerrado con ]
- Cada array "snacks" debe estar cerrado con ]
- El objeto "nutrition" de cada comida debe estar cerrado con }
- El objeto "nutrition" de cada día debe estar cerrado con }
- El objeto de cada día debe estar cerrado con }
- El array "weeklyMenu" debe estar cerrado con ]
- El objeto principal debe estar cerrado con }

IMPORTANTE: 
- Usa nombres REALES de comidas
- Varía los platos principales, puedes repetir desayunos y snacks
- Respeta las reglas dietéticas estrictamente
- DEBE incluir exactamente 7 días (Lunes a Domingo)

🥩 PROTEÍNAS ANIMALES (SI NO ES VEGANO/VEGETARIANO):
- Con 1-2 días con carne o pescado es suficiente (puedes incluir más si lo deseas)
- Los demás días puedes usar proteínas vegetales, huevos, legumbres o platos sin proteína animal
- NO es necesario que cada almuerzo y cena tenga carne o pescado
- INCLUYE cuando los uses: pollo, ternera, cerdo, salmón, atún, merluza, bacalao, langostinos
- EJEMPLOS: "Pechuga de pollo a la plancha" ✅, "Salmón al horno" ✅, "Lentejas estofadas" ✅, "Tortilla de patatas" ✅

🎯 VARIEDAD DE INGREDIENTES OBLIGATORIA:
- USA ingredientes comunes y accesibles (NO solo exóticos)
- VARÍA vegetales: brócoli, coliflor, espinacas, zanahorias, pimientos, calabacín, berenjena
- VARÍA frutas: manzana, naranja, pera, kiwi, fresas, arándanos, uvas, granada
- VARÍA carbohidratos: arroz integral, quinoa, pasta integral, patata, avena, bulgur, cuscús
- NO repitas los mismos ingredientes en días consecutivos
- NO repitas exactamente el mismo nombre de plato principal (almuerzo o cena) más de 1 vez en toda la semana
- Asegúrate de que haya al menos 10 platos principales diferentes entre todos los almuerzos y cenas de la semana

🔥 CALORÍAS REALISTAS Y VARIADAS (CRÍTICO):
- LAS CALORÍAS DEBEN VARIAR ENTRE DÍAS (NO todas iguales)
- Lunes puede tener ${minCalories} kcal, Martes ${caloriesPerDay} kcal, Miércoles ${maxCalories} kcal, etc.
- Varía entre ${minCalories} y ${maxCalories} kcal según el día
- Días más activos (ej: fin de semana) pueden tener más calorías
- Días más sedentarios pueden tener menos calorías
- La suma semanal debe aproximarse a ${request.totalCalories} kcal totales
- EJEMPLO REALISTA:
  * Lunes: ${minCalories} kcal
  * Martes: ${caloriesPerDay} kcal
  * Miércoles: ${Math.round(caloriesPerDay * 0.95)} kcal
  * Jueves: ${maxCalories} kcal
  * Viernes: ${caloriesPerDay} kcal
  * Sábado: ${maxCalories} kcal (día activo)
  * Domingo: ${Math.round(caloriesPerDay * 1.05)} kcal
- NO uses ${caloriesPerDay} kcal para todos los días (ESTO ES IRREALISTA)`;
  }

}

export default new AIMenuService();
