"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  History, ArrowLeft, ArrowDownCircle, ArrowUpCircle, 
  Loader2, Calculator, Calendar, User, FileText
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InventoryHistoryPage() {
  const params = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/inventory/items/${params.id}/history`).then(res => {
      setHistory(res.data.data);
    }).finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500"/>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movement History</h1>
          <p className="text-sm text-slate-500">Full audit trail for this material.</p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black uppercase text-slate-500 bg-slate-50/50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-right">Quantity</th>
              <th className="px-6 py-4 text-left font-mono">Reference</th>
              <th className="px-6 py-4 text-left">Notes</th>
              <th className="px-6 py-4 text-left">Handled By</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-600 font-medium">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600"/></td></tr>
            ) : history.length === 0 ? (
               <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No movements recorded yet.</td></tr>
            ) : history.map((m: any) => (
              <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400"/>
                    {new Date(m.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className={`flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest ${m.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.type === 'in' ? <ArrowDownCircle className="w-3.5 h-3.5"/> : <ArrowUpCircle className="w-3.5 h-3.5"/> }
                      Stock {m.type}
                   </div>
                </td>
                <td className="px-6 py-4 text-right font-black font-mono text-slate-900">
                  {m.type === 'in' ? '+' : '-'}{m.quantity}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 uppercase">
                    {m.reference_type || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs italic text-slate-500">
                   {m.notes || 'No notes.'}
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                   {m.user?.name || 'System'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
