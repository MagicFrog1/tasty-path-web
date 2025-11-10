// Script de prueba para verificar la configuración de IA
const { ENV_CONFIG } = require('./env.config.js');

console.log('🔧 Verificando configuración de IA...');
console.log('🔑 API Key presente:', !!ENV_CONFIG.OPENAI_API_KEY);
console.log('🔑 API Key longitud:', ENV_CONFIG.OPENAI_API_KEY?.length || 0);
console.log('🔑 API Key empieza con sk-:', ENV_CONFIG.OPENAI_API_KEY?.startsWith('sk-') || false);
console.log('🔑 API Key NO es placeholder:', ENV_CONFIG.OPENAI_API_KEY !== 'your-openai-api-key');
console.log('🌐 Base URL:', ENV_CONFIG.OPENAI_API_URL);
console.log('🤖 Modelo:', ENV_CONFIG.OPENAI_MODEL);

// Función para verificar si la configuración de IA está completa
const isAIConfigured = () => {
  const apiKey = ENV_CONFIG.OPENAI_API_KEY;
  const isConfigured = !!(apiKey && 
                         apiKey !== 'your-openai-api-key' && 
                         apiKey.length > 0 &&
                         apiKey.startsWith('sk-'));
  
  console.log('🔧 Verificando configuración de IA:');
  console.log('🔑 API Key presente:', !!apiKey);
  console.log('🔑 API Key válida:', isConfigured);
  console.log('🔑 Longitud de API Key:', apiKey?.length || 0);
  console.log('🔑 Empieza con sk-:', apiKey?.startsWith('sk-') || false);
  
  return isConfigured;
};

const configured = isAIConfigured();
console.log('✅ IA configurada correctamente:', configured);

if (configured) {
  console.log('🎉 La IA debería estar funcionando correctamente');
} else {
  console.log('❌ La IA NO está configurada correctamente');
}

