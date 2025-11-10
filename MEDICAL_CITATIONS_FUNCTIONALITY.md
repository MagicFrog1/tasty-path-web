# Funcionalidad de Citaciones Médicas Desplegables

## 📋 **¿Qué hacen los enlaces de fuentes médicas?**

### **🔗 Función de los Enlaces:**

Cuando el usuario pulsa en cualquier enlace de fuente médica, la aplicación:

1. **Muestra un modal informativo** con:
   - Título completo de la fuente
   - Nombre de la organización/institución
   - Año de publicación (si disponible)
   - Autores (si disponible)

2. **Pregunta al usuario** si desea abrir el enlace externo

3. **Si acepta**, abre el navegador web con la URL oficial de la fuente

### **📱 Flujo de Usuario:**

```
Usuario ve: "Fuente médica (2 referencias) ▼"
       ↓
Usuario pulsa el desplegable
       ↓
Se expande mostrando:
[1] Nutrition Guidelines - OMS
[2] Dietary Guidelines - USDA
       ↓
Usuario pulsa en [1]
       ↓
Modal aparece: "¿Deseas abrir el enlace a la OMS?"
       ↓
Usuario acepta → Abre navegador con URL oficial
```

---

## 🎨 **Diseño Visual Implementado:**

### **1. Modo Compacto Desplegable (en cada consejo):**
```
💊 Fuente médica (2 referencias) ▼
```

**Al pulsar el desplegable:**
```
┌─────────────────────────────────────┐
│ [1] Nutrition Guidelines            │
│     Organización Mundial de la...  │
│                              🔗     │
├─────────────────────────────────────┤
│ [2] Dietary Guidelines for Americans│
│     U.S. Department of Agriculture │
│                              🔗     │
└─────────────────────────────────────┘
```

### **2. Modo Completo Desplegable (al final de sección):**
```
🩺 Fuentes Médicas ▼
```

**Al pulsar el desplegable:**
```
┌─────────────────────────────────────┐
│ [1] Nutrition Guidelines            │
│     Organización Mundial de la...  │
│     (2020)                         │
│     Autores: WHO Expert Committee   │
│                              🔗     │
├─────────────────────────────────────┤
│ [2] Dietary Guidelines for Americans│
│     U.S. Department of Agriculture │
│     (2020)                         │
│                              🔗     │
└─────────────────────────────────────┘
```

---

## 🔗 **Enlaces Incluidos (Ejemplos):**

### **Organizaciones Oficiales:**
- **OMS:** https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- **USDA:** https://www.dietaryguidelines.gov/
- **FAO:** https://www.fao.org/nutrition/education/food-dietary-guidelines/en/

### **Investigación Científica:**
- **American Journal of Clinical Nutrition:** https://academic.oup.com/ajcn/article/87/5/1365S/4650426
- **The Lancet:** https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)31809-9/fulltext
- **Harvard Health:** https://www.health.harvard.edu/blog/nutritional-psychiatry-your-brain-on-food-201511168626

---

## ✨ **Características Implementadas:**

### **🎯 Interactividad:**
- ✅ **Desplegable suave** con iconos de chevron
- ✅ **Modal de confirmación** antes de abrir enlaces externos
- ✅ **Feedback visual** con animaciones
- ✅ **Acceso individual** a cada fuente

### **📱 Usabilidad:**
- ✅ **No interrumpe la lectura** (modo compacto)
- ✅ **Información completa disponible** (modo expandido)
- ✅ **Enlaces seguros** con confirmación del usuario
- ✅ **Diseño consistente** con la app

### **🛡️ Seguridad:**
- ✅ **Confirmación antes de abrir** enlaces externos
- ✅ **URLs verificadas** de fuentes oficiales
- ✅ **Manejo de errores** si no se puede abrir el enlace

---

## 📍 **Ubicaciones de las Citaciones:**

### **1. Consejos Nutricionales Individuales:**
- Cada consejo tiene su citación desplegable
- Modo compacto: `💊 Fuente médica (X referencias) ▼`

### **2. Consejo del Día:**
- Citación específica para el consejo destacado
- Mismo formato compacto desplegable

### **3. Sección Completa de Consejos:**
- Todas las fuentes únicas utilizadas
- Modo completo con información detallada

### **4. Información Nutricional de Recetas:**
- Citaciones en detalles nutricionales
- Referencias a bases de datos oficiales

### **5. Planes Semanales:**
- Citaciones en información nutricional del día
- Referencias a estudios de nutrición deportiva

---

## 🎯 **Beneficios para el Usuario:**

1. **Transparencia:** Sabe exactamente de dónde viene cada recomendación
2. **Confianza:** Puede verificar la información con fuentes oficiales
3. **Educación:** Acceso directo a investigación científica actual
4. **Cumplimiento:** La app cumple con normativas de Apple sobre información médica

---

## ⚙️ **Uso Técnico:**

```typescript
// Citación individual desplegable
<MedicalCitation 
  citationIds={['who_nutrition', 'usda_dietary']}
  compact={true}
  showTitle={false}
  collapsible={true}
/>

// Citación completa desplegable
<MedicalCitation 
  citationIds={allCitationIds}
  collapsible={true}
/>
```

**¡Las citaciones médicas ahora son interactivas, informativas y cumplen perfectamente con los requisitos de Apple!** ✅🩺📱
