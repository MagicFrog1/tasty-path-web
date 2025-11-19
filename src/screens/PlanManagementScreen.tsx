import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { nutritionService, DietConfig } from '../services/NutritionService';
import { useUserProfile } from '../context/UserProfileContext';
import { useWeeklyPlan, WeeklyPlan } from '../context/WeeklyPlanContext';

const { width } = Dimensions.get('window');

interface PlanManagementScreenProps {
  navigation: any;
  route: any;
}

interface Plan {
  id: string;
  name: string;
  type: 'weekly' | 'monthly';
  createdAt: string;
  expiresAt: string;
  config: DietConfig;
  isActive: boolean;
  progress: number; // 0-100
}

const PlanManagementScreen: React.FC<PlanManagementScreenProps> = ({ navigation, route }) => {
  const { getDietConfigForAI } = useUserProfile();
  const { weeklyPlans, addWeeklyPlan, deleteWeeklyPlan, updateWeeklyPlan, loadAllData } = useWeeklyPlan();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState<'weekly' | 'monthly'>('weekly');
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanName, setEditingPlanName] = useState<string>('');

  // Convertir planes semanales del contexto a la interfaz local
  useEffect(() => {
    const convertedPlans: Plan[] = weeklyPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      type: 'weekly' as const,
      createdAt: plan.createdAt || new Date().toISOString(),
      expiresAt: plan.weekEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      config: plan.config || {},
      isActive: plan.status === 'active',
      progress: 0, // Calcular progreso basado en fechas
    }));
    
    setPlans(convertedPlans);
  }, [weeklyPlans]);



  // Crear nuevo plan
  const createNewPlan = async () => {
    setIsCreatingPlan(true);
    
    try {
      // Navegar a la pantalla de generación de plan
      navigation.navigate('PlanGenerator');
    } catch (error) {
      console.error('Error al navegar:', error);
      Alert.alert(
        'Error',
        'No se pudo acceder al generador de planes.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCreatingPlan(false);
    }
  };



  // Editar nombre del plan
  const editPlanName = (planId: string, currentName: string) => {
    console.log('✏️ [GESTIÓN] Iniciando edición del plan:', planId, 'Nombre actual:', currentName);
    setEditingPlanId(planId);
    setEditingPlanName(currentName);
  };

  // Guardar cambios del nombre
  const savePlanName = async () => {
    if (!editingPlanId || !editingPlanName.trim()) {
      Alert.alert('Error', 'El nombre del plan no puede estar vacío');
      return;
    }

    if (editingPlanName.trim().length < 3) {
      Alert.alert('Error', 'El nombre del plan debe tener al menos 3 caracteres');
      return;
    }

    // Verificar que el plan existe antes de actualizarlo
    const planExists = weeklyPlans.find(plan => plan.id === editingPlanId);
    if (!planExists) {
      Alert.alert('Error', 'El plan no existe o ya ha sido eliminado');
      setEditingPlanId(null);
      setEditingPlanName('');
      return;
    }

    try {
      console.log('✏️ [GESTIÓN] Actualizando nombre del plan:', editingPlanId, 'Nuevo nombre:', editingPlanName.trim());
      
      // Usar la función del contexto para actualizar el plan
      await updateWeeklyPlan(editingPlanId, { name: editingPlanName.trim() });
      
      // Limpiar el estado de edición
      setEditingPlanId(null);
      setEditingPlanName('');
      
      
      // Mostrar mensaje de éxito
      Alert.alert('Éxito', 'El nombre del plan ha sido actualizado exitosamente');
      console.log('✅ [GESTIÓN] Nombre del plan actualizado exitosamente');
    } catch (error) {
      console.error('❌ [GESTIÓN] Error al actualizar el nombre del plan:', error);
      Alert.alert('Error', 'No se pudo actualizar el nombre del plan. Inténtalo de nuevo.');
    }
  };


  // Cancelar edición
  const cancelEdit = () => {
    setEditingPlanId(null);
    setEditingPlanName('');
  };

  // Eliminar plan - FUNCIÓN MEJORADA
  const deletePlan = (planId: string, planName: string) => {
    console.log('🗑️ [GESTIÓN] Función deletePlan llamada para:', planId, planName);
    
    Alert.alert(
      'Eliminar Plan',
      `¿Estás seguro de que quieres eliminar "${planName}"? Esta acción no se puede deshacer.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => {
            console.log('❌ [GESTIÓN] Eliminación cancelada por el usuario');
          }
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [GESTIÓN] Iniciando eliminación del plan:', planId, planName);
              
              // Usar la función del contexto para eliminar el plan
              // El contexto ya maneja la verificación de existencia
              deleteWeeklyPlan(planId);
              
              // Mostrar mensaje de éxito inmediatamente
              Alert.alert(
                'Plan Eliminado',
                `"${planName}" ha sido eliminado exitosamente.`,
                [{ text: 'OK' }]
              );
              
              console.log('✅ [GESTIÓN] Plan eliminado exitosamente:', planId);
            } catch (error) {
              console.error('❌ [GESTIÓN] Error al eliminar plan:', error);
              Alert.alert(
                'Error',
                'No se pudo eliminar el plan. Inténtalo de nuevo.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Mostrar características del plan
  const showPlanCharacteristics = (plan: Plan) => {
    const config = plan.config as any; // Usar any para evitar errores de TypeScript
    const weeklyPlan = weeklyPlans.find(p => p.id === plan.id);
    
    let characteristicsText = `📋 CARACTERÍSTICAS DEL PLAN\n\n`;
    characteristicsText += `📅 Nombre: ${plan.name}\n`;
    characteristicsText += `📅 Creado: ${formatDate(plan.createdAt)}\n`;
    characteristicsText += `📅 Válido hasta: ${formatDate(plan.expiresAt)}\n`;
    characteristicsText += `📊 Estado: ${plan.isActive ? 'Activo' : 'Inactivo'}\n\n`;
    
    if (config) {
      // Datos personales
      if (config.weight && config.height && config.age) {
        characteristicsText += `👤 DATOS PERSONALES:\n`;
        characteristicsText += `• Peso: ${config.weight} kg\n`;
        characteristicsText += `• Altura: ${config.height} cm\n`;
        characteristicsText += `• Edad: ${config.age} años\n`;
        characteristicsText += `• Género: ${config.gender === 'male' ? 'Masculino' : 'Femenino'}\n`;
        characteristicsText += `• Nivel de actividad: ${getActivityLevelText(config.activityLevel)}\n\n`;
      }
      
      // Objetivos
      if (config.goals && config.goals.length > 0) {
        characteristicsText += `🎯 OBJETIVOS DE SALUD:\n`;
        config.goals.forEach((goal: string) => {
          characteristicsText += `• ${goal}\n`;
        });
        characteristicsText += '\n';
      }
      
      // Preferencias dietéticas
      if (config.dietaryPreferences && config.dietaryPreferences.length > 0) {
        characteristicsText += `🥗 PREFERENCIAS DIETÉTICAS:\n`;
        config.dietaryPreferences.forEach((pref: string) => {
          characteristicsText += `• ${pref}\n`;
        });
        characteristicsText += '\n';
      }
      
      // Alergias
      if (config.allergens && config.allergens.length > 0) {
        characteristicsText += `⚠️ ALERGIAS E INTOLERANCIAS:\n`;
        config.allergens.forEach((allergen: string) => {
          characteristicsText += `• ${allergen}\n`;
        });
        characteristicsText += '\n';
      }
      
      // Presupuesto
      if (config.weeklyBudget) {
        characteristicsText += `💰 PRESUPUESTO SEMANAL: €${config.weeklyBudget}\n\n`;
      }
      
      // Tiempo de cocina
      if (config.cookingTime && typeof config.cookingTime === 'object') {
        characteristicsText += `⏰ TIEMPO DE COCINA:\n`;
        characteristicsText += `• Días laborables: ${config.cookingTime.weekdays} minutos\n`;
        characteristicsText += `• Fines de semana: ${config.cookingTime.weekends} minutos\n\n`;
      }
      
      // Tamaño de familia
      if (config.familySize) {
        characteristicsText += `👨‍👩‍👧‍👦 TAMAÑO DE FAMILIA: ${config.familySize} persona(s)\n\n`;
      }
      
      // Opciones adicionales
      if (config.useExoticFruits || config.useInternationalSpices) {
        characteristicsText += `🌟 OPCIONES ADICIONALES:\n`;
        if (config.useExoticFruits) {
          characteristicsText += `• Frutas exóticas incluidas\n`;
        }
        if (config.useInternationalSpices) {
          characteristicsText += `• Especias internacionales incluidas\n`;
        }
        characteristicsText += '\n';
      }
      
      // Comidas incluidas
      if (config.mealCount) {
        characteristicsText += `🍽️ COMIDAS INCLUIDAS:\n`;
        if (config.mealCount.breakfast) characteristicsText += `• Desayuno\n`;
        if (config.mealCount.lunch) characteristicsText += `• Almuerzo\n`;
        if (config.mealCount.dinner) characteristicsText += `• Cena\n`;
        if (config.mealCount.snacks) characteristicsText += `• Snacks\n`;
        characteristicsText += '\n';
      }
      
      // Requisitos especiales
      if (config.specialRequirements && config.specialRequirements.length > 0) {
        characteristicsText += `🔧 REQUISITOS ESPECIALES:\n`;
        config.specialRequirements.forEach((req: string) => {
          characteristicsText += `• ${req}\n`;
        });
        characteristicsText += '\n';
      }
    }
    
    // Información nutricional del plan
    if (weeklyPlan && weeklyPlan.nutritionGoals) {
      characteristicsText += `📊 INFORMACIÓN NUTRICIONAL:\n`;
      characteristicsText += `• Proteínas: ${weeklyPlan.nutritionGoals.protein}%\n`;
      characteristicsText += `• Carbohidratos: ${weeklyPlan.nutritionGoals.carbs}%\n`;
      characteristicsText += `• Grasas: ${weeklyPlan.nutritionGoals.fat}%\n`;
      characteristicsText += `• Fibra: ${weeklyPlan.nutritionGoals.fiber}g/día\n`;
    }
    
    Alert.alert(
      'Características del Plan',
      characteristicsText,
      [{ text: 'Entendido' }]
    );
  };

  // Función auxiliar para obtener texto del nivel de actividad
  const getActivityLevelText = (activityLevel: string) => {
    const activityMap: { [key: string]: string } = {
      'sedentary': 'Sedentario',
      'light': 'Ligero',
      'moderate': 'Moderado',
      'active': 'Activo',
      'very_active': 'Muy Activo'
    };
    return activityMap[activityLevel] || activityLevel;
  };



  // Solo planes semanales
  const weeklyPlansList = plans.filter(plan => plan.type === 'weekly');

  return (
    <View style={styles.container}>
      {/* Header Mejorado */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBackground}>
          <View style={styles.headerPattern} />
          <View style={styles.headerPattern2} />
        </View>
        
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <View style={styles.backButtonContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="home" size={24} color={Colors.white} />
              </LinearGradient>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerMain}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.iconBackground}
              >
                <Ionicons name="calendar" size={48} color={Colors.white} />
                <View style={styles.iconGlow} />
              </LinearGradient>
            </View>
            
            <Text style={styles.headerTitle}>Gestión de Planes</Text>
            <Text style={styles.headerSubtitle}>
              Crea y gestiona tus planes nutricionales personalizados
            </Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>


      {/* Botones de acción mejorados */}
      <View style={styles.actionButtonsSection}>
        <TouchableOpacity
          style={[styles.createPlanButton, isCreatingPlan && styles.createPlanButtonDisabled]}
          onPress={createNewPlan}
          disabled={isCreatingPlan}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createButtonGradient}
          >
            <View style={styles.createButtonContent}>
              <View style={styles.createButtonIcon}>
                <Ionicons name="add-circle" size={28} color={Colors.white} />
              </View>
              <View style={styles.createButtonTextContainer}>
                <Text style={styles.createPlanButtonText}>
                  {isCreatingPlan ? 'Creando Plan...' : 'Crear Plan Semanal'}
                </Text>
                <Text style={styles.createPlanButtonSubtext}>
                  {isCreatingPlan ? 'Generando menú personalizado...' : 'Con IA personalizada'}
                </Text>
              </View>
              <View style={styles.createButtonArrow}>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Lista de planes */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {weeklyPlansList.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              style={styles.emptyStateGradient}
            >
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconDecoration} />
                <Ionicons name="calendar-outline" size={72} color={Colors.white} />
              </View>
              <Text style={styles.emptyTitle}>No tienes planes semanales</Text>
              <Text style={styles.emptyDescription}>
                Crea tu primer plan personalizado con IA
              </Text>
              <View style={styles.emptyAction}>
                <Ionicons name="arrow-down" size={24} color={Colors.white} />
                <Text style={styles.emptyActionText}>Usa el botón de arriba para empezar</Text>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {weeklyPlansList.map((plan, index) => (
              <View key={plan.id} style={[styles.planCard, { marginTop: index === 0 ? 0 : 12 }]}>
                {/* Gradiente de fondo */}
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.planCardGradient}
                >
                  {/* Elementos decorativos */}
                  <View style={styles.planCardDecoration} />
                  <View style={styles.planCardDecorationSecondary} />
                  
                  {/* Header del plan */}
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <View style={styles.planNameContainer}>
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.planIconGradient}
                        >
                          <Ionicons name="restaurant" size={16} color={Colors.white} />
                        </LinearGradient>
                        <View style={styles.planTextContainer}>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <View style={styles.planDateContainer}>
                            <Ionicons name="calendar" size={12} color={Colors.textSecondary} />
                            <Text style={styles.planDate}>
                              {formatDate(plan.createdAt)} - {formatDate(plan.expiresAt)}
                            </Text>
                          </View>
                          <View style={styles.planStatusContainer}>
                            <View style={[styles.planStatusBadge, { backgroundColor: plan.isActive ? Colors.success : Colors.gray }]}>
                              <Text style={styles.planStatusText}>
                                {plan.isActive ? 'Activo' : 'Inactivo'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.planActionsHeader}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          console.log('✏️ [BOTÓN] Botón editar presionado para plan:', plan.id, plan.name);
                          editPlanName(plan.id, plan.name);
                        }}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={['#4facfe', '#00f2fe']}
                          style={styles.editButtonGradient}
                        >
                          <Ionicons name="create-outline" size={14} color={Colors.white} />
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => {
                          console.log('🗑️ [BOTÓN] Botón eliminar presionado para plan:', plan.id, plan.name);
                          deletePlan(plan.id, plan.name);
                        }}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={['#ff6b6b', '#ee5a52']}
                          style={styles.deleteButtonGradient}
                        >
                          <Ionicons name="trash-outline" size={14} color={Colors.white} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Acciones del plan */}
                  <View style={styles.planActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        navigation.navigate('PlanDetail', { planId: plan.id });
                      }}
                    >
                      <LinearGradient
                        colors={['#60A5FA', '#3B82F6']}
                        style={styles.actionButtonGradient}
                      >
                        <View style={styles.actionButtonContent}>
                          <Ionicons name="eye-outline" size={16} color={Colors.white} />
                          <Text style={styles.actionButtonText} numberOfLines={1}>Ver Plan</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.characteristicsButton]}
                      onPress={() => {
                        showPlanCharacteristics(plan);
                      }}
                    >
                      <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        style={styles.actionButtonGradient}
                      >
                        <View style={styles.actionButtonContent}>
                          <Ionicons name="settings-outline" size={16} color={Colors.white} />
                          <Text style={styles.actionButtonText} numberOfLines={1}>Ajustes</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para editar nombre del plan */}
      <Modal
        visible={editingPlanId !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Nombre del Plan</Text>
              <TouchableOpacity onPress={cancelEdit} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Nuevo nombre:</Text>
              <TextInput
                style={styles.modalInput}
                value={editingPlanName}
                onChangeText={setEditingPlanName}
                placeholder="Ingresa el nuevo nombre del plan"
                placeholderTextColor={Colors.gray}
                maxLength={50}
                autoFocus={true}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={cancelEdit}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={savePlanName}
              >
                <Text style={styles.modalSaveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerPattern2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  backButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerMain: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  headerStats: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 24,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
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
  planTypeHeader: {
    marginTop: -20,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.large,
  },
  sectionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    ...Shadows.medium,
  },
  sectionTextContainer: {
    flex: 1,
  },
  planTypeTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planTypeSubtitle: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  actionButtonsSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  createPlanButton: {
    borderRadius: BorderRadius.xl,
    ...Shadows.large,
    overflow: 'hidden',
    elevation: 8,
  },
  createButtonGradient: {
    padding: Spacing.lg,
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  createButtonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonTextContainer: {
    flex: 1,
  },
  createPlanButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
  },
  createPlanButtonSubtext: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
    fontSize: 12,
  },
  createButtonArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPlanButtonDisabled: {
    backgroundColor: Colors.gray,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 5,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    ...Shadows.large,
    elevation: 12,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyIconDecoration: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(240, 147, 251, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(240, 147, 251, 0.2)',
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 26,
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    lineHeight: 32,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  plansContainer: {
    paddingVertical: Spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 60,
    transform: [{ translateX: 40 }, { translateY: -40 }],
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.1)',
  },
  planCardDecorationSecondary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 80,
    height: 80,
    backgroundColor: 'rgba(34, 197, 94, 0.03)',
    borderRadius: 40,
    transform: [{ translateX: -20 }, { translateY: 20 }],
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.08)',
  },
  planCardGradient: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  planIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    ...Shadows.small,
  },
  planDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  planStatusContainer: {
    marginTop: 8,
  },
  planStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  planStatusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  editButtonGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateGradient: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    margin: Spacing.lg,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyActionText: {
    ...Typography.caption,
    color: Colors.white,
    opacity: 0.9,
  },
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  planIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 4,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    ...Shadows.large,
    elevation: 6,
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    position: 'relative',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  planInfo: {
    flex: 1,
  },
  planActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: Spacing.xs,
    gap: 4,
  },
  planName: {
    ...Typography.h4,
    color: Colors.primary,
    marginBottom: 2,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  planDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },

  planActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: '#60A5FA',
    overflow: 'hidden',
    ...Shadows.small,
    elevation: 4,
    shadowColor: '#60A5FA',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    position: 'relative',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minHeight: 40,
  },

  actionButtonText: {
    ...Typography.caption,
    color: '#60A5FA',
    marginLeft: Spacing.xs,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
    flex: 1,
  },
  characteristicsButton: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 2,
  },
  characteristicsButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  modalLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.lightGray,
  },
  modalCancelButtonText: {
    ...Typography.button,
    color: Colors.textSecondary,
  },
  modalSaveButton: {
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: '#27AE60',
    shadowColor: '#27AE60',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalSaveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default PlanManagementScreen;
