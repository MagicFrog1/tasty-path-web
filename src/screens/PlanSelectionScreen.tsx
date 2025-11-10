import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { useSubscription } from '../context/SubscriptionContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { SubscriptionPlan } from '../types';
import { revenueCatService, SubscriptionProduct, SubscriptionStatus } from '../services/RevenueCatService';

const { width } = Dimensions.get('window');

// Interfaz unificada para los planes
interface UnifiedPlan {
  id: SubscriptionPlan;
  name: string;
  price: string;
  priceString?: string;
  period: string;
  duration: string;
  features: Array<{
    id: string;
    name: string;
    description: string;
    available: boolean;
  }>;
  limitations?: string[];
  isTrial?: boolean;
  isPopular?: boolean;
  isBestValue?: boolean;
  originalPrice?: string;
  gradient: readonly [string, string];
  buttonStyle: 'gradient';
  isRevenueCatProduct: boolean;
}

interface PlanSelectionScreenProps {
  navigation: any;
  onPlanSelected: () => void;
}

const PlanSelectionScreen: React.FC<PlanSelectionScreenProps> = ({ navigation, onPlanSelected }) => {
  const { selectPlan } = useSubscription();
  const { navigateToHome } = useNavigation();
  const { user, markFreePlanUsed } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan | null>(null);
  
  // --- Lógica de RevenueCat integrada ---
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await revenueCatService.getSubscriptionStatus();
      setHasPremiumAccess(status.isPremium);
    } catch (error) {
      console.error('Error actualizando estado de suscripción:', error);
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await revenueCatService.purchaseProduct(productId);
      if (result.success) {
        await refreshSubscriptionStatus();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error inesperado en la compra' };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus]);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await revenueCatService.restorePurchases();
      if (result.success) {
        await refreshSubscriptionStatus();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Error restaurando compras' };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus]);
  
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        const success = await revenueCatService.initialize(user?.id);
        setIsInitialized(success);
        if (success) {
          const loadedProducts = await revenueCatService.loadOfferings();
          setProducts(loadedProducts);
          await refreshSubscriptionStatus();
        }
      } catch (error) {
        console.error("Error inicializando RevenueCat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [user, refreshSubscriptionStatus]);
  // --- Fin de la lógica de RevenueCat ---

  // Función para crear un plan desde un producto de RevenueCat
  const createPlanFromRevenueCatProduct = (product: SubscriptionProduct): UnifiedPlan => {
    const isWeekly = product.id.includes('Weekly');
    const isMonthly = product.id.includes('Monthly');
    const isAnnual = product.id.includes('Annual');
    
    return {
      id: product.id as SubscriptionPlan,
      name: product.title,
      price: product.price,
      priceString: product.priceString,
      period: isWeekly ? 'semana' : isMonthly ? 'mes' : 'año',
      duration: isWeekly ? '1 semana' : isMonthly ? '1 mes' : '1 año',
      features: [
        { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
        { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
        { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
        { id: 'nutrition_tracking', name: 'Seguimiento Nutricional', description: 'Análisis detallado de nutrientes', available: true },
        { id: 'premium_recipes', name: 'Recetas Premium', description: 'Recetas exclusivas y avanzadas', available: true },
        { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
        { id: 'export_reports', name: 'Exportar Reportes', description: 'Descarga de reportes en PDF', available: true },
      ],
      isPopular: isMonthly,
      isBestValue: isAnnual,
      gradient: [Colors.primary, Colors.accent] as const,
      buttonStyle: 'gradient' as const,
      isRevenueCatProduct: true
    };
  };

  // Plan gratuito (siempre disponible)
  const freePlan: UnifiedPlan = {
    id: 'free' as SubscriptionPlan,
    name: 'Plan Gratuito',
    price: '0',
    period: '3 días',
    duration: '3 días de prueba',
    features: [
      { id: 'ai_plans', name: 'Planes IA', description: 'Generación de planes personalizados', available: true },
      { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
      { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
      { id: 'nutrition_tracking', name: 'Seguimiento Nutricional', description: 'Análisis detallado de nutrientes', available: true },
    ],
    limitations: [
      'Solo 1 plan semanal',
      'Recetas limitadas',
      'Sin soporte prioritario',
      'Sin exportar reportes',
      'Sin recetas premium'
    ],
    isTrial: true,
    gradient: [Colors.secondary, Colors.primary] as const,
    buttonStyle: 'gradient' as const,
    isRevenueCatProduct: false
  };

  // Crear planes desde productos de RevenueCat
  const revenueCatPlans = products.map(createPlanFromRevenueCatProduct);
  
  // Combinar plan gratuito con planes de RevenueCat
  const allPlans = [freePlan, ...revenueCatPlans];

  // Filtrar planes disponibles: si el usuario ya usó el plan gratuito, solo mostrar planes de pago
  const subscriptionPlans: UnifiedPlan[] = user?.hasUsedFreePlan 
    ? allPlans.filter(plan => plan.id !== 'free')
    : allPlans;

  const handlePlanSelection = (planId: SubscriptionPlan) => {
    setSelectedPlanId(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlanId) {
      Alert.alert('Error', 'Por favor selecciona un plan para continuar');
      return;
    }

    setIsLoading(true);

    try {
      const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
      
      if (!selectedPlan) {
        Alert.alert('Error', 'Plan seleccionado no encontrado');
        setIsLoading(false);
        return;
      }

      // Si es un producto de RevenueCat, realizar la compra
      if (selectedPlan.isRevenueCatProduct && isInitialized) {
        // Buscar el producto correspondiente en RevenueCat
        const revenueCatProduct = products.find(product => product.id === selectedPlanId);
        
        if (revenueCatProduct) {
          const result = await purchaseProduct(revenueCatProduct.id);
          
          if (result.success) {
            // Compra exitosa, actualizar estado y continuar
            await refreshSubscriptionStatus();
            await selectPlan(selectedPlanId);
            await onPlanSelected();
            navigateToHome();
          } else {
            // Error en la compra, mostrar mensaje
            Alert.alert('Error en la compra', result.error || 'No se pudo completar la compra');
          }
        } else {
          Alert.alert('Error', 'No se encontró el producto de suscripción');
        }
      } else if (selectedPlanId === 'free') {
        // Si es el plan gratuito, marcar como usado y continuar
        await markFreePlanUsed();
        await selectPlan(selectedPlanId);
        Alert.alert(
          '¡Bienvenido!',
          'Has seleccionado el plan gratuito. Disfruta de 3 días de prueba completa. Solo puedes crear 1 plan semanal durante este período.',
          [{ text: 'Continuar', onPress: async () => {
            await onPlanSelected();
            navigateToHome();
          }}]
        );
      } else {
        // Plan de pago tradicional (fallback)
        await selectPlan(selectedPlanId);
        await onPlanSelected();
        navigateToHome();
      }
    } catch (error) {
      console.error('Error en handleContinue:', error);
      Alert.alert('Error', 'No se pudo procesar la selección del plan. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="restaurant" size={40} color={Colors.white} />
          </View>
          <Text style={styles.headerTitle}>¡Bienvenido a TastyPath!</Text>
          <Text style={styles.headerSubtitle}>
            Elige tu plan para comenzar tu transformación nutricional
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Aviso cuando RevenueCat está activo pero no hay productos (offerings vacíos) */}
        {isInitialized && products.length === 0 && (
          <View style={styles.offeringsWarningBox}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <Text style={styles.offeringsWarningTitle}>No se encontraron productos de suscripción</Text>
              <Text style={styles.offeringsWarningText}>
                Esto suele ocurrir cuando el Offering "Current" de RevenueCat no está configurado o los productos no están listos en App Store Connect.
              </Text>
              <Text style={styles.offeringsWarningSteps}>
                - Verifica en RevenueCat: Offerings → marca uno como "Current" y añade los paquetes.
                {'\n'}- Asegúrate de que los productos existan en App Store Connect y estén completos.
                {'\n'}- Prueba en un iPhone físico (no Expo Go) con un Sandbox Tester.
              </Text>
            </View>
          </View>
        )}
        {/* Mensaje de bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>🎉 ¡Felicitaciones por unirte!</Text>
          <Text style={styles.welcomeText}>
            Para comenzar a usar todas las funciones de TastyPath, necesitas seleccionar un plan.
            {user?.hasUsedFreePlan 
              ? ' Elige uno de nuestros planes premium para acceder a todas las funciones.'
              : ' Puedes empezar con nuestra prueba gratuita de 3 días o elegir directamente un plan premium.'
            }
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Nota:</Text> El plan gratuito tiene limitaciones en el número de planes y funciones disponibles. 
              Los planes premium ofrecen acceso completo sin restricciones.
            </Text>
          </View>

          <View style={styles.supportBox}>
            <Ionicons name="mail" size={20} color={Colors.secondary} />
            <Text style={styles.supportText}>
              <Text style={styles.supportBold}>¿Necesitas ayuda?</Text> Contáctanos en{' '}
              <Text style={styles.emailLink}>tastypathhelp@gmail.com</Text>
            </Text>
          </View>
        </View>

        {/* Planes de suscripción */}
        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan, index) => {
            const isSelected = selectedPlanId === plan.id;

            return (
              <View key={plan.id} style={styles.planCardWrapper}>
                {/* Badge superior */}
                {plan.isTrial && (
                  <View style={styles.trialBadge}>
                    <Text style={styles.trialBadgeText}>PRUEBA GRATIS</Text>
                  </View>
                )}
                
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Más Popular</Text>
                  </View>
                )}
                
                {plan.isBestValue && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueBadgeText}>Mejor Valor</Text>
                  </View>
                )}

                <View style={[
                  styles.planCard,
                  isSelected && styles.selectedCard
                ]}>
                  {/* Header del plan */}
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceSection}>
                      {plan.originalPrice && (
                        <Text style={styles.originalPrice}>€{plan.originalPrice}</Text>
                      )}
                      <Text style={styles.price}>
                        {plan.isRevenueCatProduct ? plan.priceString : `€${plan.price}`}
                      </Text>
                    </View>
                  </View>

                  {/* Duración y precio mensual */}
                  <View style={styles.durationSection}>
                    <Text style={styles.durationText}>Duración: {plan.duration}</Text>
                    {plan.period === 'año' && (
                      <Text style={styles.monthlyEquivalentText}>
                        Equivale a €{(parseFloat(plan.price.replace(',', '.')) / 12).toFixed(2)}/mes
                      </Text>
                    )}
                    {plan.period === 'semana' && (
                      <Text style={styles.monthlyEquivalentText}>
                        Equivale a €{(parseFloat(plan.price.replace(',', '.')) * 4).toFixed(2)}/mes
                      </Text>
                    )}
                    {plan.period === 'mes' && (
                      <Text style={styles.monthlyEquivalentText}>
                        Precio mensual: €{plan.price}/mes
                      </Text>
                    )}
                  </View>

                  {/* Características */}
                  <View style={styles.featuresSection}>
                    {plan.features.map((feature) => (
                      <View key={feature.id} style={styles.featureRow}>
                        <Ionicons
                          name={feature.available ? 'checkmark-circle' : 'close-circle'}
                          size={16}
                          color={feature.available ? Colors.success : Colors.error}
                        />
                        <Text style={[
                          styles.featureText,
                          !feature.available && styles.featureTextDisabled
                        ]}>
                          {feature.name}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Limitaciones del plan gratuito */}
                  {plan.id === 'free' && plan.limitations && (
                    <View style={styles.limitationsSection}>
                      <Text style={styles.limitationsTitle}>⚠️ Limitaciones:</Text>
                      {plan.limitations.map((limitation: string, index: number) => (
                        <View key={index} style={styles.limitationRow}>
                          <Ionicons
                            name="warning"
                            size={14}
                            color={Colors.warning}
                          />
                          <Text style={styles.limitationText}>
                            {limitation}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Botón de selección */}
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      plan.buttonStyle === 'gradient' && styles.gradientButton,
                    ]}
                    onPress={() => handlePlanSelection(plan.id)}
                  >
                    {plan.buttonStyle === 'gradient' ? (
                      <LinearGradient
                        colors={plan.gradient}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.selectButtonText}>
                          {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar'}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.selectButtonText}>Seleccionar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Botón de continuar */}
        {selectedPlanId && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.continueButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                )}
                <Text style={styles.continueButtonText}>
                  {isLoading ? 'Procesando...' : 'Continuar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón para restaurar compras */}
        {isInitialized && (
          <View style={styles.restoreButtonContainer}>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={async () => {
                const result = await restorePurchases();
                if (result.success) {
                  await onPlanSelected();
                  navigateToHome();
                }
              }}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={16} color={Colors.primary} />
              <Text style={styles.restoreButtonText}>Restaurar Compras</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estado de RevenueCat */}
        {!isInitialized && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  welcomeSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: '#e3f2fd',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  infoBold: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#f0f8ff',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  supportBold: {
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  emailLink: {
    color: Colors.secondary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  plansContainer: {
    marginBottom: Spacing.xl,
  },
  planCardWrapper: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    marginHorizontal: Spacing.sm,
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  trialBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    zIndex: 1,
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.md,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    left: Spacing.md,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    zIndex: 1,
  },
  bestValueBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  durationSection: {
    marginBottom: Spacing.md,
  },
  durationText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  monthlyEquivalentText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  featuresSection: {
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  featureTextDisabled: {
    color: Colors.textSecondary,
  },
  limitationsSection: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: '#fef3cd',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
    marginBottom: Spacing.xs,
  },
  limitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  limitationText: {
    fontSize: 12,
    color: Colors.warning,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  selectButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  actionButtons: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  continueButton: {
    marginBottom: Spacing.md,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonGradient: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  restoreButtonContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  offeringsWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFF8E1',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  offeringsWarningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 4,
  },
  offeringsWarningText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  offeringsWarningSteps: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
});

export default PlanSelectionScreen;
