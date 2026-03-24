"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function NewJournalPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });

  const [entries, setEntries] = useState([
    { account_id: '', type: 'debit', amount: '', narration: '' },
    { account_id: '', type: 'credit', amount: '', narration: '' },
  ]);

  useEffect(() => {
    api.get('/accounts/flat').then(res => setAccounts(res.data));
  }, []);

  const addEntry = () => setEntries([...entries, { account_id: '', type: 'debit', amount: '', narration: '' }]);
  const removeEntry = (idx: number) => setEntries(entries.filter((_, i) => i !== idx));

  const updateEntry = (idx: number, field: string, val: string) => {
    const next = [...entries];
    next[idx] = { ...next[idx], [field]: val };
    setEntries(next);
  };

  const totalDebit  = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalCredit = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (entries.some(e => !e.account_id || !e.amount)) {
      setError('All entries must have an account and amount.');
      return;
    }
    if (!isBalanced) {
      setError(`Journal is not balanced! Difference: ৳${Math.abs(totalDebit - totalCredit).toLocaleString()}`);
      return;
    }

    setSaving(true);
    try {
      await api.post('/journals', { ...form, entries });
      router.push('/accounting/journals');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post journal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/accounting/journals" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500"/>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post Manual Journal</h1>
          <p className="text-sm text-slate-500">Record adjusting entries, depreciation, or custom transactions.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 text-sm font-bold">
          <AlertCircle className="w-4 h-4"/> {error}
        </div>
      )}

      {/* Header Details */}
      <div className="bg-white border rounded-xl shadow-sm p-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Date</label>
          <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})}
            className="w-full h-10 rounded-md border px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Description</label>
          <input required placeholder="E.g., Monthly depreciation of fixed assets" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full h-10 rounded-md border px-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"/>
        </div>
      </div>

      {/* Lines */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-sm">Journal Lines</h2>
          <button type="button" onClick={addEntry} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 rounded-lg transition-all">
            <Plus className="w-3.5 h-3.5"/> Add Line
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 w-[40%]">Account</th>
                <th className="px-4 py-3 w-[15%]">Type</th>
                <th className="px-4 py-3 w-[20%] text-right">Amount (BDT)</th>
                <th className="px-4 py-3 w-[20%]">Memo / Narration</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2">
                    <select required value={entry.account_id} onChange={e => updateEntry(idx, 'account_id', e.target.value)}
                      className="w-full h-9 border rounded-md px-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="">— Select Account —</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select value={entry.type} onChange={e => updateEntry(idx, 'type', e.target.value)}
                      className="w-full h-9 border rounded-md px-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50">
                      <option value="debit">DEBIT</option>
                      <option value="credit">CREDIT</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" required min="0.01" step="0.01" value={entry.amount} onChange={e => updateEntry(idx, 'amount', e.target.value)}
                      className="w-full h-9 border rounded-md px-2 text-xs text-right font-mono focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00"/>
                  </td>
                  <td className="p-2">
                    <input value={entry.narration} onChange={e => updateEntry(idx, 'narration', e.target.value)}
                      className="w-full h-9 border rounded-md px-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional line memo"/>
                  </td>
                  <td className="p-2 text-center">
                    {entries.length > 2 && (
                      <button type="button" onClick={() => removeEntry(idx)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="bg-slate-50 px-6 py-4 border-t flex justify-end">
          <div className="w-64 space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Debit</span>
              <span className="font-bold text-slate-800">৳{totalDebit.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Credit</span>
              <span className="font-bold text-slate-800">৳{totalCredit.toLocaleString(undefined, {minimumFractionDigits:2})}</span>
            </div>
            <div className={`flex justify-between items-center pt-2 border-t font-black ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>Difference</span>
              <span>৳{Math.abs(totalDebit - totalCredit).toLocaleString(undefined, {minimumFractionDigits:2})}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pr-1">
        <button type="submit" disabled={saving || !isBalanced}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95">
          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>} Post Journal
        </button>
      </div>
    </form>
  );
}
