
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Sparkles, Utensils, X, Trash2, ChefHat, CheckCircle2, PackagePlus, Sandwich, Check, Plus, ArrowLeft, Edit3
} from 'lucide-react';
import * as Icons from 'lucide-react';
import InventoryCard from '../components/InventoryCard';
import RecipeCard from '../components/RecipeCard';
import { LuluSearch, LuluCart, LuluChef } from '../components/LuluIcons';
import { Ingredient } from '../types';
import { useKitchen } from '../KitchenContext';

const UNITS = ['g', '个', '克', '斤'];
const INGREDIENT_ICONS = ['Beef', 'Fish', 'Apple', 'Pizza', 'Sandwich', 'Soup', 'Cookie', 'Cake', 'IceCream', 'Utensils'];
const SEASONING_ICONS = ['Flame', 'Droplets', 'Leaf', 'Wheat', 'Wine', 'Milk', 'Zap', 'Coffee', 'Container', 'Package'];

const Inventory: React.FC = () => {
  const { ingredients, recipes, addIngredient, removeIngredient, shoppingList, clearShoppingList, toggleShoppingItem, addBoughtToInventory, addExpense } = useKitchen();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const matchedRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (recipe.ingredients.length === 0) return false;
      return recipe.ingredients.every(ri => {
        const stock = ingredients.find(i => i.id === ri.ingredientId || i.name === ri.name);
        return stock && (stock.quantity ?? 0) >= ri.amount;
      });
    });
  }, [recipes, ingredients]);

  const groupedItems = ingredients.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const displayOrder: ('食材' | '调料')[] = ['食材', '调料'];

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
      description: `${newName} (手动录入)`,
      icon: newIcon
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewName('');
    setNewPrice('');
    setNewQuantity('1');
    setNewIcon('Utensils');
    setNewCategory('食材');
  };

  const getIcon = (iconName: string, size = 18) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent size={size} strokeWidth={2.5} />;
  };

  const handleConfirmBulkAdd = () => {
    addBoughtToInventory(tempInventoryItems);
    setIsInventoryCheckOpen(false);
    setIsCartOpen(false);
  };

  const updateTempItem = (idx: number, fields: Partial<Ingredient>) => {
    const next = [...tempInventoryItems];
    next[idx] = { ...next[idx], ...fields };
    setTempInventoryItems(next);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-6 pt-20 pb-40">
        <header className="mb-8 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#FFF9E8] rounded-[18px] flex items-center justify-center text-[#FF5C00] shadow-sm border border-[#F0E6D2]">
              <Sandwich size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[24px] font-black tracking-tighter text-[#5D3A2F] leading-tight">食材库</h1>
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

        <div className="space-y-8 pb-10">
          {ingredients.length > 0 ? (
            displayOrder.map((category) => {
              const categoryItems = groupedItems[category] || [];
              if (categoryItems.length === 0) return null;
              return (
                <div key={category} className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
                    <h3 className="text-[#B45309]/60 text-[12px] font-black tracking-widest uppercase">{category}</h3>
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
              <p className="text-[13px] font-black text-[#B45309]/40 mt-4">“粮草空虚，萝萝正在四处觅食...”</p>
            </div>
          )}
        </div>
      </div>

      {/* 悬浮操作按钮 */}
      <div className="fixed bottom-[96px] left-0 right-0 px-6 flex items-center justify-center gap-4 z-[50]">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 max-w-[240px] h-[56px] bg-[#FF5C00] text-white flex items-center justify-center gap-3 rounded-[22px] font-black text-lg shadow-xl active:scale-95 transition-all border-b-[5px] border-[#E65100]"
        >
          <ChefHat size={22} strokeWidth={3} /> 添加食材
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-[56px] h-[56px] bg-white text-[#FF5C00] rounded-[22px] flex items-center justify-center border-2 border-[#FF5C00]/10 shadow-lg active:scale-95 transition-all relative"
        >
          <ShoppingCart size={22} strokeWidth={3} />
          {shoppingList.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-[#FF5C00] text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm">
              {shoppingList.length}
            </div>
          )}
        </button>
      </div>

      {/* 添加食材弹窗 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xl flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[82%] rounded-t-[22px] animate-slide-up flex flex-col shadow-2xl relative overflow-hidden border-t border-white/40">
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mt-4 shrink-0"></div>
            <header className="px-8 pt-4 pb-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <ChefHat size={22} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[20px] font-black text-[#5D3A2F]">录入食材</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="w-9 h-9 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2]"><X size={18} strokeWidth={3} /></button>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-8 pb-32 space-y-6">
              <div className="p-1 bg-[#FFF9E8] rounded-2xl flex border border-[#F0E6D2]/50 shadow-inner">
                <button onClick={() => { setNewCategory('食材'); setNewIcon('Utensils'); }} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${newCategory === '食材' ? 'bg-white text-[#FF5C00] shadow-md' : 'text-[#B45309]/30'}`}>食材</button>
                <button onClick={() => { setNewCategory('调料'); setNewIcon('Flame'); }} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${newCategory === '调料' ? 'bg-white text-[#FF5C00] shadow-md' : 'text-[#B45309]/30'}`}>调料</button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest px-2">食材名称</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="名称..." className="w-full bg-white border-2 border-[#F0E6D2] focus:border-[#FF5C00] px-5 py-3.5 rounded-[22px] font-black text-base outline-none shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 px-2 uppercase tracking-widest">价格 ¥</label>
                  <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00" className="w-full bg-white border-2 border-[#F0E6D2] px-5 py-3 rounded-[18px] font-black text-[#FF5C00] text-base outline-none shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 px-2 uppercase tracking-widest">分量</label>
                  <div className="flex border-2 border-[#F0E6D2] rounded-[18px] overflow-hidden bg-white shadow-sm">
                    <input type="number" value={newQuantity} onChange={e => setNewQuantity(e.target.value)} className="w-full bg-transparent px-3 py-3 font-black text-base outline-none text-right" />
                    <select value={newUnit} onChange={e => setNewUnit(e.target.value)} className="bg-transparent font-black text-[10px] text-[#FF5C00] px-2 outline-none">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#B45309]/30 px-2 uppercase tracking-widest">图标</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {(newCategory === '食材' ? INGREDIENT_ICONS : SEASONING_ICONS).map(icon => (
                    <button key={icon} onClick={() => setNewIcon(icon)} className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${newIcon === icon ? 'bg-[#FF5C00] text-white border-[#FF5C00] shadow-md' : 'bg-white border-[#F0E6D2] text-[#B45309]/20'}`}>{getIcon(icon, 20)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FEFFF9] to-transparent">
              <button onClick={handleAddIngredient} className="w-full h-14 bg-[#FF5C00] text-white rounded-[22px] font-black text-base shadow-xl border-b-4 border-[#E65100] active:scale-95 transition-all">现在录入</button>
            </div>
          </div>
        </div>
      )}

      {/* 待购清单抽屉 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[78%] rounded-t-[22px] p-8 animate-slide-up flex flex-col shadow-2xl relative border-t-8 border-[#FF5C00]/10">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]"><ShoppingCart size={24} className="text-[#FF5C00]" strokeWidth={2.5} /></div>
                <h2 className="text-2xl font-black text-[#5D3A2F]">待购清单</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-[#FFF9E8] p-3 rounded-xl text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"><X size={20} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar space-y-3 pb-32">
              {shoppingList.length > 0 ? (
                shoppingList.map((item) => (
                  <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className={`w-full border-2 p-5 rounded-[22px] flex items-center justify-between shadow-sm transition-all duration-300 ${item.checked ? 'border-green-500 bg-green-50/30' : 'bg-white border-[#F0E6D2]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-[#F0E6D2] text-transparent'}`}><CheckCircle2 size={16} strokeWidth={3} /></div>
                      <span className={`font-black text-[16px] ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>{item.name}</span>
                    </div>
                    {item.price && <span className="text-[13px] font-black text-[#FF5C00]">¥{item.price}</span>}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-[#B45309]"><LuluCart size={150} className="mb-4" /><p className="font-black">清单空空萝...</p></div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FEFFF9] to-transparent grid grid-cols-2 gap-4">
              <button onClick={clearShoppingList} className="bg-[#B45309]/5 text-[#B45309]/40 py-5 rounded-[22px] font-black text-sm active:scale-[0.97] transition-all border border-[#B45309]/5">清空清单</button>
              <button onClick={() => {
                const bought = shoppingList.filter(item => item.checked);
                if (bought.length > 0) {
                  const items: Ingredient[] = bought.map(item => ({
                    id: `bought-${item.id}`, name: item.name, price: item.price || 0, quantity: 1, unit: '斤', category: '食材', lowStockThreshold: 1, iconName: 'Utensils'
                  }));
                  setTempInventoryItems(items);
                  setIsInventoryCheckOpen(true);
                }
              }} disabled={!shoppingList.some(i => i.checked)} className="bg-[#5D3A2F] text-white py-5 rounded-[22px] font-black text-sm shadow-xl active:scale-[0.97] transition-all disabled:opacity-30">核对并入库</button>
            </div>
          </div>
        </div>
      )}

      {/* 入库核对弹窗 */}
      {isInventoryCheckOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-xl flex items-end justify-center animate-fade-in p-4 pb-12">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[85%] rounded-[22px] p-8 animate-slide-up flex flex-col border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]"><PackagePlus size={24} className="text-[#FF5C00]" strokeWidth={2.5} /></div>
                <h2 className="text-2xl font-black text-[#5D3A2F]">入库核对</h2>
              </div>
              <button onClick={() => setIsInventoryCheckOpen(false)} className="bg-[#FFF9E8] p-3 rounded-xl text-[#B45309]/30"><X size={24} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar space-y-6 pb-20">
              {tempInventoryItems.map((item, idx) => (
                <div key={item.id} className="bg-white border-2 border-[#F0E6D2] p-6 rounded-[22px] space-y-6">
                  <span className="text-lg font-black text-[#3D2B1F] block">{item.name}</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">单价 ¥</span>
                      <input type="number" className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] rounded-2xl px-5 py-3 font-black text-[#FF5C00] outline-none" value={item.price} onChange={(e) => updateTempItem(idx, { price: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">分量</span>
                      <div className="flex bg-[#FFF9E8]/30 border border-[#F0E6D2] rounded-2xl overflow-hidden">
                        <input type="number" className="w-full bg-transparent px-3 py-3 font-black text-[#3D2B1F] outline-none text-right" value={item.quantity || ''} onChange={(e) => updateTempItem(idx, { quantity: Number(e.target.value) })} />
                        <select className="bg-transparent text-[10px] font-black text-[#FF5C00] px-2 outline-none" value={item.unit} onChange={(e) => updateTempItem(idx, { unit: e.target.value })}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FEFFF9] to-transparent">
              <button onClick={handleConfirmBulkAdd} className="w-full h-16 bg-[#FF5C00] text-white py-5 rounded-[22px] font-black text-lg shadow-xl active:scale-[0.98] transition-all border-b-4 border-[#E65100]">确认批量入库</button>
            </div>
          </div>
        </div>
      )}

      {/* 智选匹配弹窗 */}
      {isMagicMatchOpen && (
        <div className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[82%] rounded-t-[22px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]"><Sparkles size={24} className="text-[#FF5C00]" strokeWidth={2.5} /></div>
                <h2 className="text-xl font-black text-[#5D3A2F]">智选匹配</h2>
              </div>
              <button onClick={() => setIsMagicMatchOpen(false)} className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"><X size={20} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll space-y-4 pb-20">
              {matchedRecipes.length > 0 ? (
                matchedRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-80 text-[#B45309]"><LuluSearch size={140} className="mb-4" /><p className="font-black text-sm opacity-40">“库存不足，没法匹配萝...”</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Inventory;