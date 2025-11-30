import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para NutriChat
 * Actúa como proxy entre el frontend y la API de OpenAI para evitar problemas de CORS
 * y mantener la API key segura en el servidor
 * Requiere autenticación JWT válida de Supabase
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS headers para permitir requests desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir métodos POST después de manejar OPTIONS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar autenticación JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ NutriChat: No se proporcionó token de autenticación');
      return res.status(401).json({ 
        error: 'Token de autenticación requerido. Por favor, inicia sesión nuevamente.' 
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    
    // Obtener variables de entorno de Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ NutriChat: Variables de entorno de Supabase no configuradas');
      return res.status(500).json({ 
        error: 'Configuración del servidor incompleta. Por favor, contacta al soporte.' 
      });
    }

    // Verificar el token JWT usando Supabase Admin SDK
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verificar el token y obtener el usuario
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ NutriChat: Token inválido o expirado:', authError?.message);
      return res.status(401).json({ 
        error: 'Token de autenticación inválido o expirado. Por favor, inicia sesión nuevamente.' 
      });
    }

    console.log('✅ NutriChat: Usuario autenticado:', user.id);

    // Verificar suscripción del usuario
    // Buscar suscripciones activas o en periodo de prueba
    let subscription: any = null;
    let subError: any = null;
    
    // Primero intentar buscar por user_id directo
    const { data: subscriptionByUserId, error: errorByUserId } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();
    
    if (subscriptionByUserId) {
      subscription = subscriptionByUserId;
    } else {
      // Si no se encontró por user_id, buscar por email
      if (user.email) {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        
        if (profile?.id) {
          // Buscar suscripciones con el profile.id (puede ser diferente al user.id del JWT)
          const { data: subscriptionByEmail, error: errorByEmail } = await supabaseAdmin
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', profile.id)
            .in('status', ['active', 'trialing'])
            .maybeSingle();
          
          if (subscriptionByEmail) {
            subscription = subscriptionByEmail;
            console.log('✅ NutriChat: Suscripción encontrada por email:', {
              userJwtId: user.id,
              profileId: profile.id,
              plan: subscription.plan,
              status: subscription.status
            });
          }
        }
      }
      
      // Si aún no encontramos, buscar todas las suscripciones del usuario para diagnóstico
      if (!subscription) {
        const { data: allSubscriptions } = await supabaseAdmin
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id);
        
        console.log('🔍 NutriChat: Diagnóstico - Todas las suscripciones por user_id:', {
          userId: user.id,
          count: allSubscriptions?.length || 0,
          subscriptions: allSubscriptions?.map(sub => ({
            plan: sub.plan,
            status: sub.status,
            is_premium: sub.is_premium,
            user_id: sub.user_id
          })) || []
        });
        
        // También buscar todas las suscripciones por email si no encontramos ninguna
        if (user.email && (!allSubscriptions || allSubscriptions.length === 0)) {
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
          
          if (profile?.id) {
            const { data: allSubscriptionsByEmail } = await supabaseAdmin
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', profile.id);
            
            console.log('🔍 NutriChat: Diagnóstico - Todas las suscripciones por email (profile.id):', {
              profileId: profile.id,
              count: allSubscriptionsByEmail?.length || 0,
              subscriptions: allSubscriptionsByEmail?.map(sub => ({
                plan: sub.plan,
                status: sub.status,
                is_premium: sub.is_premium,
                user_id: sub.user_id
              })) || []
            });
            
            // Si hay alguna suscripción activa, usarla
            if (allSubscriptionsByEmail && allSubscriptionsByEmail.length > 0) {
              const activeSub = allSubscriptionsByEmail.find(
                sub => sub.status === 'active' || sub.status === 'trialing'
              );
              if (activeSub) {
                subscription = activeSub;
                console.log('✅ NutriChat: Usando suscripción activa encontrada por email:', {
                  plan: subscription.plan,
                  status: subscription.status
                });
              }
            }
          }
        }
      }
      
      subError = errorByUserId;
    }

    console.log('🔍 NutriChat: Verificando suscripción del usuario:', {
      userId: user.id,
      userEmail: user.email,
      subscriptionFound: !!subscription,
      subscriptionData: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        is_premium: subscription.is_premium,
        user_id: subscription.user_id,
        stripe_subscription_id: subscription.stripe_subscription_id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end
      } : null,
      error: subError?.message,
      errorCode: subError?.code
    });

    if (subError) {
      console.error('❌ NutriChat: Error al verificar suscripción:', subError);
      // No bloquear si hay error, solo loguear
    }

    // Verificar si el usuario tiene plan premium
    // Un usuario tiene premium si:
    // 1. Tiene una suscripción activa o en periodo de prueba Y
    // 2. (is_premium es true) O (el plan NO es 'free')
    // Nota: Permitimos cualquier plan activo excepto 'free'
    const isActiveStatus = subscription?.status === 'active' || subscription?.status === 'trialing';
    const isNotFree = subscription?.plan && subscription.plan !== 'free';
    
    const hasActiveSubscription = subscription && 
      isActiveStatus && 
      (subscription.is_premium === true || isNotFree);

    if (!hasActiveSubscription) {
      console.warn('⚠️ NutriChat: Usuario sin suscripción premium:', {
        userId: user.id,
        userEmail: user.email,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          is_premium: subscription.is_premium,
          isActiveStatus: isActiveStatus,
          isNotFree: isNotFree,
          hasActiveSubscription: false
        } : 'NO ENCONTRADA',
        checkDetails: {
          hasSubscription: !!subscription,
          isActiveStatus: isActiveStatus,
          isNotFree: isNotFree,
          isPremiumFlag: subscription?.is_premium === true
        }
      });
      return res.status(403).json({ 
        error: 'Esta función requiere una suscripción premium. Por favor, actualiza tu plan para acceder a NutriChat.' 
      });
    }

    console.log('✅ NutriChat: Usuario tiene suscripción premium activa:', {
      plan: subscription.plan,
      is_premium: subscription.is_premium
    });

    const { messages, model, temperature, max_tokens } = req.body;

    console.log('📥 NutriChat - Request recibido:', {
      messageCount: messages?.length || 0,
      model: model || 'gpt-4o-mini',
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Obtener la API key de OpenAI desde las variables de entorno del servidor
    // Priorizar OPENAI_API_KEY (más común), luego variables específicas de NutriChat
    const openaiApiKey = process.env.OPENAI_API_KEY ||
                        process.env.VITE_OPENAI_API_KEY || 
                        process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
                        process.env.NUTRICHAT_OPENAI_API_KEY ||
                        process.env.VITE_NUTRICHAT_OPENAI_API_KEY ||
                        process.env.NEXT_PUBLIC_NUTRICHAT_OPENAI_API_KEY;

    console.log('🔍 Verificando API key de NutriChat OpenAI en el servidor:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY ? `${process.env.VITE_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? `${process.env.NEXT_PUBLIC_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      NUTRICHAT_OPENAI_API_KEY: process.env.NUTRICHAT_OPENAI_API_KEY ? `${process.env.NUTRICHAT_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      key_final: openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : 'NO ENCONTRADO',
      hasKey: !!openaiApiKey,
      keyLength: openaiApiKey?.length || 0,
      startsWithSk: openaiApiKey?.startsWith('sk-') || false,
    });

    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY no configurada en el servidor para NutriChat');
      return res.status(401).json({ 
        error: 'OpenAI API key no está configurada en el servidor. Por favor, configura OPENAI_API_KEY en Vercel (Settings > Environment Variables).' 
      });
    }

    if (!openaiApiKey.startsWith('sk-')) {
      console.error('❌ OPENAI_API_KEY tiene formato incorrecto');
      return res.status(401).json({ 
        error: 'OpenAI API key tiene formato incorrecto. Debe empezar con "sk-".' 
      });
    }
    
    console.log('✅ API key de NutriChat encontrada y validada correctamente');

    // URL de la API de OpenAI
    const openaiUrl = process.env.OPENAI_API_URL || 
                     process.env.VITE_OPENAI_API_URL || 
                     process.env.NEXT_PUBLIC_OPENAI_API_URL ||
                     'https://api.openai.com/v1/chat/completions';

    console.log('🔄 Enviando solicitud a OpenAI...');
    console.log('🔗 URL:', openaiUrl);
    console.log('🤖 Modelo:', model || 'gpt-4o-mini');
    console.log('💬 Mensajes:', messages.length);

    // Hacer la llamada a la API de OpenAI
    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages,
        temperature: temperature !== undefined ? temperature : 0.8,
        max_tokens: max_tokens !== undefined ? max_tokens : 600,
      }),
    });

    console.log('📥 Respuesta de OpenAI recibida:', {
      status: openaiResponse.status,
      statusText: openaiResponse.statusText,
    });

    // Manejar errores de OpenAI
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('❌ Error en respuesta de OpenAI:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
      });

      let errorMessage = 'Error al procesar la solicitud con OpenAI.';
      
      if (openaiResponse.status === 401) {
        errorMessage = 'Error de autenticación con OpenAI. La API key no es válida o ha expirado.';
      } else if (openaiResponse.status === 429) {
        errorMessage = 'Demasiadas solicitudes a OpenAI. Por favor, espera un momento e intenta de nuevo.';
      } else if (openaiResponse.status === 500) {
        errorMessage = 'Error en el servidor de OpenAI. Por favor, intenta de nuevo en unos momentos.';
      } else if (errorData.error?.message) {
        errorMessage = `Error de OpenAI: ${errorData.error.message}`;
      }

      return res.status(openaiResponse.status).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    // Obtener los datos de la respuesta
    const data = await openaiResponse.json();
    
    console.log('✅ Respuesta de OpenAI procesada exitosamente');

    // Devolver la respuesta al frontend
    return res.status(200).json({
      success: true,
      choices: data.choices,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('❌ Error en NutriChat API:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({ 
      error: error.message || 'Error al procesar la solicitud de NutriChat',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

