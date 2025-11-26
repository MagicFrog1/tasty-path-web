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
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows, Effects } from '../constants';
import { useUserProfile, UserDietConfig } from '../context/UserProfileContext';
import { useSubscriptionRestrictions, FREE_PLAN_OPTIONS } from '../hooks/useSubscriptionRestrictions';

interface DietConfig {
  goals: string[];
  dietaryPreferences: string[];
  allergens: string[];
  weeklyBudget: number;
  cookingTime: {
    weekdays: number;
    weekends: number;
  };
  // Comidas siempre configuradas para 3 comidas al día
  mealCount: {
    breakfast: boolean; // Siempre true
    lunch: boolean;     // Siempre true
    dinner: boolean;    // Siempre true
    snacks: boolean;
  };
}

const DietConfigScreen: React.FC = () => {
  const { dietConfig, updateDietConfig } = useUserProfile();
  const [config, setConfig] = useState(dietConfig);

  // Restricciones según el plan actual
  const restrictions = useSubscriptionRestrictions();
  const isFreePlan = !restrictions.canUseAllGoals; // indicativo de plan gratuito

  const [activeSection, setActiveSection] = useState<string>('goals');

  const goals = [
    'Pérdida de peso',
    'Mantenimiento',
    'Aumento de masa muscular',
    'Mejorar energía',
    'Control de diabetes',
    'Salud cardiovascular',
    'Digestión saludable',
    'Mejorar el sueño',
  ];

  const dietaryOptions = [
    'Vegetariana',
    'Vegana',
    'Sin gluten',
    'Sin lactosa',
    'Baja en carbohidratos',
    'Alta en proteínas',
    'Keto',
    'Paleo',
    'Mediterránea',
    'Baja en sodio',
  ];

  const allergenOptions = [
    'Gluten',
    'Lactosa',
    'Huevos',
    'Frutos secos',
    'Mariscos',
    'Soja',
    'Pescado',
    'Cacahuetes',
    'Sésamo',
    'Mostaza',
  ];

  // Eliminamos specialRequirements ya que no se necesitan

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void, section: 'goals' | 'dietaryPreferences' | 'allergens') => {
    // Si es plan gratuito y el item no está permitido, mostrar alerta y no permitir selección
    if (isFreePlan) {
      const allowed = FREE_PLAN_OPTIONS[section as keyof typeof FREE_PLAN_OPTIONS] as string[] | undefined;
      const isAllowed = Array.isArray(allowed) && allowed.includes(item);
      if (!isAllowed) {
        Alert.alert(
          'Función Premium',
          'Hazte premium para elegir esta opción.',
          [{ text: 'Entendido' }]
        );
        return;
      }
    }
    if (array.includes(item)) {
      const newArray = array.filter(i => i !== item);
      setter(newArray);
      updateDietConfig({ [getArrayKey(array)]: newArray });
    } else {
      const newArray = [...array, item];
      setter(newArray);
      updateDietConfig({ [getArrayKey(array)]: newArray });
    }
  };

  const getArrayKey = (array: string[]): keyof UserDietConfig => {
    if (array === config.goals) return 'goals';
    if (array === config.dietaryPreferences) return 'dietaryPreferences';
    if (array === config.allergens) return 'allergens';
    return 'goals';
  };

  const updateBudget = (value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, weeklyBudget: numValue }));
    updateDietConfig({ weeklyBudget: numValue });
  };

  const updateCookingTime = (type: 'weekdays' | 'weekends', value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({
      ...prev,
      cookingTime: { ...prev.cookingTime, [type]: numValue }
    }));
    updateDietConfig({ 
      cookingTime: { 
        ...config.cookingTime, 
        [type]: numValue 
      } 
    });
  };

  // Las comidas principales (desayuno, almuerzo, cena) siempre están habilitadas
  // Solo se puede configurar snacks
  const toggleSnacks = () => {
    const newSnacksValue = !config.mealCount.snacks;
    setConfig(prev => ({
      ...prev,
      mealCount: { 
        ...prev.mealCount, 
        snacks: newSnacksValue 
      }
    }));
    updateDietConfig({ 
      mealCount: { 
        ...config.mealCount, 
        snacks: newSnacksValue 
      } 
    });
  };

  const saveConfiguration = () => {
    // Validación: al menos un objetivo de salud es obligatorio
    if (!config.goals || config.goals.length === 0) {
      setActiveSection('goals');
      Alert.alert(
        'Selecciona un objetivo',
        'Debes seleccionar al menos un objetivo de salud para continuar.'
      );
      return;
    }
    // Guardar toda la configuración en el contexto
    updateDietConfig(config);
    
    Alert.alert(
      'Configuración Guardada',
      'Tu configuración de dieta ha sido guardada exitosamente. Ahora puedes generar tu plan semanal personalizado.',
      [{ text: 'Perfecto' }]
    );
  };

  const isSaveDisabled = !config.goals || config.goals.length === 0;

  const renderSection = (title: string, children: React.ReactNode, isActive: boolean) => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setActiveSection(activeSection === title ? '' : title)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={isActive ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={Colors.primary}
        />
      </TouchableOpacity>
      {isActive && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );

  const renderChip = (
    item: string,
    selected: boolean,
    onPress: () => void,
    color: string = Colors.primary,
    disabled: boolean = false
  ) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.chip,
        selected && { backgroundColor: color, borderColor: color },
        disabled && styles.chipDisabled
      ]}
      onPress={onPress}
      disabled={false}
    >
      <View style={styles.chipInnerRow}>
        {disabled && <Ionicons name="lock-closed-outline" size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />}
        <Text style={[styles.chipText, selected && styles.selectedChipText, disabled && styles.chipDisabledText]}>
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
      <LinearGradient
        colors={Colors.premiumGradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Ionicons name="settings" size={48} color={Colors.white} />
          <Text style={styles.headerTitle}>Configurar Mi Dieta</Text>
          <Text style={styles.headerSubtitle}>
            Personaliza tu plan semanal según tus necesidades
          </Text>
        </View>
      </LinearGradient>

      {/* Configuración de objetivos */}
      {renderSection('Objetivos de Salud', (
        <View style={styles.chipsContainer}>
          {goals.map(goal => {
            const disabled = isFreePlan && !FREE_PLAN_OPTIONS.goals.includes(goal);
            return renderChip(
              goal,
              config.goals.includes(goal),
              () => toggleArrayItem(config.goals, goal, (value) => setConfig(prev => ({ ...prev, goals: value })), 'goals'),
              Colors.primary,
              disabled
            );
          })}
        </View>
      ), activeSection === 'goals')}

      {/* Preferencias dietéticas */}
      {renderSection('Preferencias Dietéticas', (
        <View style={styles.chipsContainer}>
          {dietaryOptions.map(preference => {
            const allowed = FREE_PLAN_OPTIONS.dietaryPreferences;
            const disabled = isFreePlan && !allowed.includes(preference);
            return renderChip(
              preference,
              config.dietaryPreferences.includes(preference),
              () => toggleArrayItem(config.dietaryPreferences, preference, (value) => setConfig(prev => ({ ...prev, dietaryPreferences: value })), 'dietaryPreferences'),
              Colors.primary,
              disabled
            );
          })}
        </View>
      ), activeSection === 'dietaryPreferences')}

      {/* Alergenos */}
      {renderSection('Alergenos e Intolerancias', (
        <View style={styles.chipsContainer}>
          {allergenOptions.map(allergen => {
            const allowed = FREE_PLAN_OPTIONS.allergens;
            const disabled = isFreePlan && !allowed.includes(allergen);
            return renderChip(
              allergen,
              config.allergens.includes(allergen),
              () => toggleArrayItem(config.allergens, allergen, (value) => setConfig(prev => ({ ...prev, allergens: value })), 'allergens'),
              Colors.error,
              disabled
            );
          })}
        </View>
      ), activeSection === 'allergens')}

      {/* Presupuesto y tiempo - Versión super mejorada */}
      {renderSection('Presupuesto y Tiempo de Cocina', (
        <View style={styles.ultraModernFormSection}>
          {/* Presupuesto con diseño premium */}
          <View style={styles.premiumBudgetCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.budgetGradient}
            >
              <View style={styles.budgetContent}>
                <View style={styles.budgetHeader}>
                  <View style={styles.budgetIconContainer}>
                    <Ionicons name="wallet" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.budgetTitleContainer}>
                    <Text style={styles.premiumBudgetTitle}>Presupuesto Semanal</Text>
                    <Text style={styles.budgetSubtitle}>Define tu gasto ideal en comida</Text>
                  </View>
                </View>
                
                <View style={styles.budgetInputSection}>
                  <View style={styles.budgetInputWrapper}>
                    <TextInput
                      style={styles.premiumTextInput}
                      value={config.weeklyBudget.toString()}
                      onChangeText={updateBudget}
                      keyboardType="numeric"
                      placeholder="60"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                    <Text style={styles.premiumCurrency}>€</Text>
                  </View>
                  
                  <View style={styles.budgetVisualIndicator}>
                    <View style={styles.budgetRanges}>
                      <Text style={styles.budgetRangeLabel}>€0</Text>
                      <View style={styles.budgetSliderContainer}>
                        <View style={styles.budgetSlider}>
                          <View style={[styles.budgetSliderFill, { width: `${Math.min(config.weeklyBudget / 150 * 100, 100)}%` }]} />
                        </View>
                        <View style={styles.budgetSliderMarks}>
                          <View style={styles.budgetMark} />
                          <View style={styles.budgetMark} />
                          <View style={styles.budgetMark} />
                        </View>
                      </View>
                      <Text style={styles.budgetRangeLabel}>€150+</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tiempo de cocina con diseño premium */}
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
                    <Ionicons name="time" size={28} color="#ffffff" />
                  </View>
                  <View style={styles.timeTitleContainer}>
                    <Text style={styles.premiumTimeTitle}>Tiempo de Cocina</Text>
                    <Text style={styles.timeSubtitle}>¿Cuánto tiempo tienes para cocinar?</Text>
                  </View>
                </View>
                
                <View style={styles.timeInputsContainer}>
                  <View style={styles.timeInputCard}>
                    <View style={styles.timeInputHeader}>
                      <View style={styles.timeDayIcon}>
                        <Ionicons name="briefcase" size={20} color="#f093fb" />
                      </View>
                      <Text style={styles.timeDayLabel}>Entre Semana</Text>
                    </View>
                    <View style={styles.timeInputWrapper}>
                      <TextInput
                        style={styles.premiumTimeInput}
                        value={config.cookingTime.weekdays.toString()}
                        onChangeText={(value) => updateCookingTime('weekdays', value)}
                        keyboardType="numeric"
                        placeholder="30"
                        placeholderTextColor="rgba(255,255,255,0.7)"
                      />
                      <Text style={styles.premiumTimeUnit}>min</Text>
                    </View>
                  </View>

                  <View style={styles.timeInputCard}>
                    <View style={styles.timeInputHeader}>
                      <View style={styles.timeDayIcon}>
                        <Ionicons name="calendar" size={20} color="#f093fb" />
                      </View>
                      <Text style={styles.timeDayLabel}>Fines de Semana</Text>
                    </View>
                    <View style={styles.timeInputWrapper}>
                      <TextInput
                        style={styles.premiumTimeInput}
                        value={config.cookingTime.weekends.toString()}
                        onChangeText={(value) => updateCookingTime('weekends', value)}
                        keyboardType="numeric"
                        placeholder="90"
                        placeholderTextColor="rgba(255,255,255,0.7)"
                      />
                      <Text style={styles.premiumTimeUnit}>min</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      ), activeSection === 'budget')}

      {/* Configuración de snacks */}
      {renderSection('Snacks', (
        <View style={styles.snacksSection}>
          <View style={styles.mealRow}>
            <View style={styles.mealInfo}>
              <Ionicons
                name="cafe-outline"
                size={24}
                color={Colors.primary}
              />
              <View style={styles.mealLabelContainer}>
                <Text style={styles.mealLabel}>Incluir Snacks</Text>
                <Text style={styles.mealSubLabel}>Recomendado para mantener energía durante el día</Text>
              </View>
            </View>
            <Switch
              value={config.mealCount.snacks}
              onValueChange={toggleSnacks}
              trackColor={{ false: Colors.gray, true: Colors.primaryLight }}
              thumbColor={config.mealCount.snacks ? Colors.primary : Colors.white}
            />
          </View>
        </View>
      ), activeSection === 'snacks')}

      {/* Botón de guardar */}
      <TouchableOpacity
        style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
        onPress={saveConfiguration}
        disabled={isSaveDisabled}
      >
        <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
        <Text style={[styles.saveButtonText, isSaveDisabled && styles.saveButtonTextDisabled]}>Guardar Configuración</Text>
      </TouchableOpacity>

      {/* Resumen de configuración */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de tu Configuración</Text>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryText}>
            • {config.goals.length} objetivo(s) de salud seleccionado(s)
          </Text>
          <Text style={styles.summaryText}>
            • {config.dietaryPreferences.length} preferencia(s) dietética(s)
          </Text>
          <Text style={styles.summaryText}>
            • {config.allergens.length} alergeno(s) marcado(s)
          </Text>
          <Text style={styles.summaryText}>
            • 3 comidas principales al día (desayuno, almuerzo, cena)
          </Text>
          <Text style={styles.summaryText}>
            • Snacks: {config.mealCount.snacks ? 'Incluidos' : 'No incluidos'}
          </Text>
          <Text style={styles.summaryText}>
            • Presupuesto: €{config.weeklyBudget}/semana
          </Text>
          <Text style={styles.summaryText}>
            • Tiempo cocina: {config.cookingTime.weekdays}min entre semana, {config.cookingTime.weekends}min fines
          </Text>
        </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.white,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.primary,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: -Spacing.sm,
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  chipInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectedChipText: {
    color: Colors.white,
  },
  chipDisabled: {
    opacity: 0.55,
  },
  chipDisabledText: {
    color: Colors.textSecondary,
  },
  formSection: {
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  modernFormSection: {
    gap: Spacing.lg,
  },
  ultraModernFormSection: {
    gap: Spacing.xl,
  },
  premiumBudgetCard: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  budgetGradient: {
    padding: Spacing.xl,
  },
  budgetContent: {
    gap: Spacing.lg,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  budgetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  budgetTitleContainer: {
    flex: 1,
  },
  premiumBudgetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  budgetInputSection: {
    gap: Spacing.lg,
  },
  budgetInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  premiumTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  premiumCurrency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  budgetVisualIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  budgetSliderContainer: {
    position: 'relative',
    marginVertical: Spacing.sm,
  },
  budgetSlider: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetSliderFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  budgetSliderMarks: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    height: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  budgetMark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
  budgetRanges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetRangeLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
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
  snacksSection: {
    gap: Spacing.md,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  mealLabelContainer: {
    flex: 1,
  },
  mealLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  mealSubLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  saveButtonTextDisabled: {
    color: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  summaryContent: {
    gap: Spacing.sm,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default DietConfigScreen;
