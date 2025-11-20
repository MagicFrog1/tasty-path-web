# Configuración de Vercel para TastyPath

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 1. Supabase Configuration (OBLIGATORIO)

**Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima (anon key) de Supabase

**⚠️ IMPORTANTE:** En Vercel debes usar `NEXT_PUBLIC_*` (no `VITE_*`). El código está configurado para priorizar `NEXT_PUBLIC_*` sobre `VITE_*`.

**Valores por defecto (si no se configuran):**
- URL: `https://zftqkqnjpjnmwfwsmxdy.supabase.co`
- Key: (se usa la key por defecto del código)

**Cómo obtener tus credenciales de Supabase:**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. Navega a **Settings** → **API**
3. Encuentra:
   - **Project URL** → Copia este valor para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Copia este valor para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Cómo configurarlas en Vercel:**

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega las variables:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     - **Value:** `https://tu-proyecto.supabase.co`
     - **Environment:** Todas (Production, Preview, Development)
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu anon key)
     - **Environment:** Todas (Production, Preview, Development)
4. Guarda los cambios
5. **IMPORTANTE:** Redespliega la aplicación

**Nota:** El código busca primero `NEXT_PUBLIC_*`, luego `VITE_*` como fallback, y finalmente usa valores por defecto. En Vercel siempre usa `NEXT_PUBLIC_*`.

### 2. OpenAI API Key

**Variable:** `VITE_OPENAI_API_KEY`

**Valor:** Tu clave de API de OpenAI (debe empezar con `sk-`)

**Cómo configurarla en Vercel:**

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega una nueva variable:
   - **Name:** `VITE_OPENAI_API_KEY`
   - **Value:** `sk-tu-clave-api-aqui`
   - **Environment:** Selecciona todas las opciones (Production, Preview, Development)
4. Guarda los cambios
5. **IMPORTANTE:** Despliega nuevamente la aplicación para que los cambios surtan efecto

**Nota:** La API key debe empezar con `sk-` para que el sistema la reconozca como válida. Si no empieza con `sk-`, la aplicación usará el fallback local en lugar de la IA.

### Verificación

Después de configurar la variable de entorno y desplegar:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña de generar un plan
3. Busca en la consola los mensajes:
   - `🔑 API Key presente: true`
   - `🔑 API Key válida: true`
   - `🔑 Empieza con sk-: true`

Si todos son `true`, la configuración está correcta.

## Problemas Comunes

### La IA no funciona (usa fallback local)

**Síntomas:**
- En la consola aparece: `⚠️ IA no configurada correctamente, usando fallback local...`
- `🔑 API Key válida: false`
- `🔑 Empieza con sk-: false`

**Soluciones:**
1. Verifica que la variable de entorno esté configurada correctamente en Vercel
2. Asegúrate de que el nombre de la variable sea exactamente `VITE_OPENAI_API_KEY` (con el prefijo `VITE_`)
3. Verifica que la API key empiece con `sk-`
4. Redespliega la aplicación después de agregar/modificar la variable

### Errores 404 en imágenes

**Síntomas:**
- `Failed to load resource: the server responded with a status of 404`
- Imágenes no se muestran

**Solución:**
- Las rutas de imágenes con espacios en los nombres han sido corregidas usando `encodeURI()`
- Si persisten los errores, verifica que los archivos existan en la carpeta `assets/`

### Error: "Supabase no está configurado correctamente"

**Síntomas:**
- No puedes iniciar sesión o registrarte
- Errores de autenticación en la consola
- Mensaje: `⚠️ Supabase no está configurado correctamente`

**Soluciones:**
1. Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas en Vercel
2. Asegúrate de que los valores sean correctos (sin espacios extra, URLs completas)
3. Verifica que las credenciales sean de tu proyecto correcto de Supabase
4. Redespliega la aplicación después de agregar/modificar las variables

### Error: "No se pudo iniciar sesión" o "No se pudo crear la cuenta"

**Síntomas:**
- El formulario de login/registro muestra errores
- Los errores aparecen después de intentar autenticarse

**Soluciones:**
1. Verifica que Supabase esté configurado correctamente (ver arriba)
2. Verifica que tu proyecto de Supabase tenga habilitada la autenticación por email
3. Revisa los logs de Supabase en el dashboard para ver errores específicos
4. Asegúrate de que las políticas RLS (Row Level Security) estén configuradas correctamente

## Estructura de Variables de Entorno

```
# Supabase (OBLIGATORIO para autenticación)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI (OBLIGATORIO para generación de menús con IA)
VITE_OPENAI_API_KEY=sk-tu-clave-api-aqui

# RevenueCat (Opcional)
VITE_REVENUECAT_PUBLIC_KEY=appl_tu-clave-aqui
```

**Importante:** Todas las variables de entorno que se usan en el código del cliente (frontend) deben empezar con `VITE_` para que Vite las exponga correctamente.

## Verificación de Configuración

### Verificar Supabase

1. Abre la consola del navegador (F12)
2. Intenta iniciar sesión o registrarte
3. Si hay errores, busca en la consola:
   - `⚠️ Supabase no está configurado correctamente` → Las variables no están configuradas
   - Errores de autenticación → Verifica que las credenciales sean correctas

### Verificar OpenAI

1. Abre la consola del navegador (F12)
2. Ve a la pestaña de generar un plan
3. Busca en la consola los mensajes:
   - `🔑 API Key presente: true`
   - `🔑 API Key válida: true`
   - `🔑 Empieza con sk-: true`

