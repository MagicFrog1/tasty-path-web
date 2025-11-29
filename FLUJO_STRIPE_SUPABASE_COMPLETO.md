# 🔄 Flujo Completo Stripe ↔ Supabase - Implementación

Este documento describe la implementación completa del flujo de integración entre Stripe y Supabase según las mejores prácticas.

## 📋 Resumen del Flujo

```
Usuario → Checkout → Stripe → Webhook → Supabase → Aplicación
```

## 🛒 Fase 1: Checkout (Creación de la Suscripción)

### Archivo: `api/create-checkout-session.ts`

**✅ Implementado correctamente:**

1. **Asociación de IDs:**
   ```typescript
   client_reference_id: userId || undefined,  // ID de usuario de Supabase
   metadata: {
     planId: planId,
     userId: userId || '',
   }
   ```

2. **Datos enviados a Stripe:**
   - `client_reference_id`: ID del usuario autenticado de Supabase
   - `metadata.userId`: ID del usuario (backup)
   - `metadata.planId`: Plan seleccionado (trial, weekly, monthly, annual)
   - `customer_email`: Email del usuario

3. **Registro inicial en Supabase:**
   - Se crea un registro en `user_subscriptions` con `is_premium=false` y `status='incomplete'`
   - Esto permite tener un registro antes de que el webhook procese el pago

## 📡 Fase 2: Webhooks (Sincronización de Estados)

### Archivo: `api/stripe-webhook.ts`

**✅ Eventos manejados:**

#### 1. `checkout.session.completed`
Cuando el pago es exitoso:

**Datos obtenidos de Stripe:**
- `client_reference_id` → `user_id` (prioridad 1)
- `metadata.userId` → `user_id` (prioridad 2)
- `session.customer` → `stripe_customer_id`
- `session.subscription` → `stripe_subscription_id`
- `subscription.status` → `status` y `is_premium`

**Actualizaciones en Supabase:**

1. **Tabla `user_subscriptions`:**
   ```typescript
   {
     user_id: userId,
     stripe_customer_id: customerId,
     stripe_subscription_id: subscriptionId,
     plan: plan, // 'trial', 'weekly', 'monthly', 'annual'
     is_premium: isActive,
     status: status, // 'active', 'trialing', etc.
     current_period_start: periodStart,
     current_period_end: periodEnd,
     cancel_at_period_end: false,
     canceled_at: null
   }
   ```

2. **Tabla `user_profiles` (NUEVO - Mejora de rendimiento):**
   ```typescript
   {
     subscription_plan: subscriptionPlan, // 'weekly', 'monthly', 'annual' o null
     updated_at: new Date().toISOString()
   }
   ```
   - **Propósito:** Permite que la aplicación detecte rápidamente el nivel de suscripción sin consultar `user_subscriptions`
   - **Mapeo:** `trial` → `null` (o puedes decidir otro valor según tu lógica)

#### 2. `customer.subscription.updated`
Cuando la suscripción se actualiza (cambio de plan, renovación, etc.):

**Actualizaciones:**
- `user_subscriptions`: Actualiza estado, fechas, plan
- `user_profiles`: Actualiza `subscription_plan`

#### 3. `customer.subscription.deleted`
Cuando la suscripción se cancela:

**Actualizaciones:**
- `user_subscriptions`: `is_premium=false`, `status='canceled'`
- `user_profiles`: `subscription_plan=null`

## 🌐 Fase 3: Aplicación (Detección de Permisos)

### Opción A: Consulta rápida desde `user_profiles` (Recomendado)

```typescript
// En tu código de cliente
const { data: profile } = await supabase
  .from('user_profiles')
  .select('subscription_plan')
  .eq('id', user.id)
  .single();

if (profile?.subscription_plan === 'premium' || profile?.subscription_plan === 'monthly') {
  // Mostrar contenido premium
}
```

### Opción B: Consulta completa desde `user_subscriptions`

```typescript
// Para información detallada de la suscripción
const { data: subscription } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (subscription?.is_premium && subscription?.status === 'active') {
  // Mostrar contenido premium
}
```

## 📊 Mapeo de Datos

### Stripe → Supabase

| Origen (Stripe) | Destino (Supabase) | Tabla | Notas |
|-----------------|-------------------|-------|-------|
| `client_reference_id` | `user_id` | `user_subscriptions` | Prioridad 1 |
| `metadata.userId` | `user_id` | `user_subscriptions` | Prioridad 2 (backup) |
| `session.customer` | `stripe_customer_id` | `user_subscriptions` | Para gestión de planes |
| `session.subscription` | `stripe_subscription_id` | `user_subscriptions` | Para estado de suscripción |
| `subscription.status` | `status` + `is_premium` | `user_subscriptions` | Mapeo: active/trialing → active |
| `subscription.items[0].price.id` | `plan` | `user_subscriptions` | trial/weekly/monthly/annual |
| `plan` (mapeado) | `subscription_plan` | `user_profiles` | weekly/monthly/annual o null |

### Planes y Estados

**Planes disponibles:**
- `trial`: Plan de prueba (7 días)
- `weekly`: Plan semanal
- `monthly`: Plan mensual
- `annual`: Plan anual

**Estados de suscripción:**
- `active`: Suscripción activa
- `trialing`: En período de prueba
- `canceled`: Cancelada
- `past_due`: Pago pendiente
- `unpaid`: No pagado
- `incomplete`: Incompleta (antes del pago)
- `incomplete_expired`: Incompleta expirada
- `paused`: Pausada

## 🔐 Seguridad y Permisos

### Service Role Key
- El webhook usa `SUPABASE_SERVICE_ROLE_KEY` para hacer bypass de RLS
- Esto permite que el webhook actualice las tablas sin restricciones

### Políticas RLS
- `user_subscriptions`: Los usuarios solo pueden leer/actualizar su propia suscripción
- `user_profiles`: Los usuarios solo pueden leer/actualizar su propio perfil
- El webhook (con service_role) puede escribir en ambas tablas

## 🚀 Próximos Pasos

1. **Verificar logs de Vercel:**
   - Después de una suscripción, revisa los logs del webhook
   - Busca mensajes con ✅ y ❌ para diagnosticar problemas

2. **Verificar datos en Supabase:**
   ```sql
   -- Verificar suscripción
   SELECT * FROM user_subscriptions 
   WHERE user_id = 'TU_USER_ID';
   
   -- Verificar perfil
   SELECT subscription_plan FROM user_profiles 
   WHERE id = 'TU_USER_ID';
   ```

3. **Probar el flujo completo:**
   - Crear una nueva suscripción
   - Verificar que los datos se guarden en ambas tablas
   - Verificar que la aplicación detecte correctamente el nivel de suscripción

## 📝 Notas Importantes

1. **Sincronización dual:** Los datos se guardan en `user_subscriptions` (detallado) y `user_profiles` (rápido)
2. **Mapeo de planes:** `trial` no se guarda en `user_profiles.subscription_plan` (se deja como `null`)
3. **Fallback de INSERT:** Si el UPSERT falla, se intenta un INSERT directo
4. **Verificación post-guardado:** Después de cada actualización, se verifica que los datos se guardaron correctamente

## ✅ Checklist de Implementación

- [x] `client_reference_id` se pasa correctamente en checkout
- [x] Webhook recibe y verifica eventos de Stripe
- [x] Webhook actualiza `user_subscriptions` con todos los datos
- [x] Webhook actualiza `user_profiles` con `subscription_plan`
- [x] Manejo de errores y logging completo
- [x] Fallback de INSERT si UPSERT falla
- [x] Verificación post-guardado de datos
- [x] Manejo de eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

