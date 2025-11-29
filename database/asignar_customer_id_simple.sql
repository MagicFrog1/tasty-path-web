-- =====================================================
-- ASIGNAR CUSTOMER ID - VERSIÓN SIMPLE
-- =====================================================
-- Asigna el customer_id de Stripe directamente por email

-- Actualizar o crear el registro de suscripción
INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    plan,
    is_premium,
    status,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com'),
    'cus_TVdtclYuO5hGlv',
    'monthly',  -- Ajusta según el plan: 'weekly', 'monthly', 'annual'
    true,       -- true si tiene suscripción activa
    'active',   -- Estado de la suscripción
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    updated_at = NOW();

-- Verificar el resultado
SELECT 
    us.id,
    us.user_id,
    us.stripe_customer_id,
    us.stripe_subscription_id,
    us.plan,
    us.is_premium,
    us.status,
    u.email
FROM public.user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';


