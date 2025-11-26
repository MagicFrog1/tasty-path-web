export const DATABASE_CONFIG = {
  SUPABASE_URL: 'https://hxkelpowmwtrgoticajg.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a2VscG93bXd0cmdvdGljYWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTYwMzUsImV4cCI6MjA3MTk5MjAzNX0.EIumGUBdNeT0gTYx2YajSLDEaL9gfMku8i4CazI_3Qc',
  DIRECT_CONNECTION: 'postgresql://postgres:[SamuelDC28.]@db.hxkelpowmwtrgoticajg.supabase.co:5432/postgres'
};

export const DATABASE_TABLES = {
  USER_PROFILES: 'user_profiles',
  USER_DIET_CONFIGS: 'user_diet_configs',
  WEEKLY_PLANS: 'weekly_plans',
  SHOPPING_ITEMS: 'shopping_items'
};

export const DATABASE_SCHEMA = {
  PUBLIC: 'public'
};

// Configuración de políticas de seguridad RLS (Row Level Security)
export const RLS_POLICIES = {
  // Política para perfiles de usuario: solo el usuario puede ver/editar su propio perfil
  USER_PROFILES: `
    CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);
    
    CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);
    
    CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);
  `,
  
  // Política para configuración de dieta: solo el usuario puede ver/editar su configuración
  USER_DIET_CONFIGS: `
    CREATE POLICY "Users can view own diet config" ON user_diet_configs
    FOR SELECT USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can update own diet config" ON user_diet_configs
    FOR UPDATE USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can insert own diet config" ON user_diet_configs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
  `,
  
  // Política para planes semanales: solo el usuario puede ver/editar sus planes
  WEEKLY_PLANS: `
    CREATE POLICY "Users can view own weekly plans" ON weekly_plans
    FOR SELECT USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can update own weekly plans" ON weekly_plans
    FOR UPDATE USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can insert own weekly plans" ON weekly_plans
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can delete own weekly plans" ON weekly_plans
    FOR DELETE USING (auth.uid()::text = user_id::text);
  `,
  
  // Política para lista de compras: solo el usuario puede ver/editar sus items
  SHOPPING_ITEMS: `
    CREATE POLICY "Users can view own shopping items" ON shopping_items
    FOR SELECT USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can update own shopping items" ON shopping_items
    FOR UPDATE USING (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can insert own shopping items" ON shopping_items
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
    
    CREATE POLICY "Users can delete own shopping items" ON shopping_items
    FOR DELETE USING (auth.uid()::text = user_id::text);
  `
};

// Configuración de índices para optimizar consultas
export const DATABASE_INDEXES = {
  USER_PROFILES: [
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);',
    'CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);'
  ],
  USER_DIET_CONFIGS: [
    'CREATE INDEX IF NOT EXISTS idx_user_diet_configs_user_id ON user_diet_configs(user_id);'
  ],
  WEEKLY_PLANS: [
    'CREATE INDEX IF NOT EXISTS idx_weekly_plans_user_id ON weekly_plans(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_weekly_plans_status ON weekly_plans(status);',
    'CREATE INDEX IF NOT EXISTS idx_weekly_plans_created_at ON weekly_plans(created_at);'
  ],
  SHOPPING_ITEMS: [
    'CREATE INDEX IF NOT EXISTS idx_shopping_items_user_id ON shopping_items(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_shopping_items_plan_id ON shopping_items(plan_id);',
    'CREATE INDEX IF NOT EXISTS idx_shopping_items_category ON shopping_items(category);',
    'CREATE INDEX IF NOT EXISTS idx_shopping_items_is_checked ON shopping_items(is_checked);'
  ]
};
