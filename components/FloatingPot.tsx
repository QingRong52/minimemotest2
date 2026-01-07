
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useKitchen } from '../KitchenContext';
import { useNavigate } from 'react-router-dom';
import { X, CookingPot, Trash2, ChevronRight, Play } from 'lucide-react';
import { LuluChef } from './LuluIcons';

const FloatingPot: React.FC = () => {
  const { cookingQueue, recipes, removeFromQueue, setIsGlobalModalOpen } = useKitchen();
  const [isOpen, setIsOpen] = useState(false);
  const [jump, setJump] = useState(false);
  const navigate = useNavigate();

  const queueItems = recipes.filter(r => cookingQueue.includes(r.id));

  useEffect(() => {
    if (cookingQueue.length > 0) {
      setJump(true);
      const timer = setTimeout(() => setJump(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cookingQueue.length]);

  // 同步全局弹窗状态
  useEffect(() => {
    setIsGlobalModalOpen(isOpen);
    return () => setIsGlobalModalOpen(false);
  }, [isOpen, setIsGlobalModalOpen]);

  const handleNavigate = (id: string) => {
    setIsOpen(false);
    navigate(`/recipe/${id}`);
  };

  const handleStartMultiCooking = () => {
    if (queueItems.length === 0) return;
    setIsOpen(false);
    navigate('/multi-cooking');
  };

  const DrawerPortal = () => {
    if (!isOpen) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/50 backdrop-blur-2xl animate-fade-in"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="bg-[#FEFFF9] w-full h-[88%] rounded-t-[24px] p-8 animate-slide-up flex flex-col shadow-[0_-20px_80px_rgba(0,0,0,0.4)] border-t border-white/40"
          style={{ maxWidth: '430px' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-8 shrink-0"></div>

          <div className="flex justify-between items-center mb-10 px-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                <CookingPot size={30} className="text-[#FF5C00]" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[24px] font-black text-[#5D3A2F] tracking-tighter leading-none">待烹饪清单</h2>
                <p className="text-[11px] font-bold text-[#B45309]/40 uppercase tracking-[0.2em] mt-2">Ready to Cook</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-11 h-11 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all shadow-sm"
            >
              <X size={22} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 px-1 pb-10">
            {queueItems.length > 0 ? (
              queueItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border-2 border-[#F0E6D2] p-5 rounded-[22px] flex items-center justify-between group active:bg-[#FFF9E8] transition-all shadow-sm"
                >
                  <button 
                    onClick={() => handleNavigate(item.id)}
                    className="flex items-center gap-5 flex-1 text-left"
                  >
                    <div className="relative shrink-0">
                      <img src={item.image} className="w-[72px] h-[72px] rounded-xl object-cover shadow-sm border border-[#F0E6D2]" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-[#5D3A2F] text-[18px] block mb-1 truncate">{item.name}</span>
                      <div className="flex items-center gap-1.5 opacity-40">
                        <span className="text-[10px] font-bold uppercase tracking-widest">点击查看秘籍细节</span>
                        <ChevronRight size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(item.id);
                    }}
                    className="p-4 text-[#B45309]/20 hover:text-red-500 transition-colors shrink-0 active:scale-90"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-90 animate-fade-in">
                <LuluChef size={180} className="grayscale opacity-40 mb-6" />
                <p className="text-[15px] font-black text-[#B45309]/30 tracking-tight">“灶台空荡，萝萝在等待旨意萝！”</p>
              </div>
            )}
          </div>

          {queueItems.length > 0 && (
            <div className="pt-8 pb-10 px-2 shrink-0">
              <button 
                onClick={handleStartMultiCooking}
                className="w-full h-18 bg-[#FF5C00] text-white rounded-[24px] font-black text-xl shadow-[0_15px_30px_rgba(255,92,0,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-b-6 border-[#E65100]"
              >
                <Play size={28} fill="currentColor" strokeWidth={3} />
                <span>开启合制模式（共{queueItems.length}道）</span>
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute bottom-[96px] right-6 w-[56px] h-[56px] bg-[#FF5C00] rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(255,92,0,0.4)] transition-all z-[120] border-2 border-white/20 ${
          jump ? 'animate-pot-jump' : 'active:scale-95'
        }`}
      >
        <div className="relative">
          <CookingPot size={28} color="white" strokeWidth={2.5} />
          {queueItems.length > 0 && (
            <div className={`absolute -top-1.5 -right-1.5 bg-white text-[#FF5C00] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-black text-[9px] border border-[#FF5C00] shadow-sm`}>
              {queueItems.length}
            </div>
          )}
        </div>
      </button>

      <DrawerPortal />

      <style>{`
        @keyframes pot-jump {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-pot-jump { animation: pot-jump 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .h-18 { height: 72px; }
        .border-b-6 { border-bottom-width: 6px; }
      `}</style>
    </>
  );
};

export default FloatingPot;
