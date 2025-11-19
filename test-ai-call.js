// Script de prueba para verificar la generación de menús con IA
const { ENV_CONFIG } = require('./env.config.js');

// Simular una solicitud de menú
const testRequest = {
  nutritionGoals: {
    protein: 25,
    carbs: 50,
    fat: 25,
    fiber: 25,
  },
  totalCalories: 2000 * 7, // Calorías totales de la semana
  dietaryPreferences: ['Pérdida de peso', 'Mediterránea'],
  allergies: [],
  cuisinePreferences: ['mediterránea', 'asiática', 'mexicana'],
  cookingTime: { weekdays: 30, weekends: 60 },
  useExoticFruits: false,
  useInternationalSpices: false,
  activityLevel: 'moderate',
  bmi: 22.5,
  weight: 70,
  height: 170,
  age: 30,
  gender: 'male',
};

console.log('🧪 Probando generación de menú con IA...');
console.log('📊 Request de prueba:', JSON.stringify(testRequest, null, 2));

// Función para hacer una llamada de prueba a la API
async function testAICall() {
  try {
    const response = await fetch(ENV_CONFIG.OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV_CONFIG.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ENV_CONFIG.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto nutricionista que genera menús semanales personalizados. Responde SOLO con JSON válido.'
          },
          {
            role: 'user',
            content: `Genera un menú semanal simple para pérdida de peso con dieta mediterránea. 
            Calorías por día: 2000. 
            Responde SOLO con JSON válido en este formato:
            {
              "weeklyMenu": [
                {
                  "dayName": "Lunes",
                  "date": "2024-01-01",
                  "meals": {
                    "breakfast": {
                      "name": "Desayuno",
                      "ingredients": ["ingrediente1", "ingrediente2"],
                      "instructions": "Instrucciones simples"
                    },
                    "lunch": {
                      "name": "Almuerzo",
                      "ingredients": ["ingrediente1", "ingrediente2"],
                      "instructions": "Instrucciones simples"
                    },
                    "dinner": {
                      "name": "Cena",
                      "ingredients": ["ingrediente1", "ingrediente2"],
                      "instructions": "Instrucciones simples"
                    }
                  }
                }
              ]
            }`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log('📊 Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la API:', errorText);
      return;
    }

    const data = await response.json();
    console.log('📦 Datos de respuesta:', {
      choices: data.choices?.length || 0,
      usage: data.usage,
      model: data.model
    });
    
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('❌ No se recibió contenido de la IA');
      return;
    }

    console.log('✅ Respuesta recibida de la IA');
    console.log('📝 Contenido (primeros 500 chars):', content.substring(0, 500));
    
    // Intentar parsear el JSON
    try {
      const jsonData = JSON.parse(content);
      console.log('✅ JSON parseado exitosamente');
      console.log('📅 Días generados:', jsonData.weeklyMenu?.length || 0);
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError.message);
      console.log('📝 Contenido completo:', content);
    }

  } catch (error) {
    console.error('❌ Error en la llamada a la API:', error.message);
  }
}

// Ejecutar la prueba
testAICall();

