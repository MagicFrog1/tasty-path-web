// Servicio para generar ejercicios personalizados que complementan planes semanales
import { WeeklyPlan } from '../context/WeeklyPlanContext';
import { AI_CONFIG, isAIConfigured } from '../config/ai';

// Tipo para perfil de usuario
interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female';
  activityLevel?: string;
}

export interface Exercise {
  id: string;
  dayNumber: number;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  location: 'gym' | 'park' | 'home';
  duration: number; // minutos
  description: string;
  instructions: string[];
  equipment?: string[];
  recommendations: string[];
  caloriesBurned?: number;
}

export interface DailyExercise {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  duration: number;
  description: string;
  instructions: string[];
  equipment?: string[];
  recommendations: string[];
  location?: 'gym' | 'park' | 'home';
}

// Generar ejercicios personalizados para un plan semanal
export async function generateExercisesForPlan(
  plan: WeeklyPlan,
  profile: UserProfile | null,
  locations: string[]
): Promise<Exercise[]> {
  const exercises: Exercise[] = [];
  const meals = plan.meals || [];
  const days = Array.isArray(meals) ? meals : Object.values(meals);
  
  // Determinar objetivo del plan
  const goal = plan.config?.goal || 'maintenance';
  
  // Rotar entre ubicaciones seleccionadas
  const locationRotation = locations.length > 0 ? locations : ['home'];
  
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const dayNumber = day?.dayNumber || i + 1;
    const location = locationRotation[i % locationRotation.length] as 'gym' | 'park' | 'home';
    
    // Generar ejercicio para este día
    const exercise = await generateDailyExercise(
      dayNumber,
      goal,
      location,
      profile
    );
    
    exercises.push({
      ...exercise,
      dayNumber,
      location,
    });
  }
  
  return exercises;
}

// Generar ejercicio diario personalizado
async function generateDailyExercise(
  dayNumber: number,
  goal: string,
  location: 'gym' | 'park' | 'home',
  profile: UserProfile | null
): Promise<Exercise> {
  const week = Math.ceil(dayNumber / 7);
  const dayOfWeek = ((dayNumber - 1) % 7) + 1;
  
  // Intentar generar con IA si está configurada
  if (isAIConfigured() && profile) {
    try {
      const exercisePrompt = `Genera un ejercicio personalizado para el día ${dayNumber} de un plan de ${goal === 'weight_loss' ? 'pérdida de peso' : goal === 'weight_gain' ? 'ganancia de peso' : goal === 'muscle_gain' ? 'ganancia de músculo' : 'mantenimiento'}.

PERFIL DEL USUARIO:
- Edad: ${profile.age || 'No especificada'} años
- Peso: ${profile.weight || 'No especificado'} kg
- Altura: ${profile.height || 'No especificada'} cm
- Género: ${profile.gender || 'No especificado'}
- Nivel de actividad: ${profile.activityLevel || 'moderado'}
- Objetivo: ${goal === 'weight_loss' ? 'Pérdida de peso' : goal === 'weight_gain' ? 'Ganancia de peso' : goal === 'muscle_gain' ? 'Ganancia de músculo' : 'Mantenimiento'}

UBICACIÓN: ${location === 'gym' ? 'Gimnasio (equipamiento completo disponible)' : location === 'park' ? 'Parque (equipamiento limitado, espacios abiertos)' : 'Casa (equipamiento mínimo)'}

CONTEXTO:
- Día ${dayNumber}
- Semana ${week}
- Día de la semana: ${dayOfWeek === 1 ? 'Lunes' : dayOfWeek === 2 ? 'Martes' : dayOfWeek === 3 ? 'Miércoles' : dayOfWeek === 4 ? 'Jueves' : dayOfWeek === 5 ? 'Viernes' : dayOfWeek === 6 ? 'Sábado' : 'Domingo'}

INSTRUCCIONES:
1. Genera un ejercicio apropiado para la ubicación: ${location === 'gym' ? 'Gimnasio con equipamiento completo' : location === 'park' ? 'Parque con espacios abiertos y equipamiento básico' : 'Casa con equipamiento mínimo'}
2. Ajusta la intensidad según el nivel de actividad (${profile.activityLevel || 'moderado'})
3. Considera el objetivo: ${goal === 'weight_loss' ? 'Enfócate en cardio y quema de calorías' : goal === 'muscle_gain' ? 'Enfócate en fuerza y desarrollo muscular' : goal === 'weight_gain' ? 'Combina fuerza y cardio moderado' : 'Mantén un equilibrio'}
4. Varía el tipo de ejercicio según el día de la semana para evitar monotonía
5. Si el usuario es mayor de 60 años, prioriza ejercicios de bajo impacto
6. Si el usuario es menor de 18 años, evita ejercicios de alta intensidad sin supervisión
7. Adapta el ejercicio a la ubicación: ${location === 'gym' ? 'Puedes usar máquinas, pesas, barras, etc.' : location === 'park' ? 'Usa el espacio abierto, bancos, barras de calistenia si hay' : 'Usa solo el peso corporal y objetos domésticos'}

RESPONDE EN FORMATO JSON:
{
  "id": "exercise-day-${dayNumber}",
  "name": "Nombre del ejercicio",
  "type": "cardio" | "strength" | "flexibility" | "mixed",
  "duration": número en minutos,
  "description": "Descripción detallada del ejercicio y sus beneficios",
  "instructions": ["Instrucción 1", "Instrucción 2", ...],
  "equipment": ["Equipo necesario si aplica"],
  "recommendations": ["Recomendación 1", "Recomendación 2", ...],
  "caloriesBurned": número estimado de calorías quemadas
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
              content: 'Eres un entrenador personal experto. Genera ejercicios personalizados, seguros y efectivos basados en el perfil del usuario y la ubicación disponible. Responde SOLO con JSON válido, sin texto adicional.',
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
          let exerciseData;
          try {
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : content;
            exerciseData = JSON.parse(jsonString);
            
            if (exerciseData.name && exerciseData.type && exerciseData.instructions) {
              return {
                id: exerciseData.id || `exercise-day-${dayNumber}`,
                name: exerciseData.name,
                type: exerciseData.type as Exercise['type'],
                duration: exerciseData.duration || 45,
                description: exerciseData.description || '',
                instructions: Array.isArray(exerciseData.instructions) ? exerciseData.instructions : [],
                equipment: Array.isArray(exerciseData.equipment) ? exerciseData.equipment : [],
                recommendations: Array.isArray(exerciseData.recommendations) ? exerciseData.recommendations : [],
                caloriesBurned: exerciseData.caloriesBurned,
                location,
              };
            }
          } catch (parseError) {
            console.error('Error parseando respuesta de IA:', parseError);
          }
        }
      }
    } catch (error) {
      console.error(`Error generando ejercicio del día ${dayNumber} con IA:`, error);
    }
  }
  
  // Fallback: Generación básica según ubicación y objetivo
  return generateFallbackExercise(dayNumber, goal, location, profile);
}

// Generar ejercicio de fallback
function generateFallbackExercise(
  dayNumber: number,
  goal: string,
  location: 'gym' | 'park' | 'home',
  profile: UserProfile | null
): Exercise {
  const userAge = profile?.age || 30;
  const isSenior = userAge >= 60;
  const dayOfWeek = ((dayNumber - 1) % 7) + 1;
  
  // Ejercicios por ubicación
  const gymExercises = {
    weight_loss: [
      { name: 'Cardio en Cinta + Circuito de Fuerza', type: 'mixed' as const, duration: 45, description: 'Combinación de cardio y fuerza para quemar calorías y tonificar' },
      { name: 'Entrenamiento HIIT en Máquinas', type: 'cardio' as const, duration: 30, description: 'Entrenamiento de alta intensidad para máxima quema de calorías' },
      { name: 'Cardio + Pesas Ligeras', type: 'mixed' as const, duration: 40, description: 'Cardio moderado seguido de ejercicios de fuerza con pesas' },
    ],
    muscle_gain: [
      { name: 'Entrenamiento de Fuerza - Tren Superior', type: 'strength' as const, duration: 60, description: 'Desarrollo de músculos del tren superior' },
      { name: 'Entrenamiento de Fuerza - Tren Inferior', type: 'strength' as const, duration: 60, description: 'Desarrollo de músculos del tren inferior' },
      { name: 'Entrenamiento Full Body', type: 'strength' as const, duration: 50, description: 'Entrenamiento completo de todo el cuerpo' },
    ],
    default: [
      { name: 'Entrenamiento Funcional Completo', type: 'mixed' as const, duration: 45, description: 'Ejercicios funcionales para todo el cuerpo' },
      { name: 'Cardio Moderado + Fuerza', type: 'mixed' as const, duration: 40, description: 'Combinación equilibrada de cardio y fuerza' },
    ],
  };
  
  const parkExercises = {
    weight_loss: [
      { name: 'Carrera Continua en Parque', type: 'cardio' as const, duration: 40, description: 'Carrera continua en terreno variado del parque' },
      { name: 'Circuito de Calistenia', type: 'mixed' as const, duration: 35, description: 'Ejercicios de peso corporal en espacios abiertos' },
      { name: 'Caminata Rápida + Ejercicios', type: 'cardio' as const, duration: 45, description: 'Caminata activa combinada con ejercicios funcionales' },
    ],
    muscle_gain: [
      { name: 'Calistenia Avanzada', type: 'strength' as const, duration: 50, description: 'Ejercicios de fuerza con peso corporal' },
      { name: 'Entrenamiento en Barras', type: 'strength' as const, duration: 45, description: 'Ejercicios de fuerza usando barras del parque' },
    ],
    default: [
      { name: 'Ejercicios al Aire Libre', type: 'mixed' as const, duration: 40, description: 'Combinación de ejercicios funcionales en el parque' },
    ],
  };
  
  const homeExercises = {
    weight_loss: [
      { name: 'HIIT en Casa', type: 'cardio' as const, duration: 25, description: 'Entrenamiento de alta intensidad sin equipamiento' },
      { name: 'Cardio con Peso Corporal', type: 'cardio' as const, duration: 30, description: 'Ejercicios cardiovasculares usando solo el peso corporal' },
      { name: 'Yoga Dinámico', type: 'flexibility' as const, duration: 35, description: 'Yoga activo para flexibilidad y quema de calorías' },
    ],
    muscle_gain: [
      { name: 'Entrenamiento de Fuerza en Casa', type: 'strength' as const, duration: 40, description: 'Ejercicios de fuerza con peso corporal y objetos domésticos' },
      { name: 'Calistenia Progresiva', type: 'strength' as const, duration: 35, description: 'Ejercicios de fuerza progresivos sin equipamiento' },
    ],
    default: [
      { name: 'Entrenamiento Funcional en Casa', type: 'mixed' as const, duration: 30, description: 'Ejercicios funcionales adaptados para casa' },
    ],
  };
  
  let exerciseSet;
  if (location === 'gym') {
    exerciseSet = gymExercises[goal as keyof typeof gymExercises] || gymExercises.default;
  } else if (location === 'park') {
    exerciseSet = parkExercises[goal as keyof typeof parkExercises] || parkExercises.default;
  } else {
    exerciseSet = homeExercises[goal as keyof typeof homeExercises] || homeExercises.default;
  }
  
  const exercise = exerciseSet[(dayOfWeek - 1) % exerciseSet.length];
  
  // Ajustar para adultos mayores
  let duration = exercise.duration;
  if (isSenior) duration = Math.min(duration, 30);
  
  return {
    id: `exercise-day-${dayNumber}`,
    name: exercise.name,
    type: exercise.type,
    duration,
    description: exercise.description,
    instructions: getInstructionsForLocation(location, exercise.type, goal),
    equipment: getEquipmentForLocation(location),
    recommendations: getRecommendationsForLocation(location, userAge),
    location,
  };
}

function getInstructionsForLocation(
  location: 'gym' | 'park' | 'home',
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed',
  goal: string
): string[] {
  if (location === 'gym') {
    if (type === 'cardio' || type === 'mixed') {
      return [
        'Calentamiento: 5-10 minutos en cinta o bicicleta',
        'Ejercicio principal: 20-30 minutos según el tipo',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos',
      ];
    } else {
      return [
        'Calentamiento: 5 minutos de movilidad',
        'Ejercicio principal: 3-4 series de 8-12 repeticiones',
        'Descanso: 60-90 segundos entre series',
        'Estiramiento: 10 minutos',
      ];
    }
  } else if (location === 'park') {
    return [
      'Calentamiento: 5 minutos caminando',
      'Ejercicio principal: 25-35 minutos',
      'Usa bancos, barras y espacios abiertos disponibles',
      'Enfriamiento: 5 minutos caminando',
      'Estiramiento: 10 minutos',
    ];
  } else {
    return [
      'Calentamiento: 5 minutos de movilidad',
      'Ejercicio principal: 20-30 minutos',
      'Usa solo peso corporal y objetos domésticos',
      'Enfriamiento: 5 minutos',
      'Estiramiento: 10 minutos',
    ];
  }
}

function getEquipmentForLocation(location: 'gym' | 'park' | 'home'): string[] {
  if (location === 'gym') {
    return ['Equipamiento del gimnasio', 'Pesas', 'Máquinas'];
  } else if (location === 'park') {
    return ['Peso corporal', 'Bancos del parque', 'Barras de calistenia (si hay)'];
  } else {
    return ['Peso corporal', 'Objetos domésticos'];
  }
}

function getRecommendationsForLocation(
  location: 'gym' | 'park' | 'home',
  age?: number
): string[] {
  const base = [];
  
  if (location === 'gym') {
    base.push('Aprovecha el equipamiento completo disponible');
    base.push('Pide ayuda a los entrenadores si es necesario');
  } else if (location === 'park') {
    base.push('Aprovecha los espacios abiertos');
    base.push('Verifica que el equipamiento esté en buen estado');
  } else {
    base.push('Asegúrate de tener espacio suficiente');
    base.push('Usa una colchoneta o superficie cómoda');
  }
  
  if (age && age >= 60) {
    base.push('Prioriza ejercicios de bajo impacto');
    base.push('Escucha a tu cuerpo y descansa cuando sea necesario');
  }
  
  base.push('Hidrátate antes, durante y después del ejercicio');
  base.push('Mantén la técnica correcta en cada ejercicio');
  
  return base;
}

