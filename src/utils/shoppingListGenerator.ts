import { WeeklyPlan } from '../context/WeeklyPlanContext';

export interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  estimatedPrice: number;
  isChecked: boolean;
}

export interface ShoppingListPlan {
  id: string;
  planId: string;
  planName: string;
  planDescription: string;
  weekStart: string;
  weekEnd: string;
  items: ShoppingListItem[];
  totalItems: number;
  totalCost: number;
  completedItems: number;
}

// Función para extraer ingredientes únicos de un plan semanal
export function extractIngredientsFromPlan(plan: WeeklyPlan): ShoppingListItem[] {
  const ingredientMap = new Map<string, ShoppingListItem>();
  
  // Verificar que el plan tenga meals
  const weeklyMenu = plan.meals;
  if (!weeklyMenu || !Array.isArray(weeklyMenu)) {
    console.warn('Plan sin meals válido:', plan.id, 'meals:', plan.meals);
    return [];
  }
  
  console.log('Extrayendo ingredientes de plan:', plan.name, 'con', weeklyMenu.length, 'días');
  
  // Recorrer todos los días del plan
  weeklyMenu.forEach(day => {
    // Verificar que el día tenga meals
    if (!day.meals) {
      console.warn('Día sin meals:', day);
      return;
    }
    
    // Recorrer todas las comidas del día
    Object.values(day.meals).forEach((meal: any) => {
      if (Array.isArray(meal)) {
        // Es un array de snacks
        meal.forEach((snack: any) => {
          if (snack.ingredients && Array.isArray(snack.ingredients)) {
            snack.ingredients.forEach((ingredient: string) => {
              addIngredientToMap(ingredientMap, ingredient);
            });
          }
        });
      } else {
        // Es una comida individual
        if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
          meal.ingredients.forEach((ingredient: string) => {
            addIngredientToMap(ingredientMap, ingredient);
          });
        }
      }
    });
  });
  
  return Array.from(ingredientMap.values());
}

// Función para normalizar cantidades a formatos realistas de compra
function normalizeToRealisticQuantity(name: string, totalQuantity: number, unit: string): { quantity: string; unit: string } {
  const lowerName = name.toLowerCase();
  
  // Carnes: convertir a paquetes
  if (lowerName.includes('ternera') || lowerName.includes('solomillo') || lowerName.includes('cordero') || 
      lowerName.includes('cerdo') || lowerName.includes('costillas') || lowerName.includes('conejo')) {
    // Si hay más de 200g, considerar un paquete (típicamente 400-500g)
    if (totalQuantity >= 200 || unit === 'g' || unit === 'gramos') {
      return { quantity: '1', unit: 'paquete' };
    }
    return { quantity: '1', unit: 'paquete' };
  }
  
  if (lowerName.includes('pollo') || lowerName.includes('pavo') || lowerName.includes('pato')) {
    // Pollo típicamente se compra en paquetes de ~1kg
    if (totalQuantity >= 500 || unit === 'g' || unit === 'gramos') {
      return { quantity: '1', unit: 'paquete' };
    }
    return { quantity: '1', unit: 'paquete' };
  }
  
  // Pescados: convertir a paquetes o piezas
  if (lowerName.includes('salmón') || lowerName.includes('dorada') || lowerName.includes('lubina') || 
      lowerName.includes('merluza') || lowerName.includes('bacalao') || lowerName.includes('trucha')) {
    if (totalQuantity >= 200 || unit === 'g' || unit === 'gramos') {
      return { quantity: '1', unit: 'paquete' };
    }
    return { quantity: '1', unit: 'pieza' };
  }
  
  if (lowerName.includes('atún')) {
    // Atún normalmente se compra en latas
    return { quantity: '1', unit: 'lata' };
  }
  
  // Mariscos
  if (lowerName.includes('langostinos') || lowerName.includes('gambas')) {
    return { quantity: '1', unit: 'paquete' };
  }
  
  if (lowerName.includes('mejillones')) {
    return { quantity: '1', unit: 'bolsa' };
  }
  
  if (lowerName.includes('almejas')) {
    return { quantity: '1', unit: 'bolsa' };
  }
  
  // Lácteos
  if (lowerName.includes('queso')) {
    return { quantity: '1', unit: 'paquete' };
  }
  
  if (lowerName.includes('mantequilla')) {
    return { quantity: '1', unit: 'paquete' };
  }
  
  if (lowerName.includes('leche')) {
    return { quantity: '1', unit: 'brick' };
  }
  
  if (lowerName.includes('yogur')) {
    // Si hay 4 o más yogures, considerar un pack
    if (totalQuantity >= 4) {
      return { quantity: '1', unit: 'pack' };
    }
    return { quantity: totalQuantity.toString(), unit: 'unidad' };
  }
  
  if (lowerName.includes('huevo')) {
    // Si hay 6 o más huevos, considerar una docena o media docena
    if (totalQuantity >= 12) {
      return { quantity: '1', unit: 'docena' };
    } else if (totalQuantity >= 6) {
      return { quantity: '1', unit: 'media docena' };
    }
    return { quantity: totalQuantity.toString(), unit: 'unidad' };
  }
  
  // Granos y cereales: siempre en paquetes
  if (lowerName.includes('arroz') || lowerName.includes('pasta') || lowerName.includes('quinoa') || 
      lowerName.includes('avena') || lowerName.includes('lentejas') || lowerName.includes('garbanzos') ||
      lowerName.includes('harina') || lowerName.includes('azúcar') || lowerName.includes('sal')) {
    return { quantity: '1', unit: 'paquete' };
  }
  
  // Frutas: si hay varias, considerar pack
  if (lowerName.includes('fresas') || lowerName.includes('arándanos') || lowerName.includes('frambuesa') ||
      lowerName.includes('mora')) {
    return { quantity: '1', unit: 'bandeja' };
  }
  
  if (lowerName.includes('manzana') || lowerName.includes('naranja') || lowerName.includes('mandarina') ||
      lowerName.includes('plátano')) {
    if (totalQuantity >= 4) {
      return { quantity: '1', unit: 'pack' };
    }
    return { quantity: totalQuantity.toString(), unit: 'unidad' };
  }
  
  // Verduras en bolsas
  if (lowerName.includes('espinacas') || lowerName.includes('lechuga') || lowerName.includes('rúcula') ||
      lowerName.includes('canónigos') || lowerName.includes('kale')) {
    return { quantity: '1', unit: 'bolsa' };
  }
  
  if (lowerName.includes('zanahoria') || lowerName.includes('cebolla') || lowerName.includes('patata')) {
    if (totalQuantity >= 3) {
      return { quantity: '1', unit: 'malla' };
    }
    return { quantity: totalQuantity.toString(), unit: 'unidad' };
  }
  
  if (lowerName.includes('champiñones') || lowerName.includes('setas')) {
    return { quantity: '1', unit: 'bandeja' };
  }
  
  if (lowerName.includes('tomate')) {
    if (totalQuantity >= 4) {
      return { quantity: '1', unit: 'pack' };
    }
    return { quantity: totalQuantity.toString(), unit: 'unidad' };
  }
  
  // Aceites
  if (lowerName.includes('aceite')) {
    return { quantity: '1', unit: 'botella' };
  }
  
  // Pan
  if (lowerName.includes('pan')) {
    return { quantity: '1', unit: 'unidad' };
  }
  
  // Si no se puede normalizar, mantener la cantidad original pero mejorar la unidad
  return { quantity: totalQuantity.toString(), unit: unit || getInferredUnit(name) };
}

// Función auxiliar para agregar ingredientes al mapa
function addIngredientToMap(ingredientMap: Map<string, ShoppingListItem>, ingredient: string) {
  const parsed = parseIngredient(ingredient);
  
  if (!parsed) {
    // Si no se pudo analizar, añadir como un ingrediente sin cantidad
    const ingredientKey = ingredient.toLowerCase().trim();
    if (!ingredientMap.has(ingredientKey)) {
      const normalized = normalizeToRealisticQuantity(ingredient, 1, 'unidad');
      ingredientMap.set(ingredientKey, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: ingredient,
        category: categorizeIngredient(ingredient),
        quantity: normalized.quantity,
        unit: normalized.unit,
        estimatedPrice: getEstimatedPrice(ingredient),
        isChecked: false,
      });
    }
    return;
  }
  
  const { name, quantity, unit } = parsed;
  const ingredientKey = name.toLowerCase();

  // Si ya existe, sumar la cantidad
  if (ingredientMap.has(ingredientKey)) {
    const existing = ingredientMap.get(ingredientKey)!;
    
    // Convertir a número para sumar
    const currentQuantity = parseFloat(existing.quantity) || 0;
    const newQuantity = quantity || 0;
    const totalQuantity = currentQuantity + newQuantity;
    
    // Normalizar a formato realista de compra
    const normalized = normalizeToRealisticQuantity(name, totalQuantity, unit || existing.unit);
    existing.quantity = normalized.quantity;
    existing.unit = normalized.unit;
    
  } else {
    // Si no existe, crear un nuevo ingrediente normalizado
    const normalized = normalizeToRealisticQuantity(name, quantity || 1, unit);
    const newItem: ShoppingListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name,
      category: categorizeIngredient(name),
      quantity: normalized.quantity,
      unit: normalized.unit,
      estimatedPrice: getEstimatedPrice(name),
      isChecked: false
    };
    ingredientMap.set(ingredientKey, newItem);
  }
}

// Nueva función para inferir la unidad basada en el nombre del ingrediente
export function getInferredUnit(name: string): string {
    const lowerName = name.toLowerCase();

    // Botellas
    if (lowerName.includes('aceite') || lowerName.includes('vinagre') || lowerName.includes('vino') || lowerName.includes('agua mineral') || lowerName.includes('refresco')) {
        return 'botella';
    }
    
    // Litros/Bricks
    if (lowerName.includes('leche')) {
        return 'brick';
    }
    if (lowerName.includes('zumo') || lowerName.includes('caldo') || lowerName.includes('agua')) {
        return 'l';
    }

    // Paquetes (carnes, pescados, granos, lácteos)
    if (lowerName.includes('ternera') || lowerName.includes('pollo') || lowerName.includes('cerdo') || 
        lowerName.includes('cordero') || lowerName.includes('salmón') || lowerName.includes('langostinos') ||
        lowerName.includes('queso') || lowerName.includes('mantequilla') ||
        lowerName.includes('pasta') || lowerName.includes('arroz') || lowerName.includes('lentejas') || 
        lowerName.includes('garbanzos') || lowerName.includes('quinoa') || lowerName.includes('avena') ||
        lowerName.includes('patatas fritas') || lowerName.includes('pan de molde') || lowerName.includes('galletas') || 
        lowerName.includes('sal') || lowerName.includes('azúcar') || lowerName.includes('harina')) {
        return 'paquete';
    }
    
    // Bolsas (verduras de hoja, mariscos)
    if (lowerName.includes('espinacas') || lowerName.includes('lechuga') || lowerName.includes('rúcula') || 
        lowerName.includes('canónigos') || lowerName.includes('kale') || lowerName.includes('mejillones') ||
        lowerName.includes('almejas')) {
        return 'bolsa';
    }
    
    // Bandejas (frutas pequeñas, setas)
    if (lowerName.includes('fresas') || lowerName.includes('arándanos') || lowerName.includes('frambuesa') ||
        lowerName.includes('mora') || lowerName.includes('champiñones') || lowerName.includes('setas')) {
        return 'bandeja';
    }
    
    // Latas
    if (lowerName.includes('atún')) {
        return 'lata';
    }
    
    // Packs (frutas múltiples)
    if (lowerName.includes('manzana') || lowerName.includes('naranja') || lowerName.includes('mandarina') ||
        lowerName.includes('plátano') || lowerName.includes('tomate')) {
        return 'pack';
    }
    
    // Mallas (verduras a granel)
    if (lowerName.includes('zanahoria') || lowerName.includes('cebolla') || lowerName.includes('patata')) {
        return 'malla';
    }
    
    // Unidades individuales
    if (lowerName.includes('huevo') || lowerName.includes('limón') || lowerName.includes('aguacate') ||
        lowerName.includes('pan') || lowerName.includes('yogur')) {
        return 'unidad';
    }

    // Por defecto, no mostrar unidad
    return '';
}


// Función para analizar un ingrediente y extraer cantidad, unidad y nombre
export function parseIngredient(ingredient: string): { name: string; quantity: number; unit: string } | null {
  const cleanedIngredient = ingredient.toLowerCase().trim();
  
  // Regex para capturar cantidad (incluyendo decimales y fracciones), unidad y nombre
  const regex = /^\s*(\d+\s*\/\s*\d+|\d+[\.,]?\d*)\s*(g|gr|gramos|kg|kilos|ml|l|litro|litros|cucharada|cucharadita|taza|unidades|ud|uds|un)?\s*(de)?\s*(.*)/;
  const match = cleanedIngredient.match(regex);

  if (match) {
    const quantityStr = match[1];
    let quantity = 0;
    
    // Convertir fracción a número
    if (quantityStr.includes('/')) {
      const parts = quantityStr.split('/');
      quantity = parseInt(parts[0], 10) / parseInt(parts[1], 10);
    } else {
      quantity = parseFloat(quantityStr.replace(',', '.'));
    }
    
    let unit = match[2];
    let name = match[4].trim();

    // Si no se encuentra una unidad, inferirla del nombre
    if (!unit) {
        unit = getInferredUnit(name);
    } else {
        // Estandarizar unidades
        if (unit === 'gr' || unit === 'gramos') unit = 'g';
        if (unit === 'kilos') unit = 'kg';
        if (unit === 'ud' || unit === 'uds' || unit === 'un') unit = 'unidades';
        if (unit === 'litro' || unit === 'litros') unit = 'l';
    }
    
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    return { name, quantity, unit };
  }
  
  // Si no coincide, puede ser un ingrediente sin cantidad explícita (ej: "Sal al gusto")
  let name = ingredient.trim();
  const inferredUnit = getInferredUnit(name); // Inferir unidad también aquí
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return { name, quantity: 1, unit: inferredUnit };
}

// Función para categorizar ingredientes
export function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Carnes y aves
  if (lowerIngredient.includes('pollo') || lowerIngredient.includes('ternera') || 
      lowerIngredient.includes('cerdo') || lowerIngredient.includes('cordero') ||
      lowerIngredient.includes('conejo') || lowerIngredient.includes('pato') ||
      lowerIngredient.includes('pavo') || lowerIngredient.includes('bacon') ||
      lowerIngredient.includes('jamón') || lowerIngredient.includes('chorizo') ||
      lowerIngredient.includes('costillas') || lowerIngredient.includes('solomillo')) {
    return 'Carnes y Aves';
  }
  
  // Pescados y mariscos
  if (lowerIngredient.includes('salmón') || lowerIngredient.includes('atún') ||
      lowerIngredient.includes('pescado') || lowerIngredient.includes('merluza') ||
      lowerIngredient.includes('bacalao') || lowerIngredient.includes('dorada') ||
      lowerIngredient.includes('lubina') || lowerIngredient.includes('trucha') ||
      lowerIngredient.includes('langostinos') || lowerIngredient.includes('mejillones') ||
      lowerIngredient.includes('almejas') || lowerIngredient.includes('calamar') ||
      lowerIngredient.includes('pulpo')) {
    return 'Pescados y Mariscos';
  }
  
  // Lácteos y huevos
  if (lowerIngredient.includes('huevo') || lowerIngredient.includes('queso') ||
      lowerIngredient.includes('leche') || lowerIngredient.includes('yogur') ||
      lowerIngredient.includes('mantequilla') || lowerIngredient.includes('requesón')) {
    return 'Lácteos y Huevos';
  }
  
  // Frutas
  if (lowerIngredient.includes('manzana') || lowerIngredient.includes('plátano') ||
      lowerIngredient.includes('fresas') || lowerIngredient.includes('arándanos') ||
      lowerIngredient.includes('naranja') || lowerIngredient.includes('pera') ||
      lowerIngredient.includes('kiwi') || lowerIngredient.includes('mango') ||
      lowerIngredient.includes('piña') || lowerIngredient.includes('granada') ||
      lowerIngredient.includes('uva') || lowerIngredient.includes('melocotón') ||
      lowerIngredient.includes('albaricoque') || lowerIngredient.includes('ciruela') ||
      lowerIngredient.includes('higo') || lowerIngredient.includes('cereza') ||
      lowerIngredient.includes('frambuesa') || lowerIngredient.includes('mora') ||
      lowerIngredient.includes('limón') || lowerIngredient.includes('lima') ||
      lowerIngredient.includes('pomelo') || lowerIngredient.includes('mandarina') ||
      lowerIngredient.includes('papaya') || lowerIngredient.includes('maracuyá') ||
      lowerIngredient.includes('coco') || lowerIngredient.includes('dátiles') ||
      lowerIngredient.includes('pasas') || lowerIngredient.includes('higos secos')) {
    return 'Frutas';
  }
  
  // Verduras
  if (lowerIngredient.includes('brócoli') || lowerIngredient.includes('zanahoria') ||
      lowerIngredient.includes('espinacas') || lowerIngredient.includes('pimientos') ||
      lowerIngredient.includes('calabacín') || lowerIngredient.includes('berenjena') ||
      lowerIngredient.includes('tomate') || lowerIngredient.includes('cebolla') ||
      lowerIngredient.includes('lechuga') || lowerIngredient.includes('pepino') ||
      lowerIngredient.includes('patata') || lowerIngredient.includes('batata') ||
      lowerIngredient.includes('coliflor') || lowerIngredient.includes('col') ||
      lowerIngredient.includes('apio') || lowerIngredient.includes('puerro') ||
      lowerIngredient.includes('nabo') || lowerIngredient.includes('rábano') ||
      lowerIngredient.includes('remolacha') || lowerIngredient.includes('alcachofa') ||
      lowerIngredient.includes('espárragos') || lowerIngredient.includes('judías') ||
      lowerIngredient.includes('guisantes') || lowerIngredient.includes('maíz') ||
      lowerIngredient.includes('champiñones') || lowerIngredient.includes('setas') ||
      lowerIngredient.includes('calabaza') || lowerIngredient.includes('boniato') ||
      lowerIngredient.includes('kale') || lowerIngredient.includes('edamame')) {
    return 'Verduras';
  }
  
  // Granos y cereales
  if (lowerIngredient.includes('arroz') || lowerIngredient.includes('pasta') ||
      lowerIngredient.includes('quinoa') || lowerIngredient.includes('avena') ||
      lowerIngredient.includes('pan') || lowerIngredient.includes('bulgur') ||
      lowerIngredient.includes('cuscús') || lowerIngredient.includes('mijo') ||
      lowerIngredient.includes('amaranto') || lowerIngredient.includes('trigo sarraceno') ||
      lowerIngredient.includes('cebada') || lowerIngredient.includes('centeno') ||
      lowerIngredient.includes('espelta') || lowerIngredient.includes('kamut') ||
      lowerIngredient.includes('teff') || lowerIngredient.includes('arroz salvaje') ||
      lowerIngredient.includes('pasta de lentejas') || lowerIngredient.includes('pasta de garbanzos') ||
      lowerIngredient.includes('tortillas') || lowerIngredient.includes('wraps') ||
      lowerIngredient.includes('granola')) {
    return 'Granos y Cereales';
  }
  
  // Legumbres
  if (lowerIngredient.includes('lentejas') || lowerIngredient.includes('garbanzos') ||
      lowerIngredient.includes('hummus') || lowerIngredient.includes('edamame')) {
    return 'Legumbres';
  }
  
  // Frutos secos y semillas
  if (lowerIngredient.includes('nueces') || lowerIngredient.includes('almendras') ||
      lowerIngredient.includes('pistachos') || lowerIngredient.includes('anacardos') ||
      lowerIngredient.includes('avellanas') || lowerIngredient.includes('macadamias') ||
      lowerIngredient.includes('semillas de girasol') || lowerIngredient.includes('semillas de calabaza') ||
      lowerIngredient.includes('semillas de chía') || lowerIngredient.includes('semillas de lino') ||
      lowerIngredient.includes('semillas de sésamo')) {
    return 'Frutos Secos y Semillas';
  }
  
  // Aceites y grasas
  if (lowerIngredient.includes('aceite') || lowerIngredient.includes('aguacate') ||
      lowerIngredient.includes('aceitunas') || lowerIngredient.includes('tahini')) {
    return 'Aceites y Grasas';
  }
  
  // Condimentos y especias
  if (lowerIngredient.includes('sal') || lowerIngredient.includes('pimienta') ||
      lowerIngredient.includes('canela') || lowerIngredient.includes('nuez moscada') ||
      lowerIngredient.includes('clavo') || lowerIngredient.includes('cardamomo') ||
      lowerIngredient.includes('anís') || lowerIngredient.includes('hinojo') ||
      lowerIngredient.includes('mostaza') || lowerIngredient.includes('wasabi') ||
      lowerIngredient.includes('curry') || lowerIngredient.includes('garam masala') ||
      lowerIngredient.includes('za\'atar') || lowerIngredient.includes('sumac') ||
      lowerIngredient.includes('cúrcuma') || lowerIngredient.includes('comino') ||
      lowerIngredient.includes('orégano') || lowerIngredient.includes('albahaca') ||
      lowerIngredient.includes('jengibre') || lowerIngredient.includes('pimentón') ||
      lowerIngredient.includes('romero') || lowerIngredient.includes('tomillo') ||
      lowerIngredient.includes('laurel') || lowerIngredient.includes('estragón') ||
      lowerIngredient.includes('eneldo') || lowerIngredient.includes('cilantro') ||
      lowerIngredient.includes('perejil') || lowerIngredient.includes('menta') ||
      lowerIngredient.includes('hierbabuena')) {
    return 'Condimentos y Especias';
  }
  
  // Otros
  return 'Otros';
}

// Función para obtener la unidad por defecto
function getDefaultUnit(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  if (lowerIngredient.includes('aceite') || lowerIngredient.includes('leche') || 
      lowerIngredient.includes('yogur') || lowerIngredient.includes('vinagre')) {
    return 'ml';
  }
  
  if (lowerIngredient.includes('arroz') || lowerIngredient.includes('pasta') ||
      lowerIngredient.includes('quinoa') || lowerIngredient.includes('avena') ||
      lowerIngredient.includes('lentejas') || lowerIngredient.includes('garbanzos') ||
      lowerIngredient.includes('harina') || lowerIngredient.includes('azúcar') ||
      lowerIngredient.includes('sal')) {
    return 'g';
  }
  
  if (lowerIngredient.includes('manzana') || lowerIngredient.includes('plátano') ||
      lowerIngredient.includes('naranja') || lowerIngredient.includes('pera') ||
      lowerIngredient.includes('kiwi') || lowerIngredient.includes('mango') ||
      lowerIngredient.includes('piña') || lowerIngredient.includes('granada') ||
      lowerIngredient.includes('uva') || lowerIngredient.includes('melocotón') ||
      lowerIngredient.includes('albaricoque') || lowerIngredient.includes('ciruela') ||
      lowerIngredient.includes('higo') || lowerIngredient.includes('cereza') ||
      lowerIngredient.includes('limón') || lowerIngredient.includes('lima') ||
      lowerIngredient.includes('pomelo') || lowerIngredient.includes('mandarina') ||
      lowerIngredient.includes('papaya') || lowerIngredient.includes('coco') ||
      lowerIngredient.includes('dátiles') || lowerIngredient.includes('huevo') ||
      lowerIngredient.includes('aguacate') || lowerIngredient.includes('tomate') ||
      lowerIngredient.includes('cebolla') || lowerIngredient.includes('patata') ||
      lowerIngredient.includes('batata') || lowerIngredient.includes('calabaza') ||
      lowerIngredient.includes('boniato') || lowerIngredient.includes('lechuga') ||
      lowerIngredient.includes('pepino') || lowerIngredient.includes('berenjena') ||
      lowerIngredient.includes('calabacín') || lowerIngredient.includes('pimientos') ||
      lowerIngredient.includes('zanahoria') || lowerIngredient.includes('brócoli') ||
      lowerIngredient.includes('coliflor') || lowerIngredient.includes('col') ||
      lowerIngredient.includes('apio') || lowerIngredient.includes('puerro') ||
      lowerIngredient.includes('nabo') || lowerIngredient.includes('rábano') ||
      lowerIngredient.includes('remolacha') || lowerIngredient.includes('alcachofa') ||
      lowerIngredient.includes('espárragos') || lowerIngredient.includes('champiñones') ||
      lowerIngredient.includes('setas') || lowerIngredient.includes('kale')) {
    return 'unidades';
  }
  
  return 'g';
}

// Función para obtener precio estimado (precios realistas del mercado español 2024)
// Los precios están en euros por kg (carnes/pescados), por unidad (frutas/verduras), por litro (líquidos), etc.
export function getEstimatedPrice(ingredient: string): number {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Carnes (precios realistas considerando paquetes reutilizables)
  if (lowerIngredient.includes('ternera') || lowerIngredient.includes('solomillo')) {
    return 6.50; // Ternera: paquete pequeño ~400g por 6-7€
  }
  
  if (lowerIngredient.includes('cordero')) {
    return 5.50; // Cordero: paquete pequeño ~400g por 5-6€
  }
  
  if (lowerIngredient.includes('pollo')) {
    return 4.50; // Pollo: paquete ~1kg por 4-5€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('cerdo') || lowerIngredient.includes('costillas')) {
    return 4.00; // Cerdo: paquete ~800g por 4-5€
  }
  
  if (lowerIngredient.includes('conejo')) {
    return 5.50; // Conejo: paquete pequeño ~600g por 5-6€
  }
  
  if (lowerIngredient.includes('pato') || lowerIngredient.includes('pavo')) {
    return 4.50; // Pato/Pavo: paquete ~800g por 4-5€
  }
  
  if (lowerIngredient.includes('jamón') || lowerIngredient.includes('bacon') || 
      lowerIngredient.includes('chorizo')) {
    return 3.50; // Embutidos: paquete pequeño ~200-300g por 3-4€
  }
  
  // Pescados (considerando alternativas más económicas)
  if (lowerIngredient.includes('salmón')) {
    return 5.50; // Salmón: paquete congelado ~400g por 5-6€ o fresco en porción pequeña
  }
  
  if (lowerIngredient.includes('atún')) {
    return 1.80; // Atún: lata de atún en conserva ~160g por 1.50-2€ (más común y barato)
  }
  
  if (lowerIngredient.includes('dorada') || lowerIngredient.includes('lubina')) {
    return 4.50; // Dorada/Lubina: pieza pequeña ~400g por 4-5€
  }
  
  if (lowerIngredient.includes('pescado') || lowerIngredient.includes('merluza') ||
      lowerIngredient.includes('bacalao') || lowerIngredient.includes('trucha')) {
    return 3.50; // Pescado blanco: paquete congelado ~500g por 3-4€ o pieza pequeña
  }
  
  // Mariscos
  if (lowerIngredient.includes('langostinos')) {
    return 4.50; // Langostinos: paquete congelado ~300g por 4-5€
  }
  
  if (lowerIngredient.includes('mejillones')) {
    return 2.50; // Mejillones: bolsa ~1kg por 2-3€
  }
  
  if (lowerIngredient.includes('almejas')) {
    return 3.50; // Almejas: bolsa pequeña ~500g por 3-4€
  }
  
  if (lowerIngredient.includes('calamar') || lowerIngredient.includes('pulpo')) {
    return 4.00; // Calamar/Pulpo: paquete congelado ~400g por 4-5€
  }
  
  // Frutas (precios realistas por unidad o paquete pequeño)
  if (lowerIngredient.includes('fresas')) {
    return 2.50; // Fresas: bandeja pequeña ~250g por 2-3€
  }
  
  if (lowerIngredient.includes('arándanos') || lowerIngredient.includes('frambuesa') ||
      lowerIngredient.includes('mora')) {
    return 3.50; // Frutos del bosque: bandeja pequeña ~125g por 3-4€
  }
  
  if (lowerIngredient.includes('manzana')) {
    return 0.35; // Manzana: unidad por 0.30-0.40€ (o pack de 4 por ~1.20€)
  }
  
  if (lowerIngredient.includes('plátano')) {
    return 0.25; // Plátano: unidad por 0.20-0.30€ (o mano de 4-5 por ~1€)
  }
  
  if (lowerIngredient.includes('naranja') || lowerIngredient.includes('mandarina')) {
    return 0.30; // Cítricos: unidad por 0.25-0.35€ (o malla de 2kg por ~2€)
  }
  
  if (lowerIngredient.includes('pera')) {
    return 0.40; // Pera: unidad por 0.35-0.45€
  }
  
  if (lowerIngredient.includes('kiwi')) {
    return 0.30; // Kiwi: unidad por 0.25-0.35€ (o pack de 4 por ~1€)
  }
  
  if (lowerIngredient.includes('mango') || lowerIngredient.includes('papaya') ||
      lowerIngredient.includes('maracuyá')) {
    return 1.50; // Frutas tropicales: unidad por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('piña')) {
    return 2.20; // Piña: unidad por 2-2.50€
  }
  
  if (lowerIngredient.includes('granada') || lowerIngredient.includes('uva') ||
      lowerIngredient.includes('melocotón') || lowerIngredient.includes('albaricoque') ||
      lowerIngredient.includes('ciruela') || lowerIngredient.includes('higo') ||
      lowerIngredient.includes('cereza')) {
    return 0.50; // Frutas de temporada: unidad por 0.40-0.60€ (o pack pequeño)
  }
  
  if (lowerIngredient.includes('limón') || lowerIngredient.includes('lima') ||
      lowerIngredient.includes('pomelo')) {
    return 0.25; // Cítricos especiales: unidad por 0.20-0.30€
  }
  
  if (lowerIngredient.includes('coco')) {
    return 1.80; // Coco: unidad por 1.50-2€
  }
  
  if (lowerIngredient.includes('dátiles') || lowerIngredient.includes('pasas') ||
      lowerIngredient.includes('higos secos')) {
    return 3.50; // Frutas secas: paquete pequeño ~200g por 3-4€
  }
  
  // Verduras (precios realistas por unidad o paquete pequeño)
  if (lowerIngredient.includes('brócoli')) {
    return 1.50; // Brócoli: unidad pequeña por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('espinacas') || lowerIngredient.includes('kale')) {
    return 1.80; // Hojas verdes: bolsa ~200g por 1.50-2€
  }
  
  if (lowerIngredient.includes('espárragos')) {
    return 2.50; // Espárragos: mano pequeña ~250g por 2-3€
  }
  
  if (lowerIngredient.includes('alcachofa')) {
    return 1.20; // Alcachofa: unidad por 1-1.50€
  }
  
  if (lowerIngredient.includes('champiñones') || lowerIngredient.includes('setas')) {
    return 2.20; // Setas: bandeja ~250g por 2-2.50€
  }
  
  if (lowerIngredient.includes('zanahoria')) {
    return 0.80; // Zanahoria: malla de 1kg por 0.70-0.90€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('pimientos')) {
    return 1.50; // Pimientos: unidad o pack de 3 por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('calabacín') || lowerIngredient.includes('berenjena')) {
    return 1.20; // Calabacín/Berenjena: unidad por 1-1.50€
  }
  
  if (lowerIngredient.includes('tomate')) {
    return 1.50; // Tomate: pack pequeño ~500g por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('cebolla')) {
    return 1.20; // Cebolla: malla de 1kg por 1-1.50€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('lechuga') || lowerIngredient.includes('rúcula') ||
      lowerIngredient.includes('canónigos')) {
    return 1.20; // Lechugas: unidad o bolsa por 1-1.50€
  }
  
  if (lowerIngredient.includes('pepino')) {
    return 0.80; // Pepino: unidad por 0.70-0.90€
  }
  
  if (lowerIngredient.includes('patata')) {
    return 1.20; // Patata: malla de 2kg por 1-1.50€ (se usa muchas veces)
  }
  
  if (lowerIngredient.includes('batata') || lowerIngredient.includes('boniato')) {
    return 1.80; // Boniato: unidad o pack pequeño por 1.50-2€
  }
  
  if (lowerIngredient.includes('coliflor') || lowerIngredient.includes('col')) {
    return 1.50; // Coliflor/Col: unidad pequeña por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('apio') || lowerIngredient.includes('puerro')) {
    return 1.20; // Apio/Puerro: mano pequeña por 1-1.50€
  }
  
  if (lowerIngredient.includes('nabo') || lowerIngredient.includes('rábano') ||
      lowerIngredient.includes('remolacha')) {
    return 1.50; // Raíces: pack pequeño por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('judías') || lowerIngredient.includes('guisantes') ||
      lowerIngredient.includes('maíz') || lowerIngredient.includes('edamame')) {
    return 2.20; // Legumbres frescas: bolsa pequeña ~300g por 2-2.50€
  }
  
  if (lowerIngredient.includes('calabaza')) {
    return 1.50; // Calabaza: trozo pequeño por 1.20-1.80€
  }
  
  // Lácteos
  if (lowerIngredient.includes('queso')) {
    return 3.50; // Queso: paquete pequeño ~250-300g por 3-4€
  }
  
  if (lowerIngredient.includes('mantequilla')) {
    return 2.20; // Mantequilla: paquete ~250g por 2-2.50€
  }
  
  if (lowerIngredient.includes('leche')) {
    return 0.85; // Leche: brick 1L por 0.80-0.90€
  }
  
  if (lowerIngredient.includes('yogur')) {
    return 0.35; // Yogur: unidad por 0.30-0.40€ (o pack de 4 por ~1.20€)
  }
  
  if (lowerIngredient.includes('requesón')) {
    return 2.50; // Requesón: tarro ~250g por 2-3€
  }
  
  if (lowerIngredient.includes('huevo')) {
    return 0.20; // Huevo: unidad por 0.18-0.22€ (o docena por ~2.20€)
  }
  
  // Granos y cereales (precios por paquete, no por kg completo)
  if (lowerIngredient.includes('arroz')) {
    return 1.20; // Arroz: paquete ~1kg por 1-1.50€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('pasta')) {
    return 0.90; // Pasta: paquete ~500g por 0.80-1€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('quinoa')) {
    return 3.50; // Quinoa: paquete pequeño ~400g por 3-4€
  }
  
  if (lowerIngredient.includes('avena')) {
    return 1.50; // Avena: paquete ~500g por 1.30-1.70€
  }
  
  if (lowerIngredient.includes('bulgur') || lowerIngredient.includes('cuscús')) {
    return 2.20; // Bulgur/Cuscús: paquete ~400g por 2-2.50€
  }
  
  if (lowerIngredient.includes('mijo') || lowerIngredient.includes('amaranto') ||
      lowerIngredient.includes('trigo sarraceno') || lowerIngredient.includes('cebada') ||
      lowerIngredient.includes('centeno') || lowerIngredient.includes('espelta') ||
      lowerIngredient.includes('kamut') || lowerIngredient.includes('teff') ||
      lowerIngredient.includes('arroz salvaje')) {
    return 3.00; // Cereales especiales: paquete pequeño ~300g por 3-3.50€
  }
  
  if (lowerIngredient.includes('pasta de lentejas') || lowerIngredient.includes('pasta de garbanzos')) {
    return 2.50; // Pasta de legumbres: paquete ~400g por 2-3€
  }
  
  if (lowerIngredient.includes('pan')) {
    return 1.50; // Pan: barra o pan de molde por 1.20-1.80€
  }
  
  if (lowerIngredient.includes('tortillas') || lowerIngredient.includes('wraps')) {
    return 1.80; // Tortillas: paquete de 6-8 unidades por 1.50-2€
  }
  
  if (lowerIngredient.includes('granola')) {
    return 3.50; // Granola: paquete ~400g por 3-4€
  }
  
  // Legumbres (precios por paquete)
  if (lowerIngredient.includes('lentejas') || lowerIngredient.includes('garbanzos')) {
    return 1.50; // Legumbres secas: paquete ~500g por 1.20-1.80€ (se usa varias veces)
  }
  
  if (lowerIngredient.includes('hummus')) {
    return 2.50; // Hummus: tarro ~250g por 2-3€
  }
  
  // Frutos secos (precios por paquete pequeño)
  if (lowerIngredient.includes('nueces') || lowerIngredient.includes('almendras') ||
      lowerIngredient.includes('pistachos') || lowerIngredient.includes('anacardos') ||
      lowerIngredient.includes('avellanas') || lowerIngredient.includes('macadamias')) {
    return 4.50; // Frutos secos: paquete pequeño ~200-300g por 4-5€
  }
  
  if (lowerIngredient.includes('semillas de girasol') || lowerIngredient.includes('semillas de calabaza') ||
      lowerIngredient.includes('semillas de chía') || lowerIngredient.includes('semillas de lino') ||
      lowerIngredient.includes('semillas de sésamo')) {
    return 2.50; // Semillas: paquete pequeño ~200g por 2-3€
  }
  
  // Aceites y grasas
  if (lowerIngredient.includes('aceite')) {
    return 3.50; // Aceite de oliva: botella 1L por 3-4€ (se usa muchas veces)
  }
  
  if (lowerIngredient.includes('aguacate')) {
    return 2.50; // Aguacate: unidad por 2-3€ o pack de 4 por ~4€
  }
  
  if (lowerIngredient.includes('aceitunas')) {
    return 2.20; // Aceitunas: tarro pequeño ~200g por 2-2.50€
  }
  
  if (lowerIngredient.includes('tahini')) {
    return 4.50; // Tahini: tarro ~250g por 4-5€
  }
  
  // Condimentos y especias (precios realistas - se compran una vez y duran mucho)
  if (lowerIngredient.includes('sal') || lowerIngredient.includes('pimienta')) {
    return 0.80; // Sal/Pimienta: paquete pequeño por 0.70-0.90€ (dura mucho)
  }
  
  if (lowerIngredient.includes('canela') || lowerIngredient.includes('nuez moscada') ||
      lowerIngredient.includes('clavo') || lowerIngredient.includes('cardamomo') ||
      lowerIngredient.includes('anís') || lowerIngredient.includes('hinojo') ||
      lowerIngredient.includes('curry') || lowerIngredient.includes('garam masala') ||
      lowerIngredient.includes('za\'atar') || lowerIngredient.includes('sumac') ||
      lowerIngredient.includes('cúrcuma') || lowerIngredient.includes('comino') ||
      lowerIngredient.includes('orégano') || lowerIngredient.includes('pimentón') ||
      lowerIngredient.includes('romero') || lowerIngredient.includes('tomillo') ||
      lowerIngredient.includes('laurel') || lowerIngredient.includes('estragón') ||
      lowerIngredient.includes('eneldo')) {
    return 1.50; // Especias secas: bote pequeño por 1.20-1.80€ (dura mucho)
  }
  
  if (lowerIngredient.includes('mostaza') || lowerIngredient.includes('wasabi')) {
    return 1.80; // Salsas: tarro pequeño por 1.50-2€
  }
  
  if (lowerIngredient.includes('albahaca') || lowerIngredient.includes('jengibre') ||
      lowerIngredient.includes('cilantro') || lowerIngredient.includes('perejil') ||
      lowerIngredient.includes('menta') || lowerIngredient.includes('hierbabuena')) {
    return 1.20; // Hierbas frescas: mano pequeña por 1-1.50€
  }
  
  // Precio por defecto (producto genérico)
  return 2.00;
}

// Función para crear lista de compras de un plan
export function createShoppingListFromPlan(plan: WeeklyPlan): ShoppingListPlan {
  const items = extractIngredientsFromPlan(plan);
  const totalCost = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const completedItems = items.filter(item => item.isChecked).length;
  
  return {
    id: `shopping_${plan.id}`,
    planId: plan.id,
    planName: plan.name,
    planDescription: plan.description,
    weekStart: plan.weekStart,
    weekEnd: plan.weekEnd,
    items,
    totalItems: items.length,
    totalCost,
    completedItems
  };
}
