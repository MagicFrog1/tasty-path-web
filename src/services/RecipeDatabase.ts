/**
 * Base de datos de recetas con instrucciones detalladas de cocina
 * Contiene recetas de nivel intermedio con pasos específicos y tiempos
 */

export interface Recipe {
  id: string;
  name: string;
  description: string;
  difficulty: 'fácil' | 'intermedio' | 'avanzado';
  prepTime: number; // minutos
  cookingTime: number; // minutos
  totalTime: number; // minutos
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string; // ej: "opcional", "para decorar"
}

export interface RecipeStep {
  step: number;
  instruction: string;
  time?: number; // tiempo específico para este paso
  temperature?: string; // temperatura específica
  technique?: string; // técnica culinaria
  tips?: string; // consejos adicionales
}

class RecipeDatabase {
  private recipes: Recipe[] = [];

  constructor() {
    this.initializeRecipes();
  }

  private initializeRecipes() {
    this.recipes = [
      // DESAYUNOS
      {
        id: 'breakfast-001',
        name: 'Tortilla de espinacas con queso de cabra',
        description: 'Tortilla francesa gourmet con espinacas frescas y queso de cabra cremoso',
        difficulty: 'intermedio',
        prepTime: 10,
        cookingTime: 8,
        totalTime: 18,
        servings: 2,
        ingredients: [
          { name: 'huevos grandes', amount: 4, unit: 'unidades' },
          { name: 'espinacas frescas', amount: 100, unit: 'g' },
          { name: 'queso de cabra', amount: 60, unit: 'g', notes: 'cremoso' },
          { name: 'aceite de oliva virgen extra', amount: 2, unit: 'cucharadas' },
          { name: 'sal marina', amount: 1, unit: 'pizca' },
          { name: 'pimienta negra', amount: 1, unit: 'pizca' },
          { name: 'nuez moscada', amount: 1, unit: 'pizca', notes: 'opcional' }
        ],
        instructions: [
          {
            step: 1,
            instruction: 'Lavar bien las espinacas y escurrir el exceso de agua',
            time: 2,
            tips: 'Si usas espinacas baby, no necesitas quitar los tallos'
          },
          {
            step: 2,
            instruction: 'Batir los huevos en un bol grande con sal, pimienta y nuez moscada',
            time: 1,
            technique: 'batido',
            tips: 'Batir hasta que estén bien mezclados pero sin espumar demasiado'
          },
          {
            step: 3,
            instruction: 'Calentar el aceite de oliva en una sartén antiadherente de 24cm a fuego medio',
            time: 2,
            temperature: 'fuego medio',
            tips: 'El aceite debe estar caliente pero no humeante'
          },
          {
            step: 4,
            instruction: 'Añadir las espinacas y saltear hasta que se reduzcan y estén tiernas',
            time: 2,
            technique: 'salteado',
            tips: 'Las espinacas se reducirán considerablemente de tamaño'
          },
          {
            step: 5,
            instruction: 'Verter los huevos batidos sobre las espinacas y distribuir uniformemente',
            time: 1,
            tips: 'No revolver, dejar que se cocine como una tortilla'
          },
          {
            step: 6,
            instruction: 'Cocinar a fuego medio-bajo hasta que los bordes estén cuajados',
            time: 3,
            temperature: 'fuego medio-bajo'
          },
          {
            step: 7,
            instruction: 'Esparcir el queso de cabra por encima y doblar la tortilla por la mitad',
            time: 1,
            technique: 'plegado'
          },
          {
            step: 8,
            instruction: 'Cocinar 1-2 minutos más hasta que el queso se derrita ligeramente',
            time: 2,
            tips: 'El centro debe estar cuajado pero aún cremoso'
          }
        ],
        nutrition: {
          calories: 320,
          protein: 22,
          carbs: 8,
          fat: 24,
          fiber: 3
        },
        tags: ['proteínas', 'vegetales', 'queso', 'fácil de hacer'],
        cuisine: 'mediterránea',
        mealType: 'breakfast'
      },

      // ALMUERZOS
      {
        id: 'lunch-001',
        name: 'Salmón a la plancha con quinoa y verduras salteadas',
        description: 'Filete de salmón perfectamente cocinado con quinoa esponjosa y verduras crujientes',
        difficulty: 'intermedio',
        prepTime: 15,
        cookingTime: 25,
        totalTime: 40,
        servings: 2,
        ingredients: [
          { name: 'filetes de salmón', amount: 300, unit: 'g', notes: 'sin piel' },
          { name: 'quinoa', amount: 120, unit: 'g' },
          { name: 'brócoli', amount: 150, unit: 'g' },
          { name: 'pimiento rojo', amount: 1, unit: 'unidad' },
          { name: 'calabacín', amount: 1, unit: 'unidad', notes: 'mediano' },
          { name: 'ajo', amount: 2, unit: 'dientes' },
          { name: 'limón', amount: 1, unit: 'unidad' },
          { name: 'aceite de oliva virgen extra', amount: 3, unit: 'cucharadas' },
          { name: 'sal marina', amount: 1, unit: 'cucharadita' },
          { name: 'pimienta negra', amount: 1, unit: 'pizca' },
          { name: 'perejil fresco', amount: 2, unit: 'cucharadas', notes: 'picado' }
        ],
        instructions: [
          {
            step: 1,
            instruction: 'Lavar la quinoa en un colador fino hasta que el agua salga clara',
            time: 2,
            tips: 'Esto elimina el sabor amargo natural de la quinoa'
          },
          {
            step: 2,
            instruction: 'Cocinar la quinoa en agua con sal (1:2 ratio) a fuego medio hasta que absorba todo el agua',
            time: 15,
            temperature: 'fuego medio',
            technique: 'hervido',
            tips: 'Cuando esté lista, la quinoa se verá translúcida con un pequeño hilo blanco'
          },
          {
            step: 3,
            instruction: 'Cortar el brócoli en floretes pequeños y el pimiento en tiras de 1cm',
            time: 5,
            tips: 'Los trozos pequeños se cocinan más uniformemente'
          },
          {
            step: 4,
            instruction: 'Cortar el calabacín en medias lunas de 1cm de grosor',
            time: 3,
            tips: 'No los hagas muy finos o se desharán al saltear'
          },
          {
            step: 5,
            instruction: 'Picar finamente el ajo y exprimir el jugo del limón',
            time: 2,
            tips: 'El ajo picado fino se distribuye mejor en las verduras'
          },
          {
            step: 6,
            instruction: 'Sazonar los filetes de salmón con sal, pimienta y jugo de limón',
            time: 2,
            technique: 'sazonado',
            tips: 'Dejar reposar 5 minutos para que absorba los sabores'
          },
          {
            step: 7,
            instruction: 'Calentar una plancha o sartén antiadherente a fuego medio-alto con 1 cucharada de aceite',
            time: 2,
            temperature: 'fuego medio-alto'
          },
          {
            step: 8,
            instruction: 'Cocinar el salmón 4 minutos por lado hasta que esté dorado y firme al tacto',
            time: 8,
            technique: 'plancha',
            tips: 'No lo muevas hasta que se despegue fácilmente de la plancha'
          },
          {
            step: 9,
            instruction: 'En otra sartén, calentar 2 cucharadas de aceite y saltear las verduras con ajo',
            time: 6,
            technique: 'salteado',
            temperature: 'fuego medio-alto',
            tips: 'Cocinar hasta que estén tiernas pero aún crujientes'
          },
          {
            step: 10,
            instruction: 'Servir el salmón sobre la quinoa con las verduras salteadas y perejil fresco',
            time: 2,
            tips: 'El perejil añade frescura y color al plato'
          }
        ],
        nutrition: {
          calories: 520,
          protein: 38,
          carbs: 45,
          fat: 22,
          fiber: 8
        },
        tags: ['pescado', 'proteínas', 'quinoa', 'verduras', 'omega-3'],
        cuisine: 'mediterránea',
        mealType: 'lunch'
      },

      // CENAS
      {
        id: 'dinner-001',
        name: 'Pollo al limón con patatas asadas y hierbas',
        description: 'Muslos de pollo jugosos marinados con limón y hierbas, acompañados de patatas crujientes',
        difficulty: 'intermedio',
        prepTime: 20,
        cookingTime: 45,
        totalTime: 65,
        servings: 4,
        ingredients: [
          { name: 'muslos de pollo', amount: 8, unit: 'unidades', notes: 'con hueso y piel' },
          { name: 'patatas', amount: 800, unit: 'g', notes: 'medianas' },
          { name: 'limón', amount: 2, unit: 'unidades' },
          { name: 'ajo', amount: 4, unit: 'dientes' },
          { name: 'romero fresco', amount: 2, unit: 'ramitas' },
          { name: 'tomillo fresco', amount: 2, unit: 'ramitas' },
          { name: 'aceite de oliva virgen extra', amount: 4, unit: 'cucharadas' },
          { name: 'sal marina', amount: 1, unit: 'cucharadita' },
          { name: 'pimienta negra', amount: 1, unit: 'pizca' },
          { name: 'caldo de pollo', amount: 200, unit: 'ml', notes: 'opcional' },
          { name: 'perejil fresco', amount: 3, unit: 'cucharadas', notes: 'picado' }
        ],
        instructions: [
          {
            step: 1,
            instruction: 'Precalentar el horno a 200°C (con ventilador) o 220°C (convencional)',
            time: 5,
            temperature: '200°C',
            tips: 'Es importante que el horno esté bien caliente antes de introducir las patatas'
          },
          {
            step: 2,
            instruction: 'Lavar y cortar las patatas en gajos de tamaño similar (sin pelar)',
            time: 8,
            tips: 'Dejar la piel para más sabor y textura crujiente'
          },
          {
            step: 3,
            instruction: 'Mezclar las patatas con 2 cucharadas de aceite, sal, pimienta y romero picado',
            time: 3,
            technique: 'mezclado',
            tips: 'Asegúrate de que todas las patatas estén bien cubiertas de aceite'
          },
          {
            step: 4,
            instruction: 'Colocar las patatas en una bandeja de horno y asar 25 minutos',
            time: 25,
            temperature: '200°C',
            technique: 'asado',
            tips: 'Darles la vuelta a mitad del tiempo para que se doren uniformemente'
          },
          {
            step: 5,
            instruction: 'Mientras tanto, preparar la marinada: mezclar jugo de limón, ajo picado, tomillo, sal y pimienta',
            time: 5,
            technique: 'marinado',
            tips: 'El ácido del limón ayudará a ablandar la carne'
          },
          {
            step: 6,
            instruction: 'Sazonar los muslos de pollo con la marinada y dejar reposar 10 minutos',
            time: 10,
            tips: 'No más de 30 minutos o el limón puede "cocinar" la superficie'
          },
          {
            step: 7,
            instruction: 'Calentar una sartén grande a fuego medio-alto con 2 cucharadas de aceite',
            time: 2,
            temperature: 'fuego medio-alto'
          },
          {
            step: 8,
            instruction: 'Dorar los muslos de pollo por ambos lados hasta que estén dorados',
            time: 8,
            technique: 'dorado',
            tips: 'Esto sella los jugos y añade sabor'
          },
          {
            step: 9,
            instruction: 'Transferir el pollo a la bandeja con las patatas y cocinar en el horno 15 minutos más',
            time: 15,
            temperature: '200°C',
            technique: 'asado',
            tips: 'El pollo debe estar dorado y las patatas crujientes'
          },
          {
            step: 10,
            instruction: 'Retirar del horno y dejar reposar 5 minutos antes de servir con perejil fresco',
            time: 5,
            tips: 'El reposo permite que los jugos se redistribuyan en la carne'
          }
        ],
        nutrition: {
          calories: 480,
          protein: 35,
          carbs: 38,
          fat: 20,
          fiber: 5
        },
        tags: ['pollo', 'patatas', 'horneado', 'hierbas', 'limón'],
        cuisine: 'mediterránea',
        mealType: 'dinner'
      },

      // SNACKS
      {
        id: 'snack-001',
        name: 'Hummus casero con verduras crujientes',
        description: 'Hummus cremoso y sabroso hecho en casa, perfecto para acompañar verduras frescas',
        difficulty: 'intermedio',
        prepTime: 15,
        cookingTime: 0,
        totalTime: 15,
        servings: 4,
        ingredients: [
          { name: 'garbanzos cocidos', amount: 400, unit: 'g', notes: 'en conserva, escurridos' },
          { name: 'tahini', amount: 3, unit: 'cucharadas' },
          { name: 'ajo', amount: 2, unit: 'dientes' },
          { name: 'jugo de limón', amount: 3, unit: 'cucharadas' },
          { name: 'aceite de oliva virgen extra', amount: 3, unit: 'cucharadas' },
          { name: 'comino molido', amount: 1, unit: 'cucharadita' },
          { name: 'sal marina', amount: 1, unit: 'cucharadita' },
          { name: 'agua fría', amount: 4, unit: 'cucharadas' },
          { name: 'pimentón dulce', amount: 1, unit: 'pizca', notes: 'para decorar' },
          { name: 'zanahorias', amount: 3, unit: 'unidades', notes: 'cortadas en bastones' },
          { name: 'apio', amount: 2, unit: 'tallos', notes: 'cortados en bastones' },
          { name: 'pimientos', amount: 2, unit: 'unidades', notes: 'cortados en tiras' }
        ],
        instructions: [
          {
            step: 1,
            instruction: 'Escurrir bien los garbanzos y enjuagar con agua fría',
            time: 2,
            tips: 'Esto elimina el sabor metálico de la conserva'
          },
          {
            step: 2,
            instruction: 'Pelar y picar finamente el ajo',
            time: 2,
            tips: 'El ajo picado se incorpora mejor que entero'
          },
          {
            step: 3,
            instruction: 'En un procesador de alimentos, triturar los garbanzos hasta obtener una pasta',
            time: 3,
            technique: 'trituración',
            tips: 'Parar y raspar los bordes si es necesario'
          },
          {
            step: 4,
            instruction: 'Añadir el tahini, ajo, comino y sal, y procesar hasta mezclar',
            time: 2,
            technique: 'procesado',
            tips: 'El tahini debe estar bien mezclado'
          },
          {
            step: 5,
            instruction: 'Agregar el jugo de limón poco a poco mientras se procesa',
            time: 2,
            technique: 'emulsión',
            tips: 'Esto ayuda a crear una textura más cremosa'
          },
          {
            step: 6,
            instruction: 'Verter el aceite de oliva gradualmente hasta obtener una consistencia suave',
            time: 3,
            technique: 'emulsión',
            tips: 'El aceite debe incorporarse lentamente para evitar que se corte'
          },
          {
            step: 7,
            instruction: 'Añadir agua fría de una en una cucharada hasta alcanzar la textura deseada',
            time: 2,
            tips: 'La textura debe ser cremosa pero no líquida'
          },
          {
            step: 8,
            instruction: 'Probar y ajustar la sazón si es necesario',
            time: 1,
            tips: 'Puedes añadir más limón, sal o comino según tu gusto'
          },
          {
            step: 9,
            instruction: 'Transferir a un bol y decorar con aceite de oliva y pimentón dulce',
            time: 1,
            tips: 'El pimentón añade color y un toque de sabor'
          },
          {
            step: 10,
            instruction: 'Lavar y cortar las verduras en bastones y tiras para acompañar',
            time: 5,
            tips: 'Las verduras deben estar crujientes y frescas'
          }
        ],
        nutrition: {
          calories: 180,
          protein: 8,
          carbs: 20,
          fat: 8,
          fiber: 6
        },
        tags: ['legumbres', 'vegetariano', 'proteínas vegetales', 'fibra'],
        cuisine: 'mediterránea',
        mealType: 'snack'
      }
    ];
  }

  /**
   * Obtiene todas las recetas
   */
  getAllRecipes(): Recipe[] {
    return this.recipes;
  }

  /**
   * Obtiene recetas por tipo de comida
   */
  getRecipesByMealType(mealType: Recipe['mealType']): Recipe[] {
    return this.recipes.filter(recipe => recipe.mealType === mealType);
  }

  /**
   * Obtiene recetas por nivel de dificultad
   */
  getRecipesByDifficulty(difficulty: Recipe['difficulty']): Recipe[] {
    return this.recipes.filter(recipe => recipe.difficulty === difficulty);
  }

  /**
   * Obtiene recetas por tiempo de preparación
   */
  getRecipesByTime(maxTime: number): Recipe[] {
    return this.recipes.filter(recipe => recipe.totalTime <= maxTime);
  }

  /**
   * Busca recetas por ingredientes
   */
  searchRecipesByIngredients(ingredients: string[]): Recipe[] {
    return this.recipes.filter(recipe => 
      ingredients.some(ingredient => 
        recipe.ingredients.some(recipeIngredient => 
          recipeIngredient.name.toLowerCase().includes(ingredient.toLowerCase())
        )
      )
    );
  }

  /**
   * Obtiene una receta por ID
   */
  getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  /**
   * Obtiene recetas por tags
   */
  getRecipesByTags(tags: string[]): Recipe[] {
    return this.recipes.filter(recipe => 
      tags.some(tag => recipe.tags.includes(tag))
    );
  }

  /**
   * Obtiene recetas por cocina
   */
  getRecipesByCuisine(cuisine: string): Recipe[] {
    return this.recipes.filter(recipe => 
      recipe.cuisine.toLowerCase().includes(cuisine.toLowerCase())
    );
  }

  /**
   * Obtiene recetas aleatorias
   */
  getRandomRecipes(count: number): Recipe[] {
    const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Obtiene recetas recomendadas basadas en preferencias
   */
  getRecommendedRecipes(preferences: {
    mealTypes?: Recipe['mealType'][];
    maxTime?: number;
    difficulty?: Recipe['difficulty'];
    tags?: string[];
  }): Recipe[] {
    let filtered = this.recipes;

    if (preferences.mealTypes) {
      filtered = filtered.filter(recipe => 
        preferences.mealTypes!.includes(recipe.mealType)
      );
    }

    if (preferences.maxTime) {
      filtered = filtered.filter(recipe => 
        recipe.totalTime <= preferences.maxTime!
      );
    }

    if (preferences.difficulty) {
      filtered = filtered.filter(recipe => 
        recipe.difficulty === preferences.difficulty
      );
    }

    if (preferences.tags) {
      filtered = filtered.filter(recipe => 
        preferences.tags!.some(tag => recipe.tags.includes(tag))
      );
    }

    return filtered;
  }
}

// Instancia singleton
export const recipeDatabase = new RecipeDatabase();

// Funciones de utilidad para trabajar con recetas
export const getNutritionPerServing = (recipe: Recipe) => recipe.nutrition;

export const getTotalPrepTime = (recipe: Recipe) => recipe.prepTime + recipe.cookingTime;

export const formatIngredients = (recipe: Recipe): string[] => {
  return recipe.ingredients.map(ingredient => {
    let formatted = `${ingredient.amount} ${ingredient.unit} de ${ingredient.name}`;
    if (ingredient.notes) {
      formatted += ` (${ingredient.notes})`;
    }
    return formatted;
  });
};

export const formatInstructions = (recipe: Recipe): string[] => {
  return recipe.instructions.map(step => {
    let formatted = `${step.step}. ${step.instruction}`;
    if (step.time) {
      formatted += ` (${step.time} min)`;
    }
    if (step.tips) {
      formatted += ` - Tip: ${step.tips}`;
    }
    return formatted;
  });
};

export default recipeDatabase;
