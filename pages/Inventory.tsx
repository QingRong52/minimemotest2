
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
  
  // 控制状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInventoryCheckOpen, setIsInventoryCheckOpen] = useState(false);
  const [isMagicMatchOpen, setIsMagicMatchOpen] = useState(false);
  const [tempInventoryItems, setTempInventoryItems] = useState<Ingredient[]>([]);

  // 录入表单状态
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newUnit, setNewUnit] = useState('斤');
  const [newIcon, setNewIcon] = useState('Utensils');
  const [newCategory, setNewCategory] = useState<'食材' | '调料'>('食材');

  // 智选匹配逻辑
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
      description: `${newName} (入库)`,
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

  const currentIconOptions = newCategory === '食材' ? INGREDIENT_ICONS : SEASONING_ICONS;

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative">
      {/* 列表视图 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-20 pb-40">
        <header className="mb-8 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#FFF9E8] rounded-[18px] flex items-center justify-center text-[#FF5C00] shadow-sm border border-[#F0E6D2]">
              <Sandwich size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[24px] font-black tracking-tighter text-[#5D3A2F] leading-tight">我的食材库</h1>
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

      {/* 列表页底栏按钮 - 添加食材触发器 */}
      {!isAddModalOpen && (
        <div className="absolute bottom-[96px] left-0 right-0 px-6 flex items-center justify-center gap-[14px] z-50 animate-fade-in">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{ height: '56px', width: '220px' }}
            className="bg-[#FF5C00] text-white flex items-center justify-center gap-3 rounded-[28px] font-black text-lg shadow-xl active:scale-95 transition-all border-b-[5px] border-[#E65100]"
          >
            <ChefHat size={22} strokeWidth={3} /> 添加食材
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-[56px] h-[56px] bg-white text-[#FF5C00] rounded-[28px] flex items-center justify-center border-2 border-[#FF5C00]/10 shadow-lg active:scale-95 transition-all relative"
          >
            <ShoppingCart size={22} strokeWidth={3} />
            {shoppingList.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#FF5C00] text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm">
                {shoppingList.length}
              </div>
            )}
          </button>
        </div>
      )}

      {/* 添加食材弹窗 - 严格按照要求尺寸 418*610px 且占 75% 高度 */}
      {isAddModalOpen && (
        <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-xl flex items-end justify-center animate-fade-in">
          <div 
            style={{ width: '418px', height: '610px', maxHeight: '75%' }}
            className="bg-[#FEFFF9] max-w-full rounded-t-[50px] animate-slide-up flex flex-col shadow-[0_-20px_100px_rgba(0,0,0,0.3)] relative overflow-hidden border-t border-white/40"
          >
            
            {/* 顶部指示条 */}
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mt-4 shrink-0"></div>

            <header className="px-8 pt-6 pb-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <ChefHat size={26} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-[22px] font-black text-[#5D3A2F] leading-none">添加新食材</h2>
                  <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-[0.2em] mt-1.5">New Ingredient</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2]"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-32 space-y-8">
              {/* 分类切换 */}
              <div className="p-1 bg-[#FFF9E8] rounded-2xl flex border border-[#F0E6D2]/50 shadow-inner">
                <button 
                  onClick={() => { setNewCategory('食材'); setNewIcon('Utensils'); }} 
                  className={`flex-1 py-4 rounded-xl font-black text-sm transition-all duration-300 ${newCategory === '食材' ? 'bg-white text-[#FF5C00] shadow-md scale-[1.02]' : 'text-[#B45309]/30'}`}
                >
                  主战食材
                </button>
                <button 
                  onClick={() => { setNewCategory('调料'); setNewIcon('Flame'); }} 
                  className={`flex-1 py-4 rounded-xl font-black text-sm transition-all duration-300 ${newCategory === '调料' ? 'bg-white text-[#FF5C00] shadow-md scale-[1.02]' : 'text-[#B45309]/30'}`}
                >
                  必备调料
                </button>
              </div>

              {/* 名称输入 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-[0.25em] px-2 block">名称</label>
                <div className="relative group">
                  <input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    placeholder="例如：极品五花肉..." 
                    className="w-full bg-white border-2 border-[#F0E6D2] focus:border-[#FF5C00] focus:ring-4 focus:ring-[#FF5C00]/10 px-6 py-6 rounded-[28px] font-black text-lg text-[#5D3A2F] outline-none shadow-sm transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20"><Edit3 size={20} className="text-[#5D3A2F]" /></div>
                </div>
              </div>

              {/* 价格与分量 */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-[0.25em] px-2 block">单价 (¥)</label>
                  <input 
                    type="number" 
                    value={newPrice} 
                    onChange={e => setNewPrice(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full bg-white border-2 border-[#F0E6D2] px-6 py-4 rounded-2xl font-black text-[#FF5C00] text-xl outline-none shadow-sm focus:border-[#FF5C00]" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-[0.25em] px-2 block">单位分量</label>
                  <div className="flex border-2 border-[#F0E6D2] rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-[#FF5C00]">
                    <input 
                      type="number" 
                      value={newQuantity} 
                      onChange={e => setNewQuantity(e.target.value)} 
                      className="w-full bg-transparent px-4 py-4 font-black text-lg text-[#5D3A2F] outline-none text-right" 
                    />
                    <select 
                      value={newUnit} 
                      onChange={e => setNewUnit(e.target.value)} 
                      className="bg-transparent font-black text-xs text-[#FF5C00] px-3 outline-none"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 图标选择 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-[0.25em] px-2 block">图标</label>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2">
                  {currentIconOptions.map(icon => (
                    <button 
                      key={icon} 
                      onClick={() => setNewIcon(icon)} 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 border-2 ${newIcon === icon ? 'bg-[#FF5C00] text-white border-[#FF5C00] shadow-lg scale-110' : 'bg-white border-[#F0E6D2] text-[#B45309]/20 hover:border-[#FF5C00]/30'}`}
                    >
                      {getIcon(icon, 24)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 装饰卡片 */}
              <div className="bg-[#FFF9E8] border border-[#F0E6D2] p-6 rounded-[35px] flex items-center gap-5 shadow-sm mb-6">
                <LuluChef size={65} className="shrink-0" />
                <p className="text-[12px] font-bold text-[#5D3A2F] leading-relaxed">“每一分入库记录，<br/>都是对美味的极致规划萝！”</p>
              </div>
            </div>

            {/* 提交按钮区域 - 确保不含底部图标栏 */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FEFFF9] to-transparent shrink-0">
              <button 
                onClick={handleAddIngredient} 
                className="w-full h-16 bg-[#FF5C00] text-white rounded-[28px] font-black text-lg shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-b-4 border-[#E65100]"
              >
                <Check size={26} strokeWidth={3} /> 现在录入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 其他业务弹窗保持原有逻辑 */}
      {isMagicMatchOpen && (
        <div className="absolute inset-0 z-[2100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[82%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <Sparkles size={24} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#5D3A2F] tracking-tight leading-none">智选匹配</h2>
                  <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-[0.2em] mt-1.5">Recipe Matching</p>
                </div>
              </div>
              <button onClick={() => setIsMagicMatchOpen(false)} className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"><X size={20} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {matchedRecipes.length > 0 ? (
                matchedRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-80 text-[#B45309]">
                  <LuluSearch size={140} className="mb-4" />
                  <p className="font-black text-sm opacity-40">“库存见底，萝萝也难为无米之炊...”</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="absolute inset-0 z-[2100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[78%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl relative border-t-8 border-[#FF5C00]/10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <ShoppingCart size={24} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#5D3A2F] tracking-tight leading-none">待购清单</h2>
                  <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-[0.2em] mt-1.5">Shopping List</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-[#FFF9E8] p-3 rounded-xl text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"><X size={20} strokeWidth={3} /></button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {shoppingList.length > 0 ? (
                shoppingList.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => toggleShoppingItem(item.id)}
                    className={`w-full border-2 p-5 rounded-[28px] flex items-center justify-between shadow-sm transition-all duration-300 ${
                      item.checked ? 'border-green-500 bg-green-50/30' : 'bg-white border-[#F0E6D2]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.checked ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-[#F0E6D2] text-transparent'
                      }`}>
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </div>
                      <span className={`font-black text-[16px] transition-all ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>
                        {item.name}
                      </span>
                    </div>
                    {item.price && <span className="text-[13px] font-black text-[#FF5C00]">¥{item.price}</span>}
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-80 text-[#B45309]">
                  <LuluCart size={150} className="mb-4" />
                  <p className="text-[13px] font-black opacity-30">“背筐已空，萝萝还没想好买什么...”</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={clearShoppingList} className="bg-[#B45309]/5 text-[#B45309]/40 py-5 rounded-[28px] font-black text-[15px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all border border-[#B45309]/5">
                <Trash2 size={18} /> 清空清单
              </button>
              <button onClick={() => {
                const bought = shoppingList.filter(item => item.checked);
                if (bought.length > 0) {
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
                }
              }} disabled={!shoppingList.some(i => i.checked)} className="bg-[#5D3A2F] text-white py-5 rounded-[28px] font-black text-[15px] shadow-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-30 disabled:grayscale">
                <PackagePlus size={18} /> 核对并入库
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Inventory;
