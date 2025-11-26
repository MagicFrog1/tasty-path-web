# Configuración de Stripe para Suscripciones

## 📋 Variables de Entorno Requeridas en Vercel

Para que los botones de suscripción funcionen correctamente con Stripe, necesitas configurar las siguientes variables de entorno en Vercel:

### Variables Necesarias:

1. **`VITE_STRIPE_PUBLISHABLE_KEY`** (o `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Tu clave pública de Stripe (empieza con `pk_`)
   - Puedes encontrarla en: https://dashboard.stripe.com/apikeys

2. **`VITE_STRIPE_PRICE_WEEKLY`**
   - El Price ID de Stripe para el plan semanal
   - Formato: `price_xxxxxxxxxxxxx`

3. **`VITE_STRIPE_PRICE_MONTHLY`**
   - El Price ID de Stripe para el plan mensual
   - Formato: `price_xxxxxxxxxxxxx`

4. **`VITE_STRIPE_PRICE_ANNUAL`**
   - El Price ID de Stripe para el plan anual
   - Formato: `price_xxxxxxxxxxxxx`

## 🔧 Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Navega a **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. Asegúrate de que estén disponibles para **All Environments** (Production, Preview, Development)
5. **Redespliega** la aplicación después de agregar las variables

## 📝 Cómo Obtener los Price IDs de Stripe

1. Ve a tu Dashboard de Stripe: https://dashboard.stripe.com/products
2. Crea o selecciona los productos de suscripción:
   - **Plan Semanal**: Crea un producto con precio recurrente semanal
   - **Plan Mensual**: Crea un producto con precio recurrente mensual
   - **Plan Anual**: Crea un producto con precio recurrente anual
3. Copia el **Price ID** de cada producto (empieza con `price_`)
4. Pega cada Price ID en la variable correspondiente en Vercel

## ⚠️ Importante

- **Prefijo `VITE_`**: En Vite, las variables de entorno que se exponen al cliente deben tener el prefijo `VITE_`
- **Claves Públicas vs Secretas**: Solo usa la clave **pública** (`pk_`) en el frontend. NUNCA expongas la clave secreta (`sk_`)
- **Price IDs**: Asegúrate de usar los Price IDs correctos de tu cuenta de Stripe

## 🧪 Verificación

Después de configurar las variables:

1. Redespliega la aplicación en Vercel
2. Ve a la página de suscripciones (`/suscripcion`)
3. Haz clic en "Suscribirse ahora" en cualquier plan de pago
4. Deberías ser redirigido a Stripe Checkout para completar el pago

## 🔍 Troubleshooting

### Los botones no redirigen a Stripe
- Verifica que todas las variables estén configuradas correctamente
- Asegúrate de que los Price IDs sean válidos y estén activos en Stripe
- Revisa la consola del navegador para ver errores

### Error: "Stripe no está configurado"
- Verifica que `VITE_STRIPE_PUBLISHABLE_KEY` esté configurada
- Asegúrate de que el valor no esté vacío

### Error: "No se encontró el precio para el plan"
- Verifica que los Price IDs (`VITE_STRIPE_PRICE_WEEKLY`, etc.) estén configurados
- Asegúrate de que los Price IDs sean correctos y estén activos en Stripe

## 📚 Recursos

- [Documentación de Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Guía de Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

