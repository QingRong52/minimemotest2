
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Link2, FileText, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { LuluChef } from '../components/LuluIcons';

const ImportXHS: React.FC = () => {
  const navigate = useNavigate();
  const { isRecipeImporting, importedRecipeResult, processRecipeImport, addRecipe, clearImportResult } = useKitchen();
  const [inputText, setInputText] = useState('');

  const handleStartImport = () => {
    if (!inputText.trim()) return;
    processRecipeImport(inputText);
    setInputText('');
  };

  const handleConfirmSave = () => {
    if (!importedRecipeResult) return;
    
    addRecipe({
      ...importedRecipeResult,
      id: Date.now().toString(),
      // 如果 AI 没抓到图，给个默认图
      image: importedRecipeResult.image || 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
      // 如果 AI 没确定分类，默认进入第一个有效分类
      category: importedRecipeResult.category || '厨神必做',
      steps: importedRecipeResult.steps.map((s: any, i: number) => ({ id: i, ...s }))
    });
    
    clearImportResult();
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] z-50 shrink-0">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-black text-[#5D3A2F] leading-none">灵感导入</h2>
          <p className="text-[10px] font-bold text-[#FF5C00]/60 mt-1 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={10} /> Background Parsing
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        {/* 输入区 */}
        <div className="bg-white p-6 rounded-[35px] border-2 border-[#F0E6D2] shadow-sm space-y-4">
           <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-10 h-10 bg-[#FFF9E8] rounded-2xl flex items-center justify-center text-[#FF5C00]"><Link2 size={20} /></div>
             <p className="text-sm font-black text-[#5D3A2F]">粘贴原文内容</p>
           </div>
           <textarea 
             value={inputText}
             onChange={e => setInputText(e.target.value)}
             disabled={isRecipeImporting}
             placeholder="把小红书里的精选文案或者链接直接丢进来，萝萝在后台会帮你瞬间还原秘籍萝！"
             className="w-full h-40 bg-[#FFF9E8]/30 border-none rounded-2xl p-5 font-bold text-[#5D3A2F] outline-none text-sm resize-none disabled:opacity-50"
           />
           <button 
             onClick={handleStartImport}
             disabled={!inputText.trim() || isRecipeImporting}
             className="w-full bg-[#FF5C00] text-white py-5 rounded-[24px] font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 border-b-4 border-[#E65100]"
           >
             {isRecipeImporting ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
             还原灵感秘籍
           </button>
        </div>

        {/* 状态展示 */}
        {isRecipeImporting && (
           <div className="flex flex-col items-center justify-center py-10 animate-fade-in text-center px-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-[#FF5C00]/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <LuluChef size={140} />
              </div>
              <p className="text-sm font-black text-[#5D3A2F]">萝萝正在努力研习陛下投喂的内容萝...</p>
              <p className="text-[10px] font-bold text-[#B45309]/30 mt-2">陛下可以先去干别的，分析好后会在这里等您萝！</p>
           </div>
        )}

        {/* 解析结果预览 */}
        {importedRecipeResult && !isRecipeImporting && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-white p-6 rounded-[40px] border-4 border-[#FF5C00] shadow-xl relative overflow-hidden text-[#5D3A2F]">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-black flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" /> {importedRecipeResult.name}
                   </h3>
                   <button onClick={clearImportResult} className="text-[#B45309]/30"><X size={20} /></button>
                </div>
                
                {importedRecipeResult.image && (
                   <div className="rounded-2xl overflow-hidden mb-6 border border-[#F0E6D2]">
                      <img src={importedRecipeResult.image} className="w-full h-40 object-cover" alt="Preview" />
                   </div>
                )}

                <div className="space-y-6">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest flex items-center gap-1"><FileText size={10} /> 识别到 {importedRecipeResult.ingredients.length} 种食材</p>
                      <div className="flex flex-wrap gap-2">
                         {importedRecipeResult.ingredients.map((ing: any, i: number) => (
                           <span key={i} className="bg-[#FFF9E8] px-3 py-1.5 rounded-full text-[11px] font-black border border-[#F0E6D2]">
                              {ing.name} {ing.amount || ''}{ing.unit || ''}
                           </span>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest">原文步骤 (忠实提取)</p>
                        <span className="text-[10px] font-black text-[#FF5C00]">{importedRecipeResult.steps.length} 步</span>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                        {importedRecipeResult.steps.map((s: any, i: number) => (
                          <div key={i} className="bg-[#FFF9E8]/30 p-4 rounded-2xl border border-dashed border-[#F0E6D2] space-y-3">
                            <p className="text-[13px] font-bold leading-relaxed"><span className="text-[#FF5C00] mr-2">#{i+1}</span>{s.instruction}</p>
                            {s.image && (
                               <div className="rounded-xl overflow-hidden border border-[#F0E6D2] aspect-video">
                                  <img src={s.image} className="w-full h-full object-cover" alt={`Step ${i+1}`} />
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleConfirmSave}
                  className="w-full mt-10 bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-base shadow-xl active:scale-95 transition-all border-b-6 border-[#E65100] flex items-center justify-center gap-2"
                >
                  <ChevronRight size={20} /> 同步至秘籍书架
                </button>
             </div>
          </div>
        )}

        {!importedRecipeResult && !isRecipeImporting && (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
             <LuluChef size={160} className="mb-4" />
             <p className="text-xs font-black text-[#B45309]">“萝萝在等待陛下的灵感投喂萝...”</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 局部样式
const X = ({size, strokeWidth=2.5}: {size: number, strokeWidth?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
);

export default ImportXHS;
