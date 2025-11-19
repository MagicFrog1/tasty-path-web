# Sistema de Menús Personalizados - TastyPath App

## Descripción del Problema Resuelto

**Problema anterior**: La aplicación generaba siempre el mismo menú semanal estático, sin importar las opciones y preferencias que el usuario seleccionaba al crear un plan.

**Solución implementada**: Se integró el `NutritionService` con el sistema de planificación semanal para generar menús personalizados basados en las preferencias del usuario.

## Cambios Implementados

### 1. Integración con NutritionService

- Se eliminó el menú estático hardcodeado del `WeeklyPlannerScreen`
- Se conectó con el `NutritionService` que utiliza IA para generar menús personalizados
- Los menús ahora se basan en las preferencias dietéticas del usuario

### 2. Flujo de Generación de Menús

```
Usuario → Configuración de Dieta → Preferencias → NutritionService → Menú Personalizado
```

1. **Configuración de Dieta**: El usuario establece sus preferencias en `DietConfigScreen`
2. **Generación**: El `NutritionService` usa OpenAI para crear menús basados en esas preferencias
3. **Personalización**: Cada menú es único y adaptado a las necesidades del usuario

### 3. Características del Nuevo Sistema

- **Variedad**: No se repiten menús entre días
- **Personalización**: Basado en objetivos (pérdida de peso, ganancia muscular, etc.)
- **Adaptabilidad**: Considera alergias, preferencias dietéticas y presupuesto
- **Nutrición**: Calcula calorías, proteínas, carbohidratos y grasas automáticamente

### 4. Componentes Modificados

#### WeeklyPlannerScreen.tsx
- Eliminado menú estático hardcodeado
- Agregada función `getCurrentWeekSchedule()` para obtener menús del plan
- Agregado mensaje informativo cuando no hay menús generados
- Botón para ir a configuración de dieta

#### WeeklyPlanContext.tsx
- Preparado para manejar menús generados (`meals` property)
- Soporte para configuración dietética (`config` property)

## Cómo Usar el Sistema

### Para el Usuario Final

1. **Crear Plan Semanal**: Ir a la pantalla de planificación semanal
2. **Configurar Dieta**: Hacer clic en "Configurar Dieta" para establecer preferencias
3. **Generar Menú**: El sistema generará automáticamente un menú personalizado
4. **Personalizar**: Los menús se adaptan a las preferencias establecidas

### Para el Desarrollador

1. **NutritionService**: Maneja la generación de menús usando OpenAI
2. **WeeklyPlanContext**: Gestiona el estado de los planes y menús
3. **WeeklyPlannerScreen**: Muestra los menús generados o guía al usuario

## Estructura de Datos

### WeeklyPlan Interface
```typescript
interface WeeklyPlan {
  // ... propiedades existentes ...
  config?: DietConfig;           // Configuración dietética del usuario
  meals?: WeeklyMealPlan;        // Menús generados por IA
  estimatedCalories?: number;     // Calorías estimadas del plan
  nutritionAdvice?: string;      // Consejos nutricionales
}
```

### DietConfig Interface
```typescript
interface DietConfig {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'energy_boost';
  dietaryPreferences?: string[];
  allergies?: string[];
  budget?: number;
  cookingTime?: number;
}
```

## Beneficios del Nuevo Sistema

1. **Personalización Real**: Cada usuario obtiene menús únicos
2. **Variedad**: No más repetición de comidas
3. **Adaptabilidad**: Se ajusta a objetivos y restricciones
4. **Escalabilidad**: Fácil agregar nuevas preferencias dietéticas
5. **Experiencia Mejorada**: Los usuarios ven valor real en la personalización

## Próximos Pasos

1. **Implementar conversión completa**: De `WeeklyMealPlan` a `DaySchedule`
2. **Cache de menús**: Evitar regenerar menús similares
3. **A/B Testing**: Probar diferentes enfoques de generación
4. **Feedback del usuario**: Permitir ajustes manuales a los menús generados
5. **Integración con recetas**: Conectar con base de datos de recetas existente

## Notas Técnicas

- El sistema requiere API key de OpenAI configurada
- Los menús se generan de forma asíncrona
- Se implementa manejo de errores para fallos en la generación
- Los menús se almacenan localmente en AsyncStorage

## Conclusión

Este cambio transforma la aplicación de un sistema de menús estáticos a uno verdaderamente personalizado y adaptativo. Los usuarios ahora experimentan un valor real al configurar sus preferencias dietéticas, ya que cada menú se genera específicamente para sus necesidades.
