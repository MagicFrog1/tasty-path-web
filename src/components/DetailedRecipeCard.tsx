import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

const { width } = Dimensions.get('window');

export interface DetailedRecipe {
  id: string;
  name: string;
  description: string;
  difficulty: 'fácil' | 'intermedio' | 'avanzado';
  prepTime: number; // minutos
  cookingTime: number; // minutos
  totalTime: number; // minutos
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  time?: number;
  temperature?: string;
  technique?: string;
  tips?: string;
}

interface DetailedRecipeCardProps {
  recipe: DetailedRecipe;
  onClose?: () => void;
  showFullDetails?: boolean;
}

const DetailedRecipeCard: React.FC<DetailedRecipeCardProps> = ({
  recipe,
  onClose,
  showFullDetails = true
}) => {
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    instructions: true,
    nutrition: false,
  });
  const [currentStep, setCurrentStep] = useState(0);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil': return Colors.success;
      case 'intermedio': return Colors.warning;
      case 'avanzado': return Colors.error;
      default: return Colors.primary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil': return 'checkmark-circle';
      case 'intermedio': return 'alert-circle';
      case 'avanzado': return 'warning';
      default: return 'help-circle';
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'restaurant';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
      default: return 'restaurant';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '#FFD700';
      case 'lunch': return '#228B22';
      case 'dinner': return '#4169E1';
      case 'snack': return '#8B5CF6';
      default: return Colors.primary;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const renderIngredients = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('ingredients')}
      >
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="list" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Text style={styles.sectionSubtitle}>({recipe.ingredients.length} ingredientes)</Text>
        </View>
        <Ionicons 
          name={expandedSections.ingredients ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>

      {expandedSections.ingredients && (
        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <View style={styles.ingredientContent}>
                <Text style={styles.ingredientText}>
                  {ingredient.amount} {ingredient.unit} de {ingredient.name}
                </Text>
                {ingredient.notes && (
                  <Text style={styles.ingredientNotes}>
                    {ingredient.notes}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderInstructions = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('instructions')}
      >
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="book" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Instrucciones</Text>
          <Text style={styles.sectionSubtitle}>({recipe.instructions.length} pasos)</Text>
        </View>
        <Ionicons 
          name={expandedSections.instructions ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>

      {expandedSections.instructions && (
        <View style={styles.instructionsList}>
          {recipe.instructions.map((step, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{step.step}</Text>
              </View>
              
              <View style={styles.instructionContent}>
                <Text style={styles.instructionText}>{step.instruction}</Text>
                
                {(step.time || step.temperature || step.technique) && (
                  <View style={styles.stepDetails}>
                    {step.time && (
                      <View style={styles.stepDetail}>
                        <Ionicons name="time" size={14} color={Colors.textSecondary} />
                        <Text style={styles.stepDetailText}>{step.time} min</Text>
                      </View>
                    )}
                    {step.temperature && (
                      <View style={styles.stepDetail}>
                        <Ionicons name="thermometer" size={14} color={Colors.textSecondary} />
                        <Text style={styles.stepDetailText}>{step.temperature}</Text>
                      </View>
                    )}
                    {step.technique && (
                      <View style={styles.stepDetail}>
                        <Ionicons name="construct" size={14} color={Colors.textSecondary} />
                        <Text style={styles.stepDetailText}>{step.technique}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {step.tips && (
                  <View style={styles.stepTips}>
                    <Ionicons name="bulb" size={14} color={Colors.warning} />
                    <Text style={styles.stepTipsText}>{step.tips}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderNutrition = () => (
    <View style={styles.section}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('nutrition')}
      >
        <View style={styles.sectionTitleContainer}>
          <Ionicons name="nutrition" size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Información Nutricional</Text>
          <Text style={styles.sectionSubtitle}>(por porción)</Text>
        </View>
        <Ionicons 
          name={expandedSections.nutrition ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>

      {expandedSections.nutrition && (
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
            <Text style={styles.nutritionLabel}>Calorías</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
            <Text style={styles.nutritionLabel}>Proteínas</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbohidratos</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
            <Text style={styles.nutritionLabel}>Grasas</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fiber}g</Text>
            <Text style={styles.nutritionLabel}>Fibra</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (!showFullDetails) {
    // Vista compacta para listas
    return (
      <View style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <View style={styles.compactTitleContainer}>
            <Text style={styles.compactTitle}>{recipe.name}</Text>
            <Text style={styles.compactDescription}>{recipe.description}</Text>
          </View>
          <View style={styles.compactBadges}>
            <View style={[styles.compactBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
              <Text style={styles.compactBadgeText}>{recipe.difficulty}</Text>
            </View>
            <View style={[styles.compactBadge, { backgroundColor: getMealTypeColor(recipe.mealType) }]}>
              <Ionicons name={getMealTypeIcon(recipe.mealType)} size={12} color={Colors.white} />
              <Text style={styles.compactBadgeText}>{recipe.mealType}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.compactInfo}>
          <View style={styles.compactInfoItem}>
            <Ionicons name="time" size={14} color={Colors.textSecondary} />
            <Text style={styles.compactInfoText}>{formatTime(recipe.totalTime)}</Text>
          </View>
          <View style={styles.compactInfoItem}>
            <Ionicons name="people" size={14} color={Colors.textSecondary} />
            <Text style={styles.compactInfoText}>{recipe.servings} porciones</Text>
          </View>
          <View style={styles.compactInfoItem}>
            <Ionicons name="flame" size={14} color={Colors.textSecondary} />
            <Text style={styles.compactInfoText}>{recipe.nutrition.calories} cal</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header de la receta */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
          
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>
            
            {/* Badges */}
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
                <Ionicons name={getDifficultyIcon(recipe.difficulty)} size={16} color={Colors.white} />
                <Text style={styles.badgeText}>{recipe.difficulty}</Text>
              </View>
              
              <View style={[styles.badge, { backgroundColor: getMealTypeColor(recipe.mealType) }]}>
                <Ionicons name={getMealTypeIcon(recipe.mealType)} size={16} color={Colors.white} />
                <Text style={styles.badgeText}>{recipe.mealType}</Text>
              </View>
              
              <View style={styles.badge}>
                <Ionicons name="restaurant" size={16} color={Colors.white} />
                <Text style={styles.badgeText}>{recipe.cuisine}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Información rápida */}
      <View style={styles.quickInfo}>
        <View style={styles.quickInfoItem}>
          <Ionicons name="time" size={20} color={Colors.primary} />
          <Text style={styles.quickInfoLabel}>Preparación</Text>
          <Text style={styles.quickInfoValue}>{formatTime(recipe.prepTime)}</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Ionicons name="flame" size={20} color={Colors.primary} />
          <Text style={styles.quickInfoLabel}>Cocción</Text>
          <Text style={styles.quickInfoValue}>{formatTime(recipe.cookingTime)}</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <Text style={styles.quickInfoLabel}>Porciones</Text>
          <Text style={styles.quickInfoValue}>{recipe.servings}</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Ionicons name="nutrition" size={20} color={Colors.primary} />
          <Text style={styles.quickInfoLabel}>Calorías</Text>
          <Text style={styles.quickInfoValue}>{recipe.nutrition.calories}</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {recipe.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Contenido desplegable */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderIngredients()}
        {renderInstructions()}
        {renderNutrition()}
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeHeader: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  recipeTitle: {
    ...Typography.h2,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: 'bold',
  },
  recipeDescription: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  quickInfo: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: -Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.medium,
    justifyContent: 'space-around',
  },
  quickInfoItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickInfoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quickInfoValue: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.lightGray,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  ingredientsList: {
    padding: Spacing.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: Spacing.md,
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  ingredientNotes: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  instructionsList: {
    padding: Spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepNumber: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  stepDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  stepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDetailText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  stepTips: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  stepTipsText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
    fontStyle: 'italic',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.lightGray,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  nutritionValue: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Estilos para vista compacta
  compactCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  compactTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  compactTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  compactDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  compactBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  compactBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  compactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  compactInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default DetailedRecipeCard;
