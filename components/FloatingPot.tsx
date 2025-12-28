
import React, { useState, useEffect } from 'react';
import { useKitchen } from '../KitchenContext';
import { useNavigate } from 'react-router-dom';
import { X, CookingPot, Trash2, ChevronRight, CheckCircle } from 'lucide-react';

const FloatingPot: React.FC = () => {
  const { cookingQueue, recipes, removeFromQueue, clearQueue, addExpense } = useKitchen();
  const [isOpen, setIsOpen] = useState(false);
  const [jump, setJump] = useState(false);
  const navigate = useNavigate();

  // 只显示库里还存在的食谱
  const queueItems = recipes.filter(r => cookingQueue.includes(r.id));

  // 监听队列变化触发跳动
  useEffect(() => {
    if (cookingQueue.length > 0) {
      setJump(true);
      const timer = setTimeout(() => setJump(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cookingQueue.length]);

  const handleNavigate = (id: string) => {
    setIsOpen(false);
    navigate(`/recipe/${id}`);
  };

  const handleCompleteCooking = () => {
    if (queueItems.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // 记录每一份烹饪的美食
    queueItems.forEach(item => {
      addExpense({
        date: today,
        amount: 0, // 烹饪过程不产生额外支出，仅作记录
        type: 'cooking',
        description: `烹饪完成: ${item.name}`
      });
    });

    // 清空队列
    clearQueue();
    setIsOpen(false);
  };

  return (
    <>
      {/* 悬浮锅按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute bottom-28 right-6 w-[64px] h-[64px] bg-[#FF5C00] rounded-full flex items-center justify-center shadow-[0_12px_24px_rgba(255,92,0,0.4)] transition-all z-[120] border-2 border-white/10 ${
          jump ? 'animate-pot-jump' : 'hover:scale-110 active:scale-95'
        }`}
      >
        <div className="relative">
          <CookingPot size={32} color="white" strokeWidth={2.5} />
          {queueItems.length > 0 && (
            <div className={`absolute -top-1.5 -right-1.5 bg-white text-[#FF5C00] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-black text-[10px] border-2 border-[#FF5C00] shadow-sm ${
              jump ? 'scale-125' : 'scale-100'
            } transition-transform`}>
              {queueItems.length}
            </div>
          )}
        </div>
        {/* 跳动时的脉冲光晕 */}
        {jump && (
          <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
        )}
      </button>

      {/* 抽屉浮层 */}
      {isOpen && (
        <div className="absolute inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FEFFF9] w-full h-[70%] rounded-t-[45px] p-8 animate-slide-up flex flex-col shadow-2xl border-t-4 border-[#FF5C00]/20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <CookingPot size={24} className="text-[#FF5C00]" />
                <h2 className="text-xl font-black text-[#5D3A2F]">待烹饪清单</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-[#FFF3D3] p-2.5 rounded-2xl text-[#FF5C00] active:scale-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {queueItems.length > 0 ? (
                queueItems.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-[#F0E6D2] p-4 rounded-2xl flex items-center justify-between group active:bg-[#FFF9E8] transition-all animate-fade-in shadow-sm"
                  >
                    <button 
                      onClick={() => handleNavigate(item.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <img src={item.image} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                      <div className="flex-1">
                        <span className="font-black text-[#5D3A2F] text-[15px] block">{item.name}</span>
                        <span className="text-[10px] font-bold text-[#B45309]/40 uppercase flex items-center gap-1">
                          查看详情 <ChevronRight size={10} />
                        </span>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(item.id);
                      }}
                      className="p-3 text-[#B45309]/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-[#B45309]/30 font-bold italic opacity-40">
                  <CookingPot size={48} className="mb-4" />
                  <p>空空如也，快去添加食谱吧！</p>
                </div>
              )}
            </div>

            {queueItems.length > 0 && (
              <button 
                onClick={handleCompleteCooking}
                className="w-full bg-[#FF5C00] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-[#FF5C00]/10 mt-6 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={24} />
                完成烹饪并记录
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pot-jump {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-15px) scale(1.1); }
          60% { transform: translateY(0) scale(0.95); }
        }
        .animate-pot-jump {
          animation: pot-jump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </>
  );
};

export default FloatingPot;
