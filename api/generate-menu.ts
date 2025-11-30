import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight (OPTIONS) primero
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST después de manejar OPTIONS
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 generate-menu - Request recibido:', {
      method: req.method,
      hasBody: !!req.body,
    });

    // Obtener API key de OpenAI de las variables de entorno
    const apiKey = process.env.OPENAI_API_KEY ||
                   process.env.VITE_OPENAI_API_KEY || 
                   process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    console.log('🔍 Verificando API key de OpenAI en el servidor:', {
      OPENAI_API_KEY_present: !!process.env.OPENAI_API_KEY,
      VITE_OPENAI_API_KEY_present: !!process.env.VITE_OPENAI_API_KEY,
      NEXT_PUBLIC_OPENAI_API_KEY_present: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      key_final_present: !!apiKey,
      keyLength: apiKey?.length || 0,
      startsWithSk: apiKey?.startsWith('sk-') || false,
    });

    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY no configurada en el servidor');
      return res.status(401).json({ 
        error: 'API key de OpenAI no configurada en el servidor. Por favor, configura OPENAI_API_KEY en Vercel (Settings > Environment Variables).' 
      });
    }

    if (!apiKey.startsWith('sk-')) {
      console.error('❌ OPENAI_API_KEY tiene formato incorrecto');
      return res.status(401).json({ 
        error: 'API key de OpenAI tiene formato incorrecto. Debe empezar con "sk-".' 
      });
    }
    
    console.log('✅ API key de OpenAI encontrada y validada correctamente');
    
    // Obtener el body de la solicitud
    const { prompt, model, temperature, max_tokens } = req.body;

    console.log('📥 generate-menu - Request recibido:', {
      model: model || 'gpt-4o-mini',
    });

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }
    
    // Construir el array de mensajes desde el prompt
    const messages = [
      {
        role: 'system',
        content: 'Eres un chef experto que crea menús semanales. CRÍTICO: Debes responder ÚNICAMENTE con JSON válido y completo. El JSON debe estar perfectamente formateado, sin errores de sintaxis, con todas las llaves y corchetes cerrados correctamente. NO incluyas texto adicional antes o después del JSON. El JSON debe comenzar con { y terminar con }. Verifica que todos los arrays estén cerrados con ] y todos los objetos con }.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const openaiUrl = process.env.OPENAI_API_URL ||
                     process.env.VITE_OPENAI_API_URL ||
                     process.env.NEXT_PUBLIC_OPENAI_API_URL ||
                     'https://api.openai.com/v1/chat/completions';

    console.log('🔄 Enviando solicitud a OpenAI...');
    console.log('🔗 URL:', openaiUrl);
    console.log('🤖 Modelo:', model || 'gpt-4o-mini');

    const requestBody = {
      model: model || 'gpt-4o-mini',
      messages: messages,
      temperature: temperature !== undefined ? temperature : 0.2,
      max_tokens: max_tokens !== undefined ? max_tokens : 8000,
    };

    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Respuesta de OpenAI recibida:', {
      status: openaiResponse.status,
      statusText: openaiResponse.statusText,
    });

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

    const data = await openaiResponse.json();

    console.log('✅ Respuesta de OpenAI procesada exitosamente');

    return res.status(200).json({
      success: true,
      choices: data.choices,
      usage: data.usage,
    });

  } catch (error: any) {
    console.error('Error en generate-menu:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

