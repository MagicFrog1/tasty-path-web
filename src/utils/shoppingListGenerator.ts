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

// Función auxiliar para agregar ingredientes al mapa
function addIngredientToMap(ingredientMap: Map<string, ShoppingListItem>, ingredient: string) {
  const parsed = parseIngredient(ingredient);
  
  if (!parsed) {
    // Si no se pudo analizar, añadir como un ingrediente sin cantidad
    const ingredientKey = ingredient.toLowerCase().trim();
    if (!ingredientMap.has(ingredientKey)) {
      ingredientMap.set(ingredientKey, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: ingredient,
        category: categorizeIngredient(ingredient),
        quantity: '1',
        unit: 'unidad',
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
    
    // Convertir a número para sumar, manejar casos de 'unidades'
    const currentQuantity = parseFloat(existing.quantity) || 0;
    const newQuantity = quantity || 0;
    
    // Si la unidad es la misma, sumar. Si no, podrías añadir lógica de conversión
    if (existing.unit === unit || (existing.unit === 'unidades' && unit === 'unidad') || (existing.unit === 'unidad' && unit === 'unidades')) {
      existing.quantity = (currentQuantity + newQuantity).toString();
    }
    // Si las unidades son diferentes y no es un simple plural, podrías decidir mantenerlas separadas o convertir
    // Por simplicidad aquí, si la unidad es diferente, se podría optar por no sumar y añadir como nuevo.
    // O como en este caso, se suma igual asumiendo que el plan es consistente.
    else {
      existing.quantity = (currentQuantity + newQuantity).toString();
      // Opcionalmente, podrías cambiar la unidad si la nueva es más genérica.
    }
    
  } else {
    // Si no existe, crear un nuevo ingrediente
    const newItem: ShoppingListItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name,
      category: categorizeIngredient(name),
      quantity: quantity.toString(),
      unit: unit,
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
    
    // Litros
    if (lowerName.includes('leche') || lowerName.includes('zumo') || lowerName.includes('caldo') || lowerName.includes('agua')) {
        return 'l';
    }

    // Paquetes
    if (lowerName.includes('pasta') || lowerName.includes('arroz') || lowerName.includes('lentejas') || lowerName.includes('garbanzos') || lowerName.includes('patatas fritas') || lowerName.includes('pan de molde') || lowerName.includes('galletas') || lowerName.includes('sal') || lowerName.includes('azúcar') || lowerName.includes('harina')) {
        return 'paquete';
    }
    
    // Bolsas
    if (lowerName.includes('espinacas') || lowerName.includes('lechuga') || lowerName.includes('rúcula') || lowerName.includes('canónigos')) {
        return 'bolsa';
    }

    // Para ingredientes que normalmente se cuentan individualmente, no mostrar unidad
    if (lowerName.includes('huevo') || lowerName.includes('manzana') || lowerName.includes('plátano') || 
        lowerName.includes('naranja') || lowerName.includes('limón') || lowerName.includes('tomate') ||
        lowerName.includes('cebolla') || lowerName.includes('patata') || lowerName.includes('aguacate')) {
        return '';
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

// Función para obtener precio estimado
export function getEstimatedPrice(ingredient: string): number {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Carnes (precios más altos)
  if (lowerIngredient.includes('ternera') || lowerIngredient.includes('cordero') ||
      lowerIngredient.includes('solomillo')) {
    return 12.00;
  }
  
  if (lowerIngredient.includes('pollo') || lowerIngredient.includes('cerdo') ||
      lowerIngredient.includes('conejo') || lowerIngredient.includes('pato') ||
      lowerIngredient.includes('pavo')) {
    return 8.00;
  }
  
  // Pescados
  if (lowerIngredient.includes('salmón') || lowerIngredient.includes('atún') ||
      lowerIngredient.includes('dorada') || lowerIngredient.includes('lubina')) {
    return 15.00;
  }
  
  if (lowerIngredient.includes('pescado') || lowerIngredient.includes('merluza') ||
      lowerIngredient.includes('bacalao') || lowerIngredient.includes('trucha')) {
    return 10.00;
  }
  
  // Mariscos
  if (lowerIngredient.includes('langostinos') || lowerIngredient.includes('mejillones') ||
      lowerIngredient.includes('almejas') || lowerIngredient.includes('calamar') ||
      lowerIngredient.includes('pulpo')) {
    return 18.00;
  }
  
  // Frutas
  if (lowerIngredient.includes('fresas') || lowerIngredient.includes('arándanos') ||
      lowerIngredient.includes('frambuesa') || lowerIngredient.includes('mora')) {
    return 4.50;
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
      lowerIngredient.includes('papaya') || lowerIngredient.includes('maracuyá') ||
      lowerIngredient.includes('coco') || lowerIngredient.includes('dátiles') ||
      lowerIngredient.includes('pasas') || lowerIngredient.includes('higos secos')) {
    return 3.00;
  }
  
  // Verduras
  if (lowerIngredient.includes('brócoli') || lowerIngredient.includes('espinacas') ||
      lowerIngredient.includes('espárragos') || lowerIngredient.includes('alcachofa') ||
      lowerIngredient.includes('champiñones') || lowerIngredient.includes('setas') ||
      lowerIngredient.includes('kale')) {
    return 3.50;
  }
  
  if (lowerIngredient.includes('zanahoria') || lowerIngredient.includes('pimientos') ||
      lowerIngredient.includes('calabacín') || lowerIngredient.includes('berenjena') ||
      lowerIngredient.includes('tomate') || lowerIngredient.includes('cebolla') ||
      lowerIngredient.includes('lechuga') || lowerIngredient.includes('pepino') ||
      lowerIngredient.includes('patata') || lowerIngredient.includes('batata') ||
      lowerIngredient.includes('coliflor') || lowerIngredient.includes('col') ||
      lowerIngredient.includes('apio') || lowerIngredient.includes('puerro') ||
      lowerIngredient.includes('nabo') || lowerIngredient.includes('rábano') ||
      lowerIngredient.includes('remolacha') || lowerIngredient.includes('judías') ||
      lowerIngredient.includes('guisantes') || lowerIngredient.includes('maíz') ||
      lowerIngredient.includes('calabaza') || lowerIngredient.includes('boniato') ||
      lowerIngredient.includes('edamame')) {
    return 2.50;
  }
  
  // Lácteos
  if (lowerIngredient.includes('queso') || lowerIngredient.includes('mantequilla')) {
    return 6.00;
  }
  
  if (lowerIngredient.includes('leche') || lowerIngredient.includes('yogur') ||
      lowerIngredient.includes('requesón')) {
    return 2.00;
  }
  
  if (lowerIngredient.includes('huevo')) {
    return 0.30;
  }
  
  // Granos
  if (lowerIngredient.includes('arroz') || lowerIngredient.includes('pasta') ||
      lowerIngredient.includes('quinoa') || lowerIngredient.includes('avena') ||
      lowerIngredient.includes('bulgur') || lowerIngredient.includes('cuscús') ||
      lowerIngredient.includes('mijo') || lowerIngredient.includes('amaranto') ||
      lowerIngredient.includes('trigo sarraceno') || lowerIngredient.includes('cebada') ||
      lowerIngredient.includes('centeno') || lowerIngredient.includes('espelta') ||
      lowerIngredient.includes('kamut') || lowerIngredient.includes('teff') ||
      lowerIngredient.includes('arroz salvaje') || lowerIngredient.includes('pasta de lentejas') ||
      lowerIngredient.includes('pasta de garbanzos') || lowerIngredient.includes('tortillas') ||
      lowerIngredient.includes('wraps') || lowerIngredient.includes('granola')) {
    return 2.00;
  }
  
  // Legumbres
  if (lowerIngredient.includes('lentejas') || lowerIngredient.includes('garbanzos') ||
      lowerIngredient.includes('hummus') || lowerIngredient.includes('edamame')) {
    return 2.50;
  }
  
  // Frutos secos
  if (lowerIngredient.includes('nueces') || lowerIngredient.includes('almendras') ||
      lowerIngredient.includes('pistachos') || lowerIngredient.includes('anacardos') ||
      lowerIngredient.includes('avellanas') || lowerIngredient.includes('macadamias') ||
      lowerIngredient.includes('semillas de girasol') || lowerIngredient.includes('semillas de calabaza') ||
      lowerIngredient.includes('semillas de chía') || lowerIngredient.includes('semillas de lino') ||
      lowerIngredient.includes('semillas de sésamo')) {
    return 8.00;
  }
  
  // Aceites
  if (lowerIngredient.includes('aceite')) {
    return 5.00;
  }
  
  if (lowerIngredient.includes('aguacate') || lowerIngredient.includes('aceitunas') ||
      lowerIngredient.includes('tahini')) {
    return 4.00;
  }
  
  // Condimentos
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
    return 1.50;
  }
  
  // Precio por defecto
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
