# Configuración de IA para Generación de Menús

## Descripción

Este proyecto utiliza inteligencia artificial (OpenAI GPT-3.5-turbo) para generar menús semanales personalizados y variados. La IA crea menús completamente diferentes para cada día de la semana, considerando objetivos nutricionales, preferencias dietéticas y variedad culinaria.

## Características de la IA

### 🧠 Generación Inteligente
- **Menús únicos**: Cada día tiene comidas completamente diferentes
- **Variedad culinaria**: Incluye cocina mediterránea, asiática, mexicana, italiana, etc.
- **Personalización**: Se adapta a objetivos nutricionales específicos
- **Ingredientes saludables**: Prioriza alimentos naturales y nutritivos

### 📊 Nutrición Precisa
- Cálculo automático de calorías, proteínas, carbohidratos y grasas
- Distribución equilibrada de macronutrientes
- Consideración de restricciones dietéticas

### 🍳 Recetas Detalladas
- Instrucciones paso a paso de preparación
- Lista completa de ingredientes
- Tiempos de preparación y cocción
- Notas y consejos culinarios

## Configuración

### 1. Obtener API Key de OpenAI

1. Ve a [OpenAI Platform](https://platform.openai.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys" en el dashboard
4. Crea una nueva API key
5. Copia la clave (comienza con `sk-`)

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# OpenAI Configuration
EXPO_PUBLIC_OPENAI_API_KEY=sk-tu-api-key-aqui
```

### 3. Verificar Configuración

La aplicación verificará automáticamente si la IA está configurada. Si no hay API key válida, usará el menú de respaldo local.

## Uso

### Generación Automática
- Los menús se generan automáticamente al crear un nuevo plan semanal
- La IA analiza los objetivos nutricionales del usuario
- Genera 7 días de menús únicos y variados

### Regeneración de Menús
- Botón "Regenerar" para obtener nuevos menús
- Cada regeneración produce combinaciones completamente diferentes
- Mantiene los objetivos nutricionales pero cambia las recetas

### Personalización
- Preferencias de cocina (mediterránea, asiática, etc.)
- Restricciones dietéticas
- Alergias alimentarias
- Objetivos de calorías y macronutrientes

## Estructura de Menús Generados

```typescript
interface DaySchedule {
  date: string;
  dayName: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
  notes?: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface Meal {
  name: string;
  instructions: string;
  ingredients: string[];
  prepTime: number;
  cookingTime?: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
```

## Fallback Local

Si la IA no está disponible o falla:

- **Generación local**: Menús predefinidos con variedad
- **Menús saludables**: Opciones nutritivas y equilibradas
- **Variedad garantizada**: Diferentes combinaciones cada día

## Costos de API

### OpenAI GPT-3.5-turbo
- **Precio**: $0.002 por 1K tokens
- **Uso típico**: ~500-800 tokens por menú semanal
- **Costo estimado**: $0.001-$0.002 por menú generado

### Optimizaciones
- Prompts optimizados para reducir tokens
- Cache de menús generados
- Generación bajo demanda

## Solución de Problemas

### Error: "API key no válida"
- Verifica que la API key esté correctamente configurada
- Asegúrate de que la key tenga saldo disponible
- Verifica que la key no haya expirado

### Error: "Límite de rate excedido"
- La API tiene límites de velocidad
- Espera unos minutos antes de regenerar
- Considera actualizar a un plan de pago

### Error: "Timeout de la API"
- Verifica tu conexión a internet
- La API puede estar lenta, intenta de nuevo
- Usa el menú de respaldo local

## Seguridad

- **API keys**: Nunca se almacenan en el código
- **Variables de entorno**: Configuración segura
- **Datos del usuario**: Solo se envían a OpenAI para generación
- **Sin almacenamiento**: OpenAI no guarda datos de menús

## Futuras Mejoras

- [ ] Soporte para más modelos de IA
- [ ] Generación de listas de compras
- [ ] Adaptación a temporadas y festividades
- [ ] Integración con recetas de usuarios
- [ ] Análisis de costos de ingredientes

## Soporte

Para problemas con la configuración de IA:

1. Verifica la documentación de OpenAI
2. Revisa los logs de la aplicación
3. Confirma que la API key sea válida
4. Verifica el saldo de tu cuenta OpenAI

---

**Nota**: La generación de menús con IA requiere conexión a internet y una API key válida de OpenAI. Sin estos requisitos, la aplicación funcionará con menús locales predefinidos.
