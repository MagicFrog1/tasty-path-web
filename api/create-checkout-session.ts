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

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    // Obtener la clave secreta de Stripe desde las variables de entorno
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY no configurada');
      return res.status(500).json({ error: 'Stripe no está configurado correctamente en el servidor' });
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

    if (!priceId) {
      return res.status(400).json({ error: `Price ID no encontrado para el plan: ${planId}` });
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
    return res.status(500).json({ 
      error: error.message || 'Error al crear la sesión de checkout' 
    });
  }
}

