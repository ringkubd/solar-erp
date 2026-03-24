"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Loader2, Calculator } from "lucide-react";

const EMPTY_ITEM = { description: '', item_type: 'service', qty: '1', unit_price: '', unit: '', vat_pct: '0', discount_pct: '0' };

const INPUT = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow";
const SELECT = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-[10px] font-bold text-red-500 mt-1">{msg}</p>;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients,  setClients]  = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [phases,   setPhases]   = useState<any[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    client_id:       '',
    project_id:      '',
    milestone_id:    '',
    billing_type:    'item',
    issue_date:      new Date().toISOString().slice(0, 10),
    due_date:        new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency:        'BDT',
    tax_pct:         '0',
    discount_amount: '0',
    notes:           '',
    terms:           'Payment is due within 30 days of issue. Late payments incur a 2% monthly charge.',
  });

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  useEffect(() => {
    Promise.all([api.get('/clients'), api.get('/projects')]).then(([c, p]) => {
      setClients(c.data?.data || c.data || []);
      setProjects(p.data?.data || p.data || []);
    });
  }, []);

  useEffect(() => {
    if (!form.project_id) { setPhases([]); return; }
    api.get(`/projects/${form.project_id}/phases`).then(res => setPhases(res.data || []));
  }, [form.project_id]);

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    setItems(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: value }; return n; });
  };

  const calcItem = (item: any) => {
    const qty      = parseFloat(item.qty) || 0;
    const price    = parseFloat(item.unit_price) || 0;
    const disc     = parseFloat(item.discount_pct) || 0;
    const vat      = parseFloat(item.vat_pct) || 0;
    const base     = qty * price * (1 - disc / 100);
    const vatAmt   = base * vat / 100;
    return { base, vatAmt, total: base + vatAmt };
  };

  const subtotal    = items.reduce((s, i) => s + calcItem(i).base, 0);
  const totalVat    = items.reduce((s, i) => s + calcItem(i).vatAmt, 0);
  const discount    = parseFloat(form.discount_amount) || 0;
  const grandTotal  = subtotal + totalVat - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    if (items.some(i => !i.description || !i.unit_price)) {
      setErrors({ items: 'All items must have a description and unit price.' });
      return;
    }
    if (new Date(form.due_date) < new Date(form.issue_date)) {
      setErrors({ due_date: 'Due date must be on or after the issue date.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        client_id:      form.client_id      || undefined,
        project_id:     form.project_id     || undefined,
        milestone_id:   form.milestone_id   || undefined,
        items: items.map((it, idx) => ({ ...it, sort_order: idx })),
      };
      const res = await api.post('/invoices', payload);
      router.push(`/invoices/${res.data.id}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const apiErrors = err.response.data.errors;
        const fmt: Record<string, string> = {};
        Object.keys(apiErrors).forEach(k => { fmt[k] = apiErrors[k][0]; });
        setErrors(fmt);
      } else { alert('Failed to create invoice.'); }
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500"/>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Invoice number will be auto-generated on save.</p>
        </div>
      </div>

      {/* Client, Project, Dates */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-500 uppercase tracking-widest mb-4">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Client <span className="text-red-500">*</span></label>
            <select required value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className={`${SELECT} ${errors.client_id ? 'border-red-500 ring-red-500' : ''}`}>
              <option value="">— Select Client —</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
            <FieldError msg={errors.client_id}/>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Billing Type</label>
            <select value={form.billing_type} onChange={e => setForm({...form, billing_type: e.target.value})} className={SELECT}>
              <option value="item">Item-based</option>
              <option value="milestone">Milestone / Phase</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Project (Optional)</label>
            <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value, milestone_id: ''})} className={SELECT}>
              <option value="">— No Project —</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {form.project_id && phases.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Milestone / Phase</label>
              <select value={form.milestone_id} onChange={e => setForm({...form, milestone_id: e.target.value})} className={SELECT}>
                <option value="">— No Milestone —</option>
                {phases.map((ph: any) => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Issue Date</label>
            <input type="date" required value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} className={INPUT}/>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1.5">Due Date</label>
            <input type="date" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className={`${INPUT} ${errors.due_date ? 'border-red-500' : ''}`}/>
            <FieldError msg={errors.due_date}/>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <h2 className="font-bold text-sm">Line Items</h2>
          <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all">
            <Plus className="w-3.5 h-3.5"/> Add Item
          </button>
        </div>
        {errors.items && <p className="px-5 py-2 text-xs font-bold text-red-500 bg-red-50">{errors.items}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-[9px] uppercase text-slate-500 font-bold border-b bg-slate-50/30">
              <tr>
                <th className="px-3 py-2 text-left w-[28%]">Description</th>
                <th className="px-3 py-2 text-left w-[10%]">Type</th>
                <th className="px-3 py-2 text-center w-[7%]">Qty</th>
                <th className="px-3 py-2 text-left w-[10%]">Unit</th>
                <th className="px-3 py-2 text-right w-[14%]">Unit Price</th>
                <th className="px-3 py-2 text-center w-[8%]">VAT%</th>
                <th className="px-3 py-2 text-center w-[8%]">Disc%</th>
                <th className="px-3 py-2 text-right w-[12%]">Total</th>
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, idx) => {
                const t = calcItem(item);
                return (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20">
                    <td className="px-2 py-2">
                      <input required value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                        placeholder="Item or service description" className={`${INPUT} h-8 text-xs`}/>
                    </td>
                    <td className="px-2 py-2">
                      <select value={item.item_type} onChange={e => updateItem(idx, 'item_type', e.target.value)} className={`${SELECT} h-8 text-xs`}>
                        <option value="service">Service</option>
                        <option value="material">Material</option>
                        <option value="labor">Labor</option>
                        <option value="milestone">Milestone</option>
                        <option value="other">Other</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="0.01" step="0.01" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className={`${INPUT} h-8 text-xs text-center`}/>
                    </td>
                    <td className="px-2 py-2">
                      <input value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} placeholder="pcs, kWp…" className={`${INPUT} h-8 text-xs`}/>
                    </td>
                    <td className="px-2 py-2">
                      <input required type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)} placeholder="0.00" className={`${INPUT} h-8 text-xs text-right`}/>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="0" max="100" step="0.5" value={item.vat_pct} onChange={e => updateItem(idx, 'vat_pct', e.target.value)} className={`${INPUT} h-8 text-xs text-center`}/>
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" min="0" max="100" step="0.5" value={item.discount_pct} onChange={e => updateItem(idx, 'discount_pct', e.target.value)} className={`${INPUT} h-8 text-xs text-center`}/>
                    </td>
                    <td className="px-2 py-2 text-right font-mono font-bold text-sm text-emerald-700">
                      ৳{t.total.toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      {items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-1 hover:text-red-600 text-slate-300 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="border-t px-5 py-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">৳{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-amber-600"><span>VAT</span><span className="font-mono">৳{totalVat.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Discount (BDT)</span>
              <input type="number" min="0" value={form.discount_amount} onChange={e => setForm({...form, discount_amount: e.target.value})} className="w-28 h-8 rounded-md border border-input px-2 text-sm text-right font-mono outline-none focus:ring-2 focus:ring-emerald-500"/>
            </div>
            <div className="flex justify-between font-black text-base border-t pt-2 text-emerald-700">
              <span>Grand Total</span>
              <span className="font-mono">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={4} placeholder="Optional notes visible to the client..." className="w-full text-sm border border-input rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"/>
        </div>
        <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Terms & Conditions</label>
          <textarea value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} rows={4} className="w-full text-sm border border-input rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"/>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/invoices">
          <button type="button" className="px-6 py-3 border rounded-xl text-sm font-bold bg-white hover:bg-slate-50 transition-all">Cancel</button>
        </Link>
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 disabled:opacity-60 transition-all active:scale-95">
          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Calculator className="w-4 h-4"/>}
          {saving ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
