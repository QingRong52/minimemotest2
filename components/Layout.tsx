
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CookingPot, ScrollText, PieChart } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC = ({ children }) => {
  const location = useLocation();
  
  const mainPages = ['/', '/inventory', '/finance'];
  const showNav = mainPages.includes(location.pathname);

  const navItems = [
    { to: '/', icon: <CookingPot size={28} strokeWidth={2.5} />, label: '食谱' },
    { to: '/inventory', icon: <ScrollText size={26} strokeWidth={2.5} />, label: '仓库' },
    { to: '/finance', icon: <PieChart size={26} strokeWidth={2.5} />, label: '账本' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      {/* 核心内容区域：必须是 flex-1 且 overflow-hidden，才能让子页面的 flex-1 overflow-y-auto 生效 */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        {children}
      </main>

      {showNav && (
        <nav className="shrink-0 h-[84px] bg-white/70 backdrop-blur-3xl flex justify-around items-center px-8 z-[50] rounded-t-[45px] shadow-[0_-10px_50px_rgba(0,0,0,0.02)] border-t border-white/50 relative">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center transition-all duration-300 w-16 h-16 ${
                  isActive ? 'text-[#FF5C00]' : 'text-[#B45309]/20'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100 hover:scale-105'}`}>
                    {item.icon}
                  </div>
                  {isActive && (
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#FF5C00] shadow-[0_0_10px_rgba(255,92,0,0.8)] animate-pulse"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
      
      {/* 底部指示条装饰 */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-[#5D3A2F]/5 rounded-full z-[51]"></div>
    </div>
  );
};

export default Layout;
