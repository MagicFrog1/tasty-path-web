import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  price: number;
  category: string;
  isChecked: boolean;
  notes?: string;
  sourcePlan?: string; // ID del plan que generó este ingrediente
}

interface ShoppingListContextType {
  shoppingList: ShoppingItem[];
  setShoppingList: (items: ShoppingItem[]) => void;
  addShoppingItem: (item: ShoppingItem) => void;
  addMultipleShoppingItems: (items: ShoppingItem[]) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeShoppingItem: (id: string) => void;
  toggleItemChecked: (id: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  updateShoppingListFromPlan: (planId: string, ingredients: any[]) => void;
  getTotalCost: () => number;
  getCheckedItemsCount: () => number;
  getUncheckedItemsCount: () => number;
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error('useShoppingList must be used within a ShoppingListProvider');
  }
  return context;
};

interface ShoppingListProviderProps {
  children: ReactNode;
}

export const ShoppingListProvider: React.FC<ShoppingListProviderProps> = ({ children }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  const addShoppingItem = (item: ShoppingItem) => {
    setShoppingList(prev => {
      // Verificar si ya existe un item similar
      const existingItemIndex = prev.findIndex(
        existing => existing.name.toLowerCase() === item.name.toLowerCase() && 
                   existing.category === item.category
      );

      if (existingItemIndex !== -1) {
        // Si existe, actualizar la cantidad
        const updatedList = [...prev];
        updatedList[existingItemIndex] = {
          ...updatedList[existingItemIndex],
          amount: updatedList[existingItemIndex].amount + item.amount,
          price: updatedList[existingItemIndex].price + item.price,
        };
        return updatedList;
      } else {
        // Si no existe, agregar nuevo item
        return [...prev, item];
      }
    });
  };

  const addMultipleShoppingItems = (items: ShoppingItem[]) => {
    items.forEach(item => addShoppingItem(item));
  };

  const updateShoppingItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemChecked = (id: string) => {
    setShoppingList(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  };

  const clearCheckedItems = () => {
    setShoppingList(prev => prev.filter(item => !item.isChecked));
  };

  const clearAllItems = () => {
    setShoppingList([]);
  };

  const updateShoppingListFromPlan = (planId: string, ingredients: any[]) => {
    // Primero, eliminar items del plan anterior si existe
    setShoppingList(prev => prev.filter(item => item.sourcePlan !== planId));
    
    // Luego, agregar los nuevos ingredientes del plan
    const newItems: ShoppingItem[] = ingredients.map((ingredient, index) => {
      // Mapear diferentes formatos de ingredientes
      const name = ingredient.name || ingredient.ingredient || ingredient.item || 'Ingrediente';
      const amount = ingredient.amount || ingredient.quantity || ingredient.qty || 1;
      const unit = ingredient.unit || ingredient.measurement || 'unidad';
      const price = ingredient.price || ingredient.estimatedPrice || ingredient.cost || 0;
      
      // Determinar la categoría basada en el nombre o tipo
      let category = ingredient.category || 'Otros';
      if (!ingredient.category) {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('manzana') || lowerName.includes('plátano') || lowerName.includes('naranja') || 
            lowerName.includes('fresa') || lowerName.includes('uva') || lowerName.includes('kiwi') ||
            lowerName.includes('espinaca') || lowerName.includes('tomate') || lowerName.includes('lechuga') ||
            lowerName.includes('zanahoria') || lowerName.includes('cebolla') || lowerName.includes('ajo')) {
          category = 'Frutas y Verduras';
        } else if (lowerName.includes('pollo') || lowerName.includes('carne') || lowerName.includes('ternera') ||
                   lowerName.includes('cerdo') || lowerName.includes('cordero')) {
          category = 'Carnes';
        } else if (lowerName.includes('salmón') || lowerName.includes('atún') || lowerName.includes('pescado') ||
                   lowerName.includes('marisco') || lowerName.includes('gambas')) {
          category = 'Pescados';
        } else if (lowerName.includes('huevo') || lowerName.includes('leche') || lowerName.includes('yogur') ||
                   lowerName.includes('queso') || lowerName.includes('mantequilla')) {
          category = 'Lácteos';
        } else if (lowerName.includes('arroz') || lowerName.includes('pasta') || lowerName.includes('pan') ||
                   lowerName.includes('avena') || lowerName.includes('quinoa') || lowerName.includes('trigo')) {
          category = 'Granos';
        } else if (lowerName.includes('aceite') || lowerName.includes('sal') || lowerName.includes('pimienta') ||
                   lowerName.includes('especia') || lowerName.includes('condimento')) {
          category = 'Condimentos';
        }
      }

      return {
        id: `${planId}_${index}`,
        name: name,
        amount: typeof amount === 'string' ? parseFloat(amount) || 1 : amount,
        unit: unit,
        price: typeof price === 'string' ? parseFloat(price) || 0 : price,
        category: category,
        isChecked: false,
        notes: ingredient.notes || `Del plan: ${planId}`,
        sourcePlan: planId,
      };
    });
    
    addMultipleShoppingItems(newItems);
  };

  const getTotalCost = () => {
    return shoppingList.reduce((sum, item) => sum + item.price, 0);
  };

  const getCheckedItemsCount = () => {
    return shoppingList.filter(item => item.isChecked).length;
  };

  const getUncheckedItemsCount = () => {
    return shoppingList.filter(item => !item.isChecked).length;
  };

  return (
    <ShoppingListContext.Provider value={{
      shoppingList,
      setShoppingList,
      addShoppingItem,
      addMultipleShoppingItems,
      updateShoppingItem,
      removeShoppingItem,
      toggleItemChecked,
      clearCheckedItems,
      clearAllItems,
      updateShoppingListFromPlan,
      getTotalCost,
      getCheckedItemsCount,
      getUncheckedItemsCount,
    }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
