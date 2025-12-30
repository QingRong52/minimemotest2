
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Camera, Sparkles, 
  Trash2, CheckCircle2, X, Loader2, ListChecks, CheckCircle
} from 'lucide-react';
import { useKitchen, ChatMessage } from '../KitchenContext';

const AIBookkeeping: React.FC = () => {
  const navigate = useNavigate();
  const { chatHistory, updateChatHistory, addExpenses, clearChat, isAiProcessing, processBookkeeping } = useKitchen();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAiProcessing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;
    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: inputText, 
      image: selectedImage || undefined 
    };
    updateChatHistory([...chatHistory, userMsg]);
    
    const text = inputText;
    const image = selectedImage;
    setInputText(''); 
    setSelectedImage(null);
    
    // 调用 Context 中的异步处理，允许页面退出
    processBookkeeping(text, image || undefined);
  };

  const handleConfirmBatch = (msgId: string, items: any[]) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    
    const expensesToAdd = items.map(item => ({
      date: item.date || today,
      time: currentTime,
      amount: Number(item.amount),
      type: 'purchase' as const,
      description: item.description,
      icon: 'Sparkles'
    }));
    
    addExpenses(expensesToAdd);
    
    const newHistory = chatHistory.map(m => 
      m.id === msgId ? { ...m, isConfirmed: true } : m
    );
    
    const total = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const feedbackMsg: ChatMessage = { 
      id: (Date.now() + 5).toString(), 
      role: 'assistant', 
      content: `好哒！共 ${items.length} 笔，总计 ¥${total.toFixed(2)} 已经全部记入账本啦！陛下可以在“生活足迹”中看到它们萝～` 
    };
    
    updateChatHistory([...newHistory, feedbackMsg]);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="px-6 pt-12 pb-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-[#F0E6D2] z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-[18px] font-black text-[#5D3A2F] leading-none">萝萝灵感记账</h2>
            <p className="text-[10px] font-bold text-[#FF5C00]/60 mt-1 uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={10} /> AI Assistant
            </p>
          </div>
        </div>
        <button onClick={() => { if(confirm('要清空所有聊天记录吗萝？')) clearChat(); }} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-90 transition-all border border-red-100">
          <Trash2 size={18} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar smooth-scroll pb-24">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] rounded-[28px] p-5 shadow-sm border ${msg.role === 'user' ? 'bg-[#FF5C00] text-white border-[#E65100] rounded-tr-none' : 'bg-white text-[#5D3A2F] border-[#F0E6D2] rounded-tl-none'}`}>
              {msg.image && <img src={msg.image} className="w-full rounded-2xl mb-3 border border-white/20 shadow-sm" alt="Upload" />}
              <p className="text-[15px] font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.data && msg.data.length > 0 && (
                <div className="mt-4 bg-[#FFF9E8]/30 rounded-2xl p-4 border border-[#F0E6D2] space-y-3 shadow-inner text-[#5D3A2F]">
                  <div className="flex justify-between items-center border-b border-[#F0E6D2]/50 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><ListChecks size={12} /> 识别到 {msg.data.length} 笔支出</span>
                    {msg.isConfirmed && <span className="text-[10px] font-black text-green-500 flex items-center gap-1"><CheckCircle size={12} /> 已入账</span>}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar py-1">
                    {msg.data.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white/60 p-3 rounded-xl border border-[#F0E6D2]/50">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-black truncate">{item.description}</p>
                          <p className="text-[#B45309]/30 text-[9px] font-bold">{item.category} · {item.date}</p>
                        </div>
                        <div className="text-right shrink-0"><span className="text-[#FF5C00] font-black text-sm">¥{Number(item.amount).toFixed(2)}</span></div>
                      </div>
                    ))}
                  </div>
                  {!msg.isConfirmed && (
                    <button onClick={() => handleConfirmBatch(msg.id, msg.data)} className="w-full py-3.5 bg-[#FF5C00] text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-[#E65100]">
                      <CheckCircle2 size={14} /> 一键全部入账
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isAiProcessing && (
          <div className="flex items-start gap-3 animate-fade-in">
             <div className="bg-white border border-[#F0E6D2] px-6 py-4 rounded-[28px] rounded-tl-none flex items-center gap-3 shadow-sm">
                <Loader2 size={16} className="text-[#FF5C00] animate-spin" />
                <span className="text-xs font-black text-[#B45309]/40">萝萝正在分析账单萝，你可以先去看看别的页面...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 pb-10 bg-white border-t border-[#F0E6D2] shrink-0 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        {selectedImage && (
          <div className="mb-4 relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FF5C00] shadow-md animate-scale-up">
            <img src={selectedImage} className="w-full h-full object-cover" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-[#FFF9E8]/50 border-2 border-[#F0E6D2] rounded-[30px] p-2 pl-5 transition-all focus-within:border-[#FF5C00] focus-within:bg-white shadow-inner">
          <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="记一笔，或发个小票截图..." className="flex-1 bg-transparent border-none outline-none font-bold text-[#5D3A2F] text-[15px] py-2" />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 rounded-full flex items-center justify-center text-[#B45309]/30 hover:text-[#FF5C00] transition-colors active:scale-90"><Camera size={22} /></button>
          <button onClick={handleSend} disabled={(!inputText.trim() && !selectedImage) || isAiProcessing} className="w-11 h-11 bg-[#FF5C00] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><Send size={20} className="ml-0.5" /></button>
        </div>
      </div>
    </div>
  );
};

export default AIBookkeeping;
