
export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  price: number;
  category: '食材' | '调料';
  lowStockThreshold: number;
  iconName?: string; // Added for custom icon support
}

export interface RecipeStep {
  id: number;
  instruction: string;
  image?: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  estimatedCost: number;
  category: string;
  ingredients: {
    ingredientId: string;
    amount: number;
    name: string; // 用于显示
  }[];
  steps: RecipeStep[];
}

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number;
  recipeId?: string;
  description: string;
}
