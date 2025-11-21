import { ENV_CONFIG } from '../../env.config';

// Nota: Ya no necesitamos loadStripe porque usamos el nuevo método de Stripe
// que crea la sesión en el backend y redirige directamente a la URL

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
 * Usa el nuevo flujo de Stripe: crea una sesión en el backend y redirige a la URL
 */
export const redirectToCheckout = async (
  planId: 'weekly' | 'monthly' | 'annual',
  customerEmail?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Iniciando redirección a Stripe Checkout...');
    console.log('📋 Plan seleccionado:', planId);
    
    // Verificar que tenemos el Price ID configurado
    const priceId = getStripePriceId(planId);
    
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

    console.log('💰 Price ID obtenido:', priceId ? `${priceId.substring(0, 20)}...` : 'NO ENCONTRADO');
    console.log('📧 Email del cliente:', customerEmail || 'No proporcionado');
    
    // Llamar a la API del backend para crear la sesión de checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        customerEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error('❌ Error creando sesión de checkout:', errorData);
      console.error('📋 Status:', response.status);
      console.error('📋 Response completa:', errorData);
      
      // Mostrar mensaje de error más detallado
      let errorMessage = errorData.error || 'Error al crear la sesión de checkout. Por favor, intenta de nuevo.';
      
      // Si el error menciona Price ID, dar más contexto
      if (errorMessage.includes('Price ID') || errorMessage.includes('price_')) {
        errorMessage += ' Verifica que las variables VITE_STRIPE_PRICE_* en Vercel contengan Price IDs válidos (deben empezar con "price_").';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const { url } = await response.json();

    if (!url) {
      console.error('❌ No se recibió URL de checkout');
      return {
        success: false,
        error: 'No se recibió la URL de checkout. Por favor, intenta de nuevo.',
      };
    }

    console.log('✅ Sesión de checkout creada, redirigiendo...');
    
    // Redirigir al usuario a la URL de checkout
    window.location.href = url;
    
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

