
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, CheckCircle2, X, ListChecks, Check, Loader2, Trash2, PartyPopper
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluCart, LuluChef } from '../components/LuluIcons';

const ShoppingList: React.FC = () => {
  const navigate = useNavigate();
  const { shoppingList, toggleShoppingItem, clearShoppingList } = useKitchen();
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 仅获取已勾选的项目
  const checkedItems = useMemo(() => shoppingList.filter(item => item.checked), [shoppingList]);

  const handleFinishPurchase = () => {
    if (checkedItems.length === 0) {
      alert('陛下还没勾选买到的宝贝萝！');
      return;
    }

    setIsFinishing(true);
    
    // 模拟确认过程，不再进行记账结算，直接进入庆祝环节
    setTimeout(() => {
      setIsFinishing(false);
      setShowSuccess(true);
      clearShoppingList();
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden animate-fade-in">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/95 backdrop-blur-3xl border-b border-[#F0E6D2] z-[100] shrink-0 sticky top-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-11 h-11 rounded-[18px] bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2] shadow-sm"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5C00] text-white rounded-xl flex items-center justify-center shadow-lg"><ShoppingCart size={20} /></div>
            <h2 className="text-[20px] font-black text-[#5D3A2F] tracking-tighter">待购清单</h2>
          </div>
        </div>
        <button 
          onClick={() => { if(confirm('要清空清单吗萝？')) clearShoppingList(); }}
          className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-90 border border-red-100"
        >
          <Trash2 size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar p-6 pb-96 space-y-4 relative z-10">
        {shoppingList.length > 0 ? (
          shoppingList.map((item) => (
            <div 
              key={item.id}
              onClick={() => toggleShoppingItem(item.id)}
              className={`w-full p-6 rounded-[24px] border-2 transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                item.checked ? 'border-green-500/40 bg-green-50/40 shadow-inner' : 'bg-white border-[#F0E6D2] shadow-sm'
              }`}
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  item.checked ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/10' : 'border-[#F0E6D2] text-transparent'
                }`}>
                  <CheckCircle2 size={20} strokeWidth={3} />
                </div>
                <span className={`font-black text-[19px] truncate ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>
                  {item.name}
                </span>
              </div>
              
              {item.checked && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 animate-scale-up shadow-lg">
                  <Check size={14} strokeWidth={4} />
                  <span className="text-[10px] font-black uppercase tracking-widest">OK</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-28 opacity-30 text-[#B45309]">
            <LuluCart size={200} className="mb-8" />
            <p className="font-black text-xl tracking-tight">陛下，清单空空如也萝</p>
            <button onClick={() => navigate('/')} className="mt-6 px-10 py-3.5 bg-[#FFF9E8] rounded-full text-[#FF5C00] font-black text-sm border-2 border-[#F0E6D2] active:scale-95 transition-all">回书架挑几本</button>
          </div>
        )}
      </div>

      {/* 底部确认按钮 */}
      {shoppingList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-8 pb-[calc(env(safe-area-inset-bottom)+24px)] bg-gradient-to-t from-[#FEFFF9] via-[#FEFFF9] to-transparent shrink-0 z-[90] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] border border-[#F0E6D2] p-6 shadow-[0_20px_50px_rgba(180,83,9,0.12)] flex flex-col gap-4 animate-slide-up pointer-events-auto">
             <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-green-50 rounded-[14px] flex items-center justify-center text-green-500">
                  <ListChecks size={22} />
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-black text-[#5D3A2F]">采购进度</span>
                   <span className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest leading-none mt-1">
                     {checkedItems.length} / {shoppingList.length} 项已购
                   </span>
                </div>
             </div>
             
             <button 
              onClick={handleFinishPurchase}
              disabled={isFinishing || checkedItems.length === 0}
              className="w-full bg-[#FF5C00] text-white py-5 rounded-[22px] font-black text-[18px] shadow-xl border-b-6 border-[#E65100] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
             >
               {isFinishing ? (
                 <>
                   <Loader2 size={24} className="animate-spin" />
                   <span>正在确认宝贝...</span>
                 </>
               ) : (
                 <>
                   <CheckCircle2 size={24} />
                   <span>朕已买齐</span>
                 </>
               )}
             </button>
          </div>
        </div>
      )}

      {/* 成功庆祝动画弹窗 */}
      {showSuccess && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-[340px] p-10 flex flex-col items-center text-center shadow-2xl animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 relative">
              <PartyPopper size={48} className="text-green-500" />
              <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-full"></div>
            </div>
            
            <h3 className="text-2xl font-black text-[#5D3A2F] mb-4 tracking-tighter">粮草已齐萝！</h3>
            <p className="text-[15px] font-bold text-[#B45309]/50 mb-10 leading-relaxed px-2">
              陛下大功告成！<br/>
              新鲜食材已就位，期待陛下的美味杰作萝～
            </p>
            
            <button 
              onClick={() => navigate('/')}
              className="w-full py-5 bg-[#FF5C00] text-white rounded-[24px] font-black text-lg shadow-xl border-b-6 border-[#E65100] active:scale-95 transition-all"
            >
              回书架翻翻看
            </button>
          </div>
        </div>
      )}

      <style>{`
        .border-b-6 { border-bottom-width: 6px; }
        @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes modal-pop { from { transform: scale(0.8) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-modal-pop { animation: modal-pop 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.28) forwards; }
      `}</style>
    </div>
  );
};

export default ShoppingList;
