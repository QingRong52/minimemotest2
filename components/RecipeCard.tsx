
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-[32px] p-4 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col group relative animate-fade-in transition-transform hover:-translate-y-1">
      {/* 优化的标签 */}
      <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-wider">
        HOT
      </div>
      
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-[4/5] w-full rounded-[24px] overflow-hidden mb-5 shadow-inner">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        
        <div className="px-1 mb-4">
          <h3 className="text-[#1A1A1A] text-[15px] font-extrabold leading-tight mb-1 truncate">
            {recipe.name}
          </h3>
          <p className="text-gray-400 text-[10px] font-bold tracking-wide uppercase">
            {recipe.category}
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between px-1 mt-auto">
        <div className="flex items-center gap-1">
          <span className="text-gray-900 text-[11px] font-black">¥</span>
          <span className="text-[#1A1A1A] text-lg font-black tracking-tight">{recipe.estimatedCost}</span>
        </div>
        
        <button className="w-9 h-9 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-800 border border-gray-100 transition-all active:scale-90 hover:bg-black hover:text-white hover:shadow-lg">
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
