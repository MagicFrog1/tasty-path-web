# Instrucciones para Ejecutar el Script SQL en Supabase

## Problema Actual
Error 42501: "new row violates row-level security policy for table 'user_profiles'"

## Solución
Ejecutar el script SQL para configurar las políticas RLS correctamente.

---

## Paso 1: Verificar Estado Actual (Opcional)

1. Ve a **Supabase Dashboard**: https://app.supabase.com/
2. Selecciona tu proyecto: `zftqkqnjpjnmwfwsmxdy`
3. Abre **SQL Editor** (menú lateral)
4. Ejecuta el script: `database/DIAGNOSTICO_COMPLETO.sql`

Este script te mostrará:
- ✅ Si el campo `id` es UUID (ya confirmado)
- ✅ Si RLS está habilitado
- ❌ Qué políticas existen actualmente

---

## Paso 2: Ejecutar el Fix

1. En **Supabase SQL Editor**, click en **"New query"**
2. Copia **TODO** el contenido del archivo: `database/fix_rls_simple.sql`
3. Pega en el editor SQL
4. Click en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

---

## Paso 3: Verificar Resultado

Después de ejecutar el script, deberías ver:

### Resultado Esperado:
```
3 políticas creadas:
1. users_select_own (SELECT)
2. users_insert_own (INSERT) ← Esta es la importante
3. users_update_own (UPDATE)
```

### Tabla Verificación:
Al final del script verás una tabla mostrando:
- `policyname`: Nombre de la política
- `cmd`: Operación (SELECT, INSERT, UPDATE)
- `qual`: Condición para SELECT
- `with_check`: Condición para INSERT/UPDATE

---

## Paso 4: Probar

1. Recarga tu aplicación en Vercel (o localmente)
2. Intenta registrar un nuevo usuario
3. ✅ Debería funcionar sin el error 42501

---

## Si Sigue Fallando

1. Verifica que ejecutaste el script completo (sin errores)
2. Verifica que ves las 3 políticas en el resultado
3. Verifica que RLS está habilitado (debe ser `true`)
4. Comparte el error específico si persiste

---

## Scripts Disponibles

- **`DIAGNOSTICO_COMPLETO.sql`** - Ver estado actual (opcional)
- **`fix_rls_simple.sql`** - ⭐ EJECUTAR ESTE - Fix completo de RLS
- **`setup_supabase_new_project.sql`** - Setup completo para proyecto nuevo

