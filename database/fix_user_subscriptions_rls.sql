-- =====================================================
-- FIX RLS POLICIES PARA user_subscriptions
-- =====================================================
-- Este script asegura que el webhook pueda INSERT y UPDATE
-- usando service_role (que hace bypass de RLS)
-- Pero también permite que los usuarios vean sus propias suscripciones

-- IMPORTANTE: El webhook usa SUPABASE_SERVICE_ROLE_KEY que hace bypass de RLS
-- Estas políticas son solo para cuando los usuarios acceden directamente

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions'
ORDER BY policyname;

-- Eliminar políticas existentes si es necesario
DROP POLICY IF EXISTS user_subscriptions_select_own ON public.user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_update_own ON public.user_subscriptions;
DROP POLICY IF EXISTS user_subscriptions_insert_own ON public.user_subscriptions;

-- Política para SELECT: usuarios pueden ver su propia suscripción
CREATE POLICY user_subscriptions_select_own
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para UPDATE: usuarios pueden actualizar su propia suscripción
CREATE POLICY user_subscriptions_update_own
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para INSERT: usuarios pueden crear su propia suscripción
-- (Aunque normalmente esto lo hace el webhook con service_role)
CREATE POLICY user_subscriptions_insert_own
    ON public.user_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Verificar que las políticas estén creadas
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

-- NOTA IMPORTANTE:
-- El webhook usa SUPABASE_SERVICE_ROLE_KEY que hace bypass completo de RLS
-- Estas políticas solo aplican cuando los usuarios acceden directamente desde el cliente
-- El webhook puede INSERT/UPDATE sin restricciones gracias a service_role

