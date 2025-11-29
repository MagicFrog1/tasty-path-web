# 🔧 Solución: Error 400 en Webhook de Stripe

## ❌ Error

```
"Webhook Error: No signatures found matching the expected signature for payload. 
Are you passing the raw request body you received from Stripe?"
```

## 🔍 Causa del Problema

El error ocurre porque **Stripe necesita el body exactamente como lo envió** (raw/string) para verificar la firma. Si el body es parseado o modificado de alguna manera, la verificación falla.

En Vercel, incluso con `bodyParser: false`, el body puede llegar parseado en algunos casos.

## ✅ Solución Implementada

He mejorado el manejo del body raw en `api/stripe-webhook.ts`:

1. **Verificación del tipo de body**: Detecta si viene como Buffer, string u objeto
2. **Logging detallado**: Muestra qué tipo de body recibió para debug
3. **Manejo de diferentes casos**: Convierte string a Buffer si es necesario

## 🔧 Verificación en Vercel

Después del deploy, revisa los logs del webhook en Vercel:

1. Ve a **Vercel Dashboard** > Tu proyecto > **Functions** > `api/stripe-webhook`
2. Busca logs que muestren:
   - `✅ Body recibido como Buffer, tamaño: XXXX`
   - O `⚠️ Body recibido como string, convertido a Buffer`

## ⚠️ Si el Error Persiste

Si el error 400 continúa después del deploy, puede ser que Vercel esté parseando el body automáticamente. En ese caso, necesitamos una solución alternativa:

### Opción 1: Usar Middleware de Vercel

Crear un middleware que capture el body raw antes de que llegue a la función.

### Opción 2: Verificar Configuración de Vercel

Asegúrate de que en Vercel no haya configuraciones que parseen el body automáticamente.

### Opción 3: Usar Función Edge de Supabase

Mover el webhook a una Edge Function de Supabase que maneja mejor el body raw.

## 📝 Próximos Pasos

1. **Esperar el deploy** en Vercel
2. **Probar el webhook** con un evento de prueba desde Stripe Dashboard
3. **Revisar los logs** en Vercel para ver qué tipo de body está recibiendo
4. **Si el error persiste**, implementar una de las soluciones alternativas

## 🔗 Referencias

- [Stripe Webhook Signing](https://docs.stripe.com/webhooks/signature)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)


