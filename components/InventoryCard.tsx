
import React from 'react';
import { Ingredient } from '../types';
import * as Icons from 'lucide-react';
import { Droplet, MoreHorizontal, UtensilsCrossed, Trash2 } from 'lucide-react';

interface InventoryCardProps {
  item: Ingredient;
  onDelete?: () => void;
}

const CategoryIcon = ({ category, iconName }: { category: string; iconName?: string }) => {
  // If user selected a custom icon, try to render it
  if (iconName && (Icons as any)[iconName]) {
    const CustomIcon = (Icons as any)[iconName];
    const colorClass = category === '食材' ? 'text-orange-400' : 'text-purple-400';
    return <CustomIcon className={colorClass} size={24} />;
  }

  // Fallback to category defaults
  switch (category) {
    case '食材': return <UtensilsCrossed className="text-orange-400" size={24} />;
    case '调料': return <Droplet className="text-purple-400" size={24} />;
    default: return <MoreHorizontal className="text-gray-400" size={24} />;
  }
};

const getBgColor = (category: string) => {
  switch (category) {
    case '食材': return 'bg-orange-50';
    case '调料': return 'bg-purple-50';
    default: return 'bg-gray-50';
  }
};

const InventoryCard: React.FC<InventoryCardProps> = ({ item, onDelete }) => {
  const shouldShowQuantity = item.quantity !== null && item.quantity !== undefined;

  return (
    <div className="bg-white rounded-[24px] p-4 flex items-center gap-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 group relative">
      {/* Subtle Delete Button - elegant and minimized */}
      {onDelete && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          type="button"
          className="absolute top-2 right-2 p-2 text-gray-200 hover:text-red-400 transition-all duration-300 z-50 opacity-0 group-hover:opacity-100 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md cursor-pointer"
          title="移除食材"
        >
          <Trash2 size={12} />
        </button>
      )}

      {/* Icon Area */}
      <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-transform group-hover:scale-105 ${getBgColor(item.category)}`}>
        <CategoryIcon category={item.category} iconName={item.iconName} />
      </div>
      
      {/* Content Area */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-gray-800 text-lg tracking-tight mb-0.5 group-hover:text-orange-500 transition-colors">
              {item.name}
            </h4>
            <p className="text-gray-400 text-xs font-medium tracking-wide">
              花费：{item.price}元
            </p>
          </div>
          
          {shouldShowQuantity && (
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-4 py-1.5 rounded-full shadow-md shadow-orange-100">
              <span className="text-white text-sm font-bold">
                {item.quantity}{item.unit}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;
