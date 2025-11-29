# 🚀 Guía Rápida: Crear Webhook en Stripe Dashboard

## ⚠️ IMPORTANTE: Esta es una guía paso a paso con capturas

Estás en la página de configuración de **MyTastyPath/Developers**, pero necesitas ir a **Stripe Dashboard** para crear el webhook.

## 📍 Paso 1: Acceder a Stripe Dashboard

1. **Abre una nueva pestaña** en tu navegador
2. Ve a: **https://dashboard.stripe.com**
3. **Inicia sesión** con tu cuenta de Stripe

## 📍 Paso 2: Navegar a Webhooks

Una vez dentro de Stripe Dashboard, tienes **DOS formas** de llegar a Webhooks:

### Opción A: Usar el Menú Lateral (Más Seguro)

1. Mira el **menú lateral izquierdo** (barra vertical con íconos)
2. Busca y haz clic en **"Developers"** o **"Desarrolladores"** 
   - Puede tener un ícono de herramientas o código `</>`
3. En el submenú que aparece, busca y haz clic en **"Webhooks"**
   - Deberías ver una lista de webhooks o un botón para crear uno

### Opción B: URL Directa (Más Rápido) ⚡

Copia y pega esta URL directamente en tu navegador:

**Para modo Test (Pruebas)**:
```
https://dashboard.stripe.com/test/webhooks
```

**Para modo Live (Producción)**:
```
https://dashboard.stripe.com/webhooks
```

## 📍 Paso 3: Crear el Endpoint

Una vez en la página de Webhooks (en Stripe Workbench):

1. **Busca el botón "+ Add a destination"** o **"+ Agregar un destino"**
   - Es el botón púrpura/violeta prominente en el centro de la página
   - Deberías ver un mensaje que dice "Activate reactions in your Stripe event integration"

2. **Haz clic en "+ Add a destination"**
   - Esto abrirá un modal o formulario para configurar el webhook endpoint

3. Si ves la nueva interfaz de Stripe Workbench:
   - Verás pestañas: "Summary", "Webhooks", "Events", etc.
   - La pestaña "Webhooks" ya está seleccionada (marcada en púrpura)
   - El botón está justo debajo del diagrama visual (Stripe → JSON → Cloud)

## 📍 Paso 4: Llenar el Formulario

Cuando hagas clic en **"+ Add a destination"**, verás un formulario o modal. Selecciona la opción de **"Webhook endpoint"** o **"Endpoint de webhook"**:

### Opción 1: Webhook Endpoint (Recomendado)

Selecciona **"Webhook endpoint"** como tipo de destino.

### 1. Endpoint URL
```
https://tu-dominio.vercel.app/api/stripe-webhook
```
⚠️ **Reemplaza** `tu-dominio.vercel.app` con tu dominio real de Vercel

**Ejemplo real**:
```
https://mi-app-tastypath.vercel.app/api/stripe-webhook
```

### 2. Description (Opcional)
```
TastyPath - Actualizar suscripciones en Supabase
```

### 3. Select Events (¡MUY IMPORTANTE!)

Haz clic en **"Select events"** o **"Seleccionar eventos"** y busca:

✅ **Marca estos tres eventos**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Luego haz clic en **"Add events"** o **"Agregar eventos"**

### 4. Guardar

Haz clic en **"Add endpoint"** o **"Agregar endpoint"** al final del formulario

## 📍 Paso 5: Copiar el Signing Secret

Después de crear el endpoint:

1. Te redirigirá a la página de detalles del webhook
2. Busca la sección **"Signing secret"**
3. Haz clic en **"Reveal"** o **"Revelar"**
4. **Copia el valor completo** que empieza con `whsec_`
5. **Guárdalo** - lo necesitarás para la variable de entorno `STRIPE_WEBHOOK_SECRET` en Vercel

## 🔍 ¿Sigues sin Encontrarlo?

### Verifica que estás en Stripe Dashboard:

- ✅ La URL debe ser: `dashboard.stripe.com`
- ✅ Debe tener el logo de Stripe (franjas rojas/blancas)
- ❌ NO debe ser tu aplicación (MyTastyPath)

### Si no tienes cuenta de Stripe:

1. Ve a: https://stripe.com
2. Haz clic en **"Sign in"** o **"Create account"**
3. Crea una cuenta gratuita
4. Luego sigue los pasos de arriba

### Si tienes cuenta pero no ves la opción:

1. Verifica que tengas permisos de administrador
2. Contacta al administrador de la cuenta de Stripe
3. O verifica que estés usando el modo correcto (Test vs Live)

## 📝 Checklist Final

Antes de continuar, verifica que tengas:

- [ ] Acceso a Stripe Dashboard (https://dashboard.stripe.com)
- [ ] Webhook creado con la URL correcta de Vercel
- [ ] Los 3 eventos seleccionados
- [ ] El Signing Secret copiado (empieza con `whsec_`)
- [ ] Listo para agregarlo como variable de entorno en Vercel

## 🎯 Siguiente Paso

Una vez que tengas el Signing Secret, continúa con:
- **Paso 3** en `STRIPE_WEBHOOK_SETUP.md`: Configurar Variables de Entorno en Vercel

