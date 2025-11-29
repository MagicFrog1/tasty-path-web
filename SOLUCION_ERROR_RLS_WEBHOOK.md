# 🔧 Solución Error RLS en Webhook de Stripe

## ❌ Problema

El webhook de Stripe está fallando al intentar insertar/actualizar suscripciones en Supabase con el error:

```
❌ ERROR CRÍTICO actualizando suscripción en Supabase:
📋 Código de error: 42501
📋 Mensaje de error: new row violates row-level security policy for table "user_subscriptions"
```

Aunque el webhook está usando `SUPABASE_SERVICE_ROLE_KEY` (que debería hacer bypass de RLS), las políticas RLS están bloqueando la inserción.

## ✅ Solución Implementada

Se ha implementado una solución en múltiples capas:

### 1. Función SQL con SECURITY DEFINER

Se creó una función SQL `insert_user_subscription` que:
- Usa `SECURITY DEFINER` para hacer bypass completo de RLS
- Maneja INSERT y UPDATE (upsert) en un solo paso
- Es llamada desde el webhook como fallback cuando el UPSERT directo falla

### 2. Webhook Mejorado

El webhook ahora intenta múltiples estrategias en orden:

1. **UPSERT directo** (método normal con service_role)
2. **Función SQL** (`insert_user_subscription`) si el UPSERT falla
3. **INSERT directo** como último recurso

## 📋 Pasos para Aplicar la Solución

### Paso 1: Ejecutar el Script SQL

Ejecuta el script SQL en tu base de datos de Supabase:

```sql
-- Archivo: database/fix_webhook_rls_issue.sql
```

**Cómo ejecutarlo:**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido completo de `database/fix_webhook_rls_issue.sql`
5. Haz clic en **Run** o presiona `Ctrl+Enter`

### Paso 2: Verificar que la Función se Creó

Ejecuta esta query para verificar:

```sql
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    proargnames as parameters
FROM pg_proc
WHERE proname = 'insert_user_subscription';
```

**Resultado esperado:**
- `function_name`: `insert_user_subscription`
- `is_security_definer`: `true` ✅
- `parameters`: Array con los nombres de los parámetros

### Paso 3: Verificar Permisos

Asegúrate de que `service_role` tenga permisos para ejecutar la función:

```sql
SELECT 
    p.proname as function_name,
    r.rolname as role_name,
    has_function_privilege('service_role', p.oid, 'EXECUTE') as can_execute
FROM pg_proc p
CROSS JOIN pg_roles r
WHERE p.proname = 'insert_user_subscription'
    AND r.rolname = 'service_role';
```

**Resultado esperado:**
- `can_execute`: `true` ✅

### Paso 4: Verificar Variables de Entorno

Asegúrate de que las siguientes variables estén configuradas en Vercel:

1. `SUPABASE_SERVICE_ROLE_KEY` - ⚠️ **CRÍTICO**
   - Debe ser la clave de "service_role" (no la "anon" key)
   - Se encuentra en: Supabase Dashboard → Settings → API → Service Role Key

2. `STRIPE_WEBHOOK_SECRET` - Para verificar webhooks de Stripe

3. `STRIPE_SECRET_KEY` - Clave secreta de Stripe

**Cómo verificar en Vercel:**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Navega a **Settings** → **Environment Variables**
3. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
4. Si no está, agrégala y haz un nuevo deploy

## 🔍 Cómo Funciona la Solución

### Flujo Normal (UPSERT Exitoso)

```
Webhook recibe evento
    ↓
Crea cliente Supabase con service_role
    ↓
Intenta UPSERT directo
    ↓
✅ Éxito → Continúa con verificación
```

### Flujo con Fallback (UPSERT Falla)

```
Webhook recibe evento
    ↓
Crea cliente Supabase con service_role
    ↓
Intenta UPSERT directo
    ↓
❌ Falla (Error RLS 42501)
    ↓
🔄 Intenta función SQL insert_user_subscription
    ↓
✅ Éxito → Continúa con verificación
```

### Si la Función SQL También Falla

```
UPSERT falla
    ↓
Función SQL falla
    ↓
🔄 Intenta INSERT directo como último recurso
    ↓
✅ Éxito → Continúa
❌ Falla → Responde a Stripe con error (pero no falla el webhook)
```

## 📊 Logs Esperados

### Cuando el UPSERT Fallaba (ANTES)

```
❌ ERROR CRÍTICO actualizando suscripción en Supabase:
📋 Código de error: 42501
📋 Mensaje de error: new row violates row-level security policy
```

### Cuando Funciona con Fallback (AHORA)

```
❌ ERROR CRÍTICO actualizando suscripción en Supabase:
📋 Código de error: 42501
🔄 Intentando usar función SQL insert_user_subscription (bypass RLS)...
✅✅✅ SUSCRIPCIÓN GUARDADA CON FUNCIÓN SQL (BYPASS RLS) ✅✅✅
```

## 🧪 Pruebas

### Prueba 1: Verificar Función SQL

Puedes probar la función directamente desde SQL Editor:

```sql
SELECT public.insert_user_subscription(
    p_user_id := '00000000-0000-0000-0000-000000000000'::uuid, -- Reemplaza con un UUID real
    p_stripe_customer_id := 'cus_test123',
    p_stripe_subscription_id := 'sub_test123',
    p_plan := 'trial',
    p_is_premium := true,
    p_status := 'active',
    p_current_period_start := NOW(),
    p_current_period_end := NOW() + INTERVAL '7 days',
    p_cancel_at_period_end := false,
    p_canceled_at := NULL
);
```

### Prueba 2: Crear Sesión de Checkout

1. Crea una sesión de checkout desde tu aplicación
2. Completa el pago en Stripe
3. Observa los logs del webhook en Vercel
4. Verifica que la suscripción se guardó correctamente

## 🔧 Troubleshooting

### Problema: La función SQL no existe

**Solución:** Ejecuta nuevamente el script `database/fix_webhook_rls_issue.sql`

### Problema: Error "permission denied for function"

**Solución:** Ejecuta este comando:

```sql
GRANT EXECUTE ON FUNCTION public.insert_user_subscription TO service_role;
```

### Problema: El webhook sigue fallando

**Verifica:**

1. ✅ `SUPABASE_SERVICE_ROLE_KEY` está configurada en Vercel
2. ✅ La función `insert_user_subscription` existe en la base de datos
3. ✅ `service_role` tiene permisos para ejecutar la función
4. ✅ El deploy de Vercel se completó después de los cambios

### Problema: Los logs muestran que todos los métodos fallan

**Posibles causas:**

1. **Service Role Key incorrecta**
   - Verifica que sea la key de "service_role" (muy larga, empieza con `eyJ`)
   - NO debe ser la "anon" key

2. **Variables de entorno no aplicadas**
   - Haz un nuevo deploy en Vercel después de agregar/modificar variables
   - O reinicia las funciones serverless

3. **Permisos en la base de datos**
   - Verifica que el usuario de la service_role tenga permisos en la tabla

## 📝 Archivos Modificados

1. **`api/stripe-webhook.ts`**
   - Mejorada la configuración del cliente Supabase
   - Agregado fallback a función SQL
   - Mejorado el manejo de errores y logging

2. **`database/fix_webhook_rls_issue.sql`** (nuevo)
   - Script SQL para crear la función con SECURITY DEFINER
   - Verificaciones de políticas RLS

3. **`api/sync-subscription.ts`**
   - Corregido error de fechas inválidas (solución anterior)

## ✅ Checklist Final

- [ ] Script SQL ejecutado en Supabase
- [ ] Función `insert_user_subscription` creada y verificada
- [ ] Permisos otorgados a `service_role`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada en Vercel
- [ ] Deploy realizado en Vercel
- [ ] Webhook probado con una suscripción real
- [ ] Logs verificados en Vercel

## 📚 Referencias

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Service Role Key](https://supabase.com/docs/guides/api/api-keys)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)

---

**Última actualización:** 2025-11-29
**Estado:** ✅ Solución implementada y lista para probar


