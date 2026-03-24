"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Plus, FileText, DollarSign, Clock, AlertTriangle,
  CheckCircle2, Download, Eye, ChevronLeft, ChevronRight,
  Search, Filter, Loader2
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:           { label: 'Draft',           cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  sent:            { label: 'Sent',             cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  paid:            { label: 'Paid',             cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  partially_paid:  { label: 'Partial',          cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  overdue:         { label: 'Overdue',          cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelled:       { label: 'Cancelled',        cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function InvoicesPage() {
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState('');
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [pdfLoading, setPdfLoading] = useState<number | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (status) params.status = status;
      const res = await api.get('/invoices', { params });
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const downloadPdf = async (inv: any) => {
    setPdfLoading(inv.id);
    try {
      const res = await api.get(`/invoices/${inv.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href    = url; a.download = `Invoice_${inv.invoice_no}.pdf`; a.click();
    } catch { alert('Could not download PDF.'); }
    finally { setPdfLoading(null); }
  };

  const invoices = data?.data || [];
  const meta     = data?.meta || {};

  // Summary stats
  const totalRevenue  = invoices.reduce((s: number, i: any) => s + parseFloat(i.total_amount || 0), 0);
  const totalPaid     = invoices.reduce((s: number, i: any) => s + parseFloat(i.amount_paid || 0), 0);
  const outstanding   = invoices.reduce((s: number, i: any) => s + parseFloat(i.balance_due || (i.total_amount - i.amount_paid) || 0), 0);
  const overdueCount  = invoices.filter((i: any) => i.status === 'overdue').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices & Billing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track payments, VAT, and outstanding balances.</p>
        </div>
        <Link href="/invoices/new">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-700 transition-all active:scale-95">
            <Plus className="w-4 h-4"/> Create Invoice
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed',    value: `৳${totalRevenue.toLocaleString()}`,  icon: FileText,      cls: 'text-slate-800 dark:text-slate-100' },
          { label: 'Collected',       value: `৳${totalPaid.toLocaleString()}`,      icon: CheckCircle2,  cls: 'text-emerald-600' },
          { label: 'Outstanding',     value: `৳${outstanding.toLocaleString()}`,    icon: DollarSign,    cls: outstanding > 0 ? 'text-amber-600' : 'text-emerald-600' },
          { label: 'Overdue',         value: `${overdueCount} inv.`,                icon: AlertTriangle, cls: overdueCount > 0 ? 'text-red-600' : 'text-slate-500' },
        ].map((s) => (
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice no, client..."
            className="w-full pl-9 pr-4 h-10 text-sm border rounded-lg bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"/>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400"/>
          {['', 'draft', 'sent', 'partially_paid', 'overdue', 'paid'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${status === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-500 hover:border-slate-400'}`}>
              {s ? STATUS_MAP[s]?.label : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50 dark:bg-slate-800/30">
            <tr>
              <th className="px-4 py-3">Invoice No</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Issue Date</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Total (BDT)</th>
              <th className="px-4 py-3 text-right">Balance (BDT)</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={9} className="text-center p-16">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500"/>
              </td></tr>
            ) : invoices.filter((i: any) =>
                !search || i.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
                i.client?.company_name?.toLowerCase().includes(search.toLowerCase())
              ).map((inv: any) => {
              const st = STATUS_MAP[inv.status] || STATUS_MAP.draft;
              const balance = parseFloat(inv.balance_due ?? (inv.total_amount - inv.amount_paid));
              return (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-white dark:bg-slate-900">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-700">{inv.invoice_no}</td>
                  <td className="px-4 py-3 font-medium">{inv.client?.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{inv.project?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.issue_date}</td>
                  <td className={`px-4 py-3 font-medium ${inv.status === 'overdue' ? 'text-red-600' : ''}`}>{inv.due_date}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{Number(inv.total_amount).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-mono font-bold ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {balance > 0 ? balance.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-wider ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Link href={`/invoices/${inv.id}`}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="View"><Eye className="w-4 h-4 text-slate-500"/></button>
                      </Link>
                      <button onClick={() => downloadPdf(inv)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Download PDF">
                        {pdfLoading === inv.id ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500"/> : <Download className="w-4 h-4 text-slate-500"/>}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && invoices.length === 0 && (
              <tr><td colSpan={9} className="text-center p-16 text-slate-400 italic">
                <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200"/>
                <p className="font-bold">No invoices yet.</p>
                <p className="text-sm mt-1">Create your first invoice to start billing clients.</p>
              </td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-xs text-slate-500">Page {meta.current_page} of {meta.last_page} — {meta.total} invoices</span>
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
