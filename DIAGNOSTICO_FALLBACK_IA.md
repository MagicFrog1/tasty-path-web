# 🔍 Diagnóstico: Generación de Plan Semanal usando Fallback

## Problema

El sistema está generando planes semanales usando el método de fallback en lugar de usar la IA de OpenAI.

## Posibles Causas

### 1. API Key no configurada ❌

**Síntoma:** El log muestra "⚠️ IA no configurada correctamente, usando fallback local..."

**Solución:**
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega:
   - **Key:** `NEXT_PUBLIC_OPENAI_API_KEY`
   - **Value:** `sk-tu-clave-aqui` (tu clave de OpenAI)
   - **Environment:** Production, Preview, Development (marca todas)
5. Haz un nuevo deploy

### 2. API Key con formato incorrecto ❌

**Síntoma:** El log muestra "❌ API Key no tiene el formato correcto"

**Solución:**
- La API key debe empezar con `sk-`
- Asegúrate de copiar la clave completa sin espacios adicionales

### 3. Error en la llamada a la API ❌

**Síntoma:** El log muestra errores de red o de respuesta de la API

**Solución:**
- Verifica que la API key sea válida en [OpenAI Platform](https://platform.openai.com)
- Verifica que tengas créditos disponibles
- Verifica que el modelo `gpt-4o-mini` esté disponible para tu cuenta

### 4. Respuesta JSON inválida ❌

**Síntoma:** El log muestra "⚠️ La IA no generó exactamente 7 días" o "⚠️ Algunos días no tienen la estructura correcta"

**Solución:**
- Este es un problema temporal de la IA
- El sistema debería reintentar automáticamente
- Si persiste, puede ser un problema con el prompt o el modelo

## Cómo Diagnosticar

### Paso 1: Revisar los Logs en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Logs**
4. Filtra por "generación" o "IA"
5. Busca mensajes que empiecen con:
   - `🔧 Verificando configuración de IA`
   - `⚠️ IA no configurada`
   - `❌ ERROR CRÍTICO`
   - `🔄 Usando fallback local`

### Paso 2: Verificar Variables de Entorno

Ejecuta en la consola del navegador (F12):

```javascript
console.log('API Key configurada:', !!window.__ENV__?.NEXT_PUBLIC_OPENAI_API_KEY);
```

O en los logs de Vercel, busca:
```
🔧 Estado de configuración de IA: {
  configured: true/false,
  apiKeyPresent: true/false,
  ...
}
```

### Paso 3: Verificar la API Key directamente

La API key debería estar visible en los logs (solo los primeros caracteres por seguridad):

```
🔑 API Key presente: true
🔑 API Key longitud: 51
🔑 API Key empieza con sk-: true
```

## Variables de Entorno Requeridas

### En Vercel (Producción)

```
NEXT_PUBLIC_OPENAI_API_KEY=sk-tu-clave-aqui
```

**Importante:** 
- Usa `NEXT_PUBLIC_` como prefijo para que se exponga al cliente
- La API key debe empezar con `sk-`
- Configura en todos los ambientes (Production, Preview, Development)

### En Desarrollo Local (.env)

```
VITE_OPENAI_API_KEY=sk-tu-clave-aqui
```

## Verificación Post-Configuración

Después de configurar la API key:

1. **Haz un nuevo deploy** en Vercel
2. **Limpia el caché** del navegador
3. **Intenta generar un nuevo plan**
4. **Revisa los logs** para confirmar que la IA está funcionando

## Mensajes de Éxito

Cuando la IA está funcionando correctamente, deberías ver:

```
✅ IA configurada correctamente, procediendo con generación...
✅ Respuesta recibida de la IA, parseando JSON...
✅ Menú generado exitosamente por IA con 7 días completos
✅ RESULTADO FINAL: ÉXITO CON IA
```

## Mensajes de Error Comunes

### Error 1: API Key no configurada
```
⚠️ IA no configurada correctamente, usando fallback local...
🔍 Razón: API Key no válida o no configurada
💡 Verifica que NEXT_PUBLIC_OPENAI_API_KEY esté configurada en Vercel
```
**Solución:** Configura la variable de entorno como se explica arriba.

### Error 2: Error de red
```
❌ Error en la API: 401 - Unauthorized
```
**Solución:** La API key es inválida o expiró. Genera una nueva en OpenAI.

### Error 3: Sin créditos
```
❌ Error en la API: 429 - Rate limit exceeded
```
**Solución:** Agrega créditos a tu cuenta de OpenAI.

### Error 4: JSON inválido
```
⚠️ La IA no generó exactamente 7 días, usando fallback local
```
**Solución:** El sistema reintentará automáticamente. Si persiste, puede ser un problema temporal.

## Contacto

Si el problema persiste después de verificar todo lo anterior, revisa:
1. Los logs completos en Vercel
2. El estado de tu cuenta en OpenAI Platform
3. Los límites de uso de tu API key

---

**Última actualización:** 2025-11-29




