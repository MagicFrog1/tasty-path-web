-- =====================================================
-- FIX RLS INSERT POLICY - Permitir crear perfil después de signUp
-- =====================================================
-- Este script corrige la política RLS para permitir que los usuarios
-- recién registrados puedan crear su perfil inmediatamente

-- IMPORTANTE: Ejecutar este script en Supabase SQL Editor

-- =====================================================
-- 1. Verificar que la tabla existe y tiene el formato correcto
-- =====================================================

-- Verificar el tipo de la columna id
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'id';

-- =====================================================
-- 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_self" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.user_profiles;

-- =====================================================
-- 3. CREAR POLÍTICAS RLS MEJORADAS
-- =====================================================

-- Política para SELECT: usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Política para UPDATE: usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- Política para INSERT: usuarios pueden insertar su propio perfil
-- Esta política permite INSERT cuando:
-- 1. El usuario está autenticado (auth.uid() no es null)
-- 2. El id del perfil coincide exactamente con auth.uid()
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid()::text = id::text
    );

-- =====================================================
-- 4. VERIFICAR POLÍTICAS CREADAS
-- =====================================================
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
    AND tablename = 'user_profiles'
ORDER BY policyname;

-- =====================================================
-- 5. TEST: Verificar que auth.uid() funciona
-- =====================================================
-- Esta consulta debe retornar el UUID del usuario autenticado
-- Ejecutar después de autenticarse en Supabase Dashboard
SELECT auth.uid() as current_user_id;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. El campo 'id' debe ser de tipo UUID (no TEXT)
-- 2. La comparación usa ::text para asegurar compatibilidad
-- 3. La política INSERT verifica que auth.uid() no sea NULL
-- 4. Si el error persiste, verifica:
--    - Que el usuario esté autenticado (tiene sesión activa)
--    - Que el id enviado coincida exactamente con auth.uid()
--    - Que la tabla user_profiles tenga RLS habilitado

