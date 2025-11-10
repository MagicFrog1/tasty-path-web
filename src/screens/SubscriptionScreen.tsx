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
import { revenueCatService, SubscriptionProduct, SubscriptionStatus } from '../services/RevenueCatService';
import { useAuth } from '../context/AuthContext';
import { SubscriptionPlan } from '../types';

const { width } = Dimensions.get('window');

interface SubscriptionScreenProps {
  navigation: any;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
  const { currentPlan, cancelSubscription } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan | null>(null);
  
  // --- Lógica de RevenueCat integrada ---
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [products, setProducts] = useState<SubscriptionProduct[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isPremium: false,
    activeSubscriptions: []
  });
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const { user } = useAuth();

  const mapProductIdToPlan = (productId?: string): string | null => {
    if (!productId) return null;
    const id = productId.toLowerCase();
    if (id.includes('weekly')) return 'weekly';
    if (id.includes('monthly')) return 'monthly';
    if (id.includes('annual')) return 'annual';
    return null;
  };

  const loadProducts = useCallback(async (): Promise<void> => {
    try {
      const loadedProducts = await revenueCatService.loadOfferings();
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }, []);

  const refreshSubscriptionStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await revenueCatService.getSubscriptionStatus();
      setSubscriptionStatus(status);
      setHasPremiumAccess(status.isPremium);
    } catch (error) {
      console.error('Error actualizando estado de suscripción:', error);
    }
  }, []);

  const initializeRevenueCat = useCallback(async (userId?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await revenueCatService.initialize(userId);
      setIsInitialized(success);
      if (success) {
        await loadProducts();
        await refreshSubscriptionStatus();
      }
      return success;
    } catch (error) {
      console.error('Error inicializando RevenueCat:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts, refreshSubscriptionStatus]);
  
  const purchaseProduct = useCallback(async (productId: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await revenueCatService.purchaseProduct(productId);
      if (result.success) {
        await refreshSubscriptionStatus();
        revenueCatService.showSuccessMessage();
      } else {
        revenueCatService.showErrorMessage(result.error || 'Error en la compra');
      }
      return result;
    } catch (error) {
      const errorMessage = 'Error inesperado en la compra';
      revenueCatService.showErrorMessage(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [refreshSubscriptionStatus, user]);

  useEffect(() => {
    if (!isInitialized) {
      initializeRevenueCat(user?.id);
    }
  }, [initializeRevenueCat, isInitialized, user]);
  // --- Fin de la lógica de RevenueCat ---

  const createSubscriptionPlansFromRevenueCat = (products: SubscriptionProduct[]) => {
    return products.map((product) => {
      const isWeekly = product.id.includes('Weekly');
      const isMonthly = product.id.includes('Monthly');
      const isAnnual = product.id.includes('Annual');
      
      // Colores que combinan con fondo violeta
      let gradient, iconName, badgeColor, planColor, accentColor;
      if (isWeekly) {
        gradient = Colors.premiumTealGradient;
        iconName = 'flash-outline';
        badgeColor = '#10B981'; // Verde esmeralda para semanal
        planColor = '#10B981'; // Verde para el plan semanal
        accentColor = '#059669'; // Verde más oscuro
      } else if (isMonthly) {
        gradient = Colors.premiumIndigoGradient;
        iconName = 'star-outline';
        badgeColor = '#8B5CF6'; // Violeta principal
        planColor = '#8B5CF6'; // Violeta que armoniza con el fondo
        accentColor = '#7C3AED'; // Violeta más oscuro
      } else {
        gradient = Colors.premiumEmeraldGradient;
        iconName = 'trophy-outline';
        badgeColor = '#F59E0B'; // Amarillo dorado para mejor valor (anual)
        planColor = '#F59E0B'; // Amarillo dorado para el plan anual
        accentColor = '#D97706'; // Amarillo más oscuro
      }
      
      return {
        id: product.id as SubscriptionPlan,
        name: product.title,
        price: product.price,
        originalPrice: null, // RevenueCat maneja los precios
        period: isWeekly ? 'semana' : isMonthly ? 'mes' : 'año',
        duration: isWeekly ? '1 semana' : isMonthly ? '1 mes' : '1 año',
        features: [
          { id: 'unlimited_plans', name: '∞ Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
          { id: 'recipes', name: '🍽️ Recetas Premium', description: 'Acceso completo a base de datos de recetas', available: true },
          { id: 'shopping_list', name: '🛒 Listas Inteligentes', description: 'Generación automática de listas optimizadas', available: true },
          { id: 'plan_generator', name: '🤖 IA Avanzada', description: 'Generador de planes con inteligencia artificial', available: true },
          { id: 'priority_support', name: '💎 Soporte VIP', description: 'Atención al cliente prioritaria 24/7', available: true },
        ],
        isPopular: isMonthly,
        isBestValue: isAnnual,
        isTrial: false,
        gradient: gradient,
        iconName: iconName,
        badgeColor: badgeColor,
        planColor: planColor,
        accentColor: accentColor,
        buttonStyle: 'gradient' as const,
        revenueCatProduct: product
      };
    });
  };

  const subscriptionPlans = isInitialized && products.length > 0 
    ? createSubscriptionPlansFromRevenueCat(products)
    : [
        // Fallback con datos hardcodeados si RevenueCat no está disponible
        {
          id: 'annual' as SubscriptionPlan,
          name: 'Anual',
          price: '79,99',
          originalPrice: '95,88',
          period: 'año',
          duration: '1 año',
          features: [
            { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
            { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
            { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
            { id: 'plan_generator', name: 'Generador de Planes', description: 'Acceso a todas las funciones de generador de planes', available: true },
            { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
          ],
          isPopular: false,
          isBestValue: true,
          isTrial: false,
          gradient: [Colors.premiumGold, Colors.premiumOrange] as const,
          iconName: 'trophy-outline',
          badgeColor: '#F59E0B', // Amarillo dorado para mejor valor (anual)
          planColor: '#F59E0B', // Amarillo dorado para el plan anual
          accentColor: '#D97706', // Amarillo más oscuro
          buttonStyle: 'gradient'
        },
        {
          id: 'monthly' as SubscriptionPlan,
          name: 'Mensual',
          price: '7,99',
          originalPrice: '19,96',
          period: 'mes',
          duration: '1 mes',
          features: [
            { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
            { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
            { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
            { id: 'plan_generator', name: 'Generador de Planes', description: 'Acceso a todas las funciones de generador de planes', available: true },
            { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
          ],
          isPopular: true,
          isBestValue: false,
          isTrial: false,
          gradient: [Colors.premiumGold, Colors.premiumOrange] as const,
          iconName: 'star-outline',
          badgeColor: '#8B5CF6', // Violeta principal
          planColor: '#8B5CF6', // Violeta que armoniza con el fondo
          accentColor: '#7C3AED', // Violeta más oscuro
          buttonStyle: 'gradient'
        },
        {
          id: 'weekly' as SubscriptionPlan,
          name: 'Semanal',
          price: '4,99',
          originalPrice: null,
          period: 'semana',
          duration: '1 semana',
          features: [
            { id: 'unlimited_plans', name: 'Planes Ilimitados', description: 'Generación ilimitada de planes personalizados', available: true },
            { id: 'recipes', name: 'Recetas', description: 'Acceso a base de datos de recetas', available: true },
            { id: 'shopping_list', name: 'Lista de Compras', description: 'Generación automática de listas', available: true },
            { id: 'plan_generator', name: 'Generador de Planes', description: 'Acceso a todas las funciones de generador de planes', available: true },
            { id: 'priority_support', name: 'Soporte Prioritario', description: 'Atención al cliente prioritaria', available: true },
          ],
          isPopular: false,
          isBestValue: false,
          isTrial: false,
          gradient: [Colors.premiumGold, Colors.premiumOrange] as const,
          iconName: 'flash-outline',
          badgeColor: '#10B981', // Verde esmeralda para semanal
          planColor: '#10B981', // Verde para el plan semanal
          accentColor: '#059669', // Verde más oscuro
          buttonStyle: 'gradient'
        }
      ];

  const handlePlanSelection = (planId: SubscriptionPlan) => {
    if (currentPlan?.plan === planId) {
      Alert.alert('Plan Actual', 'Ya tienes este plan activo');
      return;
    }
    setSelectedPlanId(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      Alert.alert('Error', 'Por favor selecciona un plan');
      return;
    }

    try {
      const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
      if (!selectedPlan) {
        Alert.alert('Error', 'Plan no encontrado');
        return;
      }

      if (isInitialized && products.length > 0) {
        const revenueCatProduct = products.find(product => {
          const isWeekly = product.id.includes('Weekly') && selectedPlanId.includes('Weekly');
          const isMonthly = product.id.includes('Monthly') && selectedPlanId.includes('Monthly');
          const isAnnual = product.id.includes('Annual') && selectedPlanId.includes('Annual');
          return isWeekly || isMonthly || isAnnual;
        });

        if (revenueCatProduct) {
          try {
            const result = await purchaseProduct(revenueCatProduct.id);
            
            if (result.success) {
              Alert.alert(
                '¡Suscripción Exitosa!',
                `Te has suscrito al plan ${selectedPlan.name} exitosamente.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Actualizar estado de suscripción
                      refreshSubscriptionStatus();
                      // Navegar de vuelta o a la pantalla principal
                      navigation.goBack();
                    }
                  }
                ]
              );
            } else {
              Alert.alert('Error', result.error || 'No se pudo procesar la compra');
            }
          } catch (error) {
            console.error('Error en compra RevenueCat:', error);
            Alert.alert('Error', 'Ocurrió un error durante la compra');
          }
        } else {
          Alert.alert('Error', 'No se encontró el producto de suscripción');
        }
      } else {
        Alert.alert('Error', 'RevenueCat no está disponible. Inténtalo más tarde.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud.');
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Suscripción',
      '¿Estás seguro de que quieres cancelar tu suscripción?',
      [
        { text: 'Mantener', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert('Suscripción Cancelada', 'Tu suscripción ha sido cancelada.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la suscripción.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando planes de suscripción...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#DDD6FE" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Elige tu plan</Text>
          <Text style={styles.headerSubtitle}>Desbloquea todo el potencial de TastyPath</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan actual si existe */}
        {currentPlan && (
          <View style={styles.currentPlanSection}>
            <Text style={styles.currentPlanTitle}>Tu Plan Actual</Text>
            <View style={styles.currentPlanCard}>
              <View style={styles.currentPlanHeader}>
                <Ionicons 
                  name={currentPlan.plan === 'free' ? 'gift' : 'diamond'} 
                  size={24} 
                  color={currentPlan.plan === 'free' ? '#F59E0B' : '#8B5CF6'} 
                />
                <Text style={styles.currentPlanName}>
                  {currentPlan.plan === 'free' ? 'Plan Gratuito' : 
                   subscriptionPlans.find(p => p.id === currentPlan.plan)?.name || 'Plan Premium'}
                </Text>
                <View style={[styles.currentPlanBadge, { 
                  backgroundColor: currentPlan.plan === 'free' ? '#FEF3C7' : '#F3E8FF' 
                }]}>
                  <Text style={[styles.currentPlanBadgeText, { 
                    color: currentPlan.plan === 'free' ? '#D97706' : '#8B5CF6' 
                  }]}>
                    ACTUAL
                  </Text>
                </View>
              </View>
              <Text style={styles.currentPlanDescription}>
                {currentPlan.plan === 'free' 
                  ? 'Acceso a funciones básicas con período de prueba'
                  : `€${currentPlan.price}/${subscriptionPlans.find(p => p.id === currentPlan.plan)?.period || 'mes'} - Acceso completo`
                }
              </Text>
            </View>
          </View>
        )}

        {/* Planes de suscripción */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Planes Premium Disponibles</Text>
          {subscriptionPlans.map((plan, index) => {
            const isCurrent = currentPlan?.plan === plan.id;
            const isSelected = selectedPlanId === plan.id;

            return (
              <View key={plan.id} style={styles.planCardWrapper}>
                {/* Badge superior */}
                {plan.isPopular && (
                  <View style={[styles.badge, styles.popularBadge]}>
                    <Ionicons name="star" size={14} color={Colors.white} />
                    <Text style={styles.badgeText}>Más Popular</Text>
                  </View>
                )}
                
                {plan.isBestValue && !plan.isPopular && (
                  <View style={[styles.badge, styles.bestValueBadge]}>
                    <Ionicons name="trophy" size={14} color={Colors.white} />
                    <Text style={styles.badgeText}>Mejor Valor</Text>
                  </View>
                )}
                
                {plan.isTrial && (
                  <View style={[styles.badge, styles.trialBadge]}>
                    <Ionicons name="hourglass" size={14} color={Colors.white} />
                    <Text style={styles.trialBadgeText}>3 DÍAS DE PRUEBA GRATIS</Text>
                  </View>
                )}

                <View style={[
                  styles.planCard,
                  plan.isTrial && styles.trialCard,
                  isSelected && [styles.selectedCard, { borderColor: plan.planColor }]
                ]}>
                  {/* Header del plan con borde colorido */}
                  <View style={[styles.planHeaderSection, { borderTopColor: plan.planColor, borderTopWidth: 4 }]}>
                    <View style={styles.planHeader}>
                      <View style={styles.planTitleContainer}>
                        <View style={[styles.planIconContainer, { backgroundColor: plan.planColor }]}>
                          <Ionicons name={(plan.iconName as any) || 'diamond-outline'} size={20} color={Colors.white} />
                        </View>
                        <View style={styles.planTitleText}>
                          <Text style={styles.planName}>{plan.name}</Text>
                          <Text style={[styles.planSubtitle, { color: plan.accentColor }]}>Plan Premium</Text>
                        </View>
                      </View>
                      <View style={styles.priceSection}>
                        {plan.originalPrice && (
                          <Text style={styles.originalPrice}>€{plan.originalPrice}</Text>
                        )}
                        <View style={styles.priceContainer}>
                          <Text style={[styles.price, { color: plan.planColor }]}>€{plan.price}</Text>
                          <Text style={styles.periodText}>/{plan.period}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Información del plan con colores */}
                  <View style={[styles.planInfoSection, { backgroundColor: `${plan.planColor}10` }]}>
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={16} color={plan.accentColor} />
                      <Text style={styles.durationText}>
                        {plan.duration} • Renovación automática
                      </Text>
                    </View>
                    {plan.period === 'año' && (
                      <View style={styles.benefitsContainer}>
                        <View style={styles.benefitItem}>
                          <Ionicons name="calculator-outline" size={14} color={plan.planColor} />
                          <Text style={[styles.benefitText, { color: plan.planColor }]}>
                            Solo €{(parseFloat(plan.price.replace(',', '.')) / 12).toFixed(2)}/mes
                          </Text>
                        </View>
                        <View style={styles.benefitItem}>
                          <Ionicons name="trending-down-outline" size={14} color={Colors.success} />
                          <Text style={[styles.benefitText, { color: Colors.success }]}>
                            Ahorra hasta el 17% vs mensual
                          </Text>
                        </View>
                      </View>
                    )}
                    {plan.period === 'semana' && (
                      <View style={styles.benefitsContainer}>
                        <View style={styles.benefitItem}>
                          <Ionicons name="flash-outline" size={14} color={plan.planColor} />
                          <Text style={[styles.benefitText, { color: plan.planColor }]}>
                            Perfecto para probar TastyPath
                          </Text>
                        </View>
                        <View style={styles.benefitItem}>
                          <Ionicons name="card-outline" size={14} color={Colors.info} />
                          <Text style={[styles.benefitText, { color: Colors.info }]}>
                            Equivale a €{(parseFloat(plan.price.replace(',', '.')) * 4).toFixed(2)}/mes
                          </Text>
                        </View>
                      </View>
                    )}
                    {plan.period === 'mes' && (
                      <View style={styles.benefitsContainer}>
                        <View style={styles.benefitItem}>
                          <Ionicons name="star-outline" size={14} color={plan.planColor} />
                          <Text style={[styles.benefitText, { color: plan.planColor }]}>
                            Plan más popular entre usuarios
                          </Text>
                        </View>
                        <View style={styles.benefitItem}>
                          <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
                          <Text style={[styles.benefitText, { color: Colors.success }]}>
                            Precio fijo sin sorpresas
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Características */}
                  <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Ventajas Incluidas</Text>
                    {plan.features.map((feature, index) => (
                      <View key={feature.id} style={[styles.featureRow, index === 0 && { borderTopWidth: 0 }]}>
                        <Ionicons
                          name={feature.available ? 'checkmark-circle-outline' : 'close-circle-outline'}
                          size={20}
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


                  {/* Botón de selección con color del plan */}
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      { backgroundColor: plan.planColor },
                      isSelected && styles.selectedButton,
                      isCurrent && styles.currentButton
                    ]}
                    onPress={() => handlePlanSelection(plan.id)}
                    disabled={isCurrent}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selectButtonContent}>
                      <Ionicons 
                        name={isCurrent ? 'checkmark-circle' : isSelected ? 'checkmark' : 'add'} 
                        size={18} 
                        color={Colors.white} 
                      />
                      <Text style={[
                        styles.selectButtonText,
                        isCurrent && styles.currentButtonText
                      ]}>
                        {isCurrent ? 'Plan Actual' : isSelected ? 'Seleccionado' : 'Seleccionar'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Botón de suscripción */}
        {selectedPlanId && selectedPlanId !== currentPlan?.plan && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Ionicons name="card" size={20} color={Colors.white} />
              <Text style={styles.subscribeButtonText}>
                Suscribirse por €{subscriptionPlans.find(p => p.id === selectedPlanId)?.price}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de cancelación */}
        {currentPlan && currentPlan.plan !== 'free' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSubscription}
            >
              <Ionicons name="close-circle" size={20} color={Colors.white} />
              <Text style={styles.cancelButtonText}>Cancelar Suscripción</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Información de suscripción auto-renovable */}
        <View style={styles.subscriptionInfoSection}>
          <View style={styles.subscriptionInfoCard}>
            <Ionicons name="information-circle" size={24} color={Colors.info} />
            <Text style={styles.subscriptionInfoTitle}>Suscripción Auto-Renovable</Text>
          </View>
          
          <Text style={styles.subscriptionInfoText}>
            • Las suscripciones se renuevan automáticamente a menos que se cancelen al menos 24 horas antes del final del período actual.
          </Text>
          <Text style={styles.subscriptionInfoText}>
            • La cancelación toma efecto al final del período de facturación actual.
          </Text>
          <Text style={styles.subscriptionInfoText}>
            • Puedes gestionar tu suscripción en la configuración de tu cuenta de Apple ID.
          </Text>
          <Text style={styles.subscriptionInfoText}>
            • Los precios pueden variar según la región y están sujetos a cambios con previo aviso.
          </Text>
        </View>

        {/* Enlaces legales */}
        <View style={styles.legalLinksSection}>
          <Text style={styles.legalLinksTitle}>Información Legal</Text>
          
          <View style={styles.legalLinksContainer}>
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate('Terms')}
            >
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
              <Text style={styles.legalLinkText}>Términos de Servicio</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate('Privacy')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              <Text style={styles.legalLinkText}>Política de Privacidad</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de contacto */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>¿Necesitas ayuda?</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => {
              // Aquí podrías abrir el email o un formulario de contacto
              Alert.alert(
                'Contacto',
                'Para soporte con suscripciones, contacta con nosotros en: tastypathhelp@gmail.com',
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="mail" size={20} color="#8B5CF6" />
            <Text style={styles.contactButtonText}>tastypathhelp@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9D5FF', // Violeta más oscuro pero elegante
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#DDD6FE', // Violeta un poco más oscuro para el header
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF6', // Borde violeta
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8B5CF6', // Borde violeta
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937', // Gris muy oscuro para mejor contraste
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151', // Gris oscuro para subtítulo
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  currentPlanSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  currentPlanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  currentPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  currentPlanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  currentPlanBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPlanBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  currentPlanDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: Spacing.xl,
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  planCardWrapper: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  trialCard: {
    borderColor: Colors.secondary,
    borderWidth: 2,
  },
  selectedCard: {
    borderColor: Colors.premiumGold,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  planHeaderSection: {
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.05)', // Fondo violeta muy suave
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  badge: {
    position: 'absolute',
    top: -12,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.xs,
  },
  popularBadge: {
    backgroundColor: '#8B5CF6', // Violeta principal para mensual
  },
  bestValueBadge: {
    backgroundColor: '#F59E0B', // Amarillo dorado para mejor valor (anual)
  },
  trialBadge: {
    backgroundColor: '#10B981', // Verde para semanal
  },
  trialBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.xs,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  planTitleText: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  planSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  planInfoSection: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  benefitsContainer: {
    gap: Spacing.xs,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  monthlyEquivalentText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  savingsText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  trialText: {
    fontSize: 12,
    color: Colors.info,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  popularText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  featuresSection: {
    marginVertical: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    paddingHorizontal: Spacing.lg,
  },
  featuresTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  featureTextDisabled: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  selectButton: {
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  selectButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    transform: [{ scale: 1.02 }],
  },
  currentButton: {
    backgroundColor: Colors.gray,
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.xs,
  },
  currentButtonText: {
    color: Colors.darkGray,
  },
  actionButtons: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  subscribeButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#8B5CF6', // Violeta principal
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...Shadows.small,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  
  subscriptionInfoSection: {
    backgroundColor: Colors.lightGray,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  
  subscriptionInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  subscriptionInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  
  subscriptionInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  
  legalLinksSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  
  legalLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  legalLinksContainer: {
    gap: Spacing.sm,
  },
  
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
  },
  
  legalLinkText: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    flex: 1,
    fontWeight: '500',
  },
  
  contactSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#8B5CF6', // Borde violeta
  },
  
  contactButtonText: {
    fontSize: 14,
    color: '#8B5CF6', // Texto violeta
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
});

export default SubscriptionScreen;

