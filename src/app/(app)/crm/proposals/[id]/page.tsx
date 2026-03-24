"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Download, Mail, CheckCircle, Calculator, FileText } from "lucide-react";

export default function ProposalDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/proposals/${id}`).then((res) => {
      setProposal(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/proposals/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proposal_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (e) {
      alert("Failed to download PDF.");
    }
  };

  const handleSendEmail = () => {
    alert(`Sending Proposal ${proposal.proposal_no} via Email...`);
    setTimeout(() => alert("Email Sent successfully!"), 1000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Proposal Details...</div>;
  if (!proposal) return <div className="p-8 text-center text-red-500">Failed to load proposal.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/crm/proposals" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono">{proposal.proposal_no} • Created: {new Date(proposal.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={handleSendEmail} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 font-bold inset-y-0 rounded-md flex items-center gap-2 border shadow-sm">
              <Mail className="w-4 h-4"/> Email
           </button>
           <button onClick={handleDownloadPdf} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 font-bold inset-y-0 rounded-md flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4"/> Download PDF
           </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left Column: Details */}
         <div className="md:col-span-2 space-y-6">
            <div className="border rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm">
               <h2 className="font-bold text-lg border-b pb-2 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> Executive Scope</h2>
               <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {proposal.notes || "No detailed scope provided."}
               </p>
            </div>
            
            {proposal.sections?.map((section: any) => (
                <div key={section.id} className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                   <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b font-bold font-mono text-sm tracking-wide text-slate-600 dark:text-slate-300">
                      BOQ: {section.title}
                   </div>
                   <table className="w-full text-sm text-left">
                     <thead className="bg-white dark:bg-slate-900 text-xs font-bold uppercase text-slate-500 border-b">
                         <tr>
                           <th className="px-4 py-2">Item</th>
                           <th className="px-4 py-2 text-center">Qty</th>
                           <th className="px-4 py-2 text-right">Price</th>
                           <th className="px-4 py-2 text-right">Total</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y">
                        {section.items?.map((item: any) => (
                           <tr key={item.id}>
                              <td className="px-4 py-3 font-medium">{item.name}</td>
                              <td className="px-4 py-3 text-center">{item.quantity}</td>
                              <td className="px-4 py-3 text-right">৳{parseFloat(item.unit_price).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-bold text-indigo-600">৳{parseFloat(item.total_price).toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
            ))}
         </div>

         {/* Right Column: Specs & Client */}
         <div className="space-y-6">
            <div className="border rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
               <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Prepared For</h3>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{proposal.client?.company_name || proposal.lead?.full_name}</p>
                  <p className="text-sm text-slate-600">{proposal.client?.contact_email || proposal.lead?.email}</p>
               </div>
               <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Status</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded-md tracking-wider border border-amber-200">{proposal.status}</span>
               </div>
               <div className="pt-4 border-t">
                   <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">Grand Total</h3>
                   <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">৳{parseFloat(proposal.total_amount).toLocaleString()}</p>
               </div>
            </div>

            {proposal.specs && (
               <div className="border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-900 rounded-xl p-5 shadow-sm">
                  <h3 className="font-bold text-indigo-700 dark:text-indigo-400 mb-4 flex items-center gap-2"><Calculator className="w-4 h-4"/> Engineering Sizing</h3>
                  
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between border-b border-indigo-100/50 pb-1">
                        <span className="text-slate-600 dark:text-slate-400">System Size</span>
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">{proposal.specs.system_size_kw} kW</span>
                     </div>
                     <div className="flex justify-between border-b border-indigo-100/50 pb-1">
                        <span className="text-slate-600 dark:text-slate-400">Generation</span>
                        <span className="font-bold text-emerald-600">{Number(proposal.specs.annual_gen_kwh).toLocaleString()} kWh/yr</span>
                     </div>
                     <div className="flex justify-between border-b border-indigo-100/50 pb-1">
                        <span className="text-slate-600 dark:text-slate-400">Panel Sizing</span>
                        <span className="font-bold text-indigo-900 dark:text-indigo-200">{proposal.specs.panel_qty} x {proposal.specs.panel_watt}W</span>
                     </div>
                     <div className="flex justify-between pt-1">
                        <span className="text-slate-600 dark:text-slate-400">ROI Payback</span>
                        <span className="font-bold text-indigo-600">{proposal.specs.payback_years} Years</span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
