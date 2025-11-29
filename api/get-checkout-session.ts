import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para obtener información de una sesión de checkout de Stripe
 * Se usa para obtener el customer ID después de que el usuario completa el pago
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.query.session_id as string;
    const checkSupabase = req.query.check_supabase === 'true';

    if (!sessionId) {
      return res.status(400).json({ 
        error: 'session_id is required' 
      });
    }

    // Obtener la clave secreta de Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({ 
        error: 'Stripe no está configurado correctamente en el servidor.' 
      });
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    console.log('🔍 Obteniendo información de la sesión:', sessionId);

    // Obtener la sesión de checkout
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    console.log('✅ Sesión obtenida:', {
      id: session.id,
      customer: session.customer,
      status: session.status,
    });

    // Si la sesión está completa, obtener información de la suscripción
    let subscriptionInfo = null;
    if (session.status === 'complete' && session.subscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ['items.data.price']
        });
        
        subscriptionInfo = {
          id: subscription.id,
          status: subscription.status,
          plan: subscription.items.data[0]?.price.id || null,
          current_period_start: (subscription as any).current_period_start,
          current_period_end: (subscription as any).current_period_end,
        };
        
        console.log('📋 Información de suscripción obtenida:', subscriptionInfo);
      } catch (subError: any) {
        console.warn('⚠️ Error obteniendo información de suscripción:', subError.message);
      }
    }

    // Obtener customer_id
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : (session.customer as any)?.id || null;

    // Verificar en Supabase si está configurado y se solicita
    let supabaseCheck = null;
    if (checkSupabase && customerId) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });

          // Buscar suscripción por customer_id
          const { data: subscriptionData, error: subError } = await supabase
            .from('user_subscriptions')
            .select('user_id, plan, is_premium, status, stripe_subscription_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();

          if (!subError && subscriptionData) {
            supabaseCheck = {
              exists: true,
              userId: subscriptionData.user_id,
              plan: subscriptionData.plan,
              isPremium: subscriptionData.is_premium,
              status: subscriptionData.status,
              subscriptionId: subscriptionData.stripe_subscription_id,
            };
            console.log('✅ Suscripción encontrada en Supabase:', supabaseCheck);
          } else if (!subError) {
            supabaseCheck = {
              exists: false,
              message: 'No se encontró suscripción en Supabase para este customer_id'
            };
            console.warn('⚠️ Suscripción no encontrada en Supabase para customer:', customerId);
          } else {
            supabaseCheck = {
              exists: false,
              error: subError.message
            };
            console.error('❌ Error verificando en Supabase:', subError);
          }
        }
      } catch (supabaseError: any) {
        console.error('⚠️ Error al verificar en Supabase:', supabaseError.message);
        supabaseCheck = {
          exists: false,
          error: supabaseError.message
        };
      }
    }

    // Devolver información completa
    return res.status(200).json({ 
      customerId: customerId,
      sessionId: session.id,
      status: session.status,
      subscription: subscriptionInfo,
      clientReferenceId: session.client_reference_id,
      customerEmail: typeof session.customer === 'object' 
        ? (session.customer as any)?.email 
        : null,
      supabase: supabaseCheck,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo sesión de checkout:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al obtener la información de la sesión',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

