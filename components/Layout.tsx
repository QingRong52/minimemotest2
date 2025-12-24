
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, PieChart } from 'lucide-react';
import FloatingPot from './FloatingPot';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navItems = [
    { to: '/', icon: <Home size={22} />, label: '精选' },
    { to: '/inventory', icon: <ClipboardList size={22} />, label: '仓库' },
    { to: '/finance', icon: <PieChart size={22} />, label: '统计' },
  ];

  // 在仓库和财务页面隐藏全局的悬浮锅
  const showFloatingPot = location.pathname === '/';

  return (
    <div className="h-full flex flex-col bg-[#FDFDFD] relative overflow-hidden">
      {/* 顶部补丁 - 确保背景统一 */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-[#FDFDFD] z-[90]"></div>

      {/* 这里的 flex-1 overflow-hidden 是关键，让子页面自己处理滚动 */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>

      {showFloatingPot && <FloatingPot />}

      {/* 极简底部导航 */}
      <nav className="absolute bottom-0 left-0 right-0 h-[92px] bg-white/80 backdrop-blur-xl border-t border-gray-50 flex justify-around items-center px-10 z-[100] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-500 pb-4 ${
                isActive ? 'text-black scale-110' : 'text-gray-300 hover:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 transition-all ${isActive ? 'bg-black/5 rounded-xl' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-black tracking-widest ${isActive ? 'opacity-100 translate-y-0.5' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* 底部横条指示器 */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/10 rounded-full z-[101]"></div>
    </div>
  );
};

export default Layout;
