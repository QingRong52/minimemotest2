
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ingredient, Recipe, ExpenseRecord } from './types';
import { MOCK_INGREDIENTS, MOCK_RECIPES } from './constants';

interface KitchenContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  addIngredient: (item: Ingredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (item: Ingredient) => void;
  addRecipe: (recipe: Recipe) => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('kitchen_inventory');
    return saved ? JSON.parse(saved) : MOCK_INGREDIENTS;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('kitchen_recipes');
    return saved ? JSON.parse(saved) : MOCK_RECIPES;
  });

  useEffect(() => {
    localStorage.setItem('kitchen_inventory', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('kitchen_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const addIngredient = (item: Ingredient) => {
    setIngredients(prev => [item, ...prev]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const updateIngredient = (updatedItem: Ingredient) => {
    setIngredients(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const addRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
  };

  return (
    <KitchenContext.Provider value={{ ingredients, recipes, addIngredient, removeIngredient, updateIngredient, addRecipe }}>
      {children}
    </KitchenContext.Provider>
  );
};

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context) throw new Error('useKitchen must be used within a KitchenProvider');
  return context;
};
