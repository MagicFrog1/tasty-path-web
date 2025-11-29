import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Endpoint de prueba para verificar que el webhook está configurado correctamente
 * Este endpoint simula un evento de Stripe para probar la lógica del webhook
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, customerId, subscriptionId, plan } = req.body;

    if (!userId || !customerId) {
      return res.status(400).json({ 
        error: 'userId and customerId are required',
        example: {
          userId: '8a8b56ee-5a78-41a2-adce-57d19b3f8633',
          customerId: 'cus_TVdtclYuO5hGlv',
          subscriptionId: 'sub_1SYnp1KHiNy1x57tSK6rdzUl',
          plan: 'monthly'
        }
      });
    }

    // Obtener credenciales de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase no está configurado' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🧪 TEST: Intentando guardar suscripción manualmente...');
    console.log('📋 Datos:', { userId, customerId, subscriptionId, plan });

    // Calcular fechas
    const now = new Date();
    const periodStart = new Date(now);
    let periodEnd = new Date(now);
    
    if (plan === 'trial' || plan === 'weekly') {
      periodEnd.setDate(periodEnd.getDate() + 7);
    } else if (plan === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else if (plan === 'annual') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId || null,
      plan: plan || 'monthly',
      is_premium: true,
      status: 'active',
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
    };

    console.log('💾 Datos a guardar:', JSON.stringify(subscriptionData, null, 2));

    // Intentar UPSERT
    const { error: upsertError, data: upsertData } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('❌ Error en UPSERT:', upsertError);
      
      // Intentar INSERT directo
      const { error: insertError, data: insertData } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData);
      
      if (insertError) {
        return res.status(500).json({ 
          error: 'Error guardando suscripción',
          upsertError: upsertError.message,
          insertError: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
      }
      
      return res.status(200).json({ 
        success: true,
        method: 'INSERT',
        data: insertData,
        message: 'Suscripción guardada usando INSERT (UPSERT falló)'
      });
    }

    // Verificar que se guardó
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      return res.status(500).json({ 
        error: 'Error verificando datos guardados',
        verifyError: verifyError.message
      });
    }

    return res.status(200).json({ 
      success: true,
      method: 'UPSERT',
      data: verifyData,
      message: 'Suscripción guardada y verificada correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error en test-webhook:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}

