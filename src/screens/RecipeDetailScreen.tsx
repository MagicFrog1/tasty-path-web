import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { MedicalCitation } from '../components/MedicalCitation';

const { width, height } = Dimensions.get('window');

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  time: number;
  calories: number;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  servings: number;
  ingredients: string[];
  instructions: string[];
  nutritionInfo?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

interface RecipeDetailScreenProps {
  navigation: any;
  route: any;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ navigation, route }) => {
  const { recipe } = route.params;
  const [expandedSections, setExpandedSections] = useState({
    ingredients: true,
    instructions: true,
    nutrition: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return Colors.success;
      case 'Media': return Colors.warning;
      case 'Difícil': return Colors.error;
      default: return Colors.primary;
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'checkmark-circle';
      case 'Media': return 'alert-circle';
      case 'Difícil': return 'warning';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con imagen de la receta */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Botón de regreso */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Información principal de la receta */}
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeTitle}>{recipe.name}</Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
          
          {/* Métricas rápidas */}
          <View style={styles.quickMetrics}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={20} color={Colors.white} />
              <Text style={styles.metricText}>{recipe.time} min</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="flame-outline" size={20} color={Colors.white} />
              <Text style={styles.metricText}>{recipe.calories} cal</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="people-outline" size={20} color={Colors.white} />
              <Text style={styles.metricText}>{recipe.servings} porc.</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons 
                name={getDifficultyIcon(recipe.difficulty) as any} 
                size={20} 
                color={getDifficultyColor(recipe.difficulty)} 
              />
              <Text style={styles.metricText}>{recipe.difficulty}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contenido desplegable */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Ingredientes */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('ingredients')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="restaurant-outline" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Ingredientes</Text>
            </View>
            <Ionicons 
              name={expandedSections.ingredients ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
          
          {expandedSections.ingredients && (
            <View style={styles.sectionContent}>
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sección de Instrucciones */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('instructions')}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="list-outline" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Instrucciones</Text>
            </View>
            <Ionicons 
              name={expandedSections.instructions ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={Colors.primary} 
            />
          </TouchableOpacity>
          
          {expandedSections.instructions && (
            <View style={styles.sectionContent}>
              {recipe.instructions.map((instruction: string, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sección de Información Nutricional */}
        {recipe.nutritionInfo && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => toggleSection('nutrition')}
              activeOpacity={0.7}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Información Nutricional</Text>
              </View>
              <Ionicons 
                name={expandedSections.nutrition ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={Colors.primary} 
              />
            </TouchableOpacity>
            
            {expandedSections.nutrition && (
              <View style={styles.sectionContent}>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Proteínas</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbohidratos</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Grasas</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fiber}g</Text>
                    <Text style={styles.nutritionLabel}>Fibra</Text>
                  </View>
                </View>
                
                {/* Citaciones médicas para información nutricional */}
                <MedicalCitation 
                  citationIds={['usda_nutrient_db', 'protein_requirements', 'fiber_health']}
                  style={styles.nutritionCitations}
                />
              </View>
            )}
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="add-circle" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Agregar a mi Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="heart-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Guardar en Favoritos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeHeader: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  recipeTitle: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recipeDescription: {
    ...Typography.body,
    color: Colors.white,
    marginBottom: Spacing.md,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  quickMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricText: {
    ...Typography.caption,
    color: Colors.white,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    ...Shadows.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    padding: Spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  ingredientText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  instructionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
    elevation: 2,
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  instructionNumberText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  instructionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 24,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  nutritionValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  
  nutritionCitations: {
    marginTop: Spacing.lg,
  },
  actionButtons: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
});

export default RecipeDetailScreen;
