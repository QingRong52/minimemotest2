
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, CheckCircle2, X, Calculator, CreditCard, Check, Loader2, Trash2
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluCart } from '../components/LuluIcons';

const ShoppingList: React.FC = () => {
  const navigate = useNavigate();
  const { shoppingList, toggleShoppingItem, updateShoppingItem, clearShoppingList, addExpense } = useKitchen();
  const [isFinishing, setIsFinishing] = useState(false);

  // 计算已选总价
  const checkedItems = useMemo(() => shoppingList.filter(item => item.checked), [shoppingList]);
  const totalAmount = useMemo(() => {
    return checkedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [checkedItems]);

  const handleFinishPurchase = () => {
    if (checkedItems.length === 0) {
      alert('陛下还没勾选买到的宝贝萝！');
      return;
    }

    setIsFinishing(true);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    addExpense({
      date: todayStr,
      time: timeStr,
      amount: totalAmount,
      type: 'purchase',
      description: `清单结算: ${checkedItems.map(i => i.name).join('、')}`,
      category: 'eat',
      icon: 'ShoppingCart'
    });

    setTimeout(() => {
      clearShoppingList();
      setIsFinishing(false);
      alert(`结算成功！¥${totalAmount.toFixed(2)} 已记入“吃”分类账本萝！`);
      navigate('/finance');
    }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden animate-fade-in">
      {/* Header 层级提升至 z-[100] */}
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

      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar p-6 pb-96 space-y-5 relative z-10">
        {shoppingList.length > 0 ? (
          shoppingList.map((item) => (
            <div 
              key={item.id}
              className={`w-full p-6 rounded-[32px] border-2 transition-all flex flex-col gap-5 ${
                item.checked ? 'border-green-500/40 bg-green-50/40' : 'bg-white border-[#F0E6D2]'
              }`}
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => toggleShoppingItem(item.id)} 
                  className="flex items-center gap-5 flex-1 text-left group"
                >
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    item.checked ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/10' : 'border-[#F0E6D2] text-transparent'
                  }`}>
                    <CheckCircle2 size={20} strokeWidth={3} />
                  </div>
                  <span className={`font-black text-[19px] truncate ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>
                    {item.name}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                 <div className={`flex-1 flex items-center bg-white/70 border-2 rounded-2xl px-5 py-3.5 transition-all focus-within:ring-4 focus-within:ring-[#FF5C00]/10 ${item.checked ? 'border-green-200' : 'border-[#F0E6D2]'}`}>
                    <span className="text-[16px] font-black text-[#B45309]/30 mr-2">¥</span>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="录入真实价格..." 
                      value={item.price || ''}
                      onChange={(e) => updateShoppingItem(item.id, { price: Number(e.target.value) })}
                      className="w-full bg-transparent outline-none font-black text-[#FF5C00] text-[18px]"
                    />
                 </div>
                 {item.checked && (
                   <div className="bg-green-500 text-white px-5 py-2.5 rounded-2xl flex items-center gap-1.5 animate-scale-up shadow-lg">
                      <Check size={16} strokeWidth={4} />
                      <span className="text-[12px] font-black uppercase tracking-widest">OK</span>
                   </div>
                 )}
              </div>
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

      {/* 底部合计区域 - 确保在全屏无导航模式下定位正确 */}
      {shoppingList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-8 pb-[calc(env(safe-area-inset-bottom)+24px)] bg-gradient-to-t from-[#FEFFF9] via-[#FEFFF9] to-transparent shrink-0 z-[90] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-3xl rounded-[44px] border border-[#F0E6D2] p-8 shadow-[0_20px_50px_rgba(180,83,9,0.12)] flex flex-col gap-6 animate-slide-up pointer-events-auto">
             <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-green-50 rounded-[22px] flex items-center justify-center text-green-500 shadow-inner">
                     <Calculator size={26} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-[#5D3A2F]">勾选合计</span>
                      <span className="text-[11px] font-bold text-[#B45309]/30 uppercase tracking-widest leading-none mt-1">Ready to Bill</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-[#FF5C00] tracking-tighter">¥ {totalAmount.toFixed(2)}</span>
                </div>
             </div>
             
             <button 
              onClick={handleFinishPurchase}
              disabled={isFinishing || checkedItems.length === 0}
              className="w-full bg-[#FF5C00] text-white py-6 rounded-[30px] font-black text-[20px] shadow-xl border-b-8 border-[#E65100] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-4"
             >
               {isFinishing ? (
                 <>
                   <Loader2 size={28} className="animate-spin" />
                   <span>正在入库结算...</span>
                 </>
               ) : (
                 <>
                   <CreditCard size={28} />
                   <span>这就去买单 ({checkedItems.length}件)</span>
                 </>
               )}
             </button>
          </div>
        </div>
      )}

      <style>{`
        .border-b-8 { border-bottom-width: 8px; }
        @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};

export default ShoppingList;
