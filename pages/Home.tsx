
import React, { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Plus, X, UtensilsCrossed, Apple, Coffee, Candy, Pizza, Camera } from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { Recipe } from '../types';

const CATEGORIES = [
  { id: '全部', label: '全部', icon: <UtensilsCrossed size={22} /> },
  { id: '老爸最爱', label: '老爸最爱', icon: <Pizza size={22} /> },
  { id: '快手早餐', label: '早起饮品', icon: <Coffee size={22} /> },
  { id: '健康轻食', label: '水果轻食', icon: <Apple size={22} /> },
  { id: '精致晚餐', label: '美味主食', icon: <Candy size={22} /> },
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
    <div className="animate-fade-in px-6 relative min-h-screen">
      <header className="mb-6 pt-6">
        <div className="mb-8 flex justify-between items-end">
          <h1 className="text-[32px] leading-tight flex flex-col">
            <span className="font-extrabold text-[#1A1A1A]">饿了吗？</span>
            <span className="font-medium text-gray-400">老爸准备中。</span>
          </h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all mb-1"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* 圆盘分类导航 */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex flex-col items-center gap-2 group min-w-[64px]"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedCategory === cat.id 
                ? 'bg-[#1A1A1A] text-white shadow-xl -translate-y-1 scale-105' 
                : 'bg-white text-gray-400 shadow-[0_4px_15px_rgba(0,0,0,0.03)]'
              }`}>
                {cat.icon}
              </div>
              <span className={`text-[11px] font-bold tracking-tight transition-colors ${
                selectedCategory === cat.id ? 'text-[#1A1A1A]' : 'text-gray-400'
              }`}>
                {cat.label}
              </span>
              {selectedCategory === cat.id && (
                <div className="w-6 h-1 bg-[#1A1A1A] rounded-full animate-fade-in mt-0.5"></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* 食谱双列网格 */}
      <div className="grid grid-cols-2 gap-4 pb-32">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="col-span-2 text-center py-20 text-gray-300 italic">
            这里空空如也，快去添加食谱吧！
          </div>
        )}
      </div>

      {/* 添加食谱模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full rounded-[40px] p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">新增食谱</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleAddRecipe} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">食谱名称</label>
                <input 
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F5F5F5] border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800"
                  placeholder="如：红烧肉"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">估算成本 (¥)</label>
                  <input 
                    type="number" 
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800"
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">分类</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl px-4 py-4 text-sm font-bold text-gray-800 appearance-none"
                  >
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">封面图片 (URL)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#F5F5F5] border-none rounded-2xl px-6 py-4 pr-12 text-[10px] font-medium text-gray-500"
                  />
                  <Camera className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white py-5 rounded-full font-bold shadow-xl active:scale-95 transition-all mt-4"
              >
                开启厨神之路
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default Home;
