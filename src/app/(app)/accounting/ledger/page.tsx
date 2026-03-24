"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Search, Filter, BookOpen } from "lucide-react";

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState('');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/accounts/flat').then(res => setAccounts(res.data));
  }, []);

  const fetchLedger = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accountId) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/ledger/${accountId}`, { params: dateRange });
      setLedger(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) fetchLedger();
  }, [accountId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">General Ledger</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View transaction history and running balance for any account.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border rounded-xl shadow-sm p-4 flex items-end gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Account</label>
          <select value={accountId} onChange={e => setAccountId(e.target.value)}
            className="w-full h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium">
            <option value="">— Select an Account —</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name} ({a.type})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">From Date</label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})}
            className="h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">To Date</label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})}
            className="h-10 border rounded-lg px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
        </div>
        <button onClick={fetchLedger} disabled={!accountId || loading}
          className="h-10 px-5 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Generate'}
        </button>
      </div>

      {/* Ledger Report */}
      {ledger && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-50 border-b flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-emerald-800">{ledger.account.code} - {ledger.account.name}</h2>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{ledger.account.type} Account</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Period</p>
              <p className="text-sm font-medium">{ledger.period.from} to {ledger.period.to}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-left w-32">Date</th>
                  <th className="px-4 py-3 text-left w-24">Reference</th>
                  <th className="px-4 py-3 text-left">Description & Narration</th>
                  <th className="px-4 py-3 text-right w-32">Debit (BDT)</th>
                  <th className="px-4 py-3 text-right w-32">Credit (BDT)</th>
                  <th className="px-4 py-3 text-right w-32">Balance (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ledger.entries.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 italic">No transactions found for this period.</td></tr>
                ) : (
                  ledger.entries.map((req: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{req.date}</td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">{req.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{req.description}</div>
                        {req.narration && <div className="text-xs text-slate-500 italic mt-0.5">{req.narration}</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{req.debit ? Number(req.debit).toLocaleString(undefined, {minimumFractionDigits:2}) : ''}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">{req.credit ? Number(req.credit).toLocaleString(undefined, {minimumFractionDigits:2}) : ''}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">{Number(req.balance).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {ledger.entries.length > 0 && (
                <tfoot className="border-t bg-slate-50 text-emerald-900 font-bold font-mono">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right uppercase tracking-wider text-xs font-sans">Closing Balance</td>
                    <td className="px-4 py-3 text-right">৳{Number(ledger.closing_balance).toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {!ledger && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-xl">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4"/>
          <p className="text-slate-500 font-medium font-sm">Select an account and date range to view its ledger.</p>
        </div>
      )}
    </div>
  );
}
