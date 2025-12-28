
import React, { useState } from 'react';
import { 
  ShoppingCart, Sparkles, Utensils, X, Trash2, ChefHat, CheckCircle2, PackagePlus, Sandwich, Tags, Check
} from 'lucide-react';
import * as Icons from 'lucide-react';
import InventoryCard from '../components/InventoryCard';
import RecipeCard from '../components/RecipeCard';
import { LuluSearch, LuluCart } from '../components/LuluIcons';
import { Ingredient, Recipe } from '../types';
import { useKitchen } from '../KitchenContext';

const UNITS = ['g', '个', '克', '斤'];

// 食材专属图标
const INGREDIENT_ICONS = [
  'Beef', 'Fish', 'Apple', 'Pizza', 'Sandwich', 'Soup', 'Cookie', 'Cake', 'IceCream', 'Utensils'
];

// 调料专属图标
const SEASONING_ICONS = [
  'Flame', 'Droplets', 'Leaf', 'Wheat', 'Wine', 'Milk', 'Zap', 'Coffee', 'Container', 'Package'
];

const Inventory: React.FC = () => {
  const { ingredients, recipes, addIngredient, removeIngredient, shoppingList, clearShoppingList, toggleShoppingItem, addBoughtToInventory, addExpense } = useKitchen();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInventoryCheckOpen, setIsInventoryCheckOpen] = useState(false);
  const [isMagicMatchOpen, setIsMagicMatchOpen] = useState(false);
  const [tempInventoryItems, setTempInventoryItems] = useState<Ingredient[]>([]);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newUnit, setNewUnit] = useState('斤');
  const [newIcon, setNewIcon] = useState('Utensils');
  const [newCategory, setNewCategory] = useState<'食材' | '调料'>('食材');

  const groupedItems = ingredients.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const displayOrder: ('食材' | '调料')[] = ['食材', '调料'];

  const matchedRecipes = isMagicMatchOpen ? recipes.filter(recipe => {
    const ownedIngredientsNames = ingredients
      .filter(i => i.category === '食材' && (i.quantity || 0) > 0)
      .map(i => i.name);
    return recipe.ingredients.some(ri => ownedIngredientsNames.includes(ri.name));
  }) : [];

  const handleCategoryChange = (cat: '食材' | '调料') => {
    setNewCategory(cat);
    setNewIcon(cat === '食材' ? 'Utensils' : 'Flame');
  };

  const handleAddIngredient = () => {
    if (!newName.trim()) return alert('请输入食材名称');
    const priceNum = Number(newPrice) || 0;
    const qtyNum = Number(newQuantity) || 0;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: newName,
      quantity: qtyNum,
      unit: newUnit,
      price: priceNum,
      category: newCategory,
      lowStockThreshold: 1,
      iconName: newIcon
    };
    
    addIngredient(newItem);
    addExpense({
      date: now.toISOString().split('T')[0],
      time: currentTime,
      amount: priceNum * qtyNum,
      type: 'purchase',
      description: `${newName} (入库)`,
      icon: newIcon
    });

    setIsModalOpen(false);
    setNewName('');
    setNewPrice('');
    setNewQuantity('1');
    setNewIcon('Utensils');
    setNewCategory('食材');
  };

  const openInventoryCheck = () => {
    const bought = shoppingList.filter(item => item.checked);
    if (bought.length === 0) return;
    const initialItems: Ingredient[] = bought.map(item => ({
      id: `bought-${item.id}`,
      name: item.name,
      price: item.price || 0,
      quantity: 1,
      unit: '斤',
      category: '食材',
      lowStockThreshold: 1,
      iconName: 'Utensils'
    }));
    setTempInventoryItems(initialItems);
    setIsInventoryCheckOpen(true);
  };

  const updateTempItem = (idx: number, fields: Partial<Ingredient>) => {
    const newItems = [...tempInventoryItems];
    newItems[idx] = { ...newItems[idx], ...fields };
    setTempInventoryItems(newItems);
  };

  const confirmInventoryAddition = () => {
    addBoughtToInventory(tempInventoryItems);
    setIsInventoryCheckOpen(false);
    setIsCartOpen(false);
  };

  const getIcon = (iconName: string, size = 18) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent size={size} strokeWidth={2.5} />;
  };

  const currentIconOptions = newCategory === '食材' ? INGREDIENT_ICONS : SEASONING_ICONS;

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-20 pb-32">
        <header className="mb-8 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#FFF9E8] rounded-[18px] flex items-center justify-center text-[#FF5C00] shadow-sm border border-[#F0E6D2]">
              <Sandwich size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[24px] font-black tracking-tighter text-[#5D3A2F] leading-tight">
                我的食材库
              </h1>
              <p className="text-[#B45309]/40 text-[10px] font-bold uppercase tracking-wider">STORAGE</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMagicMatchOpen(true)}
            className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"
          >
            <Sparkles size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="space-y-8">
          {displayOrder.length > 0 && ingredients.length > 0 ? (
            displayOrder.map((category) => {
              const categoryItems = groupedItems[category] || [];
              if (categoryItems.length === 0) return null;
              return (
                <div key={category} className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
                    <h3 className="text-[#B45309]/60 text-[12px] font-black tracking-widest uppercase">
                      {category}
                    </h3>
                  </div>
                  <div className="grid gap-3">
                    {categoryItems.map((item) => (
                      <InventoryCard key={item.id} item={item} onDelete={() => removeIngredient(item.id)} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-80">
              <LuluSearch size={160} />
              <p className="text-[13px] font-black text-[#B45309]/40 italic mt-4">“粮草空虚，萝萝正在四处觅食...”</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-[96px] left-0 right-0 px-6 flex items-center justify-center gap-[18px] z-50 animate-fade-in">
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ height: '52px', width: '216px' }}
          className="bg-[#FF5C00] text-white flex items-center justify-center gap-3 rounded-[22px] font-black text-base shadow-xl active:scale-95 transition-all border-b-4 border-[#E65100]"
        >
          <ChefHat size={22} strokeWidth={3} />
          添加食材
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-[52px] h-[52px] bg-white text-[#FF5C00] rounded-[22px] flex items-center justify-center border-2 border-[#FF5C00]/10 shadow-lg active:scale-95 transition-all relative"
        >
          <ShoppingCart size={22} strokeWidth={3} />
          {shoppingList.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-[#FF5C00] text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm">
              {shoppingList.length}
            </div>
          )}
        </button>
      </div>

      {/* 智选匹配食谱弹窗 */}
      {isMagicMatchOpen && (
        <div className="absolute inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[80%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Sparkles size={24} className="text-[#FF5C00]" />
                <h2 className="text-xl font-black text-[#5D3A2F]">根据库存匹配</h2>
              </div>
              <button onClick={() => setIsMagicMatchOpen(false)} className="p-2.5 bg-[#FFF3D3] rounded-2xl text-[#FF5C00]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {matchedRecipes.length > 0 ? (
                matchedRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-80 text-[#B45309]">
                  <LuluSearch size={140} className="mb-4" />
                  <p className="font-black italic text-sm opacity-40">“库存见底，萝萝也难为无米之炊...”</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 待购清单弹窗 */}
      {isCartOpen && (
        <div className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[75%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FFF3D3] rounded-2xl flex items-center justify-center text-[#FF5C00]">
                  <ShoppingCart size={24} />
                </div>
                <h2 className="text-2xl font-black text-[#5D3A2F]">待购清单</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-[#FFF3D3] p-2.5 rounded-2xl text-[#FF5C00] active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {shoppingList.length > 0 ? (
                shoppingList.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`w-full bg-white border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all ${
                      item.checked ? 'border-green-500 bg-green-50/30' : 'border-[#F0E6D2]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transition-colors ${item.checked ? 'text-green-500' : 'text-[#B45309]/20'}`}>
                        {item.checked ? <CheckCircle2 size={22} /> : <div className="w-[22px] h-[22px] border-2 border-current rounded-full" />}
                      </div>
                      <span className={`font-bold transition-all ${item.checked ? 'text-green-700 line-through opacity-50' : 'text-[#5D3A2F]'}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.price && <span className="text-[12px] font-black text-[#FF5C00]">¥{item.price}</span>}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-80 text-[#B45309]">
                  <LuluCart size={150} className="mb-4" />
                  <p className="text-[13px] font-black opacity-30 italic">“背筐已空，萝萝还没想好买什么...”</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={clearShoppingList} className="bg-[#B45309]/10 text-[#B45309] py-5 rounded-[24px] font-black text-sm flex items-center justify-center gap-2">
                <Trash2 size={18} /> 清空清单
              </button>
              <button onClick={openInventoryCheck} disabled={!shoppingList.some(i => i.checked)} className="bg-[#5D3A2F] text-white py-5 rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                <PackagePlus size={18} /> 核对并入库
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加食材弹窗 */}
      {isModalOpen && (
        <div className="absolute inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[85%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#5D3A2F] tracking-tight">添加新食材</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-[#FFF9E8] p-2 rounded-xl text-[#FF5C00]"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={() => handleCategoryChange('食材')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${newCategory === '食材' ? 'bg-[#FF5C00] text-white' : 'bg-[#FFF9E8] text-[#B45309]/40'}`}>食材</button>
                  <button onClick={() => handleCategoryChange('调料')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${newCategory === '调料' ? 'bg-[#FF5C00] text-white' : 'bg-[#FFF9E8] text-[#B45309]/40'}`}>调料</button>
                </div>
                
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="食材名称 (如: 五花肉)" className="w-full bg-white border border-[#F0E6D2] px-6 py-4 rounded-2xl font-black text-[#5D3A2F] outline-none shadow-sm" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">单价 ¥</label>
                    <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00" className="w-full bg-white border border-[#F0E6D2] px-5 py-3 rounded-2xl font-bold text-[#FF5C00] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">数量与单位</label>
                    <div className="flex border border-[#F0E6D2] rounded-2xl overflow-hidden bg-white">
                      <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} className="w-full bg-transparent px-4 py-3 font-bold text-[#5D3A2F] outline-none text-right" />
                      <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="bg-transparent font-black text-xs text-[#FF5C00] px-3 outline-none">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">挑选图标</label>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
                    {currentIconOptions.map(icon => (
                      <button key={icon} onClick={() => setNewIcon(icon)} className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${newIcon === icon ? 'bg-[#FF5C00] text-white' : 'bg-white border border-[#F0E6D2] text-[#B45309]/20'}`}>{getIcon(icon, 20)}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleAddIngredient} className="w-full bg-[#FF5C00] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#FF5C00]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Check size={22} strokeWidth={3} /> 确认添加萝
            </button>
          </div>
        </div>
      )}

      {/* 核对入库弹窗 */}
      {isInventoryCheckOpen && (
        <div className="absolute inset-0 z-[600] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[85%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#5D3A2F] tracking-tight">核对入库清单</h2>
              <button onClick={() => setIsInventoryCheckOpen(false)} className="bg-[#FFF9E8] p-2 rounded-xl text-[#FF5C00]"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-20">
              {tempInventoryItems.map((item, idx) => (
                <div key={item.id} className="bg-white border border-[#F0E6D2] p-5 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00]">{getIcon(item.iconName || 'Utensils', 18)}</div>
                    <span className="font-black text-[#5D3A2F]">{item.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-1 uppercase">总价 ¥</span>
                      <input type="number" value={item.price} onChange={e => updateTempItem(idx, { price: Number(e.target.value) })} className="w-full bg-[#FFF9E8]/50 border-none rounded-xl px-4 py-2.5 font-bold text-[#FF5C00] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-1 uppercase">入库量</span>
                      <div className="flex bg-[#FFF9E8]/50 rounded-xl overflow-hidden">
                        <input type="number" value={item.quantity || ''} onChange={e => updateTempItem(idx, { quantity: Number(e.target.value) })} className="w-full bg-transparent px-3 py-2.5 font-bold text-[#5D3A2F] outline-none text-right" />
                        <select value={item.unit} onChange={e => updateTempItem(idx, { unit: e.target.value })} className="bg-transparent text-[10px] font-black text-[#FF5C00] px-2 outline-none">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={confirmInventoryAddition} className="w-full bg-[#5D3A2F] text-white py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-95 transition-all">确认批量入库</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Inventory;
