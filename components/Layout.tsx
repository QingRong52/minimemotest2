
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, PieChart } from 'lucide-react';
import FloatingPot from './FloatingPot';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { to: '/', icon: <Home size={26} />, label: '首页' },
    { to: '/inventory', icon: <ClipboardList size={26} />, label: '库存' },
    { to: '/finance', icon: <PieChart size={26} />, label: '账单' },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-32 relative overflow-x-hidden">
      {/* Decoratives */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-40 -z-10 -mr-32 -mt-32"></div>
      <div className="fixed bottom-0 left-0 w-80 h-80 bg-gray-50 rounded-full blur-3xl opacity-40 -z-10 -ml-40 -mb-40"></div>

      <main className="max-w-md mx-auto pt-6">
        {children}
      </main>

      {/* Conditional Floating Pot - only on Home/Recipe */}
      <FloatingPot />

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-100 flex justify-around items-center px-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-40">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 ${
                isActive ? 'text-orange-500' : 'text-gray-300'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
