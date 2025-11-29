# 🔧 Solución Completa: Webhook y Guardado de Customer ID

## ❌ Problema Identificado

Después de pagar una suscripción con Stripe, el `customer_id` no se guarda en Supabase y el usuario no queda registrado como suscrito.

## ✅ Solución Implementada

### 1. Uso de `client_reference_id` (CRÍTICO)

**Cambio en `api/create-checkout-session.ts`:**

Ahora se pasa el `userId` de Supabase usando `client_reference_id`:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... otros campos ...
  client_reference_id: userId || undefined, // ← CRÍTICO: Asocia el usuario
  metadata: {
    planId: planId,
    userId: userId || '', // ← Respaldo en metadata
  },
});
```

**¿Por qué es importante?**
- `client_reference_id` es el campo recomendado por Stripe para asociar un usuario
- Se incluye automáticamente en todos los eventos del webhook
- Es más confiable que buscar por email (que puede variar)

### 2. Priorización en el Webhook

**Cambio en `api/stripe-webhook.ts`:**

El webhook ahora busca el usuario en este orden de prioridad:

1. **`client_reference_id`** (más confiable) ← NUEVO
2. **`metadata.userId`** (respaldo) ← NUEVO
3. **`customer_id` en Supabase** (si ya existe)
4. **Email** (último recurso)

```typescript
// 1. PRIORIDAD: client_reference_id
if (session.client_reference_id) {
  userId = session.client_reference_id;
}

// 2. Si no hay, intentar metadata
if (!userId && session.metadata?.userId) {
  userId = session.metadata.userId;
}

// 3. Buscar por customer_id
// 4. Buscar por email
```

### 3. Mejor Logging

Se agregó logging detallado para debug:
- Logs de cada paso de búsqueda del usuario
- Logs de los datos que se intentan guardar
- Logs de errores con detalles completos

## 🔄 Flujo Completo Corregido

### Paso 1: Usuario inicia checkout
```
Frontend → /api/create-checkout-session
  - Recibe: userId, planId, customerEmail
  - Crea sesión Stripe con:
    - client_reference_id: userId ← NUEVO
    - metadata.userId: userId ← NUEVO
  - Redirige a Stripe
```

### Paso 2: Usuario completa pago
```
Stripe procesa el pago
  - Crea customer_id
  - Crea subscription_id
  - Envía evento checkout.session.completed
```

### Paso 3: Webhook recibe evento
```
Stripe → /api/stripe-webhook
  - Verifica firma
  - Obtiene session.client_reference_id ← NUEVO
  - Obtiene customer_id de la suscripción
  - Busca usuario usando client_reference_id (prioridad)
  - Actualiza Supabase con:
    - user_id
    - stripe_customer_id
    - stripe_subscription_id
    - is_premium: true
    - status: 'active'
```

### Paso 4: Usuario regresa a la app
```
Frontend → /suscripcion?success=true
  - Muestra mensaje de éxito
  - Sincroniza desde Stripe (si es necesario)
  - Redirige al dashboard
```

## 🧪 Cómo Verificar que Funciona

### 1. Verificar en los Logs de Vercel

Después de un pago, revisa los logs de `api/stripe-webhook`:

**Deberías ver:**
```
✅ Webhook verificado: checkout.session.completed
💳 Checkout completado: cs_xxxxx
✅ Usuario obtenido desde client_reference_id: uuid-del-usuario
✅ Suscripción obtenida de Stripe: { customerId: 'cus_xxxxx', ... }
💾 Actualizando suscripción en Supabase: { user_id: '...', stripe_customer_id: 'cus_xxxxx', ... }
✅ Suscripción actualizada exitosamente en Supabase
```

### 2. Verificar en Supabase

Ejecuta esta consulta:

```sql
SELECT 
  us.*,
  au.email
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
WHERE us.stripe_customer_id IS NOT NULL
ORDER BY us.updated_at DESC
LIMIT 5;
```

**Deberías ver:**
- ✅ `stripe_customer_id` con un valor (ej: `cus_TVdtclYuO5hGlv`)
- ✅ `stripe_subscription_id` con un valor (ej: `sub_xxxxx`)
- ✅ `is_premium` = `true`
- ✅ `status` = `'active'`

### 3. Verificar en Stripe Dashboard

1. Ve a **Stripe Dashboard** > **Webhooks**
2. Selecciona tu endpoint
3. Ve a **Eventos** y busca `checkout.session.completed`
4. Verifica que el estado sea **"Succeeded"** (verde)
5. Haz clic en el evento y verifica que:
   - `client_reference_id` contenga el UUID del usuario
   - `customer` tenga el customer_id

## 🐛 Troubleshooting

### Si el webhook NO actualiza Supabase:

1. **Verifica que `userId` se esté pasando al crear la sesión:**
   - Revisa los logs de `api/create-checkout-session`
   - Deberías ver: `📋 Plan: monthly, userId: uuid-del-usuario`

2. **Verifica que el webhook esté recibiendo `client_reference_id`:**
   - Revisa los logs de `api/stripe-webhook`
   - Deberías ver: `✅ Usuario obtenido desde client_reference_id: uuid`

3. **Verifica las variables de entorno en Vercel:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` o `VITE_SUPABASE_URL`

4. **Verifica que el webhook esté configurado en Stripe:**
   - URL: `https://tu-dominio.vercel.app/api/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Si el customer_id no se guarda:

1. **Verifica que el webhook esté procesando correctamente:**
   - Revisa los logs para ver si hay errores
   - Busca: `❌ Error actualizando suscripción en Supabase`

2. **Verifica que la tabla tenga el constraint correcto:**
   - Ejecuta: `database/add_trial_plan.sql` si no lo has hecho

3. **Verifica que el Service Role Key tenga permisos:**
   - Debe tener acceso completo a la tabla `user_subscriptions`

## 📝 Archivos Modificados

- ✅ `api/create-checkout-session.ts` - Añadido `client_reference_id` y `metadata.userId`
- ✅ `api/stripe-webhook.ts` - Priorizado `client_reference_id` para encontrar usuario
- ✅ Mejor logging en ambos archivos

## 🚀 Próximos Pasos

1. **Hacer deploy a Vercel**
2. **Probar con un pago de prueba**
3. **Verificar los logs en Vercel**
4. **Verificar en Supabase que el customer_id se guarde**

## ⚠️ Nota Importante

El uso de `client_reference_id` es **CRÍTICO** porque:
- Es la forma recomendada por Stripe
- Es más confiable que buscar por email
- Se incluye automáticamente en todos los eventos
- Permite asociar directamente el usuario sin búsquedas adicionales

