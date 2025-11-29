# 🔧 Solución: Premium No Aparece en la Web

## Problema

Después de asignar el `customer_id` en Supabase, el usuario no aparece como premium ni aparece el botón de gestión de suscripción.

## Cambios Realizados

He actualizado el código para que:

1. **ProfilePage** y **SubscriptionPage** ahora llaman a `checkSubscriptionStatus(userId)` cuando el usuario está disponible
2. Esto asegura que se consulte Supabase con el `userId` correcto

## Verificaciones Necesarias

### 1. Verificar en Supabase que el registro existe

Ejecuta este SQL en Supabase para verificar:

```sql
SELECT 
    us.*,
    u.email
FROM public.user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';
```

**Debe mostrar**:
- ✅ `stripe_customer_id` = `cus_TVdtclYuO5hGlv`
- ✅ `is_premium` = `true`
- ✅ `status` = `active`
- ✅ `plan` = `'monthly'` (o el plan que corresponda)

### 2. Verificar que el user_id coincida

El `user_id` en `user_subscriptions` debe ser el mismo que el `id` en `auth.users`:

```sql
-- Ver el user_id del usuario
SELECT id, email FROM auth.users WHERE email = 'angeldcchp94@gmail.com';

-- Verificar que coincida con user_subscriptions
SELECT user_id, stripe_customer_id, is_premium, status 
FROM public.user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com');
```

### 3. Limpiar localStorage (Opcional)

Si el problema persiste, puede ser que localStorage tenga datos antiguos. Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.removeItem('tastypath:subscription');
localStorage.removeItem('stripe_customer_id');
```

Luego recarga la página.

### 4. Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca estos mensajes:

- ✅ `✅ Suscripción encontrada en Supabase:` - Significa que encontró el registro
- ❌ `ℹ️ No se encontró suscripción en Supabase para el usuario` - Significa que no encontró el registro

### 5. Verificar que el usuario esté autenticado

El código necesita el `user.id` del usuario autenticado. Verifica que:
- El usuario esté logueado
- El `user.id` coincida con el `user_id` en Supabase

## Si Aún No Funciona

### Opción A: Verificar el SQL ejecutado

Asegúrate de que ejecutaste el SQL correctamente. Vuelve a ejecutar:

```sql
INSERT INTO public.user_subscriptions (
    user_id,
    stripe_customer_id,
    plan,
    is_premium,
    status,
    created_at,
    updated_at
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com'),
    'cus_TVdtclYuO5hGlv',
    'monthly',
    true,
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    is_premium = true,
    status = 'active',
    updated_at = NOW();
```

### Opción B: Verificar RLS (Row Level Security)

Si las políticas RLS están bloqueando el acceso, verifica que el usuario pueda leer su propia suscripción:

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'user_subscriptions';
```

### Opción C: Forzar actualización

En la consola del navegador, ejecuta:

```javascript
// Obtener el userId del usuario autenticado
const userId = 'TU_USER_ID_AQUI'; // Reemplaza con el user_id real

// Llamar directamente a la función
fetch(`/api/check-subscription?userId=${userId}`)
  .then(res => res.json())
  .then(data => console.log('Suscripción:', data));
```

## Código Actualizado

Los archivos modificados:
- ✅ `src/pages/ProfilePage.tsx` - Ahora actualiza el estado cuando el usuario está disponible
- ✅ `src/pages/SubscriptionPage.tsx` - Ahora actualiza el estado cuando el usuario está disponible

## Próximos Pasos

1. **Recarga la página** después de los cambios
2. **Abre la consola** (F12) y verifica los logs
3. **Verifica en Supabase** que el registro existe y tiene los valores correctos
4. Si sigue sin funcionar, comparte los logs de la consola

