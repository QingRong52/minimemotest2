
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import FloatingPot from '../components/FloatingPot';
import { LuluChef } from '../components/LuluIcons';
import { 
  Plus, Settings2, X, ChefHat, 
  ChevronUp, ChevronDown, Trash2, Edit2, Check
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
  const [selectedCategory, setSelectedCategory] = useState('厨神必做');
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Utensils');

  const filteredRecipes = selectedCategory === '全部' 
    ? recipes 
    : recipes.filter(r => r.category === selectedCategory);

  const getIcon = (iconName: string, size = 20) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Utensils;
    return <IconComponent size={size} strokeWidth={2} />;
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
    document.getElementById('edit-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full flex flex-col bg-[#FEFFF9] relative">
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-[72px] pb-32">
        <header className="flex justify-between items-end mb-8 animate-fade-in">
          <div className="space-y-1">
            <h1 className="text-[28px] font-black text-[#5D3A2F] leading-none tracking-tighter">早上好</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]/30"></div>
              <p className="text-[#B45309]/50 text-[12px] font-medium tracking-tight">陛下请点单</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/add-recipe')}
            className="w-[48px] h-[48px] bg-[#FF5C00] rounded-[18px] flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 mb-10 py-1">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="w-[50px] h-[50px] bg-white border border-[#F0E6D2] rounded-[16px] flex items-center justify-center text-[#B45309]/40 shrink-0 active:scale-95"
          >
            <Settings2 size={20} strokeWidth={2} />
          </button>

          <div className="w-[1px] h-[50px] bg-[#F0E6D2] shrink-0"></div>

          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-[50px] h-[50px] rounded-[16px] flex items-center justify-center transition-all duration-300 ${
                  selectedCategory === cat.id 
                  ? 'bg-[#FF5C00] text-white shadow-md' 
                  : 'bg-[#FFF9E8] text-[#FF5C00] border border-[#F0E6D2]'
                }`}
              >
                {getIcon(cat.icon, 20)}
              </button>
              <span className={`text-[12px] font-medium tracking-tight text-center truncate w-[60px] ${
                selectedCategory === cat.id ? 'text-[#FF5C00]' : 'text-[#B45309]/50'
              }`}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[#5D3A2F] text-[18px] font-black tracking-tight">{selectedCategory}</h2>
            <span className="text-[10px] font-bold text-[#B45309]/40 bg-[#FFF9E8] px-2.5 py-1.5 rounded-lg border border-[#F0E6D2]">
              {filteredRecipes.length} 份秘籍
            </span>
          </div>
          {filteredRecipes.length > 0 ? (
            <div className="grid gap-3.5 animate-fade-in">
              {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 opacity-80 animate-fade-in">
              <LuluChef size={140} className="mb-4" />
              <p className="text-[13px] font-black text-[#B45309]/40 italic">“萝萝还在钻研这门流派的奥义...”</p>
            </div>
          )}
        </div>
      </div>

      <FloatingPot />

      {/* 分类中心面板 */}
      {isCategoryManagerOpen && (
        <div className="absolute inset-0 z-[400] flex flex-col bg-[#FEFFF9] animate-fade-in">
          <div className="sticky top-0 z-20 px-6 pt-16 pb-4 bg-white border-b border-[#F0E6D2] flex justify-between items-center">
            <div>
              <h2 className="text-[22px] font-black text-[#5D3A2F] tracking-tight">分类中心</h2>
              <p className="text-[10px] font-bold text-[#B45309]/40 uppercase tracking-widest mt-0.5">Edit Structure</p>
            </div>
            <button 
              onClick={() => { setIsCategoryManagerOpen(false); setEditingCategory(null); setNewCatLabel(''); }}
              className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2]"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 pb-20">
            <div id="edit-form-anchor" className="bg-[#FFF9E8]/30 border border-[#F0E6D2] rounded-2xl p-6 mb-8 transition-all">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
                <h3 className="text-[#5D3A2F] font-bold text-xs uppercase tracking-wider">
                  {editingCategory ? '修改当前分类' : '添加新分类'}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2.5 mb-6">
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewCatIcon(icon)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      newCatIcon === icon 
                      ? 'bg-[#FF5C00] text-white' 
                      : 'bg-white text-[#B45309]/30 border border-[#F0E6D2]'
                    }`}
                  >
                    {getIcon(icon, 18)}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={newCatLabel} 
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="分类名称..."
                  className="w-full bg-white border border-[#F0E6D2] px-5 py-4 rounded-xl font-bold text-[#5D3A2F] outline-none placeholder-[#B45309]/20 text-sm"
                />
                <button 
                  onClick={handleSaveCategory}
                  disabled={!newCatLabel.trim()}
                  className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    newCatLabel.trim() 
                    ? 'bg-[#FF5C00] text-white shadow-sm' 
                    : 'bg-[#B45309]/10 text-[#B45309]/30 cursor-not-allowed'
                  }`}
                >
                  <Check size={18} strokeWidth={3} />
                  <span>{editingCategory ? '更新保存' : '立即添加'}</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-[#B45309]/30 font-bold text-[10px] uppercase tracking-widest px-1 mb-2">已定义的分类</h3>
              {categories.map((cat, idx) => {
                const isEditing = editingCategory?.id === cat.id;
                return (
                  <div 
                    key={cat.id} 
                    className={`bg-white border p-4 rounded-2xl flex items-center justify-between transition-all ${
                      isEditing ? 'border-[#FF5C00] bg-[#FF5C00]/5' : 'border-[#F0E6D2]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isEditing ? 'bg-[#FF5C00] text-white' : 'bg-[#FFF9E8] text-[#FF5C00]'
                      }`}>
                        {getIcon(cat.icon, 20)}
                      </div>
                      <span className={`font-bold text-sm ${isEditing ? 'text-[#FF5C00]' : 'text-[#5D3A2F]'}`}>
                        {cat.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => startEditCategory(cat)}
                        className={`p-2 rounded-lg transition-colors ${
                          isEditing ? 'bg-white text-[#FF5C00] shadow-sm' : 'text-[#B45309]/30 hover:text-[#FF5C00]'
                        }`}
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {cat.id !== '全部' && (
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 text-red-200 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      <div className="flex flex-col border-l border-[#F0E6D2] pl-2 ml-1">
                        <button onClick={() => handleMoveCategory(idx, 'up')} disabled={idx === 0} className="text-[#B45309]/20 hover:text-[#FF5C00] disabled:opacity-0"><ChevronUp size={16} /></button>
                        <button onClick={() => handleMoveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="text-[#B45309]/20 hover:text-[#FF5C00] disabled:opacity-0"><ChevronDown size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
