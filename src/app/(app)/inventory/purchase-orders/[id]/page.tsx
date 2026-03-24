"use client";

import { useState, useEffect, use } from "react";
import api from "@/lib/api";
import { 
  FileText, Package, CheckCircle2, 
  ArrowLeft, Loader2, Truck, 
  Calendar, AlertTriangle, Database
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const DISCRETE_UNITS = ['pcs', 'unit', 'nos', 'box', 'packet', 'set', 'each'];

export default function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [po, setPo] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiving, setReceiving] = useState<any[]>([]);
  const [targetWarehouse, setTargetWarehouse] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/inventory/purchase-orders/${id}`),
      api.get('/inventory/warehouses')
    ]).then(([poRes, whRes]) => {
      setPo(poRes.data);
      setWarehouses(whRes.data);
      setReceiving(poRes.data.items.map((i: any) => ({
        id: i.inventory_item_id,
        name: i.inventory_item.name,
        quantity: i.quantity - i.received_quantity,
        max: i.quantity - i.received_quantity
      })));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleReceive = async () => {
    if (!targetWarehouse) return alert("Select a warehouse");
    
    setSubmitting(true);
    try {
      await api.post(`/inventory/purchase-orders/${id}/receive`, {
        warehouse_id: targetWarehouse,
        items: receiving.filter(i => i.quantity > 0)
      });
      alert("Goods received and stock updated!");
      router.refresh(); // Or re-fetch data
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to receive goods');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory/purchase-orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Order #{po.po_no}</h1>
               <span className={`px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest`}>
                 {po.status}
               </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Supplier: {po.vendor?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
               <div className="p-8 border-b bg-slate-50/50">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ordered Materials</h3>
               </div>
               <table className="w-full text-sm">
                  <thead className="text-[10px] font-black uppercase text-slate-400 border-b">
                     <tr>
                        <th className="px-8 py-4 text-left">Item</th>
                        <th className="px-8 py-4 text-center">Ordered</th>
                        <th className="px-8 py-4 text-center">Received</th>
                        <th className="px-8 py-4 text-right">Unit Price</th>
                        <th className="px-8 py-4 text-right">Total</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {po.items.map((item: any) => (
                        <tr key={item.id}>
                           <td className="px-8 py-4 font-bold text-slate-900">{item.inventory_item?.name}</td>
                           <td className="px-8 py-4 text-center font-mono font-bold">{item.quantity}</td>
                           <td className="px-8 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.received_quantity >= item.quantity ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                 {item.received_quantity}
                              </span>
                           </td>
                           <td className="px-8 py-4 text-right text-slate-500 font-mono">৳{item.unit_price}</td>
                           <td className="px-8 py-4 text-right font-black font-mono">৳{item.total_price.toLocaleString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {po.status !== 'received' && (
               <div className="bg-white border-2 border-blue-100 rounded-[2rem] shadow-xl shadow-blue-500/5 p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Truck className="w-6 h-6 text-blue-500" />
                        Goods Received Note (GRN)
                     </h3>
                     <div className="flex items-center gap-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposit To:</label>
                        <select value={targetWarehouse} onChange={e=>setTargetWarehouse(e.target.value)}
                           className="h-10 border-2 border-slate-100 rounded-lg px-3 font-bold text-xs focus:border-blue-500 outline-none">
                           <option value="">Select Warehouse...</option>
                           {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {receiving.map((r, idx) => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all">
                           <div className="font-bold text-slate-700">{r.name}</div>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending: {r.max}</span>
                              <input type="number" 
                                 step={po.items.find((i: any) => i.inventory_item_id == r.id)?.inventory_item?.unit && DISCRETE_UNITS.includes(po.items.find((i: any) => i.inventory_item_id == r.id).inventory_item.unit.toLowerCase()) ? "1" : "any"} 
                                 value={r.quantity} max={r.max} onChange={e => {
                                 const next = [...receiving];
                                 next[idx].quantity = parseFloat(e.target.value) || 0;
                                 setReceiving(next);
                              }}
                              className="w-24 h-10 bg-white border-2 border-slate-100 rounded-lg text-center font-bold focus:border-blue-500 outline-none" />
                           </div>
                        </div>
                     ))}
                  </div>

                  <button onClick={handleReceive} disabled={submitting || !targetWarehouse}
                     className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all">
                     Confirm System Stock Arrival
                  </button>
               </div>
            )}
         </div>

         <div className="space-y-6">
            <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Summary</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Order Date</span>
                     <span className="font-bold text-slate-900">{po.order_date}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Expected</span>
                     <span className="font-bold text-slate-900">{po.expected_date || 'N/A'}</span>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</span>
                     <span className="text-xl font-black font-mono text-blue-600">৳{po.total_amount.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="bg-emerald-50 rounded-[2rem] p-8 border-2 border-emerald-100 italic text-emerald-800 text-sm font-medium">
               "This purchase order generates an accounting liability once goods are partially or fully received."
            </div>
         </div>
      </div>
    </div>
  );
}
