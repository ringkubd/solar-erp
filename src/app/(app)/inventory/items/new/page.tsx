"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Package, ArrowLeft, Save, Loader2, 
  Tag, Hash, Ruler, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    inventory_category_id: '',
    name: '',
    sku: '',
    unit: 'pcs',
    min_stock_level: '0',
    description: ''
  });

  useEffect(() => {
    api.get('/inventory/categories').then(res => setCategories(res.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory/items', form);
      router.push('/inventory');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Material Onboarding</h1>
          <p className="text-sm text-slate-500">Register a new item in the solar equipment database.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Material Name</label>
                 <div className="relative">
                   <Package className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                   <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})}
                     className="w-full h-11 border-2 rounded-xl pl-10 pr-4 text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                     placeholder="e.g. Jinko 550W Mono Facial Panel"/>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">SKU / Part Number</label>
                 <div className="relative">
                   <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                   <input required value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})}
                     className="w-full h-11 border-2 rounded-xl pl-10 pr-4 font-mono font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                     placeholder="JK-550M-120"/>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                 <div className="relative">
                   <Tag className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                   <select required value={form.inventory_category_id} onChange={e=>setForm({...form, inventory_category_id: e.target.value})}
                     className="w-full h-11 border-2 rounded-xl pl-10 pr-4 text-sm font-bold focus:border-emerald-500 outline-none appearance-none bg-white">
                     <option value="">Select Category</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit of Measure</label>
                 <div className="relative">
                   <Ruler className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                   <select required value={form.unit} onChange={e=>setForm({...form, unit: e.target.value})}
                      className="w-full h-11 border-2 rounded-xl pl-10 pr-4 text-sm font-bold focus:border-emerald-500 outline-none appearance-none bg-white">
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="meter">Meters (m)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="set">Set</option>
                      <option value="box">Box</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min. Stock Level (Alert)</label>
                 <div className="relative">
                   <AlertCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                   <input type="number" required value={form.min_stock_level} onChange={e=>setForm({...form, min_stock_level: e.target.value})}
                     className="w-full h-11 border-2 rounded-xl pl-10 pr-4 font-mono font-bold text-sm focus:border-emerald-500 outline-none transition-all"
                     placeholder="10"/>
                 </div>
               </div>
            </div>

            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Detailed Description</label>
               <textarea rows={4} value={form.description} onChange={e=>setForm({...form, description: e.target.value})}
                 className="w-full border-2 rounded-xl p-4 text-sm focus:border-emerald-500 outline-none transition-all shadow-inner bg-slate-50/50"
                 placeholder="Enter technical specifications, dimensions, or manufacturer notes..."></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl space-y-4">
             <div className="p-3 bg-white/10 rounded-xl w-fit">
                <Save className="w-5 h-5 text-emerald-400"/>
             </div>
             <div>
                <h3 className="font-bold text-lg">Confirm Registration</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Ensure SKU and Name are correct. Unique SKU is required for stock tracking.</p>
             </div>
             <button type="submit" disabled={loading}
               className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95">
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Material'}
             </button>
             <Link href="/inventory" className="block text-center text-xs text-slate-500 hover:text-white transition-colors py-2">
                Discard Changes
             </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
