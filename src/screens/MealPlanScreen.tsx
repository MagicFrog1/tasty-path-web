import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import PlanGeneratorScreen from './PlanGeneratorScreen';
import { useWeeklyPlan } from '../context/WeeklyPlanContext';
import { useSubscriptionRestrictions } from '../hooks/useSubscriptionRestrictions';
import UpgradePrompt from '../components/UpgradePrompt';

interface MealPlanDay {
  day: string;
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks?: Recipe[];
}

interface Recipe {
  id: string;
  name: string;
  imageUrl: string;
  cookingTime: number;
  calories: number;
  price: number;
}

interface MealPlanScreenProps {
  navigation: any;
}

const MealPlanScreen: React.FC<MealPlanScreenProps> = ({ navigation }) => {
  const { activePlan } = useWeeklyPlan();
  const restrictions = useSubscriptionRestrictions();
  const [selectedDay, setSelectedDay] = useState(0);
  const [showPlanGenerator, setShowPlanGenerator] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);

  const totalWeeklyCost = mealPlan.reduce((total, day) => {
    const dayCost = (day.breakfast?.price || 0) + (day.lunch?.price || 0) + (day.dinner?.price || 0);
    return total + dayCost;
  }, 0);

  const totalWeeklyCalories = mealPlan.reduce((total, day) => {
    const dayCalories = (day.breakfast?.calories || 0) + (day.lunch?.calories || 0) + (day.dinner?.calories || 0);
    return total + dayCalories;
  }, 0);

  const totalWeeklyCookingTime = mealPlan.reduce((total, day) => {
    const dayTime = (day.breakfast?.cookingTime || 0) + (day.lunch?.cookingTime || 0) + (day.dinner?.cookingTime || 0);
    return total + dayTime;
  }, 0);

  // Función para mostrar detalles de la receta
  const showRecipeDetails = (meal: Recipe) => {
    // Crear objeto de receta completo para la pantalla de detalles
    const fullRecipe = {
      id: meal.id,
      name: meal.name,
      description: `Deliciosa receta de ${meal.name.toLowerCase()} con ingredientes frescos y nutritivos.`,
      image: meal.imageUrl,
      time: meal.cookingTime,
      calories: meal.calories,
      difficulty: 'Fácil' as const,
      servings: 2,
      ingredients: [
        'Ingrediente principal',
        'Especias y condimentos',
        'Verduras frescas',
        'Aceite de oliva',
        'Sal y pimienta al gusto',
      ],
      instructions: [
        'Preparar los ingredientes principales',
        'Calentar el aceite en una sartén',
        'Cocinar los ingredientes según las indicaciones',
        'Añadir especias y condimentos',
        'Servir caliente y disfrutar',
      ],
      nutritionInfo: {
        protein: Math.round(meal.calories * 0.25 / 4),
        carbs: Math.round(meal.calories * 0.55 / 4),
        fat: Math.round(meal.calories * 0.20 / 9),
        fiber: Math.round(meal.calories * 0.05),
      },
    };
    
    navigation.navigate('RecipeDetail', { recipe: fullRecipe });
  };

  const renderMealCard = (meal: Recipe | undefined, mealType: string, mealTypeLabel: string) => {
    if (!meal) {
      return (
        <TouchableOpacity
          style={styles.emptyMealCard}
          onPress={() => Alert.alert('Agregar Comida', `¿Quieres agregar ${mealTypeLabel.toLowerCase()}?`)}
        >
          <Ionicons name="add-circle-outline" size={32} color={Colors.gray} />
          <Text style={styles.emptyMealText}>Agregar {mealTypeLabel}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.mealCard}
        onPress={() => showRecipeDetails(meal)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} />
        <View style={styles.mealInfo}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.mealMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.darkGray} />
              <Text style={styles.metaText}>{meal.cookingTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={14} color={Colors.darkGray} />
              <Text style={styles.metaText}>{meal.calories} cal</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color={Colors.darkGray} />
              <Text style={styles.metaText}>€{meal.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => Alert.alert('Editar', 'Funcionalidad de edición próximamente')}
        >
          <Ionicons name="create-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Mostrar el generador de planes como una pantalla modal
  if (showPlanGenerator) {
    return (
      <View style={styles.modalContainer}>
        {/* Header del modal con botón de cerrar */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowPlanGenerator(false)}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Generar Plan Semanal</Text>
          <View style={styles.closeButton} />
        </View>
        <PlanGeneratorScreen 
          navigation={navigation} 
          onPlanGenerated={() => setShowPlanGenerator(false)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botón para generar plan */}
      <View style={styles.generatePlanContainer}>
        {restrictions.canCreatePlan ? (
          <TouchableOpacity 
            style={styles.generatePlanButton}
            onPress={() => setShowPlanGenerator(true)}
          >
            <Ionicons name="create" size={24} color={Colors.white} />
            <Text style={styles.generatePlanButtonText}>Generar Nuevo Plan Semanal</Text>
          </TouchableOpacity>
        ) : (
          <UpgradePrompt
            title="Límite de Planes Alcanzado"
            message={`Has creado ${restrictions.plansCreated} plan(es). Con el plan gratuito solo puedes crear 1 plan semanal. Actualiza a premium para crear planes ilimitados.`}
            onUpgrade={() => navigation.navigate('Subscription')}
            showDismiss={false}
          />
        )}
      </View>

      {/* Información del plan activo */}
      {activePlan ? (
        <View style={styles.activePlanInfo}>
          <View style={styles.activePlanHeader}>
            <View style={styles.activePlanHeaderLeft}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
              <View style={styles.activePlanHeaderText}>
                <Text style={styles.activePlanTitle}>Plan Activo</Text>
                <Text style={styles.activePlanSubtitle}>Seguimiento en curso</Text>
              </View>
            </View>
            <View style={styles.activePlanStatus}>
              <View style={styles.activePlanStatusDot} />
              <Text style={styles.activePlanStatusText}>En Progreso</Text>
            </View>
          </View>
          
          <View style={styles.activePlanContent}>
            <Text style={styles.activePlanName}>{activePlan.name}</Text>
            <Text style={styles.activePlanDescription}>{activePlan.description}</Text>
            
            <View style={styles.activePlanProgress}>
              <View style={styles.activePlanProgressBar}>
                <View style={[
                  styles.activePlanProgressFill, 
                  { width: `${activePlan.progress?.percentage || 0}%` }
                ]} />
              </View>
              <Text style={styles.activePlanProgressText}>
                {activePlan.progress?.percentage || 0}% Completado
              </Text>
            </View>
          </View>
          
          <View style={styles.activePlanStats}>
            <View style={styles.activePlanStat}>
              <View style={styles.activePlanStatIcon}>
                <Ionicons name="restaurant" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.activePlanStatNumber}>{activePlan.totalMeals}</Text>
              <Text style={styles.activePlanStatLabel}>Comidas</Text>
            </View>
            <View style={styles.activePlanStat}>
              <View style={styles.activePlanStatIcon}>
                <Ionicons name="flame" size={20} color={Colors.warning} />
              </View>
              <Text style={styles.activePlanStatNumber}>{Math.round(activePlan.totalCalories / 1000)}k</Text>
              <Text style={styles.activePlanStatLabel}>Calorías</Text>
            </View>
            <View style={styles.activePlanStat}>
              <View style={styles.activePlanStatIcon}>
                <Ionicons name="pricetag" size={20} color={Colors.info} />
              </View>
              <Text style={styles.activePlanStatNumber}>€{activePlan.totalCost.toFixed(0)}</Text>
              <Text style={styles.activePlanStatLabel}>Presupuesto</Text>
            </View>
          </View>
          
          <View style={styles.activePlanActions}>
            <TouchableOpacity 
              style={styles.activePlanActionButton}
              onPress={() => navigation.navigate('WeeklyPlanner')}
            >
              <Ionicons name="eye" size={18} color={Colors.primary} />
              <Text style={styles.activePlanActionText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}



      {/* Resumen semanal */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumen de la Semana</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>€{totalWeeklyCost.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Presupuesto</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>{totalWeeklyCalories}</Text>
            <Text style={styles.summaryLabel}>Calorías</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryNumber}>{totalWeeklyCookingTime}</Text>
            <Text style={styles.summaryLabel}>Min. Cocina</Text>
          </View>
        </View>
      </View>

      {/* Selector de días */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {mealPlan.map((day, index) => (
          <TouchableOpacity
            key={day.day}
            style={[
              styles.dayButton,
              selectedDay === index && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === index && styles.selectedDayText,
              ]}
            >
              {day.day}
            </Text>
            <Text
              style={[
                styles.dateText,
                selectedDay === index && styles.selectedDateText,
              ]}
            >
              {day.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plan del día seleccionado */}
      {mealPlan.length > 0 ? (
        <View style={styles.dayPlanContainer}>
          <Text style={styles.dayPlanTitle}>
            Plan para el {mealPlan[selectedDay]?.day || 'día seleccionado'}
          </Text>
          
          <View style={styles.mealSection}>
            <Text style={styles.mealSectionTitle}>Desayuno</Text>
            {renderMealCard(mealPlan[selectedDay]?.breakfast, 'breakfast', 'Desayuno')}
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealSectionTitle}>Almuerzo</Text>
            {renderMealCard(mealPlan[selectedDay]?.lunch, 'lunch', 'Almuerzo')}
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealSectionTitle}>Cena</Text>
            {renderMealCard(mealPlan[selectedDay]?.dinner, 'dinner', 'Cena')}
          </View>

          <View style={styles.mealSection}>
            <Text style={styles.mealSectionTitle}>Snacks</Text>
            <TouchableOpacity
              style={styles.emptyMealCard}
              onPress={() => Alert.alert('Agregar Snacks', '¿Quieres agregar snacks?')}
            >
              <Ionicons name="add-circle-outline" size={32} color={Colors.gray} />
              <Text style={styles.emptyMealText}>Agregar Snacks</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noMealPlanContainer}>
          <Ionicons name="restaurant-outline" size={64} color={Colors.gray} />
          <Text style={styles.noMealPlanTitle}>No hay plan de comidas</Text>
          <Text style={styles.noMealPlanText}>
            Genera un plan personalizado o selecciona uno de los planes semanales disponibles
          </Text>
        </View>
      )}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMain: {
    flex: 1,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  headerIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  generatePlanContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  generatePlanButton: {
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  generatePlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  generatePlanIcon: {
    padding: Spacing.sm,
  },
  generatePlanText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  generatePlanButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  generatePlanSubtext: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
  },
  generatePlanArrow: {
    padding: Spacing.sm,
  },
  activePlanInfo: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  activePlanGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  activePlanHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePlanHeaderText: {
    flex: 1,
  },
  activePlanStatusIcon: {
    padding: Spacing.sm,
  },
  activePlanTitle: {
    ...Typography.h4,
    color: Colors.success,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  activePlanSubtitle: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '500',
  },
  activePlanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  activePlanStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  activePlanStatusText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '500',
  },
  activePlanContent: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  activePlanName: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  activePlanDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  activePlanProgress: {
    marginBottom: Spacing.md,
  },
  activePlanProgressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  activePlanProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  activePlanProgressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  activePlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  activePlanStat: {
    alignItems: 'center',
  },
  activePlanStatIcon: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activePlanStatNumber: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  activePlanStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  activePlanActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  activePlanActionButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  activePlanActionText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600',
  },
  summaryContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  summaryGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    justifyContent: 'center',
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.white,
    textAlign: 'center',
    marginLeft: Spacing.sm,
    fontWeight: '700',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.sm,
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatIcon: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryNumber: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing.xs,
    fontWeight: '800',
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600',
  },
  daysContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  daysTitle: {
    ...Typography.h4,
    marginBottom: Spacing.sm,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  daysScroll: {
    paddingVertical: Spacing.sm,
  },
  dayButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
    ...Shadows.small,
    overflow: 'hidden',
  },
  dayButtonGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: '100%',
  },
  selectedDayButton: {
    backgroundColor: Colors.white,
  },
  dayText: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  selectedDayText: {
    color: Colors.white,
    fontWeight: '700',
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedDateText: {
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600',
  },
  dayPlanContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  dayPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    justifyContent: 'center',
  },
  dayPlanTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: '700',
  },
  mealSection: {
    marginBottom: Spacing.lg,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealSectionIcon: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  mealSectionTitle: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  mealCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  mealCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  mealInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mealName: {
    ...Typography.h4,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  mealMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaIcon: {
    padding: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  editButton: {
    padding: Spacing.sm,
    alignSelf: 'center',
  },
  emptyMealCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.gray,
    borderStyle: 'dashed',
    ...Shadows.small,
  },
  emptyMealGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  emptyMealIcon: {
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  emptyMealText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  emptyMealSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  noMealPlanContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.small,
    overflow: 'hidden',
  },
  noMealPlanGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    width: '100%',
  },
  noMealPlanIcon: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  noMealPlanTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  noMealPlanText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    ...Shadows.medium,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  closeButtonContainer: {
    padding: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.white,
    flex: 1,
    fontWeight: '700',
  },
});

export default MealPlanScreen;
