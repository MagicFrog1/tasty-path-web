// Servicio para gestionar roadmaps y módulos de MiNutri Personal

export interface RoadmapData {
  finalGoal: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintenance';
  targetValue: number;
  currentValue: number;
  timeframe: number; // en meses
  createdAt: string;
  modules: number;
}

export interface Module {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  milestone: string;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
}

export interface DayTracking {
  day: number;
  date: string;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  exercise: boolean;
}

const STORAGE_KEY = 'minutri_roadmap';
const MODULES_KEY = 'minutri_modules';
const TRACKING_KEY = 'minutri_tracking';

export const minutriService = {
  // Guardar roadmap
  saveRoadmap: (data: RoadmapData): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Obtener roadmap
  getRoadmap: (): RoadmapData | null => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Generar módulos basados en el roadmap
  generateModules: (roadmap: RoadmapData): Module[] => {
    const modules: Module[] = [];
    const totalDifference = Math.abs(roadmap.targetValue - roadmap.currentValue);
    const progressPerModule = totalDifference / roadmap.modules;
    const startDate = new Date(roadmap.createdAt);
    
    for (let i = 0; i < roadmap.modules; i++) {
      const moduleStart = new Date(startDate);
      moduleStart.setDate(moduleStart.getDate() + (i * 30));
      
      const moduleEnd = new Date(moduleStart);
      moduleEnd.setDate(moduleEnd.getDate() + 30);
      
      const targetValue = roadmap.finalGoal === 'weight_loss'
        ? roadmap.currentValue - (progressPerModule * (i + 1))
        : roadmap.currentValue + (progressPerModule * (i + 1));
      
      modules.push({
        id: i + 1,
        title: `Módulo ${i + 1}`,
        startDate: moduleStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        endDate: moduleEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        milestone: roadmap.finalGoal === 'weight_loss'
          ? `Alcanzar ${targetValue.toFixed(1)}kg`
          : `Alcanzar ${targetValue.toFixed(1)}kg`,
        isActive: i === 0,
        isCompleted: false,
        progress: 0,
      });
    }
    
    return modules;
  },

  // Guardar módulos
  saveModules: (modules: Module[]): void => {
    localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
  },

  // Obtener módulos
  getModules: (): Module[] | null => {
    const data = localStorage.getItem(MODULES_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Inicializar tracking para un módulo
  initializeTracking: (moduleId: number, startDate: Date): DayTracking[] => {
    const days: DayTracking[] = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      days.push({
        day: i + 1,
        date: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }),
        meals: {
          breakfast: false,
          lunch: false,
          dinner: false,
        },
        exercise: false,
      });
    }
    
    return days;
  },

  // Guardar tracking
  saveTracking: (moduleId: number, days: DayTracking[]): void => {
    const key = `${TRACKING_KEY}_${moduleId}`;
    localStorage.setItem(key, JSON.stringify(days));
  },

  // Obtener tracking
  getTracking: (moduleId: number): DayTracking[] | null => {
    const key = `${TRACKING_KEY}_${moduleId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  // Calcular adherencia
  calculateAdherence: (days: DayTracking[]): number => {
    if (days.length === 0) return 0;
    
    const totalChecks = days.length * 4; // 3 comidas + 1 ejercicio
    const completedChecks = days.reduce((acc, day) => {
      return acc + 
        (day.meals.breakfast ? 1 : 0) +
        (day.meals.lunch ? 1 : 0) +
        (day.meals.dinner ? 1 : 0) +
        (day.exercise ? 1 : 0);
    }, 0);
    
    return Math.round((completedChecks / totalChecks) * 100);
  },

  // Obtener día actual del módulo
  getCurrentDay: (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays + 1, 1), 30);
  },
};

