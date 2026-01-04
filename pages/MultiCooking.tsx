
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, X, ChefHat, 
  Loader2, ShoppingCart, ArrowRight, Layers, Play
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';

const MultiCooking: React.FC = () => {
  const navigate = useNavigate();
  const { cookingQueue, recipes, clearQueue, addExpense, addToShoppingList, addMealPlan } = useKitchen();
  const [isFinishing, setIsFinishing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{ show: boolean, type: 'sync' | 'finish' }>({ show: false, type: 'finish' });
  
  const queuedRecipes = useMemo(() => recipes.filter(r => cookingQueue.includes(r.id)), [cookingQueue, recipes]);

  // 核心体验修复：弹窗开启时禁用背景滚动
  useEffect(() => {
    if (successModal.show || zoomedImage) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [successModal.show, zoomedImage]);

  const aggregatedIngredients = useMemo(() => {
    const map = new Map<string, { amount: number, unit: string }>();
    queuedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const existing = map.get(ing.name);
        if (existing) {
          existing.amount += ing.amount;
        } else {
          map.set(ing.name, { amount: ing.amount, unit: (ing as any).unit || 'g' });
        }
      });
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [queuedRecipes]);

  if (queuedRecipes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center animate-fade-in bg-[#FEFFF9]">
         <div className="w-24 h-24 bg-[#FFF9E8] rounded-full flex items-center justify-center mb-6 border border-[#F0E6D2]">
           <ChefHat size={48} className="text-[#FF5C00]/20" />
         </div>
         <h3 className="text-xl font-black text-[#5D3A2F]">御膳房现已收工...</h3>
         <button onClick={() => navigate('/')} className="mt-6 px-8 py-3 bg-[#FF5C00] text-white rounded-full font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all">回到书架</button>
      </div>
    );
  }

  const handleSyncToShoppingList = () => {
    const items = aggregatedIngredients.map(ing => ({ name: ing.name }));
    addToShoppingList(items);
    setSuccessModal({ show: true, type: 'sync' });
  };

  const handleFinish = () => {
    setIsFinishing(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nowTime = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const hour = now.getHours();
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner';
    if (hour < 10) mealType = 'breakfast';
    else if (hour < 15) mealType = 'lunch';
    else if (hour < 21) mealType = 'dinner';
    else mealType = 'snack';

    // 核心修复：确保队列中每一道菜都录入日历
    queuedRecipes.forEach(item => {
      addExpense({
        date: today,
        time: nowTime,
        amount: 0,
        type: 'cooking',
        description: `烹饪完成: ${item.name}`,
        icon: 'ChefHat'
      });
      addMealPlan({ recipeId: item.id, date: today, mealType: mealType });
    });

    setTimeout(() => {
      clearQueue();
      setIsFinishing(false);
      setSuccessModal({ show: true, type: 'finish' });
    }, 1200);
  };

  return (
    <div className="h-full bg-[#FEFFF9] flex flex-col overflow-hidden animate-fade-in relative">
      {/* 图片放大 Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-12 right-6 text-white bg-white/10 p-3 rounded-full backdrop-blur-md"><X size={24} /></button>
          <img src={zoomedImage} className="max-w-[90vw] max-h-[80vh] rounded-3xl shadow-2xl animate-modal-pop object-contain" alt="Zoomed" />
        </div>
      )}

      {/* 成功结算 Modal */}
      {successModal.show && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-xl flex items-center justify-center px-8 animate-fade-in"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <div className="bg-white rounded-[44px] w-full max-w-[340px] p-10 shadow-2xl border border-white/20 flex flex-col items-center text-center animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-sm ${successModal.type === 'sync' ? 'bg-orange-50 text-[#FF5C00]' : 'bg-green-50 text-green-500'}`}>
              {successModal.type === 'sync' ? <ShoppingCart size={40} strokeWidth={2.5} /> : <CheckCircle2 size={40} strokeWidth={2.5} />}
            </div>
            <h3 className="text-[24px] font-black text-[#5D3A2F] mb-3 tracking-tighter leading-tight">
              {successModal.type === 'sync' ? '备餐清单已生成！' : '烹饪大赏圆满成功！'}
            </h3>
            <p className="text-[14px] font-bold text-[#B45309]/50 mb-10 leading-relaxed px-2">
              {successModal.type === 'sync' 
                ? '陛下，所有缺少的食材已为您列入购物车，准备微服私访菜市场萝！'
                : '陛下，所有秘籍已同步至日历，新的厨神传说已经开启萝！'}
            </p>
            <div className="w-full space-y-4">
              <button onClick={() => navigate(successModal.type === 'sync' ? '/shopping-list' : '/calendar')} className="w-full py-5 bg-[#FF5C00] text-white rounded-[28px] font-black text-[17px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-6 border-[#E65100]">
                {successModal.type === 'sync' ? '前往购物车清单' : '前往日历查阅'} <ArrowRight size={20} />
              </button>
              <button onClick={() => { setSuccessModal({ ...successModal, show: false }); if(successModal.type === 'finish') navigate('/'); }} className="w-full py-4 text-[#B45309]/30 font-black text-[14px] active:text-[#FF5C00]">
                {successModal.type === 'sync' ? '留在此页' : '回到书架'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 核心修复：提升 Header 层级，确保在移动端点击有效 */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-[#F0E6D2] shrink-0 z-[100] sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 border border-[#F0E6D2] shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-[18px] font-black text-[#5D3A2F]">并行御膳房</h2>
            <p className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest mt-0.5">Cooking Live</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FFF9E8] rounded-full border border-[#F0E6D2]">
          <span className="text-[10px] font-black text-[#FF5C00]">{queuedRecipes.length} 道秘籍</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-6 py-6 pb-48 space-y-12 relative z-10">
        {/* 全员备菜预览 - 纯净大图 */}
        <section className="space-y-5">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
            <h3 className="text-[#B45309]/60 text-[12px] font-black tracking-widest uppercase">全员备菜预览</h3>
          </div>
          <div className={`grid gap-4 ${queuedRecipes.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {queuedRecipes.map((recipe) => (
              <div key={recipe.id} className="relative group animate-fade-in">
                <div 
                  className="w-full aspect-[3/4] bg-white border-2 border-[#F0E6D2] rounded-[36px] overflow-hidden shadow-lg relative cursor-zoom-in active:scale-[0.98] transition-all duration-300"
                  onClick={() => recipe.prepImage && setZoomedImage(recipe.prepImage)}
                >
                  {recipe.prepImage ? (
                    <img src={recipe.prepImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#B45309]/10 bg-[#FFF9E8]/30">
                      <Layers size={56} strokeWidth={1} />
                      <span className="text-[11px] font-black mt-3 opacity-30">待补齐备菜图</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 全食材大集结 */}
        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
              <h3 className="text-[#B45309]/60 text-[12px] font-black tracking-widest uppercase">全食材大集结</h3>
            </div>
            <button 
              onClick={handleSyncToShoppingList} 
              className="flex items-center gap-2 bg-[#FFF9E8] border border-[#F0E6D2] px-4 py-2 rounded-2xl text-[#FF5C00] shadow-sm active:scale-95 transition-all"
            >
              <ShoppingCart size={15} strokeWidth={2.5} />
              <span className="text-[10px] font-black">同步采购清单</span>
            </button>
          </div>
          
          <div className="bg-white border-2 border-[#F0E6D2] rounded-[40px] p-7 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {aggregatedIngredients.map((ing, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#FFF9E8]/80 border border-[#F0E6D2]/60 rounded-full pl-5 pr-3 py-3 flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-[14px] font-black text-[#5D3A2F]">{ing.name}</span>
                  <div className="flex items-center bg-[#FF5C00] px-2.5 py-1 rounded-full shadow-sm">
                    <span className="text-[10px] font-black text-white">{ing.amount}{ing.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 步骤总览 */}
        <section className="space-y-8 pb-10">
           <div className="flex items-center gap-2 px-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
             <h3 className="text-[#B45309]/60 text-[12px] font-black tracking-widest uppercase">并行步法总览</h3>
           </div>
           <div className="space-y-20">
            {queuedRecipes.map((recipe, rIdx) => (
              <div key={recipe.id} className="space-y-8 relative">
                <div className="absolute -top-12 -left-3 text-[100px] font-black text-[#F0E6D2]/20 select-none pointer-events-none">
                  {String(rIdx + 1).padStart(2, '0')}
                </div>
                
                <div className="flex items-center gap-5 px-1 relative z-10">
                   <div className="w-20 h-20 rounded-[28px] overflow-hidden shadow-xl border-2 border-white shrink-0">
                     <img src={recipe.image} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-black text-[#5D3A2F] text-[20px] truncate tracking-tight">{recipe.name}</h4>
                     <p className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <span className="w-2 h-2 bg-[#FF5C00] rounded-full animate-pulse"></span>
                       Active Cooking Flow
                     </p>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                  {recipe.steps.map((step, sIdx) => (
                    <div key={sIdx} className="bg-white p-7 rounded-[36px] border-2 border-[#F0E6D2] shadow-sm flex flex-col gap-5 active:scale-[0.99] transition-transform">
                       <div className="flex items-center gap-4">
                          <span className="px-4 py-1.5 bg-[#5D3A2F] text-white rounded-xl font-black text-[11px] tracking-widest">STEP {sIdx + 1}</span>
                          <div className="flex-1 h-[1px] bg-[#F0E6D2]/60"></div>
                       </div>
                       <p className="text-[16px] font-bold text-[#5D3A2F] leading-relaxed px-1">{step.instruction}</p>
                       {step.image && (
                         <div className="rounded-[28px] overflow-hidden border border-[#F0E6D2] aspect-video cursor-zoom-in" onClick={() => setZoomedImage(step.image!)}>
                           <img src={step.image} className="w-full h-full object-cover" alt="" />
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 底部固定结算按钮 - 确保点击穿透正确 */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pb-[calc(env(safe-area-inset-bottom)+24px)] bg-gradient-to-t from-[#FEFFF9] via-[#FEFFF9]/90 to-transparent shrink-0 z-[90] pointer-events-none">
        <button 
          onClick={handleFinish}
          disabled={isFinishing}
          className="w-full bg-[#FF5C00] text-white py-6 rounded-[32px] font-black text-xl shadow-2xl active:scale-[0.98] transition-all border-b-6 border-[#E65100] flex flex-col items-center justify-center gap-1 pointer-events-auto"
        >
          {isFinishing ? (
            <div className="flex items-center gap-4">
              <Loader2 size={28} className="animate-spin text-white/50" />
              <span>录入成果中...</span>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Play size={28} fill="currentColor" className="text-white" />
              <span>烹饪大赏圆满结束</span>
            </div>
          )}
        </button>
      </div>

      <style>{`
        .border-b-6 { border-bottom-width: 6px; }
        @keyframes modal-pop { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-modal-pop { animation: modal-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default MultiCooking;
