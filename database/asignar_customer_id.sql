-- =====================================================
-- ASIGNAR CUSTOMER ID MANUALMENTE
-- =====================================================
-- Este script asigna un customer_id de Stripe a un usuario específico
-- por su email

-- Paso 1: Buscar el user_id del usuario por email
-- (Nota: Este query te mostrará el user_id, úsalo en el siguiente paso)

SELECT id as user_id, email 
FROM auth.users 
WHERE email = 'angeldcchp94@gmail.com';

-- Paso 2: Una vez que tengas el user_id, ejecuta este script
-- Reemplaza 'USER_ID_AQUI' con el user_id obtenido del query anterior

-- Opción A: Si el usuario ya tiene un registro en user_subscriptions
-- (Actualizar el customer_id existente)

UPDATE public.user_subscriptions
SET 
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com'
);

-- Opción B: Si el usuario NO tiene registro, crear uno nuevo
-- (Descomenta y ajusta el plan según necesites)

/*
INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    plan,
    is_premium,
    status
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com'),
    'cus_TVdtclYuO5hGlv',
    'monthly',  -- Cambia según el plan: 'weekly', 'monthly', o 'annual'
    true,       -- true si tiene suscripción activa
    'active'    -- Estado: 'active', 'canceled', etc.
);
*/

-- Verificar que se actualizó correctamente
SELECT 
    us.*,
    u.email,
    u.id as user_id
FROM public.user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';

