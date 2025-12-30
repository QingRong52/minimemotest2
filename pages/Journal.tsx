
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Camera, MessageCircle, Heart, Share2 } from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef } from '../components/LuluIcons';

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const { feedbacks, recipes } = useKitchen();

  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [feedbacks]);

  const getRecipe = (id: string) => recipes.find(r => r.id === id);

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden animate-fade-in">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-[#5D3A2F]">御膳食报</h2>
          <p className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest mt-1">Royal Cooking Journal</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {sortedFeedbacks.length > 0 ? (
          sortedFeedbacks.map((f) => {
            const recipe = getRecipe(f.recipeId);
            return (
              <div key={f.id} className="bg-white rounded-[35px] border-2 border-[#F0E6D2] overflow-hidden shadow-sm animate-fade-in">
                {f.image && (
                  <div className="relative aspect-video w-full">
                    <img src={f.image} className="w-full h-full object-cover" alt="Finished dish" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#FF5C00] shadow-sm border border-white">
                      陛下亲制
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-[#5D3A2F] text-lg">{recipe?.name || '神秘佳肴'}</h3>
                      <p className="text-[10px] font-bold text-[#B45309]/30 uppercase mt-1 tracking-tighter">{f.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} fill={s <= f.rating ? '#FFB800' : 'none'} stroke={s <= f.rating ? '#FFB800' : '#E6E6E6'} strokeWidth={3} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-2 top-0 text-3xl text-[#FF5C00]/10 font-serif">“</div>
                    <p className="text-[14px] font-bold text-[#5D3A2F] leading-relaxed relative z-10 pl-2">
                      {f.content}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#F0E6D2]/50 flex justify-between items-center">
                    <div className="flex items-center gap-4 text-[#B45309]/30">
                      <div className="flex items-center gap-1"><Heart size={16} /> <span className="text-[10px] font-black">99+</span></div>
                      <div className="flex items-center gap-1"><MessageCircle size={16} /> <span className="text-[10px] font-black">8</span></div>
                    </div>
                    <button className="text-[#FF5C00] active:scale-90 transition-all"><Share2 size={18} /></button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-[#B45309]">
            <LuluChef size={180} className="mb-6" />
            <p className="font-black text-lg">“陛下尚未御笔亲批心得萝...”</p>
            <p className="text-xs font-bold mt-2">做完菜后记一笔，就能在这里看到萝！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
