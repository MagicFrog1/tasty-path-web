import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase Admin Client (solo en el servidor)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight (OPTIONS) primero
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST después de manejar OPTIONS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('📝 Creando registro inicial en user_subscriptions:', {
      userId,
      userEmail: userEmail || 'NO PROPORCIONADO'
    });

    // Verificar si ya existe una suscripción para este usuario
    const { data: existing } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      console.log('ℹ️ Ya existe una suscripción para este usuario:', existing.id);
      return res.status(200).json({
        success: true,
        message: 'Ya existe una suscripción para este usuario',
        subscription: existing
      });
    }

    // Crear registro inicial sin suscripción (plan free)
    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      plan: null, // null = sin plan (free)
      is_premium: false,
      status: null, // null = sin estado (no tiene suscripción activa)
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      canceled_at: null,
    };

    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando suscripción inicial:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return res.status(500).json({
        error: 'Error creando suscripción inicial',
        details: error.message
      });
    }

    console.log('✅ Suscripción inicial creada exitosamente:', data.id);
    return res.status(200).json({
      success: true,
      message: 'Suscripción inicial creada exitosamente',
      subscription: data
    });

  } catch (error: any) {
    console.error('❌ Error en create-user-subscription:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}

