import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno de Supabase (priorizar NEXT_PUBLIC_ para Vercel)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    process.env.SUPABASE_URL;

// CRÍTICO: Usar SUPABASE_SERVICE_ROLE_KEY para bypass de RLS
// NUNCA usar NEXT_PUBLIC_SUPABASE_ANON_KEY o VITE_SUPABASE_ANON_KEY aquí
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                          process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
                          process.env.SUPABASE_SERVICE_KEY;

// Validar que NO estamos usando la ANON_KEY por error
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
if (supabaseServiceKey === anonKey) {
  console.error('❌ ERROR CRÍTICO: Se está intentando usar ANON_KEY en lugar de SERVICE_ROLE_KEY');
}

// Inicializar Supabase Admin Client (solo en el servidor)
// Se inicializa dentro del handler para validar las variables de entorno
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase URL o Service Role Key no están configurados en las variables de entorno del servidor');
    }
    // CRÍTICO: Usar Service Role Key con configuración para bypass de RLS
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'x-client-info': 'create-user-subscription'
        }
      }
    });
    console.log('✅ Cliente de Supabase Admin inicializado con Service Role Key (bypass RLS)');
    if (supabaseServiceKey) {
      console.log('🔑 Service key prefix:', supabaseServiceKey.substring(0, 20) + '...');
    }
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
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        VITE_SUPABASE_SERVICE_ROLE_KEY: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        serviceKeyFinal: !!supabaseServiceKey,
        serviceKeyLength: supabaseServiceKey?.length || 0,
        serviceKeyPrefix: supabaseServiceKey?.substring(0, 10) || 'N/A'
      });
      return res.status(500).json({
        error: 'Configuración del servidor incompleta. Por favor, configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel (Settings > Environment Variables).'
      });
    }
    
    // Validar que estamos usando Service Role Key y NO ANON_KEY
    const isAnonKey = supabaseServiceKey?.startsWith('eyJ') && supabaseServiceKey?.includes('anon');
    const isServiceRoleKey = supabaseServiceKey?.startsWith('eyJ') && !isAnonKey;
    
    console.log('🔐 Verificando Service Role Key:', {
      hasServiceKey: !!supabaseServiceKey,
      keyLength: supabaseServiceKey?.length || 0,
      keyPrefix: supabaseServiceKey?.substring(0, 20) + '...',
      isJWT: supabaseServiceKey?.startsWith('eyJ') || false,
      isAnonKey: isAnonKey,
      isServiceRoleKey: isServiceRoleKey,
      usingCorrectKey: isServiceRoleKey && !isAnonKey,
      // Verificar variables de entorno disponibles
      envVars: {
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        VITE_SUPABASE_SERVICE_ROLE_KEY: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY
      }
    });
    
    // Advertencia pero no bloquear si parece ser ANON_KEY (puede ser un falso positivo)
    if (isAnonKey) {
      console.warn('⚠️ ADVERTENCIA: La clave parece ser ANON_KEY. Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada correctamente.');
    }

    const { userId, userEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    console.log('📝 Creando registro inicial en user_subscriptions:', {
      userId,
      userEmail: userEmail || 'NO PROPORCIONADO'
    });

    // Obtener cliente de Supabase Admin (con Service Role Key para bypass RLS)
    const supabase = getSupabaseAdmin();
    
    // Verificar que el cliente se creó correctamente
    if (!supabase) {
      console.error('❌ ERROR: No se pudo crear el cliente de Supabase Admin');
      return res.status(500).json({
        error: 'Error al inicializar cliente de Supabase. Por favor, verifica las variables de entorno.'
      });
    }
    
    console.log('✅ Cliente de Supabase Admin obtenido correctamente (usando Service Role Key)');

    // Verificar si ya existe una suscripción para este usuario
    let existing: any = null;
    try {
      const { data, error: existingError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Si hay un error que no sea "no encontrado", loguearlo pero continuar
      if (existingError && existingError.code !== 'PGRST116') {
        console.error('⚠️ Error verificando suscripción existente:', {
          code: existingError.code,
          message: existingError.message,
          details: existingError.details,
          hint: existingError.hint
        });
        // No retornar error aquí, continuar para intentar crear
      } else {
        existing = data;
      }
    } catch (checkError: any) {
      console.error('⚠️ Excepción al verificar suscripción existente:', {
        message: checkError?.message,
        stack: checkError?.stack
      });
      // Continuar para intentar crear
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

    let data: any = null;
    let insertError: any = null;
    
    try {
      const result = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData as any)
        .select()
        .single();
      
      data = result.data;
      insertError = result.error;
    } catch (insertException: any) {
      console.error('❌ Excepción al insertar suscripción:', {
        message: insertException?.message,
        stack: insertException?.stack,
        name: insertException?.name
      });
      insertError = insertException;
    }

    if (insertError) {
      console.error('❌ Error creando suscripción inicial:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        name: insertError.name,
        stack: insertError.stack
      });
      
      // Si el error es que ya existe (violación de constraint único), retornar éxito
      if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
        console.log('ℹ️ La suscripción ya existe (constraint único), verificando nuevamente...');
        try {
          const { data: existingAfterError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (existingAfterError) {
            console.log('✅ Suscripción encontrada después del error de duplicado:', (existingAfterError as any).id);
            return res.status(200).json({
              success: true,
              message: 'Suscripción ya existe',
              subscription: existingAfterError
            });
          }
        } catch (recheckError: any) {
          console.error('⚠️ Error al verificar después del error de duplicado:', recheckError);
        }
      }
      
      // Si el error es de RLS (42501), intentar verificar si ya existe
      if (insertError.code === '42501' || insertError.message?.includes('permission denied') || insertError.message?.includes('RLS')) {
        console.warn('⚠️ Error de RLS detectado, verificando si la suscripción ya existe...');
        try {
          const { data: existingAfterRLSError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (existingAfterRLSError) {
            console.log('✅ Suscripción encontrada después del error de RLS:', (existingAfterRLSError as any).id);
            return res.status(200).json({
              success: true,
              message: 'Suscripción ya existe',
              subscription: existingAfterRLSError
            });
          }
        } catch (recheckError: any) {
          console.error('⚠️ Error al verificar después del error de RLS:', recheckError);
        }
      }
      
      // Para cualquier otro error, retornar 500 pero con información útil
      return res.status(500).json({
        error: 'Error creando suscripción inicial',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint || 'Verifica que SUPABASE_SERVICE_ROLE_KEY esté configurada correctamente en Vercel'
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

