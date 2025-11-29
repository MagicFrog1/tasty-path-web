import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Endpoint para sincronizar la suscripción desde Stripe a Supabase
 * Se usa cuando el webhook no ha actualizado Supabase o cuando el usuario necesita refrescar su estado
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body;

    if (!userId && !userEmail) {
      return res.status(400).json({ error: 'userId o userEmail es requerido' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe no está configurado' });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Obtener credenciales de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase no está configurado' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener el userId si solo tenemos el email
    let finalUserId = userId;
    if (!finalUserId && userEmail) {
      // Buscar usuario por email usando listUsers
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        return res.status(500).json({ error: 'Error buscando usuario' });
      }
      const authUser = users?.find(u => u.email === userEmail);
      if (!authUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      finalUserId = authUser.id;
    }

    // Buscar el customer_id en Supabase primero
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', finalUserId)
      .maybeSingle();

    let customerId = existingSubscription?.stripe_customer_id;

    // Si no hay customer_id, buscar en Stripe por email
    if (!customerId && userEmail) {
      console.log('🔍 Buscando customer en Stripe por email:', userEmail);
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('✅ Customer encontrado en Stripe:', customerId);
      }
    }

    if (!customerId) {
      return res.status(404).json({ 
        error: 'No se encontró información de suscripción en Stripe',
        hasSubscription: false 
      });
    }

    // Buscar suscripciones activas del customer en Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      // No hay suscripciones, actualizar Supabase para marcar como no premium
      await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: finalUserId,
          stripe_customer_id: customerId,
          is_premium: false,
          status: 'canceled',
        }, {
          onConflict: 'user_id',
        });

      return res.status(200).json({ 
        message: 'No hay suscripciones activas',
        hasSubscription: false,
        customerId 
      });
    }

    // Obtener la suscripción más reciente
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    
    // Determinar el plan
    let plan: 'trial' | 'weekly' | 'monthly' | 'annual' = 'monthly';
    const priceIds = {
      trial: process.env.VITE_STRIPE_PRICE_TRIAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
      weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
      monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
      annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
    };

    if (priceId === priceIds.trial) plan = 'trial';
    else if (priceId === priceIds.weekly) plan = 'weekly';
    else if (priceId === priceIds.annual) plan = 'annual';

    const isActive = subscription.status === 'active' || subscription.status === 'trialing';
    const status = isActive ? 'active' : subscription.status;

    // Actualizar Supabase
    const subscriptionData = {
      user_id: finalUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan: plan,
      is_premium: isActive,
      status: status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscription as any).cancel_at_period_end,
      canceled_at: (subscription as any).canceled_at 
        ? new Date((subscription as any).canceled_at * 1000).toISOString() 
        : null,
    };

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('❌ Error actualizando suscripción:', upsertError);
      return res.status(500).json({ 
        error: 'Error actualizando suscripción en Supabase',
        details: upsertError.message 
      });
    }

    console.log('✅ Suscripción sincronizada exitosamente:', {
      userId: finalUserId,
      customerId,
      subscriptionId: subscription.id,
      isPremium: isActive,
    });

    return res.status(200).json({
      success: true,
      subscription: subscriptionData,
      customerId,
    });
  } catch (error: any) {
    console.error('❌ Error sincronizando suscripción:', error);
    return res.status(500).json({ 
      error: error.message || 'Error sincronizando suscripción' 
    });
  }
}

