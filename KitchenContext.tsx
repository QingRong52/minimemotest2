
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Recipe, ShoppingItem, ExpenseRecord, MealPlan, RecipeFeedback } from './types';
import { MOCK_RECIPES } from './constants';
import { GoogleGenAI, Type } from "@google/genai";

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

// 本地解析逻辑：在无网络时通过正则提取金额和分类
const localOfflineParse = (text: string) => {
  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
  
  let category = '生活';
  if (text.match(/吃|饭|菜|肉|喝|水|面|排骨|午餐|晚餐|早餐/)) category = '吃';
  else if (text.match(/玩|电影|游戏|蹦迪|打球/)) category = '娱乐';
  else if (text.match(/房租|水电|物业/)) category = '房租';

  let description = text.replace(/(\d+(\.\d+)?)/, '').trim() || "本地记账";
  
  return {
    items: [{ amount, description, category, date: new Date().toISOString().split('T')[0] }],
    responseText: "检测到网络未连接萝！萝萝已启动【本地核心】为您快速识别：陛下刚才花了 " + amount + " 元对吗？"
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
      content: '嗨！我是萝萝记账。如果陛下手机没网络，我也能本地识别文字账单萝！试试发“排骨30”给我萝！'
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
  const clearChat = () => setChatHistory([{ id: '1', role: 'assistant', content: '账单已清空萝！' }]);
  const setOfflineMode = (offline: boolean) => setIsOfflineMode(offline);
  const addMealPlan = (plan: Omit<MealPlan, 'id'>) => { setMealPlans(prev => [...prev, { ...plan, id: Math.random().toString(36).substr(2, 9) }]); };
  const removeMealPlan = (id: string) => setMealPlans(prev => prev.filter(p => p.id !== id));
  const addFeedback = (feedback: Omit<RecipeFeedback, 'id'>) => { setFeedbacks(prev => [{ ...feedback, id: Math.random().toString(36).substr(2, 9) }, ...prev]); };

  const processBookkeeping = async (text: string, imageBase64?: string) => {
    // 如果是离线模式或只有文字且没网，走本地解析
    if (isOfflineMode || (!imageBase64 && !navigator.onLine)) {
      const localResult = localOfflineParse(text);
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: localResult.responseText, data: localResult.items }]);
      return;
    }

    setIsAiProcessing(true);
    try {
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
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiResponse.responseText, data: aiResponse.items }]);
    } catch (error) {
      console.error("AI解析失败，转本地解析:", error);
      const localResult = localOfflineParse(text);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "哎呀，连不上云端大脑萝，萝萝尝试用【本地离线模式】为您识别萝：" + localResult.responseText, 
        data: localResult.items 
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
      isAiProcessing, isOfflineMode, importedRecipeResult,
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
