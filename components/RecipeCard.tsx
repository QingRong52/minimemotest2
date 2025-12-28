
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
            <p className="text-[#B45309]/50 text-[10px] font-medium leading-relaxed line-clamp-2">
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

      {/* 确认弹窗：回归温馨风格的卡片式设计 */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#5D3A2F]/10 backdrop-blur-[8px] animate-fade-in px-6"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-[40px] w-full max-w-[320px] p-8 shadow-[0_20px_60px_-10px_rgba(93,58,47,0.2)] border border-white relative overflow-hidden flex flex-col items-center animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 卡片背景装饰 */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#FFF9E8] to-transparent pointer-events-none"></div>
            
            {/* 萝萝形象：保持颤抖但色彩柔和 */}
            <div className="relative z-10 mb-6 mt-2 animate-tremble">
              <LuluScared size={100} />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF5E57] rounded-full flex items-center justify-center text-white shadow-sm animate-bounce">
                <Info size={14} strokeWidth={3} />
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <h3 className="text-[20px] font-black text-[#5D3A2F] mb-2 tracking-tight">要把秘籍丢掉吗？</h3>
              <p className="text-[13px] font-medium text-[#B45309]/50 leading-relaxed mb-8">
                “这卷秘籍里还有<br/>萝萝没学会的奥义萝...”
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full relative z-10">
              {/* 取消按钮：主要行动点，温润色调 */}
              <button 
                onClick={cancelDelete}
                className="w-full py-4 bg-[#FF9A2E] text-white rounded-[22px] font-black text-[15px] shadow-[0_8px_20px_-4px_rgba(255,154,46,0.4)] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <Heart size={16} fill="white" />
                那再留一会萝
              </button>

              {/* 确认按钮：次要行动点，低调深色 */}
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-[#B45309]/5 text-[#B45309]/40 rounded-[22px] font-bold text-[14px] hover:bg-red-50 hover:text-red-400 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
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
          10%, 30%, 50%, 70%, 90% { transform: translate(-1.5px, 0.5px); }
          20%, 40%, 60%, 80% { transform: translate(1.5px, -0.5px); }
        }
        .animate-tremble {
          animation: tremble 0.6s infinite linear;
        }
        @keyframes scale-up {
          from { transform: scale(0.9) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default RecipeCard;
