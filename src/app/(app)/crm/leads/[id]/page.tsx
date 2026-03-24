"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Building2, Phone, Mail, Calendar, User, TrendingUp, Zap, MessageSquare, PhoneCall, ListTodo, Plus, Sparkles, Bot } from "lucide-react";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityNote, setActivityNote] = useState("");
  const [activityType, setActivityType] = useState("note");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState("");

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = () => {
    api.get(`/leads/${params.id}`).then((res) => {
      setLead(res.data);
    }).finally(() => setLoading(false));
  };

  const updateStage = async (newStage: string) => {
    await api.patch(`/leads/${params.id}/stage`, { stage: newStage });
    fetchLead(); // refresh timeline
  };

  const addActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityNote.trim() && activityType !== 'call') return;
    
    await api.post(`/leads/${params.id}/activities`, {
       type: activityType,
       note: activityNote,
       completed_at: new Date().toISOString()
    });
    setActivityNote("");
    fetchLead();
  };

  const generateFollowUp = async () => {
    setAiLoading(true);
    setActivityType('email');
    try {
      const res = await api.post(`/leads/${params.id}/ai/followup`);
      setActivityNote(res.data.suggestion);
    } catch (e) {
      alert("Failed to generate AI email.");
    } finally {
      setAiLoading(false);
    }
  };

  const getNextAction = async () => {
    setAiLoading(true);
    try {
      const res = await api.post(`/leads/${params.id}/ai/action`);
      setAiAction(res.data.action);
    } catch (e) {
      alert("Failed to get AI suggestion.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-emerald-500 font-bold tracking-widest">LOADING LEAD...</div>;
  if (!lead) return <div className="p-8 text-red-500">Lead not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/crm/leads" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold tracking-tight">{lead.full_name}</h1>
             <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border text-xs font-bold uppercase tracking-wider text-slate-500">{lead.stage}</span>
             {lead.lead_score > 0 && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1"><Zap className="w-3 h-3"/> Score: {lead.lead_score}</span>}
          </div>
          {lead.company_name && <p className="text-muted-foreground mt-1 flex items-center gap-1.5"><Building2 className="w-4 h-4"/> {lead.company_name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b">
                 <h3 className="font-semibold text-sm uppercase tracking-wide text-slate-500">Lead Details</h3>
              </div>
              <div className="p-4 space-y-4 text-sm">
                 <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div><div className="text-slate-500 text-xs uppercase mb-0.5">Phone</div><div className="font-medium">{lead.phone}</div></div>
                 </div>
                 {lead.email && <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div><div className="text-slate-500 text-xs uppercase mb-0.5">Email</div><div className="font-medium">{lead.email}</div></div>
                 </div>}
                 <div className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div><div className="text-slate-500 text-xs uppercase mb-0.5">Requirement</div><div className="font-medium capitalize">{lead.project_type}</div></div>
                 </div>
                 <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div><div className="text-slate-500 text-xs uppercase mb-0.5">Assigned To</div><div className="font-medium">{lead.assigned_user?.name || 'Unassigned'}</div></div>
                 </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t">
                 <label className="text-xs uppercase tracking-widest font-bold text-slate-500 block mb-2">Change Stage</label>
                 <select value={lead.stage} onChange={(e) => updateStage(e.target.value)} className="w-full bg-white dark:bg-slate-900 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="survey">Survey</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Closed Won</option>
                    <option value="lost">Closed Lost</option>
                 </select>
              </div>
           </div>

           {lead.notes && (
               <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 shadow-sm">
                   <h3 className="font-bold text-sm text-amber-800 dark:text-amber-500 mb-2 uppercase tracking-wide">Initial Notes / AI Specs</h3>
                   <div className="text-sm text-amber-900 dark:text-amber-200/80 whitespace-pre-wrap font-mono">
                      {lead.notes}
                   </div>
               </div>
           )}
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Action Suggestions AI */}
           <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-sm">
               <div>
                   <h3 className="font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-1"><Sparkles className="w-4 h-4"/> Copilot: Next Best Action</h3>
                   <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{aiAction || "Analyze timeline to predict the optimal next sales step."}</p>
               </div>
               <button onClick={getNextAction} disabled={aiLoading} className="bg-white dark:bg-slate-900 border shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors whitespace-nowrap">
                   {aiLoading && !activityNote ? "Thinking..." : "Analyze"}
               </button>
           </div>

           {/* Activity Composer */}
           <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
              <div className="flex border-b">
                 <button onClick={() => setActivityType('note')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activityType === 'note' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-500 hover:bg-slate-50'}`}><MessageSquare className="w-4 h-4"/> Log Note</button>
                 <button onClick={() => setActivityType('call')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activityType === 'call' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-500 hover:bg-slate-50'}`}><PhoneCall className="w-4 h-4"/> Log Call</button>
                 <button onClick={() => setActivityType('email')} className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${activityType === 'email' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20' : 'text-slate-500 hover:bg-slate-50'}`}><Mail className="w-4 h-4"/> Send Email</button>
              </div>
              <form onSubmit={addActivity} className="p-4">
                 <textarea 
                    value={activityNote}
                    onChange={(e) => setActivityNote(e.target.value)}
                    placeholder={activityType === 'note' ? "Write a note about this lead..." : activityType === 'email' ? "Draft email here..." : "Call summary..."}
                    className="w-full min-h-[120px] bg-transparent border-0 focus:ring-0 resize-y text-sm outline-none font-medium"
                    required
                 />
                 <div className="flex justify-between items-center pt-3 border-t">
                    <button type="button" onClick={generateFollowUp} disabled={aiLoading} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5">
                       <Bot className="w-3.5 h-3.5"/> {aiLoading && activityType === 'email' ? 'Drafting...' : 'Autodraft Follow-Up'}
                    </button>
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                       <Plus className="w-4 h-4"/> Save Activity
                    </button>
                 </div>
              </form>
           </div>

           {/* Timeline History */}
           <div>
              <h3 className="font-bold tracking-tight text-lg mb-4 flex items-center gap-2"><ListTodo className="w-5 h-5 text-emerald-500"/> Activity History</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                 {lead.activities?.map((activity: any) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       {/* Timeline Dot */}
                       <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-black bg-slate-100 dark:bg-slate-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          {activity.type === 'stage_change' ? <TrendingUp className="w-4 h-4 text-blue-500" /> : 
                           activity.type === 'call' ? <PhoneCall className="w-4 h-4 text-orange-500" /> : 
                           <MessageSquare className="w-4 h-4 text-emerald-500" />}
                       </div>
                       
                       {/* Timeline Content */}
                       <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 border p-4 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                             <span className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize">{activity.type.replace('_', ' ')}</span>
                             <time className="text-xs text-slate-500 font-mono">{new Date(activity.created_at).toLocaleString()}</time>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-300">
                             {activity.note}
                          </div>
                       </div>
                    </div>
                 ))}
                 {(!lead.activities || lead.activities.length === 0) && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-xl">No activities recorded yet.</div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
