
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CookingPot, ScrollText, PieChart } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // 定义主页路由，只有这些页面才显示底栏
  const mainPages = ['/', '/inventory', '/finance'];
  const showNav = mainPages.includes(location.pathname);

  const navItems = [
    { to: '/', icon: <CookingPot size={32} />, label: '食谱' },
    { to: '/inventory', icon: <ScrollText size={29} />, label: '仓库' },
    { to: '/finance', icon: <PieChart size={29} />, label: '账本' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative">
      {/* 移除 main 容器的 relative，释放 fixed 元素的堆叠限制 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 底部导航 - 仅在主页显示 */}
      {showNav && (
        <nav className="absolute bottom-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-2xl flex justify-around items-center px-8 z-[100] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)] border-t border-white/40 animate-fade-in">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center transition-all duration-300 ${
                  isActive ? 'text-[#FF5C00]' : 'text-[#B45309]/20'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-all ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                    {item.icon}
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-2.5 w-1.5 h-1.5 rounded-full bg-[#FF5C00] shadow-[0_0_8px_rgba(255,92,0,0.6)] animate-pulse"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
      
      {/* 底部小白条 - 始终显示 */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#5D3A2F]/5 rounded-full z-[101]"></div>
    </div>
  );
};

export default Layout;
