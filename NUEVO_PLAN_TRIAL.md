# 🆕 Nuevo Plan de Prueba (Trial) - 0€

## 📋 Resumen

Se ha añadido un nuevo plan de suscripción llamado **"Plan de Prueba"** con precio de **0€** que utiliza el Price ID de Stripe: `price_1SYlSnKHiNy1x57tiLVPXQFW`.

## ✅ Cambios Realizados

### 1. Tipos Actualizados
- ✅ `src/types/index.ts` - Añadido `'trial'` al tipo `SubscriptionPlan`

### 2. Contexto de Suscripciones
- ✅ `src/context/SubscriptionContext.tsx` - Añadido el plan 'trial' con:
  - Precio: 0€
  - Periodo: "gratis"
  - Duración: 30 días
  - Características premium completas

### 3. Servicios de Stripe
- ✅ `src/services/stripeService.ts` - Añadido soporte para el plan 'trial' con el Price ID configurado

### 4. APIs del Backend
- ✅ `api/create-checkout-session.ts` - Añadido mapeo del plan 'trial' con el Price ID
- ✅ `api/stripe-webhook.ts` - Añadido reconocimiento del plan 'trial' en los eventos
- ✅ `api/sync-subscription.ts` - Añadido reconocimiento del plan 'trial' en la sincronización

### 5. Servicios de Suscripción
- ✅ `src/services/subscriptionService.ts` - Actualizado tipo de plan para incluir 'trial'

### 6. Página de Suscripciones
- ✅ `src/pages/SubscriptionPage.tsx` - Añadido soporte para mostrar y seleccionar el plan 'trial'

### 7. Base de Datos
- ✅ `database/create_subscriptions_table.sql` - Actualizado CHECK constraint para incluir 'trial'
- ✅ `database/add_trial_plan.sql` - Script SQL para actualizar la tabla existente

## 🔧 Configuración Requerida

### Variable de Entorno (Opcional)

Puedes configurar la variable de entorno `VITE_STRIPE_PRICE_TRIAL` o `NEXT_PUBLIC_STRIPE_PRICE_TRIAL` en Vercel, pero si no está configurada, el sistema usará el valor por defecto: `price_1SYlSnKHiNy1x57tiLVPXQFW`.

### Actualizar Base de Datos

**IMPORTANTE**: Debes ejecutar el script SQL en Supabase para permitir el plan 'trial':

```sql
-- Ejecutar en Supabase SQL Editor
ALTER TABLE public.user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_plan_check;

ALTER TABLE public.user_subscriptions 
ADD CONSTRAINT user_subscriptions_plan_check 
CHECK (plan IN ('trial', 'weekly', 'monthly', 'annual'));
```

O ejecuta el archivo `database/add_trial_plan.sql` en Supabase.

## 📝 Características del Plan Trial

- **Precio**: 0€ (gratis)
- **Duración**: 30 días
- **Características**:
  - ✅ Planes ilimitados generados por IA
  - ✅ Acceso a base de datos de recetas
  - ✅ Lista de compras inteligente
  - ✅ Generador de planes completo
  - ✅ Recetas premium
  - ✅ Soporte prioritario

## 🎯 Uso

El plan 'trial' aparecerá en la página de suscripciones junto con los otros planes. Los usuarios pueden seleccionarlo y será procesado a través de Stripe con el Price ID configurado.

## ⚠️ Notas Importantes

1. **Price ID**: El Price ID `price_1SYlSnKHiNy1x57tiLVPXQFW` está hardcodeado como valor por defecto en el código, pero puede ser sobrescrito con variables de entorno.

2. **Base de Datos**: Asegúrate de ejecutar el script SQL para actualizar la tabla antes de usar el plan 'trial'.

3. **Stripe**: Verifica que el Price ID existe en tu cuenta de Stripe y que está configurado como precio de 0€.

4. **Webhook**: El webhook reconocerá automáticamente este plan cuando se procese un pago con este Price ID.

## 🚀 Próximos Pasos

1. **Ejecutar el script SQL** en Supabase para actualizar la tabla
2. **Verificar en Stripe** que el Price ID `price_1SYlSnKHiNy1x57tiLVPXQFW` existe y está configurado correctamente
3. **Probar el plan** haciendo una suscripción de prueba
4. **Verificar** que el webhook actualiza correctamente Supabase con el plan 'trial'

