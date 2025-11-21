import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para crear una sesión de checkout de Stripe
 * Esta función usa la clave secreta de Stripe (solo disponible en el servidor)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planId, customerEmail } = req.body;

    console.log('📥 Request recibido:', { planId, customerEmail });

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    // Obtener la clave secreta de Stripe desde las variables de entorno
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY no configurada');
      console.error('🔍 Variables disponibles:', {
        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        VITE_STRIPE_PRICE_WEEKLY: process.env.VITE_STRIPE_PRICE_WEEKLY || 'NO ENCONTRADO',
        VITE_STRIPE_PRICE_MONTHLY: process.env.VITE_STRIPE_PRICE_MONTHLY || 'NO ENCONTRADO',
        VITE_STRIPE_PRICE_ANNUAL: process.env.VITE_STRIPE_PRICE_ANNUAL || 'NO ENCONTRADO',
      });
      return res.status(500).json({ error: 'Stripe no está configurado correctamente en el servidor. STRIPE_SECRET_KEY no encontrada.' });
    }

    // Inicializar Stripe con la clave secreta
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    // Mapear planId a Price ID
    // Priorizar VITE_* (como están configuradas en Vercel)
    const priceIds: Record<string, string> = {
      weekly: process.env.VITE_STRIPE_PRICE_WEEKLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || process.env.STRIPE_PRICE_WEEKLY || '',
      monthly: process.env.VITE_STRIPE_PRICE_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
      annual: process.env.VITE_STRIPE_PRICE_ANNUAL || process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || process.env.STRIPE_PRICE_ANNUAL || '',
    };

    const priceId = priceIds[planId];

    console.log('🔍 Price IDs configurados:', {
      weekly: priceIds.weekly ? `${priceIds.weekly.substring(0, 20)}...` : 'NO ENCONTRADO',
      monthly: priceIds.monthly ? `${priceIds.monthly.substring(0, 20)}...` : 'NO ENCONTRADO',
      annual: priceIds.annual ? `${priceIds.annual.substring(0, 20)}...` : 'NO ENCONTRADO',
    });

    if (!priceId) {
      console.error('❌ Price ID no encontrado para el plan:', planId);
      return res.status(400).json({ error: `Price ID no encontrado para el plan: ${planId}` });
    }

    // Verificar que el Price ID tenga el formato correcto (debe empezar con "price_")
    if (!priceId.startsWith('price_')) {
      console.error('❌ Price ID tiene formato incorrecto:', priceId);
      console.error('⚠️ Los Price IDs deben empezar con "price_". El valor recibido parece ser un Product ID.');
      return res.status(400).json({ 
        error: `Price ID inválido para el plan ${planId}. Los Price IDs deben empezar con "price_". Verifica la configuración en Vercel.` 
      });
    }

    // URLs de redirección
    const origin = req.headers.origin || req.headers.referer?.split('/').slice(0, 3).join('/') || 'http://localhost:5173';
    const successUrl = `${origin}/suscripcion?success=true&plan=${planId}`;
    const cancelUrl = `${origin}/suscripcion?canceled=true`;

    console.log('🔄 Creando sesión de checkout de Stripe...');
    console.log('📋 Plan:', planId);
    console.log('💰 Price ID:', priceId);
    console.log('🔗 Success URL:', successUrl);
    console.log('🔗 Cancel URL:', cancelUrl);

    // Crear la sesión de checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      billing_address_collection: 'auto',
    });

    console.log('✅ Sesión de checkout creada:', session.id);

    // Devolver la URL de la sesión
    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Error creando sesión de checkout:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    return res.status(500).json({ 
      error: error.message || 'Error al crear la sesión de checkout',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

