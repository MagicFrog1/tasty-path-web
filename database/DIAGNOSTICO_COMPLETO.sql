-- =====================================================
-- DIAGNÓSTICO COMPLETO - Verificar estado de RLS
-- =====================================================
-- Ejecutar este script primero para ver el estado actual

-- =====================================================
-- PASO 1: Verificar que la tabla existe y el tipo de dato
-- =====================================================
SELECT 
    'Tabla user_profiles' as verificación,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'id';

-- Resultado esperado: id | uuid | NO
-- ✅ Si ves esto, el tipo de dato está correcto


-- =====================================================
-- PASO 2: Verificar si RLS está habilitado
-- =====================================================
SELECT 
    'RLS habilitado' as verificación,
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles';

-- Resultado esperado: rowsecurity = true
-- ❌ Si es false, RLS NO está habilitado (necesitas ejecutar el fix)


-- =====================================================
-- PASO 3: Ver TODAS las políticas actuales de user_profiles
-- =====================================================
SELECT 
    'Políticas existentes' as verificación,
    policyname,
    cmd as operación,
    permissive,
    roles,
    CASE 
        WHEN qual IS NULL THEN 'N/A'
        ELSE qual
    END as condición_select,
    CASE 
        WHEN with_check IS NULL THEN 'N/A'
        ELSE with_check
    END as condición_insert_update
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_profiles'
ORDER BY policyname;

-- Deberías ver 3 políticas:
-- 1. users_select_own (SELECT)
-- 2. users_insert_own (INSERT) ← Esta es crítica
-- 3. users_update_own (UPDATE)
-- ❌ Si no ves estas políticas o ves menos de 3, necesitas ejecutar el fix


-- =====================================================
-- PASO 4: Verificar que auth.uid() funciona
-- =====================================================
-- Esta consulta solo funciona si estás autenticado en Supabase
SELECT 
    'auth.uid() disponible' as verificación,
    auth.uid() as user_id,
    auth.role() as user_role;

-- Si retorna NULL, significa que no estás autenticado
-- Pero esto no afecta las políticas RLS, solo es informativo


-- =====================================================
-- RESULTADO DEL DIAGNÓSTICO:
-- =====================================================
-- ✅ Si todo está correcto, deberías ver:
--    1. Tabla con id UUID
--    2. RLS habilitado (rowsecurity = true)
--    3. 3 políticas creadas (users_select_own, users_insert_own, users_update_own)
--
-- ❌ Si algo falta:
--    - Ejecuta el script: database/fix_rls_simple.sql
--    - Ese script creará/modi ficará todo lo necesario

