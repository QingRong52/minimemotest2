
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Edit3, CircleCheck, Flame, Coins, X, 
  Trash2, CheckCircle2, PackagePlus, ChevronRight, Info, AlertCircle, Sparkles,
  ChefHat
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { Ingredient } from '../types';
import { LuluChef } from '../components/LuluIcons';

const UNITS = ['g', '个', '克', '斤', '份', '勺'];
const ICON_OPTIONS = [
  'Utensils', 'Beef', 'Fish', 'Coffee', 'Apple', 'Pizza', 'Soup', 'Cookie', 'Cake', 'IceCream', 'Flame', 'Sandwich'
];

const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ingredients: stockIngredients, recipes, addToShoppingList, shoppingList, clearShoppingList, toggleShoppingItem, addBoughtToInventory } = useKitchen();

  const [isCartBumping, setIsCartBumping] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [tempInventoryItems, setTempInventoryItems] = useState<Ingredient[]>([]);

  const recipe = useMemo(() => recipes.find(r => r.id === id), [id, recipes]);

  if (!recipe) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in">
       <LuluChef size={160} className="mb-6 opacity-40 grayscale" />
       <h3 className="text-xl font-black text-[#5D3A2F]">秘籍似乎失传了...</h3>
       <button onClick={() => navigate('/')} className="mt-4 text-[#FF5C00] font-bold">回到书架</button>
    </div>
  );

  const checklist = recipe.ingredients.map(ri => {
    const stock = stockIngredients.find(i => i.id === ri.ingredientId || i.name === ri.name);
    const hasEnough = stock ? (stock.quantity ?? 0) >= ri.amount : false;
    return { ...ri, hasEnough, price: ri.price || stock?.price || 0, unit: (ri as any).unit || 'g' };
  });

  const missingItems = checklist.filter(i => !i.hasEnough);
  const missingTotal = missingItems.reduce((sum, i) => sum + (i.price || 0), 0);

  const handleAddToCart = () => {
    addToShoppingList(missingItems.map(i => ({ name: i.name, price: i.price })));
    setIsCartBumping(true);
    setTimeout(() => setIsCartBumping(false), 600);
  };

  const openInventoryModal = () => {
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
    setIsInventoryModalOpen(true);
  };

  const updateTempItem = (idx: number, fields: Partial<Ingredient>) => {
    const newItems = [...tempInventoryItems];
    newItems[idx] = { ...newItems[idx], ...fields };
    setTempInventoryItems(newItems);
  };

  const confirmInventoryAddition = () => {
    addBoughtToInventory(tempInventoryItems);
    setIsInventoryModalOpen(false);
    setIsCartOpen(false);
  };

  const getIcon = (iconName: string, size = 18) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent size={size} strokeWidth={2.5} />;
  };

  return (
    <div className="h-full bg-[#FEFFF9] flex flex-col relative overflow-hidden animate-fade-in">
      <div className="fixed top-12 left-6 right-6 flex justify-between items-center z-[100]">
        <button onClick={() => navigate('/')} className="w-12 h-12 rounded-[20px] bg-white/90 backdrop-blur-2xl border border-white flex items-center justify-center text-[#FF5C00] shadow-sm active:scale-90 transition-all"><ArrowLeft size={22} strokeWidth={3} /></button>
        <button onClick={() => navigate(`/add-recipe?edit=${recipe.id}`)} className="w-12 h-12 rounded-[20px] bg-white/90 backdrop-blur-2xl border border-white flex items-center justify-center text-[#FF5C00] shadow-sm active:scale-90 transition-all"><Edit3 size={20} strokeWidth={2.5} /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-44">
        <div className="relative h-[45vh] w-full overflow-hidden">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FEFFF9]"></div>
          <div className="absolute bottom-8 left-8 right-8 animate-slide-up">
            <h1 className="text-[32px] font-black text-[#3D2B1F] leading-[1.2] tracking-tight mb-4 drop-shadow-sm">{recipe.name}</h1>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm inline-flex">
              <Coins size={16} className="text-[#FF5C00]" />
              <span className="text-[13px] font-black text-[#3D2B1F]">¥{recipe.estimatedCost} <small className="opacity-40 font-bold ml-0.5">/份</small></span>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 space-y-12">
          <section className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <div>
                <h2 className="text-[#3D2B1F] text-2xl font-black tracking-tight">食材清单</h2>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-3 h-1 rounded-full bg-[#FF5C00]"></div>
                   <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">Ingredients List</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {checklist.map((item, idx) => (
                <div key={idx} className={`border transition-all duration-300 p-4 rounded-[26px] flex items-center justify-between ${item.hasEnough ? 'bg-[#F0FDF4]/80 border-green-100 shadow-sm' : 'bg-white border-[#F0E6D2] shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${item.hasEnough ? 'bg-green-500 text-white shadow-lg' : 'bg-[#FFF9E8] text-[#FF5C00]'}`}>
                      {item.hasEnough ? <CircleCheck size={24} strokeWidth={2.5} /> : <span className="font-black text-lg">{item.name.charAt(0)}</span>}
                    </div>
                    <div>
                      <p className={`font-black text-[16px] ${item.hasEnough ? 'text-green-800' : 'text-[#3D2B1F]'}`}>{item.name}</p>
                      <p className={`text-[11px] font-bold ${item.hasEnough ? 'text-green-500/60' : 'text-[#B45309]/30'}`}>分量：{item.amount}{item.unit}</p>
                    </div>
                  </div>
                  {!item.hasEnough && <span className="text-[10px] font-black text-[#FF5C00]">¥{item.price}</span>}
                </div>
              ))}
            </div>
            {missingItems.length > 0 && (
              <button onClick={handleAddToCart} className="w-full bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-base flex items-center justify-center gap-3 shadow-2xl active:scale-[0.97] transition-all relative overflow-hidden group">
                <ShoppingCart size={20} strokeWidth={3} />
                <span>智能补货 (约 ¥{missingTotal.toFixed(1)})</span>
              </button>
            )}
          </section>

          <section className="space-y-10">
            <div className="px-1">
              <h2 className="text-[#3D2B1F] text-2xl font-black tracking-tight">独门步法</h2>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className="w-3 h-1 rounded-full bg-[#3D2B1F]"></div>
                 <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">Step-by-Step</p>
              </div>
            </div>
            <div className="space-y-12 relative">
              <div className="absolute left-[47px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-[#F0E6D2] to-transparent"></div>
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-[30px] overflow-hidden bg-[#FFF9E8] border-2 border-white shadow-sm relative shrink-0">
                    {step.image ? <img src={step.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#FF5C00]/10"><ChefHat size={40} /></div>}
                    <div className="absolute -top-1 -left-1 w-9 h-9 bg-[#3D2B1F] text-white flex items-center justify-center font-black text-[14px] rounded-br-[18px] border-2 border-white">{idx + 1}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#3D2B1F] font-bold text-[15px] leading-[1.6]">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <button onClick={() => setIsCartOpen(true)} className={`fixed bottom-10 right-6 w-16 h-16 bg-[#FF5C00] rounded-[24px] flex items-center justify-center text-white shadow-2xl z-[110] border-b-[6px] border-[#E65100] ${isCartBumping ? 'animate-bounce-short' : 'active:scale-90'}`}>
        <div className="relative">
          <ShoppingCart size={28} strokeWidth={3} />
          {shoppingList.length > 0 && <div className="absolute -top-2 -right-2 bg-white text-[#FF5C00] min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center font-black text-[11px] border-2 border-[#FF5C00] shadow-sm">{shoppingList.length}</div>}
        </div>
      </button>

      {/* 备忘清单抽屉 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[375px] h-[80%] rounded-t-[50px] p-8 animate-slide-up flex flex-col shadow-2xl relative border-t-8 border-[#FF5C00]/10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <ShoppingCart size={24} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-[#3D2B1F] tracking-tight">备忘清单</h2>
                   <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest mt-1.5">Shopping Memo</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-[#FFF9E8] p-3 rounded-xl text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2]"><X size={22} strokeWidth={3} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {shoppingList.length > 0 ? (
                shoppingList.map((item) => (
                  <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className={`w-full border-2 p-5 rounded-[28px] flex items-center justify-between transition-all duration-300 ${item.checked ? 'border-green-500 bg-green-50/50' : 'bg-white border-[#F0E6D2]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-[#F0E6D2] text-transparent'}`}><CheckCircle2 size={16} strokeWidth={3} /></div>
                      <span className={`font-black text-[15px] ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#3D2B1F]'}`}>{item.name}</span>
                    </div>
                    {item.price && <span className="text-[13px] font-black text-[#FF5C00]">¥{item.price}</span>}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-10"><ShoppingCart size={64} className="mb-4" /><p className="font-black text-sm">空空如也萝...</p></div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={clearShoppingList} className="bg-[#B45309]/5 text-[#B45309]/40 py-5 rounded-[28px] font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2">清空清单</button>
              <button onClick={openInventoryModal} disabled={!shoppingList.some(i => i.checked)} className="bg-[#5D3A2F] text-white py-5 rounded-[28px] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">入库并记录</button>
            </div>
          </div>
        </div>
      )}

      {/* 核对清单弹窗 */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex items-end justify-center animate-fade-in p-4 pb-12">
          <div className="bg-[#FEFFF9] w-full max-h-[90%] rounded-[45px] p-8 animate-slide-up flex flex-col border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]"><PackagePlus size={24} className="text-[#FF5C00]" strokeWidth={2.5} /></div>
                <div>
                   <h2 className="text-2xl font-black text-[#3D2B1F] tracking-tight">入库核对</h2>
                   <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest mt-1">Stock Confirmation</p>
                </div>
              </div>
              <button onClick={() => setIsInventoryModalOpen(false)} className="bg-[#FFF9E8] p-3 rounded-xl text-[#B45309]/30"><X size={24} strokeWidth={3} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
              {tempInventoryItems.map((item, idx) => (
                <div key={item.id} className="bg-white border-2 border-[#F0E6D2] p-6 rounded-[32px] space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FFF9E8] rounded-2xl flex items-center justify-center text-[#FF5C00] shadow-inner">{getIcon(item.iconName || 'Utensils', 22)}</div>
                    <span className="text-lg font-black text-[#3D2B1F]">{item.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">单价 ¥</span>
                      <input type="number" className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] rounded-2xl px-5 py-4 font-black text-[#FF5C00] outline-none" value={item.price} onChange={(e) => updateTempItem(idx, { price: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-[#B45309]/40 px-2 uppercase tracking-widest">分量</span>
                      <div className="flex bg-[#FFF9E8]/30 border border-[#F0E6D2] rounded-2xl overflow-hidden">
                        <input type="number" className="w-full bg-transparent border-none px-4 py-4 font-black text-[#3D2B1F] outline-none text-right" value={item.quantity || ''} onChange={(e) => updateTempItem(idx, { quantity: Number(e.target.value) })} />
                        <select className="bg-transparent text-[11px] font-black text-[#FF5C00] px-3 outline-none" value={item.unit} onChange={(e) => updateTempItem(idx, { unit: e.target.value })}>{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={confirmInventoryAddition} className="w-full h-16 bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-lg shadow-xl active:scale-[0.98] transition-all mt-6 border-b-4 border-[#E65100]">确认批量入库</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-short { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .animate-bounce-short { animation: bounce-short 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default RecipeDetail;
