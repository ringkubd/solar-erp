"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  BookOpen, Calendar, Download, 
  Printer, ArrowLeft, Loader2, Info
} from "lucide-react";
import Link from "next/link";

export default function TrialBalancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const fetchReport = () => {
    setLoading(true);
    api.get(`/reports/trial-balance?as_of=${asOf}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [asOf]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/reports/hub" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trial Balance</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">General Ledger Summary</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="date" value={asOf} onChange={e=>setAsOf(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-sm" />
           </div>
           <button onClick={() => window.print()} className="p-2.5 bg-white border-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-5 h-5 text-slate-600" />
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
           </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 rounded-xl">
                 <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Statement Date</div>
                 <div className="font-mono text-sm font-black text-slate-700">{asOf}</div>
              </div>
           </div>
           
           {!loading && data && (
             <div className="flex gap-8">
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Debit</div>
                   <div className="text-xl font-black text-slate-900 font-mono">৳{data.totals.debit.toLocaleString()}</div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Credit</div>
                   <div className="text-xl font-black text-slate-900 font-mono">৳{data.totals.credit.toLocaleString()}</div>
                </div>
             </div>
           )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/30 text-[10px] font-black uppercase text-slate-500 border-b">
              <tr>
                <th className="px-8 py-4 text-left">Account Code & Name</th>
                <th className="px-8 py-4 text-right">Debit (৳)</th>
                <th className="px-8 py-4 text-right">Credit (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
              ) : data?.rows.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-mono text-[10px] font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                           {row.code}
                        </div>
                        <div>
                           <div className="font-bold text-slate-800">{row.name}</div>
                           <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{row.type}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                     {row.debit > 0 ? (
                        <span className="font-mono font-black text-slate-900">{row.debit.toLocaleString()}</span>
                     ) : <span className="text-slate-200">—</span>}
                  </td>
                  <td className="px-8 py-4 text-right">
                     {row.credit > 0 ? (
                        <span className="font-mono font-black text-slate-900">{row.credit.toLocaleString()}</span>
                     ) : <span className="text-slate-200">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            {!loading && data && (
              <tfoot className="bg-slate-900 text-white font-mono">
                 <tr>
                    <td className="px-8 py-6 font-black uppercase tracking-widest text-[10px]">Grand Totals</td>
                    <td className="px-8 py-6 text-right text-lg font-black border-l border-white/10">৳{data.totals.debit.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right text-lg font-black border-l border-white/10">৳{data.totals.credit.toLocaleString()}</td>
                 </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {!loading && data && !data.totals.balanced && (
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-center gap-4 text-red-600">
           <AlertCircle className="w-5 h-5 flex-shrink-0" />
           <p className="text-sm font-bold uppercase tracking-tight">Warning: Trial Balance is NOT balanced. Please review manual journal entries.</p>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-start gap-4">
         <Info className="w-5 h-5 text-slate-400 mt-0.5" />
         <div className="text-xs text-slate-500 leading-relaxed space-y-2">
            <p><strong>About Trial Balance:</strong> This internal report lists the balances of all general ledger accounts. If the total debits equal total credits, the trial balance is considered balanced, proving that the accounting system is arithmetically correct.</p>
            <p className="font-bold italic">Note: ECOPAC ERP enforces double-entry at the transaction level to prevent imbalances.</p>
         </div>
      </div>
    </div>
  );
}
