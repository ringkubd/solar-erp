"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Plus, Download, Eye, Search, Filter, Loader2,
  Receipt, TrendingUp, Wallet, Users2, ChevronLeft, ChevronRight
} from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank Transfer',
  cheque: 'Cheque', mobile_banking: 'Mobile Banking', other: 'Other',
};

const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-green-100 text-green-700 border-green-200',
  bank_transfer: 'bg-blue-100 text-blue-700 border-blue-200',
  cheque: 'bg-purple-100 text-purple-700 border-purple-200',
  mobile_banking: 'bg-pink-100 text-pink-700 border-pink-200',
  other: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function ReceiptsPage() {
  const [data, setData]             = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [pdfId, setPdfId]           = useState<number | null>(null);
  const [method, setMethod]         = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (method) params.payment_method = method;
      const res = await api.get('/receipts', { params });
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, method]);

  useEffect(() => { fetch(); }, [fetch]);

  const downloadPdf = async (r: any) => {
    setPdfId(r.id);
    try {
      const res = await api.get(`/receipts/${r.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a'); a.href = url; a.download = `Receipt_${r.receipt_no}.pdf`; a.click();
    } catch { alert('PDF failed.'); }
    finally { setPdfId(null); }
  };

  const receipts    = (data?.data || []).filter((r: any) =>
    !search || r.receipt_no?.toLowerCase().includes(search.toLowerCase()) ||
    r.client?.company_name?.toLowerCase().includes(search.toLowerCase())
  );
  const meta        = data?.meta || {};
  const total       = (data?.data || []).reduce((s: number, r: any) => s + parseFloat(r.amount || 0), 0);
  const cashTotal   = (data?.data || []).filter((r: any) => r.payment_method === 'cash').reduce((s: number, r: any) => s + parseFloat(r.amount), 0);
  const bankTotal   = (data?.data || []).filter((r: any) => r.payment_method === 'bank_transfer').reduce((s: number, r: any) => s + parseFloat(r.amount), 0);
  const clients     = new Set((data?.data || []).map((r: any) => r.client_id)).size;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Money Receipts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All incoming payments with auto-linked invoices.</p>
        </div>
        <Link href="/receipts/new">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all active:scale-95">
            <Plus className="w-4 h-4"/> New Receipt
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Received',  value: `৳${total.toLocaleString()}`,          icon: Wallet,    cls: 'text-emerald-600' },
          { label: 'Cash Payments',   value: `৳${cashTotal.toLocaleString()}`,       icon: TrendingUp, cls: 'text-green-600' },
          { label: 'Bank Transfers',  value: `৳${bankTotal.toLocaleString()}`,       icon: Receipt,   cls: 'text-blue-600' },
          { label: 'Clients',         value: `${clients}`,                            icon: Users2,    cls: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{s.label}</span>
              <s.icon className="w-4 h-4 text-slate-300"/>
            </div>
            <div className={`text-xl font-black font-mono ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by receipt no or client..."
            className="w-full pl-9 pr-4 h-10 text-sm border rounded-lg bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"/>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400"/>
          {['', 'cash', 'bank_transfer', 'cheque', 'mobile_banking'].map(m => (
            <button key={m} onClick={() => { setMethod(m); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${method === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500 hover:border-slate-400'}`}>
              {m ? METHOD_LABELS[m] : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50 dark:bg-slate-800/30">
            <tr>
              <th className="px-4 py-3">Receipt No</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3 text-right">Amount (BDT)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="text-center p-16">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500"/>
              </td></tr>
            ) : receipts.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-emerald-700">{r.receipt_no}</td>
                <td className="px-4 py-3 text-slate-600">{r.receipt_date}</td>
                <td className="px-4 py-3 font-medium">{r.client?.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  {r.invoice ? (
                    <Link href={`/invoices/${r.invoice_id}`} className="font-mono text-xs text-blue-600 hover:underline">{r.invoice.invoice_no}</Link>
                  ) : <span className="text-slate-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase ${METHOD_COLORS[r.payment_method] || METHOD_COLORS.other}`}>
                    {METHOD_LABELS[r.payment_method] || r.payment_method}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.transaction_ref ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono font-black text-base text-emerald-700">
                  ৳{Number(r.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/receipts/${r.id}`}>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="View"><Eye className="w-4 h-4 text-slate-500"/></button>
                    </Link>
                    <button onClick={() => downloadPdf(r)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Download PDF">
                      {pdfId === r.id ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500"/> : <Download className="w-4 h-4 text-slate-500"/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && receipts.length === 0 && (
              <tr><td colSpan={8} className="text-center p-16 text-slate-400 italic">
                <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-200"/>
                <p className="font-bold">No receipts yet.</p>
                <p className="text-sm mt-1">Issue your first money receipt to start tracking payments.</p>
              </td></tr>
            )}
          </tbody>
        </table>

        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-xs text-slate-500">Page {meta.current_page} of {meta.last_page} — {meta.total} receipts</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
              <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
