
import React from 'react';
import { Ingredient } from '../types';
import * as Icons from 'lucide-react';
import { Trash2, Utensils } from 'lucide-react';

interface InventoryCardProps {
  item: Ingredient;
  onDelete?: () => void;
}

const CategoryIcon = ({ item }: { item: Ingredient }) => {
  const Icon = (Icons as any)[item.iconName || 'Utensils'] || Icons.Utensils || Utensils;
  return <Icon className="text-[#F59E0B]" size={20} strokeWidth={2.5} />;
};

// Fixed the component definition to correctly use React.FC with props interface
const InventoryCard: React.FC<InventoryCardProps> = ({ item, onDelete }) => {
  return (
    <div className="bg-[#FFF3D3] rounded-[22px] p-3 flex items-center gap-4 shadow-sm transition-all active:scale-[0.98] group relative border border-[#FBF4E4]">
      {onDelete && (
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          className="absolute -top-1 -right-1 p-2 bg-[#FF5C00] text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90 z-10"
        >
          <Trash2 size={10} strokeWidth={3} />
        </button>
      )}

      <div className="w-14 h-14 bg-white rounded-[18px] flex items-center justify-center shadow-sm shrink-0">
        <CategoryIcon item={item} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-[#5D3A2F] text-[16px] truncate">
          {item.name}
        </h4>
        <p className="text-[#B45309]/50 text-[10px] font-bold mt-0.5">
          单价：¥{item.price}/{item.unit}
        </p>
      </div>
      
      {item.quantity !== null && (
        <div 
          style={{ width: '52px', height: '28px' }}
          className="bg-[#FFA61D] rounded-full shadow-sm flex items-center justify-center shrink-0 overflow-hidden"
        >
          <span className="text-[12px] text-white whitespace-nowrap leading-none">
            {item.quantity}<small className="ml-0.5 opacity-90">{item.unit}</small>
          </span>
        </div>
      )}
    </div>
  );
};

export default InventoryCard;