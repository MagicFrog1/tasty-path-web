import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno de Supabase (priorizar NEXT_PUBLIC_ para Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inicializar Supabase Admin Client (solo en el servidor)
// Se inicializa dentro del handler para validar las variables de entorno
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL o Service Role Key no están configurados en las variables de entorno del servidor');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdmin;
}

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
    // Validar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables de entorno de Supabase no configuradas:', {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      });
      return res.status(500).json({
        error: 'Configuración del servidor incompleta. Por favor, configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.'
      });
    }

    const { userId, userEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('📝 Creando registro inicial en user_subscriptions:', {
      userId,
      userEmail: userEmail || 'NO PROPORCIONADO'
    });

    // Obtener cliente de Supabase Admin
    const supabase = getSupabaseAdmin();

    // Verificar si ya existe una suscripción para este usuario
    const { data: existing, error: existingError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Si hay un error que no sea "no encontrado", loguearlo pero continuar
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('⚠️ Error verificando suscripción existente:', existingError);
      // No retornar error aquí, continuar para intentar crear
    }

    // Si ya existe una suscripción, retornar éxito (no es un error)
    if (existing) {
      console.log('ℹ️ Ya existe una suscripción para este usuario:', (existing as any).id);
      return res.status(200).json({
        success: true,
        message: 'Ya existe una suscripción para este usuario',
        subscription: existing
      });
    }

    // Crear registro inicial sin suscripción (plan free)
    const subscriptionData: any = {
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

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData as any)
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

    console.log('✅ Suscripción inicial creada exitosamente:', (data as any)?.id);
    return res.status(200).json({
      success: true,
      message: 'Suscripción inicial creada exitosamente',
      subscription: data
    });

  } catch (error: any) {
    console.error('❌ Error en create-user-subscription:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error?.message || 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error?.stack,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      } : undefined
    });
  }
}

