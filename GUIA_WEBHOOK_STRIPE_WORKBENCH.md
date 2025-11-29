# 🎯 Guía Específica: Crear Webhook en Stripe Workbench (Nueva Interfaz)

## ✅ ¡Perfecto! Ya estás en la página correcta

Veo que estás en:
- ✅ Stripe Dashboard: `dashboard.stripe.com`
- ✅ Pestaña "Webhooks" seleccionada
- ✅ En la interfaz de **Stripe Workbench** (la nueva interfaz de desarrolladores)

## 🚀 Pasos para Crear el Webhook

### Paso 1: Haz clic en "+ Add a destination"

En la página que estás viendo, encontrarás:

1. **Un botón púrpura/violeta grande** que dice:
   ```
   "+ Add a destination"
   ```
   o en español:
   ```
   "+ Agregar un destino"
   ```

2. Este botón está justo debajo del diagrama visual que muestra:
   ```
   [Stripe] → [JSON Data] → [Cloud Icon]
   ```

3. **Haz clic en ese botón**

### Paso 2: Seleccionar el tipo de destino

Después de hacer clic, verás opciones. Selecciona:

✅ **"Webhook endpoint"** o **"Endpoint de webhook"**

(No selecciones "Amazon EventBridge" ni "Local listener" para este caso)

### Paso 3: Configurar el Webhook Endpoint

Completa el formulario que aparece:

#### 1. Endpoint URL
```
https://tu-dominio.vercel.app/api/stripe-webhook
```

⚠️ **Reemplaza** `tu-dominio.vercel.app` con tu dominio real de Vercel.

**Ejemplo**:
```
https://mi-app-tastypath.vercel.app/api/stripe-webhook
```

**¿Dónde encuentras tu dominio de Vercel?**
- Ve a [Vercel Dashboard](https://vercel.com/dashboard)
- Selecciona tu proyecto
- Ve a Settings > Domains
- O simplemente copia el dominio que te dio Vercel cuando desplegaste

#### 2. Description (Opcional pero recomendado)
```
TastyPath - Actualizar suscripciones en Supabase
```

#### 4. Seleccionar Eventos

Busca la sección **"Select events"** o **"Seleccionar eventos"** y marca:

✅ `checkout.session.completed`
✅ `customer.subscription.updated`
✅ `customer.subscription.deleted`

**Consejo**: Puedes usar el buscador para encontrar cada evento rápidamente.

### Paso 4: Guardar el Endpoint

1. Revisa que todo esté correcto
2. Haz clic en **"Add destination"** o **"Agregar destino"**
3. O el botón que aparezca para confirmar (puede decir "Save" o "Guardar")

### Paso 5: Obtener el Signing Secret

Después de crear el endpoint:

1. Serás redirigido a la página de detalles del webhook
2. Busca la sección **"Signing secret"** o **"Secreto de firma"**
   - Puede estar en la parte superior
   - O en una pestaña/sección de configuración
3. Haz clic en **"Reveal"** o **"Revelar"** para verlo
4. **Copia el valor completo** que empieza con `whsec_`

⚠️ **MUY IMPORTANTE**: 
- Guárdalo de forma segura
- Lo necesitarás para la variable de entorno `STRIPE_WEBHOOK_SECRET` en Vercel
- No lo compartas públicamente

## 📋 Resumen Rápido

1. ✅ Ya estás en la página correcta (Stripe Dashboard > Webhooks)
2. 👆 Haz clic en **"+ Add a destination"** (botón púrpura)
3. 🔘 Selecciona **"Webhook endpoint"**
4. 📝 Completa el formulario con tu URL de Vercel
5. ✅ Selecciona los 3 eventos requeridos
6. 💾 Guarda el endpoint
7. 🔑 Copia el Signing Secret (empieza con `whsec_`)

## 🔍 Si no ves el botón "+ Add a destination"

- Verifica que estés en la pestaña **"Webhooks"** (debe estar marcada en púrpura)
- Si ves una lista de webhooks existentes, busca un botón **"+ Add"** en la esquina superior derecha
- Intenta refrescar la página (F5)

## 🎯 Siguiente Paso

Una vez que tengas el Signing Secret:

1. Ve a Vercel Dashboard
2. Settings > Environment Variables
3. Agrega: `STRIPE_WEBHOOK_SECRET` con el valor que copiaste (`whsec_...`)
4. Haz redeploy de tu aplicación

¡Listo! Tu webhook estará configurado y recibirá eventos automáticamente.

