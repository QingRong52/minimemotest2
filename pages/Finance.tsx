
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Coins, 
  Plus, X, Trash2, Wallet, PieChart, Sparkles, Edit3,
  Pizza, Home, Key, Gamepad2, ChevronRight
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { LuluSleep } from '../components/LuluIcons';
import { useKitchen } from '../KitchenContext';
import { ExpenseRecord } from '../types';

const FINANCE_CATEGORIES = [
  { id: 'eat', label: '吃', icon: Pizza, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'life', label: '生活', icon: Home, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'rent', label: '房租', icon: Key, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'play', label: '娱乐', icon: Gamepad2, color: 'text-green-500', bg: 'bg-green-50' },
];

const Finance: React.FC = () => {
  const navigate = useNavigate();
  const { 
    expenseRecords, monthlyBudget, setMonthlyBudget, 
    categoryBudgets, setCategoryBudgets,
    addExpense, updateExpense, deleteExpense 
  } = useKitchen();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null);
  
  const [tempTotalBudget, setTempTotalBudget] = useState(monthlyBudget.toString());
  const [tempCatBudgets, setTempCatBudgets] = useState({
    eat: categoryBudgets.eat.toString(),
    life: categoryBudgets.life.toString(),
    rent: categoryBudgets.rent.toString(),
    play: categoryBudgets.play.toString(),
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [logDesc, setLogDesc] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logDate, setLogDate] = useState(todayStr);
  const [logCatId, setLogCatId] = useState('eat');

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
    const catSpent = {
      eat: cycleExpenses.filter(e => e.category === 'eat').reduce((sum, e) => sum + e.amount, 0),
      life: cycleExpenses.filter(e => e.category === 'life').reduce((sum, e) => sum + e.amount, 0),
      rent: cycleExpenses.filter(e => e.category === 'rent').reduce((sum, e) => sum + e.amount, 0),
      play: cycleExpenses.filter(e => e.category === 'play').reduce((sum, e) => sum + e.amount, 0),
    };

    const budgetProgress = Math.min((totalSpent / (monthlyBudget || 1)) * 100, 100);
    const diffTime = Math.abs(now.getTime() - budgetCycle.start.getTime());
    const daysPassed = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    const dailyAvg = (totalSpent / daysPassed).toFixed(1);

    return { totalSpent, catSpent, budgetProgress, dailyAvg };
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

  const purchaseRecords = useMemo(() => expenseRecords.filter(e => e.date === selectedDate && e.type === 'purchase'), [expenseRecords, selectedDate]);
  const dayTotalSpend = useMemo(() => purchaseRecords.reduce((sum, e) => sum + e.amount, 0), [purchaseRecords]);

  const handleSaveBudget = () => {
    setMonthlyBudget(Number(tempTotalBudget) || 2000);
    setCategoryBudgets({
      eat: Number(tempCatBudgets.eat) || 0,
      life: Number(tempCatBudgets.life) || 0,
      rent: Number(tempCatBudgets.rent) || 0,
      play: Number(tempCatBudgets.play) || 0,
    });
    setIsBudgetModalOpen(false);
  };

  const handleOpenLog = (record?: ExpenseRecord) => {
    if (record) {
      setEditingRecord(record);
      setLogDesc(record.description);
      setLogAmount(record.amount.toString());
      setLogDate(record.date);
      setLogCatId(record.category || 'eat');
    } else {
      setEditingRecord(null);
      setLogDesc('');
      setLogAmount('');
      setLogDate(selectedDate);
      setLogCatId('eat');
    }
    setIsLogModalOpen(true);
  };

  const handleQuickLog = () => {
    if (!logDesc || !logAmount) return;
    const saveNow = new Date();
    const currentTime = `${saveNow.getHours().toString().padStart(2, '0')}:${saveNow.getMinutes().toString().padStart(2, '0')}`;
    if (editingRecord) {
      updateExpense(editingRecord.id, { date: logDate, amount: Number(logAmount), description: logDesc, category: logCatId, icon: logCatId });
    } else {
      addExpense({ date: logDate, time: currentTime, amount: Number(logAmount), type: 'purchase', description: logDesc, category: logCatId, icon: logCatId });
    }
    setIsLogModalOpen(false);
  };

  const getDayTotal = (dayNum: number) => {
    const dStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    return expenseRecords.filter(e => e.date === dStr && e.type === 'purchase').reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="flex justify-between items-center px-5 pt-12 pb-5 bg-white z-20 border-b border-[#F0E6D2]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF9E8] rounded-2xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] shadow-sm">
            <PieChart size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-[20px] font-black text-[#5D3A2F]">厨神账本</h1>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/ai-bookkeeping')} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5C00] to-[#FF9A2E] flex items-center justify-center text-white shadow-md"><Sparkles size={16} /></button>
          <button onClick={() => setIsBudgetModalOpen(true)} className="w-9 h-9 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2]"><Wallet size={18} /></button>
          <button onClick={() => handleOpenLog()} className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shadow-md"><Plus size={20} strokeWidth={3} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-32 space-y-6">
        {/* 总预算卡片 - 紧凑化 */}
        <div className="bg-white p-5 rounded-[30px] border border-[#F0E6D2] shadow-sm animate-fade-in">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#B45309]/50 text-[9px] font-black uppercase tracking-wider mb-0.5">本期总预算 (15日结)</p>
              <h2 className="text-[28px] font-black text-[#5D3A2F] tracking-tighter">¥{monthlyBudget}</h2>
            </div>
            <div className="bg-[#FFF3D3] px-3 py-2 rounded-2xl text-center">
              <p className="text-sm font-black text-[#FF5C00]">{stats.budgetProgress.toFixed(0)}%</p>
            </div>
          </div>
          <div className="h-2 w-full bg-[#FFF9E8] rounded-full overflow-hidden mb-4">
            <div className={`h-full transition-all duration-1000 ${stats.budgetProgress > 90 ? 'bg-red-500' : 'bg-[#FF5C00]'}`} style={{ width: `${stats.budgetProgress}%` }}></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {FINANCE_CATEGORIES.map(cat => {
              const spent = (stats.catSpent as any)[cat.id] || 0;
              const budget = (categoryBudgets as any)[cat.id] || 0;
              const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              return (
                <div key={cat.id} className="bg-[#FEFFF9] p-2.5 rounded-xl border border-[#F0E6D2]/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <cat.icon size={12} className={cat.color} />
                    <span className="text-[8px] font-black text-[#B45309]/40">¥{spent}/{budget}</span>
                  </div>
                  <div className="h-1 w-full bg-white rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color.replace('text', 'bg')} opacity-60 transition-all duration-700`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 生活足迹 - 优化单元格尺寸 */}
        <div className="bg-white p-5 rounded-[32px] shadow-sm border border-[#F0E6D2] animate-fade-in">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-black text-xs text-[#5D3A2F] flex items-center gap-1.5"><CalendarIcon size={16} className="text-[#FF5C00]" /> 生活足迹</h3>
            <span className="text-[10px] font-black text-[#B45309]/30">{currentYear}.{currentMonth + 1}</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['一','二','三','四','五','六','日'].map(d => <div key={d} className="text-center text-[9px] font-black text-[#B45309]/20 pb-1">{d}</div>)}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
              const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
              const isSelected = selectedDate === dateStr;
              const dailyTotal = getDayTotal(day);
              return (
                <button key={idx} onClick={() => setSelectedDate(dateStr)} className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative ${isSelected ? 'bg-[#FF5C00] text-white shadow-md' : 'bg-[#FFF9E8]/30 border border-[#F0E6D2]/40'}`}>
                  <span className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-[#5D3A2F]/60'}`}>{day}</span>
                  {dailyTotal > 0 && <span className={`text-[6px] font-bold absolute bottom-0.5 leading-none ${isSelected ? 'text-white/80' : 'text-[#FF5C00]'}`}>{Math.round(dailyTotal)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 明细列表 - 优化间距 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-[13px] font-black text-[#5D3A2F]">{selectedDate.split('-')[2]}日 明细</h3>
             <span className="text-[10px] font-bold text-[#FF5C00] bg-[#FFF9E8] px-2 py-0.5 rounded-full">¥{dayTotalSpend.toFixed(1)}</span>
          </div>
          {purchaseRecords.length > 0 ? (
            <div className="space-y-2">
              {purchaseRecords.map(pr => (
                <div key={pr.id} className="bg-white border border-[#F0E6D2]/60 p-3.5 rounded-[22px] flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#FEFFF9] rounded-xl flex items-center justify-center border border-[#F0E6D2]/30 shrink-0">
                      {FINANCE_CATEGORIES.find(c => c.id === pr.category)?.icon && React.createElement(FINANCE_CATEGORIES.find(c => c.id === pr.category)!.icon, { size: 16, className: FINANCE_CATEGORIES.find(c => c.id === pr.category)!.color })}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-black text-[#5D3A2F] block truncate">{pr.description}</span>
                      <span className="text-[8px] font-bold text-[#B45309]/30 uppercase">{FINANCE_CATEGORIES.find(c => c.id === pr.category)?.label || '其他'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#FF5C00]">¥{pr.amount.toFixed(1)}</span>
                    <button onClick={() => handleOpenLog(pr)} className="p-1.5 text-[#B45309]/20"><Edit3 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center opacity-20">
               <LuluSleep size={100} />
               <p className="text-[11px] font-black mt-2">暂无开销萝</p>
            </div>
          )}
        </div>
      </div>

      {/* 记账弹窗优化 */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] rounded-t-[40px] p-6 animate-slide-up flex flex-col shadow-2xl">
            <div className="w-10 h-1 bg-[#5D3A2F]/10 rounded-full mx-auto mb-6 shrink-0"></div>
            <header className="flex justify-between items-center mb-6">
               <h2 className="text-lg font-black text-[#5D3A2F]">{editingRecord ? '调整记账' : '速记一笔'}</h2>
               <button onClick={() => setIsLogModalOpen(false)} className="text-[#FF5C00]"><X size={22} /></button>
            </header>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-5 mb-5 border-b border-[#F0E6D2]/50">
               {FINANCE_CATEGORIES.map(cat => (
                 <button key={cat.id} onClick={() => setLogCatId(cat.id)} className={`flex flex-col items-center gap-1.5 min-w-[64px] py-3 rounded-2xl transition-all ${logCatId === cat.id ? 'bg-[#FF5C00] text-white shadow-md' : 'bg-white border border-[#F0E6D2] text-[#B45309]/30'}`}>
                   <cat.icon size={18} /><span className="text-[9px] font-black">{cat.label}</span>
                 </button>
               ))}
            </div>
            <div className="space-y-4 mb-8">
               <input value={logDesc} onChange={e => setLogDesc(e.target.value)} placeholder="买了什么萝？" className="w-full bg-white border border-[#F0E6D2] px-5 py-3.5 rounded-xl font-black text-sm outline-none" />
               <input type="number" value={logAmount} onChange={e => setLogAmount(e.target.value)} placeholder="金额 ¥" className="w-full bg-white border border-[#F0E6D2] px-5 py-4 rounded-xl font-black text-[#FF5C00] text-xl outline-none" />
            </div>
            <button onClick={handleQuickLog} className="w-full py-4 bg-[#FF5C00] text-white rounded-2xl font-black shadow-lg border-b-4 border-[#E65100] active:scale-95 transition-all">确认入账</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
