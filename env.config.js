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
// Log de depuración al cargar (siempre, para debugging)
if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
  const env = import.meta.env;
  // Usar JSON.stringify para asegurar que se muestren valores reales
  // PRIORIDAD: VITE_* (Vite expone automáticamente)
  const logData = {
    VITE_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY ? `${String(env.VITE_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `${String(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO',
    VITE_STRIPE_PRICE_WEEKLY: env.VITE_STRIPE_PRICE_WEEKLY || 'NO ENCONTRADO',
    VITE_STRIPE_PRICE_MONTHLY: env.VITE_STRIPE_PRICE_MONTHLY || 'NO ENCONTRADO',
    VITE_STRIPE_PRICE_ANNUAL: env.VITE_STRIPE_PRICE_ANNUAL || 'NO ENCONTRADO',
  };
  console.log('🔧 ENV_CONFIG - Variables de Stripe disponibles en import.meta.env:', JSON.stringify(logData, null, 2));
}

export const ENV_CONFIG = {
  // OpenAI API Configuration
  // Priorizar NEXT_PUBLIC_* (Vercel) sobre VITE_* (desarrollo local)
  OPENAI_API_KEY: (() => {
    // PRIORIDAD 1: NEXT_PUBLIC_OPENAI_API_KEY (Vercel)
    if (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_OPENAI_API_KEY) {
      return import.meta.env.NEXT_PUBLIC_OPENAI_API_KEY;
    }
    // PRIORIDAD 2: VITE_OPENAI_API_KEY (desarrollo local)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY;
    }
    // PRIORIDAD 3: getEnvVar (busca en múltiples lugares)
    const fromGetEnvVar = getEnvVar('OPENAI_API_KEY');
    if (fromGetEnvVar) {
      return fromGetEnvVar;
    }
    return '';
  })(),
  
  // NutriChat API Key (específica para el chat de nutrición)
  // Configurar en Vercel como VITE_NUTRICHAT_API_KEY o NEXT_PUBLIC_NUTRICHAT_API_KEY
  // IMPORTANTE: En Vercel, las variables VITE_* no se exponen automáticamente, usar NEXT_PUBLIC_*
  NUTRICHAT_API_KEY: (() => {
    // Prioridad 1: NEXT_PUBLIC_* (funciona en Vercel)
    if (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_NUTRICHAT_API_KEY) {
      return import.meta.env.NEXT_PUBLIC_NUTRICHAT_API_KEY;
    }
    // Prioridad 2: VITE_* (funciona en desarrollo local)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NUTRICHAT_API_KEY) {
      return import.meta.env.VITE_NUTRICHAT_API_KEY;
    }
    // Prioridad 3: getEnvVar (busca en múltiples lugares)
    const fromGetEnvVar = getEnvVar('NUTRICHAT_API_KEY');
    if (fromGetEnvVar) {
      return fromGetEnvVar;
    }
    return '';
  })(),
  
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
  // En Vercel la variable se llama NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  // Priorizar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY directamente (como está en Vercel)
  STRIPE_PUBLISHABLE_KEY: (() => {
    // PRIORIDAD 1: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (como está en Vercel)
    const value = import.meta?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
                  import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || '';
    if (typeof window !== 'undefined' && !value) {
      const env = import.meta?.env || {};
      console.warn('🔍 STRIPE_PUBLISHABLE_KEY no encontrada. Valores disponibles:', {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `${String(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO',
        VITE_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY ? `${String(env.VITE_STRIPE_PUBLISHABLE_KEY).substring(0, 20)}...` : 'NO ENCONTRADO',
      });
    }
    return value;
  })(),
  // PRIORIDAD: VITE_* (Vite expone automáticamente) > NEXT_PUBLIC_* (fallback) > sin prefijo (legacy)
  STRIPE_PRICE_WEEKLY: (() => {
    const value = import.meta?.env?.VITE_STRIPE_PRICE_WEEKLY || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_WEEKLY || 
                  import.meta?.env?.STRIPE_PRICE_WEEKLY || '';
    return value;
  })(),
  STRIPE_PRICE_MONTHLY: (() => {
    const value = import.meta?.env?.VITE_STRIPE_PRICE_MONTHLY || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || 
                  import.meta?.env?.STRIPE_PRICE_MONTHLY || '';
    return value;
  })(),
  STRIPE_PRICE_ANNUAL: (() => {
    const value = import.meta?.env?.VITE_STRIPE_PRICE_ANNUAL || 
                  import.meta?.env?.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL || 
                  import.meta?.env?.STRIPE_PRICE_ANNUAL || '';
    return value;
  })(),
  
  // App Configuration
  APP_NAME: 'TastyPath',
  APP_VERSION: '1.0.0',
};

// Función para obtener la configuración
export const getConfig = () => ENV_CONFIG;
