
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CookingPot, X, Heart, Trash2, Info } from 'lucide-react';
import { Recipe } from '../types';
import { useKitchen } from '../KitchenContext';
import { LuluScared } from './LuluIcons';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { addToQueue, deleteRecipe } = useKitchen();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteRecipe(recipe.id);
    setShowConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    addToQueue(recipe.id);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <>
      <div className={`bg-[#FFF9E8] rounded-[22px] p-3 flex gap-3 items-center shadow-sm transition-all border-[1.5px] border-[#FBF4E4] relative group ${
        isAnimating ? 'scale-[0.97] bg-[#FF9A2E]/5 ring-2 ring-[#FF9A2E]/20' : 'active:scale-[0.98]'
      }`}>
        
        {/* 幽灵式删除按钮 */}
        <button 
          type="button"
          onClick={handleDeleteClick}
          className="absolute -top-1 -right-1 w-7 h-7 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-[#B45309]/20 hover:text-red-500 hover:bg-white transition-all z-[10] border border-[#FBF4E4] opacity-0 group-hover:opacity-100"
        >
          <X size={12} strokeWidth={3} />
        </button>

        {/* 左侧图片 */}
        <Link 
          to={`/recipe/${recipe.id}`} 
          className="shrink-0 w-[90px] h-[90px] rounded-[18px] overflow-hidden shadow-sm bg-white/40"
        >
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </Link>
        
        {/* 右侧内容 */}
        <div className="flex-1 flex flex-col justify-between py-0.5 h-[90px]">
          <div>
            <h3 className="text-[#5D3A2F] text-[15px] font-black leading-tight truncate pr-4 mb-1">
              {recipe.name}
            </h3>
            <p className="text-[#B45309]/50 text-[11px] font-medium leading-relaxed line-clamp-2">
              食材：{recipe.ingredients.length > 0 ? recipe.ingredients.map(i => i.name).join('、') : '精心挑选的特级食材'}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[#FF5C00] text-[10px] font-black">¥</span>
              <span className="text-[#FF5C00] text-[16px] font-black tracking-tighter">
                {recipe.estimatedCost}
              </span>
            </div>
            
            <button 
              type="button"
              onClick={handleAddToQueue}
              className={`flex items-center justify-center w-10 h-10 bg-[#FF9A2E] text-white rounded-full shadow-[0_3px_8px_rgba(255,154,46,0.3)] transition-all ${
                isAnimating ? 'animate-bounce-short' : 'active:scale-90'
              }`}
            >
              <CookingPot size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 确认弹窗：极致沉浸黑色全屏遮罩 (强制覆盖底栏和烹饪锅) */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[12px] animate-fade-in px-10"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-[40px] w-full max-w-[300px] p-7 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/40 relative overflow-hidden flex flex-col items-center animate-modal-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶层装饰 */}
            <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#FFF9E8] to-transparent pointer-events-none opacity-60"></div>
            
            {/* 萝萝形象 - 尺寸微缩 */}
            <div className="relative z-10 mb-5 mt-2 animate-tremble">
              <LuluScared size={85} />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF5E57] rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                <Info size={14} strokeWidth={3} />
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-[19px] font-black text-[#5D3A2F] mb-2 tracking-tight">要把秘籍丢掉吗？</h3>
              <p className="text-[13px] font-medium text-[#B45309]/50 leading-relaxed mb-6 px-4">
                “这卷秘籍里还有<br/>萝萝没学会的奥义萝...”
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full relative z-10">
              {/* 保留按钮 */}
              <button 
                onClick={cancelDelete}
                className="w-full py-4 bg-[#FF5C00] text-white rounded-[22px] font-black text-[15px] shadow-[0_10px_25px_-5px_rgba(255,92,0,0.4)] active:scale-[0.96] transition-all flex items-center justify-center gap-2 border-b-4 border-[#E65100]"
              >
                <Heart size={16} fill="white" />
                那再留一会萝
              </button>

              {/* 确定删除 */}
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-[#B45309]/5 text-[#B45309]/40 rounded-[22px] font-bold text-[14px] hover:text-red-500 transition-all active:scale-[0.96] flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                残忍丢弃
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.4s ease-out;
        }
        @keyframes tremble {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-1px, 0.5px); }
          20%, 40%, 60%, 80% { transform: translate(1px, -0.5px); }
        }
        .animate-tremble {
          animation: tremble 0.8s infinite linear;
        }
        @keyframes modal-pop {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-pop {
          animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default RecipeCard;
