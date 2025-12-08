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
  locations: string[],
  trainingFocus?: string
): Promise<Exercise[]> {
  const meals = plan.meals || [];
  const days = Array.isArray(meals) ? meals : Object.values(meals);
  
  // Determinar objetivo del plan
  const goal = plan.config?.goal || 'maintenance';
  
  // Rotar entre ubicaciones seleccionadas
  const locationRotation = locations.length > 0 ? locations : ['home'];
  
  // Generar todos los ejercicios en paralelo para mayor velocidad
  const exercisePromises = days.map(async (day: any, i: number) => {
    const dayNumber = day?.dayNumber || i + 1;
    const location = locationRotation[i % locationRotation.length] as 'gym' | 'park' | 'home';
    
    // Generar ejercicio para este día
    const exercise = await generateDailyExercise(
      dayNumber,
      goal,
      location,
      profile,
      trainingFocus
    );
    
    return {
      ...exercise,
      dayNumber,
      location,
    };
  });
  
  // Esperar a que todos los ejercicios se generen en paralelo
  const exercises = await Promise.all(exercisePromises);
  
  return exercises;
}

// Generar ejercicio diario personalizado
async function generateDailyExercise(
  dayNumber: number,
  goal: string,
  location: 'gym' | 'park' | 'home',
  profile: UserProfile | null,
  trainingFocus?: string
): Promise<Exercise> {
  const week = Math.ceil(dayNumber / 7);
  const dayOfWeek = ((dayNumber - 1) % 7) + 1;
  
  // Determinar grupo muscular según el día de la semana
  const muscleGroups = [
    { focus: 'Pecho y Tríceps', muscles: ['pectorales', 'tríceps'], type: 'strength' as const },
    { focus: 'Espalda y Bíceps', muscles: ['dorsales', 'bíceps', 'deltoides posteriores'], type: 'strength' as const },
    { focus: 'Piernas y Glúteos', muscles: ['cuádriceps', 'isquiotibiales', 'glúteos', 'gemelos'], type: 'strength' as const },
    { focus: 'Hombros y Trapecio', muscles: ['deltoides', 'trapecio'], type: 'strength' as const },
    { focus: 'Cardio y Core', muscles: ['abdominales', 'oblicuos', 'cardio'], type: 'mixed' as const },
    { focus: 'Cardio Intensivo', muscles: ['cardio', 'quema de grasa'], type: 'cardio' as const },
    { focus: 'Recuperación Activa', muscles: ['flexibilidad', 'estiramiento', 'movilidad'], type: 'flexibility' as const },
  ];
  
  const dayIndex = (dayNumber - 1) % 7;

  // Permitir que el usuario fuerce un foco concreto desde MiNutriPersonal
  let muscleGroup = muscleGroups[dayIndex];
  if (trainingFocus) {
    switch (trainingFocus) {
      case 'weight_loss':
        muscleGroup = muscleGroups[5]; // Cardio intensivo
        break;
      case 'strength_progression':
        muscleGroup = muscleGroups[2]; // Piernas y glúteos, gran masa muscular
        break;
      case 'legs':
        muscleGroup = muscleGroups[2]; // Piernas y glúteos
        break;
      case 'chest_back':
        muscleGroup = dayNumber % 2 === 0 ? muscleGroups[0] : muscleGroups[1]; // alterna pecho/espalda
        break;
      case 'arms':
        muscleGroup = dayNumber % 2 === 0 ? muscleGroups[0] : muscleGroups[1]; // pecho+tríceps / espalda+bíceps
        break;
      default:
        break;
    }
  }
  
  // Intentar generar con IA si está configurada
  if (isAIConfigured() && profile) {
    try {
      const exercisePrompt = `Genera un ejercicio personalizado ESPECÍFICO para el día ${dayNumber} de un plan de ${goal === 'weight_loss' ? 'pérdida de peso' : goal === 'weight_gain' ? 'ganancia de peso' : goal === 'muscle_gain' ? 'ganancia de músculo' : 'mantenimiento'}.

ENFOQUE DEL DÍA: ${muscleGroup.focus}
GRUPOS MUSCULARES PRINCIPALES: ${muscleGroup.muscles.join(', ')}

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

INSTRUCCIONES CRÍTICAS:
1. El ejercicio DEBE estar enfocado específicamente en: ${muscleGroup.focus}
2. Incluye ejercicios específicos para: ${muscleGroup.muscles.join(', ')}
3. Genera una rutina completa con 4-6 ejercicios específicos para estos grupos musculares
4. Para cada ejercicio, especifica: nombre, series, repeticiones, y descripción técnica
5. Ajusta la intensidad según el nivel de actividad (${profile.activityLevel || 'moderado'})
6. Considera el objetivo: ${goal === 'weight_loss' ? 'Enfócate en cardio y quema de calorías' : goal === 'muscle_gain' ? 'Enfócate en fuerza y desarrollo muscular' : goal === 'weight_gain' ? 'Combina fuerza y cardio moderado' : 'Mantén un equilibrio'}
7. Si el usuario es mayor de 60 años, prioriza ejercicios de bajo impacto
8. Si el usuario es menor de 18 años, evita ejercicios de alta intensidad sin supervisión
9. Adapta el ejercicio a la ubicación: ${location === 'gym' ? 'Puedes usar máquinas, pesas, barras, etc.' : location === 'park' ? 'Usa el espacio abierto, bancos, barras de calistenia si hay' : 'Usa solo el peso corporal y objetos domésticos'}
10. Las instrucciones deben ser PASO A PASO y ESPECÍFICAS para cada ejercicio

RESPONDE EN FORMATO JSON:
{
  "id": "exercise-day-${dayNumber}",
  "name": "Rutina de ${muscleGroup.focus}",
  "type": "${muscleGroup.type}",
  "duration": número en minutos (45-60 para fuerza, 30-45 para cardio),
  "description": "Descripción detallada de la rutina enfocada en ${muscleGroup.focus} y sus beneficios específicos",
  "instructions": [
    "Calentamiento específico: 5-10 minutos",
    "Ejercicio 1: [Nombre específico] - [Series]x[Repeticiones] - [Descripción técnica]",
    "Ejercicio 2: [Nombre específico] - [Series]x[Repeticiones] - [Descripción técnica]",
    "Ejercicio 3: [Nombre específico] - [Series]x[Repeticiones] - [Descripción técnica]",
    "Ejercicio 4: [Nombre específico] - [Series]x[Repeticiones] - [Descripción técnica]",
    "Descanso entre series: 60-90 segundos",
    "Enfriamiento y estiramiento: 10 minutos"
  ],
  "equipment": ["Equipo específico necesario para ${muscleGroup.focus}"],
  "recommendations": [
    "Enfócate en la técnica correcta para ${muscleGroup.muscles.join(' y ')}",
    "Mantén la tensión constante durante cada repetición",
    "Recomendación específica para ${muscleGroup.focus}",
    "Hidrátate antes, durante y después del ejercicio"
  ],
  "caloriesBurned": número estimado de calorías quemadas,
  "muscleFocus": "${muscleGroup.focus}"
}`;

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
                dayNumber,
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
  return generateFallbackExercise(dayNumber, goal, location, profile, trainingFocus);
}

// Generar ejercicio de fallback
function generateFallbackExercise(
  dayNumber: number,
  goal: string,
  location: 'gym' | 'park' | 'home',
  profile: UserProfile | null,
  trainingFocus?: string
): Exercise {
  const userAge = profile?.age || 30;
  const isSenior = userAge >= 60;
  const dayOfWeek = ((dayNumber - 1) % 7) + 1;
  
  // Grupos musculares por día de la semana
  const muscleGroups = [
    { focus: 'Pecho y Tríceps', type: 'strength' as const },
    { focus: 'Espalda y Bíceps', type: 'strength' as const },
    { focus: 'Piernas y Glúteos', type: 'strength' as const },
    { focus: 'Hombros y Trapecio', type: 'strength' as const },
    { focus: 'Cardio y Core', type: 'mixed' as const },
    { focus: 'Cardio Intensivo', type: 'cardio' as const },
    { focus: 'Recuperación Activa', type: 'flexibility' as const },
  ];
  
  let muscleGroup = muscleGroups[(dayNumber - 1) % 7];

  if (trainingFocus) {
    switch (trainingFocus) {
      case 'weight_loss':
        muscleGroup = muscleGroups[5];
        break;
      case 'strength_progression':
        muscleGroup = muscleGroups[2];
        break;
      case 'legs':
        muscleGroup = muscleGroups[2];
        break;
      case 'chest_back':
        muscleGroup = dayNumber % 2 === 0 ? muscleGroups[0] : muscleGroups[1];
        break;
      case 'arms':
        muscleGroup = dayNumber % 2 === 0 ? muscleGroups[0] : muscleGroups[1];
        break;
      default:
        break;
    }
  }
  
  // Ejercicios específicos por grupo muscular y ubicación
  const gymExercises = {
    'Pecho y Tríceps': {
      name: 'Rutina de Pecho y Tríceps',
      description: 'Entrenamiento enfocado en desarrollo de pectorales y tríceps para mayor volumen y fuerza en el tren superior',
      instructions: [
        'Calentamiento: 5-10 minutos en cinta o bicicleta',
        'Press de banca con barra: 4 series x 8-12 repeticiones',
        'Press inclinado con mancuernas: 3 series x 10-12 repeticiones',
        'Fondos en paralelas: 3 series x 10-15 repeticiones',
        'Extensiones de tríceps en polea: 3 series x 12-15 repeticiones',
        'Press francés: 3 series x 10-12 repeticiones',
        'Descanso: 60-90 segundos entre series',
        'Estiramiento: 10 minutos enfocado en pecho y tríceps'
      ],
      equipment: ['Barra y discos', 'Mancuernas', 'Máquina de press', 'Polea', 'Banco inclinado']
    },
    'Espalda y Bíceps': {
      name: 'Rutina de Espalda y Bíceps',
      description: 'Desarrollo de dorsales, romboides y bíceps para una espalda ancha y brazos fuertes',
      instructions: [
        'Calentamiento: 5-10 minutos de remo ligero',
        'Dominadas o jalones al pecho: 4 series x 8-12 repeticiones',
        'Remo con barra: 4 series x 8-10 repeticiones',
        'Remo con mancuerna a una mano: 3 series x 10-12 repeticiones por lado',
        'Curl de bíceps con barra: 3 series x 10-12 repeticiones',
        'Curl martillo: 3 series x 12-15 repeticiones',
        'Descanso: 60-90 segundos entre series',
        'Estiramiento: 10 minutos enfocado en espalda y bíceps'
      ],
      equipment: ['Barra y discos', 'Mancuernas', 'Máquina de jalones', 'Barra de dominadas']
    },
    'Piernas y Glúteos': {
      name: 'Rutina de Piernas y Glúteos',
      description: 'Entrenamiento completo de tren inferior para desarrollar fuerza y volumen en piernas y glúteos',
      instructions: [
        'Calentamiento: 5-10 minutos en bicicleta estática',
        'Sentadillas con barra: 4 series x 8-12 repeticiones',
        'Prensa de piernas: 4 series x 12-15 repeticiones',
        'Extensiones de cuádriceps: 3 series x 12-15 repeticiones',
        'Curl de isquiotibiales: 3 series x 12-15 repeticiones',
        'Elevaciones de talones: 4 series x 15-20 repeticiones',
        'Descanso: 90-120 segundos entre series',
        'Estiramiento: 10 minutos enfocado en piernas y glúteos'
      ],
      equipment: ['Barra y discos', 'Máquina de prensa', 'Máquina de extensiones', 'Máquina de curl femoral']
    },
    'Hombros y Trapecio': {
      name: 'Rutina de Hombros y Trapecio',
      description: 'Desarrollo de deltoides y trapecio para hombros anchos y postura mejorada',
      instructions: [
        'Calentamiento: 5 minutos de movilidad de hombros',
        'Press militar con barra: 4 series x 8-12 repeticiones',
        'Elevaciones laterales: 3 series x 12-15 repeticiones',
        'Elevaciones frontales: 3 series x 12-15 repeticiones',
        'Vuelos posteriores: 3 series x 12-15 repeticiones',
        'Encogimientos de hombros: 3 series x 12-15 repeticiones',
        'Descanso: 60-90 segundos entre series',
        'Estiramiento: 10 minutos enfocado en hombros y cuello'
      ],
      equipment: ['Barra y discos', 'Mancuernas', 'Máquina de press militar']
    },
    'Cardio y Core': {
      name: 'Rutina de Cardio y Core',
      description: 'Combinación de ejercicios cardiovasculares y fortalecimiento del core para resistencia y estabilidad',
      instructions: [
        'Calentamiento: 5 minutos de trote ligero',
        'HIIT en cinta: 20 minutos (30s sprint, 60s recuperación)',
        'Plancha: 3 series x 45-60 segundos',
        'Abdominales en máquina: 3 series x 15-20 repeticiones',
        'Mountain climbers: 3 series x 30 segundos',
        'Russian twists: 3 series x 20 repeticiones',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos'
      ],
      equipment: ['Cinta de correr', 'Máquina de abdominales', 'Colchoneta']
    },
    'Cardio Intensivo': {
      name: 'Cardio Intensivo',
      description: 'Entrenamiento cardiovascular de alta intensidad para máxima quema de calorías y mejora de condición física',
      instructions: [
        'Calentamiento: 5 minutos de trote ligero',
        'Carrera continua: 20-25 minutos a ritmo moderado-alto',
        'Intervalos en bicicleta: 10 minutos (1 min rápido, 1 min lento)',
        'Escaladora: 5 minutos a ritmo constante',
        'Enfriamiento: 5 minutos caminando',
        'Estiramiento: 10 minutos'
      ],
      equipment: ['Cinta de correr', 'Bicicleta estática', 'Escaladora']
    },
    'Recuperación Activa': {
      name: 'Recuperación Activa',
      description: 'Sesión de estiramientos y movilidad para recuperación muscular y prevención de lesiones',
      instructions: [
        'Calentamiento suave: 5 minutos de caminata',
        'Estiramientos dinámicos: 10 minutos',
        'Yoga o pilates suave: 20 minutos',
        'Estiramientos estáticos: 15 minutos',
        'Relajación: 5 minutos'
      ],
      equipment: ['Colchoneta', 'Bloques de yoga (opcional)']
    }
  };
  
  // Adaptar ejercicios según ubicación
  let exerciseData;
  if (location === 'gym') {
    exerciseData = gymExercises[muscleGroup.focus as keyof typeof gymExercises];
  } else if (location === 'park') {
    // Versiones adaptadas para parque
    const parkVersions: Record<string, typeof gymExercises['Pecho y Tríceps']> = {
      'Pecho y Tríceps': {
        name: 'Rutina de Pecho y Tríceps (Parque)',
        description: 'Entrenamiento de pecho y tríceps usando barras y bancos del parque',
        instructions: [
          'Calentamiento: 5 minutos de caminata rápida',
          'Flexiones en banco: 4 series x 12-15 repeticiones',
          'Fondos en barras paralelas: 4 series x 10-15 repeticiones',
          'Flexiones diamante: 3 series x 10-12 repeticiones',
          'Flexiones declinadas: 3 series x 12-15 repeticiones',
          'Extensiones de tríceps en banco: 3 series x 12-15 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Barras paralelas', 'Banco del parque', 'Peso corporal']
      },
      'Espalda y Bíceps': {
        name: 'Rutina de Espalda y Bíceps (Parque)',
        description: 'Desarrollo de espalda y bíceps usando barras de calistenia',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Dominadas: 4 series x 8-12 repeticiones',
          'Remo invertido en barra: 4 series x 10-12 repeticiones',
          'Dominadas supinas: 3 series x 8-10 repeticiones',
          'Curl de bíceps en barra: 3 series x 12-15 repeticiones',
          'Remo con peso corporal: 3 series x 12-15 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Barra de dominadas', 'Barras de calistenia', 'Peso corporal']
      },
      'Piernas y Glúteos': {
        name: 'Rutina de Piernas y Glúteos (Parque)',
        description: 'Entrenamiento de piernas usando bancos y escaleras del parque',
        instructions: [
          'Calentamiento: 5 minutos de caminata',
          'Sentadillas: 4 series x 15-20 repeticiones',
          'Zancadas: 3 series x 12-15 repeticiones por pierna',
          'Subidas al banco: 3 series x 15-20 repeticiones',
          'Sentadillas búlgaras: 3 series x 12-15 repeticiones por pierna',
          'Elevaciones de talones: 4 series x 20-25 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Banco del parque', 'Escaleras', 'Peso corporal']
      },
      'Hombros y Trapecio': {
        name: 'Rutina de Hombros y Trapecio (Parque)',
        description: 'Desarrollo de hombros usando barras y peso corporal',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Flexiones pike: 4 series x 12-15 repeticiones',
          'Flexiones con manos elevadas: 3 series x 12-15 repeticiones',
          'Paseo del granjero (si hay objetos): 3 series x 20 metros',
          'Elevaciones laterales con objetos: 3 series x 12-15 repeticiones',
          'Encogimientos de hombros: 3 series x 15-20 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Barras', 'Objetos del parque', 'Peso corporal']
      },
      'Cardio y Core': {
        name: 'Rutina de Cardio y Core (Parque)',
        description: 'Cardio y core al aire libre',
        instructions: [
          'Calentamiento: 5 minutos de trote ligero',
          'Carrera continua: 15-20 minutos',
          'Plancha: 3 series x 45-60 segundos',
          'Mountain climbers: 3 series x 30 segundos',
          'Abdominales: 3 series x 20 repeticiones',
          'Burpees: 3 series x 10 repeticiones',
          'Enfriamiento: 5 minutos caminando',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Espacio abierto', 'Colchoneta (opcional)']
      },
      'Cardio Intensivo': {
        name: 'Cardio Intensivo (Parque)',
        description: 'Cardio de alta intensidad al aire libre',
        instructions: [
          'Calentamiento: 5 minutos de trote',
          'Carrera continua: 25-30 minutos',
          'Sprints: 5 series x 30 segundos con 60s descanso',
          'Escaleras: 10 minutos subiendo y bajando',
          'Enfriamiento: 5 minutos caminando',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Espacio abierto', 'Escaleras del parque']
      },
      'Recuperación Activa': {
        name: 'Recuperación Activa (Parque)',
        description: 'Estiramientos y movilidad al aire libre',
        instructions: [
          'Calentamiento suave: 5 minutos de caminata',
          'Estiramientos dinámicos: 10 minutos',
          'Yoga suave: 20 minutos',
          'Estiramientos estáticos: 15 minutos',
          'Relajación: 5 minutos'
        ],
        equipment: ['Colchoneta (opcional)', 'Espacio abierto']
      }
    };
    exerciseData = parkVersions[muscleGroup.focus] || parkVersions['Cardio y Core'];
  } else {
    // Versiones para casa
    const homeVersions: Record<string, typeof gymExercises['Pecho y Tríceps']> = {
      'Pecho y Tríceps': {
        name: 'Rutina de Pecho y Tríceps (Casa)',
        description: 'Entrenamiento de pecho y tríceps con peso corporal',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Flexiones estándar: 4 series x 12-20 repeticiones',
          'Flexiones inclinadas: 3 series x 12-15 repeticiones',
          'Flexiones diamante: 3 series x 10-12 repeticiones',
          'Fondos en silla: 3 series x 12-15 repeticiones',
          'Extensiones de tríceps con peso: 3 series x 12-15 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Peso corporal', 'Silla', 'Objetos domésticos']
      },
      'Espalda y Bíceps': {
        name: 'Rutina de Espalda y Bíceps (Casa)',
        description: 'Desarrollo de espalda y bíceps sin equipamiento',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Remo invertido en mesa: 4 series x 12-15 repeticiones',
          'Superman: 3 series x 15-20 repeticiones',
          'Curl de bíceps con objetos: 3 series x 12-15 repeticiones',
          'Remo con toalla: 3 series x 12-15 repeticiones',
          'Curl martillo con objetos: 3 series x 12-15 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Mesa', 'Toalla', 'Objetos domésticos con peso']
      },
      'Piernas y Glúteos': {
        name: 'Rutina de Piernas y Glúteos (Casa)',
        description: 'Entrenamiento de piernas con peso corporal',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Sentadillas: 4 series x 15-20 repeticiones',
          'Zancadas: 3 series x 12-15 repeticiones por pierna',
          'Sentadillas búlgaras: 3 series x 12-15 repeticiones por pierna',
          'Elevaciones de talones: 4 series x 20-25 repeticiones',
          'Puente de glúteos: 3 series x 15-20 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Peso corporal', 'Silla', 'Colchoneta']
      },
      'Hombros y Trapecio': {
        name: 'Rutina de Hombros y Trapecio (Casa)',
        description: 'Desarrollo de hombros sin equipamiento',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Flexiones pike: 4 series x 12-15 repeticiones',
          'Flexiones con manos elevadas: 3 series x 12-15 repeticiones',
          'Elevaciones laterales con objetos: 3 series x 12-15 repeticiones',
          'Elevaciones frontales: 3 series x 12-15 repeticiones',
          'Encogimientos de hombros: 3 series x 15-20 repeticiones',
          'Descanso: 60-90 segundos entre series',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Peso corporal', 'Objetos domésticos', 'Colchoneta']
      },
      'Cardio y Core': {
        name: 'Rutina de Cardio y Core (Casa)',
        description: 'Cardio y core en casa',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'HIIT: 20 minutos (30s ejercicio, 30s descanso)',
          'Plancha: 3 series x 45-60 segundos',
          'Abdominales: 3 series x 20 repeticiones',
          'Mountain climbers: 3 series x 30 segundos',
          'Russian twists: 3 series x 20 repeticiones',
          'Enfriamiento: 5 minutos',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Colchoneta', 'Peso corporal']
      },
      'Cardio Intensivo': {
        name: 'Cardio Intensivo (Casa)',
        description: 'Cardio de alta intensidad en casa',
        instructions: [
          'Calentamiento: 5 minutos de movilidad',
          'Burpees: 5 series x 10 repeticiones',
          'Mountain climbers: 5 series x 30 segundos',
          'Jumping jacks: 5 series x 30 segundos',
          'High knees: 5 series x 30 segundos',
          'Enfriamiento: 5 minutos',
          'Estiramiento: 10 minutos'
        ],
        equipment: ['Colchoneta', 'Peso corporal']
      },
      'Recuperación Activa': {
        name: 'Recuperación Activa (Casa)',
        description: 'Estiramientos y movilidad en casa',
        instructions: [
          'Calentamiento suave: 5 minutos',
          'Estiramientos dinámicos: 10 minutos',
          'Yoga suave: 20 minutos',
          'Estiramientos estáticos: 15 minutos',
          'Relajación: 5 minutos'
        ],
        equipment: ['Colchoneta', 'Espacio cómodo']
      }
    };
    exerciseData = homeVersions[muscleGroup.focus] || homeVersions['Cardio y Core'];
  }
  
  if (!exerciseData) {
    exerciseData = gymExercises['Cardio y Core'];
  }
  
  // Ajustar para adultos mayores
  let duration = muscleGroup.type === 'cardio' ? 30 : muscleGroup.type === 'flexibility' ? 45 : 50;
  if (isSenior) duration = Math.min(duration, 30);
  
  return {
    id: `exercise-day-${dayNumber}`,
    dayNumber,
    name: exerciseData.name,
    type: muscleGroup.type,
    duration,
    description: exerciseData.description,
    instructions: exerciseData.instructions,
    equipment: exerciseData.equipment,
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

