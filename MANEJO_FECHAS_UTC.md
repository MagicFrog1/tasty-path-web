# ⏰ Manejo de Fechas y Tolerancia de Tiempo con Stripe

## 🔍 Problema

Stripe verifica la firma del webhook usando un **timestamp**. Si hay una diferencia de tiempo significativa entre el servidor y Stripe, la verificación puede fallar con error 400.

## ✅ Solución Implementada

### 1. Tolerancia de Tiempo en Webhook

**Cambio en `api/stripe-webhook.ts`:**

Se agregó una tolerancia de tiempo de **300 segundos (5 minutos)** al verificar la firma:

```typescript
event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  webhookSecret,
  300 // Tolerancia de tiempo en segundos (5 minutos)
);
```

**¿Por qué es importante?**
- Permite diferencias de reloj entre el servidor y Stripe
- Evita errores 400 por desincronización de tiempo
- 5 minutos es un valor seguro recomendado por Stripe

### 2. Uso Consistente de UTC

**Todas las fechas se manejan en UTC:**

- ✅ `new Date().toISOString()` - Siempre devuelve UTC
- ✅ Conversión de timestamps Unix de Stripe a ISO string en UTC
- ✅ Todas las fechas guardadas en Supabase están en UTC

**Ejemplo:**
```typescript
// Stripe devuelve timestamps en Unix (segundos)
const periodStart = new Date(subscription.current_period_start * 1000);
subscriptionData.current_period_start = periodStart.toISOString(); // UTC
```

### 3. Logging de Tiempo

Se agregó logging para verificar la sincronización:

```typescript
console.log('⏰ Timestamp del evento:', new Date(event.created * 1000).toISOString());
console.log('⏰ Hora actual del servidor:', new Date().toISOString());
```

Esto permite verificar si hay diferencias de tiempo significativas.

## 📋 Archivos Modificados

- ✅ `api/stripe-webhook.ts` - Tolerancia de tiempo y logging
- ✅ `api/sync-subscription.ts` - Comentarios sobre UTC
- ✅ Todas las fechas usan `.toISOString()` que devuelve UTC

## 🔧 Verificación

### 1. Verificar en los Logs

Después de un evento de webhook, revisa los logs en Vercel:

**Deberías ver:**
```
✅ Webhook verificado: checkout.session.completed
⏰ Timestamp del evento: 2025-11-29T10:40:05.000Z
⏰ Hora actual del servidor: 2025-11-29T10:40:06.123Z
```

**Si hay una diferencia grande (> 5 minutos):**
- ⚠️ Puede indicar un problema de sincronización de reloj
- ⚠️ La tolerancia de 5 minutos debería cubrirlo

### 2. Verificar Fechas en Supabase

Todas las fechas deberían estar en formato ISO (UTC):

```sql
SELECT 
  current_period_start,
  current_period_end,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = 'tu-user-id';
```

**Formato esperado:** `2025-11-29T10:40:05.000Z` (termina en Z = UTC)

## ⚠️ Notas Importantes

1. **Vercel usa UTC por defecto**: Los servidores de Vercel están configurados en UTC, así que no debería haber problemas de zona horaria.

2. **Stripe usa UTC**: Todos los timestamps de Stripe están en UTC.

3. **Supabase almacena en UTC**: Las columnas `TIMESTAMP WITH TIME ZONE` en Supabase almacenan en UTC.

4. **Frontend puede mostrar en zona local**: El frontend puede convertir las fechas UTC a la zona horaria del usuario para mostrarlas, pero siempre se almacenan en UTC.

## 🚀 Próximos Pasos

1. **Hacer deploy** a Vercel
2. **Probar el webhook** con un evento de prueba
3. **Verificar los logs** para confirmar que no hay diferencias de tiempo grandes
4. **Verificar en Supabase** que las fechas estén en formato UTC correcto

## 📝 Referencias

- [Stripe Webhook Signing](https://docs.stripe.com/webhooks/signature)
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)


