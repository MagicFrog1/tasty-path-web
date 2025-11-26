-- =====================================================
-- FIX RLS - Script Simple y Directo
-- =====================================================
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- Este script corrige las políticas RLS para permitir INSERT

-- PASO 1: Eliminar TODAS las políticas existentes de user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_self" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;

-- PASO 2: Asegurar que RLS esté habilitado
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear política para SELECT (usuarios ven su propio perfil)
-- Comparar directamente UUID = UUID (sin conversión a texto)
CREATE POLICY "users_select_own"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- PASO 4: Crear política para INSERT (usuarios pueden crear su perfil)
-- IMPORTANTE: Permite INSERT cuando el id coincide con auth.uid()
-- Comparar directamente UUID = UUID (sin conversión a texto)
CREATE POLICY "users_insert_own"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- PASO 5: Crear política para UPDATE (usuarios pueden actualizar su perfil)
-- Comparar directamente UUID = UUID (sin conversión a texto)
CREATE POLICY "users_update_own"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- PASO 6: Verificar las políticas creadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
ORDER BY policyname;

-- PASO 7: Verificar el tipo de dato del campo id
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'id';

-- =====================================================
-- Si el campo 'id' NO es UUID, ejecuta esto:
-- =====================================================
-- ALTER TABLE public.user_profiles 
--   ALTER COLUMN id TYPE UUID USING id::uuid;

