import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Obtener API key de OpenAI de las variables de entorno
    const apiKey = process.env.VITE_OPENAI_API_KEY || 
                   process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                   process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key de OpenAI no configurada en el servidor' 
      });
    }

    if (!apiKey.startsWith('sk-')) {
      return res.status(500).json({ 
        error: 'API key de OpenAI tiene formato incorrecto. Debe empezar con "sk-".' 
      });
    }
    
    // Obtener el body de la solicitud
    const { model, messages, temperature, max_tokens } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'messages array es requerido' 
      });
    }

    // Configuración para OpenAI
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    const requestBody = {
      model: model || 'gpt-4o-mini',
      messages: messages,
      temperature: temperature || 0.2,
      max_tokens: max_tokens || 8000
    };

    // Hacer la solicitud a la API de OpenAI
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en API de OpenAI:', errorText);
      return res.status(response.status).json({ 
        error: `Error en API de OpenAI: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    // Devolver respuesta de OpenAI directamente
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('Error en generate-menu:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

