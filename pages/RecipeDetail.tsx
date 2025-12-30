
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Edit3, X, 
  ChefHat, Star, MessageSquare, Send, CalendarPlus, CheckCircle2
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef, LuluCart } from '../components/LuluIcons';

const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addToShoppingList, shoppingList, feedbacks, addFeedback, addMealPlan, toggleShoppingItem, clearShoppingList } = useKitchen();

  const [isCartBumping, setIsCartBumping] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showToast, setShowToast] = useState(false);

  const recipe = useMemo(() => recipes.find(r => r.id === id), [id, recipes]);
  const recipeFeedbacks = useMemo(() => feedbacks.filter(f => f.recipeId === id), [id, feedbacks]);

  if (!recipe) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in">
       <LuluChef size={160} className="mb-6 opacity-40 grayscale" />
       <h3 className="text-xl font-black text-[#5D3A2F]">秘籍似乎失传了...</h3>
       <button onClick={() => navigate('/')} className="mt-4 text-[#FF5C00] font-bold">回到书架</button>
    </div>
  );

  const checklist = recipe.ingredients.map(ri => ({ ...ri, unit: ri.unit || 'g' }));

  const handleAddToCart = () => {
    addToShoppingList(checklist.map(i => ({ name: i.name })));
    setIsCartBumping(true);
    setShowToast(true);
    setTimeout(() => {
      setIsCartBumping(false);
      setShowToast(false);
    }, 2000);
  };

  const handleSubmitFeedback = () => {
    if(!comment.trim()) return;
    addFeedback({
      recipeId: recipe.id,
      date: new Date().toISOString().split('T')[0],
      rating,
      content: comment
    });
    setIsFeedbackModalOpen(false);
    setComment('');
  };

  const handleAddToCalendar = () => {
    const today = new Date().toISOString().split('T')[0];
    addMealPlan({
      recipeId: recipe.id,
      date: today,
      mealType: 'dinner'
    });
    alert('已加入今日晚餐计划萝！');
  };

  return (
    <div className="h-full bg-[#FEFFF9] flex flex-col relative overflow-hidden animate-fade-in">
      <div className="fixed top-12 left-6 right-6 flex justify-between items-center z-[100]">
        <button onClick={() => navigate('/')} className="w-12 h-12 rounded-[20px] bg-white/90 backdrop-blur-2xl border border-white flex items-center justify-center text-[#FF5C00] shadow-sm active:scale-90 transition-all"><ArrowLeft size={22} strokeWidth={3} /></button>
        <div className="flex gap-2">
           <button onClick={handleAddToCalendar} className="w-12 h-12 rounded-[20px] bg-white/90 backdrop-blur-2xl border border-white flex items-center justify-center text-[#FF5C00] shadow-sm active:scale-90 transition-all"><CalendarPlus size={20} strokeWidth={2.5} /></button>
           <button onClick={() => navigate(`/add-recipe?edit=${recipe.id}`)} className="w-12 h-12 rounded-[20px] bg-white/90 backdrop-blur-2xl border border-white flex items-center justify-center text-[#FF5C00] shadow-sm active:scale-90 transition-all"><Edit3 size={20} strokeWidth={2.5} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-44">
        <div className="relative h-[45vh] w-full overflow-hidden">
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FEFFF9]"></div>
          <div className="absolute bottom-8 left-8 right-8 animate-slide-up">
            <h1 className="text-[32px] font-black text-[#3D2B1F] leading-[1.2] tracking-tight mb-4 drop-shadow-sm">{recipe.name}</h1>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm inline-flex">
              <ChefHat size={16} className="text-[#FF5C00]" />
              <span className="text-[13px] font-black text-[#3D2B1F]">{recipe.category}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 space-y-12">
          <section className="space-y-6">
            <div className="px-1">
              <h2 className="text-[#3D2B1F] text-2xl font-black tracking-tight">食材清单</h2>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className="w-3 h-1 rounded-full bg-[#FF5C00]"></div>
                 <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">Ingredients List</p>
              </div>
            </div>
            <div className="grid gap-3">
              {checklist.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#F0E6D2] p-4 rounded-[26px] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-[#FFF9E8] text-[#FF5C00] flex items-center justify-center font-black">
                       {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-[16px] text-[#3D2B1F]">{item.name}</p>
                      <p className="text-[11px] font-bold text-[#B45309]/30">分量：{item.amount}{item.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddToCart} 
              className="w-full bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-base flex items-center justify-center gap-3 shadow-2xl active:scale-[0.97] transition-all relative overflow-hidden group"
            >
              <ShoppingCart size={20} strokeWidth={3} />
              <span>补齐食材进入清单</span>
            </button>
          </section>

          <section className="space-y-10">
            <div className="px-1">
              <h2 className="text-[#3D2B1F] text-2xl font-black tracking-tight">独门步法</h2>
              <div className="flex items-center gap-1.5 mt-1">
                 <div className="w-3 h-1 rounded-full bg-[#3D2B1F]"></div>
                 <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">Step-by-Step</p>
              </div>
            </div>
            <div className="space-y-12 relative pb-10">
              <div className="absolute left-[24px] top-10 bottom-10 w-[1px] bg-gradient-to-b from-[#F0E6D2] to-transparent"></div>
              {recipe.steps.map((step, idx) => {
                const isImageOnly = step.image && !step.instruction;
                return (
                  <div key={idx} className="flex flex-col gap-4 relative">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-[#3D2B1F] text-white flex items-center justify-center font-black text-[14px] rounded-2xl border-4 border-white shadow-md z-10 shrink-0">{idx + 1}</div>
                       {!isImageOnly && <p className="text-[#3D2B1F] font-bold text-[15px] leading-[1.6]">{step.instruction}</p>}
                    </div>
                    {step.image && (
                      <div 
                        onClick={() => setZoomedImage(step.image!)}
                        className={`rounded-[32px] overflow-hidden bg-[#FFF9E8] border-2 border-white shadow-sm cursor-zoom-in ml-16 ${isImageOnly ? 'aspect-square' : 'aspect-video'}`}
                      >
                         <img src={step.image} className="w-full h-full object-cover" alt={`Step ${idx+1}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {recipeFeedbacks.length > 0 && (
            <section className="space-y-6 pb-20">
              <div className="px-1">
                <h2 className="text-[#3D2B1F] text-2xl font-black tracking-tight">陛下御批</h2>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="w-3 h-1 rounded-full bg-yellow-400"></div>
                   <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">Feedbacks</p>
                </div>
              </div>
              <div className="space-y-4">
                {recipeFeedbacks.map(f => (
                  <div key={f.id} className="bg-white p-5 rounded-[30px] border border-[#F0E6D2] shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= f.rating ? '#FFB800' : 'none'} stroke={s <= f.rating ? '#FFB800' : '#E6E6E6'} />)}
                      </div>
                      <span className="text-[10px] font-black text-[#B45309]/20">{f.date}</span>
                    </div>
                    <p className="text-sm font-bold text-[#5D3A2F] leading-relaxed">{f.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 left-6 right-6 flex gap-4 z-[110]">
        <button 
          onClick={() => setIsFeedbackModalOpen(true)}
          className="flex-1 bg-white text-[#FF5C00] py-5 rounded-[28px] font-black text-base flex items-center justify-center gap-3 shadow-xl border-2 border-[#FF5C00]/10 active:scale-[0.97] transition-all"
        >
          <MessageSquare size={20} strokeWidth={3} />
          点评心得
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className={`w-16 h-16 bg-[#FF5C00] rounded-[24px] flex items-center justify-center text-white shadow-2xl border-b-[6px] border-[#E65100] transition-all ${isCartBumping ? 'animate-bounce-short scale-110' : 'active:scale-90'}`}
        >
          <div className="relative">
            <ShoppingCart size={28} strokeWidth={3} />
            {shoppingList.length > 0 && <div className="absolute -top-2 -right-2 bg-white text-[#FF5C00] min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center font-black text-[11px] border-2 border-[#FF5C00] shadow-sm">{shoppingList.length}</div>}
          </div>
        </button>
      </div>

      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] bg-black/70 backdrop-blur-md text-white px-8 py-4 rounded-[30px] font-black flex items-center gap-3 animate-fade-in pointer-events-none">
           <CheckCircle2 size={24} className="text-[#FF5C00]" />
           食材已加入待购清单萝！
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomedImage(null)}>
           <img src={zoomedImage} className="max-w-full max-h-full rounded-[40px] shadow-2xl animate-scale-up" />
           <button className="absolute top-12 right-6 text-white bg-white/10 p-4 rounded-full"><X size={24} /></button>
        </div>
      )}

      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] rounded-t-[50px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-6 shrink-0"></div>
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-[#5D3A2F]">烹饪心得</h2>
               <button onClick={() => setIsFeedbackModalOpen(false)} className="p-2 text-[#FF5C00]"><X size={24} /></button>
            </div>
            <div className="space-y-6 mb-10">
              <div className="flex justify-center gap-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="active:scale-125 transition-transform">
                    <Star size={36} fill={s <= rating ? '#FFB800' : 'none'} stroke={s <= rating ? '#FFB800' : '#E6E6E6'} strokeWidth={2.5} />
                  </button>
                ))}
              </div>
              <textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="这一锅的奥义在哪里萝？记录下你的心得吧..."
                className="w-full h-40 bg-[#FFF9E8]/30 border-2 border-[#F0E6D2] rounded-[30px] p-6 font-bold text-[#5D3A2F] outline-none"
              />
            </div>
            <button 
              onClick={handleSubmitFeedback}
              className="w-full bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-lg shadow-xl active:scale-95 transition-all border-b-6 border-[#E65100] flex items-center justify-center gap-3"
            >
              <Send size={20} /> 发布点评
            </button>
          </div>
        </div>
      )}

      {/* 待购清单抽屉 */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[78%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl relative border-t-8 border-[#FF5C00]/10">
            <div className="flex justify-between items-center mb-8 shrink-0 text-[#5D3A2F]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]"><ShoppingCart size={24} className="text-[#FF5C00]" strokeWidth={2.5} /></div>
                <h2 className="text-2xl font-black">待购清单</h2>
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

export default RecipeDetail;
