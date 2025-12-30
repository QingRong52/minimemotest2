
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CookingPot, Calendar, PieChart } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const mainPages = ['/', '/calendar', '/finance'];
  const showNav = mainPages.includes(location.pathname);

  const navItems = [
    { to: '/', icon: <CookingPot size={26} strokeWidth={2.5} />, label: '食谱' },
    { to: '/calendar', icon: <Calendar size={24} strokeWidth={2.5} />, label: '日历' },
    { to: '/finance', icon: <PieChart size={24} strokeWidth={2.5} />, label: '账本' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0 relative">
        {children}
      </main>

      {showNav && (
        <nav className="shrink-0 pb-[env(safe-area-inset-bottom)] bg-white/80 backdrop-blur-3xl flex justify-around items-center px-4 z-[50] rounded-t-[40px] shadow-[0_-8px_40px_rgba(0,0,0,0.03)] border-t border-white/50 relative">
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
                  <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
                    {item.icon}
                  </div>
                  {isActive && (
                    <div className="absolute bottom-2 w-1 h-1 rounded-full bg-[#FF5C00] shadow-[0_0_8px_rgba(255,92,0,0.6)]"></div>
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
