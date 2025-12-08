// Configuración para servicios de IA
import { ENV_CONFIG } from '../../env.config';

export const AI_CONFIG = {
  // OpenAI API Configuration - Usar configuración de env.config.js
  OPENAI_API_KEY: ENV_CONFIG.OPENAI_API_KEY,
  OPENAI_MODEL: ENV_CONFIG.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_MAX_TOKENS: 6000,
  OPENAI_TEMPERATURE: 0.9,
  
  // URLs de las APIs
  OPENAI_BASE_URL: ENV_CONFIG.OPENAI_API_URL,
  
  // Configuración de menús
  MENU_GENERATION: {
    MAX_RETRIES: 5, // Aumentado a 5 reintentos para asegurar éxito
    TIMEOUT_MS: 180000, // 3 minutos para dar más tiempo a la IA
    FALLBACK_ENABLED: false, // DESHABILITADO - Forzar uso de IA
  },
  
  // Preferencias de cocina por defecto
  DEFAULT_CUISINE_PREFERENCES: [
    'mediterránea',
    'asiática', 
    'mexicana',
    'italiana',
    'francesa',
    'india',
    'griega',
    'japonesa'
  ],
  
  // Restricciones dietéticas por defecto
  DEFAULT_DIETARY_PREFERENCES: [
    'saludable',
    'equilibrado',
    'bajo en sodio',
    'rico en fibra',
    'alto en proteínas'
  ],
  
  // Alergias comunes
  COMMON_ALLERGIES: [
    'gluten',
    'lactosa',
    'frutos secos',
    'mariscos',
    'huevos',
    'soja'
  ]
};

// Función para verificar si la configuración de IA está completa
export const isAIConfigured = (): boolean => {
  const apiKey = AI_CONFIG.OPENAI_API_KEY;
  
  // Verificaciones para API key de OpenAI
  const hasApiKey = !!apiKey && apiKey.length > 0;
  const notPlaceholder = apiKey !== 'your-openai-api-key' && apiKey !== '';
  const validFormat = apiKey?.startsWith('sk-') || apiKey?.startsWith('sk-proj-');
  const minLength = apiKey && apiKey.length >= 20;
  
  const isConfigured = hasApiKey && notPlaceholder && validFormat && minLength;
  
  // La API key ya no se expone al cliente - todas las llamadas van a /api/openai
  // La verificación de configuración se hace en el servidor
  if (!isConfigured) {
    console.warn('⚠️ La configuración de IA no está completa, pero las llamadas se harán a través de /api/openai');
  }
  
  return isConfigured;
};

// Función para obtener la configuración de IA
export const getAIConfig = () => {
  return AI_CONFIG;
};
