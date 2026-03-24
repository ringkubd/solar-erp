"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  TrendingUp, Users2, Briefcase, FileText, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, 
  Clock, Landmark, Plus, ArrowRight, Loader2,
  BarChart3, LayoutDashboard, Target
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats").then(res => {
      setData(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600"/>
      <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Waking up the system...</p>
    </div>
  );

  const stats = data?.counts || {};
  const funnel = data?.funnel || {};
  const projects = data?.projects || [];
  const recentFinance = data?.recent_finance || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Command Center</h1>
          <p className="text-slate-500 font-medium">Welcome back! Here is what's happening across ECOPAC today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/crm/leads/new">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold bg-white hover:bg-slate-50 transition-all shadow-sm">
              <Plus className="w-4 h-4"/> New Lead
            </button>
          </Link>
          <Link href="/accounting/journals/new">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
              <Target className="w-4 h-4"/> Record Entry
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: stats.total_revenue, sub: 'All Collections', icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50', isMoney: true },
          { label: 'Active Projects', value: stats.active_projects, sub: 'In Progress', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New Leads', value: stats.new_leads, sub: 'Awaiting Follow-up', icon: Users2, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Proposals', value: stats.pending_proposals, sub: 'Active Quotes', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full ${item.bg} opacity-40 group-hover:scale-110 transition-transform`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                <item.icon className={`w-5 h-5 ${item.color}`}/>
              </div>
              <div className={`text-2xl font-black font-mono ${item.color}`}>
                {item.isMoney ? '৳' : ''}{Number(item.value || 0).toLocaleString()}
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Tracking */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-blue-500"/> Active Project Hub
            </h2>
            <Link href="/projects" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {projects.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed rounded-2xl p-10 text-center text-slate-400">
                <p className="font-bold">No active projects</p>
                <p className="text-xs">Start a project to see its progress here.</p>
              </div>
            ) : projects.map((p: any) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:border-blue-500 transition-all flex items-center justify-between gap-4 group">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">{p.title}</div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-black font-mono text-slate-500">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black uppercase text-slate-400">STATUS</div>
                    <div className={`text-xs font-bold ${p.status === 'active' ? 'text-emerald-600' : 'text-blue-500'}`}>{p.status.toUpperCase()}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="space-y-6">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500"/> Lead Funnel
          </h2>
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm space-y-4">
            {[
              { label: 'New Inquiries', val: funnel.new, color: 'bg-slate-100', text: 'text-slate-600' },
              { label: 'Contacted', val: funnel.contacted, color: 'bg-blue-100', text: 'text-blue-600' },
              { label: 'Proposals Sent', val: funnel.proposal, color: 'bg-purple-100', text: 'text-purple-600' },
              { label: 'Closed Won', val: funnel.won, color: 'bg-emerald-100', text: 'text-emerald-600' },
            ].map(f => (
              <div key={f.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full ${f.color}`}></div>
                  <div className="text-sm font-bold text-slate-700">{f.label}</div>
                </div>
                <div className={`text-xl font-black font-mono ${f.text}`}>{f.val}</div>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-dashed">
              <Link href="/crm/leads">
                <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-lg transition-colors">
                  Go to CRM Pipeline
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Pulse */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500"/> Financial Pulse
            </h2>
            <Link href="/accounting" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              Accounting Hub <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
             <div className="space-y-4">
                {recentFinance.slice(0, 3).map((j: any) => (
                  <div key={j.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${j.source === 'money_receipt' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Landmark className="w-4 h-4"/>
                       </div>
                       <div>
                          <div className="text-xs font-bold text-slate-800">{j.description}</div>
                          <div className="text-[9px] font-mono text-slate-400">{j.reference}</div>
                       </div>
                    </div>
                    <div className="text-sm font-black text-slate-700">৳{Number(j.entries[0]?.amount || 0).toLocaleString()}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* System Health / AI Insight placeholder */}
        <div className="space-y-6">
           <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-purple-500"/> System Intelligence
           </h2>
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-white opacity-10 rounded-full"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <div className="flex items-center gap-2 mb-4">
                       <Target className="w-6 h-6 text-indigo-200"/>
                       <span className="text-xs font-black uppercase tracking-widest text-indigo-100 opacity-80">System Insight</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed">
                       Overall project efficiency is up <strong>14%</strong>. However, there are <strong>3 leads</strong> that haven't been touched in over 4 days.
                    </p>
                 </div>
                 <div className="mt-8">
                    <button className="px-4 py-2 bg-white text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-lg hover:shadow-lg transition-all active:scale-95">
                       Action Recommendations
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
