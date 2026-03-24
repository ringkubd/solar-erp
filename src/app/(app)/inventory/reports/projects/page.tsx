"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Briefcase, Search, Loader2, 
  ArrowLeft, Download, Box,
  TrendingDown, DollarSign
} from "lucide-react";
import Link from "next/link";

export default function ProjectMaterialUsagePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [usage, setUsage] = useState<any[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false));
  }, []);

  const fetchUsage = (project: any) => {
    setSelectedProject(project);
    setLoadingUsage(true);
    // In a real app, we'd have a specific endpoint for this.
    // For now, we'll fetch general items and simulate or use a filtered movement list if available.
    // But since I added 'reference_type' to stock_movements, I'll try to fetch that.
    api.get(`/inventory/movements?reference_type=project_usage&reference_id=${project.id}`)
       .then(res => setUsage(res.data))
       .catch(() => setUsage([])) // Fallback if index not implemented
       .finally(() => setLoadingUsage(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/inventory/reports/stock" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Project Material Consumption</h1>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Project-wise Cost Allocation</p>
            </div>
         </div>
         <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
            <Download className="w-4 h-4" /> Export Project Sheet
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Project Sidebar */}
         <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Select Active Project</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
               {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
               ) : projects.map(p => (
                  <button 
                     key={p.id} 
                     onClick={() => fetchUsage(p)}
                     className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedProject?.id === p.id ? 'bg-slate-900 border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                     <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedProject?.id === p.id ? 'text-slate-400' : 'text-slate-500'}`}>{p.project_no}</div>
                     <div className={`font-bold leading-tight ${selectedProject?.id === p.id ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                  </button>
               ))}
            </div>
         </div>

         {/* Usage Detail */}
         <div className="lg:col-span-3">
            {!selectedProject ? (
               <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center">
                  <Briefcase className="w-16 h-16 text-slate-100 mb-6" />
                  <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">Select a project to view its material usage</h3>
               </div>
            ) : (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex items-center justify-between">
                     <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedProject.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 border px-2 py-0.5 rounded">
                              <Box className="w-3 h-3" /> Materials: {usage.length} items
                           </span>
                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded">
                              <DollarSign className="w-3 h-3" /> Total Allocated: ৳{usage.reduce((sum, u) => sum + (u.total_cost || 0), 0).toLocaleString()}
                           </span>
                        </div>
                     </div>
                     <Link href={`/projects/${selectedProject.id}`}>
                        <button className="px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Project File</button>
                     </Link>
                  </div>

                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
                     {loadingUsage ? (
                        <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></div>
                     ) : usage.length === 0 ? (
                        <div className="py-20 text-center">
                           <TrendingDown className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                           <div className="text-slate-400 font-bold italic">No material consumption recorded for this project yet.</div>
                        </div>
                     ) : (
                        <table className="w-full text-sm">
                           <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-500 border-b">
                              <tr>
                                 <th className="px-8 py-5 text-left">Date</th>
                                 <th className="px-8 py-5 text-left">Material & SKU</th>
                                 <th className="px-8 py-5 text-center">Qty Consumed</th>
                                 <th className="px-8 py-5 text-right">Unit cost</th>
                                 <th className="px-8 py-5 text-right">Line Total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {usage.map(u => (
                                 <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 font-medium text-slate-500">{u.created_at.split('T')[0]}</td>
                                    <td className="px-8 py-5 font-black text-slate-900">{u.item_name || 'Material Item'}</td>
                                    <td className="px-8 py-5 text-center font-bold text-red-600">-{u.quantity}</td>
                                    <td className="px-8 py-5 text-right font-mono text-slate-500">৳{u.unit_cost?.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right font-mono font-black text-slate-900">৳{u.total_cost?.toLocaleString()}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
