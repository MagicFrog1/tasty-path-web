# 🔑 Guía: Dónde está guardada la API Key de OpenAI

## 📍 Ubicación de la API Key

La API key de OpenAI **NO está guardada en el código fuente** por seguridad. Se almacena en **Variables de Entorno en Vercel**.

## 🔍 Dónde se busca la API Key

### En el Backend (API Endpoints - Vercel Serverless Functions)

Los endpoints `/api/nutrichat` y `/api/generate-menu` buscan la API key en este orden:

1. `OPENAI_API_KEY` ⭐ **RECOMENDADO**
2. `VITE_OPENAI_API_KEY`
3. `NEXT_PUBLIC_OPENAI_API_KEY`

**Archivos que la usan:**
- `api/nutrichat.ts` - Línea 38-43
- `api/generate-menu.ts` - Línea 29-31

### En el Frontend (Código del Cliente)

El frontend **NO debe tener acceso directo** a la API key por seguridad. En su lugar:

- `src/config/ai.ts` - Lee de `ENV_CONFIG.OPENAI_API_KEY`
- `env.config.js` - Busca en `import.meta.env.VITE_OPENAI_API_KEY` o `import.meta.env.NEXT_PUBLIC_OPENAI_API_KEY`

**⚠️ IMPORTANTE:** El frontend solo puede leer variables que empiecen con `VITE_` o `NEXT_PUBLIC_`, pero **NO se recomienda** exponer la API key en el frontend. Por eso usamos endpoints API como proxy.

## 🛠️ Cómo Configurar la API Key en Vercel

### Paso 1: Obtener tu API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión en tu cuenta de OpenAI
3. Crea una nueva API key o copia una existente
4. La key debe empezar con `sk-` o `sk-proj-`

### Paso 2: Configurar en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `tasty-path-web`
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **Add New**
5. Configura:

   **Nombre:** `OPENAI_API_KEY`
   
   **Valor:** `sk-tu-api-key-aqui` (pega tu API key completa)
   
   **Environments:** ✅ Production, ✅ Preview, ✅ Development
   
6. Haz clic en **Save**

### Paso 3: Redesplegar

Después de agregar la variable:
- Vercel debería redesplegar automáticamente
- O puedes ir a **Deployments** → **Redeploy** manualmente

## 📋 Variables de Entorno Requeridas

Para que todo funcione correctamente, necesitas estas variables en Vercel:

### Obligatorias:

1. **`OPENAI_API_KEY`** ⭐
   - API key de OpenAI (empieza con `sk-`)
   - Usada por: `/api/nutrichat` y `/api/generate-menu`

2. **`SUPABASE_URL`**
   - URL de tu proyecto Supabase
   - Ejemplo: `https://xxxxx.supabase.co`

3. **`SUPABASE_ANON_KEY`**
   - Anon key de Supabase (para el frontend)

4. **`SUPABASE_SERVICE_ROLE_KEY`** ⭐ (Para NutriChat)
   - Service Role Key de Supabase (para verificar tokens JWT)
   - Se encuentra en: Supabase Dashboard → Settings → API → Service Role Key

### Opcionales (pero recomendadas):

- `VITE_OPENAI_API_KEY` - Fallback para frontend (no recomendado exponer)
- `NEXT_PUBLIC_OPENAI_API_KEY` - Fallback para frontend (no recomendado exponer)

## 🔒 Seguridad

### ✅ Lo que está bien:

- Guardar la API key en variables de entorno de Vercel
- Usar endpoints API como proxy (no exponer la key al frontend)
- Verificar autenticación antes de usar la API

### ❌ Lo que NO debes hacer:

- ❌ Guardar la API key directamente en el código
- ❌ Hacer commit de la API key a Git
- ❌ Exponer la API key en el frontend (variables `VITE_` o `NEXT_PUBLIC_`)

## 🧪 Verificar que está configurada

### En los logs de Vercel:

Cuando uses NutriChat o generes un menú, verás en los logs:

```
✅ API key de OpenAI encontrada y validada correctamente
```

Si no está configurada:

```
❌ OPENAI_API_KEY no configurada en el servidor
```

### En el código:

El archivo `src/config/ai.ts` tiene una función `isAIConfigured()` que verifica si la key está disponible.

## 📝 Resumen

| Ubicación | Variable | Prioridad | Uso |
|-----------|----------|-----------|-----|
| Vercel Environment Variables | `OPENAI_API_KEY` | ⭐ Alta | Backend (API endpoints) |
| Vercel Environment Variables | `VITE_OPENAI_API_KEY` | Media | Frontend (fallback) |
| Vercel Environment Variables | `NEXT_PUBLIC_OPENAI_API_KEY` | Baja | Frontend (fallback) |

**Recomendación:** Usa solo `OPENAI_API_KEY` en Vercel para el backend. No expongas la key en el frontend.

