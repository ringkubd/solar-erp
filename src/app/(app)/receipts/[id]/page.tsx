"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { ArrowLeft, Download, Trash2, Loader2, FileText } from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank Transfer',
  cheque: 'Cheque', mobile_banking: 'Mobile Banking (bKash/Nagad)', other: 'Other',
};

export default function ReceiptDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [receipt, setReceipt]   = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [pdfLoad, setPdfLoad]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/receipts/${id}`)
      .then(res => setReceipt(res.data))
      .catch(() => router.push('/receipts'))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = async () => {
    setPdfLoad(true);
    try {
      const res = await api.get(`/receipts/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement('a'); a.href = url; a.download = `Receipt_${receipt.receipt_no}.pdf`; a.click();
    } catch { alert('PDF generation failed.'); }
    finally { setPdfLoad(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Void receipt ${receipt.receipt_no}? This will reverse the linked invoice payment.`)) return;
    setDeleting(true);
    await api.delete(`/receipts/${id}`);
    router.push('/receipts');
  };

  if (loading) return <div className="p-16 text-center text-emerald-500 font-bold animate-pulse">Loading Receipt...</div>;
  if (!receipt) return null;

  const isLinked = !!receipt.invoice;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/receipts" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500"/>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">{receipt.receipt_no}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {METHOD_LABELS[receipt.payment_method]} &nbsp;•&nbsp; {receipt.receipt_date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadPdf} disabled={pdfLoad}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border text-sm font-bold rounded-lg hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60">
            {pdfLoad ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>} Print / PDF
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 shadow-sm transition-all disabled:opacity-60">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>} Void
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
        {/* Green amount bar */}
        <div className="bg-emerald-600 px-6 py-5 text-white">
          <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Amount Received</div>
          <div className="text-4xl font-black font-mono">৳{Number(receipt.amount).toLocaleString()}</div>
          <div className="text-xs opacity-70 mt-1">Bangladeshi Taka</div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700">
          {[
            { label: 'Receipt No',       value: receipt.receipt_no },
            { label: 'Receipt Date',     value: receipt.receipt_date },
            { label: 'Payment Method',   value: METHOD_LABELS[receipt.payment_method] || receipt.payment_method },
            { label: 'Transaction Ref',  value: receipt.transaction_ref || '—' },
            { label: 'Client',           value: receipt.client?.company_name || '—' },
            { label: 'Recorded By',      value: receipt.recorder?.name || 'System' },
          ].map(d => (
            <div key={d.label} className="bg-white dark:bg-slate-900 px-5 py-4">
              <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">{d.label}</div>
              <div className="text-sm font-semibold">{d.value}</div>
            </div>
          ))}
        </div>

        {/* Invoice link */}
        {isLinked && (
          <div className="px-6 py-4 border-t bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">Linked Invoice</div>
                <div className="font-mono font-bold text-sm text-blue-600">{receipt.invoice.invoice_no}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Total: ৳{Number(receipt.invoice.total_amount).toLocaleString()} &nbsp;•&nbsp;
                  Balance: ৳{Number(receipt.invoice.balance_due ?? (receipt.invoice.total_amount - receipt.invoice.amount_paid)).toLocaleString()}
                </div>
              </div>
              <Link href={`/invoices/${receipt.invoice_id}`}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                <FileText className="w-3.5 h-3.5"/> View Invoice
              </Link>
            </div>
          </div>
        )}

        {/* Notes */}
        {receipt.notes && (
          <div className="px-6 py-4 border-t">
            <div className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">Notes</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{receipt.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
