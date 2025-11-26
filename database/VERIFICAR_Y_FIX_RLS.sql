-- =====================================================
-- VERIFICAR Y FIX RLS - Ejecutar este script paso a paso
-- =====================================================

-- PASO 1: Verificar que la tabla existe y el campo id es UUID
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'id';

-- Resultado esperado: id | uuid | NO
-- ✅ Si ves esto, el tipo de dato está correcto


-- PASO 2: Verificar si RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- Resultado esperado: rowsecurity = true
-- Si es false, ejecuta: ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;


-- PASO 3: Ver todas las políticas actuales de user_profiles
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
ORDER BY policyname;

-- Si no ves políticas o ves políticas incorrectas, continúa con PASO 4


-- PASO 4: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
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


-- PASO 5: Asegurar que RLS está habilitado
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;


-- PASO 6: Crear política para SELECT (usuarios ven su propio perfil)
CREATE POLICY "users_select_own"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);


-- PASO 7: Crear política para INSERT (usuarios pueden crear su perfil)
-- IMPORTANTE: Esta política permite INSERT cuando el id coincide con auth.uid()
CREATE POLICY "users_insert_own"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);


-- PASO 8: Crear política para UPDATE (usuarios pueden actualizar su perfil)
CREATE POLICY "users_update_own"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- PASO 9: Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
ORDER BY policyname;

-- Deberías ver 3 políticas:
-- 1. users_select_own (SELECT)
-- 2. users_insert_own (INSERT)
-- 3. users_update_own (UPDATE)


-- PASO 10 (OPCIONAL): Probar que auth.uid() funciona
-- Esta consulta debe retornar el UUID del usuario autenticado
-- Solo funciona si estás autenticado en Supabase Dashboard
SELECT auth.uid() as current_user_id, 
       auth.role() as current_role;


-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. El campo 'id' debe ser UUID (ya lo confirmaste ✅)
-- 2. Las políticas comparan auth.uid() = id (ambos UUID)
-- 3. auth.uid() retorna el UUID del usuario autenticado
-- 4. Si el INSERT sigue fallando después de esto:
--    - Verifica que la sesión esté establecida (el código ya lo verifica)
--    - Verifica que el id enviado coincida exactamente con auth.uid()
--    - Verifica que no haya políticas conflictivas

