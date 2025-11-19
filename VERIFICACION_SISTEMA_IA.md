# ✅ Verificación del Sistema de IA para Generación de Menús

## 🎯 Objetivo
Verificar que el sistema de IA genere planes semanales con menús variados y personalizados según las opciones elegidas por el usuario.

## 🔧 Componentes del Sistema

### 1. **Servicio de IA (`AIMenuService.ts`)**
- ✅ Integración con OpenAI GPT-3.5-turbo
- ✅ Prompts optimizados para nutricionistas expertos
- ✅ Sistema de fallback local si la IA falla
- ✅ Manejo de errores robusto

### 2. **Contexto de Preferencias (`UserPreferencesContext.tsx`)**
- ✅ Gestión de preferencias dietéticas del usuario
- ✅ Almacenamiento persistente en AsyncStorage
- ✅ Preferencias por defecto configuradas
- ✅ Actualización en tiempo real

### 3. **Pantalla de Preferencias (`UserPreferencesScreen.tsx`)**
- ✅ Interfaz intuitiva para configurar preferencias
- ✅ Categorías: dietéticas, alergias, cocina, restricciones, salud
- ✅ Nivel de cocina y tiempo máximo de preparación
- ✅ Resumen visual de preferencias configuradas

### 4. **Integración en WeeklyPlannerScreen**
- ✅ Uso de preferencias del usuario al generar menús
- ✅ Generación automática al crear planes
- ✅ Botón de regeneración con IA
- ✅ Estado de carga durante generación

## 🧪 Cómo Verificar el Funcionamiento

### **Paso 1: Configurar Preferencias del Usuario**
1. Navegar a `WeeklyPlannerScreen`
2. Tocar "Configurar Preferencias"
3. Configurar al menos:
   - 3-4 preferencias dietéticas
   - 2-3 estilos de cocina
   - 1-2 alergias (si las tiene)
   - Nivel de cocina y tiempo máximo

### **Paso 2: Crear un Plan Semanal**
1. Tocar "Crear Plan Semanal"
2. Verificar que se genere automáticamente
3. Observar el estado de carga "Generando Menú con IA..."

### **Paso 3: Verificar Variedad de Menús**
1. Revisar que cada día tenga menús diferentes
2. Verificar que no se repitan ingredientes principales
3. Comprobar variedad de estilos de cocina

### **Paso 4: Regenerar Menús**
1. Tocar "Regenerar" en el modal de detalles
2. Verificar que se generen menús completamente diferentes
3. Comprobar que se mantengan las preferencias

## 📊 Métricas de Verificación

### **Variedad de Menús**
- ✅ **Excelente**: ≥80% de comidas únicas
- ⚠️ **Moderada**: 60-79% de comidas únicas  
- ❌ **Baja**: <60% de comidas únicas

### **Respeto a Preferencias**
- ✅ **Alergias**: No debe contener ingredientes prohibidos
- ✅ **Estilos de cocina**: Debe usar los preferidos
- ✅ **Nutrición**: Calorías dentro de ±10% del objetivo
- ✅ **Dieta**: Debe respetar restricciones (vegetariano, sin gluten, etc.)

### **Calidad de Recetas**
- ✅ **Instrucciones**: Paso a paso claras
- ✅ **Ingredientes**: Lista completa y específica
- ✅ **Tiempos**: Prep y cocción realistas
- ✅ **Nutrición**: Cálculo preciso por comida

## 🔍 Pruebas Automatizadas

### **Ejecutar Tests**
```typescript
import { testMenuGeneration, verifyMenuVariety, verifyPreferencesRespect } from '../utils/testAIMenuGeneration';

// Ejecutar pruebas completas
await testMenuGeneration();

// Verificar variedad de un menú generado
const varietyScore = verifyMenuVariety(weeklyMenu);

// Verificar respeto a preferencias
const preferencesRespected = verifyPreferencesRespect(weeklyMenu, userRequest);
```

### **Casos de Prueba**
1. **Preferencias básicas**: saludable, equilibrado
2. **Vegetariano**: alto en proteínas, rico en fibra
3. **Bajo en carbohidratos**: keto, alto en proteínas
4. **Con alergias**: sin gluten, sin lactosa
5. **Estilos específicos**: solo mediterránea y asiática

## 🚨 Problemas Comunes y Soluciones

### **Error: "API key no válida"**
- ✅ Verificar archivo `.env` con `EXPO_PUBLIC_OPENAI_API_KEY`
- ✅ Confirmar que la key tenga saldo disponible
- ✅ Verificar que no haya expirado

### **Error: "Timeout de la API"**
- ✅ Verificar conexión a internet
- ✅ Esperar y reintentar
- ✅ Usar menú de respaldo local

### **Menús se repiten mucho**
- ✅ Verificar que las preferencias sean variadas
- ✅ Regenerar menús múltiples veces
- ✅ Comprobar que la IA esté funcionando

### **No se respetan las alergias**
- ✅ Verificar configuración de alergias
- ✅ Regenerar menús
- ✅ Revisar logs de la aplicación

## 📱 Verificación en la App

### **Indicadores Visuales**
- 🔄 **Generando**: Icono de reloj de arena
- ✅ **Completado**: Menús expandibles
- ❌ **Error**: Mensaje de error con botón de reintento

### **Logs de Consola**
- ✅ "🔄 Cargando preferencias del usuario..."
- ✅ "✏️ Preferencias actualizadas: {...}"
- ✅ "🧪 Iniciando pruebas de generación de menús con IA..."
- ✅ "📊 Menús generados: 7"

## 🎉 Criterios de Éxito

El sistema funciona correctamente cuando:

1. **✅ Genera menús automáticamente** al crear planes
2. **✅ Respeta todas las preferencias** del usuario
3. **✅ Crea variedad real** entre días (no repeticiones)
4. **✅ Mantiene objetivos nutricionales** dentro del rango
5. **✅ Proporciona recetas detalladas** y útiles
6. **✅ Permite regeneración** para más variedad
7. **✅ Funciona offline** con menús de respaldo
8. **✅ Interfaz intuitiva** para configurar preferencias

## 🔄 Proceso de Verificación Continua

1. **Configurar preferencias** diferentes cada semana
2. **Crear nuevos planes** para verificar variedad
3. **Regenerar menús** existentes
4. **Verificar nutrición** y respeto a alergias
5. **Probar casos extremos** (solo un estilo de cocina, muchas restricciones)

---

**Nota**: Este sistema está diseñado para generar menús únicos y variados cada vez, respetando las preferencias del usuario y proporcionando una experiencia personalizada de planificación nutricional.

