
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe, ShoppingItem, ExpenseRecord, MealPlan, RecipeFeedback } from './types';
import { MOCK_RECIPES } from './constants';
import { GoogleGenAI } from "@google/genai";

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  data?: any; 
  isConfirmed?: boolean;
  brainSource?: 'local' | 'cloud';
  errorCode?: string;
}

export interface CategoryBudgets {
  eat: number;
  life: number;
  rent: number;
  play: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '全部', label: '全部', icon: 'Utensils' },
  { id: '厨神必做', label: '厨神必做', icon: 'ChefHat' },
  { id: '快手早餐', label: '早起饮品', icon: 'Coffee' },
  { id: '健康轻食', label: '水果轻食', icon: 'Apple' },
  { id: '精致晚餐', label: '美味主食', icon: 'Pizza' },
];

interface KitchenContextType {
  recipes: Recipe[];
  categories: Category[];
  cookingQueue: string[];
  shoppingList: ShoppingItem[];
  expenseRecords: ExpenseRecord[];
  chatHistory: ChatMessage[];
  mealPlans: MealPlan[];
  feedbacks: RecipeFeedback[];
  monthlyBudget: number;
  categoryBudgets: CategoryBudgets;
  isAiProcessing: boolean;
  isOfflineMode: boolean;
  lastError: string | null;
  importedRecipeResult: any | null;
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
  addExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, record: Partial<ExpenseRecord>) => void;
  addExpenses: (records: Omit<ExpenseRecord, 'id'>[]) => void;
  setMonthlyBudget: (amount: number) => void;
  setCategoryBudgets: (budgets: CategoryBudgets) => void;
  deleteExpense: (id: string) => void;
  updateChatHistory: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  setOfflineMode: (offline: boolean) => void;
  addMealPlan: (plan: Omit<MealPlan, 'id'>) => void;
  removeMealPlan: (id: string) => void;
  addFeedback: (feedback: Omit<RecipeFeedback, 'id'>) => void;
  processBookkeeping: (text: string, imageBase64?: string) => Promise<void>;
  processRecipeImport: (content: string) => Promise<void>;
  clearImportResult: () => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

const luluLocalBrain = (text: string) => {
  const matches = text.match(/(\d+(\.\d+)?)/g);
  let amount = 0;
  if (matches) {
    const candidates = matches.map(Number).filter(n => n < 10000 && n > 0);
    amount = candidates.length > 0 ? candidates[candidates.length - 1] : 0; 
  }

  const scores = { eat: 0, life: 0, rent: 0, play: 0 };
  const input = text.toLowerCase();
  const lexicon = {
    eat: ['饭', '菜', '面', '肉', '喝', '水', '餐', '超市', '美团', '饿了么', '排骨', '瑞幸', '星巴克', '咖啡', '火锅'],
    play: ['玩', '游戏', '电影', '网费', '蹦迪', 'ktv', '酒吧', '旅游', '门票'],
    rent: ['房租', '水电', '物业', '煤气', '房东'],
    life: ['车', '交通', '油', '充值', '话费', '衣服', '淘宝', '拼多多', '京东', '日用', '理发']
  };

  Object.entries(lexicon).forEach(([cat, keywords]) => {
    keywords.forEach(word => {
      if (input.includes(word)) (scores as any)[cat] += 2;
    });
  });

  const bestCategory = (Object.keys(scores) as Array<keyof typeof scores>).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const categoryMap: Record<string, string> = { eat: '吃', life: '生活', rent: '房租', play: '娱乐' };

  let description = text.replace(/(\d+(\.\d+)?)/g, '').trim();
  if (!description) description = "本地记账 (" + (amount > 0 ? '金额识别成功' : '手动录入') + ")";

  return {
    items: [{ amount, description, category: categoryMap[bestCategory], date: new Date().toISOString().split('T')[0] }],
    responseText: amount > 0 
      ? `【本地内核 Lulu-Nano】已启动萝！陛下是不是刚才花了 ${amount} 元？萝萝已经帮陛下初步整理好分类萝！`
      : `陛下，本地内核没能从文字里搜寻到金额萝...您手动输入一下，萝萝这就帮您存进本地硬盘！`
  };
};

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('kitchen_recipes');
    return saved ? JSON.parse(saved) : MOCK_RECIPES;
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

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kitchen_chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'assistant',
      content: '陛下好！如果云端大脑连接不畅，萝萝会自动切换到【Lulu-Nano】本地核心为您服务萝！'
    }];
  });

  const [mealPlans, setMealPlans] = useState<MealPlan[]>(() => {
    const saved = localStorage.getItem('kitchen_meal_plans');
    return saved ? JSON.parse(saved) : [];
  });

  const [feedbacks, setFeedbacks] = useState<RecipeFeedback[]>(() => {
    const saved = localStorage.getItem('kitchen_feedbacks');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyBudget, setBudgetState] = useState<number>(() => {
    const saved = localStorage.getItem('kitchen_budget');
    return saved ? Number(saved) : 2000;
  });

  const [categoryBudgets, setCategoryBudgetsState] = useState<CategoryBudgets>(() => {
    const saved = localStorage.getItem('kitchen_category_budgets');
    return saved ? JSON.parse(saved) : { eat: 1000, life: 500, rent: 0, play: 500 };
  });

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [importedRecipeResult, setImportedRecipeResult] = useState<any | null>(null);

  useEffect(() => { localStorage.setItem('kitchen_recipes', JSON.stringify(recipes)); }, [recipes]);
  useEffect(() => { localStorage.setItem('kitchen_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('kitchen_cooking_queue', JSON.stringify(cookingQueue)); }, [cookingQueue]);
  useEffect(() => { localStorage.setItem('kitchen_shopping_list', JSON.stringify(shoppingList)); }, [shoppingList]);
  useEffect(() => { localStorage.setItem('kitchen_expenses', JSON.stringify(expenseRecords)); }, [expenseRecords]);
  useEffect(() => { localStorage.setItem('kitchen_chat_history', JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem('kitchen_meal_plans', JSON.stringify(mealPlans)); }, [mealPlans]);
  useEffect(() => { localStorage.setItem('kitchen_feedbacks', JSON.stringify(feedbacks)); }, [feedbacks]);
  useEffect(() => { localStorage.setItem('kitchen_budget', monthlyBudget.toString()); }, [monthlyBudget]);
  useEffect(() => { localStorage.setItem('kitchen_category_budgets', JSON.stringify(categoryBudgets)); }, [categoryBudgets]);

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
    const newItems: ShoppingItem[] = items.map(item => ({ id: Math.random().toString(36).substr(2, 9), name: item.name, checked: false, price: item.price }));
    setShoppingList(prev => [...prev, ...newItems]);
  };
  const toggleShoppingItem = (id: string) => { setShoppingList(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)); };
  const clearShoppingList = () => setShoppingList([]);
  const addExpense = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setExpenseRecords(prev => [...prev, newRecord]);
  };
  const updateExpense = (id: string, record: Partial<ExpenseRecord>) => {
    setExpenseRecords(prev => prev.map(e => e.id === id ? { ...e, ...record } : e));
  };
  const addExpenses = (records: Omit<ExpenseRecord, 'id'>[]) => {
    const newRecords: ExpenseRecord[] = records.map(record => ({ ...record, id: Math.random().toString(36).substr(2, 9) }));
    setExpenseRecords(prev => [...prev, ...newRecords]);
  };
  const deleteExpense = (id: string) => setExpenseRecords(prev => prev.filter(e => e.id !== id));
  const setMonthlyBudget = (amount: number) => setBudgetState(amount);
  const setCategoryBudgets = (budgets: CategoryBudgets) => setCategoryBudgetsState(budgets);
  const updateChatHistory = (messages: ChatMessage[]) => setChatHistory(messages);
  const clearChat = () => setChatHistory([{ id: '1', role: 'assistant', content: '陛下，Lulu-Nano 本地大脑已就位！' }]);
  const setOfflineMode = (offline: boolean) => setIsOfflineMode(offline);
  const addMealPlan = (plan: Omit<MealPlan, 'id'>) => { setMealPlans(prev => [...prev, { ...plan, id: Math.random().toString(36).substr(2, 9) }]); };
  const removeMealPlan = (id: string) => setMealPlans(prev => prev.filter(p => p.id !== id));
  const addFeedback = (feedback: Omit<RecipeFeedback, 'id'>) => { setFeedbacks(prev => [{ ...feedback, id: Math.random().toString(36).substr(2, 9) }, ...prev]); };

  const processBookkeeping = async (text: string, imageBase64?: string) => {
    if (isOfflineMode || (!imageBase64 && !navigator.onLine)) {
      setIsAiProcessing(true);
      await new Promise(r => setTimeout(r, 600));
      const localRes = luluLocalBrain(text);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: localRes.responseText, 
        data: localRes.items,
        brainSource: 'local'
      }]);
      setIsAiProcessing(false);
      return;
    }

    setIsAiProcessing(true);
    setLastError(null);
    try {
      // 关键：每次调用都重新实例化以获取最新的 process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一个专业的财务记账助理萝萝。JSON 格式返回：{ "items": [{ "amount": 数字, "description": "描述", "category": "吃/生活/房租/娱乐", "date": "YYYY-MM-DD" }], "responseText": "反馈" }`;

      let result;
      if (imageBase64) {
        const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
        const rawData = imageBase64.split(',')[1];
        result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { mimeType, data: rawData } }, { text: prompt + `\n用户文字: ${text}` }] },
          config: { responseMimeType: "application/json" }
        });
      } else {
        result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt + `\n用户输入: ${text}`,
          config: { responseMimeType: "application/json" }
        });
      }

      const aiResponse = JSON.parse(result.text);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: aiResponse.responseText, 
        data: aiResponse.items,
        brainSource: 'cloud'
      }]);
    } catch (error: any) {
      console.error("Gemini 连线失败:", error);
      const errorMsg = error.message || "Unknown Network Error";
      setLastError(errorMsg);
      
      const localRes = luluLocalBrain(text);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: `【云端异常】陛下，钥匙好像不对萝（${errorMsg.includes('400') ? 'Key 无效' : '网络受限'}）。萝萝已为您降级到本地核心：` + localRes.responseText, 
        data: localRes.items,
        brainSource: 'local',
        errorCode: errorMsg
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const processRecipeImport = async (content: string) => {
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `将食谱原文解析为 JSON。原文：${content}`,
        config: { responseMimeType: "application/json" }
      });
      setImportedRecipeResult(JSON.parse(result.text));
    } catch (error) {
      console.error("食谱导入失败:", error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const clearImportResult = () => setImportedRecipeResult(null);

  return (
    <KitchenContext.Provider value={{ 
      recipes, categories, cookingQueue, shoppingList, expenseRecords, chatHistory, mealPlans, feedbacks, monthlyBudget, categoryBudgets,
      isAiProcessing, isOfflineMode, lastError, importedRecipeResult,
      addRecipe, updateRecipe, deleteRecipe, addCategory, updateCategory, deleteCategory, reorderCategories,
      addToQueue, removeFromQueue, clearQueue, addToShoppingList, toggleShoppingItem, clearShoppingList,
      addExpense, updateExpense, addExpenses, deleteExpense, setMonthlyBudget, setCategoryBudgets, updateChatHistory, clearChat,
      setOfflineMode, addMealPlan, removeMealPlan, addFeedback, processBookkeeping, processRecipeImport, clearImportResult
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
