"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  FileText, Plus, ShoppingCart, 
  Calendar, ArrowLeft, Loader2, Clock, CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function PurchaseOrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/inventory/purchase-orders').then(res => setOrders(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'partially_received': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchase Orders</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Direct Procurement Tracking</p>
           </div>
        </div>
        <Link href="/inventory/purchase-orders/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-slate-800 transition-all">
            <Plus className="w-4 h-4"/> Raise PO
          </button>
        </Link>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
             <ShoppingCart className="w-12 h-12 text-slate-100 mx-auto mb-4" />
             <div className="text-slate-400 font-bold">No purchase orders found. Start by raising a new PO.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-500 border-b">
              <tr>
                <th className="px-8 py-5 text-left">PO Number & Date</th>
                <th className="px-8 py-5 text-left">Supplier</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Total Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                     <div className="font-mono font-black text-blue-600 uppercase tracking-tighter">#{po.po_no}</div>
                     <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" /> {po.order_date}
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="font-bold text-slate-800">{po.vendor?.name}</div>
                     <div className="text-[10px] text-slate-400 font-medium italic">{po.creator?.name}</div>
                  </td>
                  <td className="px-8 py-5 text-center">
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(po.status)}`}>
                        {po.status.replace('_', ' ')}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-black text-slate-900">
                     ৳{po.total_amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                     <Link href={`/inventory/purchase-orders/${po.id}`}>
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                           Manage Goods
                        </button>
                     </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
