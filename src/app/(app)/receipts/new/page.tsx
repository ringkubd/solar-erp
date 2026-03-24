"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Loader2, CheckCircle2, Info } from "lucide-react";

const INPUT  = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow";
const SELECT = INPUT;

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-red-500 mt-1">{msg}</p>;
}

export default function NewReceiptPage() {
  const router = useRouter();
  const [clients,  setClients]  = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [invoiceInfo, setInvoiceInfo] = useState<any>(null);

  const [form, setForm] = useState({
    client_id:       '',
    invoice_id:      '',
    amount:          '',
    payment_method:  'bank_transfer',
    transaction_ref: '',
    receipt_date:    new Date().toISOString().slice(0, 10),
    notes:           '',
  });

  useEffect(() => {
    api.get('/clients').then(res => setClients(res.data?.data || res.data || []));
  }, []);

  // Load invoices when client changes
  useEffect(() => {
    if (!form.client_id) { setInvoices([]); setInvoiceInfo(null); return; }
    api.get('/invoices', { params: { client_id: form.client_id } }).then(res => {
      const list = res.data?.data || res.data || [];
      setInvoices(list.filter((i: any) => i.status !== 'paid' && i.status !== 'cancelled'));
    });
    setForm(f => ({ ...f, invoice_id: '' }));
    setInvoiceInfo(null);
  }, [form.client_id]);

  // Show invoice balance info when invoice is selected
  useEffect(() => {
    if (!form.invoice_id) { setInvoiceInfo(null); return; }
    const inv = invoices.find(i => String(i.id) === form.invoice_id);
    if (inv) {
      const balance = parseFloat(inv.balance_due ?? (inv.total_amount - inv.amount_paid));
      setInvoiceInfo({ ...inv, balance });
      setForm(f => ({ ...f, amount: balance.toFixed(2) }));
    }
  }, [form.invoice_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setErrors({ amount: 'Amount must be greater than 0.' });
      return;
    }
    if (invoiceInfo && parseFloat(form.amount) > invoiceInfo.balance + 0.01) {
      setErrors({ amount: `Cannot exceed balance due of ৳${invoiceInfo.balance.toLocaleString()}.` });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, invoice_id: form.invoice_id || undefined };
      const res = await api.post('/receipts', payload);
      router.push(`/receipts/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors;
        const fmt: Record<string, string> = {};
        Object.keys(apiErrors).forEach(k => { fmt[k] = apiErrors[k][0]; });
        setErrors(fmt);
      } else { alert(err.response?.data?.message || 'Failed to create receipt.'); }
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/receipts" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500"/>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Money Receipt</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Receipt number will be auto-generated (RCP-YYYY-NNNN).</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Payment Information</h2>

        {/* Client */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Client <span className="text-red-500">*</span></label>
          <select required value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}
            className={`${SELECT} ${errors.client_id ? 'border-red-500' : ''}`}>
            <option value="">— Select Client —</option>
            {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <FieldError msg={errors.client_id}/>
        </div>

        {/* Invoice */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Link to Invoice (Optional)</label>
          <select value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})}
            className={SELECT} disabled={!form.client_id}>
            <option value="">— No Invoice Link —</option>
            {invoices.map((i: any) => (
              <option key={i.id} value={i.id}>
                {i.invoice_no} — Balance: ৳{Number(i.balance_due ?? (i.total_amount - i.amount_paid)).toLocaleString()}
              </option>
            ))}
          </select>
          <FieldError msg={errors.invoice_id}/>
          {!form.client_id && <p className="text-[10px] text-slate-400 mt-1">Select a client first to load their open invoices.</p>}

          {/* Invoice info banner */}
          {invoiceInfo && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"/>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <span className="font-bold">{invoiceInfo.invoice_no}</span> — Total: ৳{Number(invoiceInfo.total_amount).toLocaleString()} &nbsp;•&nbsp;
                Paid: ৳{Number(invoiceInfo.amount_paid).toLocaleString()} &nbsp;•&nbsp;
                <span className="font-bold text-red-600">Balance Due: ৳{invoiceInfo.balance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount + Method row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Amount (BDT) <span className="text-red-500">*</span></label>
            <input type="number" required min="0.01" step="0.01" value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              className={`${INPUT} ${errors.amount ? 'border-red-500' : ''}`}
              placeholder="0.00"/>
            <FieldError msg={errors.amount}/>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Payment Method <span className="text-red-500">*</span></label>
            <select required value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})} className={SELECT}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Date + Ref row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Receipt Date <span className="text-red-500">*</span></label>
            <input type="date" required value={form.receipt_date} onChange={e => setForm({...form, receipt_date: e.target.value})} className={INPUT}/>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Transaction Reference</label>
            <input value={form.transaction_ref} onChange={e => setForm({...form, transaction_ref: e.target.value})}
              placeholder="Bank TxID / Cheque No / MFS Ref"
              className={INPUT}/>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
            placeholder="Optional internal note..."
            className="w-full text-sm border border-input rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"/>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link href="/receipts">
          <button type="button" className="px-6 py-3 border rounded-xl text-sm font-bold bg-white hover:bg-slate-50 transition-all">Cancel</button>
        </Link>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-60 transition-all active:scale-95">
          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
          {saving ? 'Saving...' : 'Issue Receipt'}
        </button>
      </div>
    </form>
  );
}
