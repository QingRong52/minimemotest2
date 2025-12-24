
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Check, Utensils, ShoppingCart, Sparkles, Loader2, 
  Beef, Carrot, Apple, Milk, Egg, Fish, Salad, Coffee, Candy, Soup, Droplet, UtensilsCrossed 
} from 'lucide-react';
import InventoryCard from '../components/InventoryCard';
import { Ingredient } from '../types';
import { useKitchen } from '../KitchenContext';

const ICON_OPTIONS = [
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Beef', icon: Beef },
  { name: 'Carrot', icon: Carrot },
  { name: 'Apple', icon: Apple },
  { name: 'Milk', icon: Milk },
  { name: 'Egg', icon: Egg },
  { name: 'Fish', icon: Fish },
  { name: 'Salad', icon: Salad },
  { name: 'Coffee', icon: Coffee },
  { name: 'Candy', icon: Candy },
  { name: 'Soup', icon: Soup },
  { name: 'Droplet', icon: Droplet },
];

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { ingredients, addIngredient, removeIngredient } = useKitchen();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('顿');
  const [newCategory, setNewCategory] = useState<'食材' | '调料'>('食材');
  const [selectedIcon, setSelectedIcon] = useState('UtensilsCrossed');

  // Group items by category
  const groupedItems = ingredients.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const displayOrder: ('食材' | '调料')[] = ['食材', '调料'];

  const handleMatchRecipes = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      navigate('/', { state: { filter: 'matched' } });
    }, 1500);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) {
      alert('请填写名称和价格');
      return;
    }

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: newName,
      price: parseFloat(newPrice),
      quantity: newQuantity.trim() === '' ? null : parseFloat(newQuantity),
      unit: newUnit,
      category: newCategory,
      lowStockThreshold: 1,
      iconName: selectedIcon,
    };

    addIngredient(newItem);
    setNewName('');
    setNewPrice('');
    setNewQuantity('');
    setSelectedIcon('UtensilsCrossed');
    setIsModalOpen(false);
  };

  return (
    <div className="pb-32 animate-fade-in px-4">
      <header className="mb-10 flex justify-between items-start pt-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-[#ff7a28]">
            <span role="img" aria-label="burger">🍔</span> 我的食材库
          </h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">管理您的厨房资产</p>
        </div>
        <button 
          onClick={handleMatchRecipes}
          disabled={isMatching}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {isMatching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} fill="white" />}
        </button>
      </header>

      {isMatching && (
        <div className="fixed inset-0 z-[70] bg-orange-500/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-fade-in">
          <Sparkles size={64} className="mb-4 animate-bounce" fill="white" />
          <h2 className="text-2xl font-bold mb-2">正在为您匹配菜单...</h2>
          <p className="opacity-80">根据现有食材智能推荐</p>
        </div>
      )}

      <div className="space-y-8">
        {displayOrder.map((category) => {
          const categoryItems = groupedItems[category] || [];
          return (
            <div key={category}>
              <h3 className="text-gray-400 text-sm font-bold mb-4 px-2 tracking-widest">{category}</h3>
              <div className="space-y-4">
                {categoryItems.map((item) => (
                  <InventoryCard 
                    key={item.id} 
                    item={item} 
                    onDelete={() => removeIngredient(item.id)} 
                  />
                ))}
                {categoryItems.length === 0 && (
                  <p className="text-gray-300 text-xs italic px-2">暂无{category}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-[375px] px-6 flex items-center gap-4 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 h-16 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center gap-3 text-white rounded-[32px] font-bold shadow-xl shadow-orange-200 active:scale-95 transition-all"
        >
          <Utensils size={20} />
          <span className="text-lg">添加食材</span>
        </button>
        <button className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-200 active:scale-95 transition-all">
          <ShoppingCart size={24} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-[340px] rounded-[40px] p-8 shadow-2xl animate-slide-up overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">入库食材</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">名称</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-orange-400 transition-all"
                  placeholder="如：五花肉"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">选择图标</label>
                <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-2xl">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                        selectedIcon === opt.name 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'bg-white text-gray-300 hover:text-orange-400'
                      }`}
                    >
                      <opt.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1 uppercase">分类</label>
                <div className="flex gap-2">
                  {displayOrder.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${
                        newCategory === cat 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100' 
                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1 uppercase">价格</label>
                  <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-orange-400 transition-all"
                    placeholder="25"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1 uppercase">数量 (可选)</label>
                  <div className="flex bg-gray-50 rounded-2xl p-1.5">
                    <input 
                      type="number" 
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="flex-1 bg-transparent border-none px-3 py-2 text-sm font-medium focus:outline-none"
                    />
                    <select 
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="bg-white rounded-xl text-[10px] font-bold px-2 py-1 outline-none text-orange-500 shadow-sm"
                    >
                      <option value="顿">顿</option>
                      <option value="g">g</option>
                      <option value="瓶">瓶</option>
                      <option value="个">个</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-orange-500 text-white py-5 rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-100 mt-4 active:scale-95 transition-all"
              >
                <Check size={20} />
                确认入库
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
