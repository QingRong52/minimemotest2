
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
      <div className={`bg-[#FFF9E8] rounded-[24px] p-3.5 flex gap-4 items-center shadow-[0_4px_20px_rgba(180,83,9,0.02)] transition-all border border-[#F0E6D2] relative group ${
        isAnimating ? 'scale-[0.97] bg-[#FF9A2E]/5 ring-2 ring-[#FF9A2E]/20' : 'active:scale-[0.99] hover:shadow-[0_10px_30px_rgba(180,83,9,0.05)]'
      }`}>
        
        {/* 幽灵式删除按钮 */}
        <button 
          type="button"
          onClick={handleDeleteClick}
          className="absolute -top-1.5 -right-1.5 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#B45309]/20 hover:text-red-500 hover:bg-white transition-all z-[10] border border-[#F0E6D2] shadow-sm opacity-0 group-hover:opacity-100"
        >
          <X size={14} strokeWidth={3} />
        </button>

        {/* 左侧图片 */}
        <Link 
          to={`/recipe/${recipe.id}`} 
          className="shrink-0 w-[100px] h-[100px] rounded-[20px] overflow-hidden shadow-sm bg-white border border-[#F0E6D2]/40"
        >
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* 右侧内容 */}
        <div className="flex-1 flex flex-col justify-between py-1 h-[100px] min-w-0">
          <div>
            <h3 className="text-[#5D3A2F] text-[17px] font-black leading-tight truncate pr-4 tracking-tighter">
              {recipe.name}
            </h3>
            <p className="text-[#B45309]/50 text-[11px] font-bold leading-relaxed line-clamp-2 mt-1">
              食材：{recipe.ingredients.length > 0 ? recipe.ingredients.map(i => i.name).join('、') : '精心挑选的特级食材'}
            </p>
          </div>

          <div className="flex justify-between items-center pr-1">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[#FF5C00] text-[10px] font-black">¥</span>
              <span className="text-[#FF5C00] text-[18px] font-black tracking-tighter">
                {recipe.estimatedCost}
              </span>
            </div>
            
            <button 
              type="button"
              onClick={handleAddToQueue}
              className={`flex items-center justify-center w-11 h-11 bg-[#FF9A2E] text-white rounded-[18px] shadow-[0_4px_12px_rgba(255,154,46,0.3)] transition-all ${
                isAnimating ? 'animate-bounce-short' : 'active:scale-90 hover:scale-105'
              }`}
            >
              <CookingPot size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 确认弹窗：极致沉浸黑色全屏遮罩 */}
      {showConfirm && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-[15px] animate-fade-in px-10"
          onClick={cancelDelete}
        >
          <div 
            className="bg-white rounded-[45px] w-full max-w-[320px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/20 relative flex flex-col items-center animate-modal-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6 mt-2">
              <div className="animate-tremble">
                <LuluScared size={90} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF5E57] rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                <Info size={14} strokeWidth={4} />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-[21px] font-black text-[#5D3A2F] mb-2 tracking-tight">要把秘籍丢掉吗？</h3>
              <p className="text-[13px] font-bold text-[#B45309]/50 leading-relaxed px-2">
                “这卷秘籍里还有<br/>萝萝没学会的奥义萝...”
              </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <button 
                onClick={cancelDelete}
                className="w-full py-4.5 bg-[#FF5C00] text-white rounded-[24px] font-black text-[16px] shadow-[0_12px_30px_rgba(255,92,0,0.4)] active:scale-[0.96] transition-all flex items-center justify-center gap-2 border-b-4 border-[#E65100]"
              >
                <Heart size={18} fill="white" />
                那再留一会萝
              </button>

              <button 
                onClick={confirmDelete}
                className="w-full py-4 text-[#B45309]/30 rounded-[24px] font-bold text-[14px] hover:text-red-500 transition-all active:scale-[0.96] flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                残忍丢弃
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-bounce-short { animation: bounce-short 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes tremble {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        .animate-tremble { animation: tremble 0.2s infinite linear; }
        @keyframes modal-pop {
          from { transform: scale(0.9) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-pop { animation: modal-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
      `}</style>
    </>
  );
};

export default RecipeCard;
