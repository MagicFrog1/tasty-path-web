// Servicio de IA para MiNutri Personal - Generación de menús, ejercicios y recomendaciones

import AIMenuService from './AIMenuService';

export interface DailyMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  image?: string;
}

export interface DailyMenu {
  date: string;
  day: number;
  meals: DailyMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  shoppingList: string[];
}

export interface ExercisePlan {
  day: number;
  type: 'strength' | 'cardio' | 'rest' | 'flexibility';
  name: string;
  description: string;
  duration: number; // minutos
  exercises: Exercise[];
  tips: string[];
  equipment?: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number; // segundos
  description: string;
  muscleGroups: string[];
}

export interface Recommendation {
  type: 'gym' | 'running' | 'home' | 'nutrition' | 'lifestyle';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

const minutriAIService = {
  // Generar menú diario basado en el objetivo del módulo
  generateDailyMenu: async (
    day: number,
    moduleGoal: string,
    currentWeight: number,
    targetWeight: number,
    preferences: any,
    restrictions: any
  ): Promise<DailyMenu> => {
    // Calcular necesidades calóricas y macronutrientes
    const isWeightLoss = targetWeight < currentWeight;
    const weeklyDeficit = Math.abs(targetWeight - currentWeight) / 12; // kg por semana objetivo
    const dailyDeficit = weeklyDeficit * 7700 / 7; // calorías por día
    
    // Calcular TDEE aproximado (simplificado)
    const bmr = 10 * currentWeight + 6.25 * 175 - 5 * 30 + 5; // Fórmula simplificada
    const tdee = bmr * 1.5; // Actividad moderada
    const targetCalories = isWeightLoss ? tdee - dailyDeficit : tdee + (dailyDeficit * 0.5);
    
    // Distribución de macronutrientes
    const proteinGrams = currentWeight * 1.8; // 1.8g por kg para preservar músculo
    const proteinCalories = proteinGrams * 4;
    const fatGrams = (targetCalories * 0.25) / 9; // 25% de calorías de grasa
    const fatCalories = fatGrams * 9;
    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbGrams = carbCalories / 4;

    // Generar menú usando el servicio de IA
    try {
      const menuRequest = {
        goal: moduleGoal,
        days: 1,
        preferences: preferences || {},
        restrictions: restrictions || {},
        targetCalories: Math.round(targetCalories),
        targetProtein: Math.round(proteinGrams),
        targetCarbs: Math.round(carbGrams),
        targetFats: Math.round(fatGrams),
      };

      const aiResponse = await AIMenuService.generateMenu(menuRequest as any);
      
      // Procesar respuesta y crear estructura de menú diario
      const meals: DailyMeal[] = [];
      const shoppingList: string[] = [];

      if (aiResponse.meals && aiResponse.meals.length > 0) {
        aiResponse.meals.forEach((meal: any, index: number) => {
          const mealType = index === 0 ? 'breakfast' : index === 1 ? 'lunch' : 'dinner';
          
          meals.push({
            id: `meal-${day}-${index}`,
            type: mealType,
            name: meal.name || `Comida ${index + 1}`,
            description: meal.description || meal.instructions || 'Plato nutritivo y balanceado',
            calories: meal.calories || Math.round(targetCalories / 3),
            protein: meal.protein || Math.round(proteinGrams / 3),
            carbs: meal.carbs || Math.round(carbGrams / 3),
            fats: meal.fats || Math.round(fatGrams / 3),
            ingredients: meal.ingredients || [],
            instructions: meal.instructions || meal.description || 'Sigue las instrucciones del plan',
            prepTime: meal.prepTime || 30,
            image: meal.image,
          });

          // Agregar ingredientes a la lista de compras
          if (meal.ingredients) {
            meal.ingredients.forEach((ing: string) => {
              if (!shoppingList.includes(ing)) {
                shoppingList.push(ing);
              }
            });
          }
        });
      } else {
        // Menú por defecto si la IA no responde
        meals.push(
          {
            id: `meal-${day}-0`,
            type: 'breakfast',
            name: 'Desayuno Proteico',
            description: 'Desayuno rico en proteínas para mantener la masa muscular y energía sostenida',
            calories: Math.round(targetCalories * 0.25),
            protein: Math.round(proteinGrams * 0.3),
            carbs: Math.round(carbGrams * 0.25),
            fats: Math.round(fatGrams * 0.3),
            ingredients: ['Huevos', 'Avena', 'Plátano', 'Almendras'],
            instructions: 'Prepara 2 huevos revueltos, avena con plátano y un puñado de almendras',
            prepTime: 15,
          },
          {
            id: `meal-${day}-1`,
            type: 'lunch',
            name: 'Almuerzo Balanceado',
            description: 'Almuerzo completo con proteína magra, carbohidratos complejos y verduras',
            calories: Math.round(targetCalories * 0.40),
            protein: Math.round(proteinGrams * 0.40),
            carbs: Math.round(carbGrams * 0.40),
            fats: Math.round(fatGrams * 0.35),
            ingredients: ['Pechuga de pollo', 'Arroz integral', 'Brócoli', 'Aceite de oliva'],
            instructions: 'Cocina 150g de pechuga de pollo, 100g de arroz integral y brócoli al vapor',
            prepTime: 30,
          },
          {
            id: `meal-${day}-2`,
            type: 'dinner',
            name: 'Cena Ligera',
            description: 'Cena nutritiva y ligera para favorecer la recuperación durante la noche',
            calories: Math.round(targetCalories * 0.35),
            protein: Math.round(proteinGrams * 0.30),
            carbs: Math.round(carbGrams * 0.35),
            fats: Math.round(fatGrams * 0.35),
            ingredients: ['Salmón', 'Ensalada mixta', 'Quinoa', 'Aguacate'],
            instructions: 'Prepara 120g de salmón a la plancha, ensalada mixta y 80g de quinoa',
            prepTime: 25,
          }
        );
      }

      return {
        date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
        day,
        meals,
        totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
        totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
        totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
        totalFats: meals.reduce((sum, m) => sum + m.fats, 0),
        shoppingList,
      };
    } catch (error) {
      console.error('Error generando menú diario:', error);
      // Retornar menú por defecto en caso de error
      return this.generateDefaultMenu(day, targetCalories, proteinGrams, carbGrams, fatGrams);
    }
  },

  generateDefaultMenu: (day: number, calories: number, protein: number, carbs: number, fats: number): DailyMenu => {
    const meals: DailyMeal[] = [
      {
        id: `meal-${day}-0`,
        type: 'breakfast',
        name: 'Desayuno Completo',
        description: 'Desayuno nutritivo con proteínas de alta calidad, carbohidratos complejos y grasas saludables para comenzar el día con energía',
        calories: Math.round(calories * 0.25),
        protein: Math.round(protein * 0.3),
        carbs: Math.round(carbs * 0.25),
        fats: Math.round(fats * 0.3),
        ingredients: ['Huevos', 'Avena', 'Plátano', 'Almendras', 'Miel'],
        instructions: '1. Cocina 2 huevos revueltos con una pizca de sal. 2. Prepara 50g de avena con 200ml de leche o agua. 3. Añade medio plátano en rodajas y un puñado de almendras. 4. Endulza con una cucharadita de miel si lo deseas.',
        prepTime: 15,
      },
      {
        id: `meal-${day}-1`,
        type: 'lunch',
        name: 'Almuerzo Nutritivo',
        description: 'Almuerzo balanceado con proteína magra, carbohidratos de liberación lenta y verduras ricas en fibra y micronutrientes',
        calories: Math.round(calories * 0.40),
        protein: Math.round(protein * 0.40),
        carbs: Math.round(carbs * 0.40),
        fats: Math.round(fats * 0.35),
        ingredients: ['Pechuga de pollo', 'Arroz integral', 'Brócoli', 'Aceite de oliva', 'Limón'],
        instructions: '1. Cocina 150g de pechuga de pollo a la plancha con especias. 2. Hierve 100g de arroz integral. 3. Cocina brócoli al vapor. 4. Aliña con aceite de oliva y limón.',
        prepTime: 30,
      },
      {
        id: `meal-${day}-2`,
        type: 'dinner',
        name: 'Cena Equilibrada',
        description: 'Cena ligera pero nutritiva con proteína de pescado, carbohidratos complejos y verduras para favorecer la recuperación nocturna',
        calories: Math.round(calories * 0.35),
        protein: Math.round(protein * 0.30),
        carbs: Math.round(carbs * 0.35),
        fats: Math.round(fats * 0.35),
        ingredients: ['Salmón', 'Ensalada mixta', 'Quinoa', 'Aguacate', 'Tomate'],
        instructions: '1. Cocina 120g de salmón a la plancha. 2. Prepara una ensalada mixta con lechuga, tomate y aguacate. 3. Cocina 80g de quinoa. 4. Aliña con aceite de oliva y vinagre.',
        prepTime: 25,
      },
    ];

    return {
      date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      day,
      meals,
      totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
      totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
      totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
      totalFats: meals.reduce((sum, m) => sum + m.fats, 0),
      shoppingList: ['Huevos', 'Avena', 'Plátano', 'Almendras', 'Miel', 'Pechuga de pollo', 'Arroz integral', 'Brócoli', 'Aceite de oliva', 'Limón', 'Salmón', 'Ensalada mixta', 'Quinoa', 'Aguacate', 'Tomate'],
    };
  },

  // Generar plan de ejercicios semanal
  generateExercisePlan: (week: number, goal: string, currentWeight: number): ExercisePlan[] => {
    const plans: ExercisePlan[] = [];
    
    // Plan semanal de 5 días de entrenamiento
    const weeklyPlan = [
      { day: 1, type: 'strength' as const, name: 'Entrenamiento de Fuerza - Tren Superior' },
      { day: 2, type: 'cardio' as const, name: 'Cardio Moderado' },
      { day: 3, type: 'strength' as const, name: 'Entrenamiento de Fuerza - Tren Inferior' },
      { day: 4, type: 'rest' as const, name: 'Día de Descanso Activo' },
      { day: 5, type: 'strength' as const, name: 'Entrenamiento Full Body' },
      { day: 6, type: 'cardio' as const, name: 'Cardio Intenso' },
      { day: 7, type: 'flexibility' as const, name: 'Estiramientos y Movilidad' },
    ];

    weeklyPlan.forEach((plan, index) => {
      const dayNumber = week * 7 + index + 1;
      
      if (plan.type === 'strength') {
        plans.push({
          day: dayNumber,
          type: plan.type,
          name: plan.name,
          description: plan.name === 'Tren Superior' 
            ? 'Entrenamiento enfocado en desarrollar fuerza y masa muscular del tren superior (pecho, espalda, hombros, brazos)'
            : plan.name === 'Tren Inferior'
            ? 'Entrenamiento enfocado en desarrollar fuerza y masa muscular del tren inferior (piernas, glúteos)'
            : 'Entrenamiento completo que trabaja todo el cuerpo para maximizar el desarrollo muscular y la quema de calorías',
          duration: 60,
          exercises: plan.name.includes('Superior') ? [
            {
              name: 'Press de Banca',
              sets: 4,
              reps: '8-10',
              rest: 120,
              description: 'Ejercicio fundamental para desarrollar el pecho, hombros y tríceps. Acuéstate en el banco, baja la barra hasta el pecho y empuja hacia arriba con control.',
              muscleGroups: ['Pecho', 'Hombros', 'Tríceps'],
            },
            {
              name: 'Remo con Barra',
              sets: 4,
              reps: '8-10',
              rest: 90,
              description: 'Ejercicio excelente para desarrollar la espalda. Inclínate ligeramente, tira de la barra hacia el abdomen manteniendo la espalda recta.',
              muscleGroups: ['Espalda', 'Bíceps'],
            },
            {
              name: 'Press Militar',
              sets: 3,
              reps: '10-12',
              rest: 90,
              description: 'Desarrolla los hombros y tríceps. De pie, empuja la barra desde los hombros hacia arriba.',
              muscleGroups: ['Hombros', 'Tríceps'],
            },
            {
              name: 'Curl de Bíceps',
              sets: 3,
              reps: '12-15',
              rest: 60,
              description: 'Aísla el bíceps. De pie, flexiona los brazos llevando las mancuernas hacia los hombros.',
              muscleGroups: ['Bíceps'],
            },
          ] : plan.name.includes('Inferior') ? [
            {
              name: 'Sentadillas',
              sets: 4,
              reps: '10-12',
              rest: 120,
              description: 'El rey de los ejercicios para piernas. Baja como si te sentaras en una silla, mantén las rodillas alineadas con los pies.',
              muscleGroups: ['Cuádriceps', 'Glúteos'],
            },
            {
              name: 'Peso Muerto',
              sets: 4,
              reps: '8-10',
              rest: 120,
              description: 'Ejercicio completo que trabaja toda la cadena posterior. Mantén la espalda recta y levanta la barra desde el suelo.',
              muscleGroups: ['Espalda', 'Glúteos', 'Isquiotibiales'],
            },
            {
              name: 'Prensa de Piernas',
              sets: 3,
              reps: '12-15',
              rest: 90,
              description: 'Ejercicio seguro y efectivo para las piernas. Empuja el peso con las piernas manteniendo los pies separados al ancho de los hombros.',
              muscleGroups: ['Cuádriceps', 'Glúteos'],
            },
            {
              name: 'Extensiones de Pierna',
              sets: 3,
              reps: '15-20',
              rest: 60,
              description: 'Aísla el cuádriceps. Siéntate en la máquina y extiende las piernas contra la resistencia.',
              muscleGroups: ['Cuádriceps'],
            },
          ] : [
            {
              name: 'Sentadillas',
              sets: 3,
              reps: '12-15',
              rest: 90,
              description: 'Ejercicio fundamental para todo el cuerpo',
              muscleGroups: ['Cuádriceps', 'Glúteos'],
            },
            {
              name: 'Press de Banca',
              sets: 3,
              reps: '10-12',
              rest: 90,
              description: 'Desarrolla el tren superior',
              muscleGroups: ['Pecho', 'Hombros'],
            },
            {
              name: 'Remo',
              sets: 3,
              reps: '10-12',
              rest: 90,
              description: 'Fortalece la espalda',
              muscleGroups: ['Espalda', 'Bíceps'],
            },
            {
              name: 'Plancha',
              sets: 3,
              reps: '30-60 seg',
              rest: 60,
              description: 'Fortalece el core',
              muscleGroups: ['Core'],
            },
          ],
          tips: [
            'Calienta 5-10 minutos antes de entrenar',
            'Mantén la forma correcta en todos los ejercicios',
            'Progresa gradualmente en peso y repeticiones',
            'Descansa adecuadamente entre series',
            'Hidrátate durante el entrenamiento',
          ],
          equipment: ['Barra', 'Mancuernas', 'Banco', 'Máquinas'],
        });
      } else if (plan.type === 'cardio') {
        plans.push({
          day: dayNumber,
          type: plan.type,
          name: plan.name,
          description: plan.name.includes('Moderado')
            ? 'Cardio de intensidad moderada para mejorar la resistencia cardiovascular y quemar calorías de forma sostenida'
            : 'Cardio de alta intensidad para maximizar la quema de calorías y mejorar la condición física',
          duration: plan.name.includes('Moderado') ? 30 : 45,
          exercises: [
            {
              name: plan.name.includes('Moderado') ? 'Carrera Continua' : 'HIIT',
              sets: 1,
              reps: plan.name.includes('Moderado') ? '30 min' : '20 min',
              rest: 0,
              description: plan.name.includes('Moderado')
                ? 'Corre a un ritmo constante donde puedas mantener una conversación. Ideal para mejorar la resistencia.'
                : 'Entrenamiento de intervalos de alta intensidad: 30 segundos de esfuerzo máximo seguidos de 30 segundos de descanso activo.',
              muscleGroups: ['Cardiovascular', 'Piernas'],
            },
          ],
          tips: [
            'Mantén un ritmo constante y controlado',
            'Respira de forma rítmica',
            'Usa calzado adecuado para correr',
            'Hidrátate antes, durante y después',
            plan.name.includes('Moderado') 
              ? 'Puedes alternar entre correr y caminar si es necesario'
              : 'Escucha a tu cuerpo y ajusta la intensidad si es necesario',
          ],
          equipment: ['Calzado deportivo', 'Ropa cómoda'],
        });
      } else if (plan.type === 'rest') {
        plans.push({
          day: dayNumber,
          type: plan.type,
          name: plan.name,
          description: 'Día de recuperación activa para permitir que el cuerpo se recupere y se adapte al entrenamiento',
          duration: 20,
          exercises: [
            {
              name: 'Caminata Ligera',
              sets: 1,
              reps: '20-30 min',
              rest: 0,
              description: 'Caminata a ritmo suave para promover la recuperación y mejorar la circulación',
              muscleGroups: ['Cardiovascular'],
            },
            {
              name: 'Estiramientos Suaves',
              sets: 1,
              reps: '10-15 min',
              rest: 0,
              description: 'Estiramientos estáticos suaves para mejorar la flexibilidad y reducir la tensión muscular',
              muscleGroups: ['Todo el cuerpo'],
            },
          ],
          tips: [
            'No hagas ejercicio intenso este día',
            'Mantente activo pero relajado',
            'Duerme bien para optimizar la recuperación',
            'Hidrátate y come bien',
            'Puedes hacer yoga o meditación',
          ],
        });
      } else {
        plans.push({
          day: dayNumber,
          type: plan.type,
          name: plan.name,
          description: 'Sesión de estiramientos y movilidad para mejorar la flexibilidad, prevenir lesiones y promover la recuperación',
          duration: 30,
          exercises: [
            {
              name: 'Estiramiento de Cuádriceps',
              sets: 2,
              reps: '30 seg cada pierna',
              rest: 30,
              description: 'De pie, flexiona una pierna llevando el talón hacia el glúteo. Mantén 30 segundos.',
              muscleGroups: ['Cuádriceps'],
            },
            {
              name: 'Estiramiento de Isquiotibiales',
              sets: 2,
              reps: '30 seg cada pierna',
              rest: 30,
              description: 'Sentado, extiende una pierna y estírate hacia adelante. Mantén 30 segundos.',
              muscleGroups: ['Isquiotibiales'],
            },
            {
              name: 'Estiramiento de Hombros',
              sets: 2,
              reps: '30 seg cada brazo',
              rest: 30,
              description: 'Lleva un brazo cruzado sobre el pecho y tira suavemente con el otro brazo.',
              muscleGroups: ['Hombros'],
            },
            {
              name: 'Movilidad de Cadera',
              sets: 2,
              reps: '10 repeticiones',
              rest: 30,
              description: 'Realiza círculos con las caderas en ambas direcciones para mejorar la movilidad.',
              muscleGroups: ['Cadera'],
            },
          ],
          tips: [
            'Realiza los estiramientos de forma suave y controlada',
            'No fuerces más allá de tu rango de movimiento',
            'Respira profundamente durante los estiramientos',
            'Mantén cada estiramiento al menos 30 segundos',
            'Haz esto regularmente para mejorar la flexibilidad',
          ],
        });
      }
    });

    return plans;
  },

  // Generar recomendaciones personalizadas
  generateRecommendations: (adherence: number, currentDay: number, goal: string): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (adherence < 70) {
      recommendations.push({
        type: 'lifestyle',
        title: 'Mejora tu Planificación',
        description: 'Tu adherencia es del ' + adherence + '%. Planifica tus comidas del día siguiente antes de acostarte para mejorar la consistencia.',
        action: 'Establece recordatorios en tu teléfono para las comidas',
        priority: 'high',
      });
    }

    if (currentDay > 7 && adherence < 80) {
      recommendations.push({
        type: 'gym',
        title: 'Considera Apuntarte al Gimnasio',
        description: 'Un gimnasio te proporcionará el equipo necesario y un ambiente motivador para mantener la consistencia en tus entrenamientos.',
        action: 'Busca gimnasios cerca de ti y solicita una visita de prueba',
        priority: 'medium',
      });
    }

    if (currentDay % 3 === 0) {
      recommendations.push({
        type: 'running',
        title: 'Sal a Correr',
        description: 'Correr al aire libre mejora no solo tu condición física sino también tu bienestar mental. Es una excelente forma de cardio.',
        action: 'Programa 2-3 sesiones de running por semana de 20-30 minutos',
        priority: 'medium',
      });
    }

    if (adherence > 85) {
      recommendations.push({
        type: 'nutrition',
        title: '¡Excelente Progreso!',
        description: 'Tu adherencia del ' + adherence + '% es excelente. Mantén este ritmo y verás resultados consistentes.',
        action: 'Continúa con tu plan y considera aumentar la intensidad del ejercicio',
        priority: 'low',
      });
    }

    return recommendations;
  },
};

export default minutriAIService;

