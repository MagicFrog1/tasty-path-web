# 💳 Explicación Completa: Flujo de Pagos y Customer ID

## 📋 Resumen General

El sistema funciona en **tres etapas principales**:

1. **Usuario inicia checkout** → Se crea registro inicial en Supabase con `is_premium = false`
2. **Usuario completa pago** → Stripe envía evento automático al webhook
3. **Webhook procesa evento** → Actualiza Supabase automáticamente con `is_premium = true`

---

## 🔄 FLUJO COMPLETO PASO A PASO

### ETAPA 1: Usuario Inicia el Checkout

#### ¿Qué pasa cuando el usuario hace clic en "Suscribirse"?

1. **Frontend (`src/pages/SubscriptionPage.tsx`)**:
   ```typescript
   // Usuario hace clic en un plan
   await redirectToCheckout(planId, user?.email, user?.id);
   ```
   - Se pasa el `planId` (weekly/monthly/annual)
   - Se pasa el `email` del usuario
   - Se pasa el `userId` del usuario autenticado

2. **Servicio Stripe (`src/services/stripeService.ts`)**:
   ```typescript
   // Llama a la API del backend
   fetch('/api/create-checkout-session', {
     method: 'POST',
     body: JSON.stringify({
       planId,
       customerEmail,
       userId,  // ← Este es el ID del usuario en Supabase
     }),
   });
   ```

3. **Backend (`api/create-checkout-session.ts`)**:
   
   **Paso 3.1**: Crea la sesión de checkout en Stripe:
   ```typescript
   const session = await stripe.checkout.sessions.create({
     line_items: [{ price: priceId, quantity: 1 }],
     mode: 'subscription',
     customer_email: customerEmail,
     // Stripe crea automáticamente un customer si no existe
   });
   ```
   - Stripe puede crear un `customer_id` automáticamente en este momento
   - O lo creará después cuando el usuario complete el pago

   **Paso 3.2**: Guarda registro inicial en Supabase:
   ```typescript
   // Si tenemos userId, crear registro inicial en Supabase
   if (userId) {
     const subscriptionData = {
       user_id: userId,              // ID del usuario en Supabase
       stripe_customer_id: session.customer || null,  // Puede ser null aquí
       plan: planId,
       is_premium: false,            // ← SIEMPRE false al inicio
       status: 'incomplete',
     };
     
     // Guardar en Supabase
     supabase.from('user_subscriptions').upsert(subscriptionData);
   }
   ```

   **Resultado**: Se crea un registro en `user_subscriptions` con:
   - ✅ `user_id` = ID del usuario en Supabase
   - ✅ `plan` = weekly/monthly/annual
   - ❌ `is_premium` = **false** (aún no ha pagado)
   - ❌ `status` = 'incomplete'
   - ⚠️ `stripe_customer_id` = puede ser null o el customer_id si Stripe lo creó

4. **Redirección a Stripe**:
   - El usuario es redirigido a la página de pago de Stripe
   - El usuario ingresa su tarjeta y completa el pago

---

### ETAPA 2: Usuario Completa el Pago

#### ¿Qué pasa cuando el usuario paga en Stripe?

1. **Stripe procesa el pago**:
   - Stripe valida la tarjeta
   - Stripe procesa el pago
   - Stripe crea o actualiza el `customer` en Stripe
   - Stripe crea la `subscription` en Stripe

2. **Stripe envía evento automáticamente**:
   - Stripe envía un evento `checkout.session.completed` 
   - Este evento se envía **AUTOMÁTICAMENTE** al webhook que configuraste
   - La URL del webhook es: `https://tu-dominio.vercel.app/api/stripe-webhook`

---

### ETAPA 3: Webhook Procesa el Evento (AUTOMÁTICO)

#### ¿Cómo funciona el webhook?

**Archivo**: `api/stripe-webhook.ts`

1. **Stripe envía el evento al webhook**:
   ```http
   POST https://tu-dominio.vercel.app/api/stripe-webhook
   Headers:
     - stripe-signature: whsec_...
   Body:
     - event.type: "checkout.session.completed"
     - event.data.object: { session, subscription, customer, ... }
   ```

2. **El webhook verifica la firma**:
   ```typescript
   // Verificar que el evento viene realmente de Stripe
   event = stripe.webhooks.constructEvent(
     req.body,
     signature,
     webhookSecret
   );
   ```
   - Esto asegura que el evento es auténtico y no es un ataque

3. **El webhook procesa el evento `checkout.session.completed`**:

   **Paso 3.1**: Obtiene información de la sesión:
   ```typescript
   const session = event.data.object;  // La sesión de checkout completada
   const subscriptionId = session.subscription;  // ID de la suscripción
   ```

   **Paso 3.2**: Obtiene la suscripción completa desde Stripe:
   ```typescript
   const subscription = await stripe.subscriptions.retrieve(subscriptionId);
   const customerId = subscription.customer;  // ← Aquí está el customer_id!
   ```
   - Ahora tenemos el `customer_id` completo de Stripe

   **Paso 3.3**: Busca el usuario en Supabase:
   ```typescript
   // Opción 1: Buscar por customer_id si ya estaba guardado
   const existing = await supabase
     .from('user_subscriptions')
     .select('user_id')
     .eq('stripe_customer_id', customerId)
     .single();
   
   if (existing) {
     userId = existing.user_id;  // ← Encontramos el usuario
   }
   
   // Opción 2: Si no lo encontramos, buscar por email
   else if (session.customer_email) {
     const authUser = await supabase.auth.admin.getUserByEmail(session.customer_email);
     userId = authUser.user.id;  // ← Usuario encontrado por email
   }
   ```

   **Paso 3.4**: Determina el plan del price_id:
   ```typescript
   const priceId = subscription.items.data[0]?.price.id;
   // Compara con las variables de entorno para saber qué plan es
   let plan = 'monthly';
   if (priceId === STRIPE_PRICE_WEEKLY) plan = 'weekly';
   if (priceId === STRIPE_PRICE_ANNUAL) plan = 'annual';
   ```

   **Paso 3.5**: Actualiza Supabase con TODA la información:
   ```typescript
   const subscriptionData = {
     user_id: userId,
     stripe_customer_id: customerId,        // ← Customer ID de Stripe
     stripe_subscription_id: subscriptionId, // ← Subscription ID de Stripe
     plan: plan,                            // ← Plan determinado
     is_premium: true,                      // ← ✅ AHORA ES TRUE!
     status: 'active',                      // ← Estado activo
     current_period_start: ...,             // ← Fecha de inicio
     current_period_end: ...,               // ← Fecha de fin
     cancel_at_period_end: false,
   };
   
   // Actualizar en Supabase
   await supabase.from('user_subscriptions').upsert(subscriptionData);
   ```

   **Resultado Final**: 
   - ✅ `is_premium` = **true** (el usuario ahora es premium)
   - ✅ `stripe_customer_id` = `cus_xxxxx` (guardado)
   - ✅ `stripe_subscription_id` = `sub_xxxxx` (guardado)
   - ✅ `status` = 'active'

---

## 🤔 ¿POR QUÉ FUNCIONA AUTOMÁTICAMENTE?

### 1. **Stripe envía eventos automáticamente**

Cuando configuraste el webhook en Stripe Dashboard, le dijiste a Stripe:
- "Cada vez que algo pase (pago, actualización, cancelación), envíame un evento a esta URL"

Stripe lo hace **automáticamente**, sin que tu aplicación tenga que hacer nada.

### 2. **El webhook es un endpoint especial**

El webhook (`api/stripe-webhook.ts`) es un endpoint que:
- Solo Stripe puede llamar (verifica la firma)
- Escucha eventos de Stripe
- Procesa los eventos y actualiza tu base de datos

### 3. **No necesitas hacer polling**

**NO necesitas**:
- ❌ Consultar Stripe cada X minutos para ver si hay pagos
- ❌ Hacer que el usuario recargue la página
- ❌ Verificar manualmente

**SÍ funciona automáticamente**:
- ✅ Stripe envía el evento inmediatamente después del pago
- ✅ El webhook lo recibe y procesa
- ✅ Supabase se actualiza automáticamente

---

## 🔗 CADENA DE EVENTOS COMPLETA

```
Usuario → Hace clic en "Suscribirse"
    ↓
Frontend → Llama a redirectToCheckout(planId, email, userId)
    ↓
Backend → Crea sesión de Stripe + Guarda registro inicial en Supabase (is_premium=false)
    ↓
Usuario → Es redirigido a Stripe y completa el pago
    ↓
Stripe → Procesa el pago y crea customer_id + subscription_id
    ↓
Stripe → ⚡ ENVÍA EVENTO AUTOMÁTICAMENTE al webhook (checkout.session.completed)
    ↓
Webhook → Recibe el evento, obtiene customer_id, busca usuario en Supabase
    ↓
Webhook → Actualiza Supabase: is_premium=true, guarda customer_id y subscription_id
    ↓
Usuario → Regresa a tu app (ya es premium automáticamente)
```

---

## 📝 PUNTOS CLAVE

### ¿Por qué el customer_id se guarda automáticamente?

1. **Al iniciar checkout**: 
   - Puede que Stripe cree un `customer_id` inmediatamente
   - O puede que sea `null` hasta que se complete el pago

2. **Al completar el pago**:
   - Stripe **SIEMPRE** crea un `customer_id`
   - El webhook lo obtiene de la suscripción
   - El webhook lo guarda en Supabase

3. **El webhook encuentra al usuario**:
   - Primero busca por `customer_id` en Supabase (si ya estaba)
   - Si no lo encuentra, busca por `email`
   - Una vez encontrado, actualiza el registro

### ¿Por qué is_premium cambia de false a true?

- **Al inicio** (`create-checkout-session`): `is_premium = false` porque el usuario aún no ha pagado
- **Después del pago** (webhook): `is_premium = true` porque Stripe confirmó que el pago fue exitoso

### ¿Cuándo se ejecuta el webhook?

El webhook se ejecuta:
- ✅ Inmediatamente después de que Stripe procesa el pago
- ✅ Automáticamente, sin intervención manual
- ✅ Incluso si el usuario cierra el navegador antes de regresar a tu app

---

## 🔍 FLUJO DE DATOS: Customer ID

```
1. Usuario inicia checkout
   → userId (Supabase) se pasa al backend
   → Se crea registro en Supabase con user_id
   
2. Stripe crea customer
   → Stripe genera customer_id (ej: cus_TVdtclYuO5hGlv)
   → Este customer_id está en la suscripción de Stripe
   
3. Webhook recibe evento
   → Obtiene customer_id de subscription.customer
   → Busca usuario en Supabase por customer_id o email
   → Encuentra el user_id correspondiente
   
4. Webhook actualiza Supabase
   → Guarda customer_id en user_subscriptions
   → Marca is_premium = true
   → Guarda subscription_id también
   
5. Aplicación consulta Supabase
   → Obtiene suscripción con customer_id
   → Verifica is_premium = true
   → Muestra contenido premium
```

---

## ✅ VENTAJAS DE ESTE SISTEMA

1. **Automático**: No necesitas verificar manualmente si el pago fue exitoso
2. **Confiable**: Stripe garantiza que los eventos se envían
3. **Actualizado**: Supabase siempre tiene la información más reciente
4. **Seguro**: El webhook verifica que los eventos vengan realmente de Stripe
5. **Completo**: Guarda toda la información necesaria (customer_id, subscription_id, estado)

---

## 🎯 RESUMEN EN UNA FRASE

**Stripe envía eventos automáticamente a tu webhook cuando ocurre algo (pago, actualización, cancelación), y el webhook actualiza Supabase con la información más reciente, incluyendo el customer_id, para que tu app siempre sepa si el usuario es premium o no.**

