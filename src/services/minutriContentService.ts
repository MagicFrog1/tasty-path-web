// Servicio para generar contenido detallado de MiNutri Personal
import AIMenuService, { AIMenuRequest } from './AIMenuService';
import { AI_CONFIG, isAIConfigured } from '../config/ai';

export interface DailyMeal {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  preparation: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  time: string; // "Desayuno", "Almuerzo", "Cena"
}

export interface DailyExercise {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  duration: number; // minutos
  description: string;
  instructions: string[];
  equipment?: string[];
  recommendations: string[];
}

export interface DailyContent {
  date: string;
  dayNumber: number;
  meals: {
    breakfast: DailyMeal;
    lunch: DailyMeal;
    dinner: DailyMeal;
  };
  exercise: DailyExercise;
  tips: string[];
  shoppingList: string[];
}

export interface ModuleContent {
  moduleId: number;
  days: DailyContent[];
  weeklyShoppingLists: { week: number; items: string[] }[];
}

// Generar contenido para un módulo completo (30 días)
export const generateModuleContent = async (
  moduleId: number,
  roadmapData: {
    finalGoal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance';
    targetValue: number;
    currentValue: number;
    timeframe: number;
    age?: number;
  },
  userProfile: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'male' | 'female';
    activityLevel?: string;
    allergies?: string[];
    dietaryPreferences?: string[];
  },
  onProgress?: (step: number, total: number, message: string) => void
): Promise<ModuleContent> => {
  const days: DailyContent[] = [];
  const weeklyShoppingLists: { week: number; items: string[] }[] = [];
  
  // Calcular objetivos nutricionales para este módulo
  const progressPerModule = Math.abs(roadmapData.targetValue - roadmapData.currentValue) / roadmapData.timeframe;
  const moduleTarget = roadmapData.finalGoal === 'weight_loss'
    ? roadmapData.currentValue - (progressPerModule * moduleId)
    : roadmapData.currentValue + (progressPerModule * moduleId);
  
  // Calcular calorías objetivo
  const bmr = userProfile.weight && userProfile.height && userProfile.age
    ? calculateBMR(userProfile.weight, userProfile.height, userProfile.age, userProfile.gender || 'male')
    : 2000;
  
  const activityMultiplier = getActivityMultiplier(userProfile.activityLevel || 'moderate');
  const tdee = bmr * activityMultiplier;
  
  let dailyCalories = tdee;
  if (roadmapData.finalGoal === 'weight_loss') {
    dailyCalories = tdee - 500; // Déficit de 500 calorías
  } else if (roadmapData.finalGoal === 'weight_gain' || roadmapData.finalGoal === 'muscle_gain') {
    dailyCalories = tdee + 300; // Superávit de 300 calorías
  }
  
  // Optimización: Generar menús por semanas (4 semanas de 7 días cada una)
  // Esto reduce las llamadas a la IA de 30 a solo 4
  if (onProgress) onProgress(1, 6, 'Generando plan mensual completo con ejercicios personalizados...');
  
  const weeksToGenerate = 4; // 4 semanas de 7 días = 28 días, luego agregamos 2 días más
  const allMeals: { breakfast: DailyMeal; lunch: DailyMeal; dinner: DailyMeal }[] = [];
  
  try {
    // Generar menús para cada semana (4 semanas)
    for (let week = 1; week <= weeksToGenerate; week++) {
      if (onProgress) {
        onProgress(week + 1, 6, `Generando menús para la semana ${week} de ${weeksToGenerate}...`);
      }
      
      // Una sola llamada a la IA para generar 7 días de menú para esta semana
      const aiResponse = await AIMenuService.generateWeeklyMenu({
        nutritionGoals: {
          protein: roadmapData.finalGoal === 'muscle_gain' ? Math.round(dailyCalories * 0.35 / 4) : 
                  roadmapData.finalGoal === 'weight_loss' ? Math.round(dailyCalories * 0.30 / 4) : 
                  Math.round(dailyCalories * 0.25 / 4),
          carbs: roadmapData.finalGoal === 'weight_loss' ? Math.round(dailyCalories * 0.35 / 4) : 
                 Math.round(dailyCalories * 0.45 / 4),
          fat: Math.round(dailyCalories * 0.25 / 9),
          fiber: 30,
        },
        totalCalories: dailyCalories,
        dietaryPreferences: userProfile.dietaryPreferences || [],
        allergies: userProfile.allergies || [],
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        gender: userProfile.gender,
        activityLevel: userProfile.activityLevel as any || 'moderate',
      });
      
      if (aiResponse.success && aiResponse.weeklyMenu && aiResponse.weeklyMenu.length > 0) {
        // Procesar los 7 días generados por la IA
        for (let dayInWeek = 0; dayInWeek < 7 && (week - 1) * 7 + dayInWeek + 1 <= 30; dayInWeek++) {
          const day = (week - 1) * 7 + dayInWeek + 1;
          if (day > 30) break;
          
          const dayMenu = aiResponse.weeklyMenu[dayInWeek] || aiResponse.weeklyMenu[0];
          const breakfastCalories = Math.round(dailyCalories * 0.25);
          const lunchCalories = Math.round(dailyCalories * 0.35);
          const dinnerCalories = Math.round(dailyCalories * 0.30);
          const proteinRatio = roadmapData.finalGoal === 'muscle_gain' ? 0.35 : 
                              roadmapData.finalGoal === 'weight_loss' ? 0.30 : 0.25;
          const carbsRatio = roadmapData.finalGoal === 'weight_loss' ? 0.35 : 0.45;
          const fatRatio = 0.25;
          
          const breakfast: DailyMeal = {
            id: `breakfast-day-${day}`,
            name: dayMenu.meals.breakfast?.name || `Desayuno Día ${day}`,
            description: dayMenu.meals.breakfast?.instructions || '',
            ingredients: dayMenu.meals.breakfast?.ingredients || [],
            preparation: dayMenu.meals.breakfast?.instructions || '',
            nutrition: {
              calories: dayMenu.meals.breakfast?.nutrition?.calories || breakfastCalories,
              protein: dayMenu.meals.breakfast?.nutrition?.protein || Math.round(breakfastCalories * proteinRatio / 4),
              carbs: dayMenu.meals.breakfast?.nutrition?.carbs || Math.round(breakfastCalories * carbsRatio / 4),
              fat: dayMenu.meals.breakfast?.nutrition?.fat || Math.round(breakfastCalories * fatRatio / 9),
            },
            time: 'Desayuno',
          };
          
          const lunch: DailyMeal = {
            id: `lunch-day-${day}`,
            name: dayMenu.meals.lunch?.name || `Almuerzo Día ${day}`,
            description: dayMenu.meals.lunch?.instructions || '',
            ingredients: dayMenu.meals.lunch?.ingredients || [],
            preparation: dayMenu.meals.lunch?.instructions || '',
            nutrition: {
              calories: dayMenu.meals.lunch?.nutrition?.calories || lunchCalories,
              protein: dayMenu.meals.lunch?.nutrition?.protein || Math.round(lunchCalories * proteinRatio / 4),
              carbs: dayMenu.meals.lunch?.nutrition?.carbs || Math.round(lunchCalories * carbsRatio / 4),
              fat: dayMenu.meals.lunch?.nutrition?.fat || Math.round(lunchCalories * fatRatio / 9),
            },
            time: 'Almuerzo',
          };
          
          const dinner: DailyMeal = {
            id: `dinner-day-${day}`,
            name: dayMenu.meals.dinner?.name || `Cena Día ${day}`,
            description: dayMenu.meals.dinner?.instructions || '',
            ingredients: dayMenu.meals.dinner?.ingredients || [],
            preparation: dayMenu.meals.dinner?.instructions || '',
            nutrition: {
              calories: dayMenu.meals.dinner?.nutrition?.calories || dinnerCalories,
              protein: dayMenu.meals.dinner?.nutrition?.protein || Math.round(dinnerCalories * proteinRatio / 4),
              carbs: dayMenu.meals.dinner?.nutrition?.carbs || Math.round(dinnerCalories * carbsRatio / 4),
              fat: dayMenu.meals.dinner?.nutrition?.fat || Math.round(dinnerCalories * fatRatio / 9),
            },
            time: 'Cena',
          };
          
          allMeals.push({ breakfast, lunch, dinner });
        }
      } else {
        // Fallback: generar menús básicos para esta semana
        for (let dayInWeek = 0; dayInWeek < 7 && (week - 1) * 7 + dayInWeek + 1 <= 30; dayInWeek++) {
          const day = (week - 1) * 7 + dayInWeek + 1;
          if (day > 30) break;
          const meals = await generateDailyMeals(day, dailyCalories, roadmapData.finalGoal, userProfile);
          allMeals.push(meals);
        }
      }
    }
    
    // Agregar 2 días adicionales si faltan (para completar 30 días)
    while (allMeals.length < 30) {
      const day = allMeals.length + 1;
      const meals = await generateDailyMeals(day, dailyCalories, roadmapData.finalGoal, userProfile);
      allMeals.push(meals);
    }
    
    if (onProgress) onProgress(6, 6, 'Finalizando plan mensual...');
    
  } catch (error) {
    console.error('Error generando plan mensual optimizado, usando fallback:', error);
    // Fallback: generar todos los días de forma básica si falla
    for (let day = 1; day <= 30; day++) {
      const meals = await generateDailyMeals(day, dailyCalories, roadmapData.finalGoal, userProfile);
      allMeals.push(meals);
    }
  }
  
  // Construir los días completos con ejercicios y tips
  for (let day = 1; day <= 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() + ((moduleId - 1) * 30) + (day - 1));
    
    const meals = allMeals[day - 1];
    const exercise = await generateDailyExercise(
      day, 
      roadmapData.finalGoal, 
      moduleId,
      {
        age: roadmapData.age || userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        gender: userProfile.gender,
        activityLevel: userProfile.activityLevel,
      }
    );
    const tips = generateDailyTips(day, roadmapData.finalGoal, moduleId);
    
    // Generar lista de compras (agregar ingredientes únicos)
    const shoppingItems = [
      ...meals.breakfast.ingredients,
      ...meals.lunch.ingredients,
      ...meals.dinner.ingredients,
    ].filter((item, index, self) => self.indexOf(item) === index);
    
    days.push({
      date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      dayNumber: day,
      meals,
      exercise,
      tips,
      shoppingList: shoppingItems,
    });
    
    // Agregar a lista semanal (cada 7 días)
    if (day % 7 === 0) {
      const weekItems: string[] = [];
      for (let i = day - 6; i <= day; i++) {
        if (days[i - 1]) {
          weekItems.push(...days[i - 1].shoppingList);
        }
      }
      weeklyShoppingLists.push({
        week: Math.ceil(day / 7),
        items: [...new Set(weekItems)],
      });
    }
  }
  
  return {
    moduleId,
    days,
    weeklyShoppingLists,
  };
};

// Generar menús diarios usando IA real
const generateDailyMeals = async (
  day: number,
  dailyCalories: number,
  goal: string,
  userProfile: any
): Promise<{ breakfast: DailyMeal; lunch: DailyMeal; dinner: DailyMeal }> => {
  // Distribuir calorías: 25% desayuno, 35% almuerzo, 30% cena, 10% snacks
  const breakfastCalories = Math.round(dailyCalories * 0.25);
  const lunchCalories = Math.round(dailyCalories * 0.35);
  const dinnerCalories = Math.round(dailyCalories * 0.30);
  
  // Calcular macros objetivo
  const proteinRatio = goal === 'muscle_gain' ? 0.35 : goal === 'weight_loss' ? 0.30 : 0.25;
  const carbsRatio = goal === 'weight_loss' ? 0.35 : 0.45;
  const fatRatio = 0.25;
  
  const totalProtein = Math.round(dailyCalories * proteinRatio / 4);
  const totalCarbs = Math.round(dailyCalories * carbsRatio / 4);
  const totalFat = Math.round(dailyCalories * fatRatio / 9);
  
  // Si la IA está configurada, usar generación real
  if (isAIConfigured()) {
    try {
      console.log(`🤖 Generando menú del día ${day} con IA...`);
      
      const aiRequest: AIMenuRequest = {
        nutritionGoals: {
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat,
          fiber: 30,
        },
        totalCalories: dailyCalories,
        dietaryPreferences: userProfile.dietaryPreferences || [],
        allergies: userProfile.allergies || [],
        weight: userProfile.weight,
        height: userProfile.height,
        age: userProfile.age,
        gender: userProfile.gender,
        activityLevel: userProfile.activityLevel || 'moderate',
      };
      
      // Generar menú semanal y tomar el día correspondiente
      const weekDay = ((day - 1) % 7) + 1;
      const aiResponse = await AIMenuService.generateWeeklyMenu(aiRequest);
      
      if (aiResponse.success && aiResponse.weeklyMenu && aiResponse.weeklyMenu.length > 0) {
        const dayMenu = aiResponse.weeklyMenu[weekDay - 1] || aiResponse.weeklyMenu[0];
        
        // Convertir formato de IA a formato de DailyMeal
        const breakfast: DailyMeal = {
          id: `breakfast-day-${day}`,
          name: dayMenu.meals.breakfast?.name || generateMealName('breakfast', day, goal),
          description: dayMenu.meals.breakfast?.instructions || generateMealDescription('breakfast', day, goal),
          ingredients: dayMenu.meals.breakfast?.ingredients || generateMealIngredients('breakfast', day, goal),
          preparation: dayMenu.meals.breakfast?.instructions || await generateMealPreparation('breakfast', day, goal, dayMenu.meals.breakfast?.name || 'Desayuno', dayMenu.meals.breakfast?.ingredients || []),
          nutrition: {
            calories: dayMenu.meals.breakfast?.nutrition?.calories || breakfastCalories,
            protein: dayMenu.meals.breakfast?.nutrition?.protein || Math.round(breakfastCalories * proteinRatio / 4),
            carbs: dayMenu.meals.breakfast?.nutrition?.carbs || Math.round(breakfastCalories * carbsRatio / 4),
            fat: dayMenu.meals.breakfast?.nutrition?.fat || Math.round(breakfastCalories * fatRatio / 9),
          },
          time: 'Desayuno',
        };
        
        const lunch: DailyMeal = {
          id: `lunch-day-${day}`,
          name: dayMenu.meals.lunch?.name || generateMealName('lunch', day, goal),
          description: dayMenu.meals.lunch?.instructions || generateMealDescription('lunch', day, goal),
          ingredients: dayMenu.meals.lunch?.ingredients || generateMealIngredients('lunch', day, goal),
          preparation: dayMenu.meals.lunch?.instructions || await generateMealPreparation('lunch', day, goal, dayMenu.meals.lunch?.name || 'Almuerzo', dayMenu.meals.lunch?.ingredients || []),
          nutrition: {
            calories: dayMenu.meals.lunch?.nutrition?.calories || lunchCalories,
            protein: dayMenu.meals.lunch?.nutrition?.protein || Math.round(lunchCalories * proteinRatio / 4),
            carbs: dayMenu.meals.lunch?.nutrition?.carbs || Math.round(lunchCalories * carbsRatio / 4),
            fat: dayMenu.meals.lunch?.nutrition?.fat || Math.round(lunchCalories * fatRatio / 9),
          },
          time: 'Almuerzo',
        };
        
        const dinner: DailyMeal = {
          id: `dinner-day-${day}`,
          name: dayMenu.meals.dinner?.name || generateMealName('dinner', day, goal),
          description: dayMenu.meals.dinner?.instructions || generateMealDescription('dinner', day, goal),
          ingredients: dayMenu.meals.dinner?.ingredients || generateMealIngredients('dinner', day, goal),
          preparation: dayMenu.meals.dinner?.instructions || await generateMealPreparation('dinner', day, goal, dayMenu.meals.dinner?.name || 'Cena', dayMenu.meals.dinner?.ingredients || []),
          nutrition: {
            calories: dayMenu.meals.dinner?.nutrition?.calories || dinnerCalories,
            protein: dayMenu.meals.dinner?.nutrition?.protein || Math.round(dinnerCalories * proteinRatio / 4),
            carbs: dayMenu.meals.dinner?.nutrition?.carbs || Math.round(dinnerCalories * carbsRatio / 4),
            fat: dayMenu.meals.dinner?.nutrition?.fat || Math.round(dinnerCalories * fatRatio / 9),
          },
          time: 'Cena',
        };
        
        console.log(`✅ Menú del día ${day} generado con IA`);
        return { breakfast, lunch, dinner };
      }
    } catch (error) {
      console.error(`❌ Error generando menú del día ${day} con IA:`, error);
      // Continuar con generación básica
    }
  }
  
  // Fallback: Generación básica si la IA no está disponible
  console.log(`📝 Usando generación básica para el día ${day}`);
  
  const breakfast: DailyMeal = {
    id: `breakfast-day-${day}`,
    name: generateMealName('breakfast', day, goal),
    description: generateMealDescription('breakfast', day, goal),
    ingredients: generateMealIngredients('breakfast', day, goal),
    preparation: await generateMealPreparation('breakfast', day, goal, generateMealName('breakfast', day, goal), generateMealIngredients('breakfast', day, goal)),
    nutrition: {
      calories: breakfastCalories,
      protein: Math.round(breakfastCalories * proteinRatio / 4),
      carbs: Math.round(breakfastCalories * carbsRatio / 4),
      fat: Math.round(breakfastCalories * fatRatio / 9),
    },
    time: 'Desayuno',
  };
  
  const lunch: DailyMeal = {
    id: `lunch-day-${day}`,
    name: generateMealName('lunch', day, goal),
    description: generateMealDescription('lunch', day, goal),
    ingredients: generateMealIngredients('lunch', day, goal),
    preparation: await generateMealPreparation('lunch', day, goal, generateMealName('lunch', day, goal), generateMealIngredients('lunch', day, goal)),
    nutrition: {
      calories: lunchCalories,
      protein: Math.round(lunchCalories * proteinRatio / 4),
      carbs: Math.round(lunchCalories * carbsRatio / 4),
      fat: Math.round(lunchCalories * fatRatio / 9),
    },
    time: 'Almuerzo',
  };
  
  const dinner: DailyMeal = {
    id: `dinner-day-${day}`,
    name: generateMealName('dinner', day, goal),
    description: generateMealDescription('dinner', day, goal),
    ingredients: generateMealIngredients('dinner', day, goal),
    preparation: await generateMealPreparation('dinner', day, goal, generateMealName('dinner', day, goal), generateMealIngredients('dinner', day, goal)),
    nutrition: {
      calories: dinnerCalories,
      protein: Math.round(dinnerCalories * proteinRatio / 4),
      carbs: Math.round(dinnerCalories * carbsRatio / 4),
      fat: Math.round(dinnerCalories * fatRatio / 9),
    },
    time: 'Cena',
  };
  
  return { breakfast, lunch, dinner };
};

// Generar nombres de comidas variados y profesionales
const generateMealName = (mealType: string, day: number, goal: string): string => {
  const breakfastNames = [
    'Avena con Frutos Rojos y Proteína',
    'Tostadas Integrales con Aguacate y Huevo',
    'Bowl de Yogur Griego y Granola',
    'Revuelto de Verduras y Queso',
    'Smoothie Bowl Proteico',
    'Tortilla de Espinacas y Champiñones',
    'Pancakes de Avena y Plátano',
  ];
  
  const lunchNames = [
    'Ensalada de Quinoa y Pollo a la Plancha',
    'Salmón al Horno con Verduras',
    'Bowl de Arroz Integral y Lentejas',
    'Pechuga de Pollo con Boniato',
    'Ensalada Mediterránea con Atún',
    'Pasta Integral con Verduras y Pesto',
    'Wrap de Pollo y Verduras',
  ];
  
  const dinnerNames = [
    'Pescado al Vapor con Verduras',
    'Pollo a la Plancha con Ensalada',
    'Crema de Verduras con Proteína',
    'Tortilla de Verduras y Queso',
    'Salmón con Brócoli al Vapor',
    'Ensalada Completa con Frutos Secos',
    'Calabacín Relleno de Carne',
  ];
  
  const names = mealType === 'breakfast' ? breakfastNames : mealType === 'lunch' ? lunchNames : dinnerNames;
  return names[(day - 1) % names.length];
};

// Generar descripciones detalladas de comidas
const generateMealDescription = (mealType: string, day: number, goal: string): string => {
  const descriptions = {
    breakfast: [
      'Un desayuno equilibrado rico en proteínas y carbohidratos complejos que te proporcionará energía sostenida durante toda la mañana. Perfecto para iniciar el día con fuerza.',
      'Combinación perfecta de proteínas de alta calidad, grasas saludables y carbohidratos de liberación lenta. Ideal para mantenerte saciado hasta el mediodía.',
      'Desayuno nutritivo diseñado para activar tu metabolismo y proporcionar los nutrientes esenciales para un rendimiento óptimo durante el día.',
    ],
    lunch: [
      'Almuerzo completo y balanceado que combina proteínas magras, carbohidratos complejos y verduras frescas. Perfecto para recargar energías a mitad del día.',
      'Comida nutritiva rica en proteínas y fibra que te mantendrá saciado y con energía estable durante la tarde.',
      'Almuerzo equilibrado diseñado para apoyar tus objetivos nutricionales mientras disfrutas de sabores deliciosos y variados.',
    ],
    dinner: [
      'Cena ligera pero nutritiva que favorece la recuperación y el descanso nocturno. Perfecta para cerrar el día de forma saludable.',
      'Cena balanceada rica en proteínas y verduras que apoya la regeneración muscular durante la noche.',
      'Cena nutritiva diseñada para mantener tu metabolismo activo mientras preparas tu cuerpo para un descanso reparador.',
    ],
  };
  
  const descs = descriptions[mealType as keyof typeof descriptions];
  return descs[(day - 1) % descs.length];
};

// Generar ingredientes detallados
const generateMealIngredients = (mealType: string, day: number, goal: string): string[] => {
  const baseIngredients = {
    breakfast: [
      ['Avena (50g)', 'Leche desnatada (200ml)', 'Fresas (100g)', 'Arándanos (50g)', 'Proteína en polvo (1 scoop)', 'Miel (1 cucharada)'],
      ['Pan integral (2 rebanadas)', 'Aguacate (1/2)', 'Huevo (2 unidades)', 'Tomate cherry (100g)', 'Aceite de oliva (1 cucharadita)'],
      ['Yogur griego (200g)', 'Granola (50g)', 'Plátano (1 unidad)', 'Nueces (20g)', 'Miel (1 cucharada)'],
    ],
    lunch: [
      ['Quinoa (80g)', 'Pechuga de pollo (150g)', 'Espinacas (100g)', 'Tomate (1 unidad)', 'Aceite de oliva (1 cucharada)', 'Limón'],
      ['Salmón (150g)', 'Brócoli (200g)', 'Zanahoria (1 unidad)', 'Aceite de oliva (1 cucharada)', 'Ajo', 'Limón'],
      ['Arroz integral (100g)', 'Lentejas (100g)', 'Cebolla (1/2)', 'Pimiento (1 unidad)', 'Aceite de oliva (1 cucharada)'],
    ],
    dinner: [
      ['Pescado blanco (150g)', 'Calabacín (1 unidad)', 'Tomate (1 unidad)', 'Aceite de oliva (1 cucharadita)', 'Hierbas frescas'],
      ['Pechuga de pollo (120g)', 'Lechuga (100g)', 'Tomate cherry (100g)', 'Pepino (1/2)', 'Aceite de oliva (1 cucharadita)'],
      ['Huevos (2 unidades)', 'Espinacas (100g)', 'Champiñones (100g)', 'Queso bajo en grasa (30g)', 'Aceite de oliva (1 cucharadita)'],
    ],
  };
  
  const ingredients = baseIngredients[mealType as keyof typeof baseIngredients];
  return ingredients[(day - 1) % ingredients.length];
};

// Generar preparación detallada con IA
const generateMealPreparation = async (mealType: string, day: number, goal: string, mealName: string, ingredients: string[]): Promise<string> => {
  if (isAIConfigured()) {
    try {
      const prompt = `Genera una receta detallada paso a paso en español para "${mealName}" con los siguientes ingredientes: ${ingredients.join(', ')}. 
      
El objetivo nutricional es: ${goal === 'weight_loss' ? 'pérdida de peso saludable' : goal === 'muscle_gain' ? 'ganancia de músculo' : 'mantenimiento'}.

La receta debe incluir:
1. Preparación paso a paso clara y concisa
2. Tiempo de cocción aproximado
3. Método de cocinado (horneado, plancha, vapor, etc.)
4. Consejos para mantener los valores nutricionales
5. Formato profesional y fácil de seguir

Responde SOLO con la receta, sin explicaciones adicionales.`;

      const response = await fetch(AI_CONFIG.OPENAI_BASE_URL + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Eres un chef nutricionista experto que crea recetas saludables, detalladas y fáciles de seguir.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const recipe = data.choices[0]?.message?.content?.trim();
        if (recipe) {
          return recipe;
        }
      }
    } catch (error) {
      console.error('Error generando preparación con IA:', error);
    }
  }
  
  // Fallback: Preparación básica
  return `Preparación detallada paso a paso para ${mealName}:

1. Prepara todos los ingredientes: ${ingredients.slice(0, 3).join(', ')}.
2. Cocina según el método apropiado (plancha, horno, vapor) manteniendo los valores nutricionales.
3. Ajusta las porciones según tus necesidades calóricas específicas.
4. Sirve caliente y disfruta de una comida nutritiva y equilibrada.

Tiempo estimado: 20-30 minutos.`;
};

// Generar ejercicio diario con IA personalizado
const generateDailyExercise = async (
  day: number, 
  goal: string, 
  moduleId: number,
  userProfile?: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: 'male' | 'female';
    activityLevel?: string;
  }
): Promise<DailyExercise> => {
  const week = Math.ceil(day / 7);
  const dayOfWeek = ((day - 1) % 7) + 1;
  
  // Intentar generar ejercicio personalizado con IA
  if (isAIConfigured() && userProfile) {
    try {
      console.log(`🤖 Generando ejercicio del día ${day} con IA personalizado...`);
      
      const exercisePrompt = `Genera un ejercicio personalizado para el día ${day} de un plan de ${goal === 'weight_loss' ? 'pérdida de peso' : goal === 'weight_gain' ? 'ganancia de peso' : goal === 'muscle_gain' ? 'ganancia de músculo' : 'mantenimiento'}.

PERFIL DEL USUARIO:
- Edad: ${userProfile.age || 'No especificada'} años
- Peso: ${userProfile.weight || 'No especificado'} kg
- Altura: ${userProfile.height || 'No especificada'} cm
- Género: ${userProfile.gender || 'No especificado'}
- Nivel de actividad: ${userProfile.activityLevel || 'moderado'}
- Objetivo: ${goal === 'weight_loss' ? 'Pérdida de peso' : goal === 'weight_gain' ? 'Ganancia de peso' : goal === 'muscle_gain' ? 'Ganancia de músculo' : 'Mantenimiento'}

CONTEXTO:
- Día ${day} del módulo ${moduleId}
- Semana ${week}
- Día de la semana: ${dayOfWeek === 1 ? 'Lunes' : dayOfWeek === 2 ? 'Martes' : dayOfWeek === 3 ? 'Miércoles' : dayOfWeek === 4 ? 'Jueves' : dayOfWeek === 5 ? 'Viernes' : dayOfWeek === 6 ? 'Sábado' : 'Domingo'}

INSTRUCCIONES:
1. Genera un ejercicio apropiado para la edad del usuario (${userProfile.age || 'adulto'})
2. Ajusta la intensidad según el nivel de actividad (${userProfile.activityLevel || 'moderado'})
3. Considera el objetivo: ${goal === 'weight_loss' ? 'Enfócate en cardio y quema de calorías' : goal === 'muscle_gain' ? 'Enfócate en fuerza y desarrollo muscular' : goal === 'weight_gain' ? 'Combina fuerza y cardio moderado' : 'Mantén un equilibrio'}
4. Varía el tipo de ejercicio según el día de la semana para evitar monotonía
5. Si el usuario es mayor de 60 años, prioriza ejercicios de bajo impacto
6. Si el usuario es menor de 18 años, evita ejercicios de alta intensidad sin supervisión

RESPONDE EN FORMATO JSON:
{
  "id": "exercise-day-${day}",
  "name": "Nombre del ejercicio",
  "type": "cardio" | "strength" | "flexibility" | "mixed",
  "duration": número en minutos,
  "description": "Descripción detallada del ejercicio y sus beneficios",
  "instructions": ["Instrucción 1", "Instrucción 2", ...],
  "equipment": ["Equipo necesario si aplica"],
  "recommendations": ["Recomendación 1", "Recomendación 2", ...]
}`;

      const response = await fetch(AI_CONFIG.OPENAI_BASE_URL + '/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un entrenador personal experto. Genera ejercicios personalizados, seguros y efectivos basados en el perfil del usuario. Responde SOLO con JSON válido, sin texto adicional.',
            },
            {
              role: 'user',
              content: exercisePrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        
        if (content) {
          // Intentar parsear JSON (puede venir con markdown)
          let exerciseData;
          try {
            // Remover markdown code blocks si existen
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            exerciseData = JSON.parse(jsonString);
            
            if (exerciseData.name && exerciseData.type && exerciseData.instructions) {
              console.log(`✅ Ejercicio del día ${day} generado con IA`);
              return {
                id: exerciseData.id || `exercise-day-${day}`,
                name: exerciseData.name,
                type: exerciseData.type as DailyExercise['type'],
                duration: exerciseData.duration || 45,
                description: exerciseData.description || '',
                instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions : [],
                equipment: Array.isArray(exerciseData.equipment) ? exerciseData.equipment : [],
                recommendations: Array.isArray(exerciseData.recommendations) ? exerciseData.recommendations : [],
              };
            }
          } catch (parseError) {
            console.error('Error parseando respuesta de IA:', parseError);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error generando ejercicio del día ${day} con IA:`, error);
      // Continuar con generación básica
    }
  }
  
  // Fallback: Generación básica personalizada según edad
  // Ajustar ejercicios según edad
  const userAge = userProfile?.age || 30;
  const isSenior = userAge >= 60;
  const isYoung = userAge < 18;
  
  // Diferentes tipos de ejercicio según el día
  const exerciseTypes: Array<{ type: DailyExercise['type']; name: string; description: string; instructions: string[]; recommendations: string[] }> = [
    {
      type: 'strength',
      name: isSenior ? 'Entrenamiento de Fuerza Suave - Tren Superior' : 'Entrenamiento de Fuerza - Tren Superior',
      description: isSenior 
        ? 'Sesión de entrenamiento de fuerza de baja intensidad enfocada en el tren superior, adaptada para adultos mayores.'
        : 'Sesión de entrenamiento de fuerza enfocada en el tren superior para desarrollar masa muscular y fuerza.',
      instructions: isSenior ? [
        'Calentamiento: 10 minutos de movilidad articular suave',
        'Press de pecho con mancuernas ligeras: 3 series de 12-15 repeticiones',
        'Remo sentado con banda elástica: 3 series de 12-15 repeticiones',
        'Elevaciones laterales: 3 series de 10-12 repeticiones',
        'Curl de bíceps con mancuernas ligeras: 3 series de 12-15 repeticiones',
        'Estiramiento: 15 minutos',
      ] : [
        'Calentamiento: 5 minutos de movilidad articular',
        'Press de banca: 4 series de 8-10 repeticiones',
        'Remo con barra: 4 series de 8-10 repeticiones',
        'Press militar: 3 series de 10-12 repeticiones',
        'Curl de bíceps: 3 series de 12-15 repeticiones',
        'Estiramiento: 10 minutos',
      ],
      recommendations: isSenior ? [
        'Usa pesos ligeros y enfócate en la técnica correcta',
        'Descansa 90-120 segundos entre series',
        'Si sientes dolor, detente inmediatamente',
        'Considera trabajar con un entrenador especializado en adultos mayores',
      ] : [
        'Si no tienes acceso a gimnasio, considera apuntarte a uno cercano o usar pesas en casa',
        'Mantén la técnica correcta en cada ejercicio para evitar lesiones',
        'Descansa 60-90 segundos entre series',
      ],
    },
    {
      type: 'cardio',
      name: isSenior ? 'Caminata Activa' : isYoung ? 'Cardio Moderado - Caminata/Carrera' : 'Cardio Moderado - Carrera Continua',
      description: isSenior
        ? 'Caminata activa de intensidad moderada adaptada para adultos mayores, ideal para mejorar la salud cardiovascular.'
        : isYoung
        ? 'Sesión de cardio moderada adaptada para jóvenes, combinando caminata y carrera ligera.'
        : 'Sesión de cardio de intensidad moderada para mejorar la resistencia cardiovascular y quemar calorías.',
      instructions: isSenior ? [
        'Calentamiento: 5 minutos caminando lento',
        'Caminata activa: 30-40 minutos a ritmo constante (puedes mantener una conversación)',
        'Enfriamiento: 5 minutos caminando lento',
        'Estiramiento: 15 minutos',
      ] : isYoung ? [
        'Calentamiento: 5 minutos caminando',
        'Alterna caminar 2 minutos y correr ligero 1 minuto: 20-25 minutos',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos',
      ] : [
        'Calentamiento: 5 minutos caminando rápido',
        'Carrera continua: 30 minutos a ritmo moderado (puedes mantener una conversación)',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos',
      ],
      recommendations: isSenior ? [
        'Camina en terreno plano y seguro',
        'Usa zapatillas cómodas con buen soporte',
        'Hidrátate antes y después del ejercicio',
        'Si sientes mareos o fatiga, detente y descansa',
      ] : isYoung ? [
        'Sal a caminar/correr al aire libre con supervisión si es necesario',
        'Usa zapatillas adecuadas para correr',
        'Hidrátate antes, durante y después del ejercicio',
        'No te esfuerces demasiado, ve a tu ritmo',
      ] : [
        'Sal a correr al aire libre o usa una cinta en el gimnasio',
        'Si eres principiante, alterna caminar y correr',
        'Usa zapatillas adecuadas para correr',
        'Hidrátate antes, durante y después del ejercicio',
      ],
    },
    {
      type: 'strength',
      name: 'Entrenamiento de Fuerza - Tren Inferior',
      description: 'Sesión de entrenamiento de fuerza enfocada en el tren inferior para desarrollar piernas y glúteos.',
      instructions: [
        'Calentamiento: 5 minutos de movilidad articular',
        'Sentadillas: 4 series de 10-12 repeticiones',
        'Peso muerto: 4 series de 8-10 repeticiones',
        'Prensa de piernas: 3 series de 12-15 repeticiones',
        'Zancadas: 3 series de 12 repeticiones por pierna',
        'Estiramiento: 10 minutos',
      ],
      recommendations: [
        'Asegúrate de tener la técnica correcta antes de aumentar el peso',
        'Considera trabajar con un entrenador personal para aprender la forma correcta',
        'Descansa 60-90 segundos entre series',
      ],
    },
    {
      type: 'mixed',
      name: 'Entrenamiento Funcional Completo',
      description: 'Sesión combinada de fuerza y cardio para un entrenamiento completo y eficiente.',
      instructions: [
        'Calentamiento: 5 minutos de movilidad',
        'Circuito 1: 3 rondas (Burpees x10, Sentadillas x15, Flexiones x10)',
        'Circuito 2: 3 rondas (Mountain climbers x20, Plancha x30s, Zancadas x12)',
        'Cardio: 15 minutos de bicicleta o elíptica',
        'Estiramiento: 10 minutos',
      ],
      recommendations: [
        'Puedes hacer este entrenamiento en casa o en el gimnasio',
        'Ajusta la intensidad según tu nivel de condición física',
        'Mantén un ritmo constante durante los circuitos',
      ],
    },
    {
      type: 'cardio',
      name: 'HIIT - Entrenamiento de Alta Intensidad',
      description: 'Sesión de entrenamiento de intervalos de alta intensidad para maximizar la quema de calorías.',
      instructions: [
        'Calentamiento: 5 minutos',
        'Intervalos: 8 rondas de 30 segundos de alta intensidad + 60 segundos de descanso',
        'Ejercicios: Burpees, Mountain climbers, Saltos, Escaladores',
        'Enfriamiento: 5 minutos',
        'Estiramiento: 10 minutos',
      ],
      recommendations: [
        'Este entrenamiento es intenso, asegúrate de estar bien hidratado',
        'Si eres principiante, reduce la intensidad o duración',
        'Escucha a tu cuerpo y descansa si es necesario',
      ],
    },
    {
      type: 'flexibility',
      name: 'Yoga y Estiramiento',
      description: 'Sesión de yoga y estiramiento para mejorar la flexibilidad y recuperación muscular.',
      instructions: [
        'Calentamiento suave: 5 minutos',
        'Saludo al sol: 3 rondas',
        'Posturas de yoga: 20 minutos (Guerrero, Triángulo, Perro boca abajo)',
        'Estiramiento profundo: 15 minutos',
        'Relajación: 5 minutos',
      ],
      recommendations: [
        'Puedes seguir una clase de yoga online o en un estudio',
        'Usa una esterilla cómoda',
        'Respira profundamente durante cada postura',
        'No fuerces las posturas, ve a tu ritmo',
      ],
    },
    {
      type: 'cardio',
      name: 'Caminata Activa o Senderismo',
      description: 'Actividad cardiovascular de baja intensidad perfecta para la recuperación activa.',
      instructions: [
        'Caminata rápida: 45-60 minutos',
        'Mantén un ritmo constante que eleve tu frecuencia cardíaca',
        'Si es posible, incluye algunas cuestas',
        'Estiramiento: 10 minutos al finalizar',
      ],
      recommendations: [
        'Sal a caminar al aire libre, preferiblemente en un parque o zona verde',
        'Usa ropa cómoda y zapatillas adecuadas',
        'Lleva agua contigo',
        'Aprovecha para desconectar y disfrutar del entorno',
      ],
    },
  ];
  
  const exercise = exerciseTypes[(dayOfWeek - 1) % exerciseTypes.length];
  
  // Ajustar duración según edad
  let duration = exercise.type === 'cardio' ? 45 : exercise.type === 'strength' ? 60 : 30;
  if (isSenior) {
    duration = Math.round(duration * 0.8); // Reducir 20% para adultos mayores
  } else if (isYoung) {
    duration = Math.round(duration * 0.9); // Reducir 10% para jóvenes
  }
  
  return {
    id: `exercise-day-${day}`,
    name: exercise.name,
    type: exercise.type,
    duration,
    description: exercise.description,
    instructions: exercise.instructions,
    equipment: exercise.type === 'strength' ? (isSenior ? ['Mancuernas ligeras', 'Bandas elásticas'] : ['Pesas', 'Mancuernas', 'Barra']) : [],
    recommendations: exercise.recommendations,
  };
};

// Generar tips diarios
const generateDailyTips = (day: number, goal: string, moduleId: number): string[] => {
  const tips = [
    'Bebe al menos 2-3 litros de agua durante el día para mantenerte hidratado',
    'Planifica tus comidas del día siguiente antes de acostarte',
    'Duerme al menos 7-8 horas para una recuperación óptima',
    'Mantén un registro de tu progreso para mantener la motivación',
    'Incluye proteína en cada comida para mantener la saciedad',
    'Evita las distracciones durante las comidas, come con atención plena',
    'Prepara snacks saludables para evitar tentaciones',
  ];
  
  return [tips[(day - 1) % tips.length]];
};

// Funciones auxiliares
const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const getActivityMultiplier = (activityLevel: string): number => {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel] || 1.55;
};

