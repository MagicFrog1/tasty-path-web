# Integración de Stripe con Supabase - Resumen

Esta integración permite que las suscripciones de Stripe se sincronicen automáticamente con Supabase.

## Archivos Creados/Modificados

### 1. Base de Datos

**`database/create_subscriptions_table.sql`**
- Crea la tabla `user_subscriptions` en Supabase
- Campos principales:
  - `stripe_customer_id`: ID del cliente en Stripe
  - `stripe_subscription_id`: ID de la suscripción en Stripe
  - `is_premium`: Booleano que indica si el usuario tiene acceso premium (false por defecto)
  - `plan`: Tipo de plan (weekly, monthly, annual)
  - `status`: Estado de la suscripción

### 2. Servicios

**`src/services/subscriptionService.ts`**
- `getUserSubscription(userId)`: Obtiene la suscripción de un usuario
- `isUserPremium(userId)`: Verifica si el usuario tiene acceso premium
- `getStripeCustomerId(userId)`: Obtiene el customer ID de Stripe
- `createInitialSubscription()`: Crea un registro inicial con `is_premium = false`

### 3. APIs

**`api/create-checkout-session.ts`** (Modificado)
- Ahora acepta `userId` en el body
- Crea un registro inicial en Supabase con `is_premium = false` cuando se inicia el checkout

**`api/stripe-webhook.ts`** (Nuevo)
- Maneja los eventos de Stripe:
  - `checkout.session.completed`: Actualiza `is_premium = true` cuando se completa el pago
  - `customer.subscription.updated`: Actualiza el estado de la suscripción
  - `customer.subscription.deleted`: Marca `is_premium = false` cuando se cancela

### 4. Frontend

**`src/services/stripeService.ts`** (Modificado)
- `redirectToCheckout()` ahora acepta `userId` como parámetro opcional

**`src/pages/SubscriptionPage.tsx`** (Modificado)
- Pasa el `userId` al crear el checkout

**`src/context/SubscriptionContext.tsx`** (Modificado)
- `checkSubscriptionStatus()` ahora puede recibir `userId` y obtener el estado desde Supabase
- Mantiene localStorage como fallback

## Flujo Completo

### 1. Usuario Inicia Suscripción
1. Usuario hace clic en "Suscribirse"
2. Se llama a `redirectToCheckout(planId, email, userId)`
3. Se crea una sesión de checkout en Stripe
4. **Se crea un registro en Supabase con `is_premium = false`**

### 2. Usuario Completa el Pago
1. Usuario completa el pago en Stripe
2. Stripe envía evento `checkout.session.completed` al webhook
3. El webhook:
   - Obtiene la información de la suscripción
   - Busca el usuario por `stripe_customer_id` o email
   - **Actualiza `is_premium = true`** en Supabase

### 3. Verificación del Estado Premium
- El `SubscriptionContext` consulta Supabase primero
- Si no hay datos en Supabase, usa localStorage como fallback
- La verificación se puede hacer con `isUserPremium(userId)`

## Configuración Requerida

### Variables de Entorno en Vercel

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://...
VITE_STRIPE_PRICE_WEEKLY=price_...
VITE_STRIPE_PRICE_MONTHLY=price_...
VITE_STRIPE_PRICE_ANNUAL=price_...
```

### Webhook en Stripe Dashboard

1. Ve a Stripe Dashboard > Webhooks
2. Agrega endpoint: `https://tu-dominio.vercel.app/api/stripe-webhook`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el Signing Secret (`whsec_...`) y agrégalo como `STRIPE_WEBHOOK_SECRET`

## Próximos Pasos

1. **Ejecutar el SQL**: Ejecutar `database/create_subscriptions_table.sql` en Supabase
2. **Configurar Webhook**: Configurar el webhook en Stripe Dashboard
3. **Configurar Variables**: Agregar todas las variables de entorno en Vercel
4. **Probar**: Crear una suscripción de prueba y verificar que:
   - Se crea el registro inicial con `is_premium = false`
   - Después del pago, se actualiza a `is_premium = true`
   - El estado se obtiene correctamente desde Supabase

## Notas Importantes

- ⚠️ El registro inicial **siempre** tiene `is_premium = false`
- ✅ Después del pago, el webhook actualiza automáticamente a `is_premium = true`
- ✅ El estado se sincroniza automáticamente con Stripe mediante webhooks
- ✅ Si no hay conexión a Supabase, el sistema usa localStorage como fallback

