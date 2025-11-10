// Servicio simulado de procesamiento de pagos
// En una implementación real, esto se conectaría con Stripe, PayPal, etc.

export interface PaymentRequest {
  planId: 'weekly' | 'monthly' | 'annual';
  amount: number;
  currency: string;
  customerEmail?: string;
  paymentMethod: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  planId: string;
  subscriptionId: string;
  startDate: string;
  endDate: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

class PaymentService {
  private baseUrl = 'https://api.tastypath.com/payments'; // URL simulada

  // Simular procesamiento de pago
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('💳 Procesando pago:', paymentRequest);

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular validación de datos
      if (!paymentRequest.planId || !paymentRequest.amount || paymentRequest.amount <= 0) {
        throw new Error('Datos de pago inválidos');
      }

      // Simular diferentes tasas de éxito según el método de pago
      const successRate = this.getSuccessRate(paymentRequest.paymentMethod);
      const isSuccess = Math.random() < successRate;

      if (!isSuccess) {
        throw new Error(this.getRandomPaymentError());
      }

      // Generar respuesta exitosa
      const response: PaymentResponse = {
        success: true,
        transactionId: this.generateTransactionId(),
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        planId: paymentRequest.planId,
        subscriptionId: this.generateSubscriptionId(),
        startDate: new Date().toISOString(),
        endDate: this.calculateEndDate(paymentRequest.planId),
      };

      console.log('✅ Pago procesado exitosamente:', response);
      return response;

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      return {
        success: false,
        transactionId: '',
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        planId: paymentRequest.planId,
        subscriptionId: '',
        startDate: '',
        endDate: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Obtener métodos de pago disponibles
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return [
      {
        id: 'card_visa',
        type: 'card',
        name: 'Visa •••• 4242',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2025,
      },
      {
        id: 'card_mastercard',
        type: 'card',
        name: 'Mastercard •••• 5555',
        last4: '5555',
        brand: 'mastercard',
        expiryMonth: 6,
        expiryYear: 2026,
      },
      {
        id: 'paypal',
        type: 'paypal',
        name: 'PayPal',
      },
      {
        id: 'apple_pay',
        type: 'apple_pay',
        name: 'Apple Pay',
      },
      {
        id: 'google_pay',
        type: 'google_pay',
        name: 'Google Pay',
      },
    ];
  }

  // Verificar estado de suscripción
  async verifySubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Simular verificación
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular que la suscripción es válida
      return true;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }

  // Cancelar suscripción
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      console.log('🔄 Cancelando suscripción:', subscriptionId);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Suscripción cancelada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error cancelando suscripción:', error);
      return false;
    }
  }

  // Métodos privados
  private getSuccessRate(paymentMethod: string): number {
    const rates = {
      'card': 0.95,
      'paypal': 0.90,
      'apple_pay': 0.98,
      'google_pay': 0.98,
    };
    return rates[paymentMethod as keyof typeof rates] || 0.90;
  }

  private getRandomPaymentError(): string {
    const errors = [
      'Tarjeta rechazada',
      'Fondos insuficientes',
      'Tarjeta expirada',
      'Error de conexión',
      'Método de pago no válido',
    ];
    return errors[Math.floor(Math.random() * errors.length)];
  }

  private generateTransactionId(): string {
    return 'txn_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private generateSubscriptionId(): string {
    return 'sub_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private calculateEndDate(planId: string): string {
    const now = new Date();
    let endDate: Date;

    switch (planId) {
      case 'weekly':
        endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'annual':
        endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    return endDate.toISOString();
  }
}

export default new PaymentService();
