"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, BrainCircuit, TrendingUp, CheckCircle, Clock, FileText, Loader2, BarChart2, Mail, Download, LayoutGrid, List } from "lucide-react";

export default function ProposalsHub() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/analytics/proposals");
      setMetrics(res.data.metrics);
      setRecent(res.data.recent);
    } catch (e) {
      console.error("Failed to load analytics", e);
    } finally {
      setLoading(false);
    }
  };

  const predictProbability = async (id: number) => {
    setAnalyzingId(id);
    try {
      const res = await api.post(`/proposals/${id}/ai/probability`);
      setRecent(current => current.map(p => p.id === id ? { ...p, ai_prediction: res.data } : p));
    } catch (e) {
      alert("AI Prediction Failed. Is the local LLM running?");
    } finally {
      setAnalyzingId(null);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/proposals/${id}/status`, { status: newStatus });
      setRecent(current => current.map(p => p.id === id ? { ...p, status: newStatus } : p));
      fetchData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDownloadPdf = async (id: number) => {
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

  const handleSendEmail = (proposal: any) => {
    alert(`Sending Proposal ${proposal.proposal_no} via Email to ${proposal.client?.company_name || 'Client'}...`);
    // Mock simulation
    setTimeout(() => {
       updateStatus(proposal.id, 'sent');
       alert("Email Sent successfully!");
    }, 1000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Proposal Analytics Engine...</div>;

  // Group for Kanban
  const kanbanColumns = ['draft', 'sent', 'viewed', 'accepted'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deal Flow Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm">Convert leads into active engineering contracts. AI Win Predictor enabled.</p>
        </div>
        <Link href="/crm/proposals/new" className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 font-bold rounded-md flex items-center gap-2">
           <Plus className="w-4 h-4"/> New Smart Proposal
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-500 mb-2"><TrendingUp className="w-5 h-5"/> <h3 className="font-bold">Conversion Rate</h3></div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{metrics?.conversion_rate_pct}%</p>
          <p className="text-xs text-slate-500 mt-1">From {metrics?.sent_proposals} Sent Proposals</p>
        </div>
        <div className="border rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500 mb-2"><CheckCircle className="w-5 h-5"/> <h3 className="font-bold">Total Value Won</h3></div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">৳{(metrics?.won_value_bdt || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{metrics?.won_proposals} Accepted Contracts</p>
        </div>
        <div className="border rounded-xl bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 mb-2"><BarChart2 className="w-5 h-5"/> <h3 className="font-bold">Active Pipeline</h3></div>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-mono">৳{(metrics?.pipeline_value_bdt || 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Signatures / Drafts</p>
        </div>
      </div>

      {/* Recent Proposals Hub Header */}
      <div className="flex justify-between items-center pt-4">
         <h2 className="font-bold text-xl text-slate-800 dark:text-slate-200">Active Proposals Pipeline</h2>
         <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
            <button onClick={()=>setViewMode('list')} className={`p-2 rounded flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
               <List className="w-4 h-4"/> List
            </button>
            <button onClick={()=>setViewMode('kanban')} className={`p-2 rounded flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
               <LayoutGrid className="w-4 h-4"/> Kanban
            </button>
         </div>
      </div>

      {viewMode === 'list' ? (
      <div className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Proposal N°</th>
                <th className="px-4 py-3">Client / Title</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {recent.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 font-mono font-bold text-slate-600 dark:text-slate-300">
                     {proposal.proposal_no}
                  </td>
                  <td className="px-4 py-4">
                     <span className="block font-bold text-indigo-600 dark:text-indigo-400">{proposal.title}</span>
                     <span className="block text-xs text-slate-500">{proposal.client?.company_name || proposal.lead?.full_name}</span>
                     
                     {/* Render the AI insight neatly underneath the title if generated */}
                     {proposal.ai_prediction && (
                        <div className="mt-2 p-2 rounded bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                           <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                               <Sparkles className="w-3 h-3"/> Predict: {proposal.ai_prediction.probability_pct}% Win Rate
                           </div>
                           <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">"{proposal.ai_prediction.reasoning}"</p>
                        </div>
                     )}
                  </td>
                  <td className="px-4 py-4 font-mono font-bold">
                     ৳{parseFloat(proposal.total_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                     <select
                        value={proposal.status}
                        onChange={(e) => updateStatus(proposal.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider rounded border outline-none px-2 py-1 cursor-pointer w-24 ${
                           proposal.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                           proposal.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                           proposal.status === 'sent' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                           'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                     >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                     </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <Link href={`/crm/proposals/${proposal.id}`} className="p-2 border bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-md shadow-sm transition-colors" title="View Proposal Details">
                           <FileText className="w-4 h-4"/>
                        </Link>
                        <button onClick={() => handleDownloadPdf(proposal.id)} className="p-2 border bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 hover:text-red-500 rounded-md shadow-sm transition-colors" title="Download PDF">
                           <Download className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleSendEmail(proposal)} className="p-2 border bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-500 hover:text-blue-500 rounded-md shadow-sm transition-colors" title="Send Email to Client">
                           <Mail className="w-4 h-4"/>
                        </button>
                        <button 
                           onClick={() => predictProbability(proposal.id)}
                           disabled={analyzingId === proposal.id}
                           className="p-2 border bg-white dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-md shadow-sm transition-colors disabled:opacity-50"
                           title="AI Predict Win Probability"
                        >
                           {analyzingId === proposal.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                 <tr><td colSpan={6} className="text-center p-8 text-slate-500">No active proposals found in pipeline.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {kanbanColumns.map(status => (
            <div key={status} className="w-80 flex-shrink-0 flex flex-col pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold uppercase tracking-wider text-xs text-slate-500">{status}</h3>
                <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {recent.filter(p => p.status === status).length}
                </span>
              </div>
              <div className="flex flex-col gap-3 min-h-[500px] bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border">
                {recent.filter(p => p.status === status).map(proposal => (
                   <div key={proposal.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold text-slate-400 font-mono">{proposal.proposal_no}</span>
                         <span className="text-xs font-bold text-emerald-600">৳{parseFloat(proposal.total_amount).toLocaleString()}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-1">{proposal.title}</h4>
                      <p className="text-xs text-slate-500 mb-4">{proposal.client?.company_name || 'Individual Lead'}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <Link href={`/crm/proposals/${proposal.id}`} className="text-[10px] font-bold uppercase text-indigo-500 hover:text-indigo-600">View Details &rarr;</Link>
                        <div className="flex space-x-1">
                           <button onClick={() => handleDownloadPdf(proposal.id)} className="text-slate-400 hover:text-red-500"><Download className="w-4 h-4"/></button>
                           {status === 'draft' && <button onClick={() => handleSendEmail(proposal)} className="text-slate-400 hover:text-blue-500"><Mail className="w-4 h-4"/></button>}
                        </div>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Icon helper
function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a4.5 4.5 0 0 1 0-8.962L8.5 1.936A2 2 0 0 0 9.937.5l1.582-6.135a4.5 4.5 0 0 1 8.962 0L22.063.5A2 2 0 0 0 23.5 1.937l6.135 1.582a4.5 4.5 0 0 1 0 8.962l-6.135 1.582a2 2 0 0 0-1.437 1.437l-1.582 6.135a4.5 4.5 0 0 1-8.962 0z" />
    </svg>
  );
}
