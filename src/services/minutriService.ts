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
  isLocked: boolean;
  progress: number;
  adherence: number;
  targetAdherence: number; // Adherencia mínima requerida para desbloquear el siguiente módulo
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
        isLocked: i > 0, // Los módulos después del primero están bloqueados inicialmente
        progress: 0,
        adherence: 0,
        targetAdherence: 80, // Requiere 80% de adherencia para desbloquear el siguiente módulo
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

  // Verificar y desbloquear módulos
  checkAndUnlockModules: (modules: Module[]): Module[] => {
    const updated = [...modules];
    
    for (let i = 0; i < updated.length; i++) {
      const module = updated[i];
      
      // Si el módulo está completado y tiene la adherencia requerida
      if (module.isCompleted && module.adherence >= module.targetAdherence) {
        // Desbloquear el siguiente módulo si existe
        if (i + 1 < updated.length && updated[i + 1].isLocked) {
          updated[i + 1].isLocked = false;
          updated[i + 1].isActive = true;
          console.log(`✅ Módulo ${i + 2} desbloqueado!`);
        }
      }
    }
    
    return updated;
  },

  // Completar módulo actual
  completeModule: (moduleId: number, finalAdherence: number): void => {
    const modules = minutriService.getModules();
    if (!modules) return;
    
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;
    
    module.isCompleted = true;
    module.isActive = false;
    module.adherence = finalAdherence;
    module.progress = 100;
    
    // Verificar y desbloquear siguiente módulo
    const updated = minutriService.checkAndUnlockModules(modules);
    minutriService.saveModules(updated);
  },

  // Cancelar/resetear roadmap completo
  clearRoadmap: (): void => {
    // Primero obtener módulos antes de eliminarlos (usar la función getModules directamente)
    const modulesData = localStorage.getItem(MODULES_KEY);
    const modules = modulesData ? JSON.parse(modulesData) : null;
    
    // Eliminar todos los tracking de módulos
    if (modules && Array.isArray(modules)) {
      modules.forEach((module: Module) => {
        const key = `${TRACKING_KEY}_${module.id}`;
        localStorage.removeItem(key);
        // Eliminar contenido generado de módulos
        localStorage.removeItem(`minutri_content_${module.id}`);
      });
    }
    
    // Eliminar roadmap
    localStorage.removeItem(STORAGE_KEY);
    
    // Eliminar módulos
    localStorage.removeItem(MODULES_KEY);
    
    console.log('✅ Roadmap de MiNutri Personal cancelado y eliminado');
  },
};

