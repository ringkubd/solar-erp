"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, Search, Filter, Loader2, ArrowRight } from "lucide-react";

export default function JournalsPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/journals').then(res => setJournals(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All automated and manual accounting transactions.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/accounting/ledger">
            <button className="px-4 py-2 bg-white border text-slate-700 text-sm font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all">
              View Ledger
            </button>
          </Link>
          <Link href="/accounting/journals/new">
            <button className="flex items-center gap-2 px-4 py-2 flex-shrink-0 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">
              <Plus className="w-4 h-4"/> Manual Entry
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Reference (Source)</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3 text-right">Debit (Total)</th>
              <th className="px-4 py-3 text-right">Credit (Total)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center p-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500"/></td></tr>
            ) : journals.map((j: any) => {
              const debitAmount = j.entries?.filter((e:any)=>e.type==='debit').reduce((sum:number,e:any)=>sum+parseFloat(e.amount),0) || 0;
              const creditAmount = j.entries?.filter((e:any)=>e.type==='credit').reduce((sum:number,e:any)=>sum+parseFloat(e.amount),0) || 0;
              return (
                <tr key={j.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-600">{j.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-emerald-700 font-bold">{j.reference}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{j.source.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{j.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {j.entries?.map((e:any, i:number) => (
                        <div key={i} className={`text-xs font-mono flex items-center gap-1 ${e.type==='debit' ? 'text-blue-600' : 'text-amber-600 pl-4'}`}>
                          {e.type==='debit' ? 'DR' : 'CR'} {e.account?.code} <ArrowRight className="w-3 h-3 opacity-30"/> {Number(e.amount).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-600">{debitAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-600">{creditAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
