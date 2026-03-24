"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProjectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    project_no: `PRJ-${new Date().getTime().toString().slice(-6)}`,
    client_id: "",
    type: "solar",
    status: "planning"
  });

  useEffect(() => {
    api.get("/clients").then(res => setClients(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/projects", formData);
      router.push("/projects");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to initialize project.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Initialize Project</h1>
        <p className="text-muted-foreground mt-1">Convert a won proposal or start a direct implementation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Project Tracker #</Label>
            <Input value={formData.project_no} readOnly className="bg-slate-50" />
          </div>
          
          <div className="space-y-2">
            <Label>Link Client</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.client_id}
              onChange={e => setFormData({...formData, client_id: e.target.value})}
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>{c.company_name || c.id}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. 50kW Industrial Rooftop - City Center" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Project Domain</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})} 
            >
              <option value="solar">Solar PV Plant</option>
              <option value="substation">Substation Design/Build</option>
              <option value="electrical">Industrial Electrical Works</option>
              <option value="amc">O&M / AMC Contract</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="button" variant="outline" className="mr-4" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={submitting || !formData.client_id}>
            {submitting ? 'Initializing...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
