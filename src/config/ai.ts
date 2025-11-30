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
  
  console.log('🔧 Verificando configuración de IA (OpenAI):');
  console.log('🔑 API Key presente:', hasApiKey);
  console.log('🔑 No es placeholder:', notPlaceholder);
  console.log('🔑 Formato válido (sk- para OpenAI):', validFormat);
  console.log('🔑 Longitud suficiente (>=20):', minLength);
  console.log('🔑 Longitud de API Key:', apiKey?.length || 0);
  console.log('🔑 Prefijo:', apiKey?.substring(0, 10) || 'N/A');
  console.log('✅ Configuración completa:', isConfigured);
  
  if (!isConfigured) {
    console.error('❌ API Key de OpenAI no configurada correctamente.');
    console.error('💡 Para configurarla en Vercel:');
    console.error('   1. Ve a Settings → Environment Variables');
    console.error('   2. Agrega: VITE_OPENAI_API_KEY = sk-tu-clave-aqui');
    console.error('   3. O usa: NEXT_PUBLIC_OPENAI_API_KEY (ambos funcionan)');
    console.error('   4. Redespliega la aplicación');
    console.error('📖 Ver DIAGNOSTICO_FALLBACK_IA.md para más detalles');
  }
  
  return isConfigured;
};

// Función para obtener la configuración de IA
export const getAIConfig = () => {
  return AI_CONFIG;
};
