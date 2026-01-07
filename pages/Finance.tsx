
import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Coins, 
  Plus, X, Trash2, Wallet, PieChart as PieChartIcon, Sparkles, Edit3,
  Pizza, Home, Key, Gamepad2, ChevronRight, BarChart3, TrendingUp, AlertCircle, Info, ArrowUpRight, ArrowDownRight, Target, LayoutGrid, Layers, Filter, Activity, Edit
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as ReTooltip, LabelList
} from 'recharts';
import * as Icons from 'lucide-react';
import { LuluSleep, LuluSearch, LuluChef } from '../components/LuluIcons';
import { useKitchen } from '../KitchenContext';
import { ExpenseRecord } from '../types';

const FINANCE_CATEGORIES = [
  { id: 'eat', label: '吃', icon: Pizza, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', chartColor: '#FF5C00' },
  { id: 'life', label: '生活', icon: Home, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', chartColor: '#F59E0B' },
  { id: 'rent', label: '房租', icon: Key, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', chartColor: '#F43F5E' },
  { id: 'play', label: '娱乐', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', chartColor: '#A855F7' },
];

const Finance: React.FC = () => {
  const navigate = useNavigate();
  const { 
    expenseRecords, monthlyBudget, setMonthlyBudget, 
    categoryBudgets, setCategoryBudgets,
    addExpense, updateExpense, deleteExpense, setIsGlobalModalOpen
  } = useKitchen();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedStatsCategory, setSelectedStatsCategory] = useState<string>('all');
  const [statsTimeRange, setStatsTimeRange] = useState<'week' | 'cycle' | 'month' | 'year'>('week');
  const [calendarFilter, setCalendarFilter] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null);
  
  const [tempTotalBudget, setTempTotalBudget] = useState((monthlyBudget || 0).toString());
  const [tempCatBudgets, setTempCatBudgets] = useState({
    eat: (categoryBudgets?.eat || 0).toString(),
    life: (categoryBudgets?.life || 0).toString(),
    rent: (categoryBudgets?.rent || 0).toString(),
    play: (categoryBudgets?.play || 0).toString(),
  });

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [logDesc, setLogDesc] = useState('');
  const [logAmount, setLogAmount] = useState('');
  const [logDate, setLogDate] = useState(todayStr);
  const [logCatId, setLogCatId] = useState('eat');

  useEffect(() => {
    setIsGlobalModalOpen(isBudgetModalOpen || isLogModalOpen || isStatsModalOpen);
    return () => setIsGlobalModalOpen(false);
  }, [isBudgetModalOpen, isLogModalOpen, isStatsModalOpen, setIsGlobalModalOpen]);

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
    const daysPassed = Math.max(Math.ceil(Math.abs(now.getTime() - budgetCycle.start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const dailyAvg = (totalSpent / daysPassed).toFixed(1);

    const catDailyAvg = {
      eat: (catSpent.eat / daysPassed).toFixed(1),
      life: (catSpent.life / daysPassed).toFixed(1),
      rent: (catSpent.rent / daysPassed).toFixed(1),
      play: (catSpent.play / daysPassed).toFixed(1),
    };

    return { totalSpent, catSpent, budgetProgress, dailyAvg, cycleExpenses, daysPassed, catDailyAvg };
  }, [expenseRecords, monthlyBudget, budgetCycle, now]);

  const chartData = useMemo(() => {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    if (statsTimeRange === 'year') {
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return { 
          year: d.getFullYear(), 
          month: d.getMonth() + 1, 
          label: `${d.getMonth() + 1}月` 
        };
      });

      return last12Months.map(m => {
        const monthPrefix = `${m.year}-${m.month.toString().padStart(2, '0')}`;
        const monthRecords = expenseRecords.filter(e => e.date.startsWith(monthPrefix) && e.type === 'purchase');
        const filtered = selectedStatsCategory === 'all' ? monthRecords : monthRecords.filter(e => e.category === selectedStatsCategory);
        return { name: m.label, amount: filtered.reduce((sum, e) => sum + e.amount, 0) };
      });
    }

    let length = 7;
    if (statsTimeRange === 'cycle') length = 15;
    if (statsTimeRange === 'month') length = 30;

    const days = Array.from({ length }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (length - 1 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(dateStr => {
      const dayRecords = expenseRecords.filter(e => e.date === dateStr && e.type === 'purchase');
      const filtered = selectedStatsCategory === 'all' ? dayRecords : dayRecords.filter(e => e.category === selectedStatsCategory);
      const d = new Date(dateStr);
      return {
        name: `${dateStr.split('-')[2]}日(${weekDays[d.getDay()]})`,
        amount: filtered.reduce((sum, e) => sum + e.amount, 0)
      };
    });
  }, [expenseRecords, selectedStatsCategory, statsTimeRange]);

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
    if (!logAmount) return;
    const categoryName = FINANCE_CATEGORIES.find(c => c.id === logCatId)?.label || '日常';
    const finalDesc = logDesc.trim() || `${categoryName}支出`;
    const saveNow = new Date();
    const currentTime = `${saveNow.getHours().toString().padStart(2, '0')}:${saveNow.getMinutes().toString().padStart(2, '0')}`;
    
    if (editingRecord) {
      updateExpense(editingRecord.id, { date: logDate, amount: Number(logAmount), description: finalDesc, category: logCatId, icon: logCatId });
    } else {
      addExpense({ date: logDate, time: currentTime, amount: Number(logAmount), type: 'purchase', description: finalDesc, category: logCatId, icon: logCatId });
    }
    setIsLogModalOpen(false);
  };

  const getDayAmount = (dayNum: number, filter: string) => {
    const dStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    const dayRecords = expenseRecords.filter(e => e.date === dStr && e.type === 'purchase');
    const filtered = filter === 'all' ? dayRecords : dayRecords.filter(e => e.category === filter);
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="flex justify-between items-center px-5 pt-12 pb-5 bg-white z-20 border-b border-[#F0E6D2]/20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2]">
            <PieChartIcon size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-[20px] font-black text-[#5D3A2F]">厨神账本</h1>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate('/ai-bookkeeping')} className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5C00] to-[#FF9A2E] flex items-center justify-center text-white shadow-md active:scale-95 transition-all"><Sparkles size={16} /></button>
          <button onClick={() => { setSelectedStatsCategory('all'); setIsStatsModalOpen(true); }} className="w-9 h-9 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-95 transition-all"><BarChart3 size={18} /></button>
          <button onClick={() => handleOpenLog()} className="w-9 h-9 rounded-xl bg-[#FF5C00] flex items-center justify-center text-white shadow-md active:scale-95 transition-all"><Plus size={20} strokeWidth={3} /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-32 space-y-6">
        {/* 核心预算看板 - 修改圆角为 24px 并增加预算修改入口 */}
        <div 
          onClick={() => { setSelectedStatsCategory('all'); setIsStatsModalOpen(true); }}
          className="bg-white p-6 rounded-[24px] border border-[#F0E6D2] shadow-[0_12px_40px_rgba(180,83,9,0.08)] animate-fade-in cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-start mb-5">
            <div className="flex flex-col">
              <p className="text-[#B45309]/50 text-[10px] font-black uppercase tracking-wider mb-1">本期预算剩余 (至14日)</p>
              <div className="flex items-center gap-3">
                <h2 className="text-[36px] font-black text-[#5D3A2F] tracking-tighter leading-none">
                  ¥{(monthlyBudget - stats.totalSpent).toFixed(1)}
                </h2>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsBudgetModalOpen(true); }}
                  className="p-1.5 bg-[#FFF9E8] rounded-lg text-[#FF5C00] border border-[#F0E6D2] hover:bg-orange-50 transition-colors"
                >
                  <Edit3 size={16} />
                </button>
              </div>
            </div>
            <div className="bg-[#FFF3D3] px-4 py-2.5 rounded-[16px] text-center border border-[#F0E6D2]/50">
              <p className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest mb-0.5">已用</p>
              <p className="text-xl font-black text-[#FF5C00]">{stats.budgetProgress.toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="h-3 w-full bg-[#FFF9E8] rounded-full overflow-hidden mb-8 relative shadow-inner">
            <div className={`h-full transition-all duration-1000 ease-out ${stats.budgetProgress > 90 ? 'bg-rose-500' : 'bg-[#FF5C00]'}`} style={{ width: `${stats.budgetProgress}%` }}></div>
            <div className="absolute top-0 bottom-0 w-0.5 bg-[#5D3A2F]/15" style={{ left: `${(stats.daysPassed/30)*100}%` }}></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {FINANCE_CATEGORIES.map(cat => {
              const spent = (stats.catSpent as any)[cat.id] || 0;
              const budget = (categoryBudgets as any)[cat.id] || 0;
              const diff = budget - spent;
              const isOver = diff < 0;
              
              return (
                <div key={cat.id} 
                  onClick={(e) => { e.stopPropagation(); setSelectedStatsCategory(cat.id); setIsStatsModalOpen(true); }}
                  className={`p-4 rounded-[20px] border ${cat.bg} ${cat.border} transition-all relative overflow-hidden group hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <cat.icon size={16} className={cat.color} />
                      <span className="text-[12px] font-black text-[#5D3A2F]">{cat.label}</span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isOver ? 'bg-rose-100 text-rose-500' : 'bg-white/80 text-[#FF9A2E]'}`}>
                      {isOver ? '超 ¥' + Math.abs(diff).toFixed(0) : '剩 ¥' + diff.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden relative z-10 shadow-sm">
                    <div className={`h-full ${isOver ? 'bg-rose-400' : (cat.id === 'life' ? 'bg-amber-400' : cat.color.replace('text', 'bg'))} opacity-80`} style={{ width: `${budget > 0 ? Math.min((spent/budget)*100, 100) : 0}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 快速概览面板 - 修正圆角 */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[24px] border border-[#F0E6D2] shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5C00] shrink-0 border border-orange-100 shadow-inner">
                 <TrendingUp size={20} />
               </div>
               <div className="min-w-0">
                 <p className="text-[9px] font-black text-[#B45309]/30 uppercase truncate tracking-widest">日均消耗</p>
                 <p className="text-base font-black text-[#5D3A2F] truncate">¥{stats.dailyAvg}</p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-[24px] border border-[#F0E6D2] shadow-sm flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 border border-amber-100 shadow-inner">
                 <Target size={20} />
               </div>
               <div className="min-w-0">
                 <p className="text-[9px] font-black text-[#B45309]/30 uppercase truncate tracking-widest">账期剩余</p>
                 <p className="text-base font-black text-[#5D3A2F] truncate">{Math.max(0, 30 - stats.daysPassed)} 天</p>
               </div>
            </div>
        </div>

        {/* 生活足迹 - 修正圆角 */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F0E6D2] animate-fade-in space-y-5">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-black text-[14px] text-[#5D3A2F] flex items-center gap-2">
                <CalendarIcon size={18} className="text-[#FF5C00]" /> 生活足迹
              </h3>
              <span className="text-[10px] font-black text-[#B45309]/30 tracking-widest">{currentYear}.{(currentMonth+1).toString().padStart(2,'0')}</span>
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
               <button 
                 onClick={() => setCalendarFilter('all')}
                 className={`px-3 py-1.5 rounded-xl text-[9px] font-black whitespace-nowrap transition-all border ${calendarFilter === 'all' ? 'bg-[#FF5C00] text-white border-transparent' : 'bg-white text-[#B45309]/30 border-[#F0E6D2]'}`}
               >
                 全部
               </button>
               {FINANCE_CATEGORIES.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setCalendarFilter(cat.id)}
                   className={`px-3 py-1.5 rounded-xl text-[9px] font-black whitespace-nowrap transition-all border ${calendarFilter === cat.id ? `${cat.color.replace('text', 'bg')} text-white border-transparent` : 'bg-white text-[#B45309]/30 border-[#F0E6D2]'}`}
                   style={calendarFilter === cat.id ? { backgroundColor: cat.chartColor } : {}}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['一','二','三','四','五','六','日'].map(d => <div key={d} className="text-center text-[10px] font-black text-[#B45309]/20 pb-1">{d}</div>)}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
              const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
              const isSelected = selectedDate === dateStr;
              const amount = getDayAmount(day, calendarFilter);
              
              return (
                <button 
                  key={idx} 
                  onClick={() => setSelectedDate(dateStr)} 
                  className={`aspect-square rounded-[16px] flex flex-col items-center justify-center transition-all relative p-1 ${
                    isSelected ? 'bg-[#FF5C00] text-white shadow-lg scale-110 z-10' : 'bg-[#FFF9E8]/40 border border-[#F0E6D2]/40'
                  }`}
                >
                  <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-[#5D3A2F]/60'}`}>{day}</span>
                  {amount > 0 && (
                    <span className={`text-[7px] font-black truncate max-w-full mt-0.5 leading-none ${isSelected ? 'text-white/80' : 'text-[#FF5C00]'}`}>
                      {amount.toFixed(0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 消费清单 - 修正圆角 */}
        <div className="space-y-4 pb-20">
          <div className="flex justify-between items-center px-2">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF5C00] shadow-[0_0_8px_rgba(255,92,0,0.4)]"></div>
               <h3 className="text-[15px] font-black text-[#5D3A2F]">{selectedDate.split('-')[2]}日 清单</h3>
             </div>
             <span className="text-[11px] font-black text-[#FF5C00] bg-[#FFF9E8] px-4 py-1.5 rounded-full border border-[#F0E6D2]/50">¥{dayTotalSpend.toFixed(1)}</span>
          </div>
          {purchaseRecords.length > 0 ? (
            <div className="space-y-3">
              {purchaseRecords.map(pr => (
                <div key={pr.id} className="bg-white border border-[#F0E6D2]/60 p-5 rounded-[20px] flex justify-between items-center shadow-sm active:bg-[#FEFFF9] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#FEFFF9] rounded-[16px] flex items-center justify-center border border-[#F0E6D2]/30 shrink-0">
                      {FINANCE_CATEGORIES.find(c => c.id === pr.category)?.icon && React.createElement(FINANCE_CATEGORIES.find(c => c.id === pr.category)!.icon, { size: 20, className: FINANCE_CATEGORIES.find(c => c.id === pr.category)!.color })}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[16px] font-black text-[#5D3A2F] block truncate">{pr.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-widest">{FINANCE_CATEGORIES.find(c => c.id === pr.category)?.label || '其他'}</span>
                        {pr.time && <span className="text-[10px] font-bold text-[#B45309]/20">{pr.time}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-black text-[#FF5C00]">¥{pr.amount.toFixed(1)}</span>
                    <button onClick={() => handleOpenLog(pr)} className="p-2 text-[#B45309]/10 active:text-[#FF5C00] transition-colors"><Edit3 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center opacity-30">
               <LuluSleep size={140} />
               <p className="text-[13px] font-black mt-4">今日无开销萝～</p>
            </div>
          )}
        </div>
      </div>

      {/* 御膳数据中心 - 极致多维度统计与具体数目显示 */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-2xl flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[96%] rounded-t-[24px] p-6 animate-slide-up flex flex-col shadow-2xl overflow-hidden border-t border-white/40">
            <div className="w-14 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-6 shrink-0"></div>
            
            <header className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF5C00] border border-orange-100 shadow-sm"><BarChart3 size={24} /></div>
                <div>
                   <h2 className="text-[22px] font-black text-[#5D3A2F] tracking-tighter">御膳数据中心</h2>
                   <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-[0.25em] mt-1">Analytics Hub Pro</p>
                </div>
              </div>
              <button onClick={() => setIsStatsModalOpen(false)} className="w-11 h-11 bg-[#FFF9E8] rounded-full flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all shadow-sm"><X size={22} /></button>
            </header>

            {/* 分类切换器 - 修正圆角 */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 mb-4 shrink-0">
               <button 
                 onClick={() => setSelectedStatsCategory('all')}
                 className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-black text-xs whitespace-nowrap transition-all border ${selectedStatsCategory === 'all' ? 'bg-[#FF5C00] text-white border-transparent shadow-md' : 'bg-white text-[#B45309]/40 border-[#F0E6D2]'}`}
               >
                 <LayoutGrid size={14} /> 全部
               </button>
               {FINANCE_CATEGORIES.map(cat => (
                 <button 
                   key={cat.id}
                   onClick={() => setSelectedStatsCategory(cat.id)}
                   className={`flex items-center gap-2 px-5 py-3 rounded-[16px] font-black text-xs whitespace-nowrap transition-all border ${selectedStatsCategory === cat.id ? `${cat.color.replace('text', 'bg')} text-white border-transparent shadow-md` : 'bg-white text-[#B45309]/40 border-[#F0E6D2]'}`}
                   style={selectedStatsCategory === cat.id ? { backgroundColor: cat.chartColor } : {}}
                 >
                   <cat.icon size={14} /> {cat.label}
                 </button>
               ))}
            </div>

            {/* 时间维度切换器 - 修正圆角 */}
            <div className="flex p-1.5 bg-[#FFF9E8] rounded-[20px] border border-[#F0E6D2]/50 mb-8 shrink-0 shadow-inner">
               {[
                 { id: 'week', label: '周' },
                 { id: 'cycle', label: '15天' },
                 { id: 'month', label: '月' },
                 { id: 'year', label: '年' }
               ].map(range => (
                 <button 
                  key={range.id}
                  onClick={() => setStatsTimeRange(range.id as any)}
                  className={`flex-1 py-3 rounded-[16px] font-black text-xs transition-all ${statsTimeRange === range.id ? 'bg-white text-[#FF5C00] shadow-md' : 'text-[#B45309]/40'}`}
                 >
                   {range.label}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-8">
              {/* 核心趋势图 - 柱状上方显示具体金额，X轴日期显示周几 */}
              <div className="bg-white p-7 rounded-[24px] border border-[#F0E6D2] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-[15px] font-black text-[#5D3A2F] flex items-center gap-2 tracking-tight">
                     支出趋势明细
                   </h3>
                   <div className="px-3 py-1 bg-[#FFF9E8] rounded-full text-[9px] font-black text-[#FF5C00] tracking-widest border border-[#F0E6D2]/50 uppercase">
                     {statsTimeRange.toUpperCase()} DATA
                   </div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 25 }}>
                      <ReTooltip 
                        cursor={{fill: '#FEFFF9'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) return (
                            <div className="bg-[#5D3A2F] text-white p-3 rounded-2xl text-[11px] font-black shadow-2xl border border-white/10">
                              <p className="opacity-50 mb-1">{payload[0].payload.name}</p>
                              <p className="text-base text-[#FF5C00]">¥{payload[0].value.toFixed(1)}</p>
                            </div>
                          );
                          return null;
                        }} 
                      />
                      <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={statsTimeRange === 'year' ? 18 : (statsTimeRange === 'week' ? 32 : 12)}>
                        <LabelList 
                          dataKey="amount" 
                          position="top" 
                          formatter={(val: number) => val > 0 ? val.toFixed(0) : ''} 
                          style={{ fill: '#5D3A2F', fontSize: 10, fontWeight: 900 }} 
                        />
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={selectedStatsCategory === 'all' ? '#FF5C00' : (FINANCE_CATEGORIES.find(c => c.id === selectedStatsCategory)?.chartColor || '#FF5C00')} 
                            fillOpacity={entry.amount > 0 ? 1 : 0.1}
                          />
                        ))}
                      </Bar>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#B45309'}} />
                      <YAxis hide />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 专项消耗分析面板 - 修正圆角 */}
              <div className="bg-[#FFF9E8] p-6 rounded-[24px] border border-[#F0E6D2] shadow-sm flex flex-col gap-4 animate-fade-in">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-[#5D3A2F] flex items-center gap-2">
                       <Activity size={18} className="text-[#FF5C00]" /> {selectedStatsCategory === 'all' ? '总体' : FINANCE_CATEGORIES.find(c => c.id === selectedStatsCategory)?.label}消耗分析
                    </h3>
                    <div className="px-3 py-1 bg-white/50 rounded-lg text-[9px] font-black text-[#B45309]/40 tracking-widest uppercase">Efficiency</div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/80 p-4 rounded-[16px] border border-white/50 shadow-inner">
                       <p className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest mb-1">当前账期日均</p>
                       <p className="text-xl font-black text-[#FF5C00]">¥{selectedStatsCategory === 'all' ? stats.dailyAvg : (stats.catDailyAvg as any)[selectedStatsCategory]}</p>
                    </div>
                    <div className="bg-white/80 p-4 rounded-[16px] border border-white/50 shadow-inner">
                       <p className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-widest mb-1">选定分类总支出</p>
                       <p className="text-xl font-black text-[#5D3A2F]">¥{selectedStatsCategory === 'all' ? stats.totalSpent.toFixed(0) : (stats.catSpent as any)[selectedStatsCategory].toFixed(0)}</p>
                    </div>
                 </div>
              </div>

              {/* 分类预算检阅 - 修正圆角 */}
              <div className="bg-white p-7 rounded-[24px] border border-[#F0E6D2] shadow-sm">
                <h3 className="text-[15px] font-black text-[#5D3A2F] mb-8 tracking-tight">分类预算检阅</h3>
                <div className="space-y-8">
                  {FINANCE_CATEGORIES.filter(c => selectedStatsCategory === 'all' || c.id === selectedStatsCategory).map(cat => {
                    const spent = (stats.catSpent as any)[cat.id] || 0;
                    const budget = (categoryBudgets as any)[cat.id] || 0;
                    const over = spent > budget;
                    const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-3">
                        <div className="flex justify-between items-center text-[12px] font-black">
                          <span className="text-[#5D3A2F] flex items-center gap-2.5">
                            <cat.icon size={16} className={cat.color}/> {cat.label}领域
                          </span>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] ${over ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-[#FF5C00]'}`}>
                              {over ? `超 ¥${(spent - budget).toFixed(0)}` : `剩 ¥${(budget - spent).toFixed(0)}`}
                            </span>
                            <span className="bg-[#FFF9E8] px-2.5 py-1 rounded-lg text-[10px] text-[#B45309]/40">已支 ¥{spent.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-[#FFF9E8] rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full transition-all duration-1000 ease-out ${over ? 'bg-rose-400' : (cat.id === 'life' ? 'bg-amber-400' : cat.color.replace('text', 'bg'))}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center py-10 opacity-60">
                 <LuluChef size={110} className="mb-4" />
                 <p className="text-[10px] font-black text-[#B45309]/20 uppercase tracking-[0.4em]">Advanced Finance Analysis</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 预算调整 - 修改圆角为 24px */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] rounded-t-[24px] p-8 animate-slide-up flex flex-col shadow-2xl">
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-8 shrink-0"></div>
            <header className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-[#5D3A2F] tracking-tight">调配御膳房库银</h2>
               <button onClick={() => setIsBudgetModalOpen(false)} className="w-10 h-10 bg-[#FFF9E8] rounded-full flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all shadow-sm"><X size={20} /></button>
            </header>
            <div className="space-y-6 mb-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase px-2 tracking-widest">总开支上限</label>
                <input type="number" value={tempTotalBudget} onChange={e => setTempTotalBudget(e.target.value)} className="w-full bg-white border-2 border-[#F0E6D2] px-6 py-5 rounded-[20px] font-black text-[#FF5C00] text-2xl outline-none focus:border-[#FF5C00] transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {FINANCE_CATEGORIES.map(cat => (
                  <div key={cat.id} className="space-y-2">
                    <label className="text-[10px] font-black text-[#B45309]/30 px-2 uppercase tracking-widest">{cat.label} 专项</label>
                    <input type="number" value={(tempCatBudgets as any)[cat.id]} onChange={e => setTempCatBudgets({...tempCatBudgets, [cat.id]: e.target.value})} className="w-full bg-white border border-[#F0E6D2] px-5 py-4 rounded-[16px] font-black text-[#5D3A2F] text-sm outline-none" />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleSaveBudget} className="w-full py-5 bg-[#FF5C00] text-white rounded-[24px] font-black text-lg shadow-xl border-b-6 border-[#E65100] active:scale-95 transition-all">确立新预算</button>
          </div>
        </div>
      )}

      {/* 记账抽屉 - 修改圆角为 24px */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-md flex items-end justify-center">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] rounded-t-[24px] p-8 animate-slide-up flex flex-col shadow-2xl">
            <div className="w-12 h-1.5 bg-[#5D3A2F]/10 rounded-full mx-auto mb-8 shrink-0"></div>
            <header className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-[#5D3A2F] tracking-tight">{editingRecord ? '陛下调整账目' : '速记一笔开支萝'}</h2>
               <button onClick={() => setIsLogModalOpen(false)} className="w-10 h-10 bg-[#FFF9E8] rounded-full flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all shadow-sm"><X size={20} /></button>
            </header>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 mb-6 border-b border-[#F0E6D2]/40">
               {FINANCE_CATEGORIES.map(cat => (
                 <button key={cat.id} onClick={() => setLogCatId(cat.id)} className={`flex flex-col items-center gap-2.5 min-w-[72px] py-4 rounded-[16px] transition-all border ${logCatId === cat.id ? 'bg-[#FF5C00] text-white border-[#E65100] shadow-lg scale-105' : 'bg-white border-[#F0E6D2] text-[#B45309]/30'}`}>
                   <cat.icon size={22} /><span className="text-[10px] font-black">{cat.label}</span>
                 </button>
               ))}
            </div>
            <div className="space-y-4 mb-10">
               <input value={logDesc} onChange={e => setLogDesc(e.target.value)} placeholder="陛下的战利品是？" className="w-full bg-white border border-[#F0E6D2] px-6 py-4 rounded-[16px] font-black text-sm outline-none focus:border-[#FF5C00] shadow-sm" />
               <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#B45309]/20 text-xl">¥</span>
                  <input type="number" value={logAmount} onChange={e => setLogAmount(e.target.value)} placeholder="金额..." className="w-full bg-white border-2 border-[#F0E6D2] pl-12 pr-6 py-5 rounded-[16px] font-black text-[#FF5C00] text-2xl outline-none focus:border-[#FF5C00] shadow-inner" />
               </div>
            </div>
            <button onClick={handleQuickLog} disabled={!logAmount} className={`w-full py-5 text-white rounded-[24px] font-black text-lg shadow-xl border-b-6 transition-all ${logAmount ? 'bg-[#FF5C00] border-[#E65100] active:scale-95' : 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'}`}>朕已确认</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
