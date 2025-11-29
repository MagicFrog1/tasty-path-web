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
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        const subscriptionId = session.subscription as string;
        
        if (!subscriptionId) {
          console.error('❌ No se encontró subscription_id en la sesión');
          console.error('📋 Datos de la sesión:', JSON.stringify(session, null, 2));
          // Aún así intentar actualizar con la información disponible
          if (session.customer_email) {
            try {
              // Buscar usuario por email usando listUsers
              const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
              const authUser = users?.find(u => u.email === session.customer_email);
              if (authUser) {
                const customerId = session.customer as string;
                if (customerId) {
                  const subscriptionData = {
                    user_id: authUser.id,
                    stripe_customer_id: customerId,
                    plan: (session.metadata?.planId as 'trial' | 'weekly' | 'monthly' | 'annual') || 'monthly',
                    is_premium: true,
                    status: 'active',
                  };
                  const { error: upsertError } = await supabase
                    .from('user_subscriptions')
                    .upsert(subscriptionData, { onConflict: 'user_id' });
                  if (!upsertError) {
                    console.log('✅ Suscripción actualizada sin subscription_id');
                  }
                }
              }
            } catch (error) {
              console.error('❌ Error actualizando sin subscription_id:', error);
            }
          }
          break;
        }

        // Obtener información de la suscripción desde Stripe
        let subscription: Stripe.Subscription | null = null;
        let customerId: string;
        
        try {
          subscription = await stripe.subscriptions.retrieve(subscriptionId);
          customerId = subscription.customer as string;
          console.log('✅ Suscripción obtenida de Stripe:', {
            subscriptionId,
            customerId,
            status: subscription.status,
          });
        } catch (error: any) {
          console.error('❌ Error obteniendo suscripción de Stripe:', error);
          // Intentar usar el customer_id de la sesión directamente
          customerId = session.customer as string;
          if (!customerId) {
            console.error('❌ No se pudo obtener customer_id ni de la suscripción ni de la sesión');
            break;
          }
          // Continuar con el customer_id aunque no tengamos la suscripción completa
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

        // 4. Último recurso: buscar por email
        if (!userId && session.customer_email) {
          try {
            console.log('🔍 Buscando usuario por email (último recurso):', session.customer_email);
            // Buscar usuario por email usando listUsers
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
              console.error('❌ Error listando usuarios:', listError);
            } else {
              const authUser = users?.find(u => u.email === session.customer_email);
              if (authUser) {
                userId = authUser.id;
                console.log('✅ Usuario encontrado por email:', userId);
              } else {
                console.warn('⚠️ Usuario no encontrado por email:', session.customer_email);
              }
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
          // Loguear el error pero continuar (ya respondimos a Stripe)
          return;
        }

        // Extraer el plan del price_id o metadata
        let plan: 'trial' | 'weekly' | 'monthly' | 'annual' = 'monthly';
        
        if (subscription) {
          const priceId = subscription.items.data[0]?.price.id;
          const priceIds = {
            trial: process.env.VITE_STRIPE_PRICE_TRIAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_TRIAL || 'price_1SYlSnKHiNy1x57tiLVPXQFW',
            weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY,
            monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY,
            annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL,
          };

          if (priceId === priceIds.trial) plan = 'trial';
          else if (priceId === priceIds.weekly) plan = 'weekly';
          else if (priceId === priceIds.annual) plan = 'annual';
        } else if (session.metadata?.planId) {
          plan = session.metadata.planId as 'trial' | 'weekly' | 'monthly' | 'annual';
          console.log('📋 Plan obtenido de metadata:', plan);
        }

        // Determinar el estado de la suscripción
        const isActive = subscription 
          ? (subscription.status === 'active' || subscription.status === 'trialing')
          : true; // Si no tenemos la suscripción, asumir activa
        const status = subscription 
          ? (subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : subscription.status)
          : 'active';

        // Insertar o actualizar la suscripción en Supabase
        const subscriptionData: any = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan,
          is_premium: isActive,
          status: status,
        };

        // Agregar fechas si tenemos la suscripción completa
        // IMPORTANTE: Usar UTC para todas las fechas para evitar problemas de zona horaria
        if (subscription) {
          // Stripe devuelve timestamps en Unix (segundos), convertir a ISO string en UTC
          const periodStart = new Date((subscription as any).current_period_start * 1000);
          const periodEnd = new Date((subscription as any).current_period_end * 1000);
          
          subscriptionData.current_period_start = periodStart.toISOString();
          subscriptionData.current_period_end = periodEnd.toISOString();
          subscriptionData.cancel_at_period_end = (subscription as any).cancel_at_period_end;
          subscriptionData.canceled_at = (subscription as any).canceled_at 
            ? new Date((subscription as any).canceled_at * 1000).toISOString() 
            : null;
          
          console.log('📅 Fechas de suscripción (UTC):', {
            start: subscriptionData.current_period_start,
            end: subscriptionData.current_period_end,
            serverTime: new Date().toISOString(),
          });
        }

        console.log('💾 Actualizando suscripción en Supabase:', JSON.stringify(subscriptionData, null, 2));

        const { error: upsertError, data: upsertData } = await supabase
          .from('user_subscriptions')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          console.error('❌ Error actualizando suscripción en Supabase:', upsertError);
          console.error('📋 Código de error:', upsertError.code);
          console.error('📋 Mensaje de error:', upsertError.message);
          console.error('📋 Detalles:', upsertError.details);
          console.error('📋 Hint:', upsertError.hint);
          console.error('📋 Datos que intentamos guardar:', JSON.stringify(subscriptionData, null, 2));
          // Loguear el error pero continuar (ya respondimos a Stripe)
          return;
        }

        console.log('✅ Suscripción actualizada exitosamente en Supabase:', {
          userId,
          customerId,
          subscriptionId,
          isPremium: subscriptionData.is_premium,
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          data: upsertData,
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
