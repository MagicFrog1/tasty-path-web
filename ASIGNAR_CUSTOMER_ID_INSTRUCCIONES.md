# 🔗 Asignar Customer ID Manualmente

## Asignar `cus_TVdtclYuO5hGlv` a `angeldcchp94@gmail.com`

### Opción 1: Script Simple (Recomendado)

Ejecuta este SQL en Supabase Dashboard > SQL Editor:

```sql
-- Asignar customer_id de Stripe al usuario
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
    'monthly',  -- Ajusta según el plan: 'weekly', 'monthly', 'annual'
    true,       -- true si tiene suscripción activa
    'active',   -- Estado de la suscripción
    NOW(),
    NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    updated_at = NOW();

-- Verificar que se asignó correctamente
SELECT 
    us.id,
    us.stripe_customer_id,
    us.plan,
    us.is_premium,
    us.status,
    u.email
FROM public.user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE u.email = 'angeldcchp94@gmail.com';
```

### Opción 2: Solo Actualizar (Si ya tiene registro)

Si el usuario ya tiene un registro en `user_subscriptions`, usa este:

```sql
UPDATE public.user_subscriptions
SET 
    stripe_customer_id = 'cus_TVdtclYuO5hGlv',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'angeldcchp94@gmail.com'
);
```

## Pasos:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Haz clic en **"New query"** o **"Nueva consulta"**
5. Copia y pega el SQL de la **Opción 1** (el script simple)
6. Haz clic en **"Run"** o **"Ejecutar"**
7. Verifica el resultado con el SELECT al final

## Ajustar el Plan

Si necesitas cambiar el plan, modifica esta línea:

```sql
'monthly',  -- Opciones: 'weekly', 'monthly', 'annual'
```

## Después de Ejecutar

Una vez asignado el customer_id:
- ✅ El usuario podrá gestionar su suscripción desde el panel
- ✅ El webhook actualizará este registro automáticamente
- ✅ El sistema identificará al usuario como premium según el estado

