
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
    id: 'r_pork',
    name: '经典苏式红烧肉',
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=800&auto=format&fit=crop',
    prepImage: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=800&auto=format&fit=crop',
    category: "厨神必做",
    description: "肥而不腻，软糯香甜，老爸的压箱底秘籍。",
    ingredients: [
      { ingredientId: 'i1', name: '五花肉', amount: 500, unit: 'g' },
      { ingredientId: 'i2', name: '冰糖', amount: 50, unit: 'g' },
      { ingredientId: 'i3', name: '生抽', amount: 30, unit: 'ml' },
      { ingredientId: 'i4', name: '老抽', amount: 15, unit: 'ml' },
      { ingredientId: 'i5', name: '生姜', amount: 20, unit: 'g' }
    ],
    steps: [
      { id: 1, instruction: '五花肉洗净切成3厘米见方的方块。', image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=800&auto=format&fit=crop' },
      { id: 2, instruction: '冷水下锅，放入姜片和料酒焯水，去除浮沫。', image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=800&auto=format&fit=crop' },
      { id: 3, instruction: '小火慢炒冰糖，炒至枣红色后下肉翻上糖色。', image: 'https://images.unsplash.com/photo-1621510456681-23a23d9a6947?q=80&w=800&auto=format&fit=crop' },
      { id: 4, instruction: '加入热水漫过肉块，大火烧开转小火炖煮60分钟，最后大火收汁。' }
    ]
  },
  {
    id: 'r_egg',
    name: '妈妈味西红柿炒蛋',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop',
    prepImage: 'https://images.unsplash.com/photo-1590507739402-29974861a817?q=80&w=800&auto=format&fit=crop',
    category: "快手早餐",
    description: "简单的食材，温暖的味道，拌饭神器。",
    ingredients: [
      { ingredientId: 'i6', name: '西红柿', amount: 3, unit: '个' },
      { ingredientId: 'i7', name: '土鸡蛋', amount: 4, unit: '个' },
      { ingredientId: 'i8', name: '小葱', amount: 2, unit: '根' },
      { ingredientId: 'i9', name: '白糖', amount: 5, unit: 'g' }
    ],
    steps: [
      { id: 1, instruction: '西红柿划十字烫皮去籽，切成均匀块状。', image: 'https://images.unsplash.com/photo-1566041510394-cf7c8fe21d97?q=80&w=800&auto=format&fit=crop' },
      { id: 2, instruction: '鸡蛋打散，加入少许料酒去腥，划散炒熟盛出备用。', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop' },
      { id: 3, instruction: '热锅凉油炒软西红柿，炒出浓郁汁水，放入鸡蛋和少许糖翻匀。' }
    ]
  }
];

export const MOCK_INGREDIENTS = [
  { id: '1', name: '五花肉', quantity: 1, unit: '斤', price: 25, category: '食材', lowStockThreshold: 1, iconName: 'Beef' },
];
