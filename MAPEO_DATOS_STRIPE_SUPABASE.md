# Mapeo de Datos: Stripe → Supabase

## 📋 Estructura de la Tabla `user_subscriptions`

### Columnas en Supabase:
```sql
- id (UUID) - Auto-generado
- user_id (UUID) - NOT NULL, FK a auth.users
- stripe_customer_id (TEXT) - UNIQUE
- stripe_subscription_id (TEXT) - UNIQUE, puede ser NULL
- plan (TEXT) - CHECK: 'trial', 'weekly', 'monthly', 'annual'
- is_premium (BOOLEAN) - DEFAULT false
- status (TEXT) - CHECK: 'active', 'canceled', 'past_due', 'unpaid', 'trialing', 'incomplete', 'incomplete_expired', 'paused'
- current_period_start (TIMESTAMP WITH TIME ZONE) - Puede ser NULL
- current_period_end (TIMESTAMP WITH TIME ZONE) - Puede ser NULL
- cancel_at_period_end (BOOLEAN) - DEFAULT false
- canceled_at (TIMESTAMP WITH TIME ZONE) - Puede ser NULL
- created_at (TIMESTAMP WITH TIME ZONE) - Auto-generado
- updated_at (TIMESTAMP WITH TIME ZONE) - Auto-generado (trigger)
```

## 🔄 Mapeo de Datos desde Stripe

### Evento: `checkout.session.completed`

#### Datos que se extraen de Stripe:

| Fuente en Stripe | Campo en Supabase | Tipo | Notas |
|-----------------|-------------------|------|-------|
| `session.client_reference_id` o `session.metadata.userId` | `user_id` | UUID | Prioridad: client_reference_id > metadata.userId > customer_id lookup > email lookup |
| `session.customer` o `subscription.customer` | `stripe_customer_id` | TEXT | ID del cliente en Stripe (cus_xxxxx) |
| `session.subscription` o `subscription.id` | `stripe_subscription_id` | TEXT | Puede ser NULL si no hay suscripción creada aún |
| `subscription.items.data[0].price.id` o `session.metadata.planId` o `line_items` | `plan` | TEXT | 'trial', 'weekly', 'monthly', 'annual' |
| `subscription.status === 'active' \|\| 'trialing'` o `true` si checkout completado | `is_premium` | BOOLEAN | true si está activo o en trial |
| `subscription.status` o `'active'` | `status` | TEXT | Estado de la suscripción |
| `subscription.current_period_start` o `now()` | `current_period_start` | TIMESTAMP | Unix timestamp convertido a ISO string UTC |
| `subscription.current_period_end` o `calculated based on plan` | `current_period_end` | TIMESTAMP | Unix timestamp convertido a ISO string UTC |
| `subscription.cancel_at_period_end` o `false` | `cancel_at_period_end` | BOOLEAN | Si se cancelará al final del período |
| `subscription.canceled_at` o `null` | `canceled_at` | TIMESTAMP | Fecha de cancelación si existe |

## 📝 Código Actual del Webhook

### Datos que se envían a Supabase:

```typescript
const subscriptionData = {
  user_id: userId,                    // ✅ UUID de Supabase
  stripe_customer_id: customerId,    // ✅ cus_xxxxx
  stripe_subscription_id: subscriptionId || null,  // ✅ sub_xxxxx o NULL
  plan: plan,                         // ✅ 'trial' | 'weekly' | 'monthly' | 'annual'
  is_premium: isActive,               // ✅ true/false
  status: status,                     // ✅ 'active' | 'trialing' | etc.
  current_period_start: periodStart.toISOString(),  // ✅ ISO string UTC
  current_period_end: periodEnd.toISOString(),      // ✅ ISO string UTC
  cancel_at_period_end: false,        // ✅ boolean
  canceled_at: null,                  // ✅ ISO string UTC o null
};
```

## ✅ Verificación de Mapeo

### Campos Requeridos:
- ✅ `user_id` - Se obtiene correctamente
- ✅ `plan` - Se detecta desde múltiples fuentes
- ✅ `is_premium` - Se calcula correctamente
- ✅ `status` - Se mapea correctamente

### Campos Opcionales pero Importantes:
- ✅ `stripe_customer_id` - Se obtiene de la sesión o suscripción
- ⚠️ `stripe_subscription_id` - Puede ser NULL (esto es normal para algunos casos)
- ✅ `current_period_start` - Se calcula si no hay suscripción
- ✅ `current_period_end` - Se calcula si no hay suscripción

## 🔍 Posibles Problemas Detectados

### 1. Fechas NULL en la Base de Datos
**Problema:** En las imágenes se ve que `current_period_start` y `current_period_end` están NULL.

**Causa posible:** 
- El código calcula las fechas cuando no hay `subscription`, pero puede que no se estén guardando correctamente
- O el webhook no está ejecutándose cuando debería

**Solución:** Verificar que el código siempre establezca las fechas, incluso cuando no hay subscription.

### 2. stripe_subscription_id NULL
**Problema:** `stripe_subscription_id` puede ser NULL según las imágenes.

**Esto es NORMAL si:**
- El checkout se completó pero Stripe aún no creó la suscripción
- Es un plan TRIAL que se maneja diferente
- El evento `checkout.session.completed` se dispara antes de que se cree la suscripción

**Solución:** El código ya maneja esto correctamente permitiendo NULL.

## 🛠️ Mejoras Necesarias

1. **Asegurar que las fechas SIEMPRE se establezcan:**
   - Incluso cuando no hay subscription, calcular fechas basadas en el plan
   - ✅ Ya implementado en el código

2. **Mejorar logging para debugging:**
   - ✅ Ya implementado con logs detallados

3. **Verificar que el plan TRIAL se detecte correctamente:**
   - ✅ Ya implementado con múltiples fuentes de detección

## 📊 Flujo de Datos Completo

```
Stripe Checkout Session
    ↓
checkout.session.completed event
    ↓
Webhook recibe evento
    ↓
Extrae datos:
  - client_reference_id → user_id
  - customer → stripe_customer_id
  - subscription → stripe_subscription_id (puede ser null)
  - metadata.planId o price_id → plan
  - subscription.status → status e is_premium
  - subscription dates → current_period_start/end
    ↓
Actualiza Supabase:
  - upsert en user_subscriptions
  - onConflict: user_id
    ↓
✅ Suscripción guardada en Supabase
```

## 🔧 Verificación Manual

Para verificar que todo funciona:

1. **Revisar logs del webhook en Vercel:**
   - Buscar: "💾 Preparando para actualizar suscripción en Supabase"
   - Verificar: "📋 Datos completos:" muestra todos los campos

2. **Verificar en Supabase:**
   - `user_id` debe estar presente
   - `stripe_customer_id` debe estar presente
   - `plan` debe ser uno de: 'trial', 'weekly', 'monthly', 'annual'
   - `is_premium` debe ser true si está activo
   - `status` debe ser 'active' o 'trialing' para suscripciones activas
   - `current_period_start` y `current_period_end` NO deberían ser NULL

3. **Si las fechas están NULL:**
   - Revisar logs para ver si el código está calculando las fechas
   - Verificar que el bloque `else` (líneas 413-439) se esté ejecutando

