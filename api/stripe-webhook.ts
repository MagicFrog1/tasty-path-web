import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook de Stripe para manejar eventos de suscripción
 * Este endpoint procesa los eventos de Stripe y actualiza la base de datos de Supabase
 * 
 * CRÍTICO: Este endpoint debe deshabilitar el bodyParser para obtener el body raw
 * y poder verificar la firma de Stripe correctamente.
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

  // CRÍTICO: Obtener el body raw para la verificación de la firma
  // En Vercel con bodyParser: false, el body debe leerse desde el stream
  let rawBody: Buffer;
  
  try {
    // En Vercel Serverless Functions, cuando bodyParser: false,
    // el body puede venir de diferentes formas dependiendo de cómo Vercel lo procesa.
    // La forma más confiable es leerlo directamente del stream del request.
    
    // Intentar múltiples estrategias en orden de preferencia:
    
    // Estrategia 1: Si el body ya es un Buffer, usarlo directamente
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body;
      console.log('✅ Body recibido como Buffer, tamaño:', rawBody.length, 'bytes');
    }
    // Estrategia 2: Si es string, convertir a Buffer
    else if (typeof req.body === 'string') {
      rawBody = Buffer.from(req.body, 'utf8');
      console.log('✅ Body recibido como string, convertido a Buffer, tamaño:', rawBody.length, 'bytes');
    }
    // Estrategia 3: Leer del stream del request (más confiable en Vercel)
    else {
      console.log('📖 Leyendo body desde el stream del request...');
      rawBody = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        let hasResolved = false;
        
        // Si el stream ya tiene datos, puede que ya esté disponible
        // Intentar leer directamente si está disponible
        if (req.readable && !req.readableEnded) {
          req.on('data', (chunk: Buffer) => {
            if (!hasResolved) {
              chunks.push(chunk);
            }
          });
          
          req.on('end', () => {
            if (!hasResolved) {
              hasResolved = true;
              const body = chunks.length > 0 ? Buffer.concat(chunks) : Buffer.alloc(0);
              console.log('✅ Body leído desde stream, tamaño:', body.length, 'bytes');
              resolve(body);
            }
          });
          
          req.on('error', (error) => {
            if (!hasResolved) {
              hasResolved = true;
              console.error('❌ Error leyendo stream:', error);
              reject(error);
            }
          });
          
          // Timeout de seguridad
          setTimeout(() => {
            if (!hasResolved) {
              hasResolved = true;
              if (chunks.length > 0) {
                // Si tenemos chunks, usarlos
                resolve(Buffer.concat(chunks));
              } else {
                reject(new Error('Timeout leyendo el body del request'));
              }
            }
          }, 10000);
        } else {
          // Stream ya fue consumido o no está disponible
          // Intentar reconstruir desde el body si existe
          if (req.body) {
            console.warn('⚠️ Stream no disponible, usando body existente');
            const bodyStr = typeof req.body === 'string' 
              ? req.body 
              : JSON.stringify(req.body);
            resolve(Buffer.from(bodyStr, 'utf8'));
          } else {
            reject(new Error('No se puede obtener el body: stream no disponible y body vacío'));
          }
        }
      });
    }
    
    if (!rawBody || rawBody.length === 0) {
      console.error('❌ Body vacío o no encontrado');
      return res.status(400).json({ error: 'No body found in request' });
    }
    
    console.log('✅ Body raw obtenido exitosamente, tamaño:', rawBody.length, 'bytes');
  } catch (error: any) {
    console.error('❌ Error obteniendo body raw:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body),
      hasBody: !!req.body,
    });
    return res.status(400).json({ 
      error: `Error processing request body: ${error.message}`,
      hint: 'Are you passing the raw request body you received from Stripe?'
    });
  }

  let event: Stripe.Event;

  try {
    // Verificar la firma del webhook usando el body raw como Buffer
    // CRÍTICO: El body debe ser exactamente como Stripe lo envió
    // IMPORTANTE: Agregar tolerancia de tiempo (300 segundos = 5 minutos)
    // Esto permite diferencias de reloj entre el servidor y Stripe
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
      300 // Tolerancia de tiempo en segundos (5 minutos)
    );
    console.log('✅ Webhook verificado correctamente:', event.type);
    console.log('📋 Event ID:', event.id);
    console.log('⏰ Timestamp del evento:', new Date(event.created * 1000).toISOString());
  } catch (err: any) {
    console.error('❌ Error verificando webhook:', err.message);
    console.error('📋 Detalles del error:', {
      message: err.message,
      bodySize: rawBody.length,
      signaturePrefix: signature?.substring(0, 50) + '...',
      webhookSecretPrefix: webhookSecret?.substring(0, 10) + '...',
      serverTime: new Date().toISOString(),
    });
    return res.status(400).json({ 
      error: `Webhook Error: ${err.message}. Are you passing the raw request body you received from Stripe? If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.` 
    });
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
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-client-info': 'stripe-webhook'
      }
    }
  });
  
  // Verificar que el cliente tenga permisos de service_role
  console.log('🔐 Cliente de Supabase creado con service_role (bypass RLS)');
  console.log('🔑 Service key prefix:', supabaseServiceKey?.substring(0, 20) + '...');

  try {
    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 Checkout completado:', session.id);
        console.log('📧 Email del cliente:', session.customer_email);
        console.log('👤 Customer ID de la sesión:', session.customer);
        console.log('🔑 Client reference ID:', session.client_reference_id);

        // Obtener la suscripción asociada
        const subscriptionId = session.subscription as string | null;
        console.log('📋 Subscription ID de la sesión:', subscriptionId || 'NO ENCONTRADO');
        
        // Obtener customer_id de la sesión
        let customerId = session.customer as string | null;
        console.log('📋 Customer ID de la sesión:', customerId || 'NO ENCONTRADO');
        
        // Obtener información de la suscripción desde Stripe (si existe)
        let subscription: Stripe.Subscription | null = null;
        
        // CRÍTICO: Siempre intentar obtener la suscripción si hay subscriptionId
        if (subscriptionId) {
          try {
            console.log('🔍 Obteniendo suscripción de Stripe con ID:', subscriptionId);
            subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ['items.data.price']
            });
            customerId = subscription.customer as string;
            console.log('✅ Suscripción obtenida de Stripe:', {
              subscriptionId,
              customerId,
              status: subscription.status,
              priceId: subscription.items.data[0]?.price.id,
              current_period_start: (subscription as any).current_period_start,
              current_period_end: (subscription as any).current_period_end,
            });
          } catch (error: any) {
            console.error('❌ Error obteniendo suscripción de Stripe:', error);
            console.error('📋 Detalles del error:', {
              message: error.message,
              type: error.type,
              code: error.code,
            });
            // Continuar sin la suscripción completa
            if (!customerId) {
              customerId = session.customer as string;
            }
          }
        } else {
          console.warn('⚠️ No hay subscription_id en la sesión - esto puede ser normal para algunos tipos de checkout');
          // Intentar obtener customer_id de la sesión
          if (!customerId) {
            customerId = session.customer as string;
          }
        }
        
        // Si aún no tenemos customer_id, no podemos continuar
        if (!customerId) {
          console.error('❌ No se pudo obtener customer_id de ninguna fuente');
          console.error('📋 Datos completos de la sesión:', JSON.stringify(session, null, 2));
          // Responder a Stripe pero loguear el error
          return res.status(200).json({ 
            received: true, 
            warning: 'No customer_id found' 
          });
        }

        // Buscar el usuario - PRIORIDAD: client_reference_id (más confiable)
        let userId: string | null = null;

        // 1. PRIORIDAD: Usar client_reference_id (ID del usuario de Supabase pasado al crear la sesión)
        if (session.client_reference_id) {
          userId = session.client_reference_id;
          console.log('✅ Usuario obtenido desde client_reference_id:', userId);
        }

        // 2. Si no hay client_reference_id, intentar desde metadata
        if (!userId && session.metadata?.userId) {
          userId = session.metadata.userId;
          console.log('✅ Usuario obtenido desde metadata.userId:', userId);
        }
        
        // 2.5: Si metadata.userId existe pero está vacío, intentar de nuevo sin validación
        if (!userId && session.metadata?.userId && session.metadata.userId.trim() !== '') {
          userId = session.metadata.userId.trim();
          console.log('✅ Usuario obtenido desde metadata.userId (trimmed):', userId);
        }

        // 3. Si aún no tenemos userId, buscar por customer_id en la tabla de suscripciones
        if (!userId && customerId) {
          try {
            const { data: existingSubscription, error: searchError } = await supabase
              .from('user_subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .maybeSingle();

            if (existingSubscription) {
              userId = existingSubscription.user_id;
              console.log('✅ Usuario encontrado por customer_id:', userId);
            } else if (searchError) {
              console.error('⚠️ Error buscando por customer_id:', searchError);
            }
          } catch (error) {
            console.error('⚠️ Error en búsqueda por customer_id:', error);
          }
        }

        // 4. Último recurso: buscar por email en user_profiles
        if (!userId && session.customer_email) {
          try {
            console.log('🔍 Buscando usuario por email en user_profiles (último recurso):', session.customer_email);
            // Buscar usuario por email en la tabla user_profiles (más confiable que auth.admin)
            const { data: profileData, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('email', session.customer_email)
              .maybeSingle();
            
            if (profileError) {
              console.error('⚠️ Error buscando por email en user_profiles:', profileError);
            } else if (profileData) {
              userId = profileData.id;
              console.log('✅ Usuario encontrado por email en user_profiles:', userId);
            } else {
              console.warn('⚠️ Usuario no encontrado por email:', session.customer_email);
            }
          } catch (error: any) {
            console.error('❌ Error en búsqueda por email:', error);
          }
        }

        if (!userId) {
          console.error('❌ No se pudo encontrar el usuario para:', {
            customerId,
            email: session.customer_email,
            client_reference_id: session.client_reference_id,
            metadata: session.metadata,
          });
          
          // ÚLTIMA OPCIÓN: Crear una suscripción temporal usando solo el customer_id
          // Esto permitirá que el usuario tenga acceso aunque no tengamos su user_id de Supabase
          // Más tarde podrá vincularse manualmente o mediante el evento customer.subscription.updated
          console.warn('⚠️ Intentando guardar suscripción sin user_id (solo con customer_id)...');
          
          // Buscar si ya existe una suscripción con este customer_id
          const { data: existingByCustomer } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle();
          
          if (existingByCustomer && existingByCustomer.user_id) {
            userId = existingByCustomer.user_id;
            console.log('✅ Usuario encontrado por customer_id existente:', userId);
          } else {
            // No podemos crear una suscripción sin user_id porque es NOT NULL
            console.error('❌ No se puede crear suscripción sin user_id. Se requiere client_reference_id al crear la sesión.');
            // Responder a Stripe pero loguear el error crítico
            return res.status(200).json({ 
              received: true, 
              warning: 'User not found - subscription not updated. client_reference_id is required when creating checkout session.',
              customerId: customerId,
              email: session.customer_email
            });
          }
        }

        console.log('✅ Usuario encontrado, procediendo a actualizar suscripción:', userId);

        // Extraer el plan del price_id, metadata o línea de items de la sesión
        let plan: 'trial' | 'weekly' | 'monthly' | 'annual' = 'monthly';
        
        // Prioridad 1: De la suscripción (si existe)
        if (subscription) {
          const priceId = subscription.items.data[0]?.price.id;
          const priceIds = {
            trial: process.env.VITE_STRIPE_PRICE_TRIAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
            weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
            monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
            annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
          };

          console.log('🔍 Comparando price_id:', { priceId, priceIds });
          
          if (priceId === priceIds.trial) plan = 'trial';
          else if (priceId === priceIds.weekly) plan = 'weekly';
          else if (priceId === priceIds.monthly) plan = 'monthly';
          else if (priceId === priceIds.annual) plan = 'annual';
          
          console.log('📋 Plan detectado desde subscription:', plan);
        }
        // Prioridad 2: De metadata de la sesión
        else if (session.metadata?.planId) {
          plan = session.metadata.planId as 'trial' | 'weekly' | 'monthly' | 'annual';
          console.log('📋 Plan obtenido de metadata de sesión:', plan);
        }
        // Prioridad 3: De la línea de items de la sesión
        else if (session.line_items) {
          try {
            // Obtener los line items de la sesión
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            if (lineItems.data && lineItems.data.length > 0) {
              const priceId = lineItems.data[0].price?.id;
              if (priceId) {
                const priceIds = {
                  trial: process.env.VITE_STRIPE_PRICE_TRIAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
                  weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
                  monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
                  annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
                };
                
                if (priceId === priceIds.trial) plan = 'trial';
                else if (priceId === priceIds.weekly) plan = 'weekly';
                else if (priceId === priceIds.monthly) plan = 'monthly';
                else if (priceId === priceIds.annual) plan = 'annual';
                
                console.log('📋 Plan detectado desde line_items:', plan);
              }
            }
          } catch (error: any) {
            console.warn('⚠️ Error obteniendo line_items de la sesión:', error.message);
          }
        }

        // Determinar el estado de la suscripción
        const isActive = subscription 
          ? (subscription.status === 'active' || subscription.status === 'trialing')
          : true; // Si no tenemos la suscripción, asumir activa para checkout completado
        const status = subscription 
          ? (subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status)
          : 'active'; // Checkout completado implica suscripción activa

        console.log('📋 Estado de suscripción determinado:', { isActive, status, plan });

        // Insertar o actualizar la suscripción en Supabase
        // CRÍTICO: Asegurar que TODOS los campos requeridos estén presentes
        const subscriptionData: any = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId || null, // Permitir null para casos sin subscription
          plan: plan,
          is_premium: isActive,
          status: status,
        };

        // IMPORTANTE: SIEMPRE establecer fechas, incluso si no hay suscripción completa
        // Usar UTC para todas las fechas para evitar problemas de zona horaria
        let periodStart: Date;
        let periodEnd: Date;
        
        if (subscription && (subscription as any).current_period_start && (subscription as any).current_period_end) {
          // Caso 1: Tenemos suscripción completa con fechas de Stripe
          periodStart = new Date((subscription as any).current_period_start * 1000);
          periodEnd = new Date((subscription as any).current_period_end * 1000);
          
          subscriptionData.cancel_at_period_end = (subscription as any).cancel_at_period_end || false;
          subscriptionData.canceled_at = (subscription as any).canceled_at 
            ? new Date((subscription as any).canceled_at * 1000).toISOString() 
            : null;
          
          console.log('📅 Fechas obtenidas de Stripe subscription (UTC):', {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
            serverTime: new Date().toISOString(),
          });
        } else {
          // Caso 2: No hay suscripción completa o no tiene fechas - calcular basado en el plan
          const now = new Date();
          periodStart = new Date(now);
          periodEnd = new Date(now);
          
          // Calcular fecha de fin según el plan
          if (plan === 'trial') {
            periodEnd.setDate(periodEnd.getDate() + 7);
            console.log('📅 Plan TRIAL: Estableciendo período de 7 días');
          } else if (plan === 'weekly') {
            periodEnd.setDate(periodEnd.getDate() + 7);
            console.log('📅 Plan WEEKLY: Estableciendo período de 7 días');
          } else if (plan === 'monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            console.log('📅 Plan MONTHLY: Estableciendo período de 1 mes');
          } else if (plan === 'annual') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
            console.log('📅 Plan ANNUAL: Estableciendo período de 1 año');
          } else {
            // Fallback: 1 mes por defecto
            periodEnd.setMonth(periodEnd.getMonth() + 1);
            console.warn('⚠️ Plan desconocido, usando período de 1 mes por defecto');
          }
          
          subscriptionData.cancel_at_period_end = false;
          subscriptionData.canceled_at = null;
          
          console.log('📅 Fechas calculadas por plan (UTC):', {
            start: periodStart.toISOString(),
            end: periodEnd.toISOString(),
            plan: plan,
            daysDifference: Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
          });
        }
        
        // SIEMPRE establecer las fechas (nunca dejar NULL)
        subscriptionData.current_period_start = periodStart.toISOString();
        subscriptionData.current_period_end = periodEnd.toISOString();
        
        // Verificación final: asegurar que las fechas no sean NULL
        if (!subscriptionData.current_period_start || !subscriptionData.current_period_end) {
          console.error('❌ ERROR CRÍTICO: Las fechas no se establecieron correctamente');
          console.error('📋 subscriptionData:', JSON.stringify(subscriptionData, null, 2));
          // Establecer fechas de emergencia
          const now = new Date();
          subscriptionData.current_period_start = now.toISOString();
          subscriptionData.current_period_end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 días
          console.warn('⚠️ Usando fechas de emergencia (30 días)');
        }

        console.log('💾 Preparando para actualizar suscripción en Supabase:');
        console.log('📋 Datos completos:', JSON.stringify(subscriptionData, null, 2));
        console.log('🔐 Verificando credenciales de Supabase:', {
          supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NO CONFIGURADO',
          hasServiceKey: !!supabaseServiceKey,
        });

        try {
          // Verificar que el cliente de Supabase esté configurado correctamente
          console.log('🔍 Verificando conexión con Supabase...');
          
          // Intentar hacer una consulta de prueba para verificar permisos
          const { data: testData, error: testError } = await supabase
            .from('user_subscriptions')
            .select('id')
            .limit(1);
          
          if (testError && testError.code !== 'PGRST116') { // PGRST116 = no rows returned (es normal)
            console.error('⚠️ Error de prueba en Supabase:', testError);
            console.error('📋 Esto podría indicar un problema con las credenciales o permisos');
          } else {
            console.log('✅ Conexión con Supabase verificada');
          }

          console.log('💾 Ejecutando UPSERT en Supabase...');
          const { error: upsertError, data: upsertData } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, {
              onConflict: 'user_id',
            });

          let subscriptionSaved = false; // Flag para rastrear si se guardó exitosamente

          if (upsertError) {
            console.error('❌ ERROR CRÍTICO actualizando suscripción en Supabase:');
            console.error('📋 Código de error:', upsertError.code);
            console.error('📋 Mensaje de error:', upsertError.message);
            console.error('📋 Detalles:', upsertError.details);
            console.error('📋 Hint:', upsertError.hint);
            console.error('📋 Datos que intentamos guardar:', JSON.stringify(subscriptionData, null, 2));
            
            // CRÍTICO: Intentar usando función SQL con SECURITY DEFINER (bypass completo de RLS)
            console.log('🔄 Intentando usar función SQL insert_user_subscription (bypass RLS)...');
            
            try {
              const { data: functionData, error: functionError } = await supabase.rpc('insert_user_subscription', {
                p_user_id: subscriptionData.user_id,
                p_stripe_customer_id: subscriptionData.stripe_customer_id,
                p_stripe_subscription_id: subscriptionData.stripe_subscription_id,
                p_plan: subscriptionData.plan,
                p_is_premium: subscriptionData.is_premium,
                p_status: subscriptionData.status,
                p_current_period_start: subscriptionData.current_period_start,
                p_current_period_end: subscriptionData.current_period_end,
                p_cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
                p_canceled_at: subscriptionData.canceled_at || null,
              });

              if (functionError) {
                console.error('❌ Error en función SQL insert_user_subscription:', functionError);
                
                // Último recurso: Intentar INSERT directo
                console.log('🔄 Último intento: INSERT directo...');
            const { error: insertError, data: insertData } = await supabase
              .from('user_subscriptions')
              .insert(subscriptionData);
            
            if (insertError) {
                  console.error('❌ Error en INSERT directo también:', insertError);
                  // Responder a Stripe con advertencia pero no fallar
                  return res.status(200).json({ 
                    received: true, 
                    error: 'Database update failed - all methods failed',
                    details: {
                      upsert: upsertError.message,
                      function: functionError.message,
                      insert: insertError.message
                    },
                    subscriptionData: subscriptionData
                  });
            } else {
                  console.log('✅ INSERT directo exitoso (último recurso):', insertData);
                  subscriptionSaved = true; // Marcar como guardado exitosamente
                  // Continuar con el flujo normal
                }
              } else {
                console.log('✅✅✅ SUSCRIPCIÓN GUARDADA CON FUNCIÓN SQL (BYPASS RLS) ✅✅✅');
                console.log('📋 ID retornado:', functionData);
                subscriptionSaved = true; // Marcar como guardado exitosamente
                // Continuar con el flujo normal
              }
            } catch (functionException: any) {
              console.error('❌ Excepción al llamar función SQL:', functionException);
              
              // Intentar INSERT directo como último recurso
              console.log('🔄 Último intento: INSERT directo...');
              const { error: insertError } = await supabase
                .from('user_subscriptions')
                .insert(subscriptionData);
              
              if (insertError) {
                console.error('❌ Error en INSERT directo también:', insertError);
            return res.status(200).json({ 
              received: true, 
                  error: 'Database update failed - all methods failed',
                  details: {
                    upsert: upsertError.message,
                    function: functionException.message,
                    insert: insertError.message
                  }
                });
              } else {
                console.log('✅ INSERT directo exitoso después de excepción');
                subscriptionSaved = true; // Marcar como guardado exitosamente
              }
            }
          } else {
            // UPSERT fue exitoso
            subscriptionSaved = true;
          }
          
          // Solo continuar si la suscripción se guardó exitosamente
          if (!subscriptionSaved) {
            console.error('❌ No se pudo guardar la suscripción con ningún método');
            return res.status(200).json({ 
              received: true, 
              error: 'Failed to save subscription after all attempts'
            });
          }

          console.log('✅✅✅ SUSCRIPCIÓN ACTUALIZADA EXITOSAMENTE EN SUPABASE ✅✅✅');
          console.log('📋 Detalles:', {
            userId,
            customerId,
            subscriptionId: subscriptionId || 'N/A',
            isPremium: subscriptionData.is_premium,
            plan: subscriptionData.plan,
            status: subscriptionData.status,
            periodStart: subscriptionData.current_period_start,
            periodEnd: subscriptionData.current_period_end,
            method: upsertError ? 'fallback' : 'upsert',
          });

          // Verificar que los datos se guardaron correctamente (usar maybeSingle para evitar errores)
          const { data: verifyData, error: verifyError } = await supabase
            .from('user_subscriptions')
            .select('user_id, stripe_customer_id, stripe_subscription_id, plan, is_premium, status, current_period_start, current_period_end')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (verifyError) {
            console.error('⚠️ Error verificando datos guardados:', verifyError);
          } else if (!verifyData) {
            console.warn('⚠️ No se pudo verificar los datos guardados (la suscripción podría no existir aún)');
          } else {
            console.log('✅ Verificación: Datos confirmados en Supabase:', {
              user_id: verifyData.user_id,
              stripe_customer_id: verifyData.stripe_customer_id,
              stripe_subscription_id: verifyData.stripe_subscription_id,
              plan: verifyData.plan,
              is_premium: verifyData.is_premium,
              status: verifyData.status,
              period_start: verifyData.current_period_start,
              period_end: verifyData.current_period_end,
            });
          }

          // CRÍTICO: Actualizar también user_profiles con el nivel de suscripción
          // Esto permite que la aplicación detecte rápidamente los permisos sin consultar user_subscriptions
          try {
            console.log('🔄 Actualizando user_profiles con nivel de suscripción...');
            
            // Mapear el plan a subscription_plan (user_profiles solo acepta 'weekly', 'monthly', 'annual')
            // Para 'trial', usamos null o no actualizamos (depende de tu lógica de negocio)
            let subscriptionPlan: 'weekly' | 'monthly' | 'annual' | null = null;
            if (plan === 'weekly') subscriptionPlan = 'weekly';
            else if (plan === 'monthly') subscriptionPlan = 'monthly';
            else if (plan === 'annual') subscriptionPlan = 'annual';
            // 'trial' se deja como null (o puedes decidir mapearlo a otro valor)
            
            const { error: profileUpdateError } = await supabase
              .from('user_profiles')
              .update({
                subscription_plan: subscriptionPlan,
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
            
            if (profileUpdateError) {
              console.error('⚠️ Error actualizando user_profiles:', profileUpdateError);
              // No fallar el webhook si esto falla, solo loguear
            } else {
              console.log('✅ user_profiles actualizado con subscription_plan:', subscriptionPlan);
            }
          } catch (error: any) {
            console.error('⚠️ Excepción actualizando user_profiles:', error);
            // No fallar el webhook si esto falla
          }

        } catch (error: any) {
          console.error('❌ EXCEPCIÓN al actualizar suscripción en Supabase:', error);
          console.error('📋 Stack trace:', error.stack);
          console.error('📋 Tipo de error:', error.constructor.name);
          return res.status(200).json({ 
            received: true, 
            error: 'Exception during database update',
            details: error.message
          });
        }

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

        const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status;

        // Actualizar la suscripción
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            plan: plan,
            is_premium: subscription.status === 'active' || subscription.status === 'trialing',
            status: status,
            // Usar UTC para todas las fechas
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
            canceled_at: (subscription as any).canceled_at 
              ? new Date((subscription as any).canceled_at * 1000).toISOString() 
              : null,
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('❌ Error actualizando suscripción:', updateError);
          return;
        }

        console.log('✅ Suscripción actualizada:', {
          customerId,
          isPremium: subscription.status === 'active' || subscription.status === 'trialing',
        });

        // CRÍTICO: Actualizar también user_profiles con el nivel de suscripción
        if (existingSubscription?.user_id) {
          try {
            let subscriptionPlan: 'weekly' | 'monthly' | 'annual' | null = null;
            if (plan === 'weekly') subscriptionPlan = 'weekly';
            else if (plan === 'monthly') subscriptionPlan = 'monthly';
            else if (plan === 'annual') subscriptionPlan = 'annual';
            
            const { error: profileUpdateError } = await supabase
              .from('user_profiles')
              .update({
                subscription_plan: subscriptionPlan,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingSubscription.user_id);
            
            if (profileUpdateError) {
              console.error('⚠️ Error actualizando user_profiles:', profileUpdateError);
            } else {
              console.log('✅ user_profiles actualizado con subscription_plan:', subscriptionPlan);
            }
          } catch (error: any) {
            console.error('⚠️ Excepción actualizando user_profiles:', error);
          }
        }

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
            // Usar fecha actual en UTC
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (updateError) {
          console.error('❌ Error cancelando suscripción:', updateError);
          return;
        }

        console.log('✅ Suscripción cancelada en Supabase:', customerId);

        // CRÍTICO: Actualizar también user_profiles cuando se cancela la suscripción
        try {
          const { data: canceledSubscription } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single();
          
          if (canceledSubscription?.user_id) {
            const { error: profileUpdateError } = await supabase
              .from('user_profiles')
              .update({
                subscription_plan: null, // Cancelar = sin plan
                updated_at: new Date().toISOString(),
              })
              .eq('id', canceledSubscription.user_id);
            
            if (profileUpdateError) {
              console.error('⚠️ Error actualizando user_profiles al cancelar:', profileUpdateError);
            } else {
              console.log('✅ user_profiles actualizado: subscription_plan = null (cancelado)');
            }
          }
        } catch (error: any) {
          console.error('⚠️ Excepción actualizando user_profiles al cancelar:', error);
        }

        break;
      }

      default:
        console.log('ℹ️ Evento no manejado:', event.type);
    }

    // Responder con éxito a Stripe
    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Error procesando webhook:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      eventType: event.type,
      eventId: event.id,
    });
    // Responder con error pero no crítico para que Stripe no reintente infinitamente
    return res.status(200).json({ 
      received: true, 
      error: 'Error procesando evento pero recibido' 
    });
  }
}

// Configuración para manejar el body raw
// CRÍTICO: bodyParser debe ser false para que Stripe pueda verificar la firma
export const config = {
  api: {
    bodyParser: false,
  },
};
