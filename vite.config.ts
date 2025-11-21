import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno con múltiples prefijos
  // Priorizar NEXT_PUBLIC_* (Vercel) sobre VITE_* (desarrollo local)
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  
  // Preparar variables para definir
  const defineVars = {};
  
  // Obtener valores (priorizar NEXT_PUBLIC_* sobre VITE_*)
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  
  // Exponer variables NEXT_PUBLIC_* primero
  if (env.NEXT_PUBLIC_SUPABASE_URL) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
    // También exponer como VITE_* para compatibilidad
    defineVars['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL);
  } else if (env.VITE_SUPABASE_URL) {
    defineVars['import.meta.env.VITE_SUPABASE_URL'] = JSON.stringify(env.VITE_SUPABASE_URL);
  }
  
  if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    // También exponer como VITE_* para compatibilidad
    defineVars['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  } else if (env.VITE_SUPABASE_ANON_KEY) {
    defineVars['import.meta.env.VITE_SUPABASE_ANON_KEY'] = JSON.stringify(env.VITE_SUPABASE_ANON_KEY);
  }
  
  // También exponer como variables directas para acceso fácil
  if (supabaseUrl) {
    defineVars['import.meta.env.SUPABASE_URL'] = JSON.stringify(supabaseUrl);
  }
  if (supabaseAnonKey) {
    defineVars['import.meta.env.SUPABASE_ANON_KEY'] = JSON.stringify(supabaseAnonKey);
  }
  
  // ===== STRIPE CONFIGURATION =====
  // En Vercel las variables están como: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_PRICE_WEEKLY, etc.
  // Acceder a process.env directamente para variables sin prefijo (STRIPE_PRICE_*)
  const stripePublishableKey = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                                env.VITE_STRIPE_PUBLISHABLE_KEY || 
                                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                                process.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  
  const stripePriceWeekly = process.env.STRIPE_PRICE_WEEKLY || 
                            env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || 
                            env.VITE_STRIPE_PRICE_WEEKLY || '';
  
  const stripePriceMonthly = process.env.STRIPE_PRICE_MONTHLY || 
                              env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 
                              env.VITE_STRIPE_PRICE_MONTHLY || '';
  
  const stripePriceAnnual = process.env.STRIPE_PRICE_ANNUAL || 
                            env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 
                            env.VITE_STRIPE_PRICE_ANNUAL || '';
  
  // Exponer NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    const key = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(key);
    // También exponer como VITE_* y sin prefijo para compatibilidad
    defineVars['import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(key);
    defineVars['import.meta.env.STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(key);
  } else if (env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    const key = env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY;
    defineVars['import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(key);
    defineVars['import.meta.env.STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(key);
  }
  
  // Exponer STRIPE_PRICE_WEEKLY (sin prefijo, como está en Vercel)
  if (process.env.STRIPE_PRICE_WEEKLY) {
    defineVars['import.meta.env.STRIPE_PRICE_WEEKLY'] = JSON.stringify(process.env.STRIPE_PRICE_WEEKLY);
    // También exponer como VITE_* y NEXT_PUBLIC_* para compatibilidad
    defineVars['import.meta.env.VITE_STRIPE_PRICE_WEEKLY'] = JSON.stringify(process.env.STRIPE_PRICE_WEEKLY);
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY'] = JSON.stringify(process.env.STRIPE_PRICE_WEEKLY);
  } else if (env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY) {
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY);
    defineVars['import.meta.env.VITE_STRIPE_PRICE_WEEKLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY);
    defineVars['import.meta.env.STRIPE_PRICE_WEEKLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY);
  } else if (env.VITE_STRIPE_PRICE_WEEKLY) {
    defineVars['import.meta.env.VITE_STRIPE_PRICE_WEEKLY'] = JSON.stringify(env.VITE_STRIPE_PRICE_WEEKLY);
    defineVars['import.meta.env.STRIPE_PRICE_WEEKLY'] = JSON.stringify(env.VITE_STRIPE_PRICE_WEEKLY);
  }
  
  // Exponer STRIPE_PRICE_MONTHLY (sin prefijo, como está en Vercel)
  if (process.env.STRIPE_PRICE_MONTHLY) {
    defineVars['import.meta.env.STRIPE_PRICE_MONTHLY'] = JSON.stringify(process.env.STRIPE_PRICE_MONTHLY);
    // También exponer como VITE_* y NEXT_PUBLIC_* para compatibilidad
    defineVars['import.meta.env.VITE_STRIPE_PRICE_MONTHLY'] = JSON.stringify(process.env.STRIPE_PRICE_MONTHLY);
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY'] = JSON.stringify(process.env.STRIPE_PRICE_MONTHLY);
  } else if (env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) {
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
    defineVars['import.meta.env.VITE_STRIPE_PRICE_MONTHLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
    defineVars['import.meta.env.STRIPE_PRICE_MONTHLY'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
  } else if (env.VITE_STRIPE_PRICE_MONTHLY) {
    defineVars['import.meta.env.VITE_STRIPE_PRICE_MONTHLY'] = JSON.stringify(env.VITE_STRIPE_PRICE_MONTHLY);
    defineVars['import.meta.env.STRIPE_PRICE_MONTHLY'] = JSON.stringify(env.VITE_STRIPE_PRICE_MONTHLY);
  }
  
  // Exponer STRIPE_PRICE_ANNUAL (sin prefijo, como está en Vercel)
  if (process.env.STRIPE_PRICE_ANNUAL) {
    defineVars['import.meta.env.STRIPE_PRICE_ANNUAL'] = JSON.stringify(process.env.STRIPE_PRICE_ANNUAL);
    // También exponer como VITE_* y NEXT_PUBLIC_* para compatibilidad
    defineVars['import.meta.env.VITE_STRIPE_PRICE_ANNUAL'] = JSON.stringify(process.env.STRIPE_PRICE_ANNUAL);
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL'] = JSON.stringify(process.env.STRIPE_PRICE_ANNUAL);
  } else if (env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL) {
    defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL);
    defineVars['import.meta.env.VITE_STRIPE_PRICE_ANNUAL'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL);
    defineVars['import.meta.env.STRIPE_PRICE_ANNUAL'] = JSON.stringify(env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL);
  } else if (env.VITE_STRIPE_PRICE_ANNUAL) {
    defineVars['import.meta.env.VITE_STRIPE_PRICE_ANNUAL'] = JSON.stringify(env.VITE_STRIPE_PRICE_ANNUAL);
    defineVars['import.meta.env.STRIPE_PRICE_ANNUAL'] = JSON.stringify(env.VITE_STRIPE_PRICE_ANNUAL);
  }
  
  // Log durante build (solo en desarrollo)
  if (mode === 'development') {
    console.log('🔧 Vite Config - Variables de entorno cargadas:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
    console.log('  - VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '✓' : '✗');
    console.log('  - VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗');
    console.log('🔧 Stripe Configuration:');
    console.log('  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', (env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) ? '✓' : '✗');
    console.log('  - STRIPE_PRICE_WEEKLY:', (process.env.STRIPE_PRICE_WEEKLY || env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY) ? '✓' : '✗');
    console.log('  - STRIPE_PRICE_MONTHLY:', (process.env.STRIPE_PRICE_MONTHLY || env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY) ? '✓' : '✗');
    console.log('  - STRIPE_PRICE_ANNUAL:', (process.env.STRIPE_PRICE_ANNUAL || env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL) ? '✓' : '✗');
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    // Exponer variables de entorno - Vite solo expone VITE_* por defecto
    // Usamos define para exponer NEXT_PUBLIC_* y STRIPE_* manualmente
    envPrefix: 'VITE_',
    // Definir variables para acceso en el código
    define: defineVars,
  };
});





