"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Save, Sparkles, Languages, Calculator } from "lucide-react";

export default function GlobalProposalBuilder() {
  const router = useRouter();
  
  // State
  const [loadKw, setLoadKw] = useState("50");
  const [panelWatt, setPanelWatt] = useState("550");
  const [specs, setSpecs] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  
  // Translation State
  const [execSummaryEn, setExecSummaryEn] = useState("This proposal outlines a grid-tied rooftop solar system aiming to reduce grid dependency and maximize Return on Investment for the client.");
  const [execSummaryBn, setExecSummaryBn] = useState("");
  const [translating, setTranslating] = useState(false);

  const calculateSystem = async () => {
    setCalculating(true);
    try {
      const res = await api.post("/proposals/calculate", {
        load_kw: parseFloat(loadKw),
        panel_watt: parseFloat(panelWatt)
      });
      setSpecs(res.data);
    } catch (e) {
      alert("Failed to run engineering calculations.");
    } finally {
      setCalculating(false);
    }
  };

  const translateSummary = async () => {
    setTranslating(true);
    try {
      const res = await api.post("/ai/translate", {
        text: execSummaryEn,
        target_language: "bn"
      });
      setExecSummaryBn(res.data.translation || "");
    } catch (e) {
      alert("AI translation failed.");
    } finally {
      setTranslating(false);
    }
  };

  const saveProposal = async () => {
     // In a real flow, this would submit the payload including specs and sections.
     alert("Dynamic Proposal generated and saved! Next step is the PDF compiler.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/crm/leads" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Proposal Builder</h1>
            <p className="text-muted-foreground mt-1 text-sm">Design systems, translate text with AI, and issue professional quotes.</p>
          </div>
        </div>
        <button onClick={saveProposal} className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 font-bold rounded-md flex items-center gap-2">
           <Save className="w-4 h-4"/> Draft Proposal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

         {/* Calculator Module */}
         <div className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-indigo-600"><Calculator className="w-5 h-5"/> Engineering Sizing Engine</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Target Load (kW)</label>
                  <input type="number" value={loadKw} onChange={e=>setLoadKw(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Panel Rating (W)</label>
                  <input type="number" value={panelWatt} onChange={e=>setPanelWatt(e.target.value)} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
            </div>
            <button onClick={calculateSystem} disabled={calculating} className="w-full py-2 bg-indigo-50 text-indigo-700 font-bold tracking-wide rounded border border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-2">
                {calculating ? 'Running Engineering Array Sizing...' : 'Calculate Optimal System System'}
            </button>

            {specs && (
               <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border space-y-3 font-mono text-sm leading-relaxed">
                  <div className="flex justify-between border-b border-dashed pb-1"><span>System Size:</span> <span className="font-bold text-indigo-600">{specs.system_size_kw} kW</span></div>
                  <div className="flex justify-between border-b border-dashed pb-1"><span>Required Panels:</span> <span className="font-bold">{specs.panel_qty} units ({specs.panel_watt}W)</span></div>
                  <div className="flex justify-between border-b border-dashed pb-1"><span>Annual Yield:</span> <span className="font-bold text-emerald-600">{specs.annual_gen_kwh.toLocaleString()} kWh</span></div>
                  <div className="flex justify-between border-b border-dashed pb-1"><span>Est. Est. Initial Cost:</span> <span className="font-bold text-red-500 font-mono">৳ {specs.estimated_cost_bdt.toLocaleString()}</span></div>
                  <div className="flex justify-between border-b border-dashed pb-1"><span>Monthly Savings:</span> <span className="font-bold text-emerald-500 font-mono">৳ {specs.monthly_savings_bdt.toLocaleString()}</span></div>
                  <div className="flex justify-between pb-1"><span>ROI Payback:</span> <span className="font-bold text-indigo-500">{specs.payback_years} Years</span></div>
               </div>
            )}
         </div>

         {/* AI Translator Module */}
         <div className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col h-full">
            <h2 className="font-bold text-lg flex items-center gap-2 text-emerald-600 mb-4"><Languages className="w-5 h-5"/> AI Corporate Translation</h2>
            
            <div className="space-y-4 flex-1">
               <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Executive Summary (English)</label>
                  <textarea value={execSummaryEn} onChange={e=>setExecSummaryEn(e.target.value)} className="w-full h-24 rounded-md border text-sm p-3 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed resize-none"></textarea>
               </div>
               
               <div className="flex justify-center">
                   <button onClick={translateSummary} disabled={translating} className="py-1 px-4 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3"/> {translating ? 'Llama3 Translating...' : 'AI Translate to Bengali'}
                   </button>
               </div>

               <div>
                  <label className="text-xs uppercase font-bold text-slate-500 block mb-2">Executive Summary (Bengali - Auto)</label>
                  <textarea value={execSummaryBn} onChange={e=>setExecSummaryBn(e.target.value)} placeholder="AI Translation will appear here..." className="w-full h-24 rounded-md border text-sm p-3 font-bengali leading-relaxed bg-slate-50 dark:bg-slate-800/50 resize-none"></textarea>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
