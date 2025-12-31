
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Edit3, 
  Star, CalendarPlus, CheckCircle2, X
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef } from '../components/LuluIcons';

const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addToShoppingList, feedbacks, addMealPlan } = useKitchen();

  const [showToast, setShowToast] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const recipe = useMemo(() => recipes.find(r => r.id === id), [id, recipes]);
  const recipeFeedbacks = useMemo(() => feedbacks.filter(f => f.recipeId === id), [id, feedbacks]);

  if (!recipe) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in">
       <LuluChef size={160} className="mb-6 opacity-40 grayscale" />
       <h3 className="text-xl font-black text-[#5D3A2F]">秘籍似乎失传了...</h3>
       <button onClick={() => navigate('/')} className="mt-4 text-[#FF5C00] font-bold">回到书架</button>
    </div>
  );

  const handleAddToCart = () => {
    addToShoppingList(recipe.ingredients.map(i => ({ name: i.name })));
    setShowToast(true);
    setTimeout(() => { setShowToast(false); }, 2000);
  };

  const handleAddToCalendar = () => {
    addMealPlan({ recipeId: recipe.id, date: new Date().toISOString().split('T')[0], mealType: 'dinner' });
    alert('已加入今日晚餐计划萝！');
  };

  return (
    <div className="h-full bg-black flex flex-col relative overflow-hidden animate-fade-in">
      {/* 图片放大预览层 */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-12 right-6 text-white bg-white/10 p-3 rounded-full backdrop-blur-md">
            <X size={24} />
          </button>
          <img src={zoomedImage} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl animate-modal-pop" alt="Zoomed" />
        </div>
      )}

      {/* 顶部导航 */}
      <div className="fixed top-12 left-5 right-5 flex justify-between items-center z-[100]">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 rounded-[16px] bg-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/30"
        >
          <ArrowLeft size={20} strokeWidth={3} />
        </button>
        <div className="flex gap-2">
           <button 
             onClick={handleAddToCalendar} 
             className="w-10 h-10 rounded-[16px] bg-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/30"
           >
             <CalendarPlus size={18} />
           </button>
           <button 
             onClick={() => navigate(`/add-recipe?edit=${recipe.id}`)} 
             className="w-10 h-10 rounded-[16px] bg-white/20 backdrop-blur-xl flex items-center justify-center text-white active:scale-90 transition-all border border-white/30"
           >
             <Edit3 size={18} />
           </button>
        </div>
      </div>

      {/* 沉浸式封面 */}
      <div className="absolute top-0 left-0 w-full h-[55vh] z-0 overflow-hidden cursor-zoom-in" onClick={() => setZoomedImage(recipe.image)}>
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-[45vh] smooth-scroll">
        <div className="bg-[#FEFFF9] rounded-t-[22px] px-6 pt-8 pb-32 space-y-10 shadow-[0_-15px_40px_rgba(0,0,0,0.15)]">
          <section className="animate-slide-up">
            <h1 className="text-[26px] font-black text-[#3D2B1F] leading-tight tracking-tight mb-2">{recipe.name}</h1>
            <div className="w-12 h-1 bg-[#FF5C00] rounded-full opacity-20"></div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#FF5C00] rounded-full"></div>
              <h2 className="text-[#3D2B1F] text-lg font-black tracking-tight">核心食材</h2>
            </div>
            <div className="grid grid-cols-1 gap-y-1">
              {recipe.ingredients.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-dashed border-[#F0E6D2]">
                  <span className="font-bold text-[15px] text-[#3D2B1F]">{item.name}</span>
                  <span className="text-xs font-black text-[#B45309]/50 bg-[#FFF9E8] px-2 py-0.5 rounded-lg">{item.amount}{item.unit || 'g'}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 text-[#FF5C00] font-black text-sm bg-[#FFF9E8] py-4 rounded-[22px] border border-[#F0E6D2] active:scale-[0.98] transition-all mt-4"
            >
              <ShoppingCart size={18} /> 一键同步待购清单
            </button>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#FF5C00] rounded-full"></div>
              <h2 className="text-[#3D2B1F] text-lg font-black tracking-tight">烹饪步法</h2>
            </div>
            <div className="space-y-8">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-[#5D3A2F] text-white text-[10px] font-black rounded-[8px] tracking-widest">STEP {idx + 1}</span>
                     <div className="flex-1 h-[1px] bg-[#F0E6D2]/50"></div>
                  </div>
                  <p className="text-[#3D2B1F] font-bold text-[15px] leading-[1.7] px-1">{step.instruction}</p>
                  {step.image && (
                    <div 
                      className="rounded-[22px] overflow-hidden bg-[#FFF9E8] border border-[#F0E6D2] shadow-sm aspect-video cursor-zoom-in"
                      onClick={() => setZoomedImage(step.image!)}
                    >
                       <img src={step.image} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#FF5C00] rounded-full"></div>
                <h2 className="text-[#3D2B1F] text-lg font-black tracking-tight">御膳心得</h2>
              </div>
              <button 
                onClick={() => navigate(`/recipe/${recipe.id}/add-feedback`)}
                className="text-[#FF5C00] font-black text-xs flex items-center gap-1 bg-[#FFF9E8] px-3 py-1.5 rounded-[12px] border border-[#F0E6D2]"
              >
                + 我也要记
              </button>
            </div>
            <div className="space-y-3">
              {recipeFeedbacks.length > 0 ? recipeFeedbacks.map(f => (
                <div key={f.id} className="bg-white p-4 rounded-[22px] border border-[#F0E6D2] flex gap-4 shadow-sm">
                  {f.image && (
                    <img 
                      src={f.image} 
                      className="w-16 h-16 rounded-[14px] object-cover shrink-0 cursor-zoom-in" 
                      onClick={() => setZoomedImage(f.image!)}
                      alt="Feedback"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-0.5 mb-2">
                      {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= f.rating ? '#FFB800' : 'none'} stroke={s <= f.rating ? '#FFB800' : '#E6E6E6'} />)}
                    </div>
                    <p className="text-[13px] font-bold text-[#5D3A2F] line-clamp-2 leading-snug">{f.content}</p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center bg-[#FFF9E8]/30 rounded-[22px] border border-dashed border-[#F0E6D2]">
                  <p className="text-[11px] font-black text-[#B45309]/30 italic">陛下尚未留下御批萝...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-[#FF5C00] text-white px-6 py-3 rounded-[22px] font-black text-sm shadow-xl flex items-center gap-3 animate-fade-in border border-white/20">
           <CheckCircle2 size={18} /> 食材已加入待购清单！
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
