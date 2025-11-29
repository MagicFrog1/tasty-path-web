import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook de Stripe para manejar eventos de suscripción
 * Este endpoint procesa los eventos de Stripe y actualiza la base de datos de Supabase
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY no configurada');
    return res.status(500).json({ error: 'Stripe no está configurado' });
  }

  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET no configurada');
    return res.status(500).json({ error: 'Webhook secret no está configurado' });
  }

  // Inicializar Stripe
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-11-17.clover',
  });

  // Obtener el signature del header
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    console.error('❌ No se encontró la firma de Stripe');
    return res.status(400).json({ error: 'No signature found' });
  }

  let event: Stripe.Event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
    console.log('✅ Webhook verificado:', event.type);
  } catch (err: any) {
    console.error('❌ Error verificando webhook:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Obtener credenciales de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Credenciales de Supabase no configuradas');
    return res.status(500).json({ error: 'Supabase no está configurado' });
  }

  // Importar el cliente de Supabase (usando service_role para bypass de RLS)
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout completado:', session.id);

        // Obtener la suscripción asociada
        const subscriptionId = session.subscription as string;
        
        if (!subscriptionId) {
          console.error('❌ No se encontró subscription_id en la sesión');
          break;
        }

        // Obtener información de la suscripción desde Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;

        // Buscar el usuario por customer_id o email
        let userId: string | null = null;

        // Intentar buscar por customer_id en la tabla de suscripciones
        const { data: existingSubscription } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSubscription) {
          userId = existingSubscription.user_id;
        } else if (session.customer_email) {
          // Si no encontramos por customer_id, buscar por email
          const { data: authUser } = await supabase.auth.admin.getUserByEmail(session.customer_email);
          if (authUser?.user) {
            userId = authUser.user.id;
          }
        }

        if (!userId) {
          console.error('❌ No se pudo encontrar el usuario para el customer:', customerId);
          break;
        }

        // Extraer el plan del price_id
        const priceId = subscription.items.data[0]?.price.id;
        let plan: 'weekly' | 'monthly' | 'annual' = 'monthly';
        
        const priceIds = {
          weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
          monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
          annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
        };

        if (priceId === priceIds.weekly) plan = 'weekly';
        else if (priceId === priceIds.annual) plan = 'annual';

        // Determinar el estado de la suscripción
        const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;

        // Insertar o actualizar la suscripción en Supabase
        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan,
          is_premium: subscription.status === 'active' || subscription.status === 'trialing',
          status: status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        };

        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          console.error('❌ Error actualizando suscripción en Supabase:', upsertError);
          return res.status(500).json({ error: 'Error actualizando suscripción' });
        }

        console.log('✅ Suscripción actualizada en Supabase:', {
          userId,
          customerId,
          subscriptionId,
          isPremium: subscriptionData.is_premium,
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Suscripción actualizada:', subscription.id);

        const customerId = subscription.customer as string;

        // Buscar la suscripción por customer_id
        const { data: existingSubscription } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (!existingSubscription) {
          console.error('❌ No se encontró suscripción para el customer:', customerId);
          break;
        }

        // Extraer el plan del price_id
        const priceId = subscription.items.data[0]?.price.id;
        let plan: 'weekly' | 'monthly' | 'annual' = 'monthly';
        
        const priceIds = {
          weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
          monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
          annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
        };

        if (priceId === priceIds.weekly) plan = 'weekly';
        else if (priceId === priceIds.annual) plan = 'annual';

        const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;

        // Actualizar la suscripción
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            plan: plan,
            is_premium: subscription.status === 'active' || subscription.status === 'trialing',
            status: status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('❌ Error actualizando suscripción:', updateError);
          return res.status(500).json({ error: 'Error actualizando suscripción' });
        }

        console.log('✅ Suscripción actualizada:', {
          customerId,
          isPremium: subscription.status === 'active' || subscription.status === 'trialing',
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🗑️ Suscripción cancelada:', subscription.id);

        const customerId = subscription.customer as string;

        // Actualizar la suscripción para marcarla como cancelada
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            is_premium: false,
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('❌ Error cancelando suscripción:', updateError);
          return res.status(500).json({ error: 'Error cancelando suscripción' });
        }

        console.log('✅ Suscripción cancelada en Supabase:', customerId);
        break;
      }

      default:
        console.log('ℹ️ Evento no manejado:', event.type);
    }

    // Responder con éxito a Stripe
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error);
    return res.status(500).json({ error: error.message || 'Error procesando webhook' });
  }
}

// Configuración para manejar el body raw
export const config = {
  api: {
    bodyParser: false,
  },
};

