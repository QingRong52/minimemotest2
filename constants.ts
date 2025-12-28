
export const COLORS = {
  primary: '#FF5C00', // 核心橙
  secondary: '#FF9A2E', // 辅助橙（用于按钮）
  text: '#5D3A2F',    // 巧克力棕
  muted: '#B45309',   // 橘棕
  bg: '#FEFFF9',      // 清新米白
  card: '#FFF4D2',    // 暖杏黄（卡片色）
  white: '#FFFFFF',
};

export const MOCK_RECIPES = [
  {
    id: 'r1',
    name: '螺蛳粉',
    image: 'https://images.unsplash.com/photo-1625241003842-887493630739?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 15,
    category: "老爸最爱",
    ingredients: [],
    steps: []
  },
  {
    id: 'r2',
    name: '麻辣烫',
    image: 'https://images.unsplash.com/photo-1512058560366-cd2429555614?q=80&w=600&auto=format&fit=crop',
    estimatedCost: 28,
    category: "老爸最爱",
    ingredients: [],
    steps: []
  }
];

export const MOCK_INGREDIENTS = [
  { id: '1', name: '五花肉', quantity: 1, unit: '斤', price: 25, category: '食材', lowStockThreshold: 1, iconName: 'Beef' },
];
