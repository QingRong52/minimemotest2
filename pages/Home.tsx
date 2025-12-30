
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import FloatingPot from '../components/FloatingPot';
import { LuluChef } from '../components/LuluIcons';
import { 
  Plus, Settings2, X, ChefHat, 
  ChevronUp, ChevronDown, Trash2, Edit2, Check, LayoutGrid
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useKitchen, Category } from '../KitchenContext';

const ICON_OPTIONS = [
  'Utensils', 'ChefHat', 'Coffee', 'Apple', 'Pizza', 'Beef', 
  'Fish', 'Soup', 'Cookie', 'Cake', 'IceCream', 'Flame', 'Sandwich'
];

const Home: React.FC = () => {
  const { recipes, categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useKitchen();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Utensils');

  const filteredRecipes = selectedCategory === '全部' 
    ? recipes 
    : recipes.filter(r => r.category === selectedCategory);

  const getIcon = (iconName: string, size = 18) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent size={size} strokeWidth={2.5} />;
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;
    [newCats[index], newCats[targetIndex]] = [newCats[targetIndex], newCats[index]];
    reorderCategories(newCats);
  };

  const handleSaveCategory = () => {
    if (!newCatLabel.trim()) return;
    if (editingCategory) {
      updateCategory(editingCategory.id, { label: newCatLabel, icon: newCatIcon });
    } else {
      addCategory({ id: newCatLabel, label: newCatLabel, icon: newCatIcon });
    }
    setEditingCategory(null);
    setNewCatLabel('');
    setNewCatIcon('Utensils');
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setNewCatLabel(cat.label);
    setNewCatIcon(cat.icon);
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      <header className="flex justify-between items-end px-5 pt-12 pb-5 shrink-0 bg-[#FEFFF9]/90 backdrop-blur-md z-10 sticky top-0">
        <div className="space-y-0.5">
          <h1 className="text-[26px] font-black text-[#5D3A2F] leading-none tracking-tighter">厨神好</h1>
          <p className="text-[#B45309]/40 text-[11px] font-bold tracking-tight">陛下请点单萝～</p>
        </div>
        <div className="flex gap-1.5">
          <button 
            onClick={() => navigate('/add-recipe')}
            className="w-[44px] h-[44px] bg-[#FF5C00] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
          >
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-5 pb-32">
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 mb-6 py-1 shrink-0">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="w-[48px] h-[48px] bg-white border border-[#F0E6D2] rounded-[16px] flex items-center justify-center text-[#B45309]/40 shrink-0 active:scale-95 shadow-sm"
          >
            <Settings2 size={18} />
          </button>
          <div className="w-[1px] h-[40px] my-auto bg-[#F0E6D2]/60 shrink-0"></div>
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-1.5 shrink-0">
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-[48px] h-[48px] rounded-[16px] flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === cat.id 
                  ? 'bg-[#FF5C00] text-white shadow-md scale-105' 
                  : 'bg-[#FFF9E8] text-[#FF5C00] border border-[#F0E6D2]'
                }`}
              >
                {getIcon(cat.icon, 18)}
              </button>
              <span className={`text-[9px] font-black tracking-tight text-center truncate w-[48px] ${
                selectedCategory === cat.id ? 'text-[#FF5C00]' : 'text-[#B45309]/50'
              }`}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[#5D3A2F] text-[16px] font-black tracking-tight">{selectedCategory}</h2>
            <span className="text-[9px] font-bold text-[#B45309]/30 bg-[#FFF9E8] px-2 py-1 rounded-lg border border-[#F0E6D2]">
              {filteredRecipes.length} 份
            </span>
          </div>
          {filteredRecipes.length > 0 ? (
            <div className="grid gap-3 animate-fade-in pb-10">
              {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-80 animate-fade-in">
              <LuluChef size={120} className="mb-4" />
              <p className="text-[12px] font-black text-[#B45309]/40">“萝萝还在钻研这门流派...”</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-[100px] right-5 z-[60]">
        <FloatingPot />
      </div>

      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[85%] rounded-t-[40px] p-6 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <LayoutGrid size={20} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <h2 className="text-[20px] font-black text-[#5D3A2F] tracking-tight">分类中心</h2>
              </div>
              <button onClick={() => setIsCategoryManagerOpen(false)} className="w-9 h-9 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] border border-[#F0E6D2] active:scale-90 transition-all"><X size={18} strokeWidth={3} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll space-y-6 pb-10">
              <div className="bg-white border border-[#F0E6D2] rounded-[30px] p-5 shadow-sm">
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-[#F0E6D2]/50">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} onClick={() => setNewCatIcon(icon)} className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${newCatIcon === icon ? 'bg-[#FF5C00] text-white shadow-lg scale-110' : 'bg-[#FFF9E8]/50 text-[#B45309]/30 border border-[#F0E6D2]'}`}>{getIcon(icon, 18)}</button>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <input type="text" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} placeholder="新分类名字..." className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] px-5 py-4 rounded-xl font-black text-[#5D3A2F] outline-none text-sm" />
                  <button onClick={handleSaveCategory} disabled={!newCatLabel.trim()} className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-b-4 ${newCatLabel.trim() ? 'bg-[#FF5C00] text-white border-[#E65100] shadow-md' : 'bg-[#B45309]/10 text-[#B45309]/30 border-[#B45309]/5 cursor-not-allowed'}`}><Check size={18} strokeWidth={3} /><span>{editingCategory ? '确认修改' : '添加分类'}</span></button>
                </div>
              </div>
              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className={`bg-white border p-3.5 rounded-[24px] flex items-center justify-between transition-all ${editingCategory?.id === cat.id ? 'border-[#FF5C00] shadow-sm' : 'border-[#F0E6D2]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingCategory?.id === cat.id ? 'bg-[#FF5C00] text-white' : 'bg-[#FFF9E8] text-[#FF5C00]'}`}>{getIcon(cat.icon, 18)}</div>
                      <span className="font-black text-[15px] text-[#5D3A2F]">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditCategory(cat)} className="p-2 text-[#B45309]/20 hover:text-[#FF5C00]"><Edit2 size={16} /></button>
                      {cat.id !== '全部' && <button onClick={() => deleteCategory(cat.id)} className="p-2 text-[#B45309]/20 hover:text-red-500"><Trash2 size={16} /></button>}
                      <div className="flex flex-col border-l border-[#F0E6D2] pl-1 ml-1">
                        <button onClick={() => handleMoveCategory(idx, 'up')} disabled={idx === 0} className="text-[#B45309]/20 p-0.5 disabled:opacity-0"><ChevronUp size={14} /></button>
                        <button onClick={() => handleMoveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="text-[#B45309]/20 p-0.5 disabled:opacity-0"><ChevronDown size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
