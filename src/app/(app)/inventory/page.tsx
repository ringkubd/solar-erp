"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Package, Plus, History, ArrowDownCircle, ArrowUpCircle, 
  AlertTriangle, Search, Filter, Loader2, ArrowRight, ArrowLeft,
  BarChart3, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function InventoryListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [moveForm, setMoveForm] = useState({
    type: 'in',
    quantity: '',
    notes: ''
  });

  const fetchItems = () => {
    setLoading(true);
    api.get('/inventory/items').then(res => {
      setItems(res.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/movements', {
        inventory_item_id: selectedItem.id,
        ...moveForm
      });
      setShowMoveModal(false);
      setMoveForm({ type: 'in', quantity: '', notes: '' });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record movement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Material Inventory</h1>
          <p className="text-sm text-slate-500">Track stock levels across all warehouses and projects.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/inventory/reports/stock">
              <button className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Stock Report
              </button>
            </Link>
            <Link href="/inventory/purchase-orders">
              <button className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">
                Purchase Orders
              </button>
            </Link>
            <Link href="/inventory/vendors">
              <button className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">
                Vendors
              </button>
            </Link>
            <Link href="/inventory/warehouses">
              <button className="px-4 py-2 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">
                Warehouses
              </button>
            </Link>
           <Link href="/inventory/items/new">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-lg hover:bg-slate-800 transition-all">
               <Plus className="w-4 h-4"/> New Material
             </button>
           </Link>
        </div>
      </div>

      {items.some(it => it.is_low) && (
        <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 flex items-center justify-between animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                 <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-red-900 tracking-tight">Critical Stock Alerts</h3>
                 <p className="text-xs font-bold text-red-700/70 uppercase tracking-widest">{items.filter(it => it.is_low).length} items have fallen below safety levels.</p>
              </div>
           </div>
           <Link href="/inventory/reports/stock">
              <button className="px-6 py-2 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                 Review All
              </button>
           </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Items', value: items.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
           { label: 'Low Stock', value: items.filter(i=>i.is_low).length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
           { label: 'Categories', value: Array.from(new Set(items.map(i=>i.category))).length, icon: Filter, color: 'text-emerald-600', bg: 'bg-emerald-50' },
         ].map((stat, i) => (
           <div key={i} className="bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                 <stat.icon className="w-6 h-6"/>
              </div>
              <div>
                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
                 <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black uppercase text-slate-500 border-b bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left">Material & SKU</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-center">Unit</th>
              <th className="px-6 py-4 text-right">Current Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600"/></td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 uppercase tracking-tight">{item.name}</div>
                  <div className="font-mono text-[10px] text-blue-600 font-bold">{item.sku}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                </td>
                <td className="px-6 py-4 text-center text-slate-400 font-bold">{item.unit}</td>
                <td className="px-6 py-4 text-right">
                   <div className={`text-lg font-black font-mono ${item.is_low ? 'text-red-500' : 'text-slate-900'}`}>
                     {item.current_stock}
                   </div>
                   {item.is_low && (
                     <div className="text-[9px] font-black text-red-400 uppercase tracking-tighter flex items-center justify-end gap-1">
                       <AlertTriangle className="w-2.5 h-2.5"/> Low Stock
                     </div>
                   )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setSelectedItem(item); setShowMoveModal(true); setMoveForm({...moveForm, type: 'in'}); }} 
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm" title="Stock IN">
                      <ArrowDownCircle className="w-4 h-4"/>
                    </button>
                    <button onClick={() => { setSelectedItem(item); setShowMoveModal(true); setMoveForm({...moveForm, type: 'out'}); }} 
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm" title="Stock OUT">
                      <ArrowUpCircle className="w-4 h-4"/>
                    </button>
                    <Link href={`/inventory/items/${item.id}/edit`}>
                      <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm" title="Edit Material">
                        <Plus className="w-4 h-4 rotate-45"/>
                      </button>
                    </Link>
                    <Link href={`/inventory/items/${item.id}/history`}>
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                        <History className="w-4 h-4"/>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Move Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
             <div className="p-6 border-b flex items-center justify-between">
                <div>
                   <h2 className="font-black text-xl tracking-tight text-slate-900">Record Stock {moveForm.type.toUpperCase()}</h2>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedItem?.name}</p>
                </div>
                <button onClick={()=>setShowMoveModal(false)} className="text-slate-400 hover:text-slate-900 font-bold px-2">✕</button>
             </div>
             <form onSubmit={handleMove} className="p-6 space-y-4">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantity ({selectedItem?.unit})</label>
                   <input type="number" step="0.01" required value={moveForm.quantity} onChange={e=>setMoveForm({...moveForm, quantity: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-mono font-bold focus:border-emerald-500 focus:ring-0 outline-none transition-all"/>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Notes / Reference</label>
                   <textarea rows={2} value={moveForm.notes} onChange={e=>setMoveForm({...moveForm, notes: e.target.value})}
                      className="w-full border-2 rounded-xl p-3 text-sm focus:border-emerald-500 focus:ring-0 outline-none transition-all" placeholder="PO number, Project hash, or reason..."></textarea>
                </div>
                <button type="submit" className={`w-full h-12 rounded-xl text-white font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${moveForm.type==='in' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'}`}>
                   Confirm {moveForm.type.toUpperCase()}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
