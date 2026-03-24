"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  BarChart3, Calendar, Download, 
  Printer, ArrowLeft, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import Link from "next/link";

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  });

  const fetchReport = () => {
    setLoading(true);
    api.get(`/reports/profit-loss?from=${range.from}&to=${range.to}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, [range]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/reports/hub" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Profit & Loss</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Income Statement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center bg-white border-2 rounded-xl overflow-hidden shadow-sm">
              <input type="date" value={range.from} onChange={e=>setRange({...range, from: e.target.value})}
                className="px-3 py-2 text-xs font-bold border-r outline-none focus:bg-slate-50" title="From Date" />
              <input type="date" value={range.to} onChange={e=>setRange({...range, to: e.target.value})}
                className="px-3 py-2 text-xs font-bold outline-none focus:bg-slate-50" title="To Date" />
           </div>
           <button onClick={() => window.print()} className="p-2.5 bg-white border-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Printer className="w-4 h-4 text-slate-600" />
           </button>
           <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-lg hover:bg-slate-800 transition-all">
              Export
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-500 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
           <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Total Revenue</div>
              <div className="text-3xl font-black font-mono">৳{data?.total_income.toLocaleString() || '0'}</div>
           </div>
           <ArrowUpRight className="absolute right-6 top-8 w-12 h-12 opacity-20" />
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Net Profit</div>
              <div className="text-3xl font-black font-mono ${data?.net_profit < 0 ? 'text-red-400' : 'text-emerald-400'}">
                ৳{data?.net_profit.toLocaleString() || '0'}
              </div>
           </div>
           <BarChart3 className="absolute right-6 top-8 w-12 h-12 opacity-10" />
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden p-10 space-y-12">
        {/* Income Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                 <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Operating Revenue</h2>
           </div>
           
           <div className="space-y-1">
              {loading ? <div className="animate-pulse h-20 bg-slate-50 rounded-xl" /> : data?.income.map((item: any) => (
                <div key={item.code} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                   <div>
                      <div className="font-bold text-slate-700 group-hover:text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-mono font-black text-slate-400">{item.code}</div>
                   </div>
                   <div className="font-mono font-bold text-slate-900">৳{item.amount.toLocaleString()}</div>
                </div>
              ))}
              {!loading && data?.income.length === 0 && <div className="text-center py-4 text-slate-400 text-xs font-bold italic">No revenue recorded in this period.</div>}
           </div>
           
           <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Total Operating Income</div>
              <div className="text-lg font-black text-emerald-600 font-mono">৳{data?.total_income.toLocaleString() || '0'}</div>
           </div>
        </section>

        {/* Expenses Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                 <ArrowDownRight className="w-4 h-4 text-red-600" />
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Operating Expenses</h2>
           </div>
           
           <div className="space-y-1">
              {loading ? <div className="animate-pulse h-20 bg-slate-50 rounded-xl" /> : data?.expenses.map((item: any) => (
                <div key={item.code} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                   <div>
                      <div className="font-bold text-slate-700 group-hover:text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-mono font-black text-slate-400">{item.code}</div>
                   </div>
                   <div className="font-mono font-bold text-red-500">৳{item.amount.toLocaleString()}</div>
                </div>
              ))}
              {!loading && data?.expenses.length === 0 && <div className="text-center py-4 text-slate-400 text-xs font-bold italic">No expenses recorded in this period.</div>}
           </div>
           
           <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Total Operating Expenses</div>
              <div className="text-lg font-black text-red-600 font-mono">৳{data?.total_expense.toLocaleString() || '0'}</div>
           </div>
        </section>

        {/* Grand Total */}
        <div className="pt-8 border-t-4 border-double border-slate-900 flex justify-between items-center">
           <div className="text-xl font-black uppercase tracking-tighter text-slate-900">Net Profit / Loss</div>
           <div className={`text-4xl font-black font-mono ${data?.net_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ৳{data?.net_profit.toLocaleString() || '0'}
           </div>
        </div>
      </div>
    </div>
  );
}
