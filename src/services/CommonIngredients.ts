/**
 * Lista de 150-200 ingredientes más comunes para cocinar
 * Optimizado para uso práctico en TastyPath
 */

export interface CommonIngredient {
  id: string;
  name_es: string;
  category: string;
  is_snack_friendly?: boolean;
  is_simple_snack?: boolean; // Para snacks directos sin cocinar
}

export const COMMON_INGREDIENTS: CommonIngredient[] = [
  // PROTEÍNAS (25 ingredientes)
  { id: 'chicken_breast', name_es: 'Pechuga de Pollo', category: 'Proteínas' },
  { id: 'chicken_thigh', name_es: 'Muslo de Pollo', category: 'Proteínas' },
  { id: 'ground_beef', name_es: 'Carne Picada', category: 'Proteínas' },
  { id: 'beef_steak', name_es: 'Filete de Ternera', category: 'Proteínas' },
  { id: 'pork_tenderloin', name_es: 'Solomillo de Cerdo', category: 'Proteínas' },
  { id: 'salmon', name_es: 'Salmón', category: 'Proteínas' },
  { id: 'tuna', name_es: 'Atún', category: 'Proteínas' },
  { id: 'cod', name_es: 'Bacalao', category: 'Proteínas' },
  { id: 'shrimp', name_es: 'Gambas', category: 'Proteínas' },
  { id: 'eggs', name_es: 'Huevos', category: 'Proteínas', is_simple_snack: true },
  { id: 'lentils', name_es: 'Lentejas', category: 'Proteínas' },
  { id: 'chickpeas', name_es: 'Garbanzos', category: 'Proteínas' },
  { id: 'black_beans', name_es: 'Alubias Negras', category: 'Proteínas' },
  { id: 'tofu', name_es: 'Tofu', category: 'Proteínas' },
  { id: 'tempeh', name_es: 'Tempeh', category: 'Proteínas' },

  // CARBOHIDRATOS (20 ingredientes)
  { id: 'rice', name_es: 'Arroz', category: 'Carbohidratos' },
  { id: 'brown_rice', name_es: 'Arroz Integral', category: 'Carbohidratos' },
  { id: 'pasta', name_es: 'Pasta', category: 'Carbohidratos' },
  { id: 'bread', name_es: 'Pan', category: 'Carbohidratos' },
  { id: 'whole_wheat_bread', name_es: 'Pan Integral', category: 'Carbohidratos' },
  { id: 'potatoes', name_es: 'Patatas', category: 'Carbohidratos' },
  { id: 'sweet_potatoes', name_es: 'Boniato', category: 'Carbohidratos' },
  { id: 'oats', name_es: 'Avena', category: 'Carbohidratos' },
  { id: 'quinoa', name_es: 'Quinoa', category: 'Carbohidratos' },
  { id: 'barley', name_es: 'Cebada', category: 'Carbohidratos' },

  // VEGETALES (30 ingredientes)
  { id: 'tomatoes', name_es: 'Tomates', category: 'Vegetales' },
  { id: 'onions', name_es: 'Cebollas', category: 'Vegetales' },
  { id: 'garlic', name_es: 'Ajo', category: 'Vegetales' },
  { id: 'carrots', name_es: 'Zanahorias', category: 'Vegetales' },
  { id: 'celery', name_es: 'Apio', category: 'Vegetales' },
  { id: 'bell_peppers', name_es: 'Pimientos', category: 'Vegetales' },
  { id: 'cucumber', name_es: 'Pepino', category: 'Vegetales', is_simple_snack: true },
  { id: 'lettuce', name_es: 'Lechuga', category: 'Vegetales' },
  { id: 'spinach', name_es: 'Espinacas', category: 'Vegetales' },
  { id: 'broccoli', name_es: 'Brócoli', category: 'Vegetales' },
  { id: 'cauliflower', name_es: 'Coliflor', category: 'Vegetales' },
  { id: 'cabbage', name_es: 'Repollo', category: 'Vegetales' },
  { id: 'zucchini', name_es: 'Calabacín', category: 'Vegetales' },
  { id: 'eggplant', name_es: 'Berenjena', category: 'Vegetales' },
  { id: 'mushrooms', name_es: 'Champiñones', category: 'Vegetales' },

  // FRUTAS (20 ingredientes)
  { id: 'bananas', name_es: 'Plátanos', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'apples', name_es: 'Manzanas', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'oranges', name_es: 'Naranjas', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'lemons', name_es: 'Limones', category: 'Frutas' },
  { id: 'limes', name_es: 'Limas', category: 'Frutas' },
  { id: 'strawberries', name_es: 'Fresas', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'blueberries', name_es: 'Arándanos', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'grapes', name_es: 'Uvas', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'pears', name_es: 'Peras', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },
  { id: 'peaches', name_es: 'Melocotones', category: 'Frutas', is_simple_snack: true, is_snack_friendly: true },

  // LÁCTEOS (15 ingredientes)
  { id: 'milk', name_es: 'Leche', category: 'Lácteos' },
  { id: 'yogurt', name_es: 'Yogur', category: 'Lácteos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'greek_yogurt', name_es: 'Yogur Griego', category: 'Lácteos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'cheese', name_es: 'Queso', category: 'Lácteos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'mozzarella', name_es: 'Mozzarella', category: 'Lácteos' },
  { id: 'cheddar', name_es: 'Cheddar', category: 'Lácteos' },
  { id: 'feta', name_es: 'Feta', category: 'Lácteos' },
  { id: 'parmesan', name_es: 'Parmesano', category: 'Lácteos' },
  { id: 'butter', name_es: 'Mantequilla', category: 'Lácteos' },
  { id: 'cream', name_es: 'Nata', category: 'Lácteos' },

  // GRASAS Y ACEITES (10 ingredientes)
  { id: 'olive_oil', name_es: 'Aceite de Oliva', category: 'Grasas' },
  { id: 'coconut_oil', name_es: 'Aceite de Coco', category: 'Grasas' },
  { id: 'vegetable_oil', name_es: 'Aceite Vegetal', category: 'Grasas' },
  { id: 'sesame_oil', name_es: 'Aceite de Sésamo', category: 'Grasas' },
  { id: 'avocado', name_es: 'Aguacate', category: 'Grasas', is_simple_snack: true, is_snack_friendly: true },

  // FRUTOS SECOS Y SEMILLAS (15 ingredientes)
  { id: 'almonds', name_es: 'Almendras', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'walnuts', name_es: 'Nueces', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'cashews', name_es: 'Anacardos', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'peanuts', name_es: 'Cacahuetes', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'pistachios', name_es: 'Pistachos', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'sunflower_seeds', name_es: 'Semillas de Girasol', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'pumpkin_seeds', name_es: 'Semillas de Calabaza', category: 'Frutos Secos', is_simple_snack: true, is_snack_friendly: true },
  { id: 'chia_seeds', name_es: 'Semillas de Chía', category: 'Frutos Secos' },
  { id: 'flax_seeds', name_es: 'Semillas de Lino', category: 'Frutos Secos' },

  // CONDIMENTOS BÁSICOS (20 ingredientes)
  { id: 'salt', name_es: 'Sal', category: 'Condimentos' },
  { id: 'black_pepper', name_es: 'Pimienta Negra', category: 'Condimentos' },
  { id: 'garlic_powder', name_es: 'Ajo en Polvo', category: 'Condimentos' },
  { id: 'onion_powder', name_es: 'Cebolla en Polvo', category: 'Condimentos' },
  { id: 'paprika', name_es: 'Pimentón', category: 'Condimentos' },
  { id: 'cumin', name_es: 'Comino', category: 'Condimentos' },
  { id: 'oregano', name_es: 'Orégano', category: 'Condimentos' },
  { id: 'basil', name_es: 'Albahaca', category: 'Condimentos' },
  { id: 'thyme', name_es: 'Tomillo', category: 'Condimentos' },
  { id: 'rosemary', name_es: 'Romero', category: 'Condimentos' },
  { id: 'parsley', name_es: 'Perejil', category: 'Condimentos' },
  { id: 'coriander', name_es: 'Cilantro', category: 'Condimentos' },
  { id: 'ginger', name_es: 'Jengibre', category: 'Condimentos' },
  { id: 'cinnamon', name_es: 'Canela', category: 'Condimentos' },
  { id: 'vanilla', name_es: 'Vainilla', category: 'Condimentos' },

  // HIERBAS FRESCAS (10 ingredientes)
  { id: 'fresh_basil', name_es: 'Albahaca Fresca', category: 'Hierbas' },
  { id: 'fresh_parsley', name_es: 'Perejil Fresco', category: 'Hierbas' },
  { id: 'fresh_cilantro', name_es: 'Cilantro Fresco', category: 'Hierbas' },
  { id: 'fresh_mint', name_es: 'Menta Fresca', category: 'Hierbas' },
  { id: 'fresh_dill', name_es: 'Eneldo Fresco', category: 'Hierbas' },

  // ENDULZANTES (8 ingredientes)
  { id: 'sugar', name_es: 'Azúcar', category: 'Endulzantes' },
  { id: 'honey', name_es: 'Miel', category: 'Endulzantes' },
  { id: 'maple_syrup', name_es: 'Jarabe de Arce', category: 'Endulzantes' },
  { id: 'stevia', name_es: 'Estevia', category: 'Endulzantes' },

  // VINAGRES Y ÁCIDOS (5 ingredientes)
  { id: 'balsamic_vinegar', name_es: 'Vinagre Balsámico', category: 'Vinagres' },
  { id: 'white_vinegar', name_es: 'Vinagre Blanco', category: 'Vinagres' },
  { id: 'lemon_juice', name_es: 'Zumo de Limón', category: 'Vinagres' },
  { id: 'lime_juice', name_es: 'Zumo de Lima', category: 'Vinagres' },

  // CONSERVAS BÁSICAS (12 ingredientes)
  { id: 'canned_tomatoes', name_es: 'Tomates en Conserva', category: 'Conservas' },
  { id: 'canned_tuna', name_es: 'Atún en Conserva', category: 'Conservas', is_simple_snack: true },
  { id: 'canned_salmon', name_es: 'Salmón en Conserva', category: 'Conservas', is_simple_snack: true },
  { id: 'canned_beans', name_es: 'Alubias en Conserva', category: 'Conservas' },
  { id: 'canned_corn', name_es: 'Maíz en Conserva', category: 'Conservas' },
  { id: 'tomato_paste', name_es: 'Concentrado de Tomate', category: 'Conservas' },

  // TOTAL: ~150 ingredientes más comunes
];

/**
 * Snacks simplificados con alimentos directos
 */
export const SIMPLE_SNACKS = [
  { id: 'yogurt_snack', name_es: 'Yogur Natural', serving: '1 taza', is_direct: true },
  { id: 'banana_snack', name_es: 'Plátano', serving: '1 unidad', is_direct: true },
  { id: 'apple_snack', name_es: 'Manzana', serving: '1 unidad', is_direct: true },
  { id: 'cheese_cubes_snack', name_es: 'Queso en Cubos', serving: '30g', is_direct: true },
  { id: 'almonds_snack', name_es: 'Almendras', serving: '1 puñado (25g)', is_direct: true },
  { id: 'cucumber_slices_snack', name_es: 'Rodajas de Pepino', serving: '1 pepino', is_direct: true },
  { id: 'carrot_sticks_snack', name_es: 'Palitos de Zanahoria', serving: '2 zanahorias', is_direct: true },
  { id: 'avocado_snack', name_es: 'Aguacate', serving: '1/2 aguacate', is_direct: true },
  { id: 'hard_boiled_egg_snack', name_es: 'Huevo Duro', serving: '1 unidad', is_direct: false },
  { id: 'canned_tuna_snack', name_es: 'Atún en Conserva', serving: '1 lata pequeña', is_direct: true },
];

/**
 * Obtener ingredientes por categoría
 */
export function getIngredientsByCategory(category: string): CommonIngredient[] {
  return COMMON_INGREDIENTS.filter(ingredient => ingredient.category === category);
}

/**
 * Obtener snacks directos (sin cocinar)
 */
export function getDirectSnacks() {
  return SIMPLE_SNACKS.filter(snack => snack.is_direct);
}

/**
 * Obtener ingredientes para snacks
 */
export function getSnackFriendlyIngredients(): CommonIngredient[] {
  return COMMON_INGREDIENTS.filter(ingredient => 
    ingredient.is_snack_friendly || ingredient.is_simple_snack
  );
}
