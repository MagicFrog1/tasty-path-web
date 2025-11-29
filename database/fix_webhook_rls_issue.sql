-- =====================================================
-- FIX RLS ISSUE PARA WEBHOOK - user_subscriptions
-- =====================================================
-- Este script asegura que el webhook pueda INSERT/UPDATE
-- incluso con RLS habilitado
-- 
-- IMPORTANTE: service_role debería hacer bypass de RLS automáticamente,
-- pero si hay problemas, estas soluciones ayudan

-- PASO 1: Verificar estado actual de RLS
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS habilitado'
        ELSE '❌ RLS deshabilitado'
    END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions';

-- PASO 2: Ver todas las políticas actuales
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions'
ORDER BY policyname;

-- PASO 3: Verificar que no haya políticas que bloqueen service_role
-- service_role debería poder hacer bypass, pero a veces las políticas 
-- pueden interferir si están mal configuradas

-- PASO 4: SOLUCIÓN 1 - Asegurar que las políticas permitan service_role explícitamente
-- Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS user_subscriptions_select_own ON public.user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_update_own ON public.user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_insert_own ON public.user_subscriptions;

-- Crear políticas que NO interfieran con service_role
-- IMPORTANTE: Estas políticas solo aplican cuando NO es service_role
CREATE POLICY user_subscriptions_select_own
    ON public.user_subscriptions
    FOR SELECT
    USING (
        -- Permitir si el usuario es el dueño
        auth.uid() = user_id
        OR
        -- Permitir si es service_role (aunque service_role normalmente hace bypass)
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY user_subscriptions_update_own
    ON public.user_subscriptions
    FOR UPDATE
    USING (
        auth.uid() = user_id
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

CREATE POLICY user_subscriptions_insert_own
    ON public.user_subscriptions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- PASO 5: SOLUCIÓN 2 (ALTERNATIVA) - Crear una función que haga bypass de RLS
-- Esta función puede ser llamada desde el webhook para insertar sin restricciones
CREATE OR REPLACE FUNCTION public.insert_user_subscription(
    p_user_id UUID,
    p_stripe_customer_id TEXT,
    p_stripe_subscription_id TEXT,
    p_plan TEXT,
    p_is_premium BOOLEAN,
    p_status TEXT,
    p_current_period_start TIMESTAMP WITH TIME ZONE,
    p_current_period_end TIMESTAMP WITH TIME ZONE,
    p_cancel_at_period_end BOOLEAN DEFAULT false,
    p_canceled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Esto permite que la función se ejecute con los privilegios del creador
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.user_subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan,
        is_premium,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        canceled_at
    ) VALUES (
        p_user_id,
        p_stripe_customer_id,
        p_stripe_subscription_id,
        p_plan,
        p_is_premium,
        p_status,
        p_current_period_start,
        p_current_period_end,
        p_cancel_at_period_end,
        p_canceled_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        plan = EXCLUDED.plan,
        is_premium = EXCLUDED.is_premium,
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        canceled_at = EXCLUDED.canceled_at,
        updated_at = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Otorgar permisos para que service_role pueda llamar esta función
GRANT EXECUTE ON FUNCTION public.insert_user_subscription TO service_role;

-- PASO 6: Verificar que todo esté correcto
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ SELECT'
        WHEN cmd = 'INSERT' THEN '✅ INSERT'
        WHEN cmd = 'UPDATE' THEN '✅ UPDATE'
        ELSE cmd
    END as operacion
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions'
ORDER BY cmd;

-- Verificar que la función existe
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'insert_user_subscription';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. service_role DEBERÍA hacer bypass de RLS automáticamente
-- 2. Si el problema persiste, puede ser un problema con la clave
-- 3. La función insert_user_subscription puede usarse como alternativa
-- 4. Verificar que SUPABASE_SERVICE_ROLE_KEY esté configurada correctamente en Vercel

