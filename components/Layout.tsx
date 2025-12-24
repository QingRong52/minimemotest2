
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PieChart } from 'lucide-react';
import FloatingPot from './FloatingPot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { to: '/', icon: <Home size={24} />, label: '首页' },
    { to: '/inventory', icon: <ClipboardList size={24} />, label: '库存' },
    { to: '/finance', icon: <PieChart size={24} />, label: '账单' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32 relative overflow-x-hidden">
      <main className="max-w-md mx-auto">
        {children}
      </main>

      <FloatingPot />

      {/* 底部导航栏 - 高端极简风格 */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/90 backdrop-blur-md border-t border-gray-50 flex justify-around items-center px-8 z-40 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-black scale-105' : 'text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.icon}
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
