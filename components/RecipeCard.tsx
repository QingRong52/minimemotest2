
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { CookingPot, X, Heart, Trash2, AlertCircle } from 'lucide-react';
import { Recipe } from '../types';
import { useKitchen } from '../KitchenContext';
import { LuluScared } from './LuluIcons';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { addToQueue, deleteRecipe, setIsGlobalModalOpen } = useKitchen();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 弹窗开启时锁定滚动并同步全局状态，强制关闭底部栏显示
  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setIsGlobalModalOpen(true);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setIsGlobalModalOpen(false);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setIsGlobalModalOpen(false);
    };
  }, [showConfirm, setIsGlobalModalOpen]);

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
    e?.preventDefault();
    e?.stopPropagation();
    setShowConfirm(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    addToQueue(recipe.id);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const ModalPortal = () => {
    if (!showConfirm) return null;
    
    return createPortal(
      <div 
        className="fixed inset-0 w-screen h-screen z-[99999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-fade-in"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        onClick={cancelDelete}
      >
        <div 
          className="bg-[#FEFFF9] rounded-[44px] w-full max-w-[340px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/20 relative flex flex-col items-center animate-modal-pop"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative mb-8">
            <div className="animate-tremble">
              <LuluScared size={140} />
            </div>
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white">
              <AlertCircle size={24} strokeWidth={4} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h3 className="text-[26px] font-black text-[#5D3A2F] mb-3 tracking-tighter leading-tight">真的要丢掉它吗？</h3>
            <p className="text-[15px] font-bold text-[#B45309]/50 leading-relaxed px-4">
              这本秘籍饱含心血萝，<br/>
              丢弃后将无法再次寻回...
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={cancelDelete} 
              className="w-full py-5 bg-[#FF5C00] text-white rounded-[32px] font-black text-[18px] shadow-[0_12px_30px_rgba(255,92,0,0.4)] active:scale-[0.96] transition-all flex items-center justify-center gap-2 border-b-6 border-[#E65100]"
            >
              <Heart size={22} fill="white" /> 还是留着萝
            </button>
            
            <button 
              onClick={confirmDelete} 
              className="w-full py-4 text-[#B45309]/30 rounded-[32px] font-black text-[15px] active:text-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              <span>残忍丢弃</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div 
        className={`bg-[#FFF9E8] rounded-[22px] p-3.5 flex gap-4 items-center shadow-[0_4px_20px_rgba(180,83,9,0.02)] border border-[#F0E6D2] relative group ${
          showConfirm ? '' : 'transition-all active:scale-[0.99]'
        } ${isAnimating ? 'scale-[0.97] bg-[#FF9A2E]/5 ring-2 ring-[#FF9A2E]/20' : ''}`}
      >
        {/* 核心修改：w-6 h-6, 进一步减小尺寸以满足移动端精致感 */}
        <button 
          type="button"
          onClick={handleDeleteClick}
          className="absolute -top-1 -right-1 w-6 h-6 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#B45309]/40 active:text-red-500 transition-all z-[10] border border-[#F0E6D2] shadow-sm active:scale-90"
        >
          <X size={12} strokeWidth={3} />
        </button>

        <Link 
          to={`/recipe/${recipe.id}`} 
          className="shrink-0 w-[100px] h-[100px] rounded-[20px] overflow-hidden shadow-sm bg-white border border-[#F0E6D2]/40"
        >
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover transition-transform duration-700"
          />
        </Link>
        
        <div className="flex-1 flex flex-col justify-between py-1 h-[100px] min-w-0">
          <div>
            <h3 className="text-[#5D3A2F] text-[17px] font-black leading-tight truncate pr-6 tracking-tighter">
              {recipe.name}
            </h3>
            <p className="text-[#B45309]/50 text-[11px] font-bold leading-relaxed line-clamp-2 mt-1">
              食材：{recipe.ingredients.length > 0 ? recipe.ingredients.map(i => i.name).join('、') : '精心挑选的特级食材'}
            </p>
          </div>

          <div className="flex justify-end items-center pr-1">
            <button 
              type="button"
              onClick={handleAddToQueue}
              className={`flex items-center justify-center w-11 h-11 bg-[#FF9A2E] text-white rounded-[18px] shadow-[0_4px_12px_rgba(255,154,46,0.3)] transition-all ${
                isAnimating ? 'animate-bounce-short' : 'active:scale-90'
              }`}
            >
              <CookingPot size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <ModalPortal />

      <style>{`
        @keyframes tremble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-8deg) scale(1.05); }
          75% { transform: rotate(8deg) scale(0.95); }
        }
        .animate-tremble { animation: tremble 0.2s ease-in-out infinite; }
        @keyframes modal-pop {
          0% { transform: scale(0.8) translateY(60px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-modal-pop { animation: modal-pop 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.28) forwards; }
        .border-b-6 { border-bottom-width: 6px; }
      `}</style>
    </>
  );
};

export default RecipeCard;
