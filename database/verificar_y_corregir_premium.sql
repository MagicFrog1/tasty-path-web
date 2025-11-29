-- =====================================================
-- VERIFICAR Y CORREGIR ESTADO PREMIUM
-- =====================================================
-- Este script verifica y corrige el estado premium del usuario

-- PASO 1: Verificar el user_id del usuario
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users 
WHERE email = 'angeldcchp94@gmail.com';

-- PASO 2: Verificar el estado actual de la suscripción
SELECT 
    us.id,
    us.user_id,
    us.stripe_customer_id,
    us.stripe_subscription_id,
    us.plan,
    us.is_premium,
    us.status,
    us.current_period_start,
    us.current_period_end,
    u.email
FROM public.user_subscriptions us
LEFT JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';

-- PASO 3: Actualizar o crear el registro con todos los valores correctos
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
    'monthly',  -- Cambia según el plan real: 'weekly', 'monthly', 'annual'
    true,       -- is_premium = true
    'active',   -- status = 'active'
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    plan = 'monthly',  -- Ajusta según el plan real
    is_premium = true,
    status = 'active',
    updated_at = NOW();

-- PASO 4: Verificar el resultado final
SELECT 
    us.id,
    us.user_id,
    us.stripe_customer_id,
    us.plan,
    us.is_premium,
    us.status,
    u.email,
    CASE 
        WHEN us.is_premium = true AND us.status = 'active' THEN '✅ PREMIUM ACTIVO'
        ELSE '❌ NO PREMIUM'
    END as estado_final
FROM public.user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';

-- PASO 5: Si aún no funciona, verificar RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_subscriptions';



