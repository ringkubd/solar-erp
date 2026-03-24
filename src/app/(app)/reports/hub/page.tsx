"use client";

import { useState } from "react";
import { 
  BarChart3, FilePieChart, BookOpen, 
  ArrowRight, Download, Calendar, Filter
} from "lucide-react";
import Link from "next/link";

export default function ReportsHubPage() {
  const reports = [
    {
      title: "Trial Balance",
      description: "A snapshot of all debit and credit balances in the general ledger.",
      icon: BookOpen,
      href: "/reports/trial-balance",
      color: "bg-blue-500",
      accent: "text-blue-600"
    },
    {
      title: "Profit & Loss",
      description: "Summarizes revenues, costs, and expenses incurred during a specific period.",
      icon: BarChart3,
      href: "/reports/profit-loss",
      color: "bg-emerald-500",
      accent: "text-emerald-600"
    },
    {
      title: "General Ledger",
      description: "Detailed transaction history for individual accounts.",
      icon: FilePieChart,
      href: "/reports/ledger",
      color: "bg-purple-500",
      accent: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Financial Reports</h1>
        <p className="text-slate-500 mt-2 font-medium">Standardized financial statements and audit tools for ECOPAC ERP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reports.map((report, i) => (
          <Link key={i} href={report.href} className="group h-full">
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
               <div className={`p-4 ${report.color} text-white rounded-2xl w-fit shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                  <report.icon className="w-6 h-6" />
               </div>
               
               <h3 className="text-xl font-black text-slate-900 mb-2">{report.title}</h3>
               <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8 flex-1">
                 {report.description}
               </p>

               <div className={`flex items-center justify-between font-black uppercase text-[10px] tracking-widest ${report.accent}`}>
                  <span>View Statement</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </div>

               {/* Decorative background element */}
               <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-emerald-50 transition-colors -z-10" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white overflow-hidden relative shadow-2xl">
         <div className="max-w-2xl relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                   Audit Ready
                </div>
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight">Comprehensive Fiscal <br/>Year Analysis</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
               Generate consolidated reports for all operational units including Inventory consumption, Project WIP, and Revenue Recognition.
            </p>
            <div className="flex flex-wrap gap-4">
               <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2">
                  <Download className="w-5 h-5" /> Export All Statements
               </button>
               <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all active:scale-95 border border-slate-700">
                  Configure Periods
               </button>
            </div>
         </div>
         
         {/* Abstract design elements */}
         <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <BarChart3 className="w-96 h-96 -mr-20 -mb-20 text-emerald-500" />
         </div>
      </div>
    </div>
  );
}
