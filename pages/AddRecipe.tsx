
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Camera, ListPlus, Search, ChevronDown, Calculator } from 'lucide-react';
import { useKitchen } from '../KitchenContext';
import { Recipe } from '../types';

const UNITS = ['g', '个', '克', '斤'];

const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { addRecipe, updateRecipe, categories, recipes, ingredients: stockIngredients } = useKitchen();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || '厨神必做');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<{ingredientId: string, amount: number, unit: string, name: string, price?: number}[]>([]);
  const [steps, setSteps] = useState<{instruction: string, image?: string}[]>([{ instruction: '' }]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculatedTotalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + (Number(ing.price) || 0), 0);
  }, [ingredients]);

  useEffect(() => {
    if (editId) {
      const existing = recipes.find(r => r.id === editId);
      if (existing) {
        setName(existing.name);
        setCategory(existing.category);
        setCoverImage(existing.image);
        setIngredients(existing.ingredients.map(i => ({ 
          ingredientId: i.ingredientId,
          amount: i.amount,
          name: i.name,
          price: i.price,
          unit: (i as any).unit || 'g' 
        })));
        setSteps(existing.steps.map(s => ({ instruction: s.instruction, image: s.image })));
      }
    }
  }, [editId, recipes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addStep = () => setSteps([...steps, { instruction: '' }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, fields: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...fields };
    setSteps(newSteps);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { ingredientId: '', name: '', amount: 100, unit: 'g', price: undefined }]);
  };

  const updateIngredientField = (idx: number, field: string, value: any) => {
    const newIngs = [...ingredients];
    (newIngs[idx] as any)[field] = value;
    setIngredients(newIngs);
  };

  const pickFromStock = (idx: number, stockId: string) => {
    const stock = stockIngredients.find(s => s.id === stockId);
    if (stock) {
      const newIngs = [...ingredients];
      newIngs[idx] = { 
        ...newIngs[idx], 
        ingredientId: stock.id, 
        name: stock.name, 
        price: stock.price, 
        unit: stock.unit || 'g' 
      };
      setIngredients(newIngs);
    }
  };

  const save = () => {
    if (!name.trim()) return alert('请输入菜谱名称');
    const recipeData: Recipe = {
      id: editId || Date.now().toString(),
      name,
      image: coverImage || 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
      estimatedCost: calculatedTotalCost,
      category,
      ingredients: ingredients.map(i => ({
        ingredientId: i.ingredientId,
        amount: i.amount,
        name: i.name,
        price: i.price,
        unit: i.unit
      })) as any,
      steps: steps.map((s, i) => ({ id: i, ...s }))
    };
    if (editId) updateRecipe(recipeData);
    else addRecipe(recipeData);
    navigate(editId ? `/recipe/${editId}` : '/');
  };

  return (
    <div className="h-full bg-[#FEFFF9] flex flex-col overflow-hidden animate-fade-in relative">
      <header className="px-6 pt-12 pb-4 flex items-center gap-4 bg-white/90 backdrop-blur-md border-b border-[#F0E6D2] shrink-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-[#FFF9E8] flex items-center justify-center text-[#FF5C00] active:scale-90 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[18px] font-black text-[#5D3A2F]">{editId ? '调整秘籍' : '开创秘籍'}</h2>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar smooth-scroll px-6 py-6 pb-48 space-y-8">
        {/* 封面 */}
        <div className="space-y-3">
          <label className="text-xs font-black text-[#B45309]/40 uppercase tracking-widest">成品图片</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-video bg-[#FFF9E8] border-2 border-dashed border-[#F0E6D2] rounded-[32px] overflow-hidden flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            {coverImage ? (
              <img src={coverImage} className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={32} className="text-[#FF5C00]/30 mb-2" />
                <span className="text-xs font-bold text-[#B45309]/30">上传成品照</span>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setCoverImage)} />
          </div>
        </div>

        {/* 基础信息 */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-[#B45309]/40 uppercase tracking-widest px-1">菜谱名称</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="名称..." className="w-full bg-white border border-[#F0E6D2] px-6 py-4 rounded-2xl font-black text-[#5D3A2F] outline-none shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#B45309]/40 px-1 uppercase tracking-widest">所属分类</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white border border-[#F0E6D2] px-4 py-4 rounded-2xl font-bold text-[#5D3A2F] outline-none shadow-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#B45309]/40 px-1 uppercase tracking-widest flex items-center justify-between">成本 ¥ <Calculator size={10} /></label>
              <div className="w-full bg-[#FFF9E8]/30 border border-[#F0E6D2] px-6 py-4 rounded-2xl font-black text-[#FF5C00] text-lg shadow-inner">{calculatedTotalCost.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* 食材 */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black text-[#B45309]/40 uppercase tracking-widest">食材配比</label>
            <button onClick={addIngredient} className="text-[#FF5C00] font-black text-xs flex items-center gap-1 bg-[#FFF9E8] px-3 py-1.5 rounded-full border border-[#F0E6D2] shadow-sm"><ListPlus size={14} /> 添加食材</button>
          </div>
          <div className="space-y-4">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="bg-white border border-[#F0E6D2] p-5 rounded-[28px] shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <input type="text" placeholder="食材名" className="flex-1 bg-[#FFF9E8]/50 border-none px-4 py-3 rounded-xl font-black text-[#5D3A2F] text-sm outline-none" value={ing.name} onChange={e => updateIngredientField(idx, 'name', e.target.value)} />
                  <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="w-10 h-10 rounded-xl bg-red-50 text-red-400 flex items-center justify-center shrink-0 active:scale-90"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-[#F0E6D2]/20 rounded-xl px-3">
                    <input type="number" placeholder="分量" className="w-full bg-transparent border-none font-black text-[#5D3A2F] text-sm outline-none text-right py-2" value={ing.amount} onChange={e => updateIngredientField(idx, 'amount', Number(e.target.value))} />
                    <select value={ing.unit} onChange={e => updateIngredientField(idx, 'unit', e.target.value)} className="bg-transparent font-black text-[10px] text-[#B45309] ml-2 outline-none">{UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select>
                  </div>
                  <input type="number" placeholder="¥" className="w-20 bg-[#F0E6D2]/20 border-none px-3 py-2 rounded-xl font-black text-[#FF5C00] text-sm outline-none text-right" value={ing.price || ''} onChange={e => updateIngredientField(idx, 'price', Number(e.target.value))} />
                  <select className="w-16 bg-white border border-[#F0E6D2] px-1 py-1.5 rounded-lg font-bold text-[8px] text-[#B45309]/40 outline-none" onChange={e => pickFromStock(idx, e.target.value)} value={ing.ingredientId}><option value="">库中选</option>{stockIngredients.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 步骤 */}
        <div className="space-y-6 pb-10">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-black text-[#B45309]/40 uppercase tracking-widest">独门步法</label>
            <button onClick={addStep} className="text-[#FF5C00] font-black text-xs flex items-center gap-1 bg-[#FFF9E8] px-3 py-1.5 rounded-full border border-[#F0E6D2] shadow-sm"><Plus size={14} /> 添加步骤</button>
          </div>
          <div className="space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white border border-[#F0E6D2] rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="w-8 h-8 rounded-xl bg-[#5D3A2F] text-white flex items-center justify-center font-black text-xs">{idx + 1}</span>
                  {steps.length > 1 && <button onClick={() => removeStep(idx)} className="text-red-200 hover:text-red-400 p-1"><Trash2 size={18} /></button>}
                </div>
                <div className="flex gap-4">
                  <div onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e: any) => handleImageUpload(e, (url) => updateStep(idx, { image: url })); input.click(); }} className="w-24 h-24 rounded-2xl bg-[#FFF9E8] border-2 border-dashed border-[#F0E6D2] flex flex-col items-center justify-center overflow-hidden shrink-0 active:scale-95 shadow-inner">
                    {step.image ? <img src={step.image} className="w-full h-full object-cover" /> : <Camera size={24} className="text-[#FF5C00]/20" />}
                  </div>
                  <textarea value={step.instruction} onChange={e => updateStep(idx, { instruction: e.target.value })} placeholder="输入操作..." className="flex-1 bg-transparent border-none outline-none font-bold text-[#5D3A2F] text-base resize-none py-1" rows={4} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-[#FEFFF9] via-[#FEFFF9] to-transparent shrink-0 z-20">
        <button onClick={save} className="w-full bg-[#FF5C00] text-white py-5 rounded-[28px] font-black text-xl shadow-2xl active:scale-95 transition-all border-b-6 border-[#E65100]">大功告成萝</button>
      </div>
    </div>
  );
};

export default AddRecipe;
