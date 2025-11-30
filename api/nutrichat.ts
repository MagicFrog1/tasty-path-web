import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless de Vercel para NutriChat
 * Actúa como proxy entre el frontend y la API de OpenAI para evitar problemas de CORS
 * y mantener la API key segura en el servidor
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS headers para permitir requests desde el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir métodos POST después de manejar OPTIONS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, temperature, max_tokens } = req.body;

    console.log('📥 NutriChat - Request recibido:', {
      messageCount: messages?.length || 0,
      model: model || 'gpt-4o-mini',
    });

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Obtener la API key de OpenAI desde las variables de entorno del servidor
    // Priorizar OPENAI_API_KEY (más común), luego variables específicas de NutriChat
    const openaiApiKey = process.env.OPENAI_API_KEY ||
                        process.env.VITE_OPENAI_API_KEY || 
                        process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
                        process.env.NUTRICHAT_OPENAI_API_KEY ||
                        process.env.VITE_NUTRICHAT_OPENAI_API_KEY ||
                        process.env.NEXT_PUBLIC_NUTRICHAT_OPENAI_API_KEY;

    console.log('🔍 Verificando API key de NutriChat OpenAI en el servidor:', {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY ? `${process.env.VITE_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? `${process.env.NEXT_PUBLIC_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      NUTRICHAT_OPENAI_API_KEY: process.env.NUTRICHAT_OPENAI_API_KEY ? `${process.env.NUTRICHAT_OPENAI_API_KEY.substring(0, 10)}...` : 'NO ENCONTRADO',
      key_final: openaiApiKey ? `${openaiApiKey.substring(0, 10)}...` : 'NO ENCONTRADO',
      hasKey: !!openaiApiKey,
      keyLength: openaiApiKey?.length || 0,
      startsWithSk: openaiApiKey?.startsWith('sk-') || false,
    });

    if (!openaiApiKey) {
      console.error('❌ OPENAI_API_KEY no configurada en el servidor para NutriChat');
      return res.status(401).json({ 
        error: 'OpenAI API key no está configurada en el servidor. Por favor, configura OPENAI_API_KEY en Vercel (Settings > Environment Variables).' 
      });
    }

    if (!openaiApiKey.startsWith('sk-')) {
      console.error('❌ OPENAI_API_KEY tiene formato incorrecto');
      return res.status(401).json({ 
        error: 'OpenAI API key tiene formato incorrecto. Debe empezar con "sk-".' 
      });
    }
    
    console.log('✅ API key de NutriChat encontrada y validada correctamente');

    // URL de la API de OpenAI
    const openaiUrl = process.env.OPENAI_API_URL || 
                     process.env.VITE_OPENAI_API_URL || 
                     process.env.NEXT_PUBLIC_OPENAI_API_URL ||
                     'https://api.openai.com/v1/chat/completions';

    console.log('🔄 Enviando solicitud a OpenAI...');
    console.log('🔗 URL:', openaiUrl);
    console.log('🤖 Modelo:', model || 'gpt-4o-mini');
    console.log('💬 Mensajes:', messages.length);

    // Hacer la llamada a la API de OpenAI
    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages,
        temperature: temperature !== undefined ? temperature : 0.8,
        max_tokens: max_tokens !== undefined ? max_tokens : 600,
      }),
    });

    console.log('📥 Respuesta de OpenAI recibida:', {
      status: openaiResponse.status,
      statusText: openaiResponse.statusText,
    });

    // Manejar errores de OpenAI
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('❌ Error en respuesta de OpenAI:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
      });

      let errorMessage = 'Error al procesar la solicitud con OpenAI.';
      
      if (openaiResponse.status === 401) {
        errorMessage = 'Error de autenticación con OpenAI. La API key no es válida o ha expirado.';
      } else if (openaiResponse.status === 429) {
        errorMessage = 'Demasiadas solicitudes a OpenAI. Por favor, espera un momento e intenta de nuevo.';
      } else if (openaiResponse.status === 500) {
        errorMessage = 'Error en el servidor de OpenAI. Por favor, intenta de nuevo en unos momentos.';
      } else if (errorData.error?.message) {
        errorMessage = `Error de OpenAI: ${errorData.error.message}`;
      }

      return res.status(openaiResponse.status).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorData : undefined
      });
    }

    // Obtener los datos de la respuesta
    const data = await openaiResponse.json();
    
    console.log('✅ Respuesta de OpenAI procesada exitosamente');

    // Devolver la respuesta al frontend
    return res.status(200).json({
      success: true,
      choices: data.choices,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('❌ Error en NutriChat API:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({ 
      error: error.message || 'Error al procesar la solicitud de NutriChat',
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
}

