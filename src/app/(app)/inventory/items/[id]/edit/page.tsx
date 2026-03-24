"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
  Package, Save, ArrowLeft, Loader2, 
  AlertCircle, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

export default function InventoryItemEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    inventory_category_id: "",
    unit: "",
    min_stock_level: 0,
    description: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, catRes] = await Promise.all([
          api.get(`/inventory/items/${id}`),
          api.get('/inventory/categories')
        ]);
        const item = itemRes.data;
        setForm({
          name: item.name,
          sku: item.sku,
          inventory_category_id: item.inventory_category_id || "",
          unit: item.unit,
          min_stock_level: item.min_stock_level || 0,
          description: item.description || ""
        });
        setCategories(catRes.data);
      } catch (err: any) {
        setError("Failed to load inventory item data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api.put(`/inventory/items/${id}`, form);
      setSuccess(true);
      setTimeout(() => router.push("/inventory"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Material</h1>
            <p className="text-sm text-slate-500">Update item details and stock parameters.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold text-sm tracking-tight">Material successfully updated! Redirecting...</p>
        </div>
      )}

      <div className="bg-white border rounded-[2rem] shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material Name</label>
              <input 
                type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full h-12 border-2 rounded-2xl px-4 font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="e.g. 550W Mono PERC Solar Panel"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SKU / Part Number</label>
              <input 
                type="text" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full h-12 border-2 rounded-2xl px-4 font-mono font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="PNL-550-BRD"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select 
                required value={form.inventory_category_id} onChange={e => setForm({...form, inventory_category_id: e.target.value})}
                className="w-full h-12 border-2 rounded-2xl px-4 font-bold focus:border-emerald-500 outline-none transition-all appearance-none bg-slate-50/50"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</label>
                <input 
                  type="text" required value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                  className="w-full h-12 border-2 rounded-2xl px-4 font-bold focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="pcs, m, kg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min. Stock Alert</label>
                <input 
                  type="number" required value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: parseInt(e.target.value)})}
                  className="w-full h-12 border-2 rounded-2xl px-4 font-mono font-bold focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Specifications</label>
              <textarea 
                rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border-2 rounded-2xl p-4 text-sm font-medium focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="Enter technical details, datasheet links, or manufacturer info..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t font-mono">
            <Link href="/inventory">
              <button type="button" className="px-8 py-3 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase text-[10px] tracking-widest">
                Cancel
              </button>
            </Link>
            <button 
              type="submit" disabled={saving}
              className="px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
              Update Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
