import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para obtener información de una sesión de checkout de Stripe
 * Se usa para obtener el customer ID después de que el usuario completa el pago
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Solo permitir métodos GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = req.query.session_id as string;

    if (!sessionId) {
      return res.status(400).json({ 
        error: 'session_id is required' 
      });
    }

    // Obtener la clave secreta de Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({ 
        error: 'Stripe no está configurado correctamente en el servidor.' 
      });
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    console.log('🔍 Obteniendo información de la sesión:', sessionId);

    // Obtener la sesión de checkout
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer'],
    });

    console.log('✅ Sesión obtenida:', {
      id: session.id,
      customer: session.customer,
      status: session.status,
    });

    // Devolver el customer ID si está disponible
    return res.status(200).json({ 
      customerId: session.customer as string | null,
      sessionId: session.id,
      status: session.status,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo sesión de checkout:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al obtener la información de la sesión',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

