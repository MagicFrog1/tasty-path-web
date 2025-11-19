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
    MAX_RETRIES: 3,
    TIMEOUT_MS: 45000, // 45 segundos para mejor respuesta
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
  const isConfigured = !!(apiKey && 
                         apiKey !== 'your-openai-api-key' && 
                         apiKey.length > 0 &&
                         apiKey.startsWith('sk-'));
  
  console.log('🔧 Verificando configuración de IA:');
  console.log('🔑 API Key presente:', !!apiKey);
  console.log('🔑 API Key válida:', isConfigured);
  console.log('🔑 Longitud de API Key:', apiKey?.length || 0);
  console.log('🔑 Empieza con sk-:', apiKey?.startsWith('sk-') || false);
  
  if (!isConfigured) {
    console.warn('⚠️ API Key de OpenAI no configurada correctamente.');
    console.warn('💡 Para configurarla en Vercel:');
    console.warn('   1. Ve a Settings → Environment Variables');
    console.warn('   2. Agrega: VITE_OPENAI_API_KEY = sk-tu-clave-aqui');
    console.warn('   3. Redespliega la aplicación');
    console.warn('📖 Ver VERCEL_CONFIG.md para más detalles');
  }
  
  return isConfigured;
};

// Función para obtener la configuración de IA
export const getAIConfig = () => {
  return AI_CONFIG;
};
