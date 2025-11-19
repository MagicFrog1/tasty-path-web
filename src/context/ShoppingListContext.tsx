import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react';
import { storage } from '../utils/storage';
import {
  parseIngredient,
  categorizeIngredient,
  getEstimatedPrice,
  getInferredUnit,
} from '../utils/shoppingListGenerator';

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
  planName?: string;
  weekRange?: string;
}

interface ShoppingListContextType {
  shoppingList: ShoppingItem[];
  setShoppingList: Dispatch<SetStateAction<ShoppingItem[]>>;
  addShoppingItem: (item: ShoppingItem) => void;
  addMultipleShoppingItems: (items: ShoppingItem[]) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  removeShoppingItem: (id: string) => void;
  toggleItemChecked: (id: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  updateShoppingListFromPlan: (
    plan: {
      id: string;
      name?: string;
      description?: string;
      weekStart?: string;
      weekEnd?: string;
    },
    ingredients: any[]
  ) => void;
  updatePlanMetadata: (planId: string, updates: { planName?: string; weekStart?: string; weekEnd?: string }) => void;
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

const SHOPPING_LIST_STORAGE_KEY = 'tastypath:shoppingList';

export const ShoppingListProvider: React.FC<ShoppingListProviderProps> = ({ children }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);

  useEffect(() => {
    const stored = storage.get<ShoppingItem[]>(SHOPPING_LIST_STORAGE_KEY, []);
    if (stored?.length) {
      setShoppingList(stored);
    }
  }, []);

  useEffect(() => {
    storage.set(SHOPPING_LIST_STORAGE_KEY, shoppingList);
  }, [shoppingList]);

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

  const slugify = (value: string) =>
    value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 40);

  const resolveQuantity = (rawAmount: any, parsedQuantity?: number) => {
    if (typeof rawAmount === 'number' && Number.isFinite(rawAmount)) return rawAmount;
    if (typeof rawAmount === 'string') {
      const numeric = parseFloat(rawAmount.replace(',', '.'));
      if (!Number.isNaN(numeric)) return numeric;
    }
    if (typeof parsedQuantity === 'number' && Number.isFinite(parsedQuantity)) return parsedQuantity;
    return 1;
  };

  const resolveUnit = (rawUnit: any, parsedUnit: string | undefined, ingredientName: string) => {
    if (typeof rawUnit === 'string' && rawUnit.trim().length > 0) return rawUnit;
    if (parsedUnit && parsedUnit.length > 0) return parsedUnit;
    return getInferredUnit(ingredientName) || '';
  };

  const computePrice = (basePrice: number, quantity: number, unit: string) => {
    if (!basePrice || Number.isNaN(basePrice)) return 0;
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const normalizedUnit = unit?.toLowerCase();

    if (normalizedUnit === 'g' || normalizedUnit === 'ml') {
      return Number(((basePrice / 1000) * safeQuantity).toFixed(2));
    }

    if (normalizedUnit === 'kg' || normalizedUnit === 'l') {
      return Number((basePrice * safeQuantity).toFixed(2));
    }

    return Number((basePrice * safeQuantity).toFixed(2));
  };

  const composePlanNote = (planName?: string, weekRange?: string) =>
    planName ? `Plan: ${planName}${weekRange ? ` · ${weekRange}` : ''}` : undefined;

  const normalizeIngredient = (
    ingredient: any,
    index: number,
    plan: { id: string; name?: string; weekStart?: string; weekEnd?: string }
  ): ShoppingItem => {
    const rawName =
      (typeof ingredient === 'string' ? ingredient : ingredient?.name || ingredient?.ingredient || ingredient?.item) ||
      'Ingrediente';

    const parsed = parseIngredient(rawName);
    const displayName = parsed?.name || rawName.charAt(0).toUpperCase() + rawName.slice(1);

    const quantity = resolveQuantity(ingredient?.amount ?? ingredient?.quantity ?? ingredient?.qty, parsed?.quantity);
    const unit = resolveUnit(ingredient?.unit ?? ingredient?.measurement, parsed?.unit, displayName);

    const category = ingredient?.category || categorizeIngredient(displayName);

    const rawPrice = ingredient?.price ?? ingredient?.estimatedPrice ?? ingredient?.cost;
    const estimatedBase =
      typeof rawPrice === 'number' && !Number.isNaN(rawPrice) ? rawPrice : getEstimatedPrice(displayName);
    const price = computePrice(estimatedBase, quantity, unit);

    const slug = slugify(displayName) || `item-${index}`;

    const weekRange =
      plan.weekStart && plan.weekEnd
        ? `${new Date(plan.weekStart).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${new Date(
            plan.weekEnd
          ).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
        : undefined;

    const note = composePlanNote(plan.name, weekRange);

    return {
      id: `${plan.id}-${slug}`,
      name: displayName,
      amount: Number.isFinite(quantity) ? Number(quantity.toFixed(2)) : quantity,
      unit: unit || '',
      price,
      category,
      isChecked: false,
      notes: note,
      sourcePlan: plan.id,
      planName: plan.name,
      weekRange,
    };
  };

  const updateShoppingListFromPlan = (
    plan: {
      id: string;
      name?: string;
      description?: string;
      weekStart?: string;
      weekEnd?: string;
    },
    ingredients: any[]
  ) => {
    const normalizedItems: ShoppingItem[] = ingredients.map((ingredient, index) =>
      normalizeIngredient(ingredient, index, plan)
    );

    setShoppingList(prev => {
      const filtered = prev.filter(item => item.sourcePlan !== plan.id);
      const merged = [...filtered];

      normalizedItems.forEach(item => {
        const existingIndex = merged.findIndex(
          existing => existing.name.toLowerCase() === item.name.toLowerCase() && existing.category === item.category
        );

        if (existingIndex !== -1) {
          const existing = merged[existingIndex];
          const planName = item.planName ?? existing.planName;
          const weekRange = item.weekRange ?? existing.weekRange;
          merged[existingIndex] = {
            ...existing,
            amount: Number((existing.amount + item.amount).toFixed(2)),
            price: Number((existing.price + item.price).toFixed(2)),
            notes: composePlanNote(planName, weekRange),
            sourcePlan: item.sourcePlan,
            planName,
            weekRange,
          };
        } else {
          merged.push(item);
        }
      });

      return merged;
    });
  };

  const updatePlanMetadata = (planId: string, updates: { planName?: string; weekStart?: string; weekEnd?: string }) => {
    setShoppingList(prev =>
      prev.map(item => {
        if (item.sourcePlan !== planId) return item;
        const weekRange =
          updates.weekStart && updates.weekEnd
            ? `${new Date(updates.weekStart).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} – ${new Date(
                updates.weekEnd
              ).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
            : item.weekRange;

        const planName = updates.planName ?? item.planName;

        return {
          ...item,
          planName,
          weekRange,
          notes: composePlanNote(planName, weekRange),
        };
      })
    );
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
      updatePlanMetadata,
      getTotalCost,
      getCheckedItemsCount,
      getUncheckedItemsCount,
    }}>
      {children}
    </ShoppingListContext.Provider>
  );
};
