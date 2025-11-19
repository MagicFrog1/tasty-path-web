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
    const stripe = await getStripe();
    
    if (!stripe) {
      return {
        success: false,
        error: 'Stripe no está configurado correctamente. Por favor, contacta con soporte.',
      };
    }

    const priceId = getStripePriceId(planId);
    
    if (!priceId) {
      return {
        success: false,
        error: `No se encontró el precio para el plan ${planId}. Por favor, contacta con soporte.`,
      };
    }

    // Crear sesión de checkout en el backend
    // Por ahora, redirigimos directamente al checkout de Stripe
    // En producción, deberías crear una sesión de checkout en tu backend
    
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: `${window.location.origin}/suscripcion?success=true&plan=${planId}`,
      cancelUrl: `${window.location.origin}/suscripcion?canceled=true`,
      customerEmail: customerEmail,
    });

    if (error) {
      console.error('❌ Error redirigiendo a Stripe Checkout:', error);
      return {
        success: false,
        error: error.message || 'Error al procesar el pago',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error en redirectToCheckout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
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

