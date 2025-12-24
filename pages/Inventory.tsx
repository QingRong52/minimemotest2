
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Check, ShoppingCart, Sparkles, Loader2, 
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
    <div className="h-full flex flex-col animate-fade-in relative">
      {/* 滚动区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-16 pb-32">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-[30px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
              我的<br/>食材库
            </h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">管理您的厨房资产</p>
          </div>
          <button 
            onClick={handleMatchRecipes}
            disabled={isMatching}
            className="w-14 h-14 rounded-[24px] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-[0_10px_25px_rgba(255,122,40,0.3)] active:scale-90 transition-all disabled:opacity-50"
          >
            {isMatching ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} fill="white" />}
          </button>
        </header>

        <div className="space-y-10">
          {displayOrder.map((category) => {
            const categoryItems = groupedItems[category] || [];
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-5 px-1">
                  <h3 className="text-[#1A1A1A] text-sm font-black tracking-[0.15em] uppercase">{category}</h3>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-[10px] font-bold text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">{categoryItems.length}</span>
                </div>
                <div className="space-y-4">
                  {categoryItems.map((item) => (
                    <InventoryCard 
                      key={item.id} 
                      item={item} 
                      onDelete={() => removeIngredient(item.id)} 
                    />
                  ))}
                  {categoryItems.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-50 rounded-[32px]">
                      <p className="text-gray-300 text-[11px] font-bold italic tracking-wider">暂无{category}入库</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isMatching && (
        <div className="absolute inset-0 z-[120] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center text-orange-500 animate-fade-in">
          <Sparkles size={64} className="mb-6 animate-bounce" fill="currentColor" />
          <h2 className="text-2xl font-black mb-2">正在智能匹配...</h2>
          <p className="text-gray-400 font-bold text-sm tracking-widest">根据现有食材推荐今日大餐</p>
        </div>
      )}

      {/* 固定在底部的操作栏 - 此时它会完美出现在导航栏上方 */}
      <div className="absolute bottom-28 left-0 right-0 px-6 flex items-center gap-4 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 h-16 bg-black text-white flex items-center justify-center rounded-[24px] font-black text-base shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-95 transition-all"
        >
          添加食材
        </button>
        <button className="w-16 h-16 bg-white border border-gray-100 rounded-[24px] flex items-center justify-center text-gray-800 shadow-[0_10px_25px_rgba(0,0,0,0.03)] active:scale-95 transition-all">
          <ShoppingCart size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* 入库模态框 */}
      {isModalOpen && (
        <div className="absolute inset-0 z-[130] flex items-end justify-center px-4 pb-8 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full rounded-[48px] p-8 shadow-2xl animate-slide-up max-h-[90%] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">食材入库</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 active:scale-90 transition-all">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">名称</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                  placeholder="如：日本 A5 和牛"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">选择图标</label>
                <div className="grid grid-cols-6 gap-2 bg-gray-50 p-4 rounded-3xl">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setSelectedIcon(opt.name)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                        selectedIcon === opt.name 
                        ? 'bg-black text-white shadow-lg scale-110' 
                        : 'bg-white text-gray-300 hover:text-black'
                      }`}
                    >
                      <opt.icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">成本 (¥)</label>
                  <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">库存量</label>
                  <div className="flex bg-gray-50 rounded-2xl p-1 border-2 border-transparent focus-within:border-orange-100 focus-within:bg-white transition-all">
                    <input 
                      type="number" 
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(e.target.value)}
                      className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold focus:outline-none"
                    />
                    <select 
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      className="bg-white rounded-xl text-[10px] font-black px-3 py-1 outline-none text-orange-500 shadow-sm"
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
                className="w-full bg-black text-white py-5 rounded-[24px] font-bold text-base shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Check size={20} strokeWidth={3} />
                确认入库
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

export default Inventory;
