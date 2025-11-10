-- Add subscription_plan column to public.user_profiles and (optionally) update RLS policies
-- Run this in Supabase SQL editor or via psql against your project

-- 1) Add column (nullable), constrain allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('weekly','monthly','annual'));
  END IF;
END $$;

-- 2) Ensure RLS is enabled (harmless if already enabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3) Create minimal policies (only if not already present) so users can see/update their own subscription fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'user_profiles_select_own'
  ) THEN
    CREATE POLICY user_profiles_select_own
      ON public.user_profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'user_profiles_update_own'
  ) THEN
    CREATE POLICY user_profiles_update_own
      ON public.user_profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'user_profiles_insert_self'
  ) THEN
    CREATE POLICY user_profiles_insert_self
      ON public.user_profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4) (Optional) Backfill: set subscription_plan based on your own business rules
-- UPDATE public.user_profiles SET subscription_plan = 'monthly' WHERE is_premium = true AND subscription_plan IS NULL;

-- 5) Grant to anon/service roles if needed (Supabase usually manages grants)
-- GRANT SELECT, UPDATE ON public.user_profiles TO anon;
-- GRANT SELECT, UPDATE, INSERT ON public.user_profiles TO authenticated;


