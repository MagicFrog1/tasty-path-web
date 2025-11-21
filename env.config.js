// Función helper para obtener variables de entorno de múltiples formas
// PRIORIDAD: NEXT_PUBLIC_* (Vercel) > VITE_* (desarrollo local) > valores por defecto
function getEnvVar(varName, spanishName = null) {
  // Intentar acceder desde import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // PRIORIDAD 1: Intentar con prefijo NEXT_PUBLIC_* (lo que tienes en Vercel)
    if (import.meta.env[`NEXT_PUBLIC_${varName}`]) {
      return import.meta.env[`NEXT_PUBLIC_${varName}`];
    }
    // PRIORIDAD 2: Intentar con nombre en español (Vercel)
    if (spanishName && import.meta.env[spanishName]) {
      return import.meta.env[spanishName];
    }
    // PRIORIDAD 3: Intentar con prefijo VITE_* (desarrollo local)
    if (import.meta.env[`VITE_${varName}`]) {
      return import.meta.env[`VITE_${varName}`];
    }
    // PRIORIDAD 4: Intentar sin prefijo (puede estar definido en define de vite.config)
    if (import.meta.env[varName]) {
      return import.meta.env[varName];
    }
  }
  
  // Intentar acceder desde window (si está disponible en runtime)
  if (typeof window !== 'undefined' && window.__ENV__) {
    // PRIORIDAD 1: NEXT_PUBLIC_* en Vercel
    if (window.__ENV__[`NEXT_PUBLIC_${varName}`]) {
      return window.__ENV__[`NEXT_PUBLIC_${varName}`];
    }
    // PRIORIDAD 2: Nombre en español (Vercel)
    if (spanishName && window.__ENV__[spanishName]) {
      return window.__ENV__[spanishName];
    }
    // PRIORIDAD 3: VITE_* como fallback
    if (window.__ENV__[`VITE_${varName}`]) {
      return window.__ENV__[`VITE_${varName}`];
    }
    // PRIORIDAD 4: Sin prefijo
    if (window.__ENV__[varName]) {
      return window.__ENV__[varName];
    }
  }
  
  return null;
}

// Configuración de variables de entorno para TastyPath
// Log de depuración al cargar (solo en desarrollo o cuando faltan variables)
if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
  const env = import.meta.env;
  console.log('🔧 ENV_CONFIG - Variables de Stripe disponibles en import.meta.env:', {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
    STRIPE_PUBLISHABLE_KEY: !!env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_PRICE_WEEKLY: !!env.STRIPE_PRICE_WEEKLY,
    STRIPE_PRICE_MONTHLY: !!env.STRIPE_PRICE_MONTHLY,
    STRIPE_PRICE_ANNUAL: !!env.STRIPE_PRICE_ANNUAL,
  });
}

export const ENV_CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY') || import.meta?.env?.VITE_OPENAI_API_KEY || '',
  
  // API Configuration
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_MODEL: 'gpt-4o-mini',
  
  // Supabase Configuration
  // Priorizar NEXT_PUBLIC_* (lo que tienes en Vercel) sobre VITE_*
  SUPABASE_URL: getEnvVar('SUPABASE_URL') || 
                import.meta?.env?.NEXT_PUBLIC_SUPABASE_URL || 
                import.meta?.env?.VITE_SUPABASE_URL || 
                'https://zftqkqnjpjnmwfwsmxdy.supabase.co',
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY') || 
                     import.meta?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                     import.meta?.env?.VITE_SUPABASE_ANON_KEY || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmdHFrcW5qcGpubXdmd3NteGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2Mzc1MDgsImV4cCI6MjA3OTIxMzUwOH0.508D-ThuIWMsS9---T9OF1I2q4_cvbJX2H95D7S99jE',
  
  // RevenueCat Configuration
  REVENUECAT_PUBLIC_KEY: import.meta?.env?.VITE_REVENUECAT_PUBLIC_KEY || 'appl_bFgSiUsYrPmowOiuWqFDcwskepz',
  
  // Stripe Configuration
  // Buscar en múltiples formatos: Vercel (PRECIO_*_DE_STRIPE), Vite (VITE_*), y sin prefijo
  STRIPE_PUBLISHABLE_KEY: (() => {
    const value = getEnvVar('STRIPE_PUBLISHABLE_KEY') || 
                  import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                  import.meta?.env?.PRECIO_PUBLICO_DE_STRIPE || '';
    if (typeof window !== 'undefined' && !value) {
      console.warn('🔍 STRIPE_PUBLISHABLE_KEY no encontrada. Valores disponibles:', {
        getEnvVar: getEnvVar('STRIPE_PUBLISHABLE_KEY'),
        VITE_STRIPE_PUBLISHABLE_KEY: !!import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!import.meta?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_PUBLISHABLE_KEY: !!import.meta?.env?.STRIPE_PUBLISHABLE_KEY,
      });
    }
    return value;
  })(),
  STRIPE_PRICE_WEEKLY: (() => {
    const value = getEnvVar('STRIPE_PRICE_WEEKLY', 'PRECIO_SEMANAL_DE_STRIPE') || 
                  import.meta?.env?.VITE_STRIPE_PRICE_WEEKLY || 
                  import.meta?.env?.STRIPE_PRICE_WEEKLY || 
                  import.meta?.env?.PRECIO_SEMANAL_DE_STRIPE || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || '';
    return value;
  })(),
  STRIPE_PRICE_MONTHLY: (() => {
    const value = getEnvVar('STRIPE_PRICE_MONTHLY', 'PRECIO_MENSUAL_DE_STRIPE') || 
                  import.meta?.env?.VITE_STRIPE_PRICE_MONTHLY || 
                  import.meta?.env?.STRIPE_PRICE_MONTHLY || 
                  import.meta?.env?.PRECIO_MENSUAL_DE_STRIPE || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || '';
    return value;
  })(),
  STRIPE_PRICE_ANNUAL: (() => {
    const value = getEnvVar('STRIPE_PRICE_ANNUAL', 'PRECIO_ANUAL_DE_STRIPE') || 
                  import.meta?.env?.VITE_STRIPE_PRICE_ANNUAL || 
                  import.meta?.env?.STRIPE_PRICE_ANNUAL || 
                  import.meta?.env?.PRECIO_ANUAL_DE_STRIPE || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || '';
    return value;
  })(),
  
  // App Configuration
  APP_NAME: 'TastyPath',
  APP_VERSION: '1.0.0',
};

// Función para obtener la configuración
export const getConfig = () => ENV_CONFIG;
