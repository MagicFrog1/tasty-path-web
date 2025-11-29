# 🔍 Guía para Verificar el Webhook de Stripe

## Problema
El webhook no está guardando automáticamente los datos en Supabase cuando se completa una suscripción.

## Pasos para Diagnosticar

### 1. Verificar que el Webhook esté Configurado en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Busca el endpoint: `https://mytastypath.com/api/stripe-webhook`
3. Verifica que esté activo y que tenga estos eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 2. Verificar los Logs de Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a la pestaña "Logs"
4. Busca eventos recientes con:
   - `💳 Checkout completado`
   - `✅✅✅ SUSCRIPCIÓN ACTUALIZADA EXITOSAMENTE`
   - `❌ ERROR CRÍTICO`

### 3. Verificar Variables de Entorno en Vercel

Asegúrate de que estas variables estén configuradas:

- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (sk_live_...)
- `STRIPE_WEBHOOK_SECRET`: La clave secreta del webhook (whsec_...)
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase (bypass RLS)

### 4. Probar el Webhook Manualmente

Usa el endpoint de prueba que creamos:

```bash
curl -X POST https://mytastypath.com/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TU_USER_ID_DE_SUPABASE",
    "customerId": "cus_TVdtclYuO5hGlv",
    "subscriptionId": "sub_1SYnp1KHiNy1x57tSK6rdzUl",
    "plan": "monthly"
  }'
```

O desde el navegador/postman, haz un POST a:
```
https://mytastypath.com/api/test-webhook
```

Con el body:
```json
{
  "userId": "TU_USER_ID_DE_SUPABASE",
  "customerId": "cus_TVdtclYuO5hGlv",
  "subscriptionId": "sub_1SYnp1KHiNy1x57tSK6rdzUl",
  "plan": "monthly"
}
```

### 5. Verificar en Stripe que el Evento se Envió

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Selecciona tu endpoint
3. Ve a "Recent deliveries"
4. Busca el evento `checkout.session.completed` más reciente
5. Haz clic en él y verifica:
   - **Status**: Debe ser `200 OK`
   - **Response**: Debe mostrar `{"received": true}`
   - Si hay errores, verás el mensaje de error

### 6. Verificar que el `client_reference_id` se Pase Correctamente

En `api/create-checkout-session.ts`, verifica que el `userId` se esté pasando:

```typescript
client_reference_id: userId || undefined,
```

### 7. Verificar en Supabase

Ejecuta esta consulta en Supabase SQL Editor:

```sql
-- Ver todas las suscripciones
SELECT 
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan,
  is_premium,
  status,
  created_at,
  updated_at
FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

## Posibles Problemas y Soluciones

### Problema 1: El webhook no recibe eventos
**Solución:**
- Verifica que la URL del webhook sea correcta
- Verifica que el webhook esté activo en Stripe
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente

### Problema 2: El webhook recibe eventos pero no guarda datos
**Solución:**
- Revisa los logs de Vercel para ver errores específicos
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurado
- Verifica que el `userId` se esté encontrando correctamente

### Problema 3: `stripe_subscription_id` es NULL
**Solución:**
- Esto puede ser normal si el checkout no crea una suscripción inmediatamente
- El evento `customer.subscription.created` debería actualizar este campo
- Verifica que este evento esté configurado en el webhook

### Problema 4: El `userId` no se encuentra
**Solución:**
- Verifica que el `client_reference_id` se pase al crear la sesión
- Verifica que el `userId` sea un UUID válido de Supabase
- Revisa los logs para ver qué método de búsqueda se está usando

## Comandos Útiles

### Verificar eventos recientes en Stripe (CLI)
```bash
stripe events list --limit 10
```

### Reenviar un evento desde Stripe Dashboard
1. Ve al evento en Stripe Dashboard
2. Haz clic en "Reenviar" (Replay)
3. Esto volverá a enviar el evento al webhook

## Contacto

Si después de seguir estos pasos el problema persiste, comparte:
1. Los logs de Vercel (últimos 10 eventos del webhook)
2. El estado del evento en Stripe Dashboard
3. El resultado de la consulta SQL en Supabase

