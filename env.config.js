// Función helper para obtener variables de entorno de múltiples formas
function getEnvVar(varName) {
  // Intentar acceder desde import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Intentar con prefijo VITE_
    if (import.meta.env[`VITE_${varName}`]) {
      return import.meta.env[`VITE_${varName}`];
    }
    // Intentar con prefijo NEXT_PUBLIC_
    if (import.meta.env[`NEXT_PUBLIC_${varName}`]) {
      return import.meta.env[`NEXT_PUBLIC_${varName}`];
    }
    // Intentar sin prefijo (puede estar definido en define de vite.config)
    if (import.meta.env[varName]) {
      return import.meta.env[varName];
    }
  }
  
  // Intentar acceder desde window (si está disponible en runtime)
  if (typeof window !== 'undefined' && window.__ENV__) {
    if (window.__ENV__[`NEXT_PUBLIC_${varName}`]) {
      return window.__ENV__[`NEXT_PUBLIC_${varName}`];
    }
    if (window.__ENV__[`VITE_${varName}`]) {
      return window.__ENV__[`VITE_${varName}`];
    }
  }
  
  return null;
}

// Configuración de variables de entorno para TastyPath
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
                'https://mxpxmdpydstdbhzxnxgm.supabase.co',
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY') || 
                     import.meta?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                     import.meta?.env?.VITE_SUPABASE_ANON_KEY || 
                     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cHhtZHB5ZHN0ZGJoenhueGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjQwMDQsImV4cCI6MjA3MzIwMDAwNH0.tK1WnB28V2a9py7QVsw5p30hVtoMMyu7euE45Y8eaP4',
  
  // RevenueCat Configuration
  REVENUECAT_PUBLIC_KEY: import.meta?.env?.VITE_REVENUECAT_PUBLIC_KEY || 'appl_bFgSiUsYrPmowOiuWqFDcwskepz',
  
  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || import.meta?.env?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_PRICE_WEEKLY: import.meta?.env?.VITE_STRIPE_PRICE_WEEKLY || import.meta?.env?.STRIPE_PRICE_WEEKLY || '',
  STRIPE_PRICE_MONTHLY: import.meta?.env?.VITE_STRIPE_PRICE_MONTHLY || import.meta?.env?.STRIPE_PRICE_MONTHLY || '',
  STRIPE_PRICE_ANNUAL: import.meta?.env?.VITE_STRIPE_PRICE_ANNUAL || import.meta?.env?.STRIPE_PRICE_ANNUAL || '',
  
  // App Configuration
  APP_NAME: 'TastyPath',
  APP_VERSION: '1.0.0',
};

// Función para obtener la configuración
export const getConfig = () => ENV_CONFIG;
