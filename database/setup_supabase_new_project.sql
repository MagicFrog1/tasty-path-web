-- =====================================================
-- SETUP COMPLETO PARA NUEVO PROYECTO SUPABASE
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor
-- Este script crea la tabla user_profiles y configura las políticas RLS

-- =====================================================
-- 1. CREAR TABLA user_profiles (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    member_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    weight NUMERIC(5,2),
    height NUMERIC(5,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    subscription_plan TEXT CHECK (subscription_plan IN ('weekly', 'monthly', 'annual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON public.user_profiles(created_at);

-- =====================================================
-- 2. HABILITAR RLS (Row Level Security)
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_self" ON public.user_profiles;

-- =====================================================
-- 4. CREAR POLÍTICAS RLS
-- =====================================================

-- Política para SELECT: usuarios pueden ver su propio perfil
CREATE POLICY user_profiles_select_own
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política para UPDATE: usuarios pueden actualizar su propio perfil
CREATE POLICY user_profiles_update_own
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para INSERT: usuarios pueden insertar su propio perfil
-- IMPORTANTE: Esta política permite que un usuario cree su perfil
-- inmediatamente después de signUp siempre que el id coincida con auth.uid()
CREATE POLICY user_profiles_insert_self
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- 5. CREAR TABLA user_diet_configs (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_diet_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    goals TEXT[] DEFAULT '{}',
    dietary_preferences TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    weekly_budget NUMERIC(10,2) DEFAULT 0,
    cooking_time_weekdays INTEGER DEFAULT 30,
    cooking_time_weekends INTEGER DEFAULT 60,
    meal_count_breakfast BOOLEAN DEFAULT true,
    meal_count_lunch BOOLEAN DEFAULT true,
    meal_count_dinner BOOLEAN DEFAULT true,
    meal_count_snacks BOOLEAN DEFAULT false,
    special_requirements TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_diet_configs_user_id ON public.user_diet_configs(user_id);

-- Habilitar RLS para user_diet_configs
ALTER TABLE public.user_diet_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_diet_configs
DROP POLICY IF EXISTS "Users can view own diet config" ON public.user_diet_configs;
DROP POLICY IF EXISTS "Users can update own diet config" ON public.user_diet_configs;
DROP POLICY IF EXISTS "Users can insert own diet config" ON public.user_diet_configs;

CREATE POLICY "Users can view own diet config"
    ON public.user_diet_configs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own diet config"
    ON public.user_diet_configs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet config"
    ON public.user_diet_configs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. CREAR TABLA weekly_plans (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_meals INTEGER DEFAULT 0,
    total_calories INTEGER DEFAULT 0,
    total_cost NUMERIC(10,2) DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'completed', 'draft')) DEFAULT 'draft',
    nutrition_goals_protein NUMERIC(5,2),
    nutrition_goals_carbs NUMERIC(5,2),
    nutrition_goals_fat NUMERIC(5,2),
    nutrition_goals_fiber NUMERIC(5,2),
    progress_completed_meals INTEGER DEFAULT 0,
    progress_total_meals INTEGER DEFAULT 0,
    progress_percentage NUMERIC(5,2) DEFAULT 0,
    config JSONB,
    meals JSONB,
    estimated_calories INTEGER,
    nutrition_advice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON public.weekly_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_status ON public.weekly_plans(status);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_created_at ON public.weekly_plans(created_at);

-- Habilitar RLS para weekly_plans
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para weekly_plans
DROP POLICY IF EXISTS "Users can view own weekly plans" ON public.weekly_plans;
DROP POLICY IF EXISTS "Users can update own weekly plans" ON public.weekly_plans;
DROP POLICY IF EXISTS "Users can insert own weekly plans" ON public.weekly_plans;
DROP POLICY IF EXISTS "Users can delete own weekly plans" ON public.weekly_plans;

CREATE POLICY "Users can view own weekly plans"
    ON public.weekly_plans
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly plans"
    ON public.weekly_plans
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly plans"
    ON public.weekly_plans
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly plans"
    ON public.weekly_plans
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 7. CREAR TABLA shopping_items (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.weekly_plans(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT NOT NULL,
    price NUMERIC(10,2) DEFAULT 0,
    estimated_price NUMERIC(10,2),
    is_checked BOOLEAN DEFAULT false,
    notes TEXT,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON public.shopping_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_plan_id ON public.shopping_items(plan_id);
CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON public.shopping_items(category);
CREATE INDEX IF NOT EXISTS idx_shopping_items_is_checked ON public.shopping_items(is_checked);

-- Habilitar RLS para shopping_items
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para shopping_items
DROP POLICY IF EXISTS "Users can view own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can update own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can insert own shopping items" ON public.shopping_items;
DROP POLICY IF EXISTS "Users can delete own shopping items" ON public.shopping_items;

CREATE POLICY "Users can view own shopping items"
    ON public.shopping_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping items"
    ON public.shopping_items
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping items"
    ON public.shopping_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping items"
    ON public.shopping_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 8. VERIFICAR QUE TODO ESTÉ CONFIGURADO CORRECTAMENTE
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
    AND tablename IN ('user_profiles', 'user_diet_configs', 'weekly_plans', 'shopping_items')
ORDER BY tablename, policyname;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- 1. El campo 'id' en user_profiles debe ser de tipo UUID
-- 2. El campo debe coincidir exactamente con auth.uid() (que también es UUID)
-- 3. Las políticas RLS están configuradas para permitir que los usuarios
--    creen, vean, actualicen y eliminen solo sus propios datos
-- 4. Si después de ejecutar este script sigues teniendo error 401,
--    verifica:
--    - Que la sesión esté establecida después de signUp
--    - Que el código esté enviando el id correcto (debe ser UUID, no texto)
--    - Que no haya conflictos con otras políticas

