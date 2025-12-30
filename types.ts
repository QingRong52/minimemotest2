
export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  price: number;
  category: '食材' | '调料';
  lowStockThreshold: number;
  iconName?: string;
}

export interface RecipeStep {
  id: number;
  instruction: string;
  image?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  price?: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  category: string;
  description?: string;
  ingredients: {
    ingredientId: string;
    amount: number;
    name: string;
    unit?: string;
  }[];
  steps: RecipeStep[];
}

export interface ExpenseRecord {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  time?: string; 
  amount: number;
  type: 'purchase' | 'cooking';
  description: string;
  category?: string;
  icon?: string; 
}

export interface MealPlan {
  id: string;
  recipeId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface RecipeFeedback {
  id: string;
  recipeId: string;
  date: string;
  rating: number;
  content: string;
  image?: string;
}
