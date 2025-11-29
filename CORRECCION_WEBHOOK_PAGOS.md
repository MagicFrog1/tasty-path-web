# 🔧 Corrección: Error "Not Found" y Webhook No Actualiza Supabase

## ❌ Problemas Identificados

1. **Error "Not Found"** al terminar el pago
2. **La información NO se pasa de Stripe a Supabase** después del pago
3. El webhook puede estar fallando silenciosamente

## ✅ Correcciones Realizadas

### 1. Mejora del Webhook (`api/stripe-webhook.ts`)

**Cambios principales:**

- ✅ **Mejor manejo de errores**: El webhook ahora maneja mejor los casos donde falta información
- ✅ **Búsqueda mejorada de usuarios**: Busca por `customer_id` primero, luego por `email` si no encuentra
- ✅ **Logging detallado**: Agrega más logs para debug
- ✅ **Manejo de casos edge**: Maneja casos donde `subscription_id` puede estar ausente
- ✅ **Respuesta inmediata a Stripe**: Responde inmediatamente a Stripe para evitar timeouts, pero procesa el evento de forma asíncrona

**Mejoras específicas:**

1. **Búsqueda de usuario mejorada**:
   ```typescript
   // Primero busca por customer_id en user_subscriptions
   // Si no encuentra, busca por email en auth.users
   // Si encuentra, actualiza Supabase
   ```

2. **Manejo de subscription_id faltante**:
   ```typescript
   // Si no hay subscription_id, intenta actualizar con la información disponible
   // Usa customer_id y email para encontrar al usuario
   ```

3. **Mejor extracción del plan**:
   ```typescript
   // Intenta obtener el plan del price_id de la suscripción
   // Si no puede, usa el planId de los metadata de la sesión
   ```

### 2. Mejora de URLs de Redirección (`api/create-checkout-session.ts`)

**Cambios:**

- ✅ **Detección mejorada del dominio**: Usa múltiples fuentes para determinar el `origin`
- ✅ **Fallback a variables de entorno**: Si no hay `origin` en headers, usa variables de entorno
- ✅ **Limpieza de URLs**: Elimina barras dobles y normaliza las URLs
- ✅ **Logging de URLs**: Registra las URLs generadas para debug

**Ejemplo de URLs generadas:**
```
Success URL: https://mytastypath.com/suscripcion?success=true&plan=monthly&session_id={CHECKOUT_SESSION_ID}
Cancel URL: https://mytastypath.com/suscripcion?canceled=true
```

## 🔍 Cómo Verificar que Funciona

### 1. Verificar Logs del Webhook

Después de hacer un pago de prueba, revisa los logs en Vercel:

1. Ve a **Vercel Dashboard** > Tu proyecto > **Functions** > `api/stripe-webhook`
2. Busca logs que contengan:
   - `💳 Checkout completado:`
   - `✅ Usuario encontrado por email:`
   - `✅ Suscripción actualizada exitosamente en Supabase:`

### 2. Verificar en Supabase

Después de un pago, verifica en Supabase:

```sql
-- Ver todas las suscripciones
SELECT * FROM user_subscriptions 
ORDER BY created_at DESC 
LIMIT 5;

-- Ver una suscripción específica por email
SELECT us.*, au.email 
FROM user_subscriptions us
JOIN auth.users au ON us.user_id = au.id
WHERE au.email = 'tu-email@ejemplo.com';
```

**Deberías ver:**
- ✅ `is_premium = true`
- ✅ `status = 'active'`
- ✅ `stripe_customer_id` con un valor (ej: `cus_xxxxx`)
- ✅ `stripe_subscription_id` con un valor (ej: `sub_xxxxx`)

### 3. Verificar en Stripe Dashboard

1. Ve a **Stripe Dashboard** > **Webhooks**
2. Selecciona tu webhook endpoint
3. Ve a **Eventos** y busca eventos `checkout.session.completed`
4. Verifica que el estado sea **"Succeeded"** (verde)
5. Si hay errores, revisa los detalles del evento

### 4. Probar el Flujo Completo

1. **Haz un pago de prueba** usando una tarjeta de prueba de Stripe:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos

2. **Completa el pago** en Stripe

3. **Verifica que te redirija correctamente** a `/suscripcion?success=true&plan=...`

4. **Espera 5-10 segundos** para que el webhook procese el evento

5. **Recarga la página de suscripción** y verifica que:
   - ✅ Aparezca el botón "Gestionar Suscripción"
   - ✅ El estado premium esté activo

## 🐛 Troubleshooting

### Si el webhook NO actualiza Supabase:

1. **Verifica las variables de entorno en Vercel:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` o `VITE_SUPABASE_URL`

2. **Verifica que el webhook esté configurado en Stripe:**
   - URL: `https://tu-dominio.vercel.app/api/stripe-webhook`
   - Eventos seleccionados:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Revisa los logs del webhook en Vercel** para ver errores específicos

4. **Verifica que el usuario exista en Supabase Auth** con el mismo email que usó en Stripe

### Si aparece "Not Found" después del pago:

1. **Verifica que la ruta `/suscripcion` exista** en tu aplicación (ya está configurada en `App.tsx`)

2. **Verifica que el dominio en las URLs de success sea correcto**:
   - Revisa los logs de `create-checkout-session` en Vercel
   - Deberías ver: `🔗 Success URL: https://tu-dominio.com/suscripcion?...`

3. **Si usas un dominio personalizado**, asegúrate de que esté configurado correctamente en Vercel

## 📝 Próximos Pasos

1. **Hacer deploy a Vercel**:
   ```bash
   git add .
   git commit -m "Fix: Mejora webhook y manejo de URLs de redirección"
   git push origin main
   ```

2. **Probar con un pago de prueba** después del deploy

3. **Verificar que todo funcione correctamente**

4. **Si hay problemas**, revisa los logs en Vercel y Stripe Dashboard

## 🔗 Archivos Modificados

- `api/stripe-webhook.ts` - Mejoras en manejo de errores y búsqueda de usuarios
- `api/create-checkout-session.ts` - Mejoras en generación de URLs de redirección

## ⚠️ Nota Importante

El webhook ahora responde **inmediatamente** a Stripe (para evitar timeouts) y procesa el evento de forma **asíncrona**. Esto significa que:

- ✅ Stripe recibe confirmación inmediata
- ✅ El procesamiento puede tomar unos segundos
- ✅ Los errores se loguean pero no bloquean la respuesta a Stripe
- ⚠️ Si hay un error, revisa los logs en Vercel para ver los detalles

