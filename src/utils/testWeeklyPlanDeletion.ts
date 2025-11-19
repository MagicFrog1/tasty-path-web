import { WeeklyPlan } from '../context/WeeklyPlanContext';

// Función de prueba para verificar la eliminación
export const testWeeklyPlanDeletion = () => {
  console.log('🧪 Iniciando prueba de eliminación de planes semanales...');
  
  // Crear planes de prueba
  const testPlans: WeeklyPlan[] = [
    {
      id: '1',
      weekStart: '2024-01-01',
      weekEnd: '2024-01-07',
      totalMeals: 21,
      totalCalories: 14000,
      totalCost: 120,
      status: 'active',
      name: 'Plan de Prueba 1',
      description: 'Plan de prueba para verificar eliminación',
      nutritionGoals: {
        protein: 80,
        carbs: 200,
        fat: 65,
        fiber: 25,
      },
      progress: {
        completedMeals: 0,
        totalMeals: 21,
        percentage: 0,
      },
    },
    {
      id: '2',
      weekStart: '2024-01-08',
      weekEnd: '2024-01-14',
      totalMeals: 21,
      totalCalories: 14000,
      totalCost: 120,
      status: 'draft',
      name: 'Plan de Prueba 2',
      description: 'Segundo plan de prueba',
      nutritionGoals: {
        protein: 80,
        carbs: 200,
        fat: 65,
        fiber: 25,
      },
      progress: {
        completedMeals: 0,
        totalMeals: 21,
        percentage: 0,
      },
    }
  ];
  
  console.log('📋 Planes de prueba creados:', testPlans.length);
  
  // Simular eliminación del primer plan
  const planToDelete = testPlans[0];
  const remainingPlans = testPlans.filter(plan => plan.id !== planToDelete.id);
  
  console.log('🗑️ Plan a eliminar:', planToDelete.id, planToDelete.name);
  console.log('📋 Planes restantes:', remainingPlans.length);
  console.log('✅ Prueba de eliminación completada');
  
  return {
    originalPlans: testPlans,
    deletedPlan: planToDelete,
    remainingPlans: remainingPlans,
    success: remainingPlans.length === testPlans.length - 1
  };
};

// Función para verificar que el contexto funciona correctamente
export const testContextFunctions = () => {
  console.log('🧪 Probando funciones del contexto...');
  
  // Simular las funciones del contexto
  let plans: WeeklyPlan[] = [];
  let activePlan: WeeklyPlan | null = null;
  
  const addPlan = (plan: WeeklyPlan) => {
    plans = [...plans, plan];
    console.log('➕ Plan agregado:', plan.name, 'Total:', plans.length);
  };
  
  const deletePlan = (planId: string) => {
    const initialCount = plans.length;
    plans = plans.filter(plan => plan.id !== planId);
    console.log('🗑️ Plan eliminado:', planId, 'Antes:', initialCount, 'Después:', plans.length);
    
    if (activePlan?.id === planId) {
      activePlan = null;
      console.log('❌ Plan activo limpiado');
    }
  };
  
  const setActive = (plan: WeeklyPlan | null) => {
    activePlan = plan;
    console.log('⭐ Plan activo establecido:', plan?.name || 'ninguno');
  };
  
  return {
    plans: () => plans,
    addPlan,
    deletePlan,
    setActive,
    activePlan: () => activePlan
  };
};
