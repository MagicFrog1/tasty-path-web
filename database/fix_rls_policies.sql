-- =====================================================
-- FIX RLS POLICIES - Resolver error 401 al crear perfiles
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor
-- Este script corrige las políticas RLS para permitir
-- que los usuarios recién registrados puedan crear sus perfiles

-- 1. Asegurar que RLS esté habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hay (opcional, comentado para seguridad)
-- DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
-- DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
-- DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
-- DROP POLICY IF EXISTS "user_profiles_insert_self" ON public.user_profiles;

-- 3. Crear políticas que permitan INSERT inmediatamente después de signUp
-- Política para SELECT: usuarios pueden ver su propio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'user_profiles_select_own'
  ) THEN
    CREATE POLICY user_profiles_select_own
      ON public.user_profiles
      FOR SELECT
      USING (auth.uid()::text = id::text);
  END IF;
END $$;

-- Política para UPDATE: usuarios pueden actualizar su propio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'user_profiles_update_own'
  ) THEN
    CREATE POLICY user_profiles_update_own
      ON public.user_profiles
      FOR UPDATE
      USING (auth.uid()::text = id::text)
      WITH CHECK (auth.uid()::text = id::text);
  END IF;
END $$;

-- Política para INSERT: usuarios pueden insertar su propio perfil
-- IMPORTANTE: Esta política permite que un usuario cree su perfil
-- siempre que el id coincida con auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'user_profiles_insert_self'
  ) THEN
    CREATE POLICY user_profiles_insert_self
      ON public.user_profiles
      FOR INSERT
      WITH CHECK (auth.uid()::text = id::text);
  END IF;
END $$;

-- 4. Verificar que las políticas están activas
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
WHERE schemaname = 'public' AND tablename = 'user_profiles'
ORDER BY policyname;

-- 5. NOTA IMPORTANTE:
-- Si después de ejecutar este script sigues teniendo error 401,
-- verifica:
-- 1. Que la sesión esté establecida después de signUp (el código ahora lo verifica)
-- 2. Que el campo 'id' en user_profiles sea de tipo TEXT o UUID y coincida exactamente con auth.uid()
-- 3. Que no haya otras políticas conflictivas
-- 4. Verifica en Supabase Dashboard → Authentication → Policies que las políticas están activas

