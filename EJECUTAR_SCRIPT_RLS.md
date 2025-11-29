# 🚀 Guía Rápida: Ejecutar Script SQL para Fix RLS

## 📋 Script a Ejecutar

El script completo está en: `database/fix_webhook_rls_issue.sql`

## ⚡ Pasos para Ejecutarlo en Supabase

### Paso 1: Acceder a Supabase Dashboard

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto

### Paso 2: Abrir SQL Editor

1. En el menú lateral izquierdo, haz clic en **SQL Editor**
2. Haz clic en **New Query** (Nueva consulta)

### Paso 3: Ejecutar el Script

1. **Opción A: Copiar todo el script**
   - Abre el archivo `database/fix_webhook_rls_issue.sql`
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pega en el SQL Editor de Supabase
   - Haz clic en **Run** o presiona `Ctrl+Enter`

2. **Opción B: Ejecutar paso por paso**
   - Puedes ejecutar cada sección del script por separado
   - Es recomendable ejecutarlo todo de una vez

### Paso 4: Verificar Resultados

El script incluye verificaciones al final. Deberías ver:

#### ✅ Verificación 1: Políticas RLS
Deberías ver 3 políticas:
- `user_subscriptions_select_own` (SELECT)
- `user_subscriptions_insert_own` (INSERT)
- `user_subscriptions_update_own` (UPDATE)

#### ✅ Verificación 2: Función SQL
Deberías ver la función:
- `insert_user_subscription` con `is_security_definer = true`

## ⚠️ Importante

### Si aparece algún error:

1. **Error: "policy already exists"**
   - ✅ Es normal, el script usa `DROP POLICY IF EXISTS` para evitar esto
   - Continúa con el siguiente paso

2. **Error: "function already exists"**
   - ✅ Es normal, el script usa `CREATE OR REPLACE FUNCTION` para actualizarla
   - La función se actualizará correctamente

3. **Error: "permission denied"**
   - Verifica que estés usando una cuenta con permisos de administrador
   - O ejecuta el script desde el SQL Editor (que tiene permisos completos)

## 🔍 Después de Ejecutar

### Verificar que Funcionó:

Ejecuta esta query para verificar:

```sql
-- Verificar políticas
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ SELECT'
        WHEN cmd = 'INSERT' THEN '✅ INSERT'
        WHEN cmd = 'UPDATE' THEN '✅ UPDATE'
        ELSE cmd
    END as operacion
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'user_subscriptions'
ORDER BY cmd;

-- Verificar función
SELECT 
    proname as function_name,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'insert_user_subscription';
```

### Resultado Esperado:

1. **Políticas:** Deberías ver 3 políticas (SELECT, INSERT, UPDATE)
2. **Función:** Deberías ver `insert_user_subscription` con `is_security_definer = true`

## 📝 Notas

- El script es **idempotente** (se puede ejecutar múltiples veces sin problemas)
- No afecta datos existentes
- Solo actualiza políticas y crea/actualiza la función

## 🎯 Próximos Pasos

Después de ejecutar el script:

1. ✅ Verifica que el webhook pueda insertar/actualizar suscripciones
2. ✅ Prueba creando una nueva suscripción desde Stripe
3. ✅ Revisa los logs del webhook en Vercel para confirmar que funciona

## 🆘 Si Algo Sale Mal

Si después de ejecutar el script sigue habiendo problemas:

1. Revisa los logs del webhook en Vercel
2. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada correctamente
3. Verifica que el webhook esté usando la función SQL como fallback (ya está implementado en el código)

---

**Archivo del script:** `database/fix_webhook_rls_issue.sql`  
**Última actualización:** 2025-11-29

