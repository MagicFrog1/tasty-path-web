# Configuración de Webhook de Stripe para Suscripciones

Este documento explica cómo configurar el webhook de Stripe para que las suscripciones se actualicen automáticamente en Supabase.

## Pasos de Configuración

### 1. Crear la Tabla de Suscripciones en Supabase

Ejecuta el siguiente script SQL en el editor de SQL de Supabase:

```sql
-- Ver el archivo: database/create_subscriptions_table.sql
```

O ejecuta directamente desde Supabase Dashboard > SQL Editor.

### 2. Configurar el Webhook en Stripe

Sigue estos pasos para configurar el webhook en Stripe Dashboard:

1. **Inicia sesión en Stripe Dashboard**: Ve a [https://dashboard.stripe.com](https://dashboard.stripe.com)

2. **Navega a la sección de Webhooks**:
   - En el menú lateral izquierdo, busca y haz clic en **"Developers"** (Desarrolladores)
   - Luego haz clic en **"Webhooks"** en el submenú

3. **Crear un nuevo endpoint**:
   - Haz clic en el botón **"Add endpoint"** o **"Agregar endpoint"** (arriba a la derecha)
   - Si ya tienes webhooks, verás una lista; haz clic en **"+ Add endpoint"**

4. **Configura el endpoint**:
   - **Endpoint URL**: Ingresa la URL de tu webhook de Vercel:
     ```
     https://tu-dominio.vercel.app/api/stripe-webhook
     ```
     ⚠️ Reemplaza `tu-dominio.vercel.app` con tu dominio real de Vercel
   
   - **Description** (opcional): `TastyPath - Actualizar suscripciones en Supabase`

5. **Selecciona los eventos**:
   - En la sección **"Select events to listen to"** o **"Seleccionar eventos"**
   - Haz clic en **"Select events"** o **"Seleccionar eventos"**
   - Busca y marca los siguientes eventos:
     - ✅ `checkout.session.completed` - Cuando se completa un pago
     - ✅ `customer.subscription.updated` - Cuando se actualiza una suscripción  
     - ✅ `customer.subscription.deleted` - Cuando se cancela una suscripción
   - Haz clic en **"Add events"** o **"Agregar eventos"**

6. **Guarda el endpoint**:
   - Haz clic en **"Add endpoint"** o **"Agregar endpoint"** al final del formulario

7. **Copia el Signing Secret**:
   - Después de crear el endpoint, verás la página de detalles
   - Busca la sección **"Signing secret"** o **"Secreto de firma"**
   - Haz clic en **"Reveal"** o **"Revelar"** para ver el secreto
   - Copia el valor que empieza con `whsec_...`
   - ⚠️ **IMPORTANTE**: Guárdalo de forma segura, lo necesitarás para la variable de entorno `STRIPE_WEBHOOK_SECRET`

#### URLs Directas para Acceder a Webhooks:

Si no encuentras la opción en el menú, puedes usar estas URLs directas:

- **Para modo Test (pruebas)**: 
  ```
  https://dashboard.stripe.com/test/webhooks
  ```

- **Para modo Live (producción)**:
  ```
  https://dashboard.stripe.com/webhooks
  ```

- **Página general de Developers**:
  ```
  https://dashboard.stripe.com/developers
  ```

#### Si aún no encuentras "Add endpoint":

1. **Verifica que estés en la página correcta**:
   - Deberías ver una lista de webhooks existentes (o un mensaje diciendo que no hay webhooks)
   - En la parte superior debería decir "Webhooks" o "Webhooks endpoints"

2. **Busca el botón de diferentes formas**:
   - Botón **"+ Add"** o **"+ Agregar"** en la esquina superior derecha
   - Botón **"Create endpoint"** o **"Crear endpoint"**
   - Un ícono de **"+"** circular
   - Un enlace que diga **"Create webhook endpoint"** o **"Crear endpoint de webhook"**

3. **Si no ves ningún botón para crear**:
   - Verifica que tengas permisos de administrador en la cuenta de Stripe
   - Verifica que estés en el modo correcto (Test vs Live) usando el toggle en la parte superior
   - Intenta refrescar la página (F5)
   - Intenta en un navegador diferente o en modo incógnito

4. **Ruta alternativa paso a paso**:
   ```
   Stripe Dashboard → Menú lateral → "Developers" → "Webhooks" → Verás la lista/crear botón
   ```

5. **Si nada de esto funciona**:
   - Contacta al administrador de tu cuenta de Stripe
   - O verifica en la documentación oficial: https://stripe.com/docs/webhooks/quickstart

#### Guía Visual de la Ubicación:

```
Stripe Dashboard
│
├── Menú Lateral Izquierdo
│   │
│   └── Developers (Desarrolladores) ⬅️ Haz clic aquí
│       │
│       ├── API keys
│       ├── Webhooks ⬅️ Luego haz clic aquí
│       ├── Events
│       └── Logs
│
└── Contenido Principal
    └── Lista de Webhooks / Botón "Add endpoint" ⬅️ Aparece aquí
```

#### Alternativa: Usar Stripe CLI para desarrollo local

Si tienes problemas encontrando la opción en el Dashboard, puedes usar Stripe CLI para desarrollo:

1. **Instala Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Autentica tu cuenta**:
   ```bash
   stripe login
   ```
3. **Escucha eventos localmente**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. **Obtén el webhook secret para desarrollo**:
   - El CLI mostrará un webhook secret que empieza con `whsec_`
   - Úsalo solo para desarrollo local

**Nota**: Para producción, necesitas crear el webhook en el Dashboard de Stripe usando una de las URLs directas mencionadas arriba.

### 3. Configurar Variables de Entorno en Vercel

Agrega las siguientes variables de entorno en Vercel:

- `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (sk_...)
- `STRIPE_WEBHOOK_SECRET`: El signing secret del webhook (whsec_...)
- `SUPABASE_SERVICE_ROLE_KEY`: La clave de servicio de Supabase (permite bypass de RLS)

Para obtener `SUPABASE_SERVICE_ROLE_KEY`:
1. Ve a Supabase Dashboard > Settings > API
2. Copia el "service_role" key (⚠️ NUNCA lo expongas en el cliente)

### 4. Flujo de Suscripción

#### Cuando el Usuario Inicia el Checkout:
1. El usuario hace clic en "Suscribirse"
2. Se crea una sesión de checkout en Stripe
3. **Se crea un registro inicial en Supabase con `is_premium = false`**

#### Cuando el Usuario Completa el Pago:
1. Stripe envía el evento `checkout.session.completed` al webhook
2. El webhook:
   - Obtiene la información de la suscripción desde Stripe
   - Busca el usuario por `stripe_customer_id` o email
   - Actualiza el registro en Supabase:
     - `is_premium = true` (si el estado es `active` o `trialing`)
     - `status = 'active'`
     - Guarda `stripe_customer_id` y `stripe_subscription_id`

#### Cuando la Suscripción se Actualiza:
- El webhook recibe `customer.subscription.updated`
- Actualiza el estado en Supabase según el nuevo estado de Stripe

#### Cuando la Suscripción se Cancela:
- El webhook recibe `customer.subscription.deleted`
- Actualiza en Supabase:
  - `is_premium = false`
  - `status = 'canceled'`

### 5. Estructura de la Tabla

La tabla `user_subscriptions` tiene los siguientes campos:

```sql
- id: UUID (primary key)
- user_id: UUID (foreign key a auth.users)
- stripe_customer_id: TEXT (ID del cliente en Stripe)
- stripe_subscription_id: TEXT (ID de la suscripción en Stripe)
- plan: TEXT ('weekly' | 'monthly' | 'annual')
- is_premium: BOOLEAN (false por defecto, se actualiza a true cuando se paga)
- status: TEXT (estado de la suscripción)
- current_period_start: TIMESTAMP
- current_period_end: TIMESTAMP
- cancel_at_period_end: BOOLEAN
- canceled_at: TIMESTAMP
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 6. Verificar el Funcionamiento

1. **Probar el webhook localmente** (opcional):
   - Usa Stripe CLI para reenviar eventos: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
   - O usa ngrok para exponer tu servidor local

2. **Probar en producción**:
   - Crea una suscripción de prueba
   - Verifica en Supabase que se creó el registro con `is_premium = false`
   - Completa el pago
   - Verifica que el webhook actualizó `is_premium = true`

### 7. Troubleshooting

#### El webhook no recibe eventos:
- Verifica que la URL del webhook esté correcta
- Verifica que el endpoint esté accesible públicamente
- Revisa los logs en Vercel Functions

#### El registro no se actualiza en Supabase:
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Verifica que el usuario exista en `auth.users`
- Revisa los logs del webhook para ver errores

#### No se puede encontrar el usuario:
- El webhook intenta buscar por `stripe_customer_id` primero
- Si no encuentra, busca por email
- Asegúrate de que el email en Stripe coincida con el de Supabase

### Notas Importantes

- ⚠️ **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente
- ⚠️ **NUNCA** expongas `STRIPE_SECRET_KEY` en el cliente
- El webhook debe ser accesible públicamente para que Stripe pueda enviar eventos
- Los registros iniciales siempre tienen `is_premium = false` hasta que se complete el pago
- El webhook actualiza automáticamente el estado cuando Stripe envía eventos

