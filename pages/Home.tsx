
import React, { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Plus, X, UtensilsCrossed, Apple, Coffee, Candy, Pizza, Camera } from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { Recipe } from '../types';

const CATEGORIES = [
  { id: '全部', label: '全部', icon: <UtensilsCrossed size={20} />, color: 'bg-orange-50' },
  { id: '老爸最爱', label: '老爸最爱', icon: <Pizza size={20} />, color: 'bg-red-50' },
  { id: '快手早餐', label: '早起饮品', icon: <Coffee size={20} />, color: 'bg-blue-50' },
  { id: '健康轻食', label: '水果轻食', icon: <Apple size={20} />, color: 'bg-green-50' },
  { id: '精致晚餐', label: '美味主食', icon: <Candy size={20} />, color: 'bg-purple-50' },
];

const Home: React.FC = () => {
  const { recipes, addRecipe } = useKitchen();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState('老爸最爱');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop');

  const filteredRecipes = selectedCategory === '全部' 
    ? recipes 
    : recipes.filter(r => r.category === selectedCategory);

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost) return;

    const newRecipe: Recipe = {
      id: `r-${Date.now()}`,
      name,
      estimatedCost: parseFloat(cost),
      category,
      image: imageUrl,
      ingredients: [],
      steps: []
    };

    addRecipe(newRecipe);
    setName('');
    setCost('');
    setIsModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6">
        <header className="mb-10 pt-16">
          <div className="mb-8 flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-[30px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                早上好，<br/>老爸
              </h1>
              <p className="text-gray-400 font-medium text-sm">今天想吃点什么？</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-14 h-14 bg-black rounded-3xl flex items-center justify-center text-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] active:scale-90 transition-all"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center gap-2.5 min-w-[70px]"
              >
                <div className={`w-[60px] h-[60px] rounded-[24px] flex items-center justify-center transition-all duration-500 ${
                  selectedCategory === cat.id 
                  ? 'bg-[#1A1A1A] text-white shadow-xl -translate-y-1' 
                  : `${cat.color} text-gray-500 hover:scale-105`
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[11px] font-bold transition-colors ${
                  selectedCategory === cat.id ? 'text-[#1A1A1A]' : 'text-gray-400'
                }`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 pb-32">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-2 text-center py-24">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed size={32} className="text-gray-200" />
              </div>
              <p className="text-gray-300 text-sm font-medium">还没有相关食谱呢</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-[110] flex items-end justify-center px-4 pb-8 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full rounded-[48px] p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">添加新食谱</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 active:scale-90 transition-all">
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <form onSubmit={handleAddRecipe} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">食谱名称</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                  placeholder="例如：法式红酒烩牛肉"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">估算成本</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">¥</span>
                    <input 
                      type="number" 
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl pl-10 pr-6 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">食谱分类</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-5 py-4 text-xs font-bold text-gray-800 appearance-none transition-all outline-none"
                  >
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-5 rounded-[24px] font-bold text-base shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-all mt-6"
              >
                保存到厨房
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(150px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default Home;
