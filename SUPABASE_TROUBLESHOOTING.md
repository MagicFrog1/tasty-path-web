# Solución de Problemas de Supabase

## Error: `ERR_NAME_NOT_RESOLVED` o `Failed to fetch`

### Síntomas:
- Error en consola: `ERR_NAME_NOT_RESOLVED`
- Error: `AuthRetryableFetchError: Failed to fetch`
- No se puede iniciar sesión o registrar usuarios
- La aplicación no puede conectarse a Supabase

### Causas Posibles:

#### 1. **Proyecto de Supabase Pausado** (Más Común)
Supabase pausa automáticamente los proyectos gratuitos después de 1 semana de inactividad.

**Solución:**
1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Busca tu proyecto
3. Si está pausado, haz clic en **"Restore"** o **"Resume"**
4. Espera unos minutos a que el proyecto se reactive
5. Intenta de nuevo

#### 2. **Variables de Entorno No Configuradas en Vercel**
Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` no están configuradas o son incorrectas.

**Solución:**
1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Verifica que existan estas variables:
   - `VITE_SUPABASE_URL` = `https://tu-proyecto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. Si no existen, agrégalas:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Tu URL de Supabase (empieza con `https://`)
   - **Environment:** Todas (Production, Preview, Development)
   - Repite para `VITE_SUPABASE_ANON_KEY`
5. **IMPORTANTE:** Redespliega la aplicación después de agregar/modificar variables

#### 3. **URL de Supabase Incorrecta**
La URL configurada no corresponde a tu proyecto activo.

**Solución:**
1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia la **Project URL** (debe ser algo como `https://xxxxx.supabase.co`)
5. Actualiza la variable `VITE_SUPABASE_URL` en Vercel con esta URL
6. Redespliega la aplicación

#### 4. **Proyecto de Supabase Eliminado**
El proyecto fue eliminado o la URL cambió.

**Solución:**
1. Verifica en [Supabase Dashboard](https://app.supabase.com/) que el proyecto exista
2. Si no existe, crea un nuevo proyecto
3. Actualiza las variables de entorno con las nuevas credenciales
4. Redespliega la aplicación

#### 5. **Problemas de Red/CORS**
Problemas de conectividad o configuración de CORS.

**Solución:**
1. Verifica tu conexión a internet
2. Intenta acceder directamente a la URL de Supabase en el navegador
3. Verifica en Supabase Dashboard → **Settings** → **API** → **CORS** que tu dominio esté permitido

### Cómo Verificar la Configuración:

#### En el Código:
1. Abre la consola del navegador (F12)
2. Busca estos mensajes:
   ```
   🔧 Configuración de Supabase:
   📍 URL: https://xxxxx.supabase.co
   🔑 Key configurada: eyJhbGciOiJIUzI1NiIs...
   ```
3. Si ves `Key configurada: NO CONFIGURADA`, las variables no están configuradas

#### En Vercel:
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Verifica que existan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Verifica que los valores sean correctos (sin espacios, URLs completas)

#### En Supabase:
1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Verifica que el proyecto esté **activo** (no pausado)
3. Ve a **Settings** → **API**
4. Compara la **Project URL** y **anon public** key con las variables en Vercel

### Pasos de Solución Rápida:

1. ✅ Verifica que el proyecto de Supabase esté activo (no pausado)
2. ✅ Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén en Vercel
3. ✅ Verifica que los valores sean correctos (sin espacios, URLs completas)
4. ✅ Redespliega la aplicación en Vercel
5. ✅ Limpia la caché del navegador y prueba de nuevo

### Mensajes de Error Mejorados:

La aplicación ahora muestra mensajes más específicos:
- **"Error de conexión con el servidor"** → Problema de red o Supabase pausado
- **"Email o contraseña incorrectos"** → Credenciales incorrectas
- **"Este email ya está registrado"** → El usuario ya existe

### Contacto:

Si después de seguir estos pasos el problema persiste:
1. Revisa los logs de Supabase en el dashboard
2. Revisa los logs de Vercel en el deployment
3. Verifica la consola del navegador para más detalles

