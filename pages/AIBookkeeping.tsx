
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Camera, Sparkles, 
  Trash2, CheckCircle2, X, Loader2, ListChecks, CheckCircle, Wifi, WifiOff, Cpu, Info, AlertTriangle
} from 'lucide-react';
import { useKitchen, ChatMessage } from '../KitchenContext';

const AIBookkeeping: React.FC = () => {
  const navigate = useNavigate();
  const { chatHistory, updateChatHistory, addExpenses, clearChat, isAiProcessing, processBookkeeping, isOfflineMode, setOfflineMode, lastError } = useKitchen();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStatusTip, setShowStatusTip] = useState(false);
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
      content: `好哒！萝萝已经帮陛下存入本地账本啦！`,
      brainSource: 'local'
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
          <div className="relative">
            <h2 className="text-[18px] font-black text-[#5D3A2F] leading-none">萝萝记账</h2>
            <div className="mt-1 flex items-center gap-2">
               <button 
                onClick={() => setShowStatusTip(!showStatusTip)}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black transition-all ${
                  isOfflineMode 
                  ? 'bg-gray-100 text-gray-400' 
                  : (lastError ? 'bg-red-50 text-red-400 animate-pulse' : 'bg-green-50 text-green-500 border border-green-200')
                }`}
               >
                 {isOfflineMode ? <WifiOff size={10} /> : (lastError ? <AlertTriangle size={10} /> : <Wifi size={10} />)}
                 {isOfflineMode ? '本地离线' : (lastError ? '云端受限' : '云端在线')}
               </button>
            </div>

            {showStatusTip && (
              <div className="absolute top-10 left-0 w-64 bg-white border border-[#F0E6D2] rounded-2xl p-4 shadow-xl z-[100] animate-fade-in text-[#5D3A2F]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309]/40">诊断信息</span>
                  <button onClick={() => setShowStatusTip(false)}><X size={12} /></button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-bold">系统网络：{navigator.onLine ? '已连接' : '未连接'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${lastError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs font-bold">云端 API：{lastError ? '连接异常' : '就绪'}</span>
                  </div>
                  {lastError && (
                    <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                      <p className="text-[9px] text-red-500 font-mono break-all leading-tight">错误详情: {lastError}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#F0E6D2]/50">
                    <p className="text-[9px] text-[#B45309]/50 font-medium">提示：若已开梯子仍无法连接，请尝试切换节点至“美/日/新加坡”等 Gemini 支持的地区萝！</p>
                  </div>
                  <button 
                    onClick={() => { setOfflineMode(!isOfflineMode); setShowStatusTip(false); }}
                    className="w-full py-2 bg-[#FFF9E8] rounded-xl text-[#FF5C00] text-[10px] font-black border border-[#F0E6D2]"
                  >
                    {isOfflineMode ? '切回云端模式' : '切到强制本地模式'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => { if(confirm('要清空记录吗？')) clearChat(); }} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-90 border border-red-100">
          <Trash2 size={18} />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar smooth-scroll pb-24">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[88%] rounded-[28px] p-5 shadow-sm border relative ${msg.role === 'user' ? 'bg-[#FF5C00] text-white border-[#E65100] rounded-tr-none' : 'bg-white text-[#5D3A2F] border-[#F0E6D2] rounded-tl-none'}`}>
              
              {msg.role === 'assistant' && msg.brainSource && (
                <div className={`absolute -top-3 -right-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm ${msg.brainSource === 'local' ? 'bg-[#5D3A2F] text-[#FFF9E8]' : 'bg-[#FF5C00] text-white'}`}>
                  {msg.brainSource === 'local' ? <Cpu size={8} /> : <Sparkles size={8} />}
                  {msg.brainSource === 'local' ? 'Lulu Nano' : 'Cloud Brain'}
                </div>
              )}

              {msg.image && <img src={msg.image} className="w-full rounded-2xl mb-3 border border-white/20 shadow-sm" alt="Upload" />}
              <p className="text-[15px] font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              
              {msg.errorCode && (
                <div className="mt-2 flex items-center gap-1 text-[8px] font-mono text-red-400/60 uppercase">
                  <Info size={8} /> diagnostic: {msg.errorCode.substring(0, 30)}...
                </div>
              )}

              {msg.data && msg.data.length > 0 && (
                <div className="mt-4 bg-[#FFF9E8]/30 rounded-2xl p-4 border border-[#F0E6D2] space-y-3 shadow-inner text-[#5D3A2F]">
                  <div className="flex justify-between items-center border-b border-[#F0E6D2]/50 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ListChecks size={12} /> {msg.brainSource === 'local' ? '本地核心识别' : '智能云端解析'}
                    </span>
                    {msg.isConfirmed && <span className="text-[10px] font-black text-green-500 flex items-center gap-1"><CheckCircle size={12} /> 已入账</span>}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar py-1">
                    {msg.data.map((item: any, idx: number) => (
                      <div key={idx} className={`flex justify-between items-center bg-white/60 p-3 rounded-xl border border-[#F0E6D2]/50 ${msg.brainSource === 'local' ? 'opacity-80' : ''}`}>
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-black truncate">{item.description}</p>
                          <p className="text-[#B45309]/30 text-[9px] font-bold">{item.category} · {item.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[#FF5C00] font-black text-sm">
                            {item.amount > 0 ? `¥${Number(item.amount).toFixed(2)}` : '待补录'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!msg.isConfirmed && (
                    <button 
                      onClick={() => handleConfirmBatch(msg.id, msg.data)} 
                      className="w-full py-3.5 bg-[#FF5C00] text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-[#E65100]"
                    >
                      <CheckCircle2 size={14} /> {msg.brainSource === 'local' ? '确认结果无误' : '确认入账'}
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
                <span className="text-xs font-black text-[#B45309]/40">
                  {isOfflineMode ? 'Lulu-Nano 本地推理中...' : '正在连线云端分析图像...'}
                </span>
             </div>
          </div>
        )}
      </div>

      <div className="p-6 pb-10 bg-white border-t border-[#F0E6D2] shrink-0 z-50">
        {selectedImage && (
          <div className="mb-4 relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FF5C00] shadow-md animate-scale-up">
            <img src={selectedImage} className="w-full h-full object-cover" />
            <button onClick={() => setSelectedImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-center gap-3 bg-[#FFF9E8]/50 border-2 border-[#F0E6D2] rounded-[30px] p-2 pl-5 transition-all focus-within:border-[#FF5C00] focus-within:bg-white shadow-inner">
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder={isOfflineMode ? "本地核心：输入内容或金额..." : "云端模式：可发截图分析..."} 
            className="flex-1 bg-transparent border-none outline-none font-bold text-[#5D3A2F] text-[15px] py-2" 
          />
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isOfflineMode}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 ${isOfflineMode ? 'text-gray-300' : 'text-[#B45309]/30'}`}
          >
            <Camera size={22} />
          </button>
          
          <button onClick={handleSend} disabled={(!inputText.trim() && !selectedImage) || isAiProcessing} className="w-11 h-11 bg-[#FF5C00] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><Send size={20} className="ml-0.5" /></button>
        </div>
      </div>
    </div>
  );
};

export default AIBookkeeping;
