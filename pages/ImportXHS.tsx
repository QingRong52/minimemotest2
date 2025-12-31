
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, Loader2, Link2, FileText, 
  CheckCircle2, ChevronRight, X, Camera, Plus, Trash2, ListPlus
} from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef } from '../components/LuluIcons';

const UNITS_SUGGESTIONS = ['g', '个', '克', '斤', '勺', '块', '把', '适量'];

const ImportXHS: React.FC = () => {
  const navigate = useNavigate();
  // Fixed: Corrected variable name from isRecipeImporting to isAiProcessing to match KitchenContext
  const { isAiProcessing, importedRecipeResult, processRecipeImport, addRecipe, clearImportResult, categories } = useKitchen();
  const [inputText, setInputText] = useState('');
  const [editableRecipe, setEditableRecipe] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (importedRecipeResult) {
      setEditableRecipe({
        name: importedRecipeResult.name || '',
        category: importedRecipeResult.category || '厨神必做',
        image: importedRecipeResult.image || '',
        ingredients: importedRecipeResult.ingredients || [],
        steps: importedRecipeResult.steps || []
      });
    }
  }, [importedRecipeResult]);

  const handleStartImport = () => {
    if (!inputText.trim()) return;
    processRecipeImport(inputText);
    setInputText('');
  };

  const handleConfirmSave = () => {
    if (!editableRecipe) return;
    addRecipe({
      ...editableRecipe,
      id: Date.now().toString(),
      image: editableRecipe.image || 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
      steps: editableRecipe.steps.map((s: any, i: number) => ({ id: i, ...s }))
    });
    clearImportResult();
    setEditableRecipe(null);
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden animate-fade-in">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] z-50 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-[#5D3A2F] leading-none">灵感导入</h2>
          <p className="text-[10px] font-bold text-[#FF5C00]/60 mt-1 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={10} /> AI Enhanced Import
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        {!editableRecipe && !isAiProcessing && (
          <div className="bg-white p-6 rounded-[22px] border-2 border-[#F0E6D2] shadow-sm space-y-4 animate-fade-in">
             <div className="flex items-center gap-3 mb-2 px-1">
               <div className="w-10 h-10 bg-[#FFF9E8] rounded-2xl flex items-center justify-center text-[#FF5C00]"><Link2 size={20} /></div>
               <p className="text-sm font-black text-[#5D3A2F]">粘贴原文内容</p>
             </div>
             <textarea 
               value={inputText}
               onChange={e => setInputText(e.target.value)}
               placeholder="把小红书里的精选文案或者链接直接丢进来萝..."
               className="w-full h-40 bg-[#FFF9E8]/30 border-none rounded-2xl p-5 font-bold text-[#5D3A2F] outline-none text-sm resize-none"
             />
             <button 
               onClick={handleStartImport}
               disabled={!inputText.trim()}
               className="w-full bg-[#FF5C00] text-white py-5 rounded-[22px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-[#E65100]"
             >
               <Sparkles size={20} /> 开始解析
             </button>
          </div>
        )}

        {isAiProcessing && (
           <div className="flex flex-col items-center justify-center py-20 text-center">
              <LuluChef size={140} className="mb-6 animate-pulse" />
              <p className="text-sm font-black text-[#5D3A2F]">萝萝正在研读陛下投喂的灵感萝...</p>
           </div>
        )}

        {editableRecipe && !isAiProcessing && (
          <div className="animate-fade-in space-y-8 pb-10">
             <div className="bg-white p-6 rounded-[22px] border-4 border-[#FF5C00] shadow-xl relative text-[#5D3A2F]">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black">✨ 御笔微调</h3>
                   <button onClick={() => { clearImportResult(); setEditableRecipe(null); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFF9E8] text-[#FF5C00]"><X size={18} /></button>
                </div>
                
                {/* 紧凑表单 */}
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#B45309]/40 uppercase px-1">封面大赏</label>
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-40 bg-[#FFF9E8] rounded-2xl overflow-hidden flex flex-col items-center justify-center relative cursor-pointer border-2 border-dashed border-[#F0E6D2]"
                     >
                       {editableRecipe.image ? <img src={editableRecipe.image} className="w-full h-full object-cover" alt="" /> : <Camera className="text-[#FF5C00]/20" />}
                       <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) {
                           const r = new FileReader();
                           r.onload = () => setEditableRecipe({...editableRecipe, image: r.result});
                           r.readAsDataURL(file);
                         }
                       }} />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#B45309]/40 uppercase px-1">菜谱名称</label>
                     <input value={editableRecipe.name} onChange={e => setEditableRecipe({...editableRecipe, name: e.target.value})} className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] px-5 py-4 rounded-2xl font-black outline-none" />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#B45309]/40 uppercase px-1">食材精简</label>
                     <div className="grid grid-cols-2 gap-2">
                        {editableRecipe.ingredients.map((ing: any, i: number) => (
                           <div key={i} className="bg-[#FFF9E8]/30 p-2 rounded-xl flex items-center justify-between gap-1">
                              <span className="text-[11px] font-black truncate">{ing.name}</span>
                              <span className="text-[10px] text-[#FF5C00] font-black shrink-0">{ing.amount}{ing.unit}</span>
                           </div>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-[#B45309]/40 uppercase px-1">步法预览</label>
                      <div className="space-y-2">
                         {editableRecipe.steps.map((s: any, i: number) => (
                            <div key={i} className="flex gap-3 items-start bg-white p-3 rounded-2xl border border-[#F0E6D2]/50 shadow-sm">
                               <span className="w-6 h-6 rounded-lg bg-[#FF5C00] text-white flex items-center justify-center font-black text-[10px] shrink-0">{i+1}</span>
                               <p className="text-[11px] font-bold leading-relaxed line-clamp-2">{s.instruction}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <button onClick={handleConfirmSave} className="w-full mt-10 bg-[#FF5C00] text-white py-5 rounded-[22px] font-black shadow-xl border-b-6 border-[#E65100] active:scale-95 transition-all">
                  录入秘籍萝
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportXHS;
