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
  // PRIORIDAD: VITE_* (Vite expone automáticamente) > NEXT_PUBLIC_* (fallback) > sin prefijo (legacy)
  // En Vercel, process.env tiene acceso a todas las variables durante el build
  const stripePublishableKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                                env.VITE_STRIPE_PUBLISHABLE_KEY ||
                                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                                env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  
  // Variables de precio: Priorizar VITE_* (Vite expone automáticamente)
  const stripePriceWeekly = process.env.VITE_STRIPE_PRICE_WEEKLY || 
                            env.VITE_STRIPE_PRICE_WEEKLY ||
                            process.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || 
                            env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY ||
                            process.env.STRIPE_PRICE_WEEKLY || '';
  
  const stripePriceMonthly = process.env.VITE_STRIPE_PRICE_MONTHLY || 
                              env.VITE_STRIPE_PRICE_MONTHLY ||
                              process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 
                              env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ||
                              process.env.STRIPE_PRICE_MONTHLY || '';
  
  const stripePriceAnnual = process.env.VITE_STRIPE_PRICE_ANNUAL || 
                            env.VITE_STRIPE_PRICE_ANNUAL ||
                            process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 
                            env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ||
                            process.env.STRIPE_PRICE_ANNUAL || '';
  
  // Exponer variables de Stripe
  // PRIORIDAD: VITE_* (Vite expone automáticamente) > NEXT_PUBLIC_* (fallback) > sin prefijo (legacy)
  // SIEMPRE exponer, incluso si está vacío (para debugging)
  defineVars['import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(stripePublishableKey || '');
  defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(stripePublishableKey || '');
  defineVars['import.meta.env.STRIPE_PUBLISHABLE_KEY'] = JSON.stringify(stripePublishableKey || '');
  
  defineVars['import.meta.env.VITE_STRIPE_PRICE_WEEKLY'] = JSON.stringify(stripePriceWeekly || '');
  defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY'] = JSON.stringify(stripePriceWeekly || '');
  defineVars['import.meta.env.STRIPE_PRICE_WEEKLY'] = JSON.stringify(stripePriceWeekly || ''); // Legacy
  
  defineVars['import.meta.env.VITE_STRIPE_PRICE_MONTHLY'] = JSON.stringify(stripePriceMonthly || '');
  defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY'] = JSON.stringify(stripePriceMonthly || '');
  defineVars['import.meta.env.STRIPE_PRICE_MONTHLY'] = JSON.stringify(stripePriceMonthly || ''); // Legacy
  
  defineVars['import.meta.env.VITE_STRIPE_PRICE_ANNUAL'] = JSON.stringify(stripePriceAnnual || '');
  defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL'] = JSON.stringify(stripePriceAnnual || '');
  defineVars['import.meta.env.STRIPE_PRICE_ANNUAL'] = JSON.stringify(stripePriceAnnual || ''); // Legacy
  
  if (!stripePublishableKey || !stripePriceWeekly || !stripePriceMonthly || !stripePriceAnnual) {
    // Log de advertencia si no se encuentran
    console.warn('⚠️ Variables de Stripe no encontradas durante el build');
    console.warn('  - VITE_STRIPE_PUBLISHABLE_KEY:', process.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✓' : '✗');
    console.warn('  - VITE_STRIPE_PRICE_WEEKLY:', process.env.VITE_STRIPE_PRICE_WEEKLY ? '✓' : '✗');
    console.warn('  - VITE_STRIPE_PRICE_MONTHLY:', process.env.VITE_STRIPE_PRICE_MONTHLY ? '✓' : '✗');
    console.warn('  - VITE_STRIPE_PRICE_ANNUAL:', process.env.VITE_STRIPE_PRICE_ANNUAL ? '✓' : '✗');
    console.warn('  - Todas las variables process.env disponibles:', Object.keys(process.env).filter(k => k.includes('STRIPE')).join(', ') || 'NINGUNA');
  }
  
  // Log durante build (tanto en desarrollo como en producción para debugging)
  console.log('🔧 Vite Config - Variables de entorno cargadas:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗');
  console.log('🔧 Stripe Configuration durante BUILD:');
  console.log('  - process.env.VITE_STRIPE_PUBLISHABLE_KEY:', process.env.VITE_STRIPE_PUBLISHABLE_KEY ? `${String(process.env.VITE_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO');
  console.log('  - env.VITE_STRIPE_PUBLISHABLE_KEY:', env.VITE_STRIPE_PUBLISHABLE_KEY ? `${String(env.VITE_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO');
  console.log('  - stripePublishableKey (resultado final):', stripePublishableKey ? `${String(stripePublishableKey).substring(0, 20)}...` : 'NO ENCONTRADO');
  console.log('  - process.env.VITE_STRIPE_PRICE_WEEKLY:', process.env.VITE_STRIPE_PRICE_WEEKLY || 'NO ENCONTRADO');
  console.log('  - process.env.VITE_STRIPE_PRICE_MONTHLY:', process.env.VITE_STRIPE_PRICE_MONTHLY || 'NO ENCONTRADO');
  console.log('  - process.env.VITE_STRIPE_PRICE_ANNUAL:', process.env.VITE_STRIPE_PRICE_ANNUAL || 'NO ENCONTRADO');
  console.log('  - stripePriceWeekly (resultado final):', stripePriceWeekly || 'NO ENCONTRADO');
  console.log('  - stripePriceMonthly (resultado final):', stripePriceMonthly || 'NO ENCONTRADO');
  console.log('  - stripePriceAnnual (resultado final):', stripePriceAnnual || 'NO ENCONTRADO');
  console.log('🔧 Variables que se expondrán en defineVars:');
  console.log('  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', !!defineVars['import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] ? '✓' : '✗');
  console.log('  - STRIPE_PRICE_WEEKLY:', !!defineVars['import.meta.env.STRIPE_PRICE_WEEKLY'] ? '✓' : '✗');
  console.log('  - STRIPE_PRICE_MONTHLY:', !!defineVars['import.meta.env.STRIPE_PRICE_MONTHLY'] ? '✓' : '✗');
  console.log('  - STRIPE_PRICE_ANNUAL:', !!defineVars['import.meta.env.STRIPE_PRICE_ANNUAL'] ? '✓' : '✗');
  
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





