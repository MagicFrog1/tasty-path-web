export interface NutritionTip {
  id: number;
  text: string;
  icon: string;
  color: string;
  category: string;
  citations: string[]; // IDs de citaciones médicas
}

export const nutritionTips: NutritionTip[] = [
  // Hidratación
  { id: 1, text: "Bebe 8 vasos de agua al día", icon: "water", color: "#4A90E2", category: "hidratacion", citations: ["water_intake_study", "who_nutrition"] },
  { id: 2, text: "Toma agua antes de cada comida", icon: "water", color: "#4A90E2", category: "hidratacion", citations: ["water_intake_study"] },
  { id: 3, text: "El té verde es rico en antioxidantes", icon: "cafe", color: "#4A90E2", category: "hidratacion", citations: ["antioxidants_health"] },
  { id: 4, text: "Evita bebidas azucaradas", icon: "close-circle", color: "#E74C3C", category: "hidratacion", citations: ["who_nutrition", "usda_dietary"] },
  
  // Verduras y Frutas
  { id: 5, text: "Incluye verduras en cada comida", icon: "restaurant", color: "#27AE60", category: "vegetales", citations: ["who_nutrition", "usda_dietary"] },
  { id: 6, text: "Come frutas de temporada", icon: "nutrition", color: "#F39C12", category: "vegetales", citations: ["fao_nutrition", "usda_dietary"] },
  { id: 7, text: "Las verduras verdes son ricas en hierro", icon: "restaurant", color: "#27AE60", category: "vegetales", citations: ["usda_nutrient_db"] },
  { id: 8, text: "Consume 5 porciones de frutas y verduras", icon: "nutrition", color: "#F39C12", category: "vegetales", citations: ["who_nutrition", "usda_dietary"] },
  
  // Proteínas
  { id: 9, text: "Combina proteínas y carbohidratos", icon: "fitness", color: "#8E44AD", category: "proteinas", citations: ["protein_requirements", "exercise_nutrition"] },
  { id: 10, text: "El pescado es rico en omega-3", icon: "fish", color: "#3498DB", category: "proteinas", citations: ["omega3_benefits", "usda_nutrient_db"] },
  { id: 11, text: "Los huevos son proteína completa", icon: "egg", color: "#F1C40F", category: "proteinas", citations: ["protein_requirements", "usda_nutrient_db"] },
  { id: 12, text: "Las legumbres son proteína vegetal", icon: "nutrition", color: "#E67E22", category: "proteinas", citations: ["protein_requirements", "fao_nutrition"] },
  
  // Carbohidratos
  { id: 13, text: "Prefiere granos integrales", icon: "grain", color: "#8B4513", category: "carbohidratos", citations: ["fiber_health", "usda_dietary"] },
  { id: 14, text: "Los carbohidratos complejos dan energía", icon: "flash", color: "#F39C12", category: "carbohidratos", citations: ["exercise_nutrition", "usda_dietary"] },
  { id: 15, text: "Evita carbohidratos refinados", icon: "close-circle", color: "#E74C3C", category: "carbohidratos", citations: ["who_nutrition", "usda_dietary"] },
  { id: 16, text: "La avena es un superalimento", icon: "nutrition", color: "#8B4513", category: "carbohidratos", citations: ["fiber_health", "usda_nutrient_db"] },
  
  // Grasas Saludables
  { id: 17, text: "El aceite de oliva es saludable", icon: "droplet", color: "#F39C12", category: "grasas", citations: ["omega3_benefits", "usda_dietary"] },
  { id: 18, text: "Los frutos secos son ricos en grasas buenas", icon: "nutrition", color: "#8B4513", category: "grasas", citations: ["omega3_benefits", "usda_nutrient_db"] },
  { id: 19, text: "El aguacate es rico en grasas monoinsaturadas", icon: "restaurant", color: "#27AE60", category: "grasas", citations: ["usda_nutrient_db", "usda_dietary"] },
  { id: 20, text: "Evita grasas trans", icon: "close-circle", color: "#E74C3C", category: "grasas", citations: ["who_nutrition", "usda_dietary"] },
  
  // Vitaminas y Minerales
  { id: 21, text: "La vitamina C fortalece el sistema inmune", icon: "medical", color: "#E74C3C", category: "vitaminas", citations: ["vitamin_c_immune"] },
  { id: 22, text: "El calcio fortalece los huesos", icon: "fitness", color: "#8E44AD", category: "vitaminas", citations: ["vitamin_d_health", "usda_nutrient_db"] },
  { id: 23, text: "El hierro previene la anemia", icon: "medical", color: "#E74C3C", category: "vitaminas", citations: ["usda_nutrient_db", "who_nutrition"] },
  { id: 24, text: "La vitamina D es esencial para los huesos", icon: "sunny", color: "#F39C12", category: "vitaminas", citations: ["vitamin_d_health"] },
  
  // Horarios de Comida
  { id: 25, text: "Come cada 3-4 horas", icon: "time", color: "#3498DB", category: "horarios", citations: ["usda_dietary", "fao_nutrition"] },
  { id: 26, text: "No saltes el desayuno", icon: "sunny", color: "#F39C12", category: "horarios", citations: ["usda_dietary"] },
  { id: 27, text: "La cena debe ser ligera", icon: "moon", color: "#8E44AD", category: "horarios", citations: ["fao_nutrition"] },
  { id: 28, text: "Mastica bien los alimentos", icon: "nutrition", color: "#27AE60", category: "horarios", citations: ["fao_nutrition"] },
  
  // Cocina Saludable
  { id: 29, text: "Cocina al vapor para preservar nutrientes", icon: "flame", color: "#E74C3C", category: "cocina", citations: ["fao_nutrition", "usda_nutrient_db"] },
  { id: 30, text: "Usa hierbas y especias en lugar de sal", icon: "restaurant", color: "#27AE60", category: "cocina", citations: ["who_nutrition", "usda_dietary"] },
  { id: 31, text: "Planifica tus comidas con anticipación", icon: "calendar", color: "#3498DB", category: "cocina", citations: ["usda_dietary"] },
  { id: 32, text: "Prepara comidas en lotes para ahorrar tiempo", icon: "time", color: "#3498DB", category: "cocina", citations: ["usda_dietary"] },
  
  // Fibra
  { id: 33, text: "La fibra mejora la digestión", icon: "nutrition", color: "#8B4513", category: "fibra", citations: ["fiber_health"] },
  { id: 34, text: "Los cereales integrales son ricos en fibra", icon: "grain", color: "#8B4513", category: "fibra", citations: ["fiber_health", "usda_nutrient_db"] },
  { id: 35, text: "Las manzanas son ricas en fibra", icon: "nutrition", color: "#E74C3C", category: "fibra", citations: ["usda_nutrient_db"] },
  { id: 36, text: "La fibra te mantiene saciado", icon: "fitness", color: "#27AE60", category: "fibra", citations: ["fiber_health"] },
  
  // Antioxidantes
  { id: 37, text: "Los arándanos son ricos en antioxidantes", icon: "nutrition", color: "#8E44AD", category: "antioxidantes", citations: ["antioxidants_health", "usda_nutrient_db"] },
  { id: 38, text: "El chocolate negro es rico en antioxidantes", icon: "heart", color: "#8B4513", category: "antioxidantes", citations: ["antioxidants_health"] },
  { id: 39, text: "Las nueces son ricas en antioxidantes", icon: "nutrition", color: "#8B4513", category: "antioxidantes", citations: ["antioxidants_health", "usda_nutrient_db"] },
  { id: 40, text: "Los tomates contienen licopeno", icon: "nutrition", color: "#E74C3C", category: "antioxidantes", citations: ["antioxidants_health", "usda_nutrient_db"] },
  
  // Omega-3
  { id: 41, text: "El salmón es rico en omega-3", icon: "fish", color: "#3498DB", category: "omega3", citations: ["omega3_benefits", "usda_nutrient_db"] },
  { id: 42, text: "Las semillas de chía son ricas en omega-3", icon: "nutrition", color: "#8B4513", category: "omega3", citations: ["omega3_benefits", "usda_nutrient_db"] },
  { id: 43, text: "El omega-3 es bueno para el corazón", icon: "heart", color: "#E74C3C", category: "omega3", citations: ["omega3_benefits"] },
  { id: 44, text: "Las nueces contienen omega-3", icon: "nutrition", color: "#8B4513", category: "omega3", citations: ["omega3_benefits", "usda_nutrient_db"] },
  
  // Probióticos
  { id: 45, text: "El yogur natural contiene probióticos", icon: "nutrition", color: "#F1C40F", category: "probioticos", citations: ["probiotics_health"] },
  { id: 46, text: "Los probióticos mejoran la digestión", icon: "medical", color: "#27AE60", category: "probioticos", citations: ["probiotics_health"] },
  { id: 47, text: "El kéfir es rico en probióticos", icon: "nutrition", color: "#F1C40F", category: "probioticos", citations: ["probiotics_health"] },
  { id: 48, text: "Los probióticos fortalecen el sistema inmune", icon: "medical", color: "#27AE60", category: "probioticos", citations: ["probiotics_health"] },
  
  // Control de Porciones
  { id: 49, text: "Usa platos más pequeños para controlar porciones", icon: "restaurant", color: "#3498DB", category: "porciones", citations: ["usda_dietary", "fao_nutrition"] },
  { id: 50, text: "Come despacio para sentir saciedad", icon: "time", color: "#3498DB", category: "porciones", citations: ["fao_nutrition"] },
  { id: 51, text: "Sirve la comida en la cocina, no en la mesa", icon: "home", color: "#8E44AD", category: "porciones", citations: ["usda_dietary"] },
  { id: 52, text: "Escucha a tu cuerpo, come cuando tengas hambre", icon: "fitness", color: "#27AE60", category: "porciones", citations: ["fao_nutrition"] },
  
  // Snacks Saludables
  { id: 53, text: "Los frutos secos son un snack perfecto", icon: "nutrition", color: "#8B4513", category: "snacks", citations: ["usda_dietary", "usda_nutrient_db"] },
  { id: 54, text: "Las frutas son el mejor snack natural", icon: "nutrition", color: "#F39C12", category: "snacks", citations: ["who_nutrition", "usda_dietary"] },
  { id: 55, text: "El hummus con verduras es un snack saludable", icon: "nutrition", color: "#27AE60", category: "snacks", citations: ["usda_dietary"] },
  { id: 56, text: "Evita snacks procesados", icon: "close-circle", color: "#E74C3C", category: "snacks", citations: ["who_nutrition", "usda_dietary"] },
  
  // Comida Orgánica
  { id: 57, text: "Los alimentos orgánicos tienen menos pesticidas", icon: "restaurant", color: "#27AE60", category: "organico", citations: ["fao_nutrition", "usda_dietary"] },
  { id: 58, text: "Compra productos locales y de temporada", icon: "home", color: "#8E44AD", category: "organico", citations: ["fao_nutrition"] },
  { id: 59, text: "Los huevos orgánicos son más nutritivos", icon: "egg", color: "#F1C40F", category: "organico", citations: ["usda_nutrient_db"] },
  { id: 60, text: "La carne orgánica es más saludable", icon: "nutrition", color: "#E74C3C", category: "organico", citations: ["usda_nutrient_db"] },
  
  // Alergias e Intolerancias
  { id: 61, text: "Lee siempre las etiquetas de los alimentos", icon: "document-text", color: "#3498DB", category: "alergias", citations: ["fao_nutrition", "usda_dietary"] },
  { id: 62, text: "Si tienes intolerancia al gluten, evítalo", icon: "close-circle", color: "#E74C3C", category: "alergias", citations: ["who_nutrition"] },
  { id: 63, text: "La lactosa puede causar problemas digestivos", icon: "medical", color: "#E74C3C", category: "alergias", citations: ["who_nutrition"] },
  { id: 64, text: "Consulta con un nutricionista si tienes dudas", icon: "medical", color: "#27AE60", category: "alergias", citations: ["who_nutrition", "fao_nutrition"] },
  
  // Suplementos
  { id: 65, text: "Los suplementos no reemplazan una dieta equilibrada", icon: "medical", color: "#8E44AD", category: "suplementos", citations: ["who_nutrition", "usda_dietary"] },
  { id: 66, text: "Consulta con tu médico antes de tomar suplementos", icon: "medical", color: "#27AE60", category: "suplementos", citations: ["who_nutrition"] },
  { id: 67, text: "La vitamina D es importante en invierno", icon: "sunny", color: "#F39C12", category: "suplementos", citations: ["vitamin_d_health"] },
  { id: 68, text: "Los probióticos pueden ayudar con la digestión", icon: "medical", color: "#27AE60", category: "suplementos", citations: ["probiotics_health"] },
  
  // Ejercicio y Nutrición
  { id: 69, text: "Come proteína después del ejercicio", icon: "fitness", color: "#8E44AD", category: "ejercicio", citations: ["exercise_nutrition", "protein_requirements"] },
  { id: 70, text: "Hidrátate bien durante el ejercicio", icon: "water", color: "#4A90E2", category: "ejercicio", citations: ["exercise_nutrition", "water_intake_study"] },
  { id: 71, text: "Los carbohidratos dan energía para el ejercicio", icon: "flash", color: "#F39C12", category: "ejercicio", citations: ["exercise_nutrition"] },
  { id: 72, text: "No hagas ejercicio con el estómago lleno", icon: "fitness", color: "#27AE60", category: "ejercicio", citations: ["exercise_nutrition"] },
  
  // Salud Mental y Nutrición
  { id: 73, text: "La comida afecta tu estado de ánimo", icon: "happy", color: "#F39C12", category: "salud-mental", citations: ["nutrition_mental_health"] },
  { id: 74, text: "Los ácidos grasos omega-3 mejoran el ánimo", icon: "heart", color: "#E74C3C", category: "salud-mental", citations: ["nutrition_mental_health", "omega3_benefits"] },
  { id: 75, text: "El chocolate negro puede mejorar el ánimo", icon: "heart", color: "#8B4513", category: "salud-mental", citations: ["nutrition_mental_health", "antioxidants_health"] },
  { id: 76, text: "Come en un ambiente relajado", icon: "home", color: "#8E44AD", category: "salud-mental", citations: ["nutrition_mental_health"] },
  
  // Envejecimiento Saludable
  { id: 77, text: "Los antioxidantes retrasan el envejecimiento", icon: "medical", color: "#8E44AD", category: "envejecimiento", citations: ["antioxidants_health"] },
  { id: 78, text: "El calcio mantiene los huesos fuertes", icon: "fitness", color: "#8E44AD", category: "envejecimiento", citations: ["vitamin_d_health", "usda_nutrient_db"] },
  { id: 79, text: "La proteína mantiene la masa muscular", icon: "fitness", color: "#8E44AD", category: "envejecimiento", citations: ["protein_requirements"] },
  { id: 80, text: "Los ácidos grasos omega-3 son buenos para el cerebro", icon: "medical", color: "#8E44AD", category: "envejecimiento", citations: ["omega3_benefits", "nutrition_mental_health"] },
  
  // Nutrición Infantil
  { id: 81, text: "Los niños necesitan una dieta variada", icon: "happy", color: "#F39C12", category: "infantil", citations: ["child_nutrition", "who_nutrition"] },
  { id: 82, text: "Limita el azúcar en la dieta de los niños", icon: "close-circle", color: "#E74C3C", category: "infantil", citations: ["child_nutrition", "who_nutrition"] },
  { id: 83, text: "Las verduras son importantes desde pequeños", icon: "restaurant", color: "#27AE60", category: "infantil", citations: ["child_nutrition"] },
  { id: 84, text: "El desayuno es crucial para los niños", icon: "sunny", color: "#F39C12", category: "infantil", citations: ["child_nutrition", "usda_dietary"] },
  
  // Nutrición en el Embarazo
  { id: 85, text: "El ácido fólico es importante en el embarazo", icon: "medical", color: "#27AE60", category: "embarazo", citations: ["pregnancy_nutrition"] },
  { id: 86, text: "Come pescado bajo en mercurio", icon: "fish", color: "#3498DB", category: "embarazo", citations: ["pregnancy_nutrition"] },
  { id: 87, text: "Evita el alcohol durante el embarazo", icon: "close-circle", color: "#E74C3C", category: "embarazo", citations: ["pregnancy_nutrition", "who_nutrition"] },
  { id: 88, text: "La hidratación es crucial en el embarazo", icon: "water", color: "#4A90E2", category: "embarazo", citations: ["pregnancy_nutrition", "water_intake_study"] },
  
  // Nutrición para Deportistas
  { id: 89, text: "Los deportistas necesitan más proteína", icon: "fitness", color: "#8E44AD", category: "deportistas", citations: ["exercise_nutrition", "protein_requirements"] },
  { id: 90, text: "La hidratación es clave para el rendimiento", icon: "water", color: "#4A90E2", category: "deportistas", citations: ["exercise_nutrition", "water_intake_study"] },
  { id: 91, text: "Los carbohidratos son el combustible del ejercicio", icon: "flash", color: "#F39C12", category: "deportistas", citations: ["exercise_nutrition"] },
  { id: 92, text: "Recupera bien después del ejercicio", icon: "fitness", color: "#27AE60", category: "deportistas", citations: ["exercise_nutrition"] },
  
  // Nutrición Vegetariana
  { id: 93, text: "Los vegetarianos necesitan vitamina B12", icon: "medical", color: "#27AE60", category: "vegetariano", citations: ["protein_requirements", "usda_dietary"] },
  { id: 94, text: "Combina legumbres con cereales para proteína completa", icon: "nutrition", color: "#8B4513", category: "vegetariano", citations: ["protein_requirements", "fao_nutrition"] },
  { id: 95, text: "El hierro vegetal se absorbe mejor con vitamina C", icon: "medical", color: "#E74C3C", category: "vegetariano", citations: ["vitamin_c_immune", "usda_nutrient_db"] },
  { id: 96, text: "Las semillas son ricas en nutrientes", icon: "nutrition", color: "#8B4513", category: "vegetariano", citations: ["usda_nutrient_db", "omega3_benefits"] },
  
  // Nutrición para la Piel
  { id: 97, text: "La vitamina E es buena para la piel", icon: "medical", color: "#F39C12", category: "piel", citations: ["antioxidants_health", "usda_nutrient_db"] },
  { id: 98, text: "El colágeno mantiene la piel joven", icon: "medical", color: "#8E44AD", category: "piel", citations: ["protein_requirements"] },
  { id: 99, text: "Los antioxidantes protegen la piel", icon: "medical", color: "#27AE60", category: "piel", citations: ["antioxidants_health"] },
  { id: 100, text: "La hidratación es esencial para una piel saludable", icon: "water", color: "#4A90E2", category: "piel", citations: ["water_intake_study"] },
];

// Función para obtener consejos aleatorios
export const getRandomTips = (count: number = 4): NutritionTip[] => {
  const shuffled = [...nutritionTips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Función para obtener el consejo del día
export const getTipOfTheDay = (): NutritionTip => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return nutritionTips[dayOfYear % nutritionTips.length];
};
