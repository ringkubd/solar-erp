"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Plus, Trash2, ArrowLeft, 
  Loader2, ShoppingCart, Calendar, 
  AlertCircle, ChevronDown, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DISCRETE_UNITS = ['pcs', 'unit', 'nos', 'box', 'packet', 'set', 'each'];

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    vendor_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_date: '',
    notes: '',
    items: [{ inventory_item_id: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    Promise.all([
      api.get('/inventory/vendors'),
      api.get('/inventory/items')
    ]).then(([vRes, iRes]) => {
      setVendors(vRes.data);
      setItems(iRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { inventory_item_id: '', quantity: 1, unit_price: 0 }] });
  };

  const removeItemRow = (index: number) => {
    if (form.items.length === 1) return;
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor_id) return alert("Select a vendor");
    
    setSubmitting(true);
    try {
      await api.post('/inventory/purchase-orders', form);
      router.push('/inventory/purchase-orders');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create PO');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/inventory/purchase-orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Raise New Purchase Order</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Material Procurement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Supplier</label>
              <select required value={form.vendor_id} onChange={e=>setForm({...form, vendor_id: e.target.value})}
                className="w-full h-12 bg-slate-50 border-2 border-transparent rounded-xl px-4 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all">
                <option value="">Choose a vendor...</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Order Date</label>
              <input type="date" required value={form.order_date} onChange={e=>setForm({...form, order_date: e.target.value})}
                className="w-full h-12 bg-slate-50 border-2 border-transparent rounded-xl px-4 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all" />
           </div>
           <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Expected Delivery</label>
              <input type="date" value={form.expected_date} onChange={e=>setForm({...form, expected_date: e.target.value})}
                className="w-full h-12 bg-slate-50 border-2 border-transparent rounded-xl px-4 font-bold focus:bg-white focus:border-blue-500 outline-none transition-all" />
           </div>
           <div className="col-span-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Procurement Notes</label>
              <textarea value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 font-medium focus:bg-white focus:border-blue-500 outline-none transition-all" rows={2} placeholder="Terms, specific instructions, etc." />
           </div>
        </div>

        <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
           <div className="px-8 py-6 bg-slate-50/50 border-b flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Order Items</h3>
              <button type="button" onClick={addItemRow} className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline">
                 <Plus className="w-4 h-4" /> Add Item
              </button>
           </div>
           <div className="p-8 space-y-4">
              {form.items.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-200">
                   <div className="flex-1">
                      <select required value={entry.inventory_item_id} onChange={e=>updateItem(idx, 'inventory_item_id', e.target.value)}
                         className="w-full h-12 bg-white border-2 border-slate-100 rounded-xl px-4 font-bold focus:border-blue-500 outline-none transition-all">
                         <option value="">Select Material...</option>
                         {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
                      </select>
                   </div>
                    <div className="w-32 relative">
                       <input type="number" 
                          step={items.find(it => it.id == entry.inventory_item_id)?.unit && DISCRETE_UNITS.includes(items.find(it => it.id == entry.inventory_item_id).unit.toLowerCase()) ? "1" : "any"} 
                          placeholder="Qty" value={entry.quantity} onChange={e=>updateItem(idx, 'quantity', e.target.value)}
                          className="w-full h-12 bg-white border-2 border-slate-100 rounded-xl px-4 font-bold focus:border-blue-500 outline-none transition-all" />
                       {items.find(it => it.id == entry.inventory_item_id)?.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-slate-400">
                             {items.find(it => it.id == entry.inventory_item_id).unit}
                          </span>
                       )}
                    </div>
                   <div className="w-40">
                      <input type="number" step="any" placeholder="Unit Price" value={entry.unit_price} onChange={e=>updateItem(idx, 'unit_price', e.target.value)}
                         className="w-full h-12 bg-white border-2 border-slate-100 rounded-xl px-4 font-bold focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div className="w-40 h-12 bg-slate-50 rounded-xl flex items-center justify-end px-4 font-mono font-black text-slate-400">
                      ৳{(entry.quantity * entry.unit_price).toLocaleString()}
                   </div>
                   <button type="button" onClick={()=>removeItemRow(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              ))}
           </div>
           <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Purchase Value</div>
              <div className="text-2xl font-black font-mono">
                 ৳{form.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0).toLocaleString()}
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-4">
           <button type="submit" disabled={submitting}
              className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-3">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              Dispatch Purchase Order
           </button>
        </div>
      </form>
    </div>
  );
}
