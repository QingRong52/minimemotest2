
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Trash2, ShoppingCart, X, CheckCircle2,
  Utensils, Coffee, Pizza, Soup
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef, LuluCart } from '../components/LuluIcons';

const MEAL_TYPES = {
  breakfast: { label: '早起饮品', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-50' },
  lunch: { label: '元气午餐', icon: Utensils, color: 'text-blue-400', bg: 'bg-blue-50' },
  dinner: { label: '精致晚餐', icon: Pizza, color: 'text-purple-400', bg: 'bg-purple-50' },
  snack: { label: '闲暇加餐', icon: Soup, color: 'text-green-400', bg: 'bg-green-50' },
};

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, mealPlans, removeMealPlan, shoppingList, toggleShoppingItem, clearShoppingList } = useKitchen();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 生成当前周的日期
  const weekDays = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }, []);

  const dayPlans = useMemo(() => mealPlans.filter(p => p.date === selectedDate), [mealPlans, selectedDate]);

  const getRecipe = (id: string) => recipes.find(r => r.id === id);

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="px-6 pt-12 pb-6 shrink-0 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#FFF9E8] rounded-[18px] flex items-center justify-center text-[#FF5C00] shadow-sm border border-[#F0E6D2]">
              <CalendarIcon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[24px] font-black tracking-tighter text-[#5D3A2F] leading-tight">食谱日历</h1>
              <p className="text-[#B45309]/40 text-[10px] font-bold uppercase tracking-wider">Plan Your Taste</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-12 h-12 rounded-[18px] bg-white text-[#FF5C00] border-2 border-[#FF5C00]/10 flex items-center justify-center shadow-lg active:scale-95 transition-all relative"
          >
            <ShoppingCart size={22} strokeWidth={3} />
            {shoppingList.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-[#FF5C00] text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black text-[9px] shadow-sm border border-white">
                {shoppingList.length}
              </div>
            )}
          </button>
        </div>

        {/* 周切换器 */}
        <div className="flex justify-between items-center bg-white p-2 rounded-[30px] border border-[#F0E6D2] shadow-sm">
           {weekDays.map(date => {
             const d = new Date(date);
             const isSelected = selectedDate === date;
             const isToday = new Date().toISOString().split('T')[0] === date;
             return (
               <button 
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center w-12 py-3 rounded-2xl transition-all ${
                  isSelected ? 'bg-[#FF5C00] text-white shadow-lg' : 'hover:bg-[#FFF9E8]'
                }`}
               >
                 <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-white/60' : 'text-[#B45309]/30'}`}>
                    {['日','一','二','三','四','五','六'][d.getDay()]}
                 </span>
                 <span className={`text-base font-black ${isToday && !isSelected ? 'text-[#FF5C00]' : ''}`}>
                    {d.getDate()}
                 </span>
               </button>
             );
           })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-6 pb-40 space-y-8 pt-4">
        {Object.entries(MEAL_TYPES).map(([type, meta]) => {
          const plan = dayPlans.find(p => p.mealType === type);
          const recipe = plan ? getRecipe(plan.recipeId) : null;

          return (
            <div key={type} className="animate-fade-in">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 ${meta.bg} ${meta.color} rounded-lg flex items-center justify-center`}>
                      <meta.icon size={18} strokeWidth={2.5} />
                   </div>
                   <h3 className="text-[#5D3A2F] text-sm font-black">{meta.label}</h3>
                </div>
                {!plan && (
                  <button onClick={() => navigate('/')} className="text-[10px] font-black text-[#FF5C00] bg-[#FFF9E8] px-3 py-1.5 rounded-full">去点单萝</button>
                )}
              </div>

              {recipe ? (
                <div className="bg-white p-4 rounded-[32px] border border-[#F0E6D2] shadow-sm flex items-center justify-between group">
                  <button onClick={() => navigate(`/recipe/${recipe.id}`)} className="flex items-center gap-4 flex-1 text-left">
                    <img src={recipe.image} className="w-16 h-16 rounded-[20px] object-cover" />
                    <div className="min-w-0">
                       <p className="font-black text-[#5D3A2F] text-[16px] truncate">{recipe.name}</p>
                       <p className="text-[10px] font-bold text-[#B45309]/30">秘籍研习中...</p>
                    </div>
                  </button>
                  <button onClick={() => removeMealPlan(plan.id)} className="p-3 text-[#B45309]/10 hover:text-red-500 transition-colors">
                     <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div className="h-20 border-2 border-dashed border-[#F0E6D2] rounded-[30px] flex items-center justify-center opacity-30">
                   <p className="text-[11px] font-black text-[#B45309]">虚位以待</p>
                </div>
              )}
            </div>
          );
        })}

        {dayPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
             <LuluChef size={140} className="mb-4 grayscale" />
             <p className="text-xs font-black text-[#B45309]/40">“这一天，萝萝还没收到旨意萝...”</p>
          </div>
        )}
      </div>

      {/* 待购清单抽屉 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[78%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl relative border-t-8 border-[#FF5C00]/10">
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
                  <button key={item.id} onClick={() => toggleShoppingItem(item.id)} className={`w-full border-2 p-5 rounded-[28px] flex items-center justify-between shadow-sm transition-all duration-300 ${item.checked ? 'border-green-500 bg-green-50/30' : 'bg-white border-[#F0E6D2]'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-green-500 border-green-500 text-white shadow-sm' : 'border-[#F0E6D2] text-transparent'}`}><CheckCircle2 size={16} strokeWidth={3} /></div>
                      <span className={`font-black text-[16px] ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>{item.name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-[#B45309]"><LuluCart size={150} className="mb-4" /><p className="font-black">清单空空萝...</p></div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#FEFFF9] to-transparent grid grid-cols-2 gap-4">
              <button onClick={clearShoppingList} className="bg-[#B45309]/5 text-[#B45309]/40 py-5 rounded-[28px] font-black text-sm active:scale-[0.97] transition-all border border-[#B45309]/5">清空清单</button>
              <button onClick={() => setIsCartOpen(false)} className="bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-sm shadow-xl active:scale-[0.97] transition-all">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
