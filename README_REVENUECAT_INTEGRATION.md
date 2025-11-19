# Integración de RevenueCat en TastyPath

Este documento explica cómo está integrado RevenueCat en la aplicación TastyPath para manejar las suscripciones y compras dentro de la app.

## 📋 Resumen de la Integración

La integración de RevenueCat permite:
- ✅ Manejo automático de suscripciones
- ✅ Compra de productos desde la app
- ✅ Restauración de compras
- ✅ Verificación de estado de suscripción
- ✅ Manejo de errores robusto

## 🔧 Configuración

### 1. Clave Pública de RevenueCat

**IMPORTANTE**: Debes reemplazar la clave pública en el archivo `env.config.js`:

```javascript
// env.config.js
export const ENV_CONFIG = {
  // ... otras configuraciones
  REVENUECAT_PUBLIC_KEY: 'TU_CLAVE_PUBLICA_AQUI', // ← Reemplazar con tu clave real
};
```

### 2. Productos Configurados

Los siguientes productos están configurados en el código:

- **Semanal**: `com.magic1frog2.TastyPath.Weeklyy`
- **Mensual**: `com.magic1frog2.TastyPath.Monthl`
- **Anual**: `com.magic1frog2.TastyPath.Annualy`

### 3. Entitlements

- **Premium**: `premium_features` - Acceso a todas las características premium

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/services/RevenueCatService.ts`**
   - Servicio principal para manejar RevenueCat
   - Configuración del SDK
   - Funciones de compra y restauración
   - Manejo de errores

2. **`src/hooks/useRevenueCat.ts`**
   - Hook personalizado para usar RevenueCat
   - Estado de carga y productos
   - Funciones de compra

3. **`src/context/RevenueCatContext.tsx`**
   - Contexto global para RevenueCat
   - Estado compartido en toda la app

4. **`src/hooks/usePremiumAccess.ts`**
   - Hook para verificar acceso premium
   - Lógica de trial vs suscripción

### Archivos Modificados

1. **`src/screens/PlanSelectionScreen.tsx`**
   - Integración con productos de RevenueCat
   - Botones de compra y restauración
   - Manejo de precios dinámicos

2. **`App.tsx`**
   - Agregado RevenueCatProvider

3. **`env.config.js`**
   - Agregada configuración de RevenueCat

## 🚀 Uso en la Aplicación

### 1. Verificar Acceso Premium

```typescript
import { usePremiumAccess } from '../hooks/usePremiumAccess';

const MyComponent = () => {
  const { hasPremiumAccess, isTrialUser, isSubscribedUser } = usePremiumAccess();
  
  if (hasPremiumAccess) {
    // Mostrar características premium
  }
};
```

### 2. Realizar una Compra

```typescript
import { useRevenueCat } from '../hooks/useRevenueCat';

const PurchaseComponent = () => {
  const { purchaseProduct, isLoading } = useRevenueCat();
  
  const handlePurchase = async (productId: string) => {
    const result = await purchaseProduct(productId);
    if (result.success) {
      // Compra exitosa
    }
  };
};
```

### 3. Restaurar Compras

```typescript
const { restorePurchases } = useRevenueCat();

const handleRestore = async () => {
  const result = await restorePurchases();
  if (result.success) {
    // Compras restauradas
  }
};
```

## 🔄 Flujo de Compra

1. **Usuario selecciona un plan** en `PlanSelectionScreen`
2. **Se verifica si es un producto de RevenueCat** (`isRevenueCatProduct`)
3. **Se llama a `purchaseProduct()`** con el ID del producto
4. **RevenueCat maneja la compra** con la tienda de aplicaciones
5. **Se verifica el resultado** y se actualiza el estado
6. **Se navega a la pantalla principal** si la compra es exitosa

## 🛠️ Configuración en RevenueCat Dashboard

### 1. Crear Productos

En el dashboard de RevenueCat, crea los siguientes productos:

- **ID**: `com.magic1frog2.TastyPath.Weeklyy`
- **ID**: `com.magic1frog2.TastyPath.Monthl`
- **ID**: `com.magic1frog2.TastyPath.Annualy`

### 2. Configurar Entitlements

Crea un entitlement llamado `premium_features` y asócialo con todos los productos de suscripción.

### 3. Configurar Ofertas

Crea ofertas que incluyan los productos de suscripción.

## 🐛 Manejo de Errores

El servicio incluye manejo robusto de errores para:

- ❌ Compra cancelada por el usuario
- ❌ Problemas de red
- ❌ Productos no disponibles
- ❌ Credenciales inválidas
- ❌ Errores de la tienda

## 📱 Pruebas

### 1. Modo Sandbox

Para probar en modo sandbox:
1. Configura tu cuenta de desarrollador de Apple
2. Usa cuentas de prueba de App Store
3. Verifica las compras en el dashboard de RevenueCat

### 2. Verificación de Estado

```typescript
const { subscriptionStatus } = useRevenueCat();

console.log('Estado de suscripción:', subscriptionStatus);
// {
//   isActive: true,
//   isPremium: true,
//   activeSubscriptions: ['com.magic1frog2.TastyPath.Monthl'],
//   expirationDate: Date
// }
```

## 🔒 Seguridad

- ✅ Las claves privadas se manejan en el servidor de RevenueCat
- ✅ Solo se usa la clave pública en la app
- ✅ Las compras se validan en el servidor
- ✅ No se almacenan datos sensibles localmente

## 📞 Soporte

Si tienes problemas con la integración:

1. Verifica que la clave pública sea correcta
2. Confirma que los productos estén configurados en RevenueCat
3. Revisa los logs de la consola para errores
4. Verifica la configuración de App Store Connect

## 🎯 Próximos Pasos

1. **Configurar la clave pública** en `env.config.js`
2. **Crear los productos** en RevenueCat Dashboard
3. **Probar las compras** en modo sandbox
4. **Configurar analytics** para tracking de conversiones
5. **Implementar webhooks** para notificaciones del servidor

---

**Nota**: Esta integración está lista para usar. Solo necesitas configurar tu clave pública de RevenueCat y crear los productos en el dashboard.
