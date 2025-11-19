import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { MedicalCitation } from '../components/MedicalCitation';
import { useWeeklyPlan, WeeklyPlan } from '../context/WeeklyPlanContext';

const { width } = Dimensions.get('window');

interface PlanDetailScreenProps {
  navigation: any;
  route: any;
}

const PlanDetailScreen: React.FC<PlanDetailScreenProps> = ({ navigation, route }) => {
  const { getPlanById } = useWeeklyPlan();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const planId = route.params?.planId;

  useEffect(() => {
    if (planId) {
      // Dar un pequeño delay para permitir que el estado se actualice
      const timer = setTimeout(() => {
        const foundPlan = getPlanById(planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          Alert.alert('Error', 'Plan no encontrado');
          navigation.goBack();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [planId, getPlanById, navigation]);

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando plan...</Text>
      </View>
    );
  }

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'desayuno':
      case 'breakfast':
        return 'sunny-outline';
      case 'almuerzo':
      case 'lunch':
        return 'restaurant-outline';
      case 'cena':
      case 'dinner':
        return 'moon-outline';
      case 'snack':
      case 'snacks':
        return 'cafe-outline';
      default:
        return 'restaurant-outline';
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'desayuno':
      case 'breakfast':
        return Colors.meal.breakfast;
      case 'almuerzo':
      case 'lunch':
        return Colors.meal.lunch;
      case 'cena':
      case 'dinner':
        return Colors.meal.dinner;
      case 'snack':
      case 'snacks':
        return Colors.meal.snack;
      default:
        return Colors.primary;
    }
  };

  const renderMealCard = (meal: any, mealType: string) => (
    <View key={`${mealType}-${selectedDay}`} style={styles.mealCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fff8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mealCardGradient}
      >
        <View style={styles.mealHeader}>
          <View style={styles.mealIconWrapper}>
            <LinearGradient
              colors={[getMealColor(mealType), getMealColor(mealType) + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mealIconContainer}
            >
              <Ionicons name={getMealIcon(mealType) as any} size={24} color={Colors.white} />
            </LinearGradient>
          </View>
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{mealType}</Text>
            <Text style={styles.mealTime}>
              {mealType === 'Desayuno' ? '8:00 AM' :
               mealType === 'Almuerzo' ? '1:00 PM' :
               mealType === 'Cena' ? '8:00 PM' : '10:00 AM / 4:00 PM'}
            </Text>
          </View>
          <View style={styles.caloriesContainer}>
            <LinearGradient
              colors={['#27AE60', '#2ECC71']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.caloriesGradient}
            >
              <Text style={styles.caloriesText}>
                {meal.calorieRange?.display || `${meal.nutrition?.calories || meal.calories || 450} cal`}
              </Text>
            </LinearGradient>
          </View>
        </View>

      <View style={styles.mealContent}>
        <Text style={styles.mealName}>{meal.name || 'Comida del día'}</Text>
        <Text style={styles.mealDescription}>
          {meal.description || 'Descripción de la comida y sus beneficios nutricionales.'}
        </Text>

        {meal.ingredients && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredientes:</Text>
            {meal.ingredients.map((ingredient: string, index: number) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        )}

        {meal.instructions && (
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Instrucciones de Cocina:</Text>
            <Text style={styles.instructionText}>{meal.instructions}</Text>
          </View>
        )}

        <View style={styles.nutritionInfo}>
          <View style={styles.nutritionItem}>
            <View style={styles.nutritionIconContainer}>
              <Ionicons name="fitness" size={16} color="#E74C3C" />
            </View>
            <Text style={styles.nutritionLabel}>Proteínas</Text>
            <Text style={styles.nutritionValue}>{meal.nutrition?.protein || meal.protein || 25}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <View style={styles.nutritionIconContainer}>
              <Ionicons name="leaf" size={16} color="#F39C12" />
            </View>
            <Text style={styles.nutritionLabel}>Carbohidratos</Text>
            <Text style={styles.nutritionValue}>{meal.nutrition?.carbs || meal.carbs || 45}g</Text>
          </View>
          <View style={styles.nutritionItem}>
            <View style={styles.nutritionIconContainer}>
              <Ionicons name="water" size={16} color="#3498DB" />
            </View>
            <Text style={styles.nutritionLabel}>Grasas</Text>
            <Text style={styles.nutritionValue}>{meal.nutrition?.fat || meal.fat || 15}g</Text>
          </View>
        </View>
        
        {/* Citaciones médicas para información nutricional */}
        <MedicalCitation 
          citationIds={['usda_nutrient_db', 'protein_requirements']}
          compact={true}
          showTitle={false}
          style={styles.mealNutritionCitations}
        />
      </View>
      </LinearGradient>
    </View>
  );

  const renderDayContent = () => {
    // Obtener las comidas reales del plan generado por la IA
    const dayMeals = plan.meals?.[selectedDay]?.meals || {
      breakfast: {
        name: 'Comida no disponible',
        description: 'No se encontró información para esta comida.',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: [],
        instructions: ''
      },
      lunch: {
        name: 'Comida no disponible',
        description: 'No se encontró información para esta comida.',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: [],
        instructions: ''
      },
      dinner: {
        name: 'Comida no disponible',
        description: 'No se encontró información para esta comida.',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: [],
        instructions: ''
      },
      snacks: [{
        name: 'Snack no disponible',
        description: 'No se encontró información para este snack.',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        ingredients: [],
        instructions: ''
      }]
    };

    return (
      <View style={styles.dayContent}>
        <View style={styles.dayHeader}>
          <LinearGradient
            colors={['#27AE60', '#2ECC71']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dayTitleContainer}
          >
            <Text style={styles.dayTitle}>{daysOfWeek[selectedDay]}</Text>
            <Text style={styles.daySubtitle}>Plan de comidas personalizado</Text>
          </LinearGradient>
        </View>
        
        {dayMeals.breakfast && renderMealCard(dayMeals.breakfast, 'Desayuno')}
        {dayMeals.lunch && renderMealCard(dayMeals.lunch, 'Almuerzo')}
        {dayMeals.dinner && renderMealCard(dayMeals.dinner, 'Cena')}
        {dayMeals.snacks && dayMeals.snacks.map((snack: any, index: number) => 
          renderMealCard(snack, `Snack ${index + 1}`)
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#27AE60', '#2ECC71', '#58D68D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
                     <TouchableOpacity 
             style={styles.backButton}
             onPress={() => navigation.navigate('PlanManagement')}
           >
             <Ionicons name="arrow-back" size={24} color={Colors.white} />
           </TouchableOpacity>
          
          <View style={styles.headerMain}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="restaurant" size={40} color={Colors.white} />
              <View style={styles.headerIconGlow} />
            </View>
            <Text style={styles.headerTitle}>{plan.name}</Text>
            <Text style={styles.headerSubtitle}>
              Plan semanal personalizado
            </Text>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={16} color={Colors.white} />
                <Text style={styles.statText}>7 días</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Selector de días */}
      <View style={styles.daySelector}>
        <View style={styles.daySelectorHeader}>
          <Ionicons name="calendar-outline" size={20} color="#27AE60" />
          <Text style={styles.daySelectorTitle}>Selecciona un día</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDay === index && styles.dayButtonActive
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <LinearGradient
                colors={selectedDay === index 
                  ? ['#27AE60', '#2ECC71'] 
                  : ['#F8F9FA', '#E9ECEF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.dayButtonGradient}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDay === index && styles.dayButtonTextActive
                ]}>
                  {day}
                </Text>
                <Text style={[
                  styles.dayButtonSubtext,
                  selectedDay === index && styles.dayButtonSubtextActive
                ]}>
                  {index + 1}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido del día */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderDayContent()}
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerMain: {
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statText: {
    ...Typography.caption,
    color: Colors.white,
    marginLeft: Spacing.xs,
    fontWeight: '600',
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
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  daySelector: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginBottom: 0,
    paddingVertical: Spacing.sm,
  },
  daySelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  daySelectorTitle: {
    ...Typography.bodySmall,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  daySelectorContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  dayButton: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    height: 75,
    overflow: 'hidden',
  },
  dayButtonActive: {
    ...Shadows.medium,
  },
  dayButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  dayButtonText: {
    ...Typography.caption,
    color: '#6C757D',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  dayButtonTextActive: {
    color: Colors.white,
  },
  dayButtonSubtext: {
    ...Typography.caption,
    color: '#6C757D',
    fontSize: 12,
    fontWeight: '500',
  },
  dayButtonSubtextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    paddingBottom: Spacing.lg,
  },
  dayContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    minHeight: 400,
  },
  dayHeader: {
    marginBottom: Spacing.lg,
  },
  dayTitleContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.medium,
  },
  dayTitle: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    fontWeight: 'bold',
  },
  daySubtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  mealCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  mealCardGradient: {
    padding: Spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealIconWrapper: {
    marginRight: Spacing.sm,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  mealTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  caloriesContainer: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  caloriesGradient: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  caloriesText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  mealContent: {
    gap: Spacing.sm,
  },
  mealName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  mealDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ingredientsSection: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ingredientText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  instructionsSection: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
    ...Shadows.small,
    elevation: 2,
  },
  instructionText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  nutritionLabel: {
    ...Typography.caption,
    color: '#6C757D',
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  nutritionValue: {
    ...Typography.bodySmall,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  
  mealNutritionCitations: {
    marginTop: Spacing.sm,
    alignSelf: 'center',
  },

});

export default PlanDetailScreen;
