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
    // Obtener API key de las variables de entorno
    const apiKey = process.env.VITE_OPENAI_API_KEY || 
                   process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                   process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key no configurada en el servidor' 
      });
    }

    // Detectar si es Gemini o OpenAI
    const isGemini = apiKey.startsWith('AIza');
    
    // Obtener el body de la solicitud
    const { model, messages, contents, generationConfig, temperature, max_tokens, maxOutputTokens } = req.body;

    let requestBody: any;
    let apiUrl: string;
    let headers: Record<string, string>;

    if (isGemini) {
      // Configuración para Gemini
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      headers = {
        'Content-Type': 'application/json'
      };
      
      // Si viene contents del cliente, usarlo; si no, construir desde messages
      if (contents) {
        requestBody = {
          contents,
          generationConfig: generationConfig || {
            temperature: temperature || 0.2,
            maxOutputTokens: maxOutputTokens || 8000
          }
        };
      } else {
        // Convertir formato OpenAI a Gemini
        const systemMessage = messages?.find((m: any) => m.role === 'system')?.content || '';
        const userMessage = messages?.find((m: any) => m.role === 'user')?.content || '';
        const combinedText = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;
        
        requestBody = {
          contents: [{
            parts: [{
              text: combinedText
            }]
          }],
          generationConfig: {
            temperature: temperature || 0.2,
            maxOutputTokens: maxOutputTokens || 8000
          }
        };
      }
    } else {
      // Configuración para OpenAI
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      
      requestBody = {
        model: model || 'gpt-4o-mini',
        messages: messages || [],
        temperature: temperature || 0.2,
        max_tokens: max_tokens || 8000
      };
    }

    // Hacer la solicitud a la API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en API de IA:', errorText);
      return res.status(response.status).json({ 
        error: `Error en API de IA: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    // Formatear respuesta según el tipo de API
    let formattedResponse: any;
    
    if (isGemini) {
      // Formato de respuesta de Gemini
      formattedResponse = {
        choices: [{
          message: {
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          }
        }],
        usage: data.usageMetadata,
        model: 'gemini-1.5-flash'
      };
    } else {
      // Formato de respuesta de OpenAI (ya viene en el formato correcto)
      formattedResponse = data;
    }

    return res.status(200).json(formattedResponse);

  } catch (error: any) {
    console.error('Error en generate-menu:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

