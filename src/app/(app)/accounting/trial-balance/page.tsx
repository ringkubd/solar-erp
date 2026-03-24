"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Calculator, CheckCircle2, AlertCircle } from "lucide-react";

export default function TrialBalancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  const fetchTB = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/trial-balance', { params: { as_of: asOf } });
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTB();
  }, [asOf]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trial Balance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verification of total debits and credits as of a specific date.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">As of</label>
          <input type="date" value={asOf} onChange={e => setAsOf(e.target.value)}
            className="h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black uppercase text-slate-500 bg-slate-50/50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Account</th>
              <th className="px-6 py-4 text-right">Debit (BDT)</th>
              <th className="px-6 py-4 text-right">Credit (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600"/></td></tr>
            ) : data?.rows.map((row: any) => (
              <tr key={row.code} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{row.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{row.code} — {row.type.toUpperCase()}</div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-600">
                  {row.debit > 0 ? Number(row.debit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-600">
                  {row.credit > 0 ? Number(row.credit).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          {!loading && data && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr className="font-mono font-black text-slate-900">
                <td className="px-6 py-5 text-right uppercase text-[10px] tracking-widest text-slate-500">Totals</td>
                <td className="px-6 py-5 text-right">৳{Number(data.totals.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-5 text-right">৳{Number(data.totals.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {!loading && data && (
        <div className={`p-6 rounded-2xl border flex items-center gap-4 ${data.totals.balanced ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {data.totals.balanced ? <CheckCircle2 className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
          <div>
            <div className="font-black uppercase tracking-widest text-[10px] mb-1">Status</div>
            <div className="text-lg font-bold">
              {data.totals.balanced 
                ? 'Your Trial Balance is currently balanced.' 
                : `Trial Balance is OUT OF BALANCE by ৳${Math.abs(data.totals.debit - data.totals.credit).toLocaleString()}.`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
