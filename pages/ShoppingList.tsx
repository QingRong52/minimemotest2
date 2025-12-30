
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Trash2, CheckCircle2, X 
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluCart } from '../components/LuluIcons';

const ShoppingList: React.FC = () => {
  const navigate = useNavigate();
  const { shoppingList, toggleShoppingItem, clearShoppingList } = useKitchen();

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden animate-fade-in">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF5C00] text-white rounded-2xl flex items-center justify-center shadow-lg"><ShoppingCart size={20} /></div>
          <h2 className="text-[20px] font-black text-[#5D3A2F]">待购清单</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar p-6 pb-40 space-y-4">
        {shoppingList.length > 0 ? (
          shoppingList.map((item) => (
            <button 
              key={item.id} 
              onClick={() => toggleShoppingItem(item.id)} 
              className={`w-full p-6 rounded-[32px] flex items-center justify-between shadow-sm transition-all border-2 ${
                item.checked ? 'border-green-500 bg-green-50/50' : 'bg-white border-[#F0E6D2]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.checked ? 'bg-green-500 border-green-500 text-white' : 'border-[#F0E6D2] text-transparent'
                }`}>
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className={`font-black text-[17px] ${item.checked ? 'text-green-700 line-through opacity-40' : 'text-[#5D3A2F]'}`}>
                  {item.name}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-[#B45309]">
            <LuluCart size={180} className="mb-6" />
            <p className="font-black text-lg">陛下，清单空空如也萝</p>
            <button onClick={() => navigate('/')} className="mt-4 text-[#FF5C00] font-black text-sm">去书架挑几本秘籍吧</button>
          </div>
        )}
      </div>

      {shoppingList.length > 0 && (
        <div className="absolute bottom-8 left-6 right-6 flex gap-4">
          <button 
            onClick={() => { if(confirm('要清空清单吗萝？')) clearShoppingList(); }}
            className="flex-1 bg-white text-[#B45309]/40 py-5 rounded-[28px] font-black text-sm border-2 border-[#F0E6D2] active:scale-95"
          >
            清空全部
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex-[2] bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-sm shadow-xl border-b-6 border-[#E65100] active:scale-95"
          >
            完成核对
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
