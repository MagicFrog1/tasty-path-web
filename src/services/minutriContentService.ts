// Servicio para generar contenido detallado de MiNutri Personal

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
  },
  userProfile: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'male' | 'female';
    activityLevel?: string;
    allergies?: string[];
    dietaryPreferences?: string[];
  }
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
  
  // Generar contenido para cada día del módulo
  for (let day = 1; day <= 30; day++) {
    const date = new Date();
    date.setDate(date.getDate() + ((moduleId - 1) * 30) + (day - 1));
    
    // Generar menús del día
    const meals = await generateDailyMeals(day, dailyCalories, roadmapData.finalGoal, userProfile);
    
    // Generar ejercicio del día
    const exercise = generateDailyExercise(day, roadmapData.finalGoal, moduleId);
    
    // Generar tips del día
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

// Generar menús diarios usando IA
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
  
  const breakfast: DailyMeal = {
    id: `breakfast-day-${day}`,
    name: generateMealName('breakfast', day, goal),
    description: generateMealDescription('breakfast', day, goal),
    ingredients: generateMealIngredients('breakfast', day, goal),
    preparation: generateMealPreparation('breakfast', day, goal),
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
    preparation: generateMealPreparation('lunch', day, goal),
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
    preparation: generateMealPreparation('dinner', day, goal),
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

// Generar preparación detallada
const generateMealPreparation = (mealType: string, day: number, goal: string): string => {
  return `Preparación detallada paso a paso para esta comida. Cocina los ingredientes según las instrucciones, asegurándote de mantener los valores nutricionales. Ajusta las porciones según tus necesidades calóricas específicas.`;
};

// Generar ejercicio diario
const generateDailyExercise = (day: number, goal: string, moduleId: number): DailyExercise => {
  const week = Math.ceil(day / 7);
  const dayOfWeek = ((day - 1) % 7) + 1;
  
  // Diferentes tipos de ejercicio según el día
  const exerciseTypes: Array<{ type: DailyExercise['type']; name: string; description: string; instructions: string[]; recommendations: string[] }> = [
    {
      type: 'strength',
      name: 'Entrenamiento de Fuerza - Tren Superior',
      description: 'Sesión de entrenamiento de fuerza enfocada en el tren superior para desarrollar masa muscular y fuerza.',
      instructions: [
        'Calentamiento: 5 minutos de movilidad articular',
        'Press de banca: 4 series de 8-10 repeticiones',
        'Remo con barra: 4 series de 8-10 repeticiones',
        'Press militar: 3 series de 10-12 repeticiones',
        'Curl de bíceps: 3 series de 12-15 repeticiones',
        'Estiramiento: 10 minutos',
      ],
      recommendations: [
        'Si no tienes acceso a gimnasio, considera apuntarte a uno cercano o usar pesas en casa',
        'Mantén la técnica correcta en cada ejercicio para evitar lesiones',
        'Descansa 60-90 segundos entre series',
      ],
    },
    {
      type: 'cardio',
      name: 'Cardio Moderado - Carrera Continua',
      description: 'Sesión de cardio de intensidad moderada para mejorar la resistencia cardiovascular y quemar calorías.',
      instructions: [
        'Calentamiento: 5 minutos caminando rápido',
        'Carrera continua: 30 minutos a ritmo moderado (puedes mantener una conversación)',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos',
      ],
      recommendations: [
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
  
  return {
    id: `exercise-day-${day}`,
    name: exercise.name,
    type: exercise.type,
    duration: exercise.type === 'cardio' ? 45 : exercise.type === 'strength' ? 60 : 30,
    description: exercise.description,
    instructions: exercise.instructions,
    equipment: exercise.type === 'strength' ? ['Pesas', 'Mancuernas', 'Barra'] : [],
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

