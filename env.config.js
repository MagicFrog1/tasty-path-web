// Configuración de variables de entorno para TastyPath
export const ENV_CONFIG = {
  // OpenAI API Configuration
  OPENAI_API_KEY: import.meta?.env?.VITE_OPENAI_API_KEY || 'your-openai-api-key',
  
  // API Configuration
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  OPENAI_MODEL: 'gpt-4o-mini',
  
  // RevenueCat Configuration
  REVENUECAT_PUBLIC_KEY: 'appl_bFgSiUsYrPmowOiuWqFDcwskepz',
  
  // App Configuration
  APP_NAME: 'TastyPath',
  APP_VERSION: '1.0.0',
};

// Función para obtener la configuración
export const getConfig = () => ENV_CONFIG;
