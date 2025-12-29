
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
    <div className="h-full flex flex-col bg-[#FEFFF9] relative overflow-hidden">
      {/* 固定头部 */}
      <header className="flex justify-between items-end px-6 pt-12 pb-6 shrink-0 bg-[#FEFFF9]/80 backdrop-blur-md z-10">
        <div className="space-y-1">
          <h1 className="text-[28px] font-black text-[#5D3A2F] leading-none tracking-tighter">厨神好</h1>
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

      {/* 可滚动主体区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-6 pb-40">
        {/* 横向分类栏 */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 mb-10 py-1 shrink-0">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="w-[50px] h-[50px] bg-white border border-[#F0E6D2] rounded-[16px] flex items-center justify-center text-[#B45309]/40 shrink-0 active:scale-95 shadow-sm"
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
            <div className="grid gap-3.5 animate-fade-in pb-10">
              {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-80 animate-fade-in">
              <LuluChef size={140} className="mb-4" />
              <p className="text-[13px] font-black text-[#B45309]/40">“萝萝还在钻研这门流派的奥义...”</p>
            </div>
          )}
        </div>
      </div>

      <FloatingPot />

      {/* 分类中心弹窗 - 使用 fixed 确保不被父容器遮挡 */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-end justify-center animate-fade-in">
          <div className="bg-[#FEFFF9] w-full max-w-[430px] h-[85%] rounded-t-[50px] p-8 animate-slide-up flex flex-col shadow-2xl border-t border-white/40">
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0E6D2]">
                  <LayoutGrid size={24} className="text-[#FF5C00]" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-[22px] font-black text-[#5D3A2F] tracking-tight leading-none">分类中心</h2>
                  <p className="text-[10px] font-bold text-[#B45309]/30 uppercase tracking-[0.2em] mt-1.5">Manage Categories</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsCategoryManagerOpen(false); setEditingCategory(null); setNewCatLabel(''); }}
                className="w-10 h-10 bg-[#FFF9E8] rounded-xl flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all border border-[#F0E6D2]"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll space-y-8 pb-10 px-1">
              {/* 编辑表单 */}
              <div id="edit-form-anchor" className="bg-white border-2 border-[#F0E6D2] rounded-[35px] p-6 shadow-sm transition-all focus-within:border-[#FF5C00]/30">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C00]"></div>
                  <h3 className="text-[#B45309]/40 font-black text-[10px] uppercase tracking-widest">
                    {editingCategory ? 'Edit Entry' : 'New Entry'}
                  </h3>
                </div>
                
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-5 mb-5 border-b border-[#F0E6D2]/50">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCatIcon(icon)}
                      className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-all duration-300 ${
                        newCatIcon === icon 
                        ? 'bg-[#FF5C00] text-white shadow-lg shadow-[#FF5C00]/20 scale-110' 
                        : 'bg-[#FFF9E8]/50 text-[#B45309]/30 border border-[#F0E6D2]'
                      }`}
                    >
                      {getIcon(icon, 20)}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    value={newCatLabel} 
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="给新分类起个名字..."
                    className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] px-6 py-5 rounded-[22px] font-black text-[#5D3A2F] outline-none shadow-inner text-base"
                  />
                  <button 
                    onClick={handleSaveCategory}
                    disabled={!newCatLabel.trim()}
                    className={`w-full h-15 rounded-[22px] font-black text-[16px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-b-4 py-4 ${
                      newCatLabel.trim() 
                      ? 'bg-[#FF5C00] text-white border-[#E65100] shadow-xl' 
                      : 'bg-[#B45309]/10 text-[#B45309]/30 border-[#B45309]/5 cursor-not-allowed'
                    }`}
                  >
                    <Check size={22} strokeWidth={3} />
                    <span>{editingCategory ? '确认修改萝' : '现在添加萝'}</span>
                  </button>
                </div>
              </div>

              {/* 分类列表 */}
              <div className="space-y-3.5">
                <label className="text-[10px] font-black text-[#B45309]/30 uppercase tracking-[0.25em] px-2 block mb-2">已定义的派系</label>
                {categories.map((cat, idx) => {
                  const isEditing = editingCategory?.id === cat.id;
                  return (
                    <div 
                      key={cat.id} 
                      className={`bg-white border-2 p-4.5 rounded-[30px] flex items-center justify-between transition-all duration-300 ${
                        isEditing ? 'border-[#FF5C00] shadow-md scale-[1.02]' : 'border-[#F0E6D2] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4 px-1">
                        <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all ${
                          isEditing ? 'bg-[#FF5C00] text-white shadow-lg' : 'bg-[#FFF9E8] text-[#FF5C00]'
                        }`}>
                          {getIcon(cat.icon, 22)}
                        </div>
                        <span className={`font-black text-[17px] ${isEditing ? 'text-[#FF5C00]' : 'text-[#5D3A2F]'}`}>
                          {cat.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => startEditCategory(cat)}
                          className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                            isEditing ? 'bg-[#FF5C00]/10 text-[#FF5C00]' : 'text-[#B45309]/10 hover:text-[#FF5C00]'
                          }`}
                        >
                          <Edit2 size={18} strokeWidth={2.5} />
                        </button>
                        
                        {cat.id !== '全部' && (
                          <button 
                            onClick={() => deleteCategory(cat.id)}
                            className="p-2.5 text-[#B45309]/10 hover:text-red-500 active:scale-90 transition-all"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        )}

                        <div className="flex flex-col border-l-2 border-[#F0E6D2]/50 pl-2 ml-1">
                          <button onClick={() => handleMoveCategory(idx, 'up')} disabled={idx === 0} className="text-[#B45309]/20 active:scale-125 disabled:opacity-0 transition-all p-1"><ChevronUp size={16} strokeWidth={3} /></button>
                          <button onClick={() => handleMoveCategory(idx, 'down')} disabled={idx === categories.length - 1} className="text-[#B45309]/20 active:scale-125 disabled:opacity-0 transition-all p-1"><ChevronDown size={16} strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Home;
