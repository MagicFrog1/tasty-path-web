# ✅ Checklist Final - Integración Stripe con Supabase

## 🎉 ¡Excelente! Ya tienes todo configurado

Si ya configuraste todas las variables de entorno en Vercel, aquí está el checklist final:

## ✅ Lo que ya está completo:

- [x] Webhook creado en Stripe Dashboard
- [x] Signing Secret obtenido: `whsec_cz9mNrYLNes8J0wjsafSSLCsIM2dQxss`
- [x] Variables de entorno configuradas en Vercel:
  - [x] `STRIPE_WEBHOOK_SECRET`
  - [x] `STRIPE_SECRET_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`
  - [x] Otras variables necesarias

## 📋 Pasos Finales Pendientes:

### 1. ✅ Crear la Tabla en Supabase (IMPORTANTE)

**Debes ejecutar el SQL en Supabase**:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (en el menú lateral)
4. Haz clic en **"New query"** o **"Nueva consulta"**
5. Copia y pega el contenido del archivo:
   ```
   database/create_subscriptions_table.sql
   ```
6. Haz clic en **"Run"** o **"Ejecutar"**

**O copia este SQL directamente**:

```sql
-- Crear tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT CHECK (plan IN ('weekly', 'monthly', 'annual')) NOT NULL,
    is_premium BOOLEAN DEFAULT false NOT NULL,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused')) DEFAULT 'incomplete',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_premium ON public.user_subscriptions(is_premium);

-- Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY user_subscriptions_select_own
    ON public.user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY user_subscriptions_update_own
    ON public.user_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. 🔄 Hacer Redeploy en Vercel

Si acabas de agregar las variables de entorno:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Busca el deployment más reciente
5. Haz clic en los **"..."** (tres puntos)
6. Selecciona **"Redeploy"**
7. Confirma

Esto asegura que las nuevas variables estén disponibles.

### 3. 🧪 Probar el Flujo Completo

Una vez que hayas:
- ✅ Creado la tabla en Supabase
- ✅ Hecho redeploy en Vercel

Prueba el flujo completo:

#### Prueba 1: Crear una Suscripción

1. Ve a tu aplicación: `https://mytastypath.com/suscripcion`
2. Haz clic en un plan (weekly, monthly, o annual)
3. Completa el proceso de checkout
4. Usa una tarjeta de prueba de Stripe:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

#### Prueba 2: Verificar en Supabase

1. Ve a Supabase Dashboard > Table Editor
2. Selecciona la tabla `user_subscriptions`
3. Verifica que:
   - Se creó un registro con `is_premium = false` cuando inició el checkout
   - Se actualizó a `is_premium = true` después del pago

#### Prueba 3: Verificar el Webhook

1. Ve a Stripe Dashboard > Webhooks
2. Haz clic en tu webhook
3. Ve a la sección **"Recent events"**
4. Deberías ver eventos como:
   - `checkout.session.completed`
   - `customer.subscription.created`

## 🔍 Verificar que Todo Funciona

### En Supabase:

```sql
-- Ver todas las suscripciones
SELECT * FROM user_subscriptions;

-- Ver suscripciones premium activas
SELECT * FROM user_subscriptions 
WHERE is_premium = true AND status = 'active';
```

### En Vercel:

1. Ve a Functions > stripe-webhook
2. Revisa los logs para ver si hay errores
3. Si ves logs exitosos, el webhook está funcionando

### En Stripe:

1. Ve a Customers
2. Busca el cliente creado
3. Verifica que tiene una suscripción activa

## 📝 Resumen del Flujo

1. **Usuario inicia suscripción**:
   - Se crea registro en Supabase con `is_premium = false`

2. **Usuario completa el pago**:
   - Stripe envía evento `checkout.session.completed` al webhook
   - Webhook actualiza en Supabase: `is_premium = true`

3. **Estado premium**:
   - La app consulta Supabase para verificar si el usuario es premium
   - Se muestra contenido premium según corresponda

## 🎯 Estado Actual

- ✅ Código implementado
- ✅ Webhook configurado en Stripe
- ✅ Variables de entorno configuradas
- ⏳ **Falta**: Ejecutar SQL en Supabase
- ⏳ **Falta**: Redeploy en Vercel (si acabas de agregar variables)
- ⏳ **Falta**: Probar el flujo completo

## 🚀 Siguiente Paso

1. **Ejecuta el SQL** en Supabase para crear la tabla
2. **Haz redeploy** en Vercel
3. **Prueba** el flujo completo con una suscripción de prueba

¡Ya casi está todo listo! 🎉

