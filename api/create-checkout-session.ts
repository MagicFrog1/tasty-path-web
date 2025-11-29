import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para crear una sesión de checkout de Stripe
 * Esta función usa la clave secreta de Stripe (solo disponible en el servidor)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, customerEmail, userId } = req.body;

    console.log('📥 Request recibido:', { planId, customerEmail, userId });

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    // Obtener la clave secreta de Stripe desde las variables de entorno
    // En Vercel, las variables están disponibles directamente en process.env
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    console.log('🔍 Verificando variables de entorno en el servidor:', {
      STRIPE_SECRET_KEY: stripeSecretKey ? `${stripeSecretKey.substring(0, 10)}...` : 'NO ENCONTRADO',
      VITE_STRIPE_PRICE_WEEKLY: process.env.VITE_STRIPE_PRICE_WEEKLY || 'NO ENCONTRADO',
      VITE_STRIPE_PRICE_MONTHLY: process.env.VITE_STRIPE_PRICE_MONTHLY || 'NO ENCONTRADO',
      VITE_STRIPE_PRICE_ANNUAL: process.env.VITE_STRIPE_PRICE_ANNUAL || 'NO ENCONTRADO',
    });

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY no configurada');
      return res.status(500).json({ 
        error: 'Stripe no está configurado correctamente en el servidor. STRIPE_SECRET_KEY no encontrada. Verifica que esté configurada en Vercel (Settings > Environment Variables).' 
      });
    }

    // Inicializar Stripe con la clave secreta
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Mapear planId a Price ID
    // Priorizar VITE_* (como están configuradas en Vercel)
    const priceIds: Record<string, string> = {
      trial: process.env.VITE_STRIPE_PRICE_TRIAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL || process.env.STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
      weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || process.env.STRIPE_PRICE_WEEKLY || '',
      monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
      annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || process.env.STRIPE_PRICE_ANNUAL || '',
    };

    const priceId = priceIds[planId];

    console.log('🔍 Price IDs configurados:', {
      trial: priceIds.trial ? `${priceIds.trial.substring(0, 20)}...` : 'NO ENCONTRADO',
      weekly: priceIds.weekly ? `${priceIds.weekly.substring(0, 20)}...` : 'NO ENCONTRADO',
      monthly: priceIds.monthly ? `${priceIds.monthly.substring(0, 20)}...` : 'NO ENCONTRADO',
      annual: priceIds.annual ? `${priceIds.annual.substring(0, 20)}...` : 'NO ENCONTRADO',
    });

    if (!priceId) {
      console.error('❌ Price ID no encontrado para el plan:', planId);
      return res.status(400).json({ error: `Price ID no encontrado para el plan: ${planId}` });
    }

    // Verificar que el Price ID tenga el formato correcto (debe empezar con "price_")
    if (!priceId.startsWith('price_')) {
      console.error('❌ Price ID tiene formato incorrecto:', priceId);
      console.error('⚠️ Los Price IDs deben empezar con "price_". El valor recibido parece ser un Product ID.');
      console.error('📋 Valor recibido:', priceId);
      console.error('💡 Solución: Ve a Stripe Dashboard > Products > Selecciona el producto > En la sección "Pricing" copia el Price ID (empieza con "price_")');
      return res.status(400).json({ 
        error: `Price ID inválido para el plan ${planId}. El valor "${priceId}" es un Product ID, no un Price ID. Los Price IDs deben empezar con "price_". Ve a Stripe Dashboard > Products > Selecciona el producto > En "Pricing" copia el Price ID correcto.` 
      });
    }

    // URLs de redirección
    // Obtener el dominio correcto - priorizar variables de entorno
    let origin = process.env.NEXT_PUBLIC_SITE_URL || 
                 process.env.VITE_SITE_URL;
    
    // Si no hay en variables de entorno, usar headers
    if (!origin) {
      origin = req.headers.origin || 
               (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
    }
    
    // Si aún no hay, usar VERCEL_URL o dominio por defecto
    if (!origin) {
      if (process.env.VERCEL_URL) {
        origin = `https://${process.env.VERCEL_URL}`;
      } else {
        origin = 'https://mytastypath.com';
      }
    }
    
    // Asegurarse de que la URL no tenga doble barra y sea válida
    origin = origin.replace(/\/$/, '').trim();
    
    // Validar que sea una URL válida
    try {
      new URL(origin);
    } catch {
      // Si no es válida, usar el dominio por defecto
      origin = 'https://mytastypath.com';
    }
    
    // Incluir {CHECKOUT_SESSION_ID} en la URL para poder obtenerlo después
    // Usar la ruta completa con el dominio correcto
    const successUrl = `${origin}/suscripcion?success=true&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/suscripcion?canceled=true`;
    
    // Validar que las URLs sean válidas
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch (error) {
      console.error('❌ URLs de redirección inválidas:', { successUrl, cancelUrl });
      return res.status(500).json({ 
        error: 'Error generando URLs de redirección. Verifica la configuración del dominio.' 
      });
    }
    
    console.log('🔗 URLs de redirección:', {
      origin,
      successUrl,
      cancelUrl,
    });

    console.log('🔄 Creando sesión de checkout de Stripe...');
    console.log('📋 Plan:', planId);
    console.log('💰 Price ID:', priceId);
    console.log('🔗 Success URL:', successUrl);
    console.log('🔗 Cancel URL:', cancelUrl);

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      billing_address_collection: 'auto',
      // CRÍTICO: Usar client_reference_id para asociar el usuario de Supabase
      // Esto permite que el webhook identifique qué usuario actualizar
      client_reference_id: userId || undefined,
      // Guardar información adicional en metadata
      metadata: {
        planId: planId,
        userId: userId || '',
      },
    });

    console.log('✅ Sesión de checkout creada:', session.id);
    console.log('📋 Customer ID (si existe):', session.customer || 'Se creará después del pago');

    // Si tenemos userId, crear registro inicial en Supabase con is_premium=false
    if (userId) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseServiceKey);

          const subscriptionData = {
            user_id: userId,
            stripe_customer_id: (session.customer as string) || null,
            plan: planId as 'trial' | 'weekly' | 'monthly' | 'annual',
            is_premium: false, // Siempre false al inicio
            status: 'incomplete',
          };

          // Upsert para crear o actualizar
          const { error: upsertError } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, {
              onConflict: 'user_id',
            });

          if (upsertError) {
            console.error('⚠️ Error guardando suscripción inicial en Supabase:', upsertError);
            // No fallar el checkout si hay error, solo loguear
          } else {
            console.log('✅ Suscripción inicial guardada en Supabase con is_premium=false');
          }
        }
      } catch (error: any) {
        console.error('⚠️ Error creando registro inicial en Supabase:', error);
        // No fallar el checkout si hay error
      }
    }

    // Devolver la URL de la sesión y el customer ID si está disponible
    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id,
      customerId: session.customer as string | null,
    });
  } catch (error: any) {
    console.error('❌ Error creando sesión de checkout:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    return res.status(500).json({ 
      error: error.message || 'Error al crear la sesión de checkout',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

