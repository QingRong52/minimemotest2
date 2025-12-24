
import { Ingredient, Recipe } from './types';

export const COLORS = {
  primary: '#ff7a28',
  charcoal: '#374151',
  white: '#ffffff',
  bg: '#f9fafb',
};

export const MOCK_INGREDIENTS: Ingredient[] = [
  { id: '1', name: '五花肉', quantity: 1, unit: '顿', price: 25, category: '食材', lowStockThreshold: 0 },
  { id: '2', name: '有机菠菜', quantity: 2, unit: '顿', price: 5, category: '食材', lowStockThreshold: 1 },
  { id: '3', name: '草鸡蛋', quantity: 10, unit: '个', price: 2, category: '食材', lowStockThreshold: 2 },
  { id: '4', name: '生抽', quantity: 1, unit: '瓶', price: 12, category: '调料', lowStockThreshold: 0 },
  { id: '5', name: '蒜', quantity: 5, unit: '个', price: 5, category: '调料', lowStockThreshold: 1 },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    name: '松露和牛牛排',
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 150,
    category: "老爸最爱",
    ingredients: [
      { ingredientId: '1', amount: 250, name: '和牛眼肉' },
      { ingredientId: '3', amount: 10, name: '黑松露油' },
    ],
    steps: [{ id: 1, instruction: '高温煎制熟成。' }]
  },
  {
    id: 'r2',
    name: '经典玛格丽特',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 45,
    category: "精致晚餐",
    ingredients: [],
    steps: []
  },
  {
    id: 'r3',
    name: '波奇海鲜饭',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 68,
    category: "健康轻食",
    ingredients: [],
    steps: []
  },
  {
    id: 'r4',
    name: '法式班尼迪克蛋',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 35,
    category: "快手早餐",
    ingredients: [],
    steps: []
  }
];
