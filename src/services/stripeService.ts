import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ENV_CONFIG } from '../../env.config';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Inicializa Stripe con la clave pública
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = ENV_CONFIG.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      console.warn('⚠️ Stripe Publishable Key no configurada');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

/**
 * Obtiene el Price ID de Stripe según el plan
 */
export const getStripePriceId = (planId: 'weekly' | 'monthly' | 'annual'): string | null => {
  const priceIds = {
    weekly: ENV_CONFIG.STRIPE_PRICE_WEEKLY,
    monthly: ENV_CONFIG.STRIPE_PRICE_MONTHLY,
    annual: ENV_CONFIG.STRIPE_PRICE_ANNUAL,
  };

  const priceId = priceIds[planId];
  
  if (!priceId) {
    console.warn(`⚠️ Price ID no configurado para el plan: ${planId}`);
    return null;
  }

  return priceId;
};

/**
 * Redirige al usuario a Stripe Checkout para completar el pago
 */
export const redirectToCheckout = async (
  planId: 'weekly' | 'monthly' | 'annual',
  customerEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Iniciando redirección a Stripe Checkout...');
    console.log('📋 Plan seleccionado:', planId);
    
    const stripe = await getStripe();
    
    if (!stripe) {
      console.error('❌ Stripe no está inicializado');
      return {
        success: false,
        error: 'Stripe no está configurado correctamente. Por favor, contacta con soporte.',
      };
    }

    const priceId = getStripePriceId(planId);
    
    console.log('💰 Price ID obtenido:', priceId ? `${priceId.substring(0, 20)}...` : 'NO ENCONTRADO');
    
    if (!priceId) {
      console.error('❌ Price ID no encontrado para el plan:', planId);
      console.error('🔍 Configuración actual:', {
        weekly: ENV_CONFIG.STRIPE_PRICE_WEEKLY ? 'Configurado' : 'NO CONFIGURADO',
        monthly: ENV_CONFIG.STRIPE_PRICE_MONTHLY ? 'Configurado' : 'NO CONFIGURADO',
        annual: ENV_CONFIG.STRIPE_PRICE_ANNUAL ? 'Configurado' : 'NO CONFIGURADO',
      });
      return {
        success: false,
        error: `No se encontró el precio para el plan ${planId}. Por favor, verifica la configuración.`,
      };
    }

    const successUrl = `${window.location.origin}/suscripcion?success=true&plan=${planId}`;
    const cancelUrl = `${window.location.origin}/suscripcion?canceled=true`;
    
    console.log('🔗 URLs de redirección:', { successUrl, cancelUrl });
    console.log('📧 Email del cliente:', customerEmail || 'No proporcionado');
    
    // Redirigir directamente al checkout de Stripe usando lineItems
    // Esto funciona cuando Stripe está correctamente configurado
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      customerEmail: customerEmail,
      billingAddressCollection: 'auto',
    });

    if (error) {
      console.error('❌ Error redirigiendo a Stripe Checkout:', error);
      console.error('📋 Detalles del error:', {
        type: error.type,
        message: error.message,
        code: error.code,
      });
      return {
        success: false,
        error: error.message || 'Error al procesar el pago. Por favor, intenta de nuevo.',
      };
    }

    console.log('✅ Redirección a Stripe Checkout iniciada correctamente');
    return { success: true };
  } catch (error) {
    console.error('❌ Error en redirectToCheckout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al procesar el pago',
    };
  }
};

/**
 * Verifica si Stripe está configurado correctamente
 */
export const isStripeConfigured = (): boolean => {
  return !!(
    ENV_CONFIG.STRIPE_PUBLISHABLE_KEY &&
    ENV_CONFIG.STRIPE_PRICE_WEEKLY &&
    ENV_CONFIG.STRIPE_PRICE_MONTHLY &&
    ENV_CONFIG.STRIPE_PRICE_ANNUAL
  );
};

