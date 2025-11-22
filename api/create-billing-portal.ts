import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para crear una sesión del Portal de Clientes de Stripe
 * Permite a los usuarios gestionar su suscripción (actualizar tarjeta, cambiar plan, cancelar, etc.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId } = req.body;

    console.log('📥 Request recibido para crear sesión del Portal de Clientes:', { customerId });

    if (!customerId) {
      return res.status(400).json({ 
        error: 'customerId is required. El ID del cliente de Stripe es necesario para acceder al portal.' 
      });
    }

    // Obtener la clave secreta de Stripe desde las variables de entorno
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY no configurada');
      return res.status(500).json({ 
        error: 'Stripe no está configurado correctamente en el servidor. STRIPE_SECRET_KEY no encontrada.' 
      });
    }

    // Obtener el ID de configuración del Portal de Clientes
    const billingPortalId = process.env.STRIPE_BILLING_PORTAL_ID;

    if (!billingPortalId) {
      console.error('❌ STRIPE_BILLING_PORTAL_ID no configurada');
      console.error('💡 Solución: Ve a Vercel > Settings > Environment Variables y agrega:');
      console.error('   - Nombre: STRIPE_BILLING_PORTAL_ID');
      console.error('   - Valor: bpc_1SWFS8KHiNy1x57t0VwcErdN');
      return res.status(500).json({ 
        error: 'El Portal de Clientes no está configurado. STRIPE_BILLING_PORTAL_ID no encontrada. Contacta al administrador.' 
      });
    }

    console.log('🔍 Verificando configuración:', {
      STRIPE_SECRET_KEY: stripeSecretKey ? `${stripeSecretKey.substring(0, 10)}...` : 'NO ENCONTRADO',
      STRIPE_BILLING_PORTAL_ID: billingPortalId ? `${billingPortalId.substring(0, 20)}...` : 'NO ENCONTRADO',
      customerId: customerId ? `${customerId.substring(0, 20)}...` : 'NO ENCONTRADO',
    });

    // Inicializar Stripe con la clave secreta
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    // Verificar que el customer existe
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        return res.status(400).json({ 
          error: 'El cliente de Stripe ha sido eliminado. Contacta al soporte.' 
        });
      }
      console.log('✅ Cliente verificado:', customer.id);
    } catch (error: any) {
      console.error('❌ Error verificando cliente:', error);
      if (error.code === 'resource_missing') {
        return res.status(404).json({ 
          error: 'Cliente de Stripe no encontrado. Asegúrate de haber completado una suscripción primero.' 
        });
      }
      throw error;
    }

    // URL de retorno después de que el usuario termine en el portal
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'http://localhost:5173';
    const returnUrl = `${origin}/suscripcion?portal_return=true`;

    console.log('🔄 Creando sesión del Portal de Clientes...');
    console.log('📋 Customer ID:', customerId);
    console.log('📋 Portal Configuration ID:', billingPortalId);
    console.log('🔗 Return URL:', returnUrl);

    // Crear la sesión del Portal de Clientes
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log('✅ Sesión del Portal de Clientes creada:', session.id);

    // Devolver la URL del portal
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Error creando sesión del Portal de Clientes:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    return res.status(500).json({ 
      error: error.message || 'Error al crear la sesión del Portal de Clientes',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

