"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Download, Send, Plus, Trash2, CheckCircle2,
  Clock, AlertTriangle, DollarSign, FileText, Loader2, X
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Draft',    cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  sent:           { label: 'Sent',     cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  paid:           { label: 'Paid',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  partially_paid: { label: 'Partial',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  overdue:        { label: 'Overdue',  cls: 'bg-red-100 text-red-700 border-red-200' },
  cancelled:      { label: 'Cancelled', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const EMPTY_PAYMENT = { amount: '', payment_method: 'bank_transfer', payment_date: new Date().toISOString().slice(0,10), transaction_ref: '', reference_note: '' };

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [invoice, setInvoice]         = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm]         = useState(EMPTY_PAYMENT);
  const [saving, setSaving]           = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  const fetchInvoice = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch { router.push('/invoices'); }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a');
      a.href    = url; a.download = `Invoice_${invoice.invoice_no}.pdf`; a.click();
    } catch { alert('PDF generation failed.'); }
    finally { setPdfLoading(false); }
  };

  const markSent = async () => {
    await api.post(`/invoices/${id}/mark-sent`);
    fetchInvoice(true);
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    setSaving(true);
    try {
      await api.post(`/invoices/${id}/payments`, payForm);
      setPayForm(EMPTY_PAYMENT); setShowPayModal(false);
      fetchInvoice(true);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors;
        const fmt: Record<string, string> = {};
        Object.keys(apiErrors).forEach(k => { fmt[k] = apiErrors[k][0]; });
        setErrors(fmt);
      } else { alert(err.response?.data?.message || 'Payment failed.'); }
    } finally { setSaving(false); }
  };

  const deletePayment = async (payId: number) => {
    if (!confirm('Reverse this payment entry?')) return;
    await api.delete(`/invoices/${id}/payments/${payId}`);
    fetchInvoice(true);
  };

  if (loading) return <div className="p-16 text-center text-emerald-500 font-bold animate-pulse">Loading Invoice...</div>;
  if (!invoice) return null;

  const st = STATUS_MAP[invoice.status] || STATUS_MAP.draft;
  const balance = parseFloat(invoice.balance_due ?? (invoice.total_amount - invoice.amount_paid));

  return (
    <div className="space-y-6">

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Record Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={recordPayment} className="px-6 py-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Amount (BDT)</label>
                <input type="number" required step="0.01" min="0.01" max={balance}
                  value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})}
                  className={`w-full h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${errors.amount ? 'border-red-500' : 'border-input'}`}/>
                {errors.amount && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.amount}</p>}
                <p className="text-[10px] text-slate-400 mt-1">Outstanding balance: ৳{balance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Payment Method</label>
                <select value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Payment Date</label>
                <input type="date" required value={payForm.payment_date} onChange={e => setPayForm({...payForm, payment_date: e.target.value})}
                  className="w-full h-10 rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Transaction Ref</label>
                <input value={payForm.transaction_ref} onChange={e => setPayForm({...payForm, transaction_ref: e.target.value})}
                  placeholder="Bank ref / MFS TxID"
                  className="w-full h-10 rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Note</label>
                <input value={payForm.reference_note} onChange={e => setPayForm({...payForm, reference_note: e.target.value})}
                  placeholder="Optional note"
                  className="w-full h-10 rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>} Record Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500"/>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight font-mono">{invoice.invoice_no}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${st.cls}`}>{st.label}</span>
              <span className="text-sm text-muted-foreground">• {invoice.billing_type === 'milestone' ? 'Milestone Billing' : 'Item Billing'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Client: <span className="font-semibold">{invoice.client?.company_name ?? '—'}</span>
              {invoice.project && <> • Project: <span className="font-semibold">{invoice.project.name}</span></>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status === 'draft' && (
            <button onClick={markSent} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95">
              <Send className="w-4 h-4"/> Mark as Sent
            </button>
          )}
          {balance > 0 && (
            <button onClick={() => setShowPayModal(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
              <Plus className="w-4 h-4"/> Record Payment
            </button>
          )}
          <button onClick={downloadPdf} disabled={pdfLoading} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border text-sm font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60">
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500"/> : <Download className="w-4 h-4"/>} Download PDF
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Issue Date',  value: invoice.issue_date, cls: '' },
          { label: 'Due Date',    value: invoice.due_date,   cls: invoice.status === 'overdue' ? 'text-red-600' : '' },
          { label: 'Total',       value: `৳${Number(invoice.total_amount).toLocaleString()}`, cls: 'text-slate-800 dark:text-slate-100 font-mono' },
          { label: 'Balance Due', value: `৳${balance.toLocaleString()}`, cls: balance > 0 ? 'text-red-600 font-mono' : 'text-emerald-600 font-mono' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{s.label}</div>
            <div className={`text-xl font-black ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Line Items */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 dark:bg-slate-800/50 font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600"/> Line Items
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/30">
            <tr>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-center">Qty</th>
              <th className="px-4 py-2 text-left">Unit</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">VAT ({invoice.items?.[0]?.vat_pct ?? 0}%)</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(invoice.items || []).map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="px-4 py-3 font-medium">{item.description}</td>
                <td className="px-4 py-3"><span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{item.item_type}</span></td>
                <td className="px-4 py-3 text-center font-mono">{item.qty}</td>
                <td className="px-4 py-3 text-slate-500">{item.unit ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono">৳{Number(item.unit_price).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">৳{Number(item.vat_amount ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono font-bold">৳{Number(item.total_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 bg-slate-50 dark:bg-slate-800/50">
            <tr><td colSpan={5}/><td className="px-4 py-2 text-sm text-slate-500 text-right">Subtotal</td><td className="px-4 py-2 font-mono font-bold text-right">৳{Number(invoice.subtotal).toLocaleString()}</td></tr>
            {parseFloat(invoice.vat_amount) > 0 && <tr><td colSpan={5}/><td className="px-4 py-2 text-sm text-slate-500 text-right">VAT</td><td className="px-4 py-2 font-mono text-right text-amber-600">৳{Number(invoice.vat_amount).toLocaleString()}</td></tr>}
            {parseFloat(invoice.discount_amount) > 0 && <tr><td colSpan={5}/><td className="px-4 py-2 text-sm text-slate-500 text-right">Discount</td><td className="px-4 py-2 font-mono text-right text-emerald-600">-৳{Number(invoice.discount_amount).toLocaleString()}</td></tr>}
            <tr className="border-t"><td colSpan={5}/><td className="px-4 py-3 text-base font-bold text-emerald-700 text-right">Total</td><td className="px-4 py-3 font-mono font-black text-base text-emerald-700 text-right">৳{Number(invoice.total_amount).toLocaleString()}</td></tr>
          </tfoot>
        </table>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 dark:bg-slate-800/50 font-bold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600"/> Payment History</div>
          <span className="text-xs text-slate-500">{(invoice.payments || []).length} records</span>
        </div>
        {(invoice.payments || []).length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm italic">No payments recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/30">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Note</th>
                <th className="px-4 py-2 text-right">Amount</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(invoice.payments || []).map((pay: any) => (
                <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">{pay.payment_date}</td>
                  <td className="px-4 py-3 capitalize">{pay.payment_method?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{pay.transaction_ref ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{pay.reference_note ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">৳{Number(pay.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deletePayment(pay.id)} className="p-1 hover:text-red-600 text-slate-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2">
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <td colSpan={4} className="px-4 py-3 text-sm font-bold">Total Paid</td>
                <td className="px-4 py-3 text-right font-mono font-black text-emerald-700">৳{Number(invoice.amount_paid).toLocaleString()}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoice.notes && <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
          </div>}
          {invoice.terms && <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Terms & Conditions</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{invoice.terms}</p>
          </div>}
        </div>
      )}
    </div>
  );
}
