# 🔐 Configurar Variables de Entorno en Vercel

## ✅ Ya tienes el Signing Secret

Tu Signing Secret de Stripe:
```
whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss
```

## 📍 Paso a Paso: Agregar Variables en Vercel

### 1. Acceder a Vercel Dashboard

1. Ve a: **https://vercel.com/dashboard**
2. **Inicia sesión** con tu cuenta
3. Busca y selecciona tu proyecto **"tasty-path-web-main"** (o el nombre de tu proyecto)

### 2. Ir a Settings > Environment Variables

1. En la página de tu proyecto, haz clic en la pestaña **"Settings"** (Configuración)
2. En el menú lateral izquierdo, busca y haz clic en **"Environment Variables"** (Variables de Entorno)

### 3. Agregar las Variables Necesarias

Necesitas agregar **TODAS** estas variables para que el webhook funcione:

#### Variable 1: STRIPE_WEBHOOK_SECRET ✅ (Ya la tienes)

1. Haz clic en **"Add New"** o **"Agregar Nueva"**
2. En **"Key"** (Clave): 
   ```
   STRIPE_WEBHOOK_SECRET
   ```
3. En **"Value"** (Valor):
   ```
   whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss
   ```
4. Selecciona los ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Haz clic en **"Save"**

#### Variable 2: STRIPE_SECRET_KEY (Verifica si ya la tienes)

1. Haz clic en **"Add New"**
2. Key: `STRIPE_SECRET_KEY`
3. Value: Tu clave secreta de Stripe (empieza con `sk_test_` o `sk_live_`)
4. Selecciona todos los ambientes
5. Haz clic en **"Save"**

**¿Dónde encontrar tu STRIPE_SECRET_KEY?**
- Ve a Stripe Dashboard > Developers > API keys
- Copia la **"Secret key"** (no la "Publishable key")

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY (¡MUY IMPORTANTE!)

1. Haz clic en **"Add New"**
2. Key: `SUPABASE_SERVICE_ROLE_KEY`
3. Value: Tu service role key de Supabase
4. Selecciona todos los ambientes
5. Haz clic en **"Save"**

**¿Dónde encontrar SUPABASE_SERVICE_ROLE_KEY?**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **API**
4. Busca la sección **"Project API keys"**
5. Busca **"service_role"** key (⚠️ NO uses la "anon" key)
6. Haz clic en el ícono de ojo o "Reveal" para verla
7. **Copia el valor completo** (es muy largo)

⚠️ **IMPORTANTE**: 
- Esta key tiene permisos completos
- NUNCA la expongas en el cliente
- Solo úsala en el servidor (backend)

#### Variable 4: Verificar otras variables (Ya deberían estar)

Verifica que también tengas estas variables configuradas:

- `NEXT_PUBLIC_SUPABASE_URL` o `VITE_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PRICE_WEEKLY` (si usas planes)
- `VITE_STRIPE_PRICE_MONTHLY` (si usas planes)
- `VITE_STRIPE_PRICE_ANNUAL` (si usas planes)

## 📋 Checklist de Variables

Asegúrate de tener todas estas variables:

- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss` ✅
- [ ] `STRIPE_SECRET_KEY` = `sk_test_...` o `sk_live_...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (muy largo)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` o `VITE_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `VITE_SUPABASE_ANON_KEY`

## 🔄 Paso 4: Redeploy de la Aplicación

Después de agregar las variables:

1. Ve a la pestaña **"Deployments"** en Vercel
2. Busca el deployment más reciente
3. Haz clic en los **"..."** (tres puntos) del deployment
4. Selecciona **"Redeploy"**
5. Confirma el redeploy

Esto es necesario para que las nuevas variables de entorno estén disponibles.

## ✅ Verificar que Funciona

1. **Verifica el webhook en Stripe**:
   - Ve a Stripe Dashboard > Webhooks
   - Haz clic en tu webhook
   - Deberías ver eventos recientes si se ha probado

2. **Prueba el webhook**:
   - Crea una suscripción de prueba
   - Completa el pago
   - Verifica en Supabase que `is_premium` se actualice a `true`

3. **Revisa los logs**:
   - En Vercel, ve a Functions > stripe-webhook
   - Revisa los logs para ver si hay errores

## 🎯 Resumen

Ya tienes:
- ✅ Signing Secret: `whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss`

Necesitas agregar en Vercel:
1. `STRIPE_WEBHOOK_SECRET` = `whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss`
2. `STRIPE_SECRET_KEY` = Tu clave secreta de Stripe
3. `SUPABASE_SERVICE_ROLE_KEY` = Tu service role key de Supabase

Luego hacer **redeploy** de la aplicación.

## 🔍 ¿Problemas?

Si después del redeploy el webhook no funciona:
1. Verifica que todas las variables estén agregadas
2. Verifica que el redeploy se haya completado
3. Revisa los logs en Vercel Functions
4. Verifica en Stripe Dashboard que el webhook esté activo

