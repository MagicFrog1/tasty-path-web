import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Función serverless genérica para llamadas a OpenAI API
 * La API key se mantiene segura en el servidor usando process.env.OPENAI_API_KEY
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obtener API key de OpenAI SOLO desde process.env (nunca del cliente)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key no configurada en el servidor. Por favor, configura OPENAI_API_KEY en Vercel (Settings > Environment Variables).' 
      });
    }

    if (!apiKey.startsWith('sk-')) {
      return res.status(500).json({ 
        error: 'OpenAI API key tiene formato incorrecto. Debe empezar con "sk-".' 
      });
    }

    // Obtener parámetros del body
    const { messages, model, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere "messages" como array en el body' });
    }

    // URL de OpenAI API
    const openaiUrl = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';

    // Preparar request body
    const requestBody = {
      model: model || 'gpt-4o-mini',
      messages,
      temperature: temperature !== undefined ? temperature : 0.7,
      max_tokens: max_tokens !== undefined ? max_tokens : 4000,
    };

    // Llamar a OpenAI API
    const openaiResponse = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      
      let errorMessage = 'Error al procesar la solicitud con OpenAI.';

      if (openaiResponse.status === 401) {
        const openaiErrorMsg = errorData.error?.message || 'Unknown error';
        if (openaiErrorMsg.includes('Invalid API key') || openaiErrorMsg.includes('Incorrect API key')) {
          errorMessage = 'La API key de OpenAI no es válida. Por favor, verifica que OPENAI_API_KEY esté configurada correctamente en Vercel.';
        } else if (openaiErrorMsg.includes('expired')) {
          errorMessage = 'La API key de OpenAI ha expirado. Por favor, genera una nueva API key en OpenAI y actualiza OPENAI_API_KEY en Vercel.';
        } else {
          errorMessage = `Error de autenticación con OpenAI: ${openaiErrorMsg}`;
        }
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

    return res.status(200).json({
      success: true,
      choices: data.choices,
      usage: data.usage,
      model: data.model,
    });

  } catch (error: any) {
    console.error('Error en api/openai:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

