# Variables de Entorno Faltantes para el Webhook de Stripe

## 📋 Estado Actual en Vercel

### ✅ Variables que YA están configuradas:
1. `STRIPE_WEBHOOK_SECRET` ✅ (Added 12h ago)
2. `VITE_STRIPE_PRICE_TRIAL` ✅ (Added 2h ago)
3. `VITE_STRIPE_PRICE_WEEKLY` ✅ (Updated Nov 22)
4. `VITE_STRIPE_PRICE_MONTHLY` ✅ (Updated Nov 22)
5. `VITE_STRIPE_PRICE_ANNUAL` ✅ (Updated Nov 22)
6. `VITE_STRIPE_PUBLISHABLE_KEY` ✅ (Updated Nov 21)

### ❌ Variables CRÍTICAS que FALTAN:

#### 1. `STRIPE_SECRET_KEY` ⚠️ **CRÍTICO**
- **Usado en:** `api/stripe-webhook.ts` línea 17
- **Propósito:** Clave secreta de Stripe para autenticar peticiones al API de Stripe
- **Dónde encontrarla:** 
  - Stripe Dashboard → Developers → API keys
  - Formato: `sk_live_...` (producción) o `sk_test_...` (testing)
- **Importancia:** ⚠️ **CRÍTICA** - Sin esto, el webhook no puede funcionar

#### 2. `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRÍTICO**
- **Usado en:** `api/stripe-webhook.ts` línea 178
- **Propósito:** Clave de servicio de Supabase con permisos de administrador (bypass RLS)
- **Dónde encontrarla:**
  - Supabase Dashboard → Settings → API
  - Sección "Service Role" (¡NUNCA exponerla en el cliente!)
  - Formato: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Importancia:** ⚠️ **CRÍTICA** - Sin esto, no se puede actualizar la base de datos

#### 3. Variables de Supabase (URL y Anon Key)
- **Usadas en:** `api/stripe-webhook.ts` línea 177
- **Necesarias:**
  - `NEXT_PUBLIC_SUPABASE_URL` o `VITE_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` (ya mencionada arriba)

## 🚀 Pasos para Agregar las Variables Faltantes

### Paso 1: Agregar `STRIPE_SECRET_KEY`
1. Ve a Stripe Dashboard: https://dashboard.stripe.com/
2. Navega a: **Developers** → **API keys**
3. Copia la **Secret key** (sk_live_... para producción, sk_test_... para testing)
4. En Vercel:
   - Ve a tu proyecto → **Settings** → **Environment Variables**
   - Click en **"Add New"**
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_live_...` (tu clave secreta)
   - Scope: **All Environments** (o Production/Preview según necesites)
   - Click **Save**

### Paso 2: Agregar `SUPABASE_SERVICE_ROLE_KEY`
1. Ve a Supabase Dashboard: https://app.supabase.com/
2. Selecciona tu proyecto
3. Navega a: **Settings** → **API**
4. En la sección **"Project API keys"**, encuentra **"service_role"** (key)
5. **⚠️ ADVERTENCIA:** Esta clave tiene permisos de administrador. NUNCA la expongas en el cliente.
6. Copia el valor completo
7. En Vercel:
   - Ve a tu proyecto → **Settings** → **Environment Variables**
   - Click en **"Add New"**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (tu service role key)
   - Scope: **All Environments** (o Production según necesites)
   - Click **Save**

### Paso 3: Agregar Variables de Supabase (si faltan)
Si no tienes estas variables configuradas:

1. **`VITE_SUPABASE_URL`** o **`NEXT_PUBLIC_SUPABASE_URL`**
   - En Supabase Dashboard → Settings → API
   - Copia el **"Project URL"**
   - Agregar en Vercel con el nombre que prefieras

2. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada (Paso 2)

## ✅ Lista de Verificación Final

Después de agregar las variables, verifica que tengas:

- [ ] `STRIPE_SECRET_KEY` ⚠️ CRÍTICO
- [ ] `STRIPE_WEBHOOK_SECRET` ✅ (ya está)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ CRÍTICO
- [ ] `VITE_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `VITE_STRIPE_PRICE_TRIAL` ✅ (ya está)
- [ ] `VITE_STRIPE_PRICE_WEEKLY` ✅ (ya está)
- [ ] `VITE_STRIPE_PRICE_MONTHLY` ✅ (ya está)
- [ ] `VITE_STRIPE_PRICE_ANNUAL` ✅ (ya está)

## 🔄 Después de Agregar las Variables

1. **Redesplegar la aplicación en Vercel:**
   - Las variables de entorno se aplican automáticamente en el próximo deployment
   - O puedes hacer un redeploy manual desde el dashboard

2. **Probar el webhook:**
   - Ve a Stripe Dashboard → Developers → Webhooks
   - Usa el botón "Send test webhook" o reenvía un evento desde Workbench
   - Verifica los logs en Vercel para confirmar que funciona

## 📝 Notas Importantes

- ⚠️ **NUNCA** expongas `STRIPE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` en el código del cliente
- ✅ Estas variables solo deben estar en Vercel (variables de entorno del servidor)
- 🔒 `SUPABASE_SERVICE_ROLE_KEY` tiene permisos completos de administrador, úsala con cuidado
- 🧪 Para testing, usa claves de test (`sk_test_...`) en lugar de producción


