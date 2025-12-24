
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingPot: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/recipe/r1')} 
      className="absolute bottom-28 right-6 w-14 h-14 bg-[#ff7a28] rounded-full flex items-center justify-center shadow-lg pot-glow transition-transform hover:scale-110 active:scale-95 floating z-50 overflow-hidden group"
    >
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
        >
          <path d="M4 10h16c1 0 2 1 2 2v2c0 3-3 5-8 5s-8-2-8-5v-2c0-1 1-2 2-2z" />
          <path d="M12 7V3" />
          <path d="M9 3h6" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
        </svg>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-0.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-1 h-3 bg-white/80 rounded-full animate-bounce delay-75"></div>
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default FloatingPot;
