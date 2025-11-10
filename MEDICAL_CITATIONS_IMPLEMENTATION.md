# Implementación de Citaciones Médicas

## Resumen

Esta implementación resuelve el error de Apple Guideline 1.4.1 - Safety - Physical Harm añadiendo citaciones médicas apropiadas a toda la información de salud y nutrición mostrada en la aplicación TastyPath.

## Archivos Modificados

### 1. Servicio de Citaciones Médicas
- **`src/services/MedicalCitationService.ts`**: Servicio principal que maneja todas las citaciones médicas
  - Base de datos de 20+ citaciones de fuentes confiables (OMS, FAO, USDA, revistas científicas)
  - Funciones para formatear y mostrar citaciones
  - URLs directos a fuentes originales

### 2. Componente de Citaciones
- **`src/components/MedicalCitation.tsx`**: Componente React Native reutilizable
  - Modo compacto y completo
  - Enlaces directos a fuentes
  - Disclaimer médico incluido
  - Diseño elegante y accesible

### 3. Consejos Nutricionales
- **`src/constants/nutritionTips.ts`**: 
  - Añadidas citaciones a todos los 100 consejos nutricionales
  - Cada consejo tiene 1-2 citaciones apropiadas
  - Cubren todas las categorías: hidratación, vitaminas, proteínas, etc.

### 4. Pantallas Modificadas

#### HomeScreen
- Citaciones en consejos nutricionales mostrados
- Citaciones en "Consejo del Día"
- Referencias completas al final de la sección

#### RecipeDetailScreen
- Citaciones en información nutricional de recetas
- Referencias a USDA Food Database y estudios de proteínas/fibra

#### WeeklyPlannerScreen
- Citaciones en detalles nutricionales del día
- Referencias a bases de datos nutricionales y estudios de ejercicio

#### PlanDetailScreen
- Citaciones compactas en cada comida
- Referencias a información nutricional

#### UserPreferencesScreen
- Citaciones para objetivos de salud
- Referencias a OMS, USDA y estudios de salud mental

## Fuentes Citadas

### Organizaciones Oficiales
- **OMS (WHO)**: Directrices nutricionales oficiales
- **FAO**: Guías alimentarias de la FAO
- **USDA**: Guías dietéticas para americanos
- **USDA Food Database**: Base de datos nutricional oficial

### Investigación Científica
- **American Journal of Clinical Nutrition**: Estudios de proteínas
- **The Lancet**: Investigación sobre fibra y salud
- **American Heart Association**: Estudios de omega-3
- **Harvard Health**: Investigación de nutrición y salud mental

### Instituciones Médicas
- **American College of Sports Medicine**: Nutrición deportiva
- **World Gastroenterology Organisation**: Probióticos
- **European Food Safety Authority**: Requerimientos de agua

## Características Implementadas

### ✅ Cumplimiento de Apple Guidelines
- Todas las afirmaciones médicas tienen citaciones
- Enlaces directos a fuentes originales
- Disclaimer médico incluido
- Fuentes científicas verificables

### ✅ Experiencia de Usuario
- Citaciones compactas que no interrumpen la lectura
- Enlaces opcionales para más información
- Diseño elegante y profesional
- Fácil acceso a fuentes completas

### ✅ Mantenibilidad
- Servicio centralizado para todas las citaciones
- Fácil añadir nuevas fuentes
- Componente reutilizable
- Tipado TypeScript completo

## Uso del Componente

```typescript
import { MedicalCitation } from '../components/MedicalCitation';

// Modo compacto
<MedicalCitation 
  citationIds={['who_nutrition', 'usda_dietary']}
  compact={true}
  showTitle={false}
/>

// Modo completo
<MedicalCitation 
  citationIds={['protein_requirements', 'fiber_health']}
/>
```

## Validación

- ✅ Todas las pantallas con información médica tienen citaciones
- ✅ Todas las citaciones tienen URLs válidas a fuentes originales
- ✅ Disclaimer médico presente en todas las citaciones
- ✅ Sin errores de linting
- ✅ Componentes tipados correctamente
- ✅ Diseño consistente con la aplicación

## Resultado

La aplicación ahora cumple completamente con Apple Guideline 1.4.1, proporcionando citaciones médicas apropiadas para toda la información de salud y nutrición, mientras mantiene una excelente experiencia de usuario.
