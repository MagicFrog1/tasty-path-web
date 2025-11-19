import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { MedicalCitation } from '../components/MedicalCitation';

interface UserPreferencesScreenProps {
  navigation: any;
}

const UserPreferencesScreen: React.FC<UserPreferencesScreenProps> = ({ navigation }) => {
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  
  // Opciones disponibles para cada categoría
  const availableOptions = {
    dietaryPreferences: [
      'saludable', 'equilibrado', 'bajo en calorías', 'alto en proteínas',
      'bajo en carbohidratos', 'vegetariano', 'vegano', 'sin gluten',
      'bajo en sodio', 'rico en fibra', 'antiinflamatorio', 'detox'
    ],
    allergies: [
      'gluten', 'lactosa', 'frutos secos', 'mariscos', 'huevos', 'soja',
      'pescado', 'trigo', 'leche', 'cacahuetes', 'sésamo', 'mostaza'
    ],
    cuisinePreferences: [
      'mediterránea', 'asiática', 'mexicana', 'italiana', 'francesa',
      'india', 'griega', 'japonesa', 'tailandesa', 'libanesa', 'española',
      'americana', 'caribeña', 'africana', 'turca'
    ],
    restrictions: [
      'sin azúcar', 'sin sal', 'sin aceite', 'sin fritos', 'sin procesados',
      'orgánico', 'local', 'de temporada', 'sin conservantes'
    ],
    healthGoals: [
      'perder peso', 'mantener peso', 'ganar masa muscular', 'energía',
      'digestión', 'sistema inmune', 'salud cardiovascular', 'control diabetes',
      'rendimiento deportivo', 'bienestar general'
    ]
  };

  // Función para alternar una opción en una categoría
  const toggleOption = (category: keyof typeof preferences, option: string) => {
    const currentOptions = preferences[category] as string[];
    const isSelected = currentOptions.includes(option);
    
    if (isSelected) {
      // Remover opción
      const updatedOptions = currentOptions.filter(item => item !== option);
      updatePreferences({ [category]: updatedOptions });
    } else {
      // Agregar opción
      const updatedOptions = [...currentOptions, option];
      updatePreferences({ [category]: updatedOptions });
    }
  };

  // Función para resetear preferencias
  const handleResetPreferences = () => {
    Alert.alert(
      'Resetear Preferencias',
      '¿Estás seguro de que quieres resetear todas tus preferencias a los valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetear', 
          style: 'destructive',
          onPress: () => {
            resetPreferences();
            Alert.alert('Preferencias Reseteadas', 'Tus preferencias han sido restablecidas a los valores por defecto.');
          }
        }
      ]
    );
  };

  // Renderizar opciones de una categoría
  const renderCategoryOptions = (
    title: string,
    category: keyof typeof preferences,
    options: string[],
    icon: string
  ) => (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Ionicons name={icon as any} size={24} color={Colors.primary} />
        <Text style={styles.categoryTitle}>{title}</Text>
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = (preferences[category] as string[]).includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionChip,
                isSelected && styles.optionChipSelected
              ]}
              onPress={() => toggleOption(category, option)}
            >
              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}>
                {option}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={Colors.white} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferencias Dietéticas</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Información */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={24} color={Colors.info} />
        <Text style={styles.infoText}>
          Configura tus preferencias para que la IA genere menús personalizados y variados que se adapten a tus necesidades.
        </Text>
      </View>

      {/* Preferencias Dietéticas */}
      {renderCategoryOptions(
        'Preferencias Dietéticas',
        'dietaryPreferences',
        availableOptions.dietaryPreferences,
        'restaurant'
      )}

      {/* Alergias */}
      {renderCategoryOptions(
        'Alergias e Intolerancias',
        'allergies',
        availableOptions.allergies,
        'warning'
      )}

      {/* Estilos de Cocina */}
      {renderCategoryOptions(
        'Estilos de Cocina Preferidos',
        'cuisinePreferences',
        availableOptions.cuisinePreferences,
        'globe'
      )}

      {/* Restricciones */}
      {renderCategoryOptions(
        'Restricciones Específicas',
        'restrictions',
        availableOptions.restrictions,
        'shield-checkmark'
      )}

      {/* Objetivos de Salud */}
      {renderCategoryOptions(
        'Objetivos de Salud',
        'healthGoals',
        availableOptions.healthGoals,
        'fitness'
      )}
      
      {/* Citaciones médicas para objetivos de salud */}
      <MedicalCitation 
        citationIds={['who_nutrition', 'usda_dietary', 'exercise_nutrition', 'nutrition_mental_health']}
        style={styles.healthCitations}
      />

      {/* Nivel de Cocina */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Ionicons name="flame" size={24} color={Colors.primary} />
          <Text style={styles.categoryTitle}>Nivel de Cocina</Text>
        </View>
        <View style={styles.levelContainer}>
          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                preferences.cookingLevel === level && styles.levelButtonSelected
              ]}
              onPress={() => updatePreferences({ cookingLevel: level })}
            >
              <Text style={[
                styles.levelText,
                preferences.cookingLevel === level && styles.levelTextSelected
              ]}>
                {level === 'beginner' ? 'Principiante' : 
                 level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tiempo Máximo de Preparación */}
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Ionicons name="time" size={24} color={Colors.primary} />
          <Text style={styles.categoryTitle}>Tiempo Máximo de Preparación</Text>
        </View>
        <View style={styles.timeContainer}>
          {[15, 30, 45, 60].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeButton,
                preferences.maxPrepTime === time && styles.timeButtonSelected
              ]}
              onPress={() => updatePreferences({ maxPrepTime: time })}
            >
              <Text style={[
                styles.timeText,
                preferences.maxPrepTime === time && styles.timeTextSelected
              ]}>
                {time} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Botones de Acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetPreferences}
        >
          <Ionicons name="refresh" size={20} color={Colors.error} />
          <Text style={styles.resetButtonText}>Resetear Preferencias</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => {
            Alert.alert(
              'Preferencias Guardadas',
              'Tus preferencias han sido guardadas. Ahora la IA generará menús personalizados basados en estas opciones.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          }}
        >
          <Ionicons name="checkmark" size={20} color={Colors.white} />
          <Text style={styles.saveButtonText}>Guardar y Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumen de Preferencias</Text>
        <Text style={styles.summaryText}>
          • {preferences.dietaryPreferences.length} preferencias dietéticas seleccionadas
        </Text>
        <Text style={styles.summaryText}>
          • {preferences.allergies.length} alergias configuradas
        </Text>
        <Text style={styles.summaryText}>
          • {preferences.cuisinePreferences.length} estilos de cocina preferidos
        </Text>
        <Text style={styles.summaryText}>
          • Nivel de cocina: {preferences.cookingLevel === 'beginner' ? 'Principiante' : 
                              preferences.cookingLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}
        </Text>
        <Text style={styles.summaryText}>
          • Tiempo máximo: {preferences.maxPrepTime} minutos
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info,
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.white,
    flex: 1,
    lineHeight: 18,
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.xs,
  },
  optionChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  optionTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  levelContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  levelButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  levelText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  levelTextSelected: {
    color: Colors.white,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  timeButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  timeTextSelected: {
    color: Colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    margin: Spacing.md,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: Spacing.sm,
  },
  resetButtonText: {
    ...Typography.button,
    color: Colors.error,
    fontWeight: '600',
  },
  
  healthCitations: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
});

export default UserPreferencesScreen;
