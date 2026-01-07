
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Trash2, ShoppingCart, X, CheckCircle2,
  Utensils, Coffee, Pizza, Soup, BookOpen, Plus, ChevronRight
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef, LuluSearch } from '../components/LuluIcons';

const MEAL_TYPES = {
  breakfast: { label: '晨起', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-50' },
  lunch: { label: '午膳', icon: Utensils, color: 'text-blue-400', bg: 'bg-blue-50' },
  dinner: { label: '晚宴', icon: Pizza, color: 'text-purple-400', bg: 'bg-purple-50' },
};

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, mealPlans, removeMealPlan, feedbacks, addMealPlan } = useKitchen();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPickingRecipe, setIsPickingRecipe] = useState(false);
  const [pickingMealType, setPickingMealType] = useState<string | null>(null);

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

  const handleOpenPicker = (type: string) => {
    setPickingMealType(type);
    setIsPickingRecipe(true);
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (pickingMealType) {
      addMealPlan({
        recipeId,
        date: selectedDate,
        mealType: pickingMealType as any
      });
      setIsPickingRecipe(false);
      setPickingMealType(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="px-6 pt-12 pb-4 shrink-0 bg-white/95 backdrop-blur-md border-b border-[#F0E6D2]/40 z-[100] sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5C00] rounded-2xl flex items-center justify-center text-white shadow-lg">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h1 className="text-[20px] font-black tracking-tighter text-[#5D3A2F]">食谱日历</h1>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/journal')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#F0E6D2] shadow-sm active:scale-95 transition-all"
          >
            <BookOpen size={16} className="text-[#FF5C00]" />
            <span className="text-xs font-black text-[#5D3A2F]">御膳食报</span>
            {feedbacks.length > 0 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
          </button>
        </div>

        <div className="flex justify-between items-center bg-white p-1.5 rounded-[22px] border border-[#F0E6D2] shadow-sm">
           {weekDays.map(date => {
             const d = new Date(date);
             const isSelected = selectedDate === date;
             const isToday = new Date().toISOString().split('T')[0] === date;
             return (
               <button 
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center w-11 py-2 rounded-xl transition-all ${
                  isSelected ? 'bg-[#FF5C00] text-white shadow-md' : 'text-[#B45309]/40'
                }`}
               >
                 <span className="text-[9px] font-bold uppercase mb-0.5">{['日','一','二','三','四','五','六'][d.getDay()]}</span>
                 <span className={`text-[15px] font-black ${isToday && !isSelected ? 'text-[#FF5C00]' : ''}`}>{d.getDate()}</span>
               </button>
             );
           })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-6 pt-6 pb-40 space-y-10 relative z-10">
        {Object.entries(MEAL_TYPES).map(([type, meta]) => {
          const currentTypePlans = dayPlans.filter(p => p.mealType === type);

          return (
            <div key={type} className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${meta.bg} ${meta.color} rounded-lg flex items-center justify-center`}>
                    <meta.icon size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-black text-[#5D3A2F] text-[15px]">{meta.label}</h3>
                </div>
                {currentTypePlans.length > 0 && (
                  <button 
                    onClick={() => handleOpenPicker(type)}
                    className="p-1.5 bg-[#FFF9E8] rounded-lg text-[#FF5C00] active:scale-90"
                  >
                    <Plus size={16} strokeWidth={3} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {currentTypePlans.length > 0 ? (
                  currentTypePlans.map((plan) => {
                    const recipe = getRecipe(plan.recipeId);
                    if (!recipe) return null;
                    return (
                      <div 
                        key={plan.id} 
                        className="bg-white p-3 rounded-[24px] border border-[#F0E6D2] shadow-sm flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-transform"
                      >
                        <div 
                          className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-[#F0E6D2] shrink-0"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <img src={recipe.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                          <p className="font-black text-[#5D3A2F] text-[15px] truncate pr-2">{recipe.name}</p>
                          <div className="flex items-center gap-1.5 opacity-30 mt-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest">查看秘籍</span>
                            <ChevronRight size={10} />
                          </div>
                        </div>
                        <button 
                          onClick={() => removeMealPlan(plan.id)} 
                          className="w-10 h-10 flex items-center justify-center text-[#B45309]/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <button 
                    onClick={() => handleOpenPicker(type)}
                    className="w-full bg-[#FEFFF9] border-2 border-dashed border-[#F0E6D2] rounded-[24px] py-6 flex flex-col items-center justify-center gap-2 active:bg-[#FFF9E8] transition-all group"
                  >
                    <div className="w-10 h-10 bg-white border border-[#F0E6D2] rounded-full flex items-center justify-center text-[#FF5C00] group-active:scale-90 transition-transform">
                      <Plus size={18} strokeWidth={3} />
                    </div>
                    <p className="text-[12px] font-black text-[#B45309]/30">陛下，{meta.label}吃点啥萝？</p>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 选菜抽屉 */}
      {isPickingRecipe && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xl flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[75%] rounded-t-[22px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="w-14 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-8 shrink-0"></div>
            <div className="flex justify-between items-center mb-6 px-2">
               <h2 className="text-xl font-black text-[#5D3A2F]">选择秘籍</h2>
               <button onClick={() => setIsPickingRecipe(false)} className="bg-[#FFF9E8] p-2 rounded-xl text-[#FF5C00]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-10">
              {recipes.length > 0 ? (
                recipes.map(r => (
                  <button 
                    key={r.id}
                    onClick={() => handleSelectRecipe(r.id)}
                    className="w-full bg-white border border-[#F0E6D2] p-3 rounded-[22px] flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm"
                  >
                    <img src={r.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <span className="font-black text-[#5D3A2F]">{r.name}</span>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center py-20 opacity-30">
                  <LuluSearch size={120} />
                  <p className="font-bold text-sm">还没有秘籍，快去添加吧</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-[100px] right-6 z-50">
        <button 
          onClick={() => navigate('/shopping-list')}
          className="w-14 h-14 rounded-full bg-white border-2 border-[#F0E6D2] text-[#FF5C00] shadow-xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <ShoppingCart size={24} />
        </button>
      </div>
    </div>
  );
};

export default Calendar;
