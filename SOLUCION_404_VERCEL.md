# 🔧 Solución: Error 404 en Vercel para Webhook de Stripe

## ❌ Problema

El webhook de Stripe devuelve error 404 en Vercel, indicando que la ruta no existe.

## ✅ Solución Implementada

### 1. Archivo `vercel.json` Creado

Se creó el archivo `vercel.json` en la raíz del proyecto para configurar correctamente Vercel:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node",
      "maxDuration": 30
    }
  }
}
```

**Configuración:**
- ✅ `buildCommand`: Comando para construir el proyecto (Vite)
- ✅ `outputDirectory`: Directorio de salida (`dist` para Vite)
- ✅ `rewrites`: Rutas que redirigen a las funciones API
- ✅ `functions`: Configuración de las funciones serverless en `api/`

### 2. Verificación de Estructura

El proyecto tiene la estructura correcta:
```
tasty-path-web-main/
├── api/
│   ├── stripe-webhook.ts  ← ✅ Archivo del webhook
│   ├── create-checkout-session.ts
│   └── ...
├── vercel.json  ← ✅ Configuración de Vercel (NUEVO)
└── package.json
```

## 🔍 Verificación en Stripe

**IMPORTANTE**: Verifica que la URL del webhook en Stripe sea correcta:

1. Ve a **Stripe Dashboard** > **Webhooks**
2. Selecciona tu endpoint
3. Verifica que la URL sea exactamente:
   ```
   https://mytastypath.com/api/stripe-webhook
   ```
   O si usas el dominio de Vercel:
   ```
   https://tu-proyecto.vercel.app/api/stripe-webhook
   ```

**Errores comunes:**
- ❌ `https://mytastypath.com/stripe-webhook` (falta `/api/`)
- ❌ `https://mytastypath.com/api/stripe_webhook` (guion bajo en lugar de guion)
- ❌ `https://mytastypath.com/api/stripe-webhook/` (barra final extra)

## 🚀 Próximos Pasos

1. **Hacer deploy** a Vercel (debería detectar automáticamente el `vercel.json`)
2. **Verificar en Vercel Dashboard**:
   - Ve a **Settings** > **Functions**
   - Deberías ver las funciones en `api/` listadas
3. **Probar el webhook**:
   - Ve a Stripe Dashboard > Webhooks > Tu endpoint
   - Haz clic en "Send test webhook"
   - Selecciona el evento `checkout.session.completed`
   - Verifica que llegue correctamente

## 📝 Notas Importantes

1. **Vercel detecta automáticamente** las funciones en `api/` cuando hay un `vercel.json` configurado
2. **El archivo debe exportar `default`** como función handler (ya está correcto)
3. **La URL debe ser exacta**: `/api/stripe-webhook` (sin barra final, sin guiones bajos)

## 🐛 Si el Error Persiste

1. **Verifica el deploy en Vercel**:
   - Ve a **Deployments** > Último deploy
   - Verifica que no haya errores en el build
   - Verifica que las funciones estén listadas

2. **Verifica la URL en Stripe**:
   - Debe ser exactamente: `https://mytastypath.com/api/stripe-webhook`
   - Sin barras finales, sin guiones bajos

3. **Revisa los logs de Vercel**:
   - Ve a **Functions** > `api/stripe-webhook` > **Logs`
   - Verifica si hay errores de compilación o runtime

