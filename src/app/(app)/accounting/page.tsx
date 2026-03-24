"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import {
  Wallet, TrendingUp, ArrowDownRight, Users2, 
  ArrowRight, Plus, Receipt, History, BookOpen,
  Loader2, Landmark, Calculator
} from "lucide-react";

export default function AccountingDashboard() {
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-600"/>
      <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading Accounts...</p>
    </div>
  );

  const kpi = stats?.kpis || {};
  const trends = stats?.trends || { labels: [], revenue: [], expenses: [] };
  const recent = stats?.recent_journals || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Financial Hub</h1>
          <p className="text-slate-500 font-medium">Real-time overview of ECOPAC's double-entry accounting.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/accounting/journals/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95">
              <Plus className="w-4 h-4"/> New Journal
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Revenue (YTD)', value: kpi.total_revenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Net Profit',    value: kpi.net_profit,    icon: Calculator, color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Receivables',   value: kpi.total_receivable, icon: Users2, color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Cash & Bank',   value: kpi.cash_bank,     icon: Landmark, color: 'text-indigo-600',  bg: 'bg-indigo-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${item.bg} opacity-50 group-hover:scale-110 transition-transform`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                <item.icon className={`w-5 h-5 ${item.color}`}/>
              </div>
              <div className={`text-2xl font-black font-mono ${item.color}`}>
                ৳{Number(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Grid */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Ledger & Reports</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Journal Entries', desc: 'All transactions history', href: '/accounting/journals', icon: History, cls: 'border-slate-200 hover:border-emerald-500' },
              { label: 'General Ledger',  desc: 'Per-account detailed view', href: '/accounting/ledger', icon: BookOpen, cls: 'border-slate-200 hover:border-blue-500' },
              { label: 'Trial Balance',  desc: 'Verify Dr = Cr balance', href: '/accounting/trial-balance', icon: Calculator, cls: 'border-slate-200 hover:border-amber-500' },
              { label: 'Money Receipts', desc: 'Incoming collections', href: '/receipts', icon: Receipt, cls: 'border-slate-200 hover:border-indigo-500' },
            ].map(nav => (
              <Link key={nav.label} href={nav.href} className={`flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border-2 rounded-2xl transition-all group ${nav.cls}`}>
                <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                  <nav.icon className="w-5 h-5 text-slate-600"/>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800">{nav.label}</div>
                  <div className="text-xs text-slate-400 font-medium">{nav.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors mt-1"/>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Recent Journals</h2>
            <Link href="/accounting/journals" className="text-xs font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-black uppercase text-slate-500 border-b bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left">Date & Reference</th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No transactions found.</td></tr>
                ) : recent.map((j: any) => {
                  const total = j.entries?.filter((e:any)=>e.type==='debit').reduce((s:number, e:any)=>s+parseFloat(e.amount), 0) || 0;
                  return (
                    <tr key={j.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{j.date}</div>
                        <div className="font-mono text-[10px] text-emerald-600 font-black tracking-widest uppercase">{j.reference}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{j.description}</div>
                        <div className="flex gap-1 mt-1">
                          {j.entries?.map((e:any, idx:number) => (
                            <span key={idx} className="text-[8px] font-black bg-slate-100 px-1 border rounded text-slate-400 uppercase">
                              {e.account?.code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-mono font-black text-slate-900">৳{Number(total).toLocaleString()}</div>
                        <div className="text-[9px] font-bold text-slate-400 tracking-tighter uppercase whitespace-nowrap">{j.source.replace('_',' ')}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
