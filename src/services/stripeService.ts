import { ENV_CONFIG } from '../../env.config';

// Nota: Ya no necesitamos loadStripe porque usamos el nuevo método de Stripe
// que crea la sesión en el backend y redirige directamente a la URL

/**
 * Obtiene el Price ID de Stripe según el plan
 */
export const getStripePriceId = (planId: 'trial' | 'weekly' | 'monthly' | 'annual'): string | null => {
  const priceIds = {
    trial: ENV_CONFIG.STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
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
  planId: 'trial' | 'weekly' | 'monthly' | 'annual',
  customerEmail?: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Iniciando redirección a Stripe Checkout...');
    console.log('📋 Plan seleccionado:', planId);
    console.log('📋 Customer Email recibido:', customerEmail || 'NO PROPORCIONADO');
    console.log('📋 User ID recibido:', userId || 'NO PROPORCIONADO');
    console.log('📋 User ID Type:', typeof userId);
    console.log('📋 User ID Length:', userId ? String(userId).length : 0);
    console.log('📋 User ID Valid UUID?:', userId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) : false);
    
    // CRÍTICO: Validar que userId sea un UUID válido
    if (!userId) {
      console.error('❌ ERROR CRÍTICO: userId no fue proporcionado a redirectToCheckout');
      console.error('📋 Esto causará que client_reference_id sea null en Stripe');
      console.error('📋 El webhook no podrá identificar al usuario correctamente');
      // No fallar aquí, solo loguear - permitir checkout sin userId (aunque no es recomendado)
    } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.error('❌ ERROR: userId no es un UUID válido:', userId);
      console.error('📋 Formato esperado: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
    }
    
    // Verificar que tenemos el Price ID configurado
    const priceId = getStripePriceId(planId);
    
    if (!priceId) {
      console.error('❌ Price ID no encontrado para el plan:', planId);
      console.error('🔍 Configuración actual:', {
        trial: ENV_CONFIG.STRIPE_PRICE_TRIAL ? 'Configurado' : 'NO CONFIGURADO',
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
    
    // Preparar el body para enviar al backend
    const requestBody = {
      planId,
      customerEmail,
      userId,
    };
    
    console.log('📤 Enviando request a /api/create-checkout-session:');
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('📋 userId en body:', requestBody.userId || 'NO INCLUIDO');
    
    // Llamar a la API del backend para crear la sesión de checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error del servidor (${response.status}): ${response.statusText}` };
      }
      
      console.error('❌ Error creando sesión de checkout:', errorData);
      console.error('📋 Status:', response.status);
      console.error('📋 Response completa:', JSON.stringify(errorData, null, 2));
      
      // Mostrar mensaje de error más detallado
      let errorMessage = errorData.error || errorData.message || `Error al crear la sesión de checkout (${response.status}). Por favor, intenta de nuevo.`;
      
      // Si el error menciona Price ID, dar más contexto
      if (errorMessage.includes('Price ID') || errorMessage.includes('price_') || errorMessage.includes('Product ID')) {
        errorMessage += '\n\n💡 Solución: Ve a Stripe Dashboard > Products > Selecciona el producto > En la sección "Pricing" copia el Price ID (debe empezar con "price_", no "prod_").';
      }
      
      // Si el error menciona STRIPE_SECRET_KEY
      if (errorMessage.includes('STRIPE_SECRET_KEY')) {
        errorMessage += '\n\n💡 Solución: Verifica que STRIPE_SECRET_KEY esté configurada en Vercel (Settings > Environment Variables).';
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
    (ENV_CONFIG.STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW') &&
    ENV_CONFIG.STRIPE_PRICE_WEEKLY &&
    ENV_CONFIG.STRIPE_PRICE_MONTHLY &&
    ENV_CONFIG.STRIPE_PRICE_ANNUAL
  );
};

/**
 * Redirige al usuario al Portal de Clientes de Stripe para gestionar su suscripción
 * Permite actualizar tarjeta, cambiar plan, cancelar suscripción, ver facturas, etc.
 * 
 * @param customerId - El ID del cliente de Stripe (ej: cus_xxxxx)
 * @returns Promise con el resultado de la operación
 */
export const redirectToBillingPortal = async (
  customerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔄 Iniciando redirección al Portal de Clientes de Stripe...');
    console.log('📋 Customer ID:', customerId ? `${customerId.substring(0, 20)}...` : 'NO PROPORCIONADO');
    
    if (!customerId) {
      console.error('❌ Customer ID no proporcionado');
      return {
        success: false,
        error: 'No se encontró el ID del cliente. Asegúrate de haber completado una suscripción primero.',
      };
    }

    // Llamar a la API del backend para crear la sesión del portal
    const response = await fetch('/api/create-billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `Error del servidor (${response.status}): ${response.statusText}` };
      }
      
      console.error('❌ Error creando sesión del portal:', errorData);
      console.error('📋 Status:', response.status);
      
      let errorMessage = errorData.error || errorData.message || `Error al crear la sesión del portal (${response.status}). Por favor, intenta de nuevo.`;
      
      // Mensajes de error más específicos
      if (errorMessage.includes('STRIPE_BILLING_PORTAL_ID')) {
        errorMessage += '\n\n💡 Solución: El Portal de Clientes no está configurado. Contacta al administrador.';
      }
      
      if (errorMessage.includes('customerId') || errorMessage.includes('cliente')) {
        errorMessage += '\n\n💡 Asegúrate de haber completado una suscripción primero.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const { url } = await response.json();

    if (!url) {
      console.error('❌ No se recibió URL del portal');
      return {
        success: false,
        error: 'No se recibió la URL del portal. Por favor, intenta de nuevo.',
      };
    }

    console.log('✅ Sesión del portal creada, redirigiendo...');
    
    // Redirigir al usuario a la URL del portal
    window.location.href = url;
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en redirectToBillingPortal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al acceder al portal',
    };
  }
};

