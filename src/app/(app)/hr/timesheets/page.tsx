"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Briefcase, Clock, User, CheckCircle2, 
  AlertCircle, Search, Filter, Loader2, ArrowRight,
  Target, BarChart3, Plus
} from "lucide-react";

export default function TimesheetsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    employee_id: '',
    project_id: '',
    project_task_id: '',
    date: new Date().toISOString().slice(0, 10),
    hours: '',
    description: ''
  });

  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, projRes] = await Promise.all([
          api.get('/hr/employees'),
          api.get('/projects')
        ]);
        setEmployees(empRes.data.data);
        setProjects(projRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (form.project_id) {
      api.get(`/projects/${form.project_id}`).then(res => {
        setTasks(res.data.tasks || []);
      });
    }
  }, [form.project_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/timesheet', form);
      alert("Time logged successfully!");
      setForm({ ...form, hours: '', description: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to log time.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Productivity Timesheets</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Log working hours against project tasks for cost analysis</p>
        </div>
        <div className="flex gap-4">
           <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
              <div className="p-2 bg-emerald-500 text-white rounded-lg"><Clock className="w-4 h-4"/></div>
              <div>
                 <div className="text-[9px] font-black text-emerald-600 uppercase">Today's Logs</div>
                 <div className="text-xl font-black text-emerald-900 font-mono">124.5h</div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Form Section */}
         <div className="lg:col-span-1">
            <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm space-y-6">
               <div className="flex items-center gap-3 border-b pb-4">
                  <div className="p-2 bg-slate-900 text-white rounded-xl"><Plus className="w-4 h-4"/></div>
                  <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">New Time Entry</h2>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Employee</label>
                     <select required value={form.employee_id} onChange={e=>setForm({...form, employee_id: e.target.value})}
                        className="w-full h-11 border-2 rounded-xl px-4 text-xs font-bold focus:border-blue-500 outline-none">
                        <option value="">— Select Personnel —</option>
                        {employees.map(e=>(<option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Project</label>
                     <select required value={form.project_id} onChange={e=>setForm({...form, project_id: e.target.value})}
                        className="w-full h-11 border-2 rounded-xl px-4 text-xs font-bold focus:border-blue-500 outline-none">
                        <option value="">— Select Project —</option>
                        {projects.map(p=>(<option key={p.id} value={p.id}>{p.name}</option>))}
                     </select>
                  </div>

                  {form.project_id && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Specific Task</label>
                       <select required value={form.project_task_id} onChange={e=>setForm({...form, project_task_id: e.target.value})}
                          className="w-full h-11 border-2 rounded-xl px-4 text-xs font-bold focus:border-emerald-500 outline-none">
                          <option value="">— Select Task —</option>
                          {tasks.map(t=>(<option key={t.id} value={t.id}>{t.title}</option>))}
                       </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date</label>
                        <input type="date" required value={form.date} onChange={e=>setForm({...form, date: e.target.value})}
                           className="w-full h-11 border-2 rounded-xl px-4 text-xs font-bold focus:border-blue-500 outline-none"/>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hours</label>
                        <input type="number" step="0.5" required placeholder="0.0" value={form.hours} onChange={e=>setForm({...form, hours: e.target.value})}
                           className="w-full h-11 border-2 rounded-xl px-4 font-mono font-bold focus:border-blue-500 outline-none"/>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Work Description</label>
                     <textarea rows={3} placeholder="Describe the work done..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})}
                        className="w-full border-2 rounded-xl p-3 text-xs font-medium focus:border-blue-500 outline-none resize-none"/>
                  </div>

                  <button type="submit" disabled={saving}
                     className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                     {saving ? 'Recording...' : 'Log Productivity'}
                  </button>
               </form>
            </div>
         </div>

         {/* Insights / List Section */}
         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white border p-6 rounded-[2rem] flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Target className="w-6 h-6"/></div>
                  <div>
                     <div className="text-[9px] font-black text-slate-400 uppercase">Efficiency Index</div>
                     <div className="text-2xl font-black text-slate-900">92.4%</div>
                  </div>
               </div>
               <div className="bg-white border p-6 rounded-[2rem] flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BarChart3 className="w-6 h-6"/></div>
                  <div>
                     <div className="text-[9px] font-black text-slate-400 uppercase">Billable Ratio</div>
                     <div className="text-2xl font-black text-slate-900">4.2:1</div>
                  </div>
               </div>
            </div>

            <div className="bg-white border rounded-[2rem] shadow-sm overflow-hidden min-h-[400px]">
               <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Recent Logs</h3>
                  <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">View All</button>
               </div>
               <div className="p-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200"><Clock className="w-8 h-8"/></div>
                  <p className="text-slate-400 text-sm font-medium italic">No recent logs found for the selected period.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
