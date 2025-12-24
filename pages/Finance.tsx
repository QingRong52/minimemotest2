
import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, CreditCard } from 'lucide-react';

const MOCK_DATA = [
  { day: '周一', spend: 45 },
  { day: '周二', spend: 120 },
  { day: '周三', spend: 85 },
  { day: '周四', spend: 30 },
  { day: '周五', spend: 150 },
  { day: '周六', spend: 210 },
  { day: '周日', spend: 65 },
];

const Finance: React.FC = () => {
  return (
    <div className="pb-8 px-4">
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">财务中心</h1>
        <p className="text-gray-500 font-medium">追踪您的厨房投入产出比</p>
      </header>

      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
          <TrendingUp className="text-orange-500 mb-3" size={24} />
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">本周支出</p>
          <p className="text-2xl font-bold text-gray-800">705 元</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm">
          <CreditCard className="text-blue-500 mb-3" size={24} />
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">平均每餐</p>
          <p className="text-2xl font-bold text-gray-800">24.5 元</p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="bg-white p-8 rounded-[40px] mb-8 border border-gray-50 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-8 flex justify-between items-center">
          每周支出概览
          <span className="text-orange-500 text-[10px] font-bold bg-orange-50 px-3 py-1 rounded-full tracking-wider">较上周 +12%</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_DATA}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}}
                dy={10}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255, 122, 40, 0.05)'}} 
                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                labelFormatter={(label) => `${label}支出`}
                formatter={(value) => [`${value} 元`, '金额']}
              />
              <Bar dataKey="spend" radius={[12, 12, 12, 12]}>
                {MOCK_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.spend > 150 ? '#ff7a28' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 烹饪足迹 */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2">
          <CalendarIcon size={20} className="text-orange-400" />
          烹饪足迹
        </h3>
        <div className="grid grid-cols-7 gap-3">
          {[...Array(31)].map((_, i) => (
            <div key={i} className={`aspect-square rounded-[14px] flex items-center justify-center text-[10px] font-bold transition-all ${
              [2, 5, 8, 12, 14, 20].includes(i+1) 
              ? 'bg-orange-500 text-white shadow-sm shadow-orange-100' 
              : 'bg-gray-50 text-gray-300'
            }`}>
              {i + 1}
            </div>
          ))}
        </div>
        <button className="w-full mt-8 py-5 rounded-[24px] bg-gray-900 text-white font-bold shadow-xl active:scale-95 transition-all text-sm tracking-widest">
          下载分析报告
        </button>
      </div>
    </div>
  );
};

export default Finance;
