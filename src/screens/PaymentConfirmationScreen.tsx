import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants';
import { PaymentResponse } from '../services/PaymentService';
import { useSubscription } from '../context/SubscriptionContext';
import { SubscriptionPlan } from '../types';

interface PaymentConfirmationScreenProps {
  navigation: any;
  route: {
    params: {
      paymentResult: PaymentResponse;
      planName: string;
      price: string;
      period: string;
    };
  };
}

const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({ navigation, route }) => {
  const { paymentResult, planName, price, period } = route.params;
  const { processPayment } = useSubscription();

  // Procesar el pago cuando se carga la pantalla
  useEffect(() => {
    const activateSubscription = async () => {
      try {
        await processPayment(paymentResult.planId as SubscriptionPlan, paymentResult);
        console.log('✅ Suscripción activada desde confirmación de pago');
      } catch (error) {
        console.error('❌ Error activando suscripción:', error);
      }
    };

    activateSubscription();
  }, [paymentResult, processPayment]);

  const handleContinue = () => {
    // Navegar de vuelta a la pantalla principal
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.success} />
      
      {/* Header de éxito */}
      <LinearGradient
        colors={[Colors.success, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.white} />
        </View>
        
        <Text style={styles.headerTitle}>¡Pago Exitoso!</Text>
        <Text style={styles.headerSubtitle}>
          Tu suscripción ha sido activada
        </Text>
      </LinearGradient>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Resumen de la suscripción */}
        <View style={styles.subscriptionCard}>
          <Text style={styles.cardTitle}>Detalles de la Suscripción</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plan:</Text>
            <Text style={styles.detailValue}>{planName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Precio:</Text>
            <Text style={styles.detailValue}>€{price}/{period}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID de Transacción:</Text>
            <Text style={styles.detailValue}>{paymentResult.transactionId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID de Suscripción:</Text>
            <Text style={styles.detailValue}>{paymentResult.subscriptionId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de inicio:</Text>
            <Text style={styles.detailValue}>{formatDate(paymentResult.startDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha de renovación:</Text>
            <Text style={styles.detailValue}>{formatDate(paymentResult.endDate)}</Text>
          </View>
        </View>

        {/* Beneficios del plan */}
        <View style={styles.benefitsCard}>
          <Text style={styles.cardTitle}>Beneficios Activados</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Planes Ilimitados</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Todas las opciones de configuración</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Requisitos especiales avanzados</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Soporte prioritario</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>Ingredientes exóticos</Text>
          </View>
        </View>

        {/* Información importante */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={Colors.info} />
            <Text style={styles.infoTitle}>Información Importante</Text>
          </View>
          
          <Text style={styles.infoText}>
            • Tu suscripción se renovará automáticamente{'\n'}
            • Puedes cancelar en cualquier momento desde tu perfil{'\n'}
            • Recibirás un email de confirmación pronto{'\n'}
            • Los cambios se aplicarán inmediatamente
          </Text>
        </View>
      </View>

      {/* Botón de continuar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.accent]}
            style={styles.continueButtonGradient}
          >
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            <Text style={styles.continueButtonText}>Continuar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
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
    paddingTop: Spacing.lg,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  benefitsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...Typography.h4,
    color: Colors.info,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  continueButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadows.medium,
  },
  continueButtonText: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: Spacing.sm,
  },
});

export default PaymentConfirmationScreen;
