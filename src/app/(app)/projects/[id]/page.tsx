"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, LayoutDashboard, GanttChartSquare, Box,
  FileText, DollarSign, Plus, CheckCircle2, Circle, AlertTriangle,
  BrainCircuit, Loader2, List, LayoutGrid, ChevronDown, ChevronRight,
  X, Upload, Trash2, Edit3
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-slate-100 text-slate-700 border-slate-200',
  running:     'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  done:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  delayed:     'bg-red-100 text-red-700 border-red-200',
  low:         'bg-slate-100 text-slate-600 border-slate-200',
  medium:      'bg-amber-100 text-amber-700 border-amber-200',
  high:        'bg-red-100 text-red-700 border-red-200',
};

const EMPTY_PHASE = { name: '', start_date: '', end_date: '', status: 'pending' };
const EMPTY_TASK  = { title: '', status: 'pending', priority: 'medium', phase_id: '', start_date: '', due_date: '', estimated_hours: '', assigned_to: '' };
const EMPTY_MATERIAL = { item_name: '', quantity_required: '' };
const EMPTY_DOC = { title: '', document_type: 'drawing', file_url: '' };

// Inline modal wrapper
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{label}</label>
      {children}
      {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const INPUT = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow";
const SELECT = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow";

export default function EPCProjectHub() {
  const { id } = useParams();
  const [project, setProject]         = useState<any>(null);
  const [costs, setCosts]             = useState<any>(null);
  const [ganttTasks, setGanttTasks]   = useState<any[]>([]);
  const [materials, setMaterials]     = useState<any[]>([]);
  const [documents, setDocuments]     = useState<any[]>([]);
  const [activeTab, setActiveTab]     = useState("overview");
  const [loading, setLoading]         = useState(true);
  const [aiDiag, setAiDiag]           = useState<any>(null);
  const [analyzing, setAnalyzing]     = useState(false);
  const [expanded, setExpanded]       = useState<Record<number, boolean>>({});
  const [taskView, setTaskView]       = useState<'wbs' | 'kanban'>('wbs');

  // Modals
  const [showPhaseModal, setShowPhaseModal]     = useState(false);
  const [showTaskModal, setShowTaskModal]       = useState(false);
  const [showDocModal, setShowDocModal]         = useState(false);
  const [showMatModal, setShowMatModal]         = useState(false);

  // Forms
  const [phaseForm, setPhaseForm]   = useState(EMPTY_PHASE);
  const [taskForm, setTaskForm]     = useState({ ...EMPTY_TASK });
  const [docForm, setDocForm]       = useState(EMPTY_DOC);
  const [matForm, setMatForm]       = useState(EMPTY_MATERIAL);
  const [costForm, setCostForm]     = useState({ type: 'labor', description: '', estimated_amount: '', actual_amount: '' });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);

  // Saving flags
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [projRes, ganttRes, matRes, costRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/gantt`),
        api.get(`/projects/${id}/materials`),
        api.get(`/projects/${id}/costs`),
      ]);
      setProject(projRes.data);
      setGanttTasks(ganttRes.data);
      setMaterials(matRes.data);
      setCosts(costRes.data);
      setDocuments(projRes.data.documents || []);
    } catch (err) { console.error(err); }
    finally { if (!silent) setLoading(false); }
  };

  const clearModals = () => {
    setShowPhaseModal(false); setShowTaskModal(false); 
    setShowDocModal(false); setShowMatModal(false);
    setErrors({}); setEditingId(null);
  };

  const runAIDiagnostics = async () => {
    setAnalyzing(true);
    try {
      const res = await api.get(`/projects/${id}/ai/diagnostics`);
      setAiDiag(res.data);
    } catch { alert("AI unavailable. Is Ollama running?"); }
    finally { setAnalyzing(false); }
  };

  const printReport = () => {
    window.print();
  };

  const markProjectComplete = async () => {
    if (!confirm("Scale up this project to 'Completed' state?")) return;
    await api.patch(`/projects/${id}`, { status: 'completed', progress: 100 });
    fetchAll();
  };

  const handleApiError = (err: any) => {
    if (err.response?.status === 422) {
      const apiErrors = err.response.data.errors;
      const formatted: Record<string, string> = {};
      Object.keys(apiErrors).forEach(key => {
        formatted[key] = apiErrors[key][0];
      });
      setErrors(formatted);
    } else {
      alert("Something went wrong. Please check your connection or project details.");
    }
  };


  // ---- PHASE ----
  const addPhase = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrors({});
    
    if (phaseForm.end_date < phaseForm.start_date) {
      setErrors({ end_date: "End date cannot be before start date" });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/projects/${id}/phases/${editingId}`, phaseForm);
      } else {
        await api.post(`/projects/${id}/phases`, phaseForm);
      }
      setPhaseForm(EMPTY_PHASE); 
      clearModals();
      fetchAll(true);
    } catch (err) { handleApiError(err); } 
    finally { setSaving(false); }
  };

  const deletePhase = async (phaseId: number) => {
    if (!confirm("Are you sure? This will delete all tasks in this phase too.")) return;
    await api.delete(`/projects/${id}/phases/${phaseId}`);
    fetchAll(true);
  };

  // ---- TASK ----
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrors({});

    if (taskForm.due_date && taskForm.start_date && taskForm.due_date < taskForm.start_date) {
      setErrors({ due_date: "Due date cannot be before start date" });
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/projects/${id}/tasks/${editingId}`, taskForm);
      } else {
        await api.post(`/projects/${id}/tasks`, taskForm);
      }
      setTaskForm({ ...EMPTY_TASK }); 
      clearModals();
      fetchAll(true);
    } catch (err) { handleApiError(err); } 
    finally { setSaving(false); }
  };

  const deleteOneTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/projects/${id}/tasks/${taskId}`);
    fetchAll(true);
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}`, { status });
      fetchAll(true);
    } catch { alert("Failed to update status"); }
  };

  const updateTaskProgress = async (taskId: number, pct: number) => {
    try {
      await api.patch(`/tasks/${taskId}/progress`, { progress_pct: pct });
      fetchAll(true);
    } catch { console.error("Progress update failed"); }
  };

  // ---- MATERIAL ----
  const addMaterial = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrors({});
    if (parseFloat(matForm.quantity_required) <= 0) {
      setErrors({ quantity_required: "Quantity must be greater than zero" });
      return;
    }

    setSaving(true);
    try {
      await api.post(`/projects/${id}/materials`, matForm);
      setMatForm(EMPTY_MATERIAL); 
      clearModals();
      fetchAll(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const updateMatStatus = async (matId: number, status: string) => {
    try {
      await api.patch(`/projects/${id}/materials/${matId}`, { status });
      fetchAll(true);
    } catch { alert("Failed to update material status"); }
  };

  const deleteMaterial = async (matId: number) => {
    if (!confirm("Remove this item from BOM?")) return;
    await api.delete(`/projects/${id}/materials/${matId}`);
    fetchAll(true);
  };

  // ---- DOCUMENT ----
  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrors({});
    
    // Simple URL validation
    if (!docForm.file_url.startsWith('http')) {
      setErrors({ file_url: "Please enter a valid URL starting with http/https" });
      return;
    }

    setSaving(true);
    try {
      await api.post(`/projects/${id}/documents`, docForm);
      setDocForm(EMPTY_DOC); 
      clearModals();
      fetchAll(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  // ---- COST ----
  const logCost = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrors({});
    setSaving(true);
    try {
      await api.post(`/projects/${id}/costs`, costForm);
      setCostForm({ type: 'labor', description: '', estimated_amount: '', actual_amount: '' });
      fetchAll(true);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteDocument = async (docId: number) => {
    if (!confirm("Delete this document?")) return;
    await api.delete(`/projects/${id}/documents/${docId}`);
    fetchAll(true);
  };

  const deleteCost = async (costId: number) => {
    if (!confirm("Delete this cost entry?")) return;
    await api.delete(`/projects/${id}/costs/${costId}`);
    const res = await api.get(`/projects/${id}/costs`);
    setCosts(res.data);
  };

  if (loading) return <div className="p-8 text-center text-emerald-500 font-bold animate-pulse">Loading Project Hub...</div>;
  if (!project) return <div className="p-8 text-red-500">Project not found.</div>;

  const phases   = project.phases || [];
  const allTasks = phases.flatMap((p: any) => p.tasks || []);
  const kanbanStatuses = ['pending', 'in_progress', 'completed', 'delayed'];

  return (
    <div className="flex flex-col space-y-4 pb-16">

      {/* ======= MODALS ======= */}

      {showPhaseModal && (
        <Modal title="Add Project Phase" onClose={clearModals}>
          <form onSubmit={addPhase} className="space-y-4">
            <FormField label="Phase Name" error={errors.name}>
              <input required value={phaseForm.name} onChange={e => setPhaseForm({...phaseForm, name: e.target.value})} placeholder="e.g., Engineering & Design" className={`${INPUT} ${errors.name ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" error={errors.start_date}>
                <input type="date" required value={phaseForm.start_date} onChange={e => setPhaseForm({...phaseForm, start_date: e.target.value})} className={`${INPUT} ${errors.start_date ? 'border-red-500 px-2' : ''}`}/>
              </FormField>
              <FormField label="End Date" error={errors.end_date}>
                <input type="date" required value={phaseForm.end_date} onChange={e => setPhaseForm({...phaseForm, end_date: e.target.value})} className={`${INPUT} ${errors.end_date ? 'border-red-500 px-2' : ''}`}/>
              </FormField>
            </div>
            <FormField label="Initial Status" error={errors.status}>
              <select value={phaseForm.status} onChange={e => setPhaseForm({...phaseForm, status: e.target.value})} className={SELECT}>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Create Phase
            </button>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Add Task / Subtask" onClose={clearModals}>
          <form onSubmit={addTask} className="space-y-4">
            <FormField label="Task Title" error={errors.title}>
              <input required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="e.g., SLD Drawing Approval" className={`${INPUT} ${errors.title ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <FormField label="Assign to Phase" error={errors.phase_id}>
              <select value={taskForm.phase_id} onChange={e => setTaskForm({...taskForm, phase_id: e.target.value})} className={SELECT}>
                <option value="">— No Phase —</option>
                {phases.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Status" error={errors.status}>
                <select value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})} className={SELECT}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </FormField>
              <FormField label="Priority" error={errors.priority}>
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className={SELECT}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" error={errors.start_date}>
                <input type="date" value={taskForm.start_date} onChange={e => setTaskForm({...taskForm, start_date: e.target.value})} className={`${INPUT} ${errors.start_date ? 'border-red-500 px-2 text-xs' : ''}`}/>
              </FormField>
              <FormField label="Due Date" error={errors.due_date}>
                <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} className={`${INPUT} ${errors.due_date ? 'border-red-500 px-2 text-xs' : ''}`}/>
              </FormField>
            </div>
            <FormField label="Estimated Hours" error={errors.estimated_hours}>
              <input type="number" min="0" step="0.5" value={taskForm.estimated_hours} onChange={e => setTaskForm({...taskForm, estimated_hours: e.target.value})} placeholder="e.g., 24" className={`${INPUT} ${errors.estimated_hours ? 'border-red-500' : ''}`}/>
            </FormField>
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Create Task
            </button>
          </form>
        </Modal>
      )}

      {showDocModal && (
        <Modal title="Upload Document" onClose={clearModals}>
          <form onSubmit={addDocument} className="space-y-4">
            <FormField label="Document Title" error={errors.title}>
              <input required value={docForm.title} onChange={e => setDocForm({...docForm, title: e.target.value})} placeholder="e.g., Approved SLD Drawing Rev-02" className={`${INPUT} ${errors.title ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <FormField label="Document Type" error={errors.document_type}>
              <select value={docForm.document_type} onChange={e => setDocForm({...docForm, document_type: e.target.value})} className={SELECT}>
                <option value="drawing">Drawing / CAD</option>
                <option value="boq">BOQ</option>
                <option value="contract">Contract</option>
                <option value="site_report">Site Report</option>
                <option value="permit">Permit / Clearance</option>
              </select>
            </FormField>
            <FormField label="File URL / Drive Link" error={errors.file_url}>
              <input required value={docForm.file_url} onChange={e => setDocForm({...docForm, file_url: e.target.value})} placeholder="https://drive.google.com/..." className={`${INPUT} ${errors.file_url ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <p className="text-xs text-slate-500 -mt-2">Paste a Google Drive, Dropbox, or internal storage link.</p>
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>} Save Document
            </button>
          </form>
        </Modal>
      )}

      {showMatModal && (
        <Modal title="Request Material" onClose={clearModals}>
          <form onSubmit={addMaterial} className="space-y-4">
            <FormField label="Item Name / SKU" error={errors.item_name}>
              <input required value={matForm.item_name} onChange={e => setMatForm({...matForm, item_name: e.target.value})} placeholder="e.g., Solar Panel 550W Jinko" className={`${INPUT} ${errors.item_name ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <FormField label="Quantity Required" error={errors.quantity_required}>
              <input required type="number" min="0.01" step="0.01" value={matForm.quantity_required} onChange={e => setMatForm({...matForm, quantity_required: e.target.value})} placeholder="e.g., 80" className={`${INPUT} ${errors.quantity_required ? 'border-red-500 ring-red-500' : ''}`}/>
            </FormField>
            <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 mt-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Add to BOM
            </button>
          </form>
        </Modal>
      )}

      {/* ======= HEADER ======= */}
      <div className="flex items-start justify-between border-b pb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[project.status] || STATUS_COLORS.pending}`}>{project.status}</span>
              <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{project.project_no}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Client: <span className="font-bold">{project.client?.company_name || 'Internal'}</span> • Type: <span className="capitalize">{project.type}</span>
            </p>
          </div>
        </div>
        <div className="text-right hidden md:block shrink-0">
          <div className="text-3xl font-black text-slate-800 dark:text-slate-200">{project.progress || 0}%</div>
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Overall</div>
          <div className="w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${project.progress || 0}%` }}/>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden shrink-0">
           <button onClick={printReport} className="p-2 bg-white dark:bg-slate-900 border rounded-lg hover:bg-slate-50 transition-colors shadow-sm" title="Print Snapshot"><FileText className="w-4 h-4 text-slate-600"/></button>
           {project.status !== 'completed' && (
             <button onClick={markProjectComplete} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all active:scale-95">Mark Complete</button>
           )}
        </div>
      </div>

      {/* ======= TABS ======= */}
      <div className="flex border-b overflow-x-auto no-scrollbar">
        {[
          { key: 'overview',   label: 'Overview',      icon: LayoutDashboard },
          { key: 'tasks',      label: 'WBS & Tasks',   icon: GanttChartSquare },
          { key: 'gantt',      label: 'Timeline',      icon: GanttChartSquare },
          { key: 'costs',      label: 'Financials',    icon: DollarSign },
          { key: 'materials',  label: 'Materials',     icon: Box },
          { key: 'documents',  label: 'Documents',     icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === key ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ======= OVERVIEW ======= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            {[
              { label: 'Contract Value',   value: `৳${Number(project.budget || 0).toLocaleString()}`,      cls: 'text-slate-800 dark:text-slate-100' },
              { label: 'Actual Spent',     value: `৳${Number(costs?.summary?.actual_total || 0).toLocaleString()}`,  cls: (costs?.summary?.actual_total || 0) > (project.budget || 0) ? 'text-red-600' : 'text-emerald-600' },
              { label: 'Phases',           value: phases.length,    cls: 'text-indigo-600' },
              { label: 'Total Tasks',      value: allTasks.length,  cls: 'text-slate-700 dark:text-slate-300' },
            ].map((s) => (
              <div key={s.label} className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{s.label}</div>
                <div className={`text-2xl font-black font-mono ${s.cls}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* AI Diagnostics */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border border-indigo-200 dark:border-indigo-900 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="font-bold text-indigo-700 dark:text-indigo-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4"/> AI EPC Diagnostics
            </h3>
            {aiDiag ? (
              <div className="space-y-3 text-sm flex-1">
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${aiDiag.delay_risk === 'high' ? 'bg-red-50 text-red-600 border-red-200' : aiDiag.delay_risk === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    Delay: {aiDiag.delay_risk || 'low'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${aiDiag.budget_status === 'overrun' ? 'bg-red-50 text-red-600 border-red-200' : aiDiag.budget_status === 'at_risk' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    Budget: {aiDiag.budget_status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{aiDiag.summary}</p>
                {aiDiag.recommendations?.length > 0 && (
                  <ul className="space-y-1">
                    {aiDiag.recommendations.slice(0, 3).map((r: string, i: number) => (
                      <li key={i} className="text-xs flex gap-2 text-slate-600 dark:text-slate-300">
                        <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0"/>{r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : <p className="text-xs text-slate-500 flex-1 italic mt-2">Click to analyze delays, budget risk, and critical path using AI.</p>}
            <button onClick={runAIDiagnostics} disabled={analyzing} className="mt-4 w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 text-sm font-bold py-2 rounded-lg flex justify-center items-center gap-2 shadow-sm hover:bg-indigo-50 transition-colors disabled:opacity-60">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
              {analyzing ? 'Analyzing...' : 'Run AI Diagnostics'}
            </button>
          </div>

          {/* Project Info */}
          <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm lg:col-span-3">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest mb-4">Project Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {[
                { label: 'Type',     value: project.type },
                { label: 'Start',    value: project.start_date || 'TBD' },
                { label: 'End',      value: project.end_date || 'TBD' },
                { label: 'Location', value: project.location || '—' },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{f.label}</div>
                  <div className="font-semibold capitalize">{f.value}</div>
                </div>
              ))}
            </div>
            {project.description && <p className="mt-4 pt-4 border-t text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{project.description}</p>}
          </div>
        </div>
      )}

      {/* ======= WBS TASKS ======= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-lg">Work Breakdown Structure</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                <button onClick={() => setTaskView('wbs')} className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 transition-colors ${taskView === 'wbs' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}><List className="w-4 h-4"/> WBS</button>
                <button onClick={() => setTaskView('kanban')} className={`px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 transition-colors ${taskView === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4"/> Kanban</button>
              </div>
              <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border shadow-sm rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                <Plus className="w-4 h-4"/> Add Task
              </button>
              <button onClick={() => setShowPhaseModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow">
                <Plus className="w-4 h-4"/> Add Phase
              </button>
            </div>
          </div>

          {taskView === 'wbs' && (
            phases.length === 0 ? (
              <div className="text-center p-16 border-2 border-dashed rounded-xl text-slate-400 space-y-2">
                <GanttChartSquare className="w-10 h-10 mx-auto text-slate-300"/>
                <p className="font-bold">No phases defined yet.</p>
                <p className="text-sm">Click "Add Phase" to create your first WBS phase (e.g. Engineering, Procurement, Installation).</p>
                <button onClick={() => setShowPhaseModal(true)} className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800">
                  <Plus className="w-4 h-4"/> Add First Phase
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {phases.map((phase: any) => (
                  <div key={phase.id} className="border rounded-xl bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => setExpanded(prev => ({ ...prev, [phase.id]: !prev[phase.id] }))}>
                      {expanded[phase.id] ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0"/> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0"/>}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{phase.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{phase.start_date} → {phase.end_date} • {(phase.tasks || []).length} tasks</div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${STATUS_COLORS[phase.status] || STATUS_COLORS.pending}`}>{phase.status}</span>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">{phase.progress_pct || 0}%</div>
                          <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${phase.progress_pct || 0}%` }}/>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                           <button onClick={(e) => { e.stopPropagation(); setPhaseForm({...phase}); setEditingId(phase.id); setShowPhaseModal(true); }} className="p-1 hover:text-indigo-600"><Edit3 className="w-3.5 h-3.5"/></button>
                           <button onClick={(e) => { e.stopPropagation(); deletePhase(phase.id); }} className="p-1 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    </div>

                    {expanded[phase.id] && (
                      <div className="divide-y animate-slide-down">
                        {(phase.tasks || []).length === 0 ? (
                          <div className="px-6 py-5 text-xs italic text-slate-400 flex items-center gap-3 font-semibold">
                            No tasks in this phase.
                            <button onClick={() => { setTaskForm({...EMPTY_TASK, phase_id: phase.id}); setShowTaskModal(true); }} className="font-bold text-indigo-500 hover:text-indigo-600 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded">+ Add Task</button>
                          </div>
                        ) : (
                          (phase.tasks || []).map((task: any) => (
                            <div key={task.id} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{task.title}</div>
                                <div className="flex gap-2 mt-1 flex-wrap">
                                  {task.assignee && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">👤 {task.assignee.name}</span>}
                                  {task.priority && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${STATUS_COLORS[task.priority] || ''}`}>{task.priority}</span>}
                                  {task.due_date && <span className="text-[10px] text-slate-400 font-mono">Due: {task.due_date}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <input type="range" min={0} max={100} value={task.progress_pct || 0}
                                  onChange={e => updateTaskProgress(task.id, parseInt(e.target.value))}
                                  className="w-20 accent-emerald-500 cursor-pointer"/>
                                <span className="text-sm font-bold w-9 text-right text-emerald-600 tabular-nums">{task.progress_pct || 0}%</span>
                                <select value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value)}
                                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded border outline-none cursor-pointer transition-all ${STATUS_COLORS[task.status] || STATUS_COLORS.pending}`}>
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="delayed">Delayed</option>
                                </select>
                                <div className="flex items-center gap-1 border-l pl-2 ml-1">
                                   <button onClick={() => { setTaskForm({...task}); setEditingId(task.id); setShowTaskModal(true); }} className="p-1 hover:text-indigo-600"><Edit3 className="w-3.5 h-3.5"/></button>
                                   <button onClick={() => deleteOneTask(task.id)} className="p-1 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {taskView === 'kanban' && (
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {kanbanStatuses.map(status => (
                <div key={status} className="w-72 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold uppercase text-xs tracking-widest text-slate-500">{status.replace('_', ' ')}</h3>
                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">{allTasks.filter((t: any) => t.status === status).length}</span>
                  </div>
                  <div className="min-h-[400px] bg-slate-50/50 dark:bg-slate-900/40 p-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                    {allTasks.filter((t: any) => t.status === status).map((task: any) => (
                      <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-md transition-all">
                        <p className="font-bold text-sm mb-1 leading-tight">{task.title}</p>
                        {task.assignee && <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">👤 <span className="font-bold text-slate-500 capitalize">{task.assignee.name}</span></p>}
                        <div className="flex items-center justify-between mt-3">
                          {task.priority && <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[task.priority]}`}>{task.priority}</span>}
                          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter bg-emerald-50 px-1.5 rounded">{task.progress_pct || 0}%</span>
                        </div>
                        <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${task.progress_pct || 0}%` }}/>
                        </div>
                      </div>
                    ))}
                    {allTasks.filter((t: any) => t.status === status).length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic font-medium">No tasks</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======= GANTT / TIMELINE ======= */}
      {activeTab === 'gantt' && (
        <div className="bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GanttChartSquare className="w-5 h-5 text-emerald-500"/>
              <h3 className="font-bold">Execution Timeline</h3>
            </div>
            <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
              <Plus className="w-3 h-3"/> Add Task
            </button>
          </div>
          <div className="overflow-auto no-scrollbar">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 border-b text-[10px] font-bold uppercase text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-800/30 sticky top-0 z-10">
                <div className="col-span-4 p-3 border-r">Task</div>
                <div className="col-span-2 p-3 border-r">Dates</div>
                <div className="col-span-1 p-3 border-r text-center">St.</div>
                <div className="col-span-5 p-3">Timeline Visual</div>
              </div>
              {ganttTasks.length === 0 ? (
                <div className="p-16 text-center text-slate-400 italic bg-white dark:bg-slate-900">
                  <GanttChartSquare className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                  No tasks scheduled. Please add tasks with start and end dates.
                </div>
              ) : ganttTasks.map((task: any) => (
                <div key={task.id} className="grid grid-cols-12 border-b hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-white dark:bg-slate-900">
                  <div className="col-span-4 p-3 text-sm font-medium border-r">
                    <div className="truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">#{task.id} {task.priority && `• ${task.priority}`}</div>
                  </div>
                  <div className="col-span-2 p-3 text-[10px] font-mono border-r text-slate-500">
                    <div className="flex items-center gap-1 text-indigo-500">S: <span className="text-slate-700 dark:text-slate-300 font-bold">{task.start_date || 'TBD'}</span></div>
                    <div className="flex items-center gap-1 text-pink-500">E: <span className="text-slate-700 dark:text-slate-300 font-bold">{task.due_date || 'TBD'}</span></div>
                  </div>
                  <div className="col-span-1 p-3 border-r flex items-center justify-center">
                    {task.status === 'completed' || task.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> :
                     task.status === 'delayed' ? <AlertTriangle className="w-5 h-5 text-red-500"/> :
                     task.status === 'in_progress' ? <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse border-2 border-blue-200"/> :
                     <Circle className="w-4 h-4 text-slate-300"/>}
                  </div>
                  <div className="col-span-5 p-3 flex items-center">
                    <div className="relative w-full h-8 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-800 flex items-center overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${task.status === 'delayed' ? 'bg-gradient-to-r from-red-400 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : task.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]'}`}
                        style={{ width: `${Math.max(4, task.progress_pct || 5)}%` }}/>
                      <span className="absolute right-3 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{task.status?.replace('_',' ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======= FINANCIALS ======= */}
      {activeTab === 'costs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Estimated', value: costs?.summary?.estimated_total || 0, cls: 'text-slate-800 dark:text-slate-100' },
                { label: 'Actual',    value: costs?.summary?.actual_total || 0,    cls: 'text-red-600' },
                { label: 'Variance',  value: costs?.summary?.variance || 0,         cls: (costs?.summary?.variance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600' },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm text-center">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">{s.label}</div>
                  <div className={`text-xl font-black font-mono ${s.cls}`}>৳{Number(s.value).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 font-bold text-sm">Cost Entries</div>
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-4 py-2">Type</th><th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2 text-right">Estimated</th><th className="px-4 py-2 text-right">Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(costs?.items || []).map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 text-[10px] font-black rounded uppercase border border-slate-200 dark:border-slate-700">{c.type}</span></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs font-medium">{c.description || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm">৳{Number(c.estimated_amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-red-600 underline decoration-red-200 underline-offset-4">
                        <div className="flex items-center justify-end gap-2 text-[10px]">
                           ৳{Number(c.actual_amount || 0).toLocaleString()}
                           <button onClick={() => deleteCost(c.id)} className="p-1 hover:text-red-600 ml-2"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(costs?.items || []).length === 0 && <tr><td colSpan={4} className="text-center p-12 text-slate-400 italic bg-white dark:bg-slate-900">No cost entries logged yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden h-fit">
            <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50 font-bold text-sm">Log Cost Entry</div>
            <form onSubmit={logCost} className="p-5 space-y-4">
              <FormField label="Type" error={errors.type}>
                <select value={costForm.type} onChange={e => setCostForm({...costForm, type: e.target.value})} className={SELECT}>
                  <option value="material">Material</option><option value="labor">Labor</option>
                  <option value="subcontractor">Subcontractor</option><option value="logistics">Logistics</option>
                  <option value="other">Other</option>
                </select>
              </FormField>
              <FormField label="Description" error={errors.description}>
                <input value={costForm.description} onChange={e => setCostForm({...costForm, description: e.target.value})} placeholder="e.g., Panel Batch 1" className={`${INPUT} ${errors.description ? 'border-red-500 ring-red-500' : ''}`}/>
              </FormField>
              <FormField label="Estimated (BDT)" error={errors.estimated_amount}>
                <input type="number" required min="0" value={costForm.estimated_amount} onChange={e => setCostForm({...costForm, estimated_amount: e.target.value})} placeholder="0.00" className={`${INPUT} ${errors.estimated_amount ? 'border-red-500' : ''}`}/>
              </FormField>
              <FormField label="Actual (BDT)" error={errors.actual_amount}>
                <input type="number" min="0" value={costForm.actual_amount} onChange={e => setCostForm({...costForm, actual_amount: e.target.value})} placeholder="0.00" className={`${INPUT} ${errors.actual_amount ? 'border-red-500 px-2 font-bold text-red-500' : ''}`}/>
              </FormField>
              <button type="submit" disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} Log Cost
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======= MATERIALS ======= */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Bill of Materials (BOM)</h2>
            <button onClick={() => setShowMatModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 shadow transition-all active:scale-95">
              <Plus className="w-4 h-4"/> Request Material
            </button>
          </div>
          <div className="bg-white dark:bg-slate-900 border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase text-slate-500 font-bold border-b bg-slate-50/50 dark:bg-slate-800/30">
                <tr>
                  <th className="px-4 py-3">Item</th><th className="px-4 py-3 text-center">Required</th>
                  <th className="px-4 py-3 text-center">Used</th><th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {materials.map((mat: any) => (
                  <tr key={mat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-white dark:bg-slate-900">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{mat.item_name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600">{mat.quantity_required}</td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-600 bg-emerald-50/30">{mat.quantity_used || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select value={mat.status} onChange={e => updateMatStatus(mat.id, e.target.value)}
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded border-2 outline-none cursor-pointer transition-all ${STATUS_COLORS[mat.status] || STATUS_COLORS.pending}`}>
                          <option value="pending">Pending</option>
                          <option value="procured">Procured</option>
                          <option value="installed">Installed</option>
                        </select>
                        <button onClick={() => deleteMaterial(mat.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && <tr><td colSpan={4} className="text-center p-16 text-slate-400 italic bg-white dark:bg-slate-900">No materials tracked. Add items to your project BOM.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======= DOCUMENTS ======= */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Document Repository</h2>
            <button onClick={() => setShowDocModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 shadow shadow-slate-900/10 transition-all active:scale-95">
              <Upload className="w-4 h-4"/> Upload Document
            </button>
          </div>
          {documents.length === 0 ? (
            <div className="border-2 border-dashed rounded-3xl p-20 text-center bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800">
              <FileText className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4"/>
              <h3 className="font-black text-slate-800 dark:text-slate-200 text-xl tracking-tight">No Documents Yet</h3>
              <p className="text-sm text-slate-500 mt-2 mb-6 max-w-xs mx-auto">Upload site reports, engineering drawing, BOQs, and contracts for shared access.</p>
              <button onClick={() => setShowDocModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-800 dark:border-slate-200 text-slate-900 dark:text-white text-sm font-black rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-200 dark:shadow-none">
                <Plus className="w-5 h-5"/> Start Uploading
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {documents.map((doc: any) => (
                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-emerald-500/30 hover:-translate-y-1 transition-all flex items-start gap-4 group">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900 shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{doc.title}</p>
                      <button onClick={(e) => { e.preventDefault(); deleteDocument(doc.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-2 border-slate-50 dark:border-slate-800 px-2 py-0.5 rounded-lg bg-slate-50/50 dark:bg-slate-900">{doc.document_type?.replace('_', ' ')}</span>
                       <span className="text-[9px] font-bold text-slate-300">#{doc.id}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
