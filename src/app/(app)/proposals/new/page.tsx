"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewProposalPage() {
  const router = useRouter();
  const [loadingAi, setLoadingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leads, setLeads] = useState([]);
  
  // AI Wizard Inputs
  const [aiInputs, setAiInputs] = useState({
    load_kw: "",
    budget_bdt: "",
    type: "solar_rooftop"
  });

  // Final Proposal Data
  const [proposalData, setProposalData] = useState({
    title: "",
    proposal_no: `PRP-${new Date().getTime().toString().slice(-6)}`,
    lead_id: "",
    template_type: "solar_rooftop",
    valid_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    subtotal: 0,
    total_amount: 0,
    ai_generated: false,
    notes: ""
  });

  useEffect(() => {
    api.get("/leads").then(res => setLeads(res.data)).catch(console.error);
  }, []);

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    try {
      const res = await api.post("/ai/proposal-generate", aiInputs);
      const data = res.data;
      
      setProposalData(prev => ({
        ...prev,
        title: `${data.system_size_kw}kW Solar System Proposal`,
        subtotal: data.total_cost,
        total_amount: data.total_cost,
        ai_generated: true,
        template_type: aiInputs.type,
        notes: `AI Generated Specs:\nPanel: ${data.panel_qty} x ${data.panel_watt}W\nInverter: ${data.inverter_kw}kW\nROI: ${data.roi_pct}%\nPayback: ${data.payback_years} years.\n${data.note || ''}`
      }));
    } catch (err) {
      console.error(err);
      alert("AI Generation failed. Check if Ollama is running or use manual entry.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/proposals", proposalData);
      router.push("/proposals");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate AI Proposal</h1>
        <p className="text-muted-foreground mt-1">Use our local LLM to generate optimal system specs and pricing instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* AI Wizard Sidebar */}
        <div className="col-span-1 md:col-span-4 space-y-4 border rounded-xl p-4 bg-slate-50 dark:bg-slate-900 shadow-inner">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Requirements Input</h3>
          
          <div className="space-y-2">
            <Label>Client Load (kW)</Label>
            <Input 
              type="number" 
              value={aiInputs.load_kw} 
              onChange={e => setAiInputs({...aiInputs, load_kw: e.target.value})} 
              placeholder="e.g. 50"
            />
          </div>
          <div className="space-y-2">
            <Label>Budget (BDT)</Label>
            <Input 
              type="number" 
              value={aiInputs.budget_bdt} 
              onChange={e => setAiInputs({...aiInputs, budget_bdt: e.target.value})} 
              placeholder="e.g. 4500000"
            />
          </div>
          <div className="space-y-2">
            <Label>System Type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={aiInputs.type}
              onChange={e => setAiInputs({...aiInputs, type: e.target.value})} 
            >
              <option value="solar_rooftop">Solar Rooftop</option>
              <option value="industrial_solar">Industrial Solar</option>
            </select>
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleGenerateAI} 
            disabled={loadingAi || !aiInputs.load_kw || !aiInputs.budget_bdt}
          >
            {loadingAi ? '🧠 Generating Specs...' : 'Auto-Generate Specs'}
          </Button>
        </div>

        {/* Final Proposal Form */}
        <div className="col-span-1 md:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white shadow-sm">
            <h3 className="font-bold text-lg border-b pb-2">Proposal Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proposal No</Label>
                <Input value={proposalData.proposal_no} readOnly className="bg-slate-50" />
              </div>
              
              <div className="space-y-2">
                <Label>Select Target Lead</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={proposalData.lead_id}
                  onChange={e => setProposalData({...proposalData, lead_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leads.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name} - {l.company_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={proposalData.valid_until} onChange={e => setProposalData({...proposalData, valid_until: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Proposal Title</Label>
                <Input value={proposalData.title} onChange={e => setProposalData({...proposalData, title: e.target.value})} placeholder="Auto-filled via AI or manual entry" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Amount (BDT)</Label>
                <Input type="number" step="0.01" value={proposalData.total_amount} onChange={e => setProposalData({...proposalData, total_amount: parseFloat(e.target.value) || 0})} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>AI Generated Specifications & Notes</Label>
              <Textarea 
                value={proposalData.notes} 
                onChange={e => setProposalData({...proposalData, notes: e.target.value})}
                className="min-h-[150px]"
                placeholder="AI will generate required panels, inverters, ROI calculation and project specifications here..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting || !proposalData.title || !proposalData.lead_id}>
                {submitting ? 'Saving...' : 'Save Proposal'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
