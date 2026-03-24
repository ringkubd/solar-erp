"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Building2, Plus, MapPin, 
  Settings2, ArrowLeft, Loader2, Database
} from "lucide-react";
import Link from "next/link";

export default function WarehouseListPage() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', location: '' });

  const fetchWarehouses = () => {
    setLoading(true);
    api.get('/inventory/warehouses').then(res => setWarehouses(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/warehouses', form);
      setShowAddModal(false);
      setForm({ name: '', code: '', location: '' });
      fetchWarehouses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create warehouse');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
           </Link>
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Warehouses & Storage</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Multi-location Stock Management</p>
           </div>
        </div>
        <button onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-slate-800 transition-all">
          <Plus className="w-4 h-4"/> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></div>
        ) : warehouses.map(wh => (
          <div key={wh.id} className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300">
             <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                   <Building2 className="w-6 h-6" />
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                   {wh.code}
                </div>
             </div>
             
             <h3 className="text-xl font-black text-slate-900 mb-2">{wh.name}</h3>
             <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-8">
                <MapPin className="w-4 h-4" />
                {wh.location || 'No location set'}
             </div>

             <div className="pt-6 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${wh.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{wh.is_active ? 'Active' : 'Offline'}</span>
                </div>
                <Link href={`/inventory/warehouses/${wh.id}`}>
                   <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                      <Settings2 className="w-5 h-5" />
                   </button>
                </Link>
             </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Register Warehouse</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Warehouse Name</label>
                    <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-bold focus:border-emerald-500 outline-none transition-all" placeholder="Main Yard, Storage A, etc." />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Store Code (Unique)</label>
                    <input required value={form.code} onChange={e=>setForm({...form, code: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-mono font-bold focus:border-emerald-500 outline-none transition-all" placeholder="WH-01" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location Details</label>
                    <textarea value={form.location} onChange={e=>setForm({...form, location: e.target.value})}
                      className="w-full border-2 rounded-xl p-4 font-medium focus:border-emerald-500 outline-none transition-all" placeholder="Full address or zone" rows={2} />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={()=>setShowAddModal(false)} className="flex-1 h-12 border-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 h-12 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-slate-800 transition-all">Create Warehouse</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
