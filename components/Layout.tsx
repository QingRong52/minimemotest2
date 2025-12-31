
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CookingPot, Calendar, PieChart } from 'lucide-react';
import { useKitchen } from '../KitchenContext';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isGlobalModalOpen } = useKitchen();
  
  // 核心页面白名单 - 移除了 /shopping-list 确保操作流程无干扰
  const mainPages = ['/', '/calendar', '/finance'];
  const showNav = mainPages.includes(location.pathname);

  const navItems = [
    { to: '/', icon: <CookingPot size={32} strokeWidth={2.5} />, label: '食谱' },
    { to: '/calendar', icon: <Calendar size={30} strokeWidth={2.5} />, label: '日历' },
    { to: '/finance', icon: <PieChart size={30} strokeWidth={2.5} />, label: '账本' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {children}
      </main>

      {showNav && (
        <nav 
          className={`shrink-0 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-white/95 backdrop-blur-3xl flex justify-around items-center px-6 z-[2000] rounded-t-[48px] shadow-[0_-15px_50px_rgba(180,83,9,0.08)] border-t border-[#F0E6D2]/40 relative h-[105px] transition-all duration-300 ease-in-out ${
            isGlobalModalOpen ? 'translate-y-[120px] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center transition-all duration-300 w-28 h-full ${
                  isActive ? 'text-[#FF5C00]' : 'text-[#B45309]/30'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1.5' : 'scale-100'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[13px] font-black mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-[#FF5C00] shadow-[0_0_12px_rgba(255,92,0,0.8)]"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};

export default Layout;
