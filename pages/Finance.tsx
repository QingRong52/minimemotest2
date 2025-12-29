
import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, Calendar as CalendarIcon, Coins, ChefHat, 
  Plus, X, Trash2, Wallet, Utensils, PieChart, Clock, Check, ShoppingBag, Flame, Sparkles, Package, Gift, Ticket, Edit2, Edit3
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { LuluSleep } from '../components/LuluIcons';
import { useKitchen } from '../KitchenContext';
import { ExpenseRecord } from '../types';

const LOG_ICON_OPTIONS = [
  'Coins', 'ShoppingBag', 'Utensils', 'Coffee', 'Apple', 'Pizza', 'Flame', 'Sparkles', 'Package', 'Gift', 'Ticket'
];

const Finance: React.FC = () => {
  const { expenseRecords, monthlyBudget, setMonthlyBudget, addExpense, deleteExpense } = useKitchen();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [logDesc, setLogDesc] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logDate, setLogDate] = useState(todayStr);
  const [logIcon, setLogIcon] = useState('Coins');

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const budgetCycle = useMemo(() => {
    const today = now.getDate();
    let start: Date, end: Date;
    if (today >= 15) {
      start = new Date(currentYear, currentMonth, 15);
      end = new Date(currentYear, currentMonth + 1, 14, 23, 59, 59);
    } else {
      start = new Date(currentYear, currentMonth - 1, 15);
      end = new Date(currentYear, currentMonth, 14, 23, 59, 59);
    }
    return { start, end };
  }, [currentYear, currentMonth, now]);

  const stats = useMemo(() => {
    const cycleExpenses = expenseRecords.filter(e => {
      const d = new Date(e.date);
      return d >= budgetCycle.start && d <= budgetCycle.end;
    });
    const totalSpent = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetProgress = Math.min((totalSpent / (monthlyBudget || 1)) * 100, 100);
    const diffTime = Math.abs(now.getTime() - budgetCycle.start.getTime());
    const daysPassed = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    const dailyAvg = (totalSpent / daysPassed).toFixed(1);
    return { totalSpent, budgetProgress, dailyAvg };
  }, [expenseRecords, monthlyBudget, budgetCycle, now]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth, currentYear]);

  const dayRecords = useMemo(() => expenseRecords.filter(e => e.date === selectedDate), [expenseRecords, selectedDate]);
  const purchaseRecords = dayRecords.filter(e => e.type === 'purchase');
  const cookingRecords = dayRecords.filter(e => e.type === 'cooking');
  const dayTotalSpend = purchaseRecords.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveBudget = () => {
    setMonthlyBudget(Number(tempBudget) || 2000);
    setIsBudgetModalOpen(false);
  };

  const handleQuickLog = () => {
    if (!logDesc || !logAmount) return;
    const saveNow = new Date();
    const currentTime = `${saveNow.getHours().toString().padStart(2, '0')}:${saveNow.getMinutes().toString().padStart(2, '0')}`;
    addExpense({ 
      date: logDate, 
      time: currentTime, 
      amount: Number(logAmount), 
      type: 'purchase', 
      description: logDesc, 
      icon: logIcon 
    });
    setIsLogModalOpen(false);
    setLogDesc('');
    setLogAmount('');
    setLogIcon('Coins');
  };

  const getDayTotal = (dayNum: number) => {
    const dStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    return expenseRecords.filter(e => e.date === dStr && e.type === 'purchase').reduce((sum, e) => sum + e.amount, 0);
  };

  const getLogIcon = (iconName?: string, size = 18) => {
    const IconComponent = (Icons as any)[iconName || 'Coins'] || Icons.Coins;
    return <IconComponent size={size} strokeWidth={2.5} />;
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      {/* 头部固定 */}
      <header className="flex justify-between items-center px-6 pt-12 pb-6 shrink-0 bg-[#FEFFF9]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-[#FFF9E8] rounded-[18px] flex items-center justify-center text-[#FF5C00] shadow-sm border border-[#F0E6D2]">
            <PieChart size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-[24px] font-black text-[#5D3A2F]">厨神账本</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTempBudget(monthlyBudget.toString()); setIsBudgetModalOpen(true); }} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 shadow-sm"><Wallet size={20} /></button>
          <button onClick={() => setIsLogModalOpen(true)} className="w-10 h-10 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shadow-lg active:scale-90"><Plus size={20} strokeWidth={3} /></button>
        </div>
      </header>

      {/* 滚动区域 */}
      <div className="flex-1 overflow-y-auto smooth-scroll no-scrollbar px-6 pb-40">
        {/* 预算仪表盘 */}
        <div className="bg-white p-6 rounded-[35px] border border-[#F0E6D2] shadow-sm mb-8 relative">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <span className="text-[#B45309]/50 text-[10px] font-black uppercase tracking-widest mb-1">本期预算 (15日结)</span>
              <div className="flex items-center">
                <span className="text-[32px] font-black text-[#5D3A2F] tracking-tighter mr-1">¥</span>
                <span className="text-[32px] font-black text-[#5D3A2F] tracking-tighter">{monthlyBudget}</span>
              </div>
            </div>
            <div className="bg-[#FFF3D3] p-4 rounded-3xl text-center min-w-[100px] shadow-inner">
              <p className="text-[#B45309]/50 text-[10px] font-black uppercase mb-0.5">日均支出</p>
              <p className="text-xl font-black text-[#FF5C00]">¥{stats.dailyAvg}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-[#FFF9E8] rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-1000 ${stats.budgetProgress > 90 ? 'bg-red-500' : 'bg-[#FF5C00]'}`} style={{ width: `${stats.budgetProgress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-black">
              <span className={stats.budgetProgress > 90 ? 'text-red-500' : 'text-[#FF5C00]'}>已消 {stats.totalSpent} ({stats.budgetProgress.toFixed(1)}%)</span>
              <span className="text-[#B45309]/30">剩余 ¥{Math.max(monthlyBudget - stats.totalSpent, 0)}</span>
            </div>
          </div>
        </div>

        {/* 日历 */}
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-[#F0E6D2] mb-8">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="font-black text-sm flex items-center gap-2 text-[#5D3A2F]"><CalendarIcon size={18} className="text-[#FF5C00]" />生活足迹</h3>
            <span className="text-[11px] font-black text-[#B45309]/40">{currentYear}年 {currentMonth + 1}月</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {['一','二','三','四','五','六','日'].map(d => <div key={d} className="text-center text-[10px] font-black text-[#B45309]/30 mb-2">{d}</div>)}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
              const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
              const isSelected = selectedDate === dateStr;
              const hasCooking = expenseRecords.some(e => e.date === dateStr && e.type === 'cooking');
              const dailyTotal = getDayTotal(day);
              return (
                <button 
                  key={idx} 
                  onClick={() => setSelectedDate(dateStr)} 
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${
                    isSelected ? 'bg-[#FF5C00] text-white shadow-lg scale-110 z-10' : 'bg-[#FFF9E8]/40 border border-[#F0E6D2]'
                  }`}
                >
                  <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-[#5D3A2F]/60'}`}>{day}</span>
                  {dailyTotal > 0 && <span className={`text-[7px] font-black mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#FF5C00]/80'}`}>¥{Math.round(dailyTotal)}</span>}
                  {hasCooking && <div className={`w-1 h-1 rounded-full absolute top-1 right-1 ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 记录明细 */}
        <div className="space-y-10 pb-10">
          <h3 className="text-[14px] font-black text-[#5D3A2F] flex items-center gap-2 px-1">
            {selectedDate.split('-')[2]}日 明细
            <span className="text-[10px] font-bold text-[#B45309]/30 bg-[#FFF9E8] px-2 py-0.5 rounded-full border border-[#F0E6D2]">总花销 ¥{dayTotalSpend}</span>
          </h3>

          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-[#B45309]/40 uppercase tracking-widest px-1">今日烹饪</h4>
            {cookingRecords.length > 0 ? (
              <div className="grid gap-2">
                {cookingRecords.map(cr => (
                  <div key={cr.id} className="bg-green-50/50 border border-green-100 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white"><ChefHat size={20} /></div>
                    <span className="font-black text-[#5D3A2F] text-sm">{cr.description}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center opacity-30 border-2 border-dashed border-[#F0E6D2] rounded-[30px]"><LuluSleep size={100} /><p className="text-xs font-black mt-2">暂无烹饪</p></div>
            )}
          </section>

          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-[#B45309]/40 uppercase tracking-widest px-1">今日花销</h4>
            {purchaseRecords.length > 0 ? (
              <div className="grid gap-2">
                {purchaseRecords.map(pr => (
                  <div key={pr.id} className="bg-white border border-[#F0E6D2] p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#FF5C00]">{getLogIcon(pr.icon || 'Coins', 18)}</div>
                      <span className="text-[13px] font-black text-[#5D3A2F]">{pr.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#FF5C00]">¥{pr.amount}</span>
                      <button onClick={() => deleteExpense(pr.id)} className="p-2 text-red-200 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center opacity-30 border-2 border-dashed border-[#F0E6D2] rounded-[30px]"><LuluSleep size={100} /><p className="text-xs font-black mt-2">暂无开销</p></div>
            )}
          </section>
        </div>
      </div>

      {/* 弹窗部分 */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-md flex items-center justify-center animate-fade-in px-8">
          <div className="bg-[#FEFFF9] w-full max-w-[280px] rounded-[45px] p-8 shadow-2xl animate-scale-up border border-white/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-[#5D3A2F]">周期预算</h2>
              <button onClick={() => setIsBudgetModalOpen(false)} className="p-2 text-[#FF5C00]"><X size={16} strokeWidth={3} /></button>
            </div>
            <div className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5C00] font-black text-xl">¥</span>
                <input type="number" value={tempBudget} onChange={e => setTempBudget(e.target.value)} className="w-full bg-[#FFF9E8]/30 border-2 border-[#F0E6D2] pl-10 pr-5 py-4 rounded-2xl font-black text-[#FF5C00] text-2xl outline-none" placeholder="2000" />
              </div>
              <button onClick={handleSaveBudget} className="w-full h-14 bg-[#FF5C00] text-white rounded-[22px] font-black shadow-xl active:scale-95 transition-all">保存设置</button>
            </div>
          </div>
        </div>
      )}

      {isLogModalOpen && (
        <div className="fixed inset-0 z-[2100] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[80%] rounded-t-[50px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40 overflow-hidden">
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-6 shrink-0"></div>
            <header className="flex justify-between items-center mb-8 shrink-0 px-2">
              <h2 className="text-xl font-black text-[#5D3A2F]">随手记一笔</h2>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 text-[#FF5C00]"><X size={20} strokeWidth={3} /></button>
            </header>
            <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll space-y-6 pb-32">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest px-2 block">消费内容</label>
                <input value={logDesc} onChange={e => setLogDesc(e.target.value)} placeholder="买了什么？" className="w-full bg-white border-2 border-[#F0E6D2] px-5 py-3.5 rounded-[22px] font-black text-base outline-none shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 px-2 block uppercase tracking-widest">金额 (¥)</label>
                  <input type="number" value={logAmount} onChange={e => setLogAmount(e.target.value)} placeholder="0.00" className="w-full bg-white border-2 border-[#F0E6D2] px-5 py-3 rounded-[18px] font-black text-[#FF5C00] outline-none shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#B45309]/30 px-2 block uppercase tracking-widest">日期</label>
                  <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full bg-white border-2 border-[#F0E6D2] px-4 py-3 rounded-[18px] font-black text-[#5D3A2F] text-xs outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#B45309]/30 px-2 block uppercase tracking-widest">挑选图标</label>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {LOG_ICON_OPTIONS.map(icon => (
                    <button key={icon} onClick={() => setLogIcon(icon)} className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${logIcon === icon ? 'bg-[#FF5C00] text-white border-[#FF5C00]' : 'bg-white border-[#F0E6D2] text-[#B45309]/20'}`}>{getLogIcon(icon, 20)}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FEFFF9] to-transparent shrink-0">
              <button onClick={handleQuickLog} className="w-full h-14 bg-[#FF5C00] text-white rounded-[24px] font-black shadow-xl active:scale-95 transition-all">记入账本萝</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes scale-up { from { transform: scale(0.9) opacity: 0; } to { transform: scale(1) opacity: 1; } }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Finance;
