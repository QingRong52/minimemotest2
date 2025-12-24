
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle, ShoppingCart, ChevronRight } from 'lucide-react';
import { useKitchen } from '../KitchenContext';

const RecipeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ingredients, recipes } = useKitchen();
  const [view, setView] = useState<'checklist' | 'steps'>('checklist');
  const [currentStep, setCurrentStep] = useState(0);

  const recipe = useMemo(() => recipes.find(r => r.id === id), [id, recipes]);

  if (!recipe) return <div className="p-10 text-center font-bold">未找到该食谱</div>;

  // 使用全局库存状态检查
  const checklist = recipe.ingredients.map(ri => {
    const stock = ingredients.find(i => i.id === ri.ingredientId);
    const hasEnough = stock ? (stock.quantity ?? 0) >= ri.amount : false;
    return { ...ri, hasEnough, price: stock?.price || 0 };
  });

  const missingTotal = checklist
    .filter(i => !i.hasEnough)
    .reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="pb-12 px-4">
      {/* 头部海报 */}
      <div className="relative -mx-4 h-80 overflow-hidden rounded-b-[48px]">
        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 glass w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-80 mb-2">{recipe.category}</p>
          <h1 className="text-3xl font-bold mb-1">{recipe.name}</h1>
          <p className="font-medium tracking-wide text-sm">预估成本: {recipe.estimatedCost} 元</p>
        </div>
      </div>

      {/* 切换页签 */}
      <div className="flex gap-2 mt-8 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
        <button 
          onClick={() => setView('checklist')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${view === 'checklist' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}
        >
          食材清单
        </button>
        <button 
          onClick={() => setView('steps')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${view === 'steps' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400'}`}
        >
          烹饪步骤
        </button>
      </div>

      {view === 'checklist' ? (
        <div className="space-y-4 animate-fade-in">
          <div className="grid gap-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[24px] flex items-center justify-between border border-gray-50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.hasEnough ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                    {item.hasEnough ? <Check size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400 font-bold">需要 {item.amount} 克</p>
                  </div>
                </div>
                {!item.hasEnough && <span className="text-sm font-bold text-red-500">+{item.price} 元</span>}
              </div>
            ))}
          </div>

          {missingTotal > 0 && (
            <div className="mt-8 p-8 bg-orange-50 rounded-[40px] border border-orange-100">
              <h3 className="text-orange-800 font-bold mb-2 flex items-center gap-2">
                <ShoppingCart size={20} />
                待购清单
              </h3>
              <p className="text-orange-600 text-sm mb-6">缺额食材预计总价：<span className="font-bold text-lg">{missingTotal} 元</span></p>
              <button className="w-full bg-orange-500 text-white py-5 rounded-[24px] font-bold shadow-xl shadow-orange-100 transition-all hover:bg-orange-600 active:scale-95">
                一键采购并入库
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="flex gap-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
             {recipe.steps.map((_, i) => (
               <div key={i} className={`flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-orange-500' : 'bg-transparent'}`}></div>
             ))}
          </div>

          <div className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-50">
            {recipe.steps[currentStep].image && (
              <img src={recipe.steps[currentStep].image} className="w-full h-64 object-cover" />
            )}
            <div className="p-10">
              <span className="text-orange-500 font-bold text-xs uppercase tracking-[0.2em] mb-3 block">
                STEP {currentStep + 1} / {recipe.steps.length}
              </span>
              <p className="text-gray-800 text-xl font-bold leading-relaxed mb-10">
                {recipe.steps[currentStep].instruction}
              </p>
              
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 py-4 bg-gray-50 rounded-[24px] font-bold text-gray-400 transition-colors hover:bg-gray-100"
                  >
                    上一步
                  </button>
                )}
                <button 
                  onClick={() => currentStep < recipe.steps.length - 1 ? setCurrentStep(prev => prev + 1) : navigate('/finance')}
                  className="flex-[2] bg-orange-500 text-white py-4 rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-100 active:scale-95 transition-all"
                >
                  {currentStep < recipe.steps.length - 1 ? '下一步' : '完成烹饪'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
