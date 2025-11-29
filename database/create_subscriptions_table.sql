-- =====================================================
-- TABLA DE SUSCRIPCIONES CON STRIPE
-- =====================================================
-- Esta tabla almacena la información de suscripciones de Stripe
-- y permite gestionar el estado premium de los usuarios

-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT CHECK (plan IN ('trial', 'weekly', 'monthly', 'annual')) NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused')) DEFAULT 'incomplete',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para búsquedas rápidas
    CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_premium ON public.user_subscriptions(is_premium);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden leer su propia suscripción
CREATE POLICY user_subscriptions_select_own
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar su propia suscripción
-- (Aunque el webhook también necesitará actualizar, eso se hará con service_role)
CREATE POLICY user_subscriptions_update_own
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE public.user_subscriptions IS 'Tabla que almacena las suscripciones de usuarios con Stripe';
COMMENT ON COLUMN public.user_subscriptions.stripe_customer_id IS 'ID del cliente en Stripe (cus_xxxxx)';
COMMENT ON COLUMN public.user_subscriptions.stripe_subscription_id IS 'ID de la suscripción en Stripe (sub_xxxxx)';
COMMENT ON COLUMN public.user_subscriptions.is_premium IS 'Indica si el usuario tiene acceso premium activo';
COMMENT ON COLUMN public.user_subscriptions.status IS 'Estado de la suscripción en Stripe';

