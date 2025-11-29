# ✅ Solución al Problema del Webhook

## Problemas Identificados

### 1. ❌ `client_reference_id: null`
**Problema:** El `userId` no se estaba pasando al crear la sesión de checkout, resultando en `client_reference_id: null`.

**Causa:** El `userId` puede estar llegando como `undefined` o `null` cuando se crea la sesión.

**Solución:** 
- Mejorado el logging para ver qué está pasando con el `userId`
- Validación para asegurar que solo se pase si es válido
- Búsqueda alternativa por email en `user_profiles`

### 2. ❌ Error `AuthApiError: User not allowed`
**Problema:** El webhook intentaba usar `supabase.auth.admin.listUsers()` que falla con permisos.

**Solución:** Cambiado para buscar por email en la tabla `user_profiles` directamente.

## Cambios Realizados

### `api/stripe-webhook.ts`
1. ✅ Búsqueda por email ahora usa `user_profiles` en lugar de `auth.admin.listUsers()`
2. ✅ Mejor manejo cuando `userId` no se encuentra
3. ✅ Intenta buscar por `customer_id` existente como último recurso

### `api/create-checkout-session.ts`
1. ✅ Mejor logging del `userId` recibido
2. ✅ Validación para no pasar `client_reference_id` si `userId` es inválido
3. ✅ Solo incluir `userId` en metadata si es válido

## Próximos Pasos

### 1. Verificar que `user?.id` se Pase Correctamente

En `src/pages/SubscriptionPage.tsx` línea 656, verifica que:
```typescript
user?.id  // Este debe tener el ID del usuario de Supabase
```

Si es `undefined`, el problema está en la autenticación. Verifica:
- Que el usuario esté autenticado
- Que `useAuth()` esté devolviendo el `user` correctamente

### 2. Probar una Nueva Suscripción

1. Haz una nueva suscripción
2. Revisa los logs de Vercel para ver:
   - `📥 Request recibido:` - Debe mostrar el `userId`
   - `✅ Sesión de checkout creada:` - Debe tener `client_reference_id`
3. Revisa los logs del webhook para ver:
   - `✅ Usuario obtenido desde client_reference_id:`
   - O `✅ Usuario encontrado por email en user_profiles:`

### 3. Si el Problema Persiste

Si `user?.id` sigue siendo `undefined`:

**Opción A: Verificar AuthContext**
```typescript
// En src/pages/SubscriptionPage.tsx, agrega antes de handleSelectPlan:
console.log('🔍 User info:', {
  user: user,
  userId: user?.id,
  email: user?.email,
});
```

**Opción B: Usar el email como respaldo**
Si el `userId` no está disponible, podríamos modificar el flujo para usar el email, pero es menos seguro.

## Verificación en Stripe

Después de crear una nueva sesión, verifica en Stripe Dashboard:

1. Ve a [Checkout Sessions](https://dashboard.stripe.com/payments)
2. Busca la sesión más reciente
3. Verifica que tenga:
   - `client_reference_id`: Debe ser el UUID del usuario
   - `metadata.userId`: Debe ser el UUID del usuario

Si ambos están vacíos, el problema está en cómo se está pasando el `userId` desde el frontend.

