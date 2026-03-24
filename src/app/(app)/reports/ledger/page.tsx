"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  FilePieChart, Calendar, Download, 
  Printer, ArrowLeft, Loader2, Search,
  BookOpen, ArrowRight, Wallet
} from "lucide-react";
import Link from "next/link";

export default function GeneralLedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    api.get('/accounts/flat').then(res => {
      setAccounts(res.data);
      if (res.data.length > 0) setSelectedAcc(res.data[0].id.toString());
    });
  }, []);

  const fetchLedger = () => {
    if (!selectedAcc) return;
    setLoading(true);
    api.get(`/reports/ledger/${selectedAcc}?from=${range.from}&to=${range.to}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLedger(); }, [selectedAcc, range]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/reports/hub" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">General Ledger</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Transaction History by Account</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center bg-white border-2 rounded-xl overflow-hidden shadow-sm">
              <div className="px-3 border-r bg-slate-50">
                 <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <select value={selectedAcc} onChange={e=>setSelectedAcc(e.target.value)}
                className="px-4 py-2 text-sm font-bold bg-white outline-none focus:bg-slate-50 min-w-[200px]">
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>[{acc.code}] {acc.name}</option>
                ))}
              </select>
           </div>
           
           <div className="flex items-center bg-white border-2 rounded-xl overflow-hidden shadow-sm">
              <input type="date" value={range.from} onChange={e=>setRange({...range, from: e.target.value})}
                className="px-3 py-2 text-xs font-bold border-r outline-none" />
              <input type="date" value={range.to} onChange={e=>setRange({...range, to: e.target.value})}
                className="px-3 py-2 text-xs font-bold outline-none" />
           </div>
           
           <button onClick={() => window.print()} className="p-2.5 bg-white border-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
              <Printer className="w-4 h-4 text-slate-600" />
           </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="py-40 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-500" /></div>
        ) : data ? (
          <div>
            <div className="p-10 border-b bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="space-y-1">
                  <div className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                    {data.account.name}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded">Code: {data.account.code}</span>
                    <span>Type: {data.account.type}</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 md:text-right">
                  <div className="p-4 bg-white border rounded-2xl shadow-sm">
                     <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Opening Balance</div>
                     <div className="text-lg font-black font-mono">৳{data.opening_balance.toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                     <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Closing Balance</div>
                     <div className="text-lg font-black font-mono">৳{data.closing_balance.toLocaleString()}</div>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead className="bg-slate-50/30 text-[10px] font-black uppercase text-slate-500 border-b">
                    <tr>
                       <th className="px-8 py-5 text-left">Date</th>
                       <th className="px-8 py-5 text-left">Description / Narration</th>
                       <th className="px-8 py-5 text-right">Debit</th>
                       <th className="px-8 py-5 text-right">Credit</th>
                       <th className="px-8 py-5 text-right">Balance</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {data.entries.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No transactions found for this period.</td></tr>
                    ) : data.entries.map((entry: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-4 font-mono text-xs font-bold text-slate-500">{entry.date}</td>
                        <td className="px-8 py-4">
                           <div className="font-bold text-slate-800">{entry.description}</div>
                           {entry.narration && <div className="text-[10px] font-medium text-slate-400 mt-0.5 line-clamp-1 italic">{entry.narration}</div>}
                           <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ref: {entry.reference || 'N/A'}</div>
                        </td>
                        <td className="px-8 py-4 text-right">
                           {entry.debit ? <span className="font-mono font-black text-slate-900">৳{entry.debit.toLocaleString()}</span> : <span className="text-slate-200">—</span>}
                        </td>
                        <td className="px-8 py-4 text-right">
                           {entry.credit ? <span className="font-mono font-black text-slate-900">৳{entry.credit.toLocaleString()}</span> : <span className="text-slate-200">—</span>}
                        </td>
                        <td className="px-8 py-4 text-right font-mono font-black text-slate-900">
                           ৳{entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="py-40 text-center">
             <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <div className="text-slate-400 font-bold">Select an account to view ledger details</div>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
         <div className="relative z-10">
            <h3 className="text-xl font-black mb-1">Need a specialized audit?</h3>
            <p className="text-slate-400 text-sm">You can filtered by source (Invoice, Receipt, or Stock) via Advanced Search.</p>
         </div>
         <button className="relative z-10 px-6 py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-400 transition-colors">
            Advanced Audit
         </button>
         <FilePieChart className="absolute right-0 top-0 w-32 h-32 text-white/5 -mr-10 -mt-10" />
      </div>
    </div>
  );
}
