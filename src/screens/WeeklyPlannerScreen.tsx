import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows, CommonStyles } from '../constants';
import { MedicalCitation } from '../components/MedicalCitation';
import { useWeeklyPlan, WeeklyPlan } from '../context/WeeklyPlanContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useUserProfile } from '../context/UserProfileContext';
import AIMenuService, { AIMenuRequest, DaySchedule } from '../services/AIMenuService';
import { testWeeklyPlanDeletion, testContextFunctions } from '../utils/testWeeklyPlanDeletion';

const { width } = Dimensions.get('window');

interface WeeklyPlannerScreenProps {
  navigation: any;
}





const WeeklyPlannerScreen: React.FC<WeeklyPlannerScreenProps> = ({ navigation }) => {
  console.log('🔄 [COMPONENTE] WeeklyPlannerScreen montándose...');
  
  const { weeklyPlans, setActivePlan, updatePlanProgress, deleteWeeklyPlan, updateWeeklyPlan, addWeeklyPlan } = useWeeklyPlan();
  const { preferences: userPreferences } = useUserPreferences();
  const { profile } = useUserProfile();
  
  console.log('🔄 [COMPONENTE] Contexto obtenido:', {
    weeklyPlansLength: weeklyPlans?.length || 0,
    deleteWeeklyPlanAvailable: !!deleteWeeklyPlan,
    setActivePlanAvailable: !!setActivePlan
  });
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<WeeklyPlan | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [selectedDayForDetails, setSelectedDayForDetails] = useState<DaySchedule | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  // Variables para editar el nombre del plan
  const [isEditingPlanName, setIsEditingPlanName] = useState(false);
  const [editingPlanName, setEditingPlanName] = useState('');

  // Funciones auxiliares para el estado de los planes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'completed': return Colors.primary;
      case 'draft': return Colors.gray;
      default: return Colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      default: return 'Desconocido';
    }
  };

  // Funciones para editar el nombre del plan
  const startEditingPlanName = (plan: WeeklyPlan) => {
    setEditingPlanName(plan.name);
    setIsEditingPlanName(true);
  };

  const savePlanName = () => {
    if (selectedPlanForDetails && editingPlanName.trim()) {
      updateWeeklyPlan(selectedPlanForDetails.id, { name: editingPlanName.trim() });
      setSelectedPlanForDetails(prev => prev ? { ...prev, name: editingPlanName.trim() } : null);
      setIsEditingPlanName(false);
      setEditingPlanName('');
    }
  };

  const cancelEditingPlanName = () => {
    setIsEditingPlanName(false);
    setEditingPlanName('');
  };

  // Funciones para manejar los planes
  const showPlanDetailsModal = (plan: WeeklyPlan) => {
    setSelectedPlanForDetails(plan);
    setShowPlanDetails(true);
  };

  const activatePlan = (planId: string) => {
          // Usar la función del contexto para mantener consistencia
      weeklyPlans.forEach(plan => {
        if (plan.id === planId) {
          updateWeeklyPlan(plan.id, { status: 'active' });
        } else {
          updateWeeklyPlan(plan.id, { status: 'draft' });
        }
      });
    setActivePlan(weeklyPlans.find((plan: WeeklyPlan) => plan.id === planId) || null);
    setShowPlanDetails(false);
  };

  const deletePlan = (planId: string) => {
    console.log('🔍 [FUNCIÓN] deletePlan llamada con ID:', planId);
    console.log('🔍 [FUNCIÓN] Iniciando eliminación del plan:', planId);
    console.log('📋 [FUNCIÓN] Planes actuales:', weeklyPlans.length);
    console.log('📋 [FUNCIÓN] Planes:', weeklyPlans.map(p => ({ id: p.id, name: p.name })));
    
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este plan? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            console.log('✅ Usuario confirmó eliminación del plan:', planId);
            
            // Cerrar modal si se está eliminando el plan mostrado
            if (selectedPlanForDetails?.id === planId) {
              setShowPlanDetails(false);
              setSelectedPlanForDetails(null);
              console.log('🔒 Modal cerrado');
            }
            
            // Encontrar el índice del plan a eliminar
            const planIndex = weeklyPlans.findIndex(plan => plan.id === planId);
            console.log('📍 Índice del plan a eliminar:', planIndex);
            
            // Usar la función del contexto para mantener consistencia
            console.log('🗑️ Llamando a deleteWeeklyPlan del contexto...');
            deleteWeeklyPlan(planId);
            console.log('✅ deleteWeeklyPlan ejecutado');
            
            // Ajustar la semana seleccionada inmediatamente
            if (planIndex !== -1) {
              if (selectedWeek === planIndex) {
                // Si se está eliminando la semana seleccionada, seleccionar la anterior
                const newSelectedWeek = Math.max(0, planIndex - 1);
                setSelectedWeek(newSelectedWeek);
                console.log('🔄 Semana seleccionada ajustada a:', newSelectedWeek);
              } else if (selectedWeek > planIndex) {
                // Si la semana seleccionada es posterior a la eliminada, ajustar el índice
                const newSelectedWeek = selectedWeek - 1;
                setSelectedWeek(newSelectedWeek);
                console.log('🔄 Semana seleccionada ajustada a:', newSelectedWeek);
              }
            }
            
            console.log('🗑️ Plan eliminado exitosamente:', planId);
          }
        }
      ]
    );
  };

  // Función para obtener el menú del plan seleccionado
  const getCurrentWeekSchedule = async (): Promise<DaySchedule[]> => {
    if (weeklyPlans.length === 0 || selectedWeek >= weeklyPlans.length) {
      return [];
    }

    const selectedPlan = weeklyPlans[selectedWeek];
    
    // Si el plan tiene menús generados, usarlos
    if (selectedPlan.meals) {
      return selectedPlan.meals;
    }
    
    // Si no tiene menús, generarlos con IA
    try {
      const aiRequest: AIMenuRequest = {
        nutritionGoals: selectedPlan.nutritionGoals,
        totalCalories: selectedPlan.totalCalories,
        dietaryPreferences: ['saludable', 'equilibrado'],
        allergies: [],
        cuisinePreferences: ['mediterránea', 'asiática', 'mexicana', 'italiana'],
        useExoticFruits: false,
        useInternationalSpices: false
      };

      const aiResponse = await AIMenuService.generateWeeklyMenu(aiRequest);
      
      if (aiResponse.success) {
        // Actualizar el plan con los menús generados por IA
        const updatedPlan = { ...selectedPlan, meals: aiResponse.weeklyMenu };
        updateWeeklyPlan(selectedPlan.id, updatedPlan);
        
        return aiResponse.weeklyMenu;
      } else {
        throw new Error(aiResponse.message || 'Error generando menú con IA');
      }
    } catch (error) {
      console.error('Error generando menú con IA:', error);
      // Fallback: mostrar mensaje de error
      return [];
    }
  };



  const [currentWeekSchedule, setCurrentWeekSchedule] = useState<DaySchedule[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  // Cargar menú cuando cambie la semana seleccionada
  useEffect(() => {
    console.log('🔄 [EFFECT] useEffect de carga ejecutado');
    if (weeklyPlans.length > 0 && selectedWeek < weeklyPlans.length) {
      loadWeekMenu();
    }
  }, [selectedWeek, weeklyPlans]);

  // Ajustar la semana seleccionada cuando cambien los planes
  useEffect(() => {
    console.log('🔄 [EFFECT] Planes cambiaron:', weeklyPlans.length, 'Semana seleccionada:', selectedWeek);
    console.log('🔄 [EFFECT] IDs de planes:', weeklyPlans.map(p => p.id));
    if (weeklyPlans.length > 0 && selectedWeek >= weeklyPlans.length) {
      const newSelectedWeek = Math.max(0, weeklyPlans.length - 1);
      console.log('🔄 [EFFECT] Ajustando semana seleccionada a:', newSelectedWeek);
      setSelectedWeek(newSelectedWeek);
    }
  }, [weeklyPlans, selectedWeek]);

  const loadWeekMenu = async () => {
    if (weeklyPlans.length === 0 || selectedWeek >= weeklyPlans.length) {
      setCurrentWeekSchedule([]);
      return;
    }

    const selectedPlan = weeklyPlans[selectedWeek];
    
    // Si el plan tiene menús generados, usarlos
    if (selectedPlan.meals) {
      setCurrentWeekSchedule(selectedPlan.meals);
      return;
    }
    
    // Si no tiene menús, generarlos con IA
    setIsLoadingMenu(true);
    try {
      // Calcular IMC del usuario
      const bmi = profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 0;
      
      const aiRequest: AIMenuRequest = {
        nutritionGoals: selectedPlan.nutritionGoals,
        totalCalories: selectedPlan.totalCalories,
        dietaryPreferences: userPreferences.dietaryPreferences,
        allergies: userPreferences.allergies,
        cuisinePreferences: userPreferences.cuisinePreferences,
        useExoticFruits: false,
        useInternationalSpices: false,
        // Nuevos campos para personalización avanzada
        activityLevel: profile.activityLevel,
        bmi: bmi,
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        gender: profile.gender,
      };

      const aiResponse = await AIMenuService.generateWeeklyMenu(aiRequest);
      
      if (aiResponse.success) {
        // Actualizar el plan con los menús generados por IA
        const updatedPlan = { ...selectedPlan, meals: aiResponse.weeklyMenu };
        updateWeeklyPlan(selectedPlan.id, updatedPlan);
        setCurrentWeekSchedule(aiResponse.weeklyMenu);
      } else {
        throw new Error(aiResponse.message || 'Error generando menú con IA');
      }
    } catch (error) {
      console.error('Error generando menú con IA:', error);
      setCurrentWeekSchedule([]);
    } finally {
      setIsLoadingMenu(false);
    }
  };

    // Función para mostrar mensaje cuando no hay menús
  const renderNoMenuMessage = () => {
    if (weeklyPlans.length === 0 || selectedWeek >= weeklyPlans.length) {
      return null;
    }

    const selectedPlan = weeklyPlans[selectedWeek];
    
    // Si ya tiene menús generados, no mostrar el mensaje
    if (selectedPlan.meals && selectedPlan.meals.length > 0) {
      return null;
    }
    
    return (
      <View style={styles.noMenuContainer}>
        <Ionicons 
          name={isLoadingMenu ? "hourglass-outline" : "restaurant-outline"} 
          size={64} 
          color={isLoadingMenu ? Colors.primary : Colors.gray} 
        />
        <Text style={styles.noMenuTitle}>
          {isLoadingMenu ? 'Generando Menú con IA...' : 'Generando Menú...'}
        </Text>
        <Text style={styles.noMenuText}>
          {isLoadingMenu 
            ? 'La inteligencia artificial está creando tu menú semanal personalizado con variedad de comidas para cada día. Esto puede tomar unos segundos.'
            : 'Estamos creando tu menú semanal personalizado con variedad de comidas para cada día usando inteligencia artificial.'
          }
        </Text>
        {!isLoadingMenu && (
          <TouchableOpacity 
            style={styles.generateMenuButton}
            onPress={() => {
              // Forzar la generación del menú con IA
              loadWeekMenu();
            }}
          >
            <Ionicons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.generateMenuButtonText}>Generar Menú con IA</Text>
          </TouchableOpacity>
        )}
        {isLoadingMenu && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generando menú personalizado...</Text>
          </View>
        )}
      </View>
    );
  };

  const toggleDayExpansion = (dayDate: string) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dayDate)) {
      newExpandedDays.delete(dayDate);
    } else {
      newExpandedDays.add(dayDate);
    }
    setExpandedDays(newExpandedDays);
  };

  const isDayExpanded = (dayDate: string) => expandedDays.has(dayDate);
  
  const toggleMealExpansion = (mealId: string) => {
    const newExpandedMeals = new Set(expandedMeals);
    if (newExpandedMeals.has(mealId)) {
      newExpandedMeals.delete(mealId);
    } else {
      newExpandedMeals.add(mealId);
    }
    setExpandedMeals(newExpandedMeals);
  };

  const isMealExpanded = (mealId: string) => expandedMeals.has(mealId);

  const renderWeekSelector = () => (
    <View style={styles.weekSelectorContainer}>
      <Text style={styles.weekSelectorTitle}>Planes Semanales Disponibles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekSelector}>
        {weeklyPlans.map((plan, index) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.weekCard,
              selectedWeek === index && styles.selectedWeekCard,
              plan.status === 'active' && styles.activeWeekCard,
            ]}
            onPress={() => setSelectedWeek(index)}
          >
            <View style={styles.weekCardHeader}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(plan.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(plan.status)}</Text>
              </View>
              {plan.status === 'active' && (
                <View style={styles.activeIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                </View>
              )}
            </View>
            
            <Text style={[
              styles.planName,
              selectedWeek === index && styles.selectedPlanName,
            ]}>
              {plan.name}
            </Text>
            
            <Text style={[
              styles.planDescription,
              selectedWeek === index && styles.selectedPlanDescription,
            ]} numberOfLines={2}>
              {plan.description}
            </Text>
            
            <View style={styles.weekDatesContainer}>
              <Text style={[
                styles.weekDates,
                selectedWeek === index && styles.selectedWeekDates,
              ]}>
                {plan.weekStart} - {plan.weekEnd}
              </Text>
            </View>
            
            <View style={styles.weekStats}>
              <View style={styles.weekStat}>
                <Text style={[
                  styles.weekStatNumber,
                  selectedWeek === index && styles.selectedWeekStatNumber,
                ]}>
                  {plan.totalMeals}
                </Text>
                <Text style={[
                  styles.weekStatLabel,
                  selectedWeek === index && styles.selectedWeekStatLabel,
                ]}>
                  Comidas
                </Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={[
                  styles.weekStatNumber,
                  selectedWeek === index && styles.selectedWeekStatNumber,
                ]}>
                  {Math.round(plan.totalCalories / 1000)}k
                </Text>
                <Text style={[
                  styles.weekStatLabel,
                  selectedWeek === index && styles.selectedWeekStatLabel,
                ]}>
                  Calorías
                </Text>
              </View>
              <View style={styles.weekStat}>
                <Text style={[
                  styles.weekStatNumber,
                  selectedWeek === index && styles.selectedWeekStatNumber,
                ]}>
                  €{plan.totalCost.toFixed(0)}
                </Text>
                <Text style={[
                  styles.weekStatLabel,
                  selectedWeek === index && styles.selectedWeekStatLabel,
                ]}>
                  Presupuesto
                </Text>
              </View>
            </View>
            
            <View style={styles.weekCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => showPlanDetailsModal(plan)}
              >
                <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Detalles</Text>
              </TouchableOpacity>
              
              {plan.status !== 'active' && (
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={() => activatePlan(plan.id)}
                >
                  <Ionicons name="play-circle-outline" size={16} color={Colors.white} />
                  <Text style={styles.activateButtonText}>Activar</Text>
                </TouchableOpacity>
              )}
              
                              {/* Botón de eliminar removido - ahora se gestiona desde PlanManagementScreen */}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderWeeklyPlanView = () => (
    <View style={styles.weeklyPlanContainer}>
      <View style={styles.weeklyPlanHeader}>
        <View style={styles.weeklyPlanHeaderIcon}>
          <Ionicons name="calendar" size={28} color={Colors.primary} />
        </View>
        <View style={styles.weeklyPlanHeaderText}>
          <Text style={styles.weeklyPlanTitle}>Plan Semanal Detallado</Text>
          <Text style={styles.weeklyPlanSubtitle}>Toca cada día para ver las comidas completas</Text>
        </View>
                <TouchableOpacity
                  style={styles.regenerateMenuButton}
                  onPress={async () => {
                    if (selectedPlanForDetails) {
                      try {
                        setIsLoadingMenu(true);
                        const aiRequest: AIMenuRequest = {
                          nutritionGoals: selectedPlanForDetails.nutritionGoals,
                          totalCalories: selectedPlanForDetails.totalCalories,
                          dietaryPreferences: userPreferences.dietaryPreferences,
                          allergies: userPreferences.allergies,
                          cuisinePreferences: userPreferences.cuisinePreferences,
                          useExoticFruits: false,
                          useInternationalSpices: false
                        };

                        const aiResponse = await AIMenuService.generateWeeklyMenu(aiRequest);
                        
                        if (aiResponse.success) {
                          const updatedPlan = { ...selectedPlanForDetails, meals: aiResponse.weeklyMenu };
                                  updateWeeklyPlan(selectedPlanForDetails.id, updatedPlan);
                          setSelectedPlanForDetails(updatedPlan);
                          Alert.alert('Menú Regenerado con IA', 'Se ha generado un nuevo menú semanal completamente diferente usando inteligencia artificial.');
                        } else {
                          throw new Error(aiResponse.message || 'Error generando menú con IA');
                        }
                      } catch (error) {
                        console.error('Error regenerando menú:', error);
                        Alert.alert('Error', 'No se pudo regenerar el menú. Inténtalo de nuevo.');
                      } finally {
                        setIsLoadingMenu(false);
                      }
                    }
                  }}
                >
                  <Ionicons name="refresh" size={20} color={Colors.primary} />
                  <Text style={styles.regenerateMenuButtonText}>Regenerar</Text>
                </TouchableOpacity>
      </View>
      
      <View style={styles.weeklyPlanGrid}>
        {currentWeekSchedule.map((day, index) => (
          <View key={day.date} style={[
            styles.weeklyPlanDay,
            isDayExpanded(day.date) && styles.weeklyPlanDayExpanded
          ]}>
            {/* Header del día mejorado */}
            <TouchableOpacity 
              style={[
                styles.dayHeaderExpandable,
                isDayExpanded(day.date) && styles.dayHeaderExpandableActive
              ]}
              onPress={() => toggleDayExpansion(day.date)}
              activeOpacity={0.7}
            >
              <View style={styles.dayHeaderContent}>
                <View style={styles.dayHeaderLeft}>
                  <View style={styles.dayNameContainer}>
                    <Text style={styles.dayName}>{day.dayName}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>
                </View>
                
                <View style={styles.dayHeaderCenter}>
                  <View style={styles.dayStatsRow}>
                    <View style={styles.dayStatItem}>
                      <Ionicons name="flame" size={16} color={Colors.warning} />
                      <Text style={styles.dayStatValue}>{day.nutrition.calories}</Text>
                      <Text style={styles.dayStatLabel}>cal</Text>
                    </View>
                    <View style={styles.dayStatItem}>
                      <Ionicons name="restaurant" size={16} color={Colors.primary} />
                      <Text style={styles.dayStatValue}>
                        {[
                          day.meals.breakfast,
                          day.meals.lunch,
                          day.meals.dinner,
                          day.meals.snacks && day.meals.snacks.length > 0 ? day.meals.snacks : null
                        ].filter(Boolean).length}
                      </Text>
                      <Text style={styles.dayStatLabel}>comidas</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.dayHeaderRight}>
                  <View style={[
                    styles.expandIconContainer,
                    isDayExpanded(day.date) && styles.expandIconContainerActive
                  ]}>
                    <Ionicons 
                      name={isDayExpanded(day.date) ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color={isDayExpanded(day.date) ? Colors.white : Colors.primary} 
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Contenido expandible del día mejorado */}
            {isDayExpanded(day.date) && (
              <View style={styles.expandedDayContent}>
                {/* Resumen nutricional compacto */}
                <View style={styles.dayNutritionSummary}>
                  <View style={styles.nutritionItemsGrid}>
                    <View style={styles.nutritionItem}>
                      <View style={styles.nutritionIconContainer}>
                        <Ionicons name="fitness" size={16} color={Colors.primary} />
                      </View>
                      <Text style={styles.nutritionValue}>{day.nutrition.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Proteínas</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <View style={styles.nutritionIconContainer}>
                        <Ionicons name="leaf" size={16} color={Colors.success} />
                      </View>
                      <Text style={styles.nutritionValue}>{day.nutrition.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carbohidratos</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <View style={styles.nutritionIconContainer}>
                        <Ionicons name="water" size={16} color={Colors.warning} />
                      </View>
                      <Text style={styles.nutritionValue}>{day.nutrition.fat}g</Text>
                      <Text style={styles.nutritionLabel}>Grasas</Text>
                    </View>
                  </View>
                </View>

                {/* Comidas del día con desplegables individuales */}
                <View style={styles.mealsContainer}>
                  <View style={styles.mealsSectionHeader}>
                    <Ionicons name="restaurant" size={20} color={Colors.primary} />
                    <Text style={styles.mealsSectionTitle}>Comidas del Día</Text>
                  </View>
                  
                  {day.meals.breakfast && (
                    <View style={styles.mealCard}>
                      <TouchableOpacity 
                        style={styles.mealHeaderExpandable}
                        onPress={() => toggleMealExpansion(`${day.date}-breakfast`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mealHeaderContent}>
                          <View style={styles.mealIconContainer}>
                            <Ionicons name="sunny" size={20} color={Colors.primary} />
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={styles.mealType}>Desayuno</Text>
                            <Text style={styles.mealName}>{day.meals.breakfast.name}</Text>
                          </View>
                          <View style={styles.mealHeaderRight}>
                            <View style={styles.mealTime}>
                              <Ionicons name="time" size={14} color={Colors.textSecondary} />
                              <Text style={styles.mealTimeText}>
                                {(day.meals.breakfast.prepTime || 0) + (day.meals.breakfast.cookingTime || 0)} min
                              </Text>
                            </View>
                            <View style={styles.mealExpandIcon}>
                              <Ionicons 
                                name={isMealExpanded(`${day.date}-breakfast`) ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color={Colors.primary} 
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Contenido expandible de la comida */}
                      {isMealExpanded(`${day.date}-breakfast`) && (
                        <View style={styles.mealDetails}>
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Ingredientes:</Text>
                            <View style={styles.ingredientsList}>
                              {day.meals.breakfast.ingredients.map((ingredient, idx) => (
                                <Text key={idx} style={styles.ingredientItem}>• {ingredient}</Text>
                              ))}
                            </View>
                          </View>
                          
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Preparación:</Text>
                            {Array.isArray(day.meals.breakfast.instructions) ? (
                              day.meals.breakfast.instructions.map((instruction, idx) => (
                                <Text key={idx} style={styles.mealInstructions}>• {instruction}</Text>
                              ))
                            ) : (
                              <Text style={styles.mealInstructions}>{day.meals.breakfast.instructions}</Text>
                            )}
                          </View>
                          
                          <View style={styles.mealTiming}>
                            <View style={styles.timingItem}>
                              <Ionicons name="hourglass-outline" size={14} color={Colors.info} />
                              <Text style={styles.timingText}>Prep: {day.meals.breakfast.prepTime} min</Text>
                            </View>
                            <View style={styles.timingItem}>
                              <Ionicons name="flame-outline" size={14} color={Colors.warning} />
                              <Text style={styles.timingText}>Cocción: {day.meals.breakfast.cookingTime} min</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {day.meals.lunch && (
                    <View style={styles.mealCard}>
                      <TouchableOpacity 
                        style={styles.mealHeaderExpandable}
                        onPress={() => toggleMealExpansion(`${day.date}-lunch`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mealHeaderContent}>
                          <View style={styles.mealIconContainer}>
                            <Ionicons name="restaurant" size={20} color={Colors.success} />
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={styles.mealType}>Almuerzo</Text>
                            <Text style={styles.mealName}>{day.meals.lunch.name}</Text>
                          </View>
                          <View style={styles.mealHeaderRight}>
                            <View style={styles.mealTime}>
                              <Ionicons name="time" size={14} color={Colors.textSecondary} />
                              <Text style={styles.mealTimeText}>
                                {(day.meals.lunch.prepTime || 0) + (day.meals.lunch.cookingTime || 0)} min
                              </Text>
                            </View>
                            <View style={styles.mealExpandIcon}>
                              <Ionicons 
                                name={isMealExpanded(`${day.date}-lunch`) ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color={Colors.primary} 
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Contenido expandible de la comida */}
                      {isMealExpanded(`${day.date}-lunch`) && (
                        <View style={styles.mealDetails}>
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Ingredientes:</Text>
                            <View style={styles.ingredientsList}>
                              {day.meals.lunch.ingredients.map((ingredient, idx) => (
                                <Text key={idx} style={styles.ingredientItem}>• {ingredient}</Text>
                              ))}
                            </View>
                          </View>
                          
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Preparación:</Text>
                            {Array.isArray(day.meals.lunch.instructions) ? (
                              day.meals.lunch.instructions.map((instruction, idx) => (
                                <Text key={idx} style={styles.mealInstructions}>• {instruction}</Text>
                              ))
                            ) : (
                              <Text style={styles.mealInstructions}>{day.meals.lunch.instructions}</Text>
                            )}
                          </View>
                          
                          <View style={styles.mealTiming}>
                            <View style={styles.timingItem}>
                              <Ionicons name="hourglass-outline" size={14} color={Colors.info} />
                              <Text style={styles.timingText}>Prep: {day.meals.lunch.prepTime} min</Text>
                            </View>
                            <View style={styles.timingItem}>
                              <Ionicons name="flame-outline" size={14} color={Colors.warning} />
                              <Text style={styles.timingText}>Cocción: {day.meals.lunch.cookingTime} min</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {day.meals.dinner && (
                    <View style={styles.mealCard}>
                      <TouchableOpacity 
                        style={styles.mealHeaderExpandable}
                        onPress={() => toggleMealExpansion(`${day.date}-dinner`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mealHeaderContent}>
                          <View style={styles.mealIconContainer}>
                            <Ionicons name="moon" size={20} color={Colors.warning} />
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={styles.mealType}>Cena</Text>
                            <Text style={styles.mealName}>{day.meals.dinner.name}</Text>
                          </View>
                          <View style={styles.mealHeaderRight}>
                            <View style={styles.mealTime}>
                              <Ionicons name="time" size={14} color={Colors.textSecondary} />
                              <Text style={styles.mealTimeText}>
                                {(day.meals.dinner.prepTime || 0) + (day.meals.dinner.cookingTime || 0)} min
                              </Text>
                            </View>
                            <View style={styles.mealExpandIcon}>
                              <Ionicons 
                                name={isMealExpanded(`${day.date}-dinner`) ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color={Colors.primary} 
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Contenido expandible de la comida */}
                      {isMealExpanded(`${day.date}-dinner`) && (
                        <View style={styles.mealDetails}>
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Ingredientes:</Text>
                            <View style={styles.ingredientsList}>
                              {day.meals.dinner.ingredients.map((ingredient, idx) => (
                                <Text key={idx} style={styles.ingredientItem}>• {ingredient}</Text>
                              ))}
                            </View>
                          </View>
                          
                          <View style={styles.mealSection}>
                            <Text style={styles.mealSectionTitle}>Preparación:</Text>
                            {Array.isArray(day.meals.dinner.instructions) ? (
                              day.meals.dinner.instructions.map((instruction, idx) => (
                                <Text key={idx} style={styles.mealInstructions}>• {instruction}</Text>
                              ))
                            ) : (
                              <Text style={styles.mealInstructions}>{day.meals.dinner.instructions}</Text>
                            )}
                          </View>
                          
                          <View style={styles.mealTiming}>
                            <View style={styles.timingItem}>
                              <Ionicons name="hourglass-outline" size={14} color={Colors.info} />
                              <Text style={styles.timingText}>Prep: {day.meals.dinner.prepTime} min</Text>
                            </View>
                            <View style={styles.timingItem}>
                              <Ionicons name="flame-outline" size={14} color={Colors.warning} />
                              <Text style={styles.timingText}>Cocción: {day.meals.dinner.cookingTime} min</Text>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                  
                  {day.meals.snacks && day.meals.snacks.length > 0 && (
                    <View style={styles.mealCard}>
                      <TouchableOpacity 
                        style={styles.mealHeaderExpandable}
                        onPress={() => toggleMealExpansion(`${day.date}-snacks`)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mealHeaderContent}>
                          <View style={styles.mealIconContainer}>
                            <Ionicons name="leaf" size={20} color={Colors.info} />
                          </View>
                          <View style={styles.mealInfo}>
                            <Text style={styles.mealType}>Snacks</Text>
                            <Text style={styles.mealName}>
                              {day.meals.snacks.map(snack => snack.name).join(', ')}
                            </Text>
                          </View>
                          <View style={styles.mealHeaderRight}>
                            <View style={styles.mealExpandIcon}>
                              <Ionicons 
                                name={isMealExpanded(`${day.date}-snacks`) ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color={Colors.primary} 
                              />
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Contenido expandible de los snacks */}
                      {isMealExpanded(`${day.date}-snacks`) && (
                        <View style={styles.mealDetails}>
                          {day.meals.snacks.map((snack, idx) => (
                            <View key={idx} style={styles.snackDetail}>
                              <Text style={styles.snackName}>{snack.name}</Text>
                              <View style={styles.mealSection}>
                                <Text style={styles.mealSectionTitle}>Ingredientes:</Text>
                                <View style={styles.ingredientsList}>
                                  {snack.ingredients.map((ingredient, ingredientIdx) => (
                                    <Text key={ingredientIdx} style={styles.ingredientItem}>• {ingredient}</Text>
                                  ))}
                                </View>
                              </View>
                              <View style={styles.mealSection}>
                                <Text style={styles.mealSectionTitle}>Preparación:</Text>
                                {Array.isArray(snack.instructions) ? (
                                  snack.instructions.map((instruction, idx) => (
                                    <Text key={idx} style={styles.mealInstructions}>• {instruction}</Text>
                                  ))
                                ) : (
                                  <Text style={styles.mealInstructions}>{snack.instructions}</Text>
                                )}
                              </View>
                              <View style={styles.mealTiming}>
                                <View style={styles.timingItem}>
                                  <Ionicons name="hourglass-outline" size={14} color={Colors.info} />
                                  <Text style={styles.timingText}>Prep: {snack.prepTime} min</Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
                
                {/* Notas del día */}
                {day.notes && (
                  <View style={styles.dayNotes}>
                    <Ionicons name="information-circle" size={16} color={Colors.info} />
                    <Text style={styles.dayNotesText}>{day.notes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  

  

  const renderDayDetailsModal = () => (
    <Modal
      visible={showDayDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowDayDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedDayForDetails?.dayName} - {selectedDayForDetails?.date}
            </Text>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDayDetails(false)}
            >
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {selectedDayForDetails && (
              <View>
                {/* Comidas del día */}
                <View style={styles.planInfoSection}>
                  <Text style={styles.sectionTitle}>Comidas del Día</Text>
                  
                  {selectedDayForDetails.meals.breakfast && (
                    <View style={styles.mealDetailItem}>
                      <Ionicons name="sunny" size={20} color={Colors.primary} />
                      <View style={styles.mealDetailContent}>
                        <Text style={styles.mealDetailText}>
                          <Text style={styles.mealTypeLabel}>Desayuno:</Text> {selectedDayForDetails.meals.breakfast.name}
                        </Text>
                        <View style={styles.mealInstructionsContainer}>
                          <Text style={styles.instructionsTitle}>Instrucciones de Preparación:</Text>
                          {Array.isArray(selectedDayForDetails.meals.breakfast.instructions) ? (
                            selectedDayForDetails.meals.breakfast.instructions.map((instruction, idx) => (
                              <Text key={idx} style={styles.instructionsText}>• {instruction}</Text>
                            ))
                          ) : (
                            <Text style={styles.instructionsText}>{selectedDayForDetails.meals.breakfast.instructions}</Text>
                          )}
                          <View style={styles.mealTiming}>
                            <Text style={styles.timingText}>⏱️ Prep: {selectedDayForDetails.meals.breakfast.prepTime} min</Text>
                            <Text style={styles.timingText}>🔥 Cocción: {selectedDayForDetails.meals.breakfast.cookingTime} min</Text>
                          </View>
                          <View style={styles.ingredientsContainer}>
                            <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                            {selectedDayForDetails.meals.breakfast.ingredients.map((ingredient, index) => (
                              <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {selectedDayForDetails.meals.lunch && (
                    <View style={styles.mealDetailItem}>
                      <Ionicons name="restaurant" size={20} color={Colors.success} />
                      <View style={styles.mealDetailContent}>
                        <Text style={styles.mealDetailText}>
                          <Text style={styles.mealTypeLabel}>Almuerzo:</Text> {selectedDayForDetails.meals.lunch.name}
                        </Text>
                        <View style={styles.mealInstructionsContainer}>
                          <Text style={styles.instructionsTitle}>Instrucciones de Preparación:</Text>
                          {Array.isArray(selectedDayForDetails.meals.lunch.instructions) ? (
                            selectedDayForDetails.meals.lunch.instructions.map((instruction, idx) => (
                              <Text key={idx} style={styles.instructionsText}>• {instruction}</Text>
                            ))
                          ) : (
                            <Text style={styles.instructionsText}>{selectedDayForDetails.meals.lunch.instructions}</Text>
                          )}
                          <View style={styles.mealTiming}>
                            <Text style={styles.timingText}>⏱️ Prep: {selectedDayForDetails.meals.lunch.prepTime} min</Text>
                            <Text style={styles.timingText}>🔥 Cocción: {selectedDayForDetails.meals.lunch.cookingTime} min</Text>
                          </View>
                          <View style={styles.ingredientsContainer}>
                            <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                            {selectedDayForDetails.meals.lunch.ingredients.map((ingredient, index) => (
                              <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {selectedDayForDetails.meals.dinner && (
                    <View style={styles.mealDetailItem}>
                      <Ionicons name="moon" size={20} color={Colors.warning} />
                      <View style={styles.mealDetailContent}>
                        <Text style={styles.mealDetailText}>
                          <Text style={styles.mealTypeLabel}>Cena:</Text> {selectedDayForDetails.meals.dinner.name}
                        </Text>
                        <View style={styles.mealInstructionsContainer}>
                          <Text style={styles.instructionsTitle}>Instrucciones de Preparación:</Text>
                          {Array.isArray(selectedDayForDetails.meals.dinner.instructions) ? (
                            selectedDayForDetails.meals.dinner.instructions.map((instruction, idx) => (
                              <Text key={idx} style={styles.instructionsText}>• {instruction}</Text>
                            ))
                          ) : (
                            <Text style={styles.instructionsText}>{selectedDayForDetails.meals.dinner.instructions}</Text>
                          )}
                          <View style={styles.mealTimingContainer}>
                            <Text style={styles.timingText}>⏱️ Prep: {selectedDayForDetails.meals.dinner.prepTime} min</Text>
                            <Text style={styles.timingText}>🔥 Cocción: {selectedDayForDetails.meals.dinner.cookingTime} min</Text>
                          </View>
                          <View style={styles.ingredientsContainer}>
                            <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                            {selectedDayForDetails.meals.dinner.ingredients.map((ingredient, index) => (
                              <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {selectedDayForDetails.meals.snacks && selectedDayForDetails.meals.snacks.length > 0 && (
                    <View style={styles.mealDetailItem}>
                      <Ionicons name="leaf" size={20} color={Colors.info} />
                      <View style={styles.mealDetailContent}>
                        <Text style={styles.mealDetailText}>
                          <Text style={styles.mealTypeLabel}>Snacks:</Text>
                        </Text>
                        {selectedDayForDetails.meals.snacks.map((snack, index) => (
                                                      <View key={index} style={styles.snackDetailContainer}>
                              <Text style={styles.snackNameText}>{snack.name}</Text>
                              <View style={styles.mealInstructionsContainer}>
                                <Text style={styles.instructionsTitle}>Instrucciones:</Text>
                                {Array.isArray(snack.instructions) ? (
                                  snack.instructions.map((instruction, idx) => (
                                    <Text key={idx} style={styles.instructionsText}>• {instruction}</Text>
                                  ))
                                ) : (
                                  <Text style={styles.instructionsText}>{snack.instructions}</Text>
                                )}
                                <Text style={styles.timingText}>⏱️ Prep: {snack.prepTime} min</Text>
                                <View style={styles.ingredientsContainer}>
                                  <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
                                  {snack.ingredients.map((ingredient, idx) => (
                                    <Text key={idx} style={styles.ingredientItem}>• {ingredient}</Text>
                                  ))}
                                </View>
                              </View>
                            </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Información nutricional */}
                <View style={styles.planInfoSection}>
                  <Text style={styles.sectionTitle}>Información Nutricional</Text>
                  <View style={styles.nutritionDetailGrid}>
                    <View style={styles.nutritionDetailItem}>
                      <Ionicons name="flame" size={20} color={Colors.warning} />
                      <Text style={styles.nutritionDetailLabel}>Calorías</Text>
                      <Text style={styles.nutritionDetailValue}>
                        {selectedDayForDetails.calorieRange?.display || `${selectedDayForDetails.nutrition.calories} cal`}
                      </Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Ionicons name="fitness" size={20} color={Colors.primary} />
                      <Text style={styles.nutritionDetailLabel}>Proteínas</Text>
                      <Text style={styles.nutritionDetailValue}>{selectedDayForDetails.nutrition.protein}g</Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Ionicons name="leaf" size={20} color={Colors.success} />
                      <Text style={styles.nutritionDetailLabel}>Carbohidratos</Text>
                      <Text style={styles.nutritionDetailValue}>{selectedDayForDetails.nutrition.carbs}g</Text>
                    </View>
                    <View style={styles.nutritionDetailItem}>
                      <Ionicons name="water" size={20} color={Colors.warning} />
                      <Text style={styles.nutritionDetailLabel}>Grasas</Text>
                      <Text style={styles.nutritionDetailValue}>{selectedDayForDetails.nutrition.fat}g</Text>
                    </View>
                  </View>
                  
                  {/* Citaciones médicas para información nutricional */}
                  <MedicalCitation 
                    citationIds={['usda_nutrient_db', 'protein_requirements', 'exercise_nutrition']}
                    style={styles.nutritionCitations}
                  />
                </View>
                
                {/* Notas del día */}
                {selectedDayForDetails.notes && (
                  <View style={styles.planInfoSection}>
                    <Text style={styles.sectionTitle}>Notas del Día</Text>
                    <Text style={styles.dayNotesText}>{selectedDayForDetails.notes}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderPlanDetailsModal = () => (
    <Modal
      visible={showPlanDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPlanDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalles del Plan</Text>
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowPlanDetails(false)}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exitModalButton}
                onPress={() => {
                  setShowPlanDetails(false);
                  navigation.goBack();
                }}
              >
                <Ionicons name="exit-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          
          {selectedPlanForDetails && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.planInfoSection}>
                <View style={styles.planNameSection}>
                  <View style={styles.planNameDisplay}>
                    <Text style={styles.planNameTitle}>{selectedPlanForDetails.name}</Text>
                  </View>
                </View>
                
                <Text style={styles.planDescriptionText}>{selectedPlanForDetails.description}</Text>
                <View style={styles.planDates}>
                  <Text style={styles.planDatesText}>
                    {selectedPlanForDetails.weekStart} - {selectedPlanForDetails.weekEnd}
                  </Text>
                </View>
              </View>
              
              <View style={styles.planStatsSection}>
                <Text style={styles.sectionTitle}>Resumen del Plan</Text>
                <View style={styles.planStatsGrid}>
                  <View style={styles.planStatItem}>
                    <Text style={styles.planStatNumber}>{selectedPlanForDetails.totalMeals}</Text>
                    <Text style={styles.planStatLabel}>Comidas</Text>
                  </View>
                  <View style={styles.planStatItem}>
                    <Text style={styles.planStatNumber}>
                      {Math.round(selectedPlanForDetails.totalCalories / 1000)}k
                    </Text>
                    <Text style={styles.planStatLabel}>Calorías</Text>
                  </View>
                  <View style={styles.planStatItem}>
                    <Text style={styles.planStatNumber}>€{selectedPlanForDetails.totalCost.toFixed(2)}</Text>
                    <Text style={styles.planStatLabel}>Presupuesto</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.nutritionGoalsSection}>
                <Text style={styles.sectionTitle}>Objetivos Nutricionales</Text>
                <View style={styles.nutritionGoalsGrid}>
                  <View style={styles.nutritionGoalItem}>
                    <Text style={styles.nutritionGoalLabel}>Proteínas</Text>
                    <Text style={styles.nutritionGoalValue}>{selectedPlanForDetails.nutritionGoals.protein}%</Text>
                  </View>
                  <View style={styles.nutritionGoalItem}>
                    <Text style={styles.nutritionGoalLabel}>Carbohidratos</Text>
                    <Text style={styles.nutritionGoalValue}>{selectedPlanForDetails.nutritionGoals.carbs}%</Text>
                  </View>
                  <View style={styles.nutritionGoalItem}>
                    <Text style={styles.nutritionGoalLabel}>Grasas</Text>
                    <Text style={styles.nutritionGoalValue}>{selectedPlanForDetails.nutritionGoals.fat}%</Text>
                  </View>
                  <View style={styles.nutritionGoalItem}>
                    <Text style={styles.nutritionGoalLabel}>Fibra</Text>
                    <Text style={styles.nutritionGoalValue}>{selectedPlanForDetails.nutritionGoals.fiber}g</Text>
                  </View>
                </View>
              </View>
              
              {/* Sección de Progreso del Plan */}
              <View style={styles.planProgressSection}>
                <Text style={styles.sectionTitle}>Progreso del Plan</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    {selectedPlanForDetails.progress?.completedMeals ? (
                      <>
                    <Text style={styles.progressText}>
                          {selectedPlanForDetails.progress.completedMeals} de {selectedPlanForDetails.totalMeals} comidas completadas
                    </Text>
                    <Text style={styles.progressPercentage}>
                          {selectedPlanForDetails.progress.percentage || 0}% Completado
                    </Text>
                      </>
                    ) : (
                      <Text style={styles.progressText}>
                        Empieza a marcar las comidas que vayas completando.
                      </Text>
                    )}
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${selectedPlanForDetails.progress?.percentage || 0}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.progressActions}>
                    <TouchableOpacity
                      style={[CommonStyles.button.outline, styles.progressButton]}
                      onPress={() => {
                        const currentCompleted = selectedPlanForDetails.progress?.completedMeals || 0;
                        const newCompleted = Math.min(currentCompleted + 1, selectedPlanForDetails.totalMeals);
                        updatePlanProgress(selectedPlanForDetails.id, newCompleted);
                      }}
                      disabled={(selectedPlanForDetails.progress?.completedMeals || 0) >= selectedPlanForDetails.totalMeals}
                    >
                      <Ionicons name="add" size={16} color={Colors.primary} />
                      <Text style={[CommonStyles.buttonText.outline, styles.progressButtonText]}>Completar Comida</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[CommonStyles.button.outline, styles.progressButton]}
                      onPress={() => {
                        const currentCompleted = selectedPlanForDetails.progress?.completedMeals || 0;
                        const newCompleted = Math.max(currentCompleted - 1, 0);
                        updatePlanProgress(selectedPlanForDetails.id, newCompleted);
                      }}
                      disabled={(selectedPlanForDetails.progress?.completedMeals || 0) <= 0}
                    >
                      <Ionicons name="remove" size={16} color={Colors.primary} />
                      <Text style={[CommonStyles.buttonText.outline, styles.progressButtonText]}>Deshacer Comida</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Vista del plan semanal detallado */}
              <View style={styles.weeklyPlanSection}>
                <Text style={styles.sectionTitle}>Plan Semanal Detallado</Text>
                <Text style={styles.weeklyPlanDescription}>
                  Toca en cada día para ver las comidas y su preparación completa
                </Text>
                {renderWeeklyPlanView()}
              </View>

              <View style={styles.planActions}>
                {selectedPlanForDetails.status !== 'active' && (
                  <TouchableOpacity
                    style={styles.activatePlanButton}
                    onPress={() => {
                      activatePlan(selectedPlanForDetails.id);
                      setShowPlanDetails(false);
                    }}
                  >
                    <Ionicons name="play-circle" size={20} color={Colors.white} />
                    <Text style={styles.activatePlanButtonText}>Activar Este Plan</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.editPlanButton}
                  onPress={() => {
                    setShowPlanDetails(false);
                    Alert.alert('Editar Plan', 'Funcionalidad de edición próximamente');
                  }}
                >
                  <Ionicons name="create" size={20} color={Colors.primary} />
                  <Text style={styles.editPlanButtonText}>Editar Plan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Log para debugging en cada render
  console.log('🔄 [PANTALLA] Renderizando con', weeklyPlans.length, 'planes');
  console.log('🔄 [PANTALLA] Timestamp:', new Date().toISOString());
  console.log('🔄 [PANTALLA] Contexto disponible:', !!deleteWeeklyPlan);
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      scrollEnabled={true}
    >
      {/* Header con título */}
      <View style={styles.header}>
        <Text style={styles.title}>Planificador Semanal</Text>
        
        {/* Botón de prueba para regenerar menús */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: Colors.success, padding: 20 }]}
          onPress={async () => {
            console.log('🧪 [PRUEBA] Regenerando menús...');
            if (weeklyPlans.length > 0) {
              try {
                const selectedPlan = weeklyPlans[selectedWeek];
                const aiRequest: AIMenuRequest = {
                  nutritionGoals: selectedPlan.nutritionGoals,
                  totalCalories: selectedPlan.totalCalories,
                  dietaryPreferences: userPreferences.dietaryPreferences,
                  allergies: userPreferences.allergies,
                  cuisinePreferences: userPreferences.cuisinePreferences,
                  useExoticFruits: false,
                  useInternationalSpices: false
                };
                
                console.log('🔄 Generando menú con IA...');
                const response = await AIMenuService.generateWeeklyMenu(aiRequest);
                
                if (response.success) {
                  console.log('✅ Menú regenerado exitosamente');
                  Alert.alert('Éxito', 'Menú regenerado con datos nutricionales corregidos');
                } else {
                  console.log('❌ Error generando menú');
                  Alert.alert('Error', 'No se pudo regenerar el menú');
                }
              } catch (error) {
                console.error('❌ Error:', error);
                Alert.alert('Error', 'Error al regenerar el menú');
              }
            } else {
              Alert.alert('Info', 'No hay planes para regenerar');
            }
          }}
        >
          <Text style={styles.testButtonText}>🔄 REGENERAR MENÚS</Text>
        </TouchableOpacity>
        
        {/* Botón de prueba sin contexto */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: Colors.primary, padding: 20 }]}
          onPress={() => {
            const timestamp = new Date().toISOString();
            console.log('🧪 [PRUEBA SIN CONTEXTO] Botón presionado a las:', timestamp);
            console.log('🧪 [PRUEBA SIN CONTEXTO] Planes en estado local:', weeklyPlans?.length || 0);
            Alert.alert('Prueba Sin Contexto', `Botón funcionando a las ${timestamp}`);
          }}
        >
          <Text style={styles.testButtonText}>🧪 SIN CONTEXTO</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Semanal Principal */}
      {weeklyPlans.length > 0 ? (
        <View style={styles.mainPlanContainer}>
          <Text style={styles.mainPlanTitle}>Tu Plan Semanal</Text>
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              Los menús ahora se generan personalizadamente basados en tus preferencias dietéticas. 
              Configura tus preferencias para obtener menús más variados y personalizados.
            </Text>
            <TouchableOpacity
              style={styles.preferencesButton}
              onPress={() => navigation.navigate('UserPreferences')}
            >
              <Ionicons name="settings" size={16} color={Colors.white} />
              <Text style={styles.preferencesButtonText}>Configurar Preferencias</Text>
            </TouchableOpacity>
          </View>
          
          {weeklyPlans.map((plan, index) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.mainPlanCard,
                plan.status === 'active' && styles.activeMainPlanCard,
              ]}
              onPress={() => setShowPlanDetails(true)}
              activeOpacity={0.8}
            >
              <View style={styles.mainPlanHeader}>
                <View style={styles.mainPlanInfo}>
                  <Text style={styles.mainPlanName}>{plan.name}</Text>
                  <Text style={styles.mainPlanDescription}>{plan.description}</Text>
                  <Text style={styles.mainPlanDates}>
                    {plan.weekStart} - {plan.weekEnd}
                  </Text>
                </View>
                
                <View style={styles.mainPlanStatus}>
                  <View style={[
                    styles.mainPlanStatusBadge,
                    { backgroundColor: getStatusColor(plan.status) }
                  ]}>
                    <Text style={styles.mainPlanStatusText}>
                      {getStatusText(plan.status)}
                    </Text>
                  </View>
                  {plan.status === 'active' && (
                    <View style={styles.mainPlanActiveIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.mainPlanStats}>
                <View style={styles.mainPlanStat}>
                  <Ionicons name="restaurant" size={20} color={Colors.primary} />
                  <Text style={styles.mainPlanStatNumber}>{plan.totalMeals}</Text>
                  <Text style={styles.mainPlanStatLabel}>Comidas</Text>
                </View>
                
                <View style={styles.mainPlanStat}>
                  <Ionicons name="flame" size={20} color={Colors.warning} />
                  <Text style={styles.mainPlanStatNumber}>
                    {Math.round(plan.totalCalories / 1000)}k
                  </Text>
                  <Text style={styles.mainPlanStatLabel}>Calorías</Text>
                </View>
                
                <View style={styles.mainPlanStat}>
                  <Ionicons name="pricetag" size={20} color={Colors.info} />
                  <Text style={styles.mainPlanStatNumber}>€{plan.totalCost.toFixed(0)}</Text>
                  <Text style={styles.mainPlanStatLabel}>Presupuesto</Text>
                </View>
              </View>
              
              <View style={styles.mainPlanActions}>
                <TouchableOpacity
                  style={styles.mainPlanActionButton}
                  onPress={() => setShowPlanDetails(true)}
                >
                  <Ionicons name="eye" size={18} color={Colors.primary} />
                  <Text style={styles.mainPlanActionText}>Ver Detalles</Text>
                </TouchableOpacity>
                
                {plan.status !== 'active' && (
                  <TouchableOpacity
                    style={styles.mainPlanActivateButton}
                    onPress={() => activatePlan(plan.id)}
                  >
                    <Ionicons name="play-circle" size={18} color={Colors.white} />
                    <Text style={styles.mainPlanActivateText}>Activar</Text>
                  </TouchableOpacity>
                )}
                
                {/* Botón de eliminar removido - ahora se gestiona desde PlanManagementScreen */}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noPlansContainer}>
          <Ionicons name="calendar-outline" size={64} color={Colors.gray} />
          <Text style={styles.noPlansTitle}>No hay planes semanales</Text>
          <Text style={styles.noPlansText}>
            Crea tu primer plan semanal para comenzar a organizar tu alimentación
          </Text>
          <TouchableOpacity 
            style={styles.createPlanButton}
            onPress={() => {
              // Crear un nuevo plan semanal
              const newPlan: WeeklyPlan = {
                id: Date.now().toString(),
                weekStart: new Date().toISOString().split('T')[0],
                weekEnd: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                totalMeals: 21,
                totalCalories: 14000, // 2000 calorías por día en promedio
                totalCost: 120, // €120 por semana en promedio
                status: 'draft',
                name: 'Mi Plan Semanal',
                description: 'Plan semanal personalizado con menús variados',
                nutritionGoals: {
                  protein: 80,
                  carbs: 200,
                  fat: 65,
                  fiber: 25,
                },
                // Progreso inicializado en 0%
                progress: {
                  completedMeals: 0,
                  totalMeals: 21,
                  percentage: 0,
                },
              };
              
              addWeeklyPlan(newPlan);
              setActivePlan(newPlan);
              setSelectedWeek(weeklyPlans.length);
              Alert.alert(
                'Plan Creado',
                'Se ha creado un nuevo plan semanal. Ahora puedes personalizarlo según tus necesidades.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="add-circle" size={20} color={Colors.white} />
            <Text style={styles.createPlanButtonText}>Crear Plan Semanal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón para eliminar todos los planes */}
      {weeklyPlans.length > 0 && (
        <View style={styles.deleteAllContainer}>
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={() => {
              Alert.alert(
                'Eliminar Todos los Planes',
                '¿Estás seguro de que quieres eliminar todos los planes semanales? Esta acción no se puede deshacer.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { 
                    text: 'Eliminar Todos', 
                    style: 'destructive',
                    onPress: () => {
                      weeklyPlans.forEach(plan => deleteWeeklyPlan(plan.id));
                      setSelectedWeek(0);
                      console.log('🗑️ Todos los planes eliminados');
                    }
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash" size={16} color={Colors.error} />
            <Text style={styles.deleteAllButtonText}>Eliminar Todos los Planes</Text>
          </TouchableOpacity>
        </View>
      )}

      {renderNoMenuMessage()}

      {/* Modal de detalles del día */}
      {renderDayDetailsModal()}
      
      {/* Modal de detalles del plan */}
      {renderPlanDetailsModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl * 2,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    ...Shadows.small,
  },
  testButton: {
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  testButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
  },

  weekSelectorContainer: {
    marginVertical: Spacing.md,
  },
  weekSelectorTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  weekSelector: {
    paddingHorizontal: Spacing.md,
  },
  weekCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    minWidth: 280,
    ...Shadows.small,
  },
  selectedWeekCard: {
    backgroundColor: Colors.primary,
  },
  activeWeekCard: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  weekCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  activeIndicator: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 2,
  },
  planName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  selectedPlanName: {
    color: Colors.white,
  },
  planDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  selectedPlanDescription: {
    color: Colors.white,
    opacity: 0.9,
  },
  weekDatesContainer: {
    marginBottom: Spacing.sm,
  },
  weekDates: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectedWeekDates: {
    color: Colors.white,
    opacity: 0.9,
  },
  weekStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  weekStat: {
    alignItems: 'center',
  },
  weekStatNumber: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  selectedWeekStatNumber: {
    color: Colors.white,
  },
  weekStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  selectedWeekStatLabel: {
    color: Colors.white,
    opacity: 0.9,
  },
  weekCardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.lightGray,
    gap: Spacing.xs,
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  activateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.success,
    gap: Spacing.xs,
  },
  activateButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  viewModeSelector: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: Spacing.xs,
  },
  activeViewModeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  viewModeText: {
    ...Typography.button,
    color: Colors.primary,
  },
  activeViewModeText: {
    color: Colors.white,
  },
  calendarContainer: {
    paddingHorizontal: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  calendarTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  calendarSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: (width - Spacing.md * 3) / 2,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  dayHeaderLeft: {
    alignItems: 'flex-start',
  },
  dayHeaderRight: {
    alignItems: 'flex-end',
  },
  calorieBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  calorieBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  dayName: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  dayDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  mealsContainer: {
    marginBottom: Spacing.md,
  },
  mealsSectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  mealIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  mealContent: {
    flex: 1,
  },
  mealType: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  mealText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
  },
  nutritionSection: {
    marginBottom: Spacing.md,
  },
  nutritionSectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  nutritionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  nutritionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  dayNotes: {
    ...Typography.caption,
    color: Colors.white,
    fontStyle: 'italic',
    flex: 1,
  },
  dayActions: {
    alignItems: 'center',
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  viewDetailsText: {
    ...Typography.button,
    color: Colors.white,
  },
  listDayNotes: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    flex: 1,
  },
  listDayNotesText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  listDayActions: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  listViewDetailsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listViewDetailsText: {
    ...Typography.button,
    color: Colors.white,
  },
  mainPlanContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mainPlanTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  mainPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  activeMainPlanCard: {
    borderLeftColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  mainPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  mainPlanInfo: {
    flex: 1,
  },
  mainPlanName: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  mainPlanDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  mainPlanDates: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  mainPlanStatus: {
    alignItems: 'flex-end',
  },
  mainPlanStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  mainPlanStatusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  mainPlanActiveIndicator: {
    alignItems: 'center',
  },
  mainPlanStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  mainPlanStat: {
    alignItems: 'center',
  },
  mainPlanStatNumber: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  mainPlanStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  mainPlanActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.sm,
  },
  mainPlanActionButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    flex: 1,
  },
  mainPlanActionText: {
    ...Typography.button,
    color: Colors.white,
  },
  mainPlanActivateButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    flex: 1,
  },
  mainPlanActivateText: {
    ...Typography.button,
    color: Colors.white,
  },
  mainPlanDeleteButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    flex: 1,
  },
  mainPlanDeleteText: {
    ...Typography.button,
    color: Colors.white,
  },
  noPlansContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  noPlansTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  noPlansText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  createPlanButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  createPlanButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
  },
  listHeader: {
    marginBottom: Spacing.lg,
  },
  listTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  listSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listDay: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  listDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  listDayInfo: {
    flex: 1,
  },
  listDayDateContainer: {
    marginBottom: Spacing.xs,
  },
  listDayStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  listDayStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listDayStatText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listDayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  listDayBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  listDayName: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  listDayDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  nutritionBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  nutritionBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  listMealsContainer: {
    marginBottom: Spacing.md,
  },
  listMealsTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  listMeals: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  listMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  listMealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  listMealContent: {
    flex: 1,
  },
  listMealType: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  listMealTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  listMealTimeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listMealText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  nutritionDetails: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },

  statsContainer: {
    paddingHorizontal: Spacing.md,
  },
  statsTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (width - Spacing.md * 3) / 2,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nutritionChart: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  chartTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  barFill: {
    width: 60,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  barPercentage: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: 'bold',
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  barValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nutritionSummary: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    textAlign: 'center',
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.white,
  },
  closeModalButton: {
    padding: Spacing.sm,
  },
  exitModalButton: {
    padding: Spacing.sm,
  },
  modalBody: {
    padding: Spacing.md,
  },
  planInfoSection: {
    marginBottom: Spacing.lg,
  },
  planNameTitle: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  planNameSection: {
    marginBottom: Spacing.md,
  },
  planNameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editPlanNameIcon: {
    padding: Spacing.xs,
  },
  editPlanNameContainer: {
    marginBottom: Spacing.sm,
  },
  editPlanNameInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  editPlanNameActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  savePlanNameButton: {
    backgroundColor: Colors.success,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPlanNameButton: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDescriptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  planDates: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  planDatesText: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  planStatsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  planStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  planStatItem: {
    alignItems: 'center',
  },
  planStatNumber: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  planStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  nutritionGoalsSection: {
    marginBottom: Spacing.lg,
  },
  nutritionGoalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionGoalItem: {
    width: '48%',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  nutritionGoalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  nutritionGoalValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  planActions: {
    gap: Spacing.md,
  },
  activatePlanButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  activatePlanButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  editPlanButton: {
    backgroundColor: Colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  editPlanButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deleteButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
  },
  mealDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  mealDetailText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  mealTypeLabel: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  nutritionDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  nutritionDetailItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  nutritionDetailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  nutritionDetailValue: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  nutritionCitations: {
    marginTop: Spacing.lg,
  },
  dayNotesText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Estilos para la sección de progreso
  planProgressSection: {
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  progressInfo: {
    marginBottom: Spacing.md,
  },
  progressText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  progressPercentage: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
  },
  progressActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  progressButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  progressButtonText: {
    marginLeft: Spacing.xs,
  },
  // Nuevos estilos para instrucciones detalladas
  mealDetailContent: {
    flex: 1,
  },
  mealInstructions: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  mealInstructionsContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
    ...Shadows.small,
    elevation: 2,
  },
  instructionsTitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    fontSize: 16,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(34, 197, 94, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  instructionsText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  mealTiming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  timingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  ingredientsContainer: {
    marginTop: Spacing.sm,
  },
  ingredientsTitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  ingredientItem: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  snackDetail: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  snackName: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  // Estilos para la sección de días de la semana
  weekDaysSection: {
    marginBottom: Spacing.lg,
  },
  weekDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  weekDayCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.small,
  },
  weekDayName: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  weekDayDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  weekDayMeals: {
    marginBottom: Spacing.sm,
  },
  weekDayMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  weekDayMealText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
  },
  weekDayCalories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.lightGray,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  weekDayCaloriesText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  // Estilos para la vista modal de días de la semana
  weekDaysModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  weekDaysModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.medium,
  },
  closeWeekDaysButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDaysModalTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: 'bold',
  },
  weekDaysModalSpacer: {
    width: 40,
  },
  weekDaysModalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  weekDaysGridModal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  weekDayCardModal: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    ...Shadows.small,
    minHeight: 160,
  },
  weekDayCardHeader: {
    marginBottom: Spacing.sm,
  },
  weekDayNameModal: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  weekDayDateModal: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  weekDayMealsModal: {
    flex: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  weekDayMealModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weekDayMealTextModal: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  weekDayCaloriesModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  weekDayCaloriesTextModal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  // Estilos para la vista del plan semanal
  weeklyPlanContainer: {
    paddingHorizontal: Spacing.md,
  },
  weeklyPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  weeklyPlanTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  weeklyPlanSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  weeklyPlanGrid: {
    gap: Spacing.md,
  },
  weeklyPlanDay: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    minHeight: 80,
    maxHeight: 100,
  },
  dayHeaderExpandable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    minHeight: 60,
    maxHeight: 70,
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  expandedDayContent: {
    padding: Spacing.xs,
    maxHeight: 300,
  },
  dayNutritionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightGray,
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  expandedMealItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  mealTimeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mealDetails: {
    gap: Spacing.sm,
  },
  mealSection: {
    marginBottom: Spacing.sm,
  },
  mealSectionTitle: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  ingredientsList: {
    marginLeft: Spacing.sm,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mealTimingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  snackDetailContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  snackNameText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  weeklyPlanSection: {
    marginBottom: Spacing.lg,
  },
  weeklyPlanDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },

  // Nuevos estilos para el header mejorado
  weeklyPlanHeaderIcon: {
    marginRight: Spacing.md,
  },
  weeklyPlanHeaderText: {
    flex: 1,
  },

  // Estilos para días expandidos
  weeklyPlanDayExpanded: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 2,
    ...Shadows.medium,
  },

  // Estilos para header de día activo
  dayHeaderExpandableActive: {
    backgroundColor: Colors.primary,
  },
  dayHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayNameContainer: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  dayHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  dayStatsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  dayStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  dayStatValue: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  dayStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  expandIconContainerActive: {
    backgroundColor: Colors.primaryDark,
  },

  // Estilos para resumen nutricional mejorado
  nutritionSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  nutritionSummaryTitle: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  nutritionItemsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },

  // Estilos para header de sección de comidas
  mealsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },

  // Estilos para comidas desplegables
  mealCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
    ...Shadows.small,
  },
  mealHeaderExpandable: {
    padding: Spacing.xs,
    backgroundColor: Colors.lightGray,
  },
  mealHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  mealExpandIcon: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  noMenuContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  noMenuTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  noMenuText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  generateMenuButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  generateMenuButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.white,
    flex: 1,
    lineHeight: 18,
  },
  regenerateMenuButton: {
    backgroundColor: Colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  regenerateMenuButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  preferencesButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  preferencesButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  deleteAllContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  deleteAllButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  deleteAllButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default WeeklyPlannerScreen;

