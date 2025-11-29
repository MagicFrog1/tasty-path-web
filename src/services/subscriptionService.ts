// Servicio para gestionar suscripciones desde Supabase
import { supabase } from './supabase';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'trial' | 'weekly' | 'monthly' | 'annual' | null;
  is_premium: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'paused' | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene la suscripción actual del usuario desde Supabase
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró ninguna suscripción
        return null;
      }
      console.error('Error obteniendo suscripción:', error);
      return null;
    }

    return data as UserSubscription;
  } catch (error) {
    console.error('Error obteniendo suscripción:', error);
    return null;
  }
}

/**
 * Verifica si el usuario tiene acceso premium
 */
export async function isUserPremium(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription?.is_premium === true && subscription?.status === 'active';
}

/**
 * Obtiene el customer ID de Stripe del usuario
 */
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const subscription = await getUserSubscription(userId);
  return subscription?.stripe_customer_id || null;
}

/**
 * Crea o actualiza un registro de suscripción inicial (antes del pago)
 * Se llama cuando el usuario inicia el proceso de checkout
 */
export async function createInitialSubscription(
  userId: string,
  plan: 'trial' | 'weekly' | 'monthly' | 'annual',
  stripeCustomerId?: string
): Promise<UserSubscription | null> {
  try {
    // Primero intentar obtener la suscripción existente
    const existing = await getUserSubscription(userId);

    const subscriptionData: Partial<UserSubscription> = {
      user_id: userId,
      plan: plan,
      is_premium: false, // Siempre false al inicio
      status: 'incomplete',
      stripe_customer_id: stripeCustomerId || existing?.stripe_customer_id || null,
    };

    let result;
    if (existing) {
      // Actualizar la suscripción existente
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando suscripción inicial:', error);
        return null;
      }
      result = data;
    } else {
      // Crear nueva suscripción
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Error creando suscripción inicial:', error);
        return null;
      }
      result = data;
    }

    return result as UserSubscription;
  } catch (error) {
    console.error('Error creando suscripción inicial:', error);
    return null;
  }
}

