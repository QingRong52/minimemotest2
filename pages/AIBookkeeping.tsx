
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Send, Camera, Sparkles, 
  Trash2, CheckCircle2, X, Loader2, ListChecks, CheckCircle, Wifi, WifiOff, Cpu, Info, AlertTriangle, Key, ExternalLink, RefreshCw
} from 'lucide-react';
import { useKitchen, ChatMessage } from '../KitchenContext';

// 声明全局 AI Studio 扩展接口
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

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

  // 处理 API Key 修复
  const handleFixApiKey = async () => {
    try {
      // 调起官方密钥选择器
      await window.aistudio.openSelectKey();
      
      // 关闭面板
      setShowStatusTip(false);
      
      // 规范：授权后假定成功，尝试自动重试最后一条用户指令
      const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        processBookkeeping(lastUserMsg.content, lastUserMsg.image);
      }
    } catch (err) {
      console.error("无法调起密钥选择器:", err);
    }
  };

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
    
    const feedbackMsg: ChatMessage = { 
      id: (Date.now() + 5).toString(), 
      role: 'assistant', 
      content: `好哒！萝萝已经帮陛下存入本地账本啦！`,
      brainSource: 'local'
    };
    
    updateChatHistory([...newHistory, feedbackMsg]);
  };

  // 精准识别 Key 失效错误 (400)
  const isKeyInvalid = lastError?.includes('API_KEY_INVALID') || lastError?.includes('400');

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
                  : (isKeyInvalid ? 'bg-red-500 text-white animate-pulse shadow-sm' : (lastError ? 'bg-amber-100 text-amber-500' : 'bg-green-50 text-green-500'))
                }`}
               >
                 {isOfflineMode ? <WifiOff size={10} /> : (isKeyInvalid ? <Key size={10} /> : (lastError ? <AlertTriangle size={10} /> : <Wifi size={10} />))}
                 {isOfflineMode ? '本地离线' : (isKeyInvalid ? '钥匙失效' : (lastError ? '连接受阻' : '云端在线'))}
               </button>
            </div>

            {showStatusTip && (
              <div className="absolute top-10 left-0 w-72 bg-white border border-[#F0E6D2] rounded-[32px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[100] animate-fade-in text-[#5D3A2F]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#B45309]/40 flex items-center gap-1.5">
                    <Info size={12} /> 通道连接诊断
                  </span>
                  <button onClick={() => setShowStatusTip(false)} className="w-6 h-6 rounded-full bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00]"><X size={12} /></button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[#FEFFF9] p-3 rounded-2xl border border-[#F0E6D2]/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold opacity-60">网络魔法状态</span>
                      <div className={`flex items-center gap-1 text-[10px] font-black ${navigator.onLine ? 'text-green-500' : 'text-red-500'}`}>
                        {navigator.onLine ? '正常' : '断开'} <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold opacity-60">API Key 校验</span>
                      <div className={`w-2 h-2 rounded-full ${isKeyInvalid ? 'bg-red-500' : (lastError ? 'bg-amber-500' : 'bg-green-500')}`}></div>
                    </div>
                  </div>

                  {isKeyInvalid && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 space-y-3">
                      <p className="text-[11px] font-black text-red-600 flex items-center gap-1">
                        <AlertTriangle size={12} /> 陛下的通行证无效萝！
                      </p>
                      <p className="text-[9px] text-red-500/70 leading-relaxed">
                        目前的 API Key 无法通过验证。即使是免费模式，也需要绑定一个有效的、开启了付费模式（有免费额度）的 Project。
                      </p>
                      <button 
                        onClick={handleFixApiKey}
                        className="w-full py-3 bg-[#FF5C00] text-white rounded-xl font-black text-[11px] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={12} /> 重新授权 API Key
                      </button>
                      <div className="flex flex-col gap-1.5 pt-1">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[8px] font-bold text-[#FF5C00] underline flex items-center gap-1">
                          去 AI Studio 申请免费 Key <ExternalLink size={8} />
                        </a>
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[8px] font-bold text-[#B45309]/30 flex items-center gap-1">
                          查看官方计费/免费额度说明 <ExternalLink size={8} />
                        </a>
                      </div>
                    </div>
                  )}

                  {!isKeyInvalid && lastError && (
                    <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                      <p className="text-[10px] text-amber-600 font-black mb-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> 云端异常报告
                      </p>
                      <p className="text-[8px] text-amber-500/70 font-mono break-all leading-tight italic">
                        {lastError}
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => { setOfflineMode(!isOfflineMode); setShowStatusTip(false); }}
                    className="w-full py-3 bg-[#FFF9E8] rounded-2xl text-[#B45309] text-[10px] font-black border border-[#F0E6D2] active:bg-white"
                  >
                    {isOfflineMode ? '✨ 尝试开启云端同步' : '🔌 切换至纯本地核心'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => { if (window.confirm('要清空记录吗？')) clearChat(); }} className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-90 border border-red-100">
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
                <div className="mt-3 pt-3 border-t border-red-100 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[8px] font-mono text-red-400/80 italic">
                    <Info size={8} /> Diagnostic: {msg.errorCode.substring(0, 50)}...
                  </div>
                  {msg.errorCode.includes('400') && (
                     <button 
                      onClick={handleFixApiKey}
                      className="text-[10px] font-black text-white bg-red-500 px-4 py-2 rounded-xl self-start active:scale-95 shadow-sm flex items-center gap-2"
                    >
                      <RefreshCw size={12} /> 重新授权 API Key 萝
                    </button>
                  )}
                </div>
              )}

              {msg.data && msg.data.length > 0 && (
                <div className="mt-4 bg-[#FFF9E8]/30 rounded-2xl p-4 border border-[#F0E6D2] space-y-3 shadow-inner text-[#5D3A2F]">
                  <div className="flex justify-between items-center border-b border-[#F0E6D2]/50 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ListChecks size={12} /> {msg.brainSource === 'local' ? '本地内核解析' : '智能云端解析'}
                    </span>
                    {msg.isConfirmed && <span className="text-[10px] font-black text-green-500 flex items-center gap-1"><CheckCircle size={12} /> 已存入</span>}
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
                            {item.amount > 0 ? `¥${Number(item.amount).toFixed(2)}` : '待录入'}
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
                      <CheckCircle2 size={14} /> 确认入账
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
                  {isOfflineMode ? 'Lulu-Nano 本地处理中...' : '正在同步云端大脑...'}
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
            placeholder={isOfflineMode ? "本地记账：输入内容..." : "云端记账：发张截图试试？"} 
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
