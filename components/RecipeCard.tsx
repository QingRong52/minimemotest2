
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-[32px] p-3 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col group relative animate-fade-in">
      {/* 折扣标签 */}
      <div className="absolute top-5 left-5 z-10 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full opacity-90">
        -25%
      </div>
      
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="aspect-square w-full rounded-[24px] overflow-hidden mb-4">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        <div className="px-1 mb-4">
          <h3 className="text-[#1A1A1A] text-sm font-bold leading-tight mb-1 truncate">
            {recipe.name}
          </h3>
          <p className="text-gray-400 text-[10px] font-medium truncate">
            {recipe.category} • 25分钟
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-baseline gap-0.5">
          <span className="text-orange-400 text-[10px] font-bold">¥</span>
          <span className="text-[#1A1A1A] text-base font-bold">{recipe.estimatedCost}</span>
        </div>
        
        <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-800 border border-gray-100 transition-all active:scale-90 hover:bg-black hover:text-white">
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
