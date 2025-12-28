
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ingredient, Recipe, ShoppingItem, ExpenseRecord } from './types';
import { MOCK_INGREDIENTS, MOCK_RECIPES } from './constants';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '全部', label: '全部', icon: 'Utensils' },
  { id: '厨神必做', label: '厨神必做', icon: 'ChefHat' },
  { id: '快手早餐', label: '早起饮品', icon: 'Coffee' },
  { id: '健康轻食', label: '水果轻食', icon: 'Apple' },
  { id: '精致晚餐', label: '美味主食', icon: 'Pizza' },
];

interface KitchenContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  categories: Category[];
  cookingQueue: string[];
  shoppingList: ShoppingItem[];
  expenseRecords: ExpenseRecord[];
  monthlyBudget: number;
  addIngredient: (item: Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (item: Ingredient) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updatedCat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (newCategories: Category[]) => void;
  addToQueue: (id: string) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  addToShoppingList: (items: {name: string, price?: number}[]) => void;
  toggleShoppingItem: (id: string) => void;
  clearShoppingList: () => void;
  addBoughtToInventory: (items: Ingredient[]) => void;
  addExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
  setMonthlyBudget: (amount: number) => void;
  deleteExpense: (id: string) => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('kitchen_inventory');
    return saved ? JSON.parse(saved) : MOCK_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('kitchen_recipes');
    return saved ? JSON.parse(saved) : MOCK_RECIPES.map(r => ({ ...r, category: r.category === '老爸最爱' ? '厨神必做' : r.category }));
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kitchen_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [cookingQueue, setCookingQueue] = useState<string[]>(() => {
    const saved = localStorage.getItem('kitchen_cooking_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('kitchen_shopping_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('kitchen_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyBudget, setBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('kitchen_budget');
    return saved ? Number(saved) : 2000;
  });

  useEffect(() => {
    localStorage.setItem('kitchen_inventory', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('kitchen_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('kitchen_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kitchen_cooking_queue', JSON.stringify(cookingQueue));
  }, [cookingQueue]);

  useEffect(() => {
    localStorage.setItem('kitchen_shopping_list', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('kitchen_expenses', JSON.stringify(expenseRecords));
  }, [expenseRecords]);

  useEffect(() => {
    localStorage.setItem('kitchen_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  const addIngredient = (item: Ingredient) => setIngredients(prev => [item, ...prev]);
  const removeIngredient = (id: string) => setIngredients(prev => prev.filter(i => i.id !== id));
  const updateIngredient = (updatedItem: Ingredient) => setIngredients(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  
  const addRecipe = (newRecipe: Recipe) => setRecipes(prev => [newRecipe, ...prev]);
  const updateRecipe = (updated: Recipe) => setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
  const deleteRecipe = (id: string) => setRecipes(prev => prev.filter(r => r.id !== id));

  const addCategory = (newCat: Category) => setCategories(prev => [...prev, newCat]);
  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updatedFields } : cat));
  };
  const deleteCategory = (id: string) => {
    if (id === '全部') return;
    setCategories(prev => prev.filter(c => c.id !== id));
  };
  
  const reorderCategories = (newCats: Category[]) => setCategories(newCats);
  const addToQueue = (id: string) => { if (!cookingQueue.includes(id)) setCookingQueue(prev => [...prev, id]); };
  const removeFromQueue = (id: string) => setCookingQueue(prev => prev.filter(i => i !== id));
  const clearQueue = () => setCookingQueue([]);

  const addToShoppingList = (items: {name: string, price?: number}[]) => {
    const newItems: ShoppingItem[] = items.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      checked: false,
      price: item.price
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const clearShoppingList = () => setShoppingList([]);

  const addBoughtToInventory = (boughtIngredients: Ingredient[]) => {
    if (boughtIngredients.length === 0) return;
    setIngredients(prev => [...boughtIngredients, ...prev]);
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const total = boughtIngredients.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);
    addExpense({
      date: now.toISOString().split('T')[0],
      time: currentTime,
      amount: total,
      type: 'purchase',
      description: `${boughtIngredients.map(i => i.name).join(', ')}`
    });

    const processedIds = boughtIngredients.map(i => i.id.replace('bought-', ''));
    setShoppingList(prev => prev.filter(item => !processedIds.includes(item.id)));
  };

  const addExpense = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setExpenseRecords(prev => [newRecord, ...prev]);
  };

  const deleteExpense = (id: string) => setExpenseRecords(prev => prev.filter(e => e.id !== id));
  const setMonthlyBudget = (amount: number) => setBudgetState(amount);

  return (
    <KitchenContext.Provider value={{ 
      ingredients, recipes, categories, cookingQueue, shoppingList, expenseRecords, monthlyBudget,
      addIngredient, removeIngredient, updateIngredient, addRecipe, updateRecipe, deleteRecipe, addCategory, updateCategory, deleteCategory, reorderCategories,
      addToQueue, removeFromQueue, clearQueue, addToShoppingList, toggleShoppingItem, clearShoppingList, addBoughtToInventory,
      addExpense, deleteExpense, setMonthlyBudget
    }}>
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) throw new Error('useKitchen must be used within a KitchenProvider');
  return context;
};
