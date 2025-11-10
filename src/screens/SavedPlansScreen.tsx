import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';

interface SavedPlan {
  id: string;
  name: string;
  createdAt: string;
  config: {
    goals: string[];
    dietaryPreferences: string[];
    weeklyBudget: number;
    familySize: number;
    activityLevel: string;
  };
  meals: {
    monday: any;
    tuesday: any;
    wednesday: any;
    thursday: any;
    friday: any;
    saturday: any;
    sunday: any;
  };
  totalCost: number;
  estimatedCalories: number;
}

interface SavedPlansScreenProps {
  navigation: any;
  route: any;
}

const SavedPlansScreen: React.FC<SavedPlansScreenProps> = ({ navigation, route }) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([
    {
      id: '1',
      name: 'Plan Semanal - Semana 1',
      createdAt: '2024-01-15',
      config: {
        goals: ['Pérdida de peso', 'Mejorar energía'],
        dietaryPreferences: ['Vegetariana'],
        weeklyBudget: 65,
        familySize: 2,
        activityLevel: 'Moderado',
      },
      meals: {
        monday: { breakfast: 'Avena con frutas', lunch: 'Ensalada César', dinner: 'Salmón al horno' },
        tuesday: { breakfast: 'Yogur con granola', lunch: 'Sopa de verduras', dinner: 'Pollo a la plancha' },
        wednesday: { breakfast: 'Tostadas integrales', lunch: 'Quinoa con verduras', dinner: 'Lentejas estofadas' },
        thursday: { breakfast: 'Huevos revueltos', lunch: 'Ensalada de garbanzos', dinner: 'Pescado blanco' },
        friday: { breakfast: 'Cereal integral', lunch: 'Ensalada de atún', dinner: 'Tortilla de verduras' },
        saturday: { breakfast: 'Panqueques de avena', lunch: 'Paella de mariscos', dinner: 'Carne a la parrilla' },
        sunday: { breakfast: 'Tortilla española', lunch: 'Cocido madrileño', dinner: 'Sopa de pescado' },
      },
      totalCost: 65,
      estimatedCalories: 2000,
    },
    {
      id: '2',
      name: 'Plan Semanal - Semana 2',
      createdAt: '2024-01-22',
      config: {
        goals: ['Mantenimiento', 'Salud cardiovascular'],
        dietaryPreferences: ['Mediterránea'],
        weeklyBudget: 70,
        familySize: 2,
        activityLevel: 'Activo',
      },
      meals: {
        monday: { breakfast: 'Smoothie de proteínas', lunch: 'Ensalada mediterránea', dinner: 'Pasta integral' },
        tuesday: { breakfast: 'Tostadas con aguacate', lunch: 'Sopa de lentejas', dinner: 'Pollo mediterráneo' },
        wednesday: { breakfast: 'Huevos benedictinos', lunch: 'Quinoa con verduras', dinner: 'Pescado al horno' },
        thursday: { breakfast: 'Yogur griego', lunch: 'Ensalada de garbanzos', dinner: 'Carne magra' },
        friday: { breakfast: 'Avena con frutos secos', lunch: 'Sopa de tomate', dinner: 'Tortilla española' },
        saturday: { breakfast: 'Pan integral', lunch: 'Paella vegetariana', dinner: 'Pollo a la plancha' },
        sunday: { breakfast: 'Cereal con leche', lunch: 'Ensalada mixta', dinner: 'Sopa de pescado' },
      },
      totalCost: 70,
      estimatedCalories: 2200,
    },
  ]);

  const viewPlan = (plan: SavedPlan) => {
    // Aquí podrías navegar a una pantalla de vista detallada del plan
    Alert.alert(
      plan.name,
      `Presupuesto: €${plan.totalCost}\nCalorías estimadas: ${plan.estimatedCalories}\nObjetivos: ${plan.config.goals.join(', ')}`,
      [
        { text: 'Ver Detalles', onPress: () => Alert.alert('Funcionalidad', 'Vista detallada próximamente') },
        { text: 'Editar Plan', onPress: () => Alert.alert('Funcionalidad', 'Edición próximamente') },
        { text: 'Cerrar' }
      ]
    );
  };

  const deletePlan = (planId: string) => {
    Alert.alert(
      'Eliminar Plan',
      '¿Estás seguro de que quieres eliminar este plan?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setSavedPlans(prev => prev.filter(plan => plan.id !== planId));
            Alert.alert('Plan Eliminado', 'El plan ha sido eliminado exitosamente');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGoalsSummary = (goals: string[]) => {
    if (goals.length <= 2) return goals.join(', ');
    return `${goals.slice(0, 2).join(', ')} y ${goals.length - 2} más`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={Colors.primaryGradient}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerMain}>
            <Ionicons name="bookmark" size={48} color={Colors.white} />
            <Text style={styles.headerTitle}>Planes Guardados</Text>
            <Text style={styles.headerSubtitle}>
              Tus planes semanales personalizados
            </Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Contenido */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {savedPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No tienes planes guardados</Text>
            <Text style={styles.emptyDescription}>
              Genera tu primer plan semanal para comenzar
            </Text>
            <TouchableOpacity 
              style={styles.createPlanButton}
              onPress={() => navigation.navigate('Plan Semanal')}
            >
              <Ionicons name="create" size={20} color={Colors.white} />
              <Text style={styles.createPlanButtonText}>Crear Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {savedPlans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePlan(plan.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.planStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="pricetag-outline" size={16} color={Colors.primary} />
                    <Text style={styles.statText}>€{plan.totalCost}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="flame-outline" size={16} color={Colors.accent} />
                    <Text style={styles.statText}>{plan.estimatedCalories} cal</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color={Colors.secondary} />
                    <Text style={styles.statText}>{plan.config.familySize} pers.</Text>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <Text style={styles.detailLabel}>Objetivos:</Text>
                  <Text style={styles.detailText}>{getGoalsSummary(plan.config.goals)}</Text>
                  
                  <Text style={styles.detailLabel}>Preferencias:</Text>
                  <Text style={styles.detailText}>{plan.config.dietaryPreferences.join(', ')}</Text>
                  
                  <Text style={styles.detailLabel}>Nivel de actividad:</Text>
                  <Text style={styles.detailText}>{plan.config.activityLevel}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.viewPlanButton}
                  onPress={() => viewPlan(plan)}
                >
                  <Ionicons name="eye-outline" size={20} color={Colors.white} />
                  <Text style={styles.viewPlanButtonText}>Ver Plan Completo</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
    paddingTop: 60,
    paddingBottom: 40,
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  createPlanButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  createPlanButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  plansContainer: {
    paddingVertical: Spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  planDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  planDetails: {
    marginBottom: Spacing.lg,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  viewPlanButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  viewPlanButtonText: {
    ...Typography.button,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
});

export default SavedPlansScreen;
