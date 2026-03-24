"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Phone, Building2, TrendingUp, Calendar, Zap } from "lucide-react";

interface Lead {
  id: number;
  full_name: string;
  company_name: string | null;
  phone: string;
  stage: string;
  project_type: string;
  lead_score: number;
  expected_close: string | null;
  created_at: string;
}

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20' },
  { id: 'contacted', label: 'Contacted', color: 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20' },
  { id: 'survey', label: 'Pre-Survey', color: 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20' },
  { id: 'proposal_sent', label: 'Proposal', color: 'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-pink-500/50 bg-pink-50/50 dark:bg-pink-950/20' },
  { id: 'won', label: 'Closed Won', color: 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20' },
  { id: 'lost', label: 'Closed Lost', color: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20' },
];

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = () => {
    api.get("/leads/data/pipeline").then((res) => {
      setPipeline(res.data);
    }).finally(() => setLoading(false));
  };

  const handleDragStart = (e: React.DragEvent, leadId: number, sourceStage: string) => {
    e.dataTransfer.setData("leadId", leadId.toString());
    e.dataTransfer.setData("sourceStage", sourceStage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData("leadId"));
    const sourceStage = e.dataTransfer.getData("sourceStage");

    if (sourceStage === targetStage) return;

    // Optimistic UI Update
    const leadToMove = pipeline[sourceStage]?.find((l) => l.id === leadId);
    if (!leadToMove) return;

    setPipeline(prev => {
        const newPipeline = { ...prev };
        newPipeline[sourceStage] = newPipeline[sourceStage].filter(l => l.id !== leadId);
        if (!newPipeline[targetStage]) newPipeline[targetStage] = [];
        newPipeline[targetStage] = [{...leadToMove, stage: targetStage}, ...newPipeline[targetStage]];
        return newPipeline;
    });

    try {
        await api.patch(`/leads/${leadId}/stage`, { stage: targetStage });
    } catch (err) {
        // Revert on failure
        fetchPipeline();
        alert("Failed to update lead stage.");
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">Drag and drop leads to progress through the sales cycle.</p>
        </div>
        <Link href="/crm/leads/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold"><Plus className="w-4 h-4 mr-2"/> New Lead</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-emerald-500 font-bold animate-pulse">Loading Pipeline...</div>
      ) : (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max items-start">
            
            {STAGES.map((stage) => {
              const columnLeads = pipeline[stage.id] || [];
              
              return (
                <div 
                  key={stage.id} 
                  className={`w-80 h-full max-h-full flex flex-col rounded-xl border border-dashed ${stage.color} overflow-hidden`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-inherit bg-white/50 dark:bg-black/20 flex items-center justify-between shadow-sm shrink-0">
                    <h3 className="font-bold text-sm tracking-wide uppercase">{stage.label}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-inherit bg-white dark:bg-slate-900">{columnLeads.length}</span>
                  </div>
                  
                  {/* Column Body / Cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                     {columnLeads.map((lead) => (
                        <div 
                          key={lead.id} 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, lead.id, stage.id)}
                          className="group bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm hover:shadow-md hover:border-emerald-500/50 cursor-grab active:cursor-grabbing transition-all relative"
                        >
                           {/* Drag handle hint */}
                           <div className="absolute top-3 right-2 opacity-0 group-hover:opacity-30 transition-opacity"><GripVertical className="w-4 h-4"/></div>
                           
                           {/* Priority / Score */}
                           <div className="flex items-center gap-2 mb-2">
                              {lead.lead_score > 20 && <div className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3"/> Hot</div>}
                              <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border">ID-{lead.id}</div>
                           </div>
                           
                           <Link href={`/crm/leads/${lead.id}`} className="block mb-3">
                             <div className="font-bold text-sm text-emerald-950 dark:text-emerald-50 hover:text-emerald-600 truncate">{lead.full_name}</div>
                             {lead.company_name && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                   <Building2 className="w-3 h-3 shrink-0" /> {lead.company_name}
                                </div>
                             )}
                           </Link>

                           <div className="flex items-center gap-3 pt-3 border-t text-xs text-slate-500 dark:text-slate-400">
                              <span className="capitalize font-medium flex items-center gap-1 truncate"><TrendingUp className="w-3 h-3 shrink-0"/> {lead.project_type}</span>
                           </div>
                        </div>
                     ))}
                     {columnLeads.length === 0 && (
                        <div className="h-full min-h-[100px] flex items-center justify-center text-xs text-muted-foreground italic border-2 border-dashed border-transparent rounded-lg">
                           Drop leads here
                        </div>
                     )}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}
