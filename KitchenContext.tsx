
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
  isAiProcessing: boolean;
  isRecipeImporting: boolean;
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
  deleteExpense: (id: string) => void;
  updateChatHistory: (messages: ChatMessage[]) => void;
  clearChat: () => void;
  addMealPlan: (plan: Omit<MealPlan, 'id'>) => void;
  removeMealPlan: (id: string) => void;
  addFeedback: (feedback: Omit<RecipeFeedback, 'id'>) => void;
  processBookkeeping: (text: string, imageBase64?: string) => Promise<void>;
  processRecipeImport: (content: string) => Promise<void>;
  clearImportResult: () => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const KitchenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kitchen_chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'assistant',
      content: '嗨！我是萝萝记账小能手。你可以发一段话，或者直接把超市小票、微信支付截图发给我，我会帮你整理进账本萝！'
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

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isRecipeImporting, setIsRecipeImporting] = useState(false);
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

  const addExpense = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setExpenseRecords(prev => [...prev, newRecord]);
  };

  const updateExpense = (id: string, record: Partial<ExpenseRecord>) => {
    setExpenseRecords(prev => prev.map(e => e.id === id ? { ...e, ...record } : e));
  };

  const addExpenses = (records: Omit<ExpenseRecord, 'id'>[]) => {
    const newRecords: ExpenseRecord[] = records.map(record => ({
      ...record,
      id: Math.random().toString(36).substr(2, 9)
    }));
    setExpenseRecords(prev => [...prev, ...newRecords]);
  };

  const deleteExpense = (id: string) => setExpenseRecords(prev => prev.filter(e => e.id !== id));
  const setMonthlyBudget = (amount: number) => setBudgetState(amount);
  
  const updateChatHistory = (messages: ChatMessage[]) => setChatHistory(messages);
  const clearChat = () => setChatHistory([{
    id: '1',
    role: 'assistant',
    content: '嗨！我是萝萝记账小能手。账单清空萝，随时可以开始新一轮记账！'
  }]);

  const addMealPlan = (plan: Omit<MealPlan, 'id'>) => {
    setMealPlans(prev => [...prev, { ...plan, id: Math.random().toString(36).substr(2, 9) }]);
  };
  const removeMealPlan = (id: string) => setMealPlans(prev => prev.filter(p => p.id !== id));

  const addFeedback = (feedback: Omit<RecipeFeedback, 'id'>) => {
    setFeedbacks(prev => [{ ...feedback, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
  };

  const processBookkeeping = async (text: string, imageBase64?: string) => {
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一个专业的财务记账助手，名叫"萝萝"。分析输入并提取消费项。
请务必返回 JSON:
{
  "items": [
    { "amount": 数字, "description": "描述", "category": "分类", "date": "YYYY-MM-DD" }
  ],
  "responseText": "口吻活泼的话"
}
当前日期: ${new Date().toISOString().split('T')[0]}`;

      let result;
      if (imageBase64) {
        result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }, { text: prompt + `\n用户输入: ${text}` }] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING }, category: { type: Type.STRING }, date: { type: Type.STRING } }, required: ["amount", "description"] } },
                responseText: { type: Type.STRING }
              },
              required: ["items", "responseText"]
            }
          }
        });
      } else {
        result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt + `\n用户输入: ${text}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING }, category: { type: Type.STRING }, date: { type: Type.STRING } }, required: ["amount", "description"] } },
                responseText: { type: Type.STRING }
              },
              required: ["items", "responseText"]
            }
          }
        });
      }

      const aiResponse = JSON.parse(result.text);
      const assistantMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse.responseText,
        data: aiResponse.items.length > 0 ? aiResponse.items : null,
        isConfirmed: false
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI记账失败:", error);
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "萝萝刚才走神了，没听清萝..." }]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const processRecipeImport = async (content: string) => {
    setIsRecipeImporting(true);
    setImportedRecipeResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一个专业的厨谱还原助手。请将用户提供的原文内容（可能包含小红书文案或链接描述）解析为结构化 JSON。
【核心规则】：
1. 步骤说明必须严格遵循原文，不得有任何虚构、合并或简化。
2. 尝试从上下文中识别封面图URL和每个步骤对应的图片URL。
3. 严禁添加原文中不存在的分类建议或成本信息，不确定的分类请留空 ""。
4. 食材量词请尽可能保留原文。

JSON 结构：
{
  "name": "菜名",
  "category": "分类(不确定请留空)",
  "image": "封面图URL(不确定请留空)",
  "ingredients": [
    { "name": "食材名", "amount": 数字, "unit": "单位" }
  ],
  "steps": [
    { "instruction": "步骤说明原文", "image": "步骤图URL(可留空)" }
  ]
}
原文内容：${content}`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              image: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING }
                  },
                  required: ["name"]
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    instruction: { type: Type.STRING },
                    image: { type: Type.STRING }
                  },
                  required: ["instruction"]
                }
              }
            },
            required: ["name", "ingredients", "steps"]
          }
        }
      });

      const parsed = JSON.parse(result.text);
      setImportedRecipeResult(parsed);
    } catch (error) {
      console.error("食谱导入失败:", error);
    } finally {
      setIsRecipeImporting(false);
    }
  };

  const clearImportResult = () => setImportedRecipeResult(null);

  return (
    <KitchenContext.Provider value={{ 
      recipes, categories, cookingQueue, shoppingList, expenseRecords, chatHistory, mealPlans, feedbacks, monthlyBudget, 
      isAiProcessing, isRecipeImporting, importedRecipeResult,
      addRecipe, updateRecipe, deleteRecipe, addCategory, updateCategory, deleteCategory, reorderCategories,
      addToQueue, removeFromQueue, clearQueue, addToShoppingList, toggleShoppingItem, clearShoppingList,
      addExpense, updateExpense, addExpenses, deleteExpense, setMonthlyBudget, updateChatHistory, clearChat,
      addMealPlan, removeMealPlan, addFeedback, processBookkeeping, processRecipeImport, clearImportResult
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
