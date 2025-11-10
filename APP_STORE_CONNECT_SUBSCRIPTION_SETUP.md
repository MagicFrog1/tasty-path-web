# Configuración de Suscripciones en App Store Connect

## Resumen

Esta guía detalla la configuración necesaria en App Store Connect para cumplir con Apple Guideline 3.1.2 - Business - Payments - Subscriptions y resolver el error de metadata de suscripción incompleta.

---

## ⚠️ IMPORTANTE: Configuración Requerida en App Store Connect

Para resolver el error de Apple Guideline 3.1.2, debes completar la siguiente configuración en App Store Connect:

### 1. 📱 **Información Básica de la App**

En la sección **App Information**:

- **Nombre de la App:** TastyPath
- **Subtítulo:** Planificador de Comidas Inteligente
- **Categoría Principal:** Health & Fitness
- **Categoría Secundaria:** Food & Drink

### 2. 🔐 **Configuración de Suscripciones**

#### **Grupo de Suscripciones:**
- **Nombre del Grupo:** TastyPath Premium
- **ID del Grupo:** `tastypath_premium_group`

#### **Productos de Suscripción Auto-Renovable:**

##### **Plan Semanal:**
- **ID del Producto:** `com.magic1frog2.TastyPath.Weekly`
- **Nombre de Referencia:** TastyPath Weekly Premium
- **Título de Suscripción:** Plan Semanal Premium
- **Duración:** 1 semana
- **Precio:** €4,99
- **Precio por Unidad:** €4,99/semana

**Descripción del Plan Semanal:**
```
Acceso completo a TastyPath Premium por 1 semana.

✅ Planes de comida ilimitados y personalizados
✅ Acceso completo a la base de datos de recetas
✅ Generación automática de listas de compras
✅ Configuraciones avanzadas de dieta
✅ Soporte prioritario por email

Suscripción con renovación automática. Se renueva automáticamente cada semana a €4,99 a menos que se cancele al menos 24 horas antes del final del período actual. La cancelación toma efecto al final del período de facturación actual.
```

##### **Plan Mensual:**
- **ID del Producto:** `com.magic1frog2.TastyPath.Monthly`
- **Nombre de Referencia:** TastyPath Monthly Premium
- **Título de Suscripción:** Plan Mensual Premium
- **Duración:** 1 mes
- **Precio:** €7,99
- **Precio por Unidad:** €7,99/mes

**Descripción del Plan Mensual:**
```
Acceso completo a TastyPath Premium por 1 mes. ¡Plan más popular!

✅ Planes de comida ilimitados y personalizados
✅ Acceso completo a la base de datos de recetas
✅ Generación automática de listas de compras
✅ Configuraciones avanzadas de dieta
✅ Soporte prioritario por email

Suscripción con renovación automática. Se renueva automáticamente cada mes a €7,99 a menos que se cancele al menos 24 horas antes del final del período actual. La cancelación toma efecto al final del período de facturación actual.
```

##### **Plan Anual:**
- **ID del Producto:** `com.magic1frog2.TastyPath.Annual`
- **Nombre de Referencia:** TastyPath Annual Premium
- **Título de Suscripción:** Plan Anual Premium - ¡Mejor Valor!
- **Duración:** 1 año
- **Precio:** €79,99
- **Precio por Unidad:** €6,67/mes (equivalente)

**Descripción del Plan Anual:**
```
Acceso completo a TastyPath Premium por 1 año completo. ¡Ahorra hasta el 17%!

✅ Planes de comida ilimitados y personalizados
✅ Acceso completo a la base de datos de recetas
✅ Generación automática de listas de compras
✅ Configuraciones avanzadas de dieta
✅ Soporte prioritario por email
💰 Equivale a solo €6,67/mes - ¡Mejor valor garantizado!

Suscripción con renovación automática. Se renueva automáticamente cada año a €79,99 a menos que se cancele al menos 24 horas antes del final del período actual. La cancelación toma efecto al final del período de facturación actual.
```

### 3. 📄 **Enlaces Legales Obligatorios**

En la sección **App Information**, añadir:

#### **Política de Privacidad:**
- **URL:** `https://tu-dominio.com/privacy` (debes crear esta página web)
- **Contenido:** Debe coincidir exactamente con el contenido de `src/screens/PrivacyScreen.tsx`

#### **Términos de Uso (EULA):**
- **URL:** `https://tu-dominio.com/terms` (debes crear esta página web)
- **Contenido:** Debe coincidir exactamente con el contenido de `src/screens/TermsScreen.tsx`

### 4. 🌐 **Páginas Web Requeridas**

**CRÍTICO:** Apple requiere que estos enlaces sean accesibles públicamente. Debes crear:

#### **https://tu-dominio.com/privacy**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - TastyPath</title>
</head>
<body>
    <h1>Política de Privacidad - TastyPath</h1>
    <!-- Copiar el contenido exacto de src/screens/PrivacyScreen.tsx -->
    <!-- Convertir a HTML manteniendo toda la información -->
</body>
</html>
```

#### **https://tu-dominio.com/terms**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Términos de Servicio - TastyPath</title>
</head>
<body>
    <h1>Términos de Servicio - TastyPath</h1>
    <!-- Copiar el contenido exacto de src/screens/TermsScreen.tsx -->
    <!-- Convertir a HTML manteniendo toda la información de suscripciones -->
</body>
</html>
```

### 5. 💳 **Información de Facturación**

En cada producto de suscripción, especificar:

- **Método de Pago:** A través de Apple App Store
- **Moneda:** EUR (Euro)
- **Disponibilidad:** Todos los territorios donde la app está disponible
- **Familia de Productos:** TastyPath Premium

### 6. 📊 **Metadata Adicional**

#### **Información de Contacto de Soporte:**
- **Email:** tastypathhelp@gmail.com
- **URL de Soporte:** `https://tu-dominio.com/support` (opcional pero recomendado)

#### **Información de Marketing:**
- **Descripción de Beneficios Premium:**
  - "Acceso ilimitado a planes de comida personalizados"
  - "Base de datos completa de recetas saludables"
  - "Generación automática de listas de compras"
  - "Configuraciones avanzadas de dieta y alergias"
  - "Soporte prioritario por email"

---

## ✅ **Lista de Verificación**

Antes de enviar a revisión, confirma que tienes:

- [ ] **Grupo de suscripciones creado** con nombre descriptivo
- [ ] **Tres productos de suscripción configurados** con IDs correctos
- [ ] **Títulos descriptivos** para cada suscripción
- [ ] **Duraciones específicas** (1 semana, 1 mes, 1 año)
- [ ] **Precios correctos** (€4,99, €7,99, €79,99)
- [ ] **Descripciones detalladas** con beneficios y términos
- [ ] **URL de Política de Privacidad** funcional y pública
- [ ] **URL de Términos de Uso** funcional y pública
- [ ] **Información de contacto** para soporte
- [ ] **Metadata completa** en todos los campos requeridos

---

## 🚨 **Errores Comunes a Evitar**

1. **URLs no funcionales:** Apple verifica que los enlaces funcionen
2. **Contenido inconsistente:** Los términos en la web deben coincidir con la app
3. **Precios incorrectos:** Deben coincidir con RevenueCat y StoreKit
4. **Descripciones vagas:** Ser específico sobre beneficios y términos
5. **Falta de información de renovación:** Especificar claramente la renovación automática

---

## 📞 **Contacto para Revisión**

Una vez completada la configuración:

1. **Envía la app a revisión** en App Store Connect
2. **Espera la respuesta** de Apple (normalmente 24-48 horas)
3. **Si hay problemas adicionales,** contacta: tastypathhelp@gmail.com

---

**✅ Con esta configuración, tu app debería pasar la revisión de Apple Guideline 3.1.2 sin problemas.**
