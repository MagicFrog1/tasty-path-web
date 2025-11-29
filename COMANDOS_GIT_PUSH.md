# 📝 Comandos para Hacer Push a Main

## Flujo Completo de Git Push

### 1. Verificar el estado actual
```bash
git status
```
**Qué hace:** Muestra qué archivos han cambiado y cuáles están listos para commitear.

---

### 2. Agregar archivos al staging area

**Opción A: Agregar todos los archivos modificados**
```bash
git add .
```
o
```bash
git add -A
```

**Opción B: Agregar archivos específicos**
```bash
git add nombre-del-archivo.ts
git add src/pages/SubscriptionPage.tsx
git add api/stripe-webhook.ts
```

**Qué hace:** Prepara los archivos para ser commitados.

---

### 3. Hacer commit de los cambios

```bash
git commit -m "Descripción del cambio"
```

**Ejemplos de mensajes de commit:**
```bash
git commit -m "fix: Corregir problema de webhook"
git commit -m "feat: Agregar nueva funcionalidad de suscripción"
git commit -m "docs: Actualizar documentación"
```

**Qué hace:** Guarda los cambios en el historial local de Git.

---

### 4. Hacer push a main

```bash
git push origin main
```

**Qué hace:** Envía los commits locales al repositorio remoto en GitHub.

---

## 🔄 Flujo Completo en un Solo Comando (PowerShell)

```powershell
git add -A; git commit -m "Tu mensaje aquí"; git push origin main
```

**Nota:** En PowerShell, usa `;` para separar comandos en lugar de `&&`.

---

## 📋 Ejemplo Completo Paso a Paso

```bash
# 1. Verificar estado
git status

# 2. Agregar todos los cambios
git add -A

# 3. Hacer commit con mensaje descriptivo
git commit -m "fix: Corregir problema de userId en webhook"

# 4. Hacer push a main
git push origin main
```

---

## ⚠️ Comandos Importantes Adicionales

### Ver los últimos commits
```bash
git log --oneline -5
```

### Ver qué archivos cambiaron
```bash
git diff
```

### Deshacer cambios no commiteados
```bash
git restore nombre-del-archivo.ts
```

### Deshacer el último commit (mantener cambios)
```bash
git reset --soft HEAD~1
```

### Ver diferencias antes de hacer commit
```bash
git diff --staged
```

---

## 🚨 Si Hay Conflictos

Si al hacer push aparece un error de que necesitas hacer pull primero:

```bash
# 1. Traer cambios del remoto
git pull origin main

# 2. Resolver conflictos si los hay
# 3. Agregar archivos resueltos
git add -A

# 4. Hacer commit del merge
git commit -m "Merge: Resolver conflictos"

# 5. Hacer push
git push origin main
```

---

## 📝 Resumen Rápido

**Los 3 comandos esenciales son:**

1. `git add -A` → Agrega cambios
2. `git commit -m "mensaje"` → Guarda cambios
3. `git push origin main` → Envía a GitHub


