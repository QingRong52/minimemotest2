
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Send, X, Star, Smile, Heart, ThumbsUp } from 'lucide-react';
import { useKitchen } from '../KitchenContext';

const RATINGS = [
  { val: 1, icon: '😠', label: '不甚满意' },
  { val: 2, icon: '😐', label: '差强人意' },
  { val: 3, icon: '😊', label: '中规中矩' },
  { val: 4, icon: '😋', label: '回味无穷' },
  { val: 5, icon: '👑', label: '厨神降世' },
];

const AddFeedback: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, addFeedback } = useKitchen();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const recipe = recipes.find(r => r.id === id);

  if (!recipe) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) return alert('请输入心得萝～');
    addFeedback({
      recipeId: recipe.id,
      date: new Date().toISOString().split('T')[0],
      rating,
      content,
      image: image || undefined
    });
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] animate-fade-in relative overflow-hidden">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[18px] font-black text-[#5D3A2F]">记一份御批</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-32">
        {/* 菜品摘要 */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-[30px] border border-[#F0E6D2] shadow-sm">
          <img src={recipe.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
          <div>
            <p className="font-black text-[#5D3A2F]">{recipe.name}</p>
            <p className="text-[10px] font-bold text-[#B45309]/30 uppercase">Reviewing Recipe</p>
          </div>
        </div>

        {/* 满意度选择 */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[#B45309]/40 uppercase tracking-[0.2em] px-2">满意度评估</label>
          <div className="flex justify-between bg-white p-4 rounded-[35px] border-2 border-[#F0E6D2]">
            {RATINGS.map((r) => (
              <button 
                key={r.val} 
                onClick={() => setRating(r.val)}
                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-2xl transition-all ${
                  rating === r.val ? 'bg-[#FF5C00] text-white scale-110 shadow-lg' : 'text-[#5D3A2F]'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-[8px] font-black">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 文字心得 */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[#B45309]/40 uppercase tracking-[0.2em] px-2">心得体会</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="陛下，这次出锅的奥义在哪里萝？"
            className="w-full h-40 bg-white border-2 border-[#F0E6D2] rounded-[35px] p-6 font-bold text-[#5D3A2F] outline-none shadow-sm focus:border-[#FF5C00]/30 transition-all"
          />
        </div>

        {/* 成品快照 */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-[#B45309]/40 uppercase tracking-[0.2em] px-2">成品快照</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-[#FFF9E8] border-4 border-dashed border-[#F0E6D2] rounded-[40px] flex flex-col items-center justify-center overflow-hidden relative cursor-pointer active:scale-[0.98] transition-all"
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Result" />
            ) : (
              <>
                <Camera size={32} className="text-[#FF5C00]/30 mb-2" />
                <span className="text-[11px] font-black text-[#B45309]/30">点击上传今日佳作</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 right-6">
        <button 
          onClick={handleSubmit}
          className="w-full bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-lg shadow-xl border-b-6 border-[#E65100] active:scale-95 flex items-center justify-center gap-3"
        >
          <Send size={20} /> 发布心得萝
        </button>
      </div>
    </div>
  );
};

export default AddFeedback;
