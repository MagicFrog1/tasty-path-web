import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { nutritionService, DietConfig, WeeklyMealPlan } from '../services/NutritionService';
import AIMenuService, { AIMenuRequest, AIMenuResponse } from '../services/AIMenuService';
import { useUserProfile } from '../context/UserProfileContext';
import { useWeeklyPlan, WeeklyPlan } from '../context/WeeklyPlanContext';
import { useShoppingList } from '../context/ShoppingListContext';
import { useSubscriptionRestrictions, FREE_PLAN_OPTIONS, PREMIUM_PLAN_OPTIONS } from '../hooks/useSubscriptionRestrictions';
import UpgradePrompt from '../components/UpgradePrompt';

interface PlanConfig {
  // Datos personales para MCI
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  
  // Objetivos y preferencias
  goals: string[];
  dietaryPreferences: string[];
  allergens: string[];
  weight: number;
  height: number;
  mealCount: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  };
  specialRequirements: string[];
  
  // Opciones adicionales para ingredientes especiales
  useExoticFruits: boolean;
  useInternationalSpices: boolean;
}

interface PlanGeneratorScreenProps {
  navigation: any;
  onPlanGenerated?: () => void;
}

const PlanGeneratorScreen: React.FC<PlanGeneratorScreenProps> = ({ navigation, onPlanGenerated }) => {
  const { profile, dietConfig, getDietConfigForAI } = useUserProfile();
  const { addWeeklyPlan, weeklyPlans } = useWeeklyPlan();
  const { updateShoppingListFromPlan } = useShoppingList();
  const restrictions = useSubscriptionRestrictions();
  
  const [config, setConfig] = useState<PlanConfig>({
    // Datos personales para MCI - usar datos del perfil
    weight: profile.weight,
    height: profile.height,
    age: profile.age,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    
    // Objetivos y preferencias - usar configuración de dieta
    goals: dietConfig.goals,
    dietaryPreferences: dietConfig.dietaryPreferences,
    allergens: dietConfig.allergens,
    weight: dietConfig.weight || 70,
    height: dietConfig.height || 170,
    mealCount: dietConfig.mealCount,
    specialRequirements: restrictions.canUseSpecialRequirements ? dietConfig.specialRequirements : [], // Sin requisitos especiales para usuarios gratuitos
    
    // Opciones adicionales para ingredientes especiales
    useExoticFruits: false,
    useInternationalSpices: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyMealPlan | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  const [tipTimer, setTipTimer] = useState<NodeJS.Timeout | null>(null);
  const totalSteps = 4; // 4 pasos: objetivos, preferencias, alergias, presupuesto/tiempo

  // Animaciones para los puntos de progreso
  const [dotAnimations] = useState([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]);

  // Consejos y tips que se muestran durante la generación
  const generationTips = [
    // Consejos de nutrición
    "💡 Tip: Beber agua antes de las comidas puede ayudarte a sentirte más lleno y comer menos",
    "🥗 Datos curiosos: Las verduras de color verde oscuro son ricas en hierro y ácido fólico",
    "🍎 Sabías que: Comer frutas enteras es mejor que beber jugos, ya que conservan toda la fibra",
    "🥜 Las nueces y almendras son excelentes fuentes de grasas saludables y proteínas",
    "🐟 El pescado azul como el salmón es rico en omega-3, beneficioso para el corazón",
    "🥛 Los lácteos son una excelente fuente de calcio y vitamina D para los huesos",
    
    // Información sobre la app
    "📱 TastyPath te permite crear hasta 7 planes semanales diferentes",
    "⚙️ Puedes personalizar tu plan con más de 50 opciones de ingredientes",
    "🎯 La app calcula automáticamente tus necesidades calóricas basadas en tu perfil",
    "📊 Cada plan incluye información nutricional detallada de cada comida",
    "🛒 TastyPath genera automáticamente tu lista de compras desde el menú",
    "💾 Puedes guardar tus planes favoritos para reutilizarlos más tarde",
    
    // Funciones de la app
    "🔍 La app tiene una base de datos con más de 1000 ingredientes diferentes",
    "🍽️ Puedes elegir entre 8 tipos de cocina diferentes (mediterránea, asiática, etc.)",
    "⏰ Configura el tiempo máximo de preparación según tu disponibilidad",
    "👥 Ajusta el tamaño de la familia para calcular las porciones correctas",
    "📏 Ingresa tu peso y altura para calcular tu metabolismo basal",
    "🎨 Personaliza tu plan con ingredientes exóticos y especias internacionales",
    
    // Datos curiosos
    "🌍 La dieta mediterránea es considerada una de las más saludables del mundo",
    "🥑 El aguacate es técnicamente una fruta, no una verdura",
    "🍅 Los tomates son ricos en licopeno, un potente antioxidante",
    "🥬 El brócoli contiene más vitamina C que una naranja",
    "🌶️ Los pimientos picantes pueden acelerar tu metabolismo",
    "🍯 La miel natural tiene propiedades antibacterianas naturales",
    
    // Consejos de uso
    "📝 Revisa siempre la lista de ingredientes antes de ir de compras",
    "🔄 Puedes regenerar cualquier día del plan si no te gusta la comida",
    "⭐ Marca tus recetas favoritas para encontrarlas fácilmente",
    "📅 Planifica tu semana completa para una mejor organización",
    "🏃‍♀️ Combina tu plan nutricional con ejercicio regular para mejores resultados",
    "💡 Experimenta con nuevas recetas para mantener tu dieta interesante"
  ];

  // Verificar si el usuario puede crear un plan
  React.useEffect(() => {
    if (!restrictions.canCreatePlan) {
      setShowUpgradePrompt(true);
    }
  }, [restrictions.canCreatePlan]);

  // Efecto para animar los puntos de progreso
  useEffect(() => {
    if (isGenerating) {
      const animateDots = () => {
        const animations = dotAnimations.map((anim, index) => 
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        
        Animated.loop(
          Animated.stagger(200, animations)
        ).start();
      };
      
      animateDots();
    }
  }, [isGenerating, dotAnimations]);

  // Función para mostrar un consejo aleatorio
  const showRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * generationTips.length);
    setCurrentTip(generationTips[randomIndex]);
  };

  // Función para iniciar el timer de consejos
  const startTipTimer = () => {
    if (tipTimer) {
      clearInterval(tipTimer);
    }
    const timer = setInterval(() => {
      showRandomTip();
    }, 4000); // Cambiar cada 4 segundos
    setTipTimer(timer);
  };

  // Función para detener el timer de consejos
  const stopTipTimer = () => {
    if (tipTimer) {
      clearInterval(tipTimer);
      setTipTimer(null);
    }
  };

  // Opciones basadas en restricciones de suscripción
  const goals = restrictions.canUseAllGoals ? PREMIUM_PLAN_OPTIONS.goals : FREE_PLAN_OPTIONS.goals;
  const dietaryOptions = restrictions.canUseAllDietaryPreferences ? PREMIUM_PLAN_OPTIONS.dietaryPreferences : FREE_PLAN_OPTIONS.dietaryPreferences;
  const allergenOptions = restrictions.canUseAllAllergens ? PREMIUM_PLAN_OPTIONS.allergens : FREE_PLAN_OPTIONS.allergens;
  const specialRequirements = restrictions.canUseSpecialRequirements ? PREMIUM_PLAN_OPTIONS.specialRequirements : FREE_PLAN_OPTIONS.specialRequirements;


  const activityLevels = [
    { label: 'Sedentario', value: 'sedentary' },
    { label: 'Ligero', value: 'light' },
    { label: 'Moderado', value: 'moderate' },
    { label: 'Activo', value: 'active' },
    { label: 'Muy activo', value: 'very_active' },
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  // Función específica para selección única de objetivos de salud
  const toggleSingleGoal = (goal: string) => {
    if (config.goals.includes(goal)) {
      // Si ya está seleccionado, lo deseleccionamos
      setConfig(prev => ({ ...prev, goals: [] }));
    } else {
      // Si no está seleccionado, lo seleccionamos (reemplazando cualquier otro)
      setConfig(prev => ({ ...prev, goals: [goal] }));
    }
  };


  const updateWeight = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, weight: numValue }));
  };

  const updateHeight = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, height: numValue }));
  };


  // Función para generar nombre de plan con numeración
  const generatePlanName = () => {
    const today = new Date().toLocaleDateString('es-ES');
    const baseName = `Plan Semanal - ${today}`;
    
    // Contar cuántos planes ya existen con el mismo nombre base
    const existingPlansWithSameDate = weeklyPlans.filter(plan => 
      plan.name.startsWith(baseName)
    );
    
    if (existingPlansWithSameDate.length === 0) {
      return baseName;
    } else {
      return `${baseName} (${existingPlansWithSameDate.length + 1})`;
    }
  };

  const toggleMeal = (meal: keyof typeof config.mealCount) => {
    setConfig(prev => ({
      ...prev,
      mealCount: { ...prev.mealCount, [meal]: !prev.mealCount[meal] }
    }));
  };

  const nextStep = () => {
    // Validar que se haya seleccionado al menos un objetivo de salud en el paso 1
    if (currentStep === 1 && config.goals.length === 0) {
      Alert.alert(
        'Objetivo de Salud Requerido',
        'Por favor selecciona al menos un objetivo de salud para continuar.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    
    if (currentStep < totalSteps) {
      let nextStepNumber = currentStep + 1;
      
      // No saltar pasos: mostrar todos con bloqueo visual si corresponde
      setCurrentStep(nextStepNumber);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      let prevStepNumber = currentStep - 1;
      
      // No saltar pasos: mostrar todos con bloqueo visual si corresponde
      setCurrentStep(prevStepNumber);
    }
  };

  // Función para generar lista de compras desde el menú semanal
  const generateShoppingListFromMenu = (weeklyMenu: any[]) => {
    const ingredients = new Map<string, { quantity: string; unit: string }>();
    
    weeklyMenu.forEach(day => {
      if (day.meals) {
        Object.values(day.meals).forEach((meal: any) => {
          if (meal && meal.ingredients) {
            meal.ingredients.forEach((ingredient: string) => {
              const cleanIngredient = ingredient.trim().toLowerCase();
              if (!ingredients.has(cleanIngredient)) {
                ingredients.set(cleanIngredient, { quantity: '1', unit: 'unidad' });
              }
            });
          }
        });
      }
    });
    
    return Array.from(ingredients.entries()).map(([name, details]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: parseFloat(details.quantity) || 1,
      unit: details.unit,
    }));
  };

  const generatePlan = async () => {
    if (!config.weight || !config.height || !config.age) {
      Alert.alert('Error', 'Por favor completa todos los datos personales (peso, altura, edad)');
      return;
    }


    if (config.goals.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un objetivo de salud para generar tu plan');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Iniciando generación del plan...');
    showRandomTip();
    startTipTimer();
    
    try {
      // Usar directamente la configuración del perfil del usuario
      setGenerationProgress(10);
      setGenerationStatus('Configurando parámetros nutricionales...');
      
      const userDietConfig = getDietConfigForAI();

      // Calcular calorías basadas en el perfil del usuario
      setGenerationProgress(20);
      setGenerationStatus('Calculando necesidades calóricas...');
      
      const bmr = nutritionService.calculateBMR(userDietConfig.weight, userDietConfig.height, userDietConfig.age, userDietConfig.gender);
      const tmt = nutritionService.calculateTMT(bmr, userDietConfig.activityLevel);
      let targetCalories = tmt;
      
      if (userDietConfig.objective === 'weight_loss') {
        targetCalories = tmt * 0.85; // Déficit del 15%
      } else if (userDietConfig.objective === 'muscle_gain') {
        targetCalories = tmt * 1.1; // Excedente del 10%
      }

      // Crear request para AIMenuService
      setGenerationProgress(30);
      setGenerationStatus('Preparando solicitud para IA...');
      
      // Calcular IMC
      const bmi = nutritionService.calculateBMI(userDietConfig.weight, userDietConfig.height);
      
      const aiRequest: AIMenuRequest = {
        nutritionGoals: {
          protein: 25, // 25% de proteínas
          carbs: 50,   // 50% de carbohidratos
          fat: 25,     // 25% de grasas
          fiber: 25,   // 25g de fibra por día
        },
        totalCalories: Math.round(targetCalories * 7), // Calorías totales de la semana
        dietaryPreferences: userDietConfig.dietaryPreferences,
        allergies: userDietConfig.allergies,
        weight: userDietConfig.weight,
        height: userDietConfig.height,
        bmr: bmr,
        cuisinePreferences: ['mediterránea', 'asiática', 'mexicana', 'italiana', 'francesa', 'india', 'griega', 'japonesa'],
        useExoticFruits: config.useExoticFruits,
        useInternationalSpices: config.useInternationalSpices,
        // Nuevos campos para personalización avanzada
        activityLevel: userDietConfig.activityLevel,
        bmi: bmi,
        age: userDietConfig.age,
        gender: userDietConfig.gender,
      };

      // Generar plan con IA usando AIMenuService
      setGenerationProgress(40);
      setGenerationStatus('Generando menús personalizados...');
      
      const response = await AIMenuService.generateWeeklyMenu(aiRequest);
      
      if (response.success && response.weeklyMenu) {
        setGenerationProgress(60);
        setGenerationStatus('Procesando menús generados...');
        
        // Crear el plan con los datos de la IA
        const weeklyPlan: WeeklyPlan = {
          id: Date.now().toString(),
          weekStart: new Date().toISOString(),
          weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalMeals: Object.values(config.mealCount).filter(Boolean).length * 7,
          totalCalories: Math.round(targetCalories * 7),
          totalCost: 0, // Se calculará después
          status: 'active',
          name: generatePlanName(),
          description: `Plan personalizado para ${config.goals.join(', ')}`,
          nutritionGoals: {
            protein: 25, // Porcentaje estimado
            carbs: 50,   // Porcentaje estimado
            fat: 25,     // Porcentaje estimado
            fiber: 25,   // Gramos por día
          },
          // Progreso del plan (siempre empieza en 0%)
          progress: {
            completedMeals: 0,
            totalMeals: 21, // Valor fijo para asegurar consistencia
            percentage: 0,
          },
          // Lista de compras se generará automáticamente desde el menú semanal
          // Datos adicionales del plan generado
          config: config,
          meals: response.weeklyMenu,
          estimatedCalories: Math.round(targetCalories),
          nutritionAdvice: 'Plan generado por IA con menús variados y nutritivos',
          createdAt: new Date().toISOString(),
        };

        // Debug: verificar que el progreso esté en 0%
        console.log('Plan creado con progreso:', weeklyPlan.progress);
        console.log('🍽️ Menús del plan guardados:', response.weeklyMenu?.length, 'días');
        console.log('🍽️ Primer día del menú:', response.weeklyMenu?.[0]?.meals?.breakfast?.name);
        
        // Guardar el plan en el contexto
        setGenerationProgress(80);
        setGenerationStatus('Guardando plan semanal...');
        
        addWeeklyPlan(weeklyPlan);
        
        // Generar lista de compras desde el menú semanal
        setGenerationProgress(90);
        setGenerationStatus('Generando lista de compras...');
        
        const shoppingListItems = generateShoppingListFromMenu(response.weeklyMenu);
        if (shoppingListItems.length > 0) {
          updateShoppingListFromPlan(
            {
              id: weeklyPlan.id,
              name: weeklyPlan.name,
              description: weeklyPlan.description,
              weekStart: weeklyPlan.weekStart,
              weekEnd: weeklyPlan.weekEnd,
            },
            shoppingListItems
          );
          
          // Mostrar mensaje informativo sobre la lista de compras actualizada
          Alert.alert(
            'Lista de Compras Actualizada',
            `Se han agregado ${shoppingListItems.length} ingredientes a tu lista de compras. Puedes verla en la sección "Lista de Compras".`,
            [{ text: 'Perfecto' }]
          );
        }

        setGenerationProgress(100);
        setGenerationStatus('¡Plan generado exitosamente!');
        
        // Calcular MCI para mostrar en el mensaje
        const bmr = nutritionService.calculateBMR(config.weight, config.height, config.age, config.gender);
        const tmt = nutritionService.calculateTMT(bmr, config.activityLevel);
        const bmi = nutritionService.calculateBMI(config.weight, config.height);

        Alert.alert(
          '¡Plan Generado con IA Exitosamente!',
          `Tu plan semanal personalizado ha sido creado con inteligencia artificial:\n\n• ${config.goals.length === 1 ? '1 objetivo de salud' : `${config.goals.length} objetivos de salud`}\n• Peso: ${config.weight} kg, Altura: ${config.height} cm\n• IMC: ${bmi.toFixed(1)}\n• Metabolismo Basal (MCI): ${Math.round(bmr)} cal/día\n• Tasa Metabólica Total: ${Math.round(tmt)} cal/día\n• Calorías objetivo: ${Math.round(targetCalories)} cal/día\n\n• Nivel de actividad: ${config.activityLevel}\n\n¡Tu plan está listo!`,
          [
            { 
              text: '¡Perfecto!', 
              onPress: () => {
                // Si hay un callback de plan generado, usarlo (para modal)
                if (onPlanGenerated) {
                  onPlanGenerated();
                } else {
                  // Navegar a la pantalla de detalles del plan para ver los menús
                  navigation.navigate('PlanDetail', { planId: weeklyPlan.id });
                }
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Error al generar el plan con IA');
      }
    } catch (error) {
      console.error('Error al generar plan con IA:', error);
      Alert.alert(
        'Error al Generar Plan',
        'No se pudo generar el plan con IA. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStatus('');
      setCurrentTip('');
      stopTipTimer();
    }
  };

  // Función para mapear objetivos a objetivos de la IA
  const mapGoalToObjective = (goal: string): DietConfig['objective'] => {
    const goalMap: { [key: string]: DietConfig['objective'] } = {
      'Pérdida de peso': 'weight_loss',
      'Mantenimiento': 'maintenance',
      'Aumento de masa muscular': 'muscle_gain',
      'Control de diabetes': 'diabetes_control',
      'Salud cardiovascular': 'heart_health',
    };
    return goalMap[goal] || 'weight_loss';
  };

  // Funciones auxiliares para iconos y descripciones
  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'Pérdida de peso': return 'trending-down-outline';
      case 'Mantenimiento': return 'fitness-outline';
      case 'Aumento de masa muscular': return 'barbell-outline';
      case 'Control de diabetes': return 'flask-outline';
      case 'Salud cardiovascular': return 'heart-outline';
      default: return 'help-circle-outline';
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'Pérdida de peso': return Colors.green.sage;
      case 'Mantenimiento': return Colors.green.mint;
      case 'Aumento de masa muscular': return Colors.green.forest;
      case 'Control de diabetes': return Colors.green.olive;
      case 'Salud cardiovascular': return Colors.blue.powder;
      default: return Colors.primary;
    }
  };

  const getGoalDescription = (goal: string) => {
    switch (goal) {
      case 'Pérdida de peso': return 'Perder grasa y mantener músculo';
      case 'Mantenimiento': return 'Mantener peso y salud';
      case 'Aumento de masa muscular': return 'Ganar músculo y fuerza';
      case 'Control de diabetes': return 'Controlar glucosa en sangre';
      case 'Salud cardiovascular': return 'Mejorar salud del corazón';
      default: return 'Objetivo de salud general';
    }
  };

  const getDietaryIcon = (preference: string) => {
    switch (preference) {
      case 'Vegetariana': return 'leaf-outline';
      case 'Vegana': return 'leaf-outline';
      case 'Sin gluten': return 'ban-outline';
      case 'Sin lactosa': return 'close-circle-outline';
      case 'Baja en carbohidratos': return 'fitness-outline';
      case 'Alta en proteínas': return 'barbell-outline';
      default: return 'restaurant-outline';
    }
  };

  const getDietaryDescription = (preference: string) => {
    switch (preference) {
      case 'Vegetariana': return 'Sin carne, con proteínas vegetales';
      case 'Vegana': return 'Sin carne, huevos, leche ni derivados';
      case 'Sin gluten': return 'Sin trigo, avena, cebada o malta';
      case 'Sin lactosa': return 'Sin azúcares de la leche';
      case 'Baja en carbohidratos': return 'Bajo contenido en carbohidratos';
      case 'Alta en proteínas': return 'Rica en proteínas para músculo';
      default: return 'Preferencia dietética general';
    }
  };

  const getAllergenIcon = (allergen: string) => {
    switch (allergen) {
      case 'Gluten': return 'ban-outline';
      case 'Lactosa': return 'close-circle-outline';
      case 'Huevos': return 'ellipse-outline';
      case 'Frutos secos': return 'leaf-outline';
      case 'Mariscos': return 'fish-outline';
      case 'Soja': return 'nutrition-outline';
      case 'Pescado': return 'fish-outline';
      case 'Cacahuetes': return 'nutrition-outline';
      case 'Sésamo': return 'flower-outline';
      case 'Mostaza': return 'warning-outline';
      default: return 'alert-circle-outline';
    }
  };

  const getAllergenDescription = (allergen: string) => {
    switch (allergen) {
      case 'Gluten': return 'Contiene gluten (trigo, cebada, avena)';
      case 'Lactosa': return 'Contiene lactosa (leche, derivados)';
      case 'Huevos': return 'Contiene huevos';
      case 'Frutos secos': return 'Contiene frutos secos';
      case 'Mariscos': return 'Contiene mariscos';
      case 'Soja': return 'Contiene soja';
      case 'Pescado': return 'Contiene pescado';
      case 'Cacahuetes': return 'Contiene cacahuetes';
      case 'Sésamo': return 'Contiene sésamo';
      case 'Mostaza': return 'Contiene mostaza';
      default: return 'Alergia o intolerancia general';
    }
  };

  // Función para obtener colores específicos para cada tipo de comida
  const getMealColor = (meal: string) => {
    switch (meal) {
      case 'breakfast': return '#FFD700'; // Dorado amarillento para desayuno
      case 'lunch': return '#228B22'; // Verde bosque más fuerte para almuerzo
      case 'dinner': return '#4169E1'; // Azul real más fuerte para cena
      case 'snacks': return '#8B5CF6'; // Violeta más fuerte para snacks
      default: return Colors.primary;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Paso {currentStep} de {totalSteps}
      </Text>
    </View>
  );

  const renderGenerationProgress = () => (
    <Modal
      visible={isGenerating}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlayContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          style={styles.generationProgressModal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Elementos decorativos de fondo */}
          <View style={styles.modalBackgroundPatterns}>
            <View style={styles.modalPattern1} />
            <View style={styles.modalPattern2} />
            <View style={styles.modalPattern3} />
          </View>
          
          <View style={styles.generationProgressHeader}>
            <View style={styles.generationProgressIconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.iconBackground}
              >
                <Ionicons name="restaurant" size={48} color={Colors.white} />
                <View style={styles.iconGlow} />
              </LinearGradient>
            </View>
            
            <Text style={styles.generationProgressTitle}>Generando tu plan personalizado</Text>
            <Text style={styles.generationProgressSubtitle}>Creando menús únicos con IA avanzada</Text>
            
            {/* Indicador de progreso visual */}
            <View style={styles.progressIndicator}>
              <View style={styles.progressDots}>
                {[0, 1, 2].map((index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.progressDot,
                      generationProgress > index * 33 && styles.progressDotActive,
                      {
                        opacity: dotAnimations[index],
                        transform: [
                          { scale: dotAnimations[index].interpolate({
                            inputRange: [0.3, 1],
                            outputRange: [0.8, 1.3]
                          })}
                        ]
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
          
          {/* Información de estado mejorada */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <Ionicons name="hardware-chip" size={24} color={Colors.white} />
            </View>
            <Text style={styles.statusText}>
              {generationStatus || 'Preparando generación...'}
            </Text>
          </View>
          
          
          {/* Spinner mejorado */}
          <View style={styles.generationProgressSpinner}>
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={Colors.white} style={styles.spinnerWithoutShadow} />
              <Text style={styles.spinnerText}>Procesando...</Text>
            </View>
          </View>
          
          {/* Consejo o tip mejorado */}
          {currentTip && (
            <View style={styles.tipContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.tipGradient}
              >
                <Text style={styles.tipText}>{currentTip}</Text>
              </LinearGradient>
            </View>
          )}
          
          {/* Información adicional */}
          <View style={styles.additionalInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={Colors.white} />
              <Text style={styles.infoText}>Tiempo estimado: hasta 45 segundos</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.white} />
              <Text style={styles.infoText}>Generación segura y privada</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );

  const renderChip = (
    item: string,
    selected: boolean,
    onPress: () => void,
    color: string = Colors.primary,
    iconName?: string,
    description?: string,
    disabled?: boolean
  ) => {
    // Determinar el color basado en el tipo de chip
    let chipColor = color;
    if (color === Colors.primary && item.includes('Pérdida')) {
      chipColor = Colors.green.sage;
    } else if (color === Colors.primary && item.includes('Mantenimiento')) {
      chipColor = Colors.green.mint;
    } else if (color === Colors.primary && item.includes('Masa muscular')) {
      chipColor = Colors.green.forest;
    } else if (color === Colors.primary && item.includes('Diabetes')) {
      chipColor = Colors.green.olive;
    } else if (color === Colors.primary && item.includes('Cardiovascular')) {
      chipColor = Colors.blue.powder;
    }

    // Calcular color de texto legible sobre fondos claros
    const hex = chipColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const selectedTextColor = luminance > 0.7 ? Colors.textPrimary : Colors.white;

    return (
      <TouchableOpacity
        key={item}
        style={[
          styles.chip, 
          selected && { 
            backgroundColor: chipColor, 
            borderColor: chipColor,
            transform: [{ scale: 1.02 }]
          },
          disabled && styles.chipDisabled
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.chipContent}>
          {iconName && (
            <Ionicons 
              name={iconName as any} 
              size={20} 
              color={selected ? selectedTextColor : chipColor} 
              style={styles.chipIcon}
            />
          )}
          <View style={styles.chipTextContainer}>
            <Text style={[styles.chipText, selected && { color: selectedTextColor }, disabled && styles.chipDisabledText]} numberOfLines={2}>
              {item}
            </Text>
            {description && (
              <Text style={[styles.chipDescription, selected && { color: selectedTextColor }, disabled && styles.chipDisabledText]} numberOfLines={2}>
                {description}
              </Text>
            )}
          </View>
          {disabled && (
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
          )}
          {selected && (
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={selectedTextColor} 
              style={styles.chipCheckmark}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconContainer, { backgroundColor: '#2E8B57' }]}>
                <Ionicons name="trending-up" size={32} color={Colors.white} />
              </View>
              <Text style={styles.stepTitle}>¿Cuál es tu objetivo de salud? *</Text>
              <Text style={styles.stepDescription}>
                Selecciona tu objetivo de salud principal (obligatorio)
              </Text>
            </View>
            
            <View style={styles.modernGoalsContainer}>
              <LinearGradient
                colors={['#2E8B57', '#228B22']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.goalsGradient}
              >
                <View style={styles.goalsContent}>
                  <View style={styles.goalsHeader}>
                    <View style={styles.goalsIconContainer}>
                      <Ionicons name="heart" size={28} color="#ffffff" />
                    </View>
                    <View style={styles.goalsTitleContainer}>
                      <Text style={styles.premiumGoalsTitle}>Objetivos de Salud</Text>
                      <Text style={styles.goalsSubtitle}>Elige lo que quieres lograr con tu alimentación</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modernChipsContainer}>
                    {goals.map(goal => (
                      <View key={goal} style={styles.modernChipWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.modernChip,
                            config.goals.includes(goal) && styles.modernChipActive,
                            { borderColor: getGoalColor(goal) }
                          ]}
                          onPress={() => toggleSingleGoal(goal)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.modernChipContent}>
                            <View style={[
                              styles.modernChipIconContainer,
                              config.goals.includes(goal) && styles.modernChipIconContainerActive,
                              { backgroundColor: config.goals.includes(goal) ? getGoalColor(goal) : '#f0f0f0' }
                            ]}>
                              <Ionicons 
                                name={getGoalIcon(goal) as any} 
                                size={20} 
                                color={config.goals.includes(goal) ? '#ffffff' : getGoalColor(goal)} 
                              />
                            </View>
                            <View style={styles.modernChipTextContainer}>
                              <Text style={[
                                styles.modernChipText,
                                { color: config.goals.includes(goal) ? getGoalColor(goal) : '#333333' }
                              ]}>
                                {goal}
                              </Text>
                              <Text style={[
                                styles.modernChipDescription,
                                { color: config.goals.includes(goal) ? getGoalColor(goal) + 'CC' : '#666666' }
                              ]}>
                                {getGoalDescription(goal)}
                              </Text>
                            </View>
                            {config.goals.includes(goal) && (
                              <View style={styles.modernChipCheckmark}>
                                <Ionicons name="checkmark-circle" size={24} color={getGoalColor(goal)} />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconContainer, { backgroundColor: '#228B22' }]}>
                <Ionicons name="leaf" size={32} color={Colors.white} />
              </View>
              <Text style={styles.stepTitle}>¿Tienes preferencias dietéticas?</Text>
              <Text style={styles.stepDescription}>
                Selecciona tus preferencias dietéticas
              </Text>
            </View>
            
            <View style={styles.modernDietaryContainer}>
              <LinearGradient
                colors={['#228B22', '#32CD32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dietaryGradient}
              >
                <View style={styles.dietaryContent}>
                  <View style={styles.dietaryHeader}>
                    <View style={styles.dietaryIconContainer}>
                      <Ionicons name="leaf" size={28} color="#ffffff" />
                    </View>
                    <View style={styles.dietaryTitleContainer}>
                      <Text style={styles.premiumDietaryTitle}>Preferencias Dietéticas</Text>
                      <Text style={styles.dietarySubtitle}>Personaliza tu dieta según tus preferencias</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modernChipsContainer}>
                    {dietaryOptions.map(preference => (
                      <View key={preference} style={styles.modernChipWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.modernChip,
                            config.dietaryPreferences.includes(preference) && styles.modernChipActive,
                            { borderColor: Colors.secondary }
                          ]}
                          onPress={() => toggleArrayItem(config.dietaryPreferences, preference, (value) => setConfig(prev => ({ ...prev, dietaryPreferences: value })))}
                          activeOpacity={0.8}
                        >
                          <View style={styles.modernChipContent}>
                            <View style={[
                              styles.modernChipIconContainer,
                              config.dietaryPreferences.includes(preference) && styles.modernChipIconContainerActive,
                              { backgroundColor: config.dietaryPreferences.includes(preference) ? Colors.secondary : '#f0f0f0' }
                            ]}>
                              <Ionicons 
                                name={getDietaryIcon(preference) as any} 
                                size={20} 
                                color={config.dietaryPreferences.includes(preference) ? '#ffffff' : Colors.secondary} 
                              />
                            </View>
                            <View style={styles.modernChipTextContainer}>
                              <Text style={[
                                styles.modernChipText,
                                { color: config.dietaryPreferences.includes(preference) ? Colors.secondary : '#333333' }
                              ]}>
                                {preference}
                              </Text>
                              <Text style={[
                                styles.modernChipDescription,
                                { color: config.dietaryPreferences.includes(preference) ? Colors.secondary + 'CC' : '#666666' }
                              ]}>
                                {getDietaryDescription(preference)}
                              </Text>
                            </View>
                            {config.dietaryPreferences.includes(preference) && (
                              <View style={styles.modernChipCheckmark}>
                                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconContainer, { backgroundColor: '#E74C3C' }]}>
                <Ionicons name="warning" size={32} color={Colors.white} />
              </View>
              <Text style={styles.stepTitle}>¿Tienes alergias o intolerancias?</Text>
              <Text style={styles.stepDescription}>
                Marca los alérgenos a evitar
              </Text>
            </View>
            
            <View style={styles.modernAllergensContainer}>
              <LinearGradient
                colors={['#E74C3C', '#FF6B6B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.allergensGradient}
              >
                <View style={styles.allergensContent}>
                  <View style={styles.allergensHeader}>
                    <View style={styles.allergensIconContainer}>
                      <Ionicons name="shield-checkmark" size={28} color="#ffffff" />
                    </View>
                    <View style={styles.allergensTitleContainer}>
                      <Text style={styles.premiumAllergensTitle}>Alergias e Intolerancias</Text>
                      <Text style={styles.allergensSubtitle}>Marca los ingredientes que debes evitar</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modernChipsContainer}>
                    {allergenOptions.map(allergen => (
                      <View key={allergen} style={styles.modernChipWrapper}>
                        <TouchableOpacity
                          style={[
                            styles.modernChip,
                            config.allergens.includes(allergen) && styles.modernChipActive,
                            { borderColor: Colors.warning }
                          ]}
                          onPress={() => toggleArrayItem(config.allergens, allergen, (value) => setConfig(prev => ({ ...prev, allergens: value })))}
                          activeOpacity={0.8}
                        >
                          <View style={styles.modernChipContent}>
                            <View style={[
                              styles.modernChipIconContainer,
                              config.allergens.includes(allergen) && styles.modernChipIconContainerActive,
                              { backgroundColor: config.allergens.includes(allergen) ? Colors.warning : '#f0f0f0' }
                            ]}>
                              <Ionicons 
                                name={getAllergenIcon(allergen) as any} 
                                size={20} 
                                color={config.allergens.includes(allergen) ? '#ffffff' : Colors.warning} 
                              />
                            </View>
                            <View style={styles.modernChipTextContainer}>
                              <Text style={[
                                styles.modernChipText,
                                { color: config.allergens.includes(allergen) ? Colors.warning : '#333333' }
                              ]}>
                                {allergen}
                              </Text>
                              <Text style={[
                                styles.modernChipDescription,
                                { color: config.allergens.includes(allergen) ? Colors.warning + 'CC' : '#666666' }
                              ]}>
                                {getAllergenDescription(allergen)}
                              </Text>
                            </View>
                            {config.allergens.includes(allergen) && (
                              <View style={styles.modernChipCheckmark}>
                                <Ionicons name="checkmark-circle" size={24} color={Colors.warning} />
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepIconContainer, { backgroundColor: '#667eea' }]}>
                <Ionicons name="body" size={32} color={Colors.white} />
              </View>
              <Text style={styles.stepTitle}>Peso y Altura</Text>
              <Text style={styles.stepDescription}>
                Para calcular tu metabolismo basal (MCI)
              </Text>
            </View>
            
            <View style={styles.modernFormSection}>

              {/* Peso y Altura con diseño premium */}
              <View style={styles.premiumTimeCard}>
                <LinearGradient
                  colors={['#f093fb', '#f5576c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.timeGradient}
                >
                  <View style={styles.timeContent}>
                    <View style={styles.timeHeader}>
                      <View style={styles.timeIconContainer}>
                        <Ionicons name="body" size={28} color="#ffffff" />
                      </View>
                      <View style={styles.timeTitleContainer}>
                        <Text style={styles.premiumTimeTitle}>Peso y Altura</Text>
                        <Text style={styles.timeSubtitle}>Para calcular tu metabolismo basal (MCI)</Text>
                      </View>
                    </View>
                    
                    <View style={styles.timeInputsContainer}>
                      <View style={styles.timeInputCard}>
                        <View style={styles.timeInputHeader}>
                          <View style={styles.timeDayIcon}>
                            <Ionicons name="scale-outline" size={20} color="#f093fb" />
                          </View>
                          <Text style={styles.timeDayLabel}>Peso</Text>
                        </View>
                        <View style={styles.timeInputWrapper}>
                          <TextInput
                            style={styles.premiumTimeInput}
                            value={config.weight.toString()}
                            onChangeText={updateWeight}
                            keyboardType="numeric"
                            placeholder="70"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                          />
                          <Text style={styles.premiumTimeUnit}>kg</Text>
                        </View>
                      </View>

                      <View style={styles.timeInputCard}>
                        <View style={styles.timeInputHeader}>
                          <View style={styles.timeDayIcon}>
                            <Ionicons name="resize-outline" size={20} color="#f093fb" />
                          </View>
                          <Text style={styles.timeDayLabel}>Altura</Text>
                        </View>
                        <View style={styles.timeInputWrapper}>
                          <TextInput
                            style={styles.premiumTimeInput}
                            value={config.height.toString()}
                            onChangeText={updateHeight}
                            keyboardType="numeric"
                            placeholder="170"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                          />
                          <Text style={styles.premiumTimeUnit}>cm</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>

            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // Mostrar prompt de upgrade si no puede crear más planes
  if (showUpgradePrompt) {
    return (
      <View style={styles.container}>
        <UpgradePrompt
          title="Límite de Planes Alcanzado"
          message={`Has creado ${restrictions.plansCreated} plan(es). Con el plan gratuito solo puedes crear 1 plan semanal. Actualiza a premium para crear planes ilimitados con todas las funciones avanzadas.`}
          onUpgrade={() => navigation.navigate('Subscription')}
          onDismiss={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={Colors.premiumGradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerMain}>
            <Ionicons name="create" size={48} color={Colors.white} />
            <Text style={styles.headerTitle}>Generar Plan Semanal</Text>
            <Text style={styles.headerSubtitle}>
              Personaliza tu plan según tus necesidades
            </Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Barra de progreso */}
      {renderProgressBar()}

      {/* Contenido del paso actual */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Modal de progreso de generación */}
      {renderGenerationProgress()}

      {/* Botones de navegación */}
      {!isGenerating && (
        <View style={styles.navigationButtons}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
              <Ionicons name="arrow-back" size={20} color={Colors.primary} />
              <Text style={styles.prevButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < totalSteps ? (
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                currentStep === 1 && config.goals.length === 0 && styles.nextButtonDisabled
              ]} 
              onPress={nextStep}
              disabled={currentStep === 1 && config.goals.length === 0}
            >
              <Text style={[
                styles.nextButtonText,
                currentStep === 1 && config.goals.length === 0 && styles.nextButtonTextDisabled
              ]}>
                Siguiente
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={currentStep === 1 && config.goals.length === 0 ? Colors.gray : Colors.white} 
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={generatePlan}
            >
              <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
              <Text style={styles.generateButtonText}>Generar Plan con IA</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    ...Shadows.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: Spacing.xs,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerMain: {
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.small,
    overflow: 'hidden',
  },
  headerIcon: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  progressContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginHorizontal: Spacing.md,
    marginTop: -Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.pill,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: Spacing.md,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  stepIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  stepTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
    fontWeight: '800',
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
    paddingHorizontal: Spacing.sm,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  chipWrapper: {
    width: '48%',
    marginBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  chipIcon: {
    marginRight: Spacing.sm,
  },
  chipTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    minWidth: 0,
  },
  chipText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  selectedChipText: {
    color: Colors.white,
  },
  chipDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  selectedChipDescription: {
    color: Colors.white,
  },
  chipCheckmark: {
    marginLeft: Spacing.sm,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipDisabledText: {
    color: Colors.textSecondary,
  },
  formSection: {
    gap: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  textInput: {
    borderWidth: 2,
    borderColor: Colors.gray,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: Typography.bodySmall.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    ...Shadows.small,
    minHeight: 56,
  },
  mealsSection: {
    gap: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    padding: Spacing.lg,
    ...Shadows.small,
    marginBottom: Spacing.sm,
  },
  mealCardActive: {
    borderWidth: 3,
    ...Shadows.medium,
    transform: [{ scale: 1.02 }],
  },
  mealCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  mealTextContainer: {
    flex: 1,
  },
  mealLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  mealSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  mealStatus: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealStatusActive: {
    ...Shadows.small,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  mealStatusInactive: {
    backgroundColor: Colors.lightGray,
    borderWidth: 2,
    borderColor: Colors.gray,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    marginTop: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: '700',
  },
  summaryContent: {
    gap: Spacing.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  summaryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  summaryEmptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    ...Shadows.medium,
  },
  prevButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
    minHeight: 56,
  },
  prevButtonText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: '700',
    fontSize: 14,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    minHeight: 56,
  },
  nextButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginRight: Spacing.sm,
    fontWeight: '700',
    fontSize: 14,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.lightGray,
    opacity: 0.6,
  },
  nextButtonTextDisabled: {
    color: Colors.gray,
  },
  generateButton: {
    flex: 1,
    backgroundColor: Colors.green.emerald,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    minHeight: 56,
    overflow: 'hidden',
  },
  generateButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
    fontWeight: '700',
    fontSize: 14,
  },
  additionalOptionsContainer: {
    gap: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.glass,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    padding: Spacing.lg,
    ...Shadows.small,
    marginBottom: Spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    ...Shadows.small,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  generationProgressModal: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    minWidth: Dimensions.get('window').width * 0.85,
    maxWidth: Dimensions.get('window').width * 0.95,
    ...Shadows.large,
    position: 'relative',
    overflow: 'hidden',
  },
  modalBackgroundPatterns: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalPattern1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalPattern3: {
    position: 'absolute',
    top: '50%',
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ translateY: -50 }],
  },
  generationProgressHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
    zIndex: 1,
  },
  generationProgressIconContainer: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Shadows.large,
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -10,
    left: -10,
    zIndex: -1,
  },
  progressIndicator: {
    marginTop: Spacing.lg,
  },
  progressDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: [{ scale: 1.2 }],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
    flex: 1,
  },
  generationProgressTitle: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 24,
    letterSpacing: 0.5,
  },
  generationProgressSubtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.9,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  progressBarWrapper: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  progressPercentage: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    fontSize: 16,
  },
  warningContainer: {
    backgroundColor: '#FFF8E1', // Amarillo muy suave y elegante
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE082', // Borde dorado suave
    ...Shadows.medium,
  },
  warningText: {
    ...Typography.bodySmall,
    color: '#E65100', // Naranja oscuro elegante
    marginLeft: Spacing.md,
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
    fontSize: 14,
  },
  generationProgressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  generationProgressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#E3F2FD', // Azul muy suave
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BBDEFB', // Borde azul más claro
    ...Shadows.small,
  },
  generationProgressFill: {
    height: '100%',
    backgroundColor: '#1976D2', // Azul elegante
    borderRadius: BorderRadius.pill,
    ...Shadows.small,
  },
  generationProgressText: {
    ...Typography.body,
    color: '#424242', // Gris elegante
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '700',
    lineHeight: 22,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  generationProgressSpinner: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  spinnerContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  spinnerText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
    opacity: 0.9,
  },
  spinnerWithoutShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  tipContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  tipGradient: {
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.white,
    flex: 1,
    lineHeight: 22,
    fontWeight: '600',
    fontSize: 14,
  },
  additionalInfo: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    fontSize: 12,
  },
  // Estilos para el paso 4 - Peso y Altura
  modernFormSection: {
    gap: Spacing.xl,
  },
  premiumTimeCard: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  timeGradient: {
    padding: Spacing.xl,
  },
  timeContent: {
    gap: Spacing.lg,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  timeTitleContainer: {
    flex: 1,
  },
  premiumTimeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  timeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeInputsContainer: {
    gap: Spacing.md,
  },
  timeInputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  timeDayIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  premiumTimeInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  premiumTimeUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    minWidth: 40,
    textAlign: 'center',
  },
  // Estilos modernos para todos los pasos
  modernGoalsContainer: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  goalsGradient: {
    padding: Spacing.xl,
  },
  goalsContent: {
    gap: Spacing.lg,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  goalsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  goalsTitleContainer: {
    flex: 1,
  },
  premiumGoalsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  goalsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modernDietaryContainer: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  dietaryGradient: {
    padding: Spacing.xl,
  },
  dietaryContent: {
    gap: Spacing.lg,
  },
  dietaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dietaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  dietaryTitleContainer: {
    flex: 1,
  },
  premiumDietaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dietarySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modernAllergensContainer: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  allergensGradient: {
    padding: Spacing.xl,
  },
  allergensContent: {
    gap: Spacing.lg,
  },
  allergensHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  allergensIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  allergensTitleContainer: {
    flex: 1,
  },
  premiumAllergensTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  allergensSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modernChipsContainer: {
    gap: Spacing.md,
  },
  modernChipWrapper: {
    marginBottom: Spacing.sm,
  },
  modernChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  modernChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#4CAF50',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modernChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  modernChipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  modernChipIconContainerActive: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modernChipTextContainer: {
    flex: 1,
    gap: 2,
  },
  modernChipText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modernChipDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  modernChipCheckmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PlanGeneratorScreen;

