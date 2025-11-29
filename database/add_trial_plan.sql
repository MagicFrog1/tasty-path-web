-- =====================================================
-- ACTUALIZAR TABLA PARA INCLUIR PLAN 'trial'
-- =====================================================
-- Este script actualiza la tabla user_subscriptions
-- para permitir el plan 'trial' además de weekly, monthly y annual

-- Eliminar el constraint existente
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_check;

-- Agregar el nuevo constraint con 'trial'
ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_check 
CHECK (plan IN ('trial', 'weekly', 'monthly', 'annual'));

-- Verificar que se aplicó correctamente
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.user_subscriptions'::regclass
AND conname = 'user_subscriptions_plan_check';

