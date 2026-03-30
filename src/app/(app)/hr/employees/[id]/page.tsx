"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { 
  User, Mail, Phone, MapPin, Building2, 
  Briefcase, DollarSign, Calendar, FileText, 
  Plus, History, Clock, CheckCircle2, AlertCircle,
  Download, Trash2, Loader2
} from "lucide-react";
import Link from "next/link";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [depts, setDepts] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [editForm, setEditForm] = useState<any>({});
  const [uploadForm, setUploadForm] = useState<any>({ title: '', type: '', expiry_date: '', file: null });

  const fetchProfile = async () => {
    try {
      const [empRes, deptRes, desigRes, docRes] = await Promise.all([
        api.get(`/hr/employees/${id}`),
        api.get('/hr/departments'),
        api.get('/hr/designations'),
        api.get(`/hr/employees/${id}/documents`)
      ]);
      setEmployee(empRes.data);
      setDepts(deptRes.data);
      setDesignations(desigRes.data);
      setDocuments(docRes.data);
      setEditForm(empRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('type', uploadForm.type);
    formData.append('expiry_date', uploadForm.expiry_date);
    formData.append('file', uploadForm.file);

    try {
      await api.post(`/hr/employees/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadForm({ title: '', type: '', expiry_date: '', file: null });
      fetchProfile();
    } catch (err) {
      alert("Upload failed.");
    }
  };

  const deleteDoc = async (docId: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/hr/documents/${docId}`);
      fetchProfile();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/hr/employees/${id}`, editForm);
      setEmployee(res.data);
      setShowEditModal(false);
      alert("Employee profile updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update profile.");
    }
  };

  useEffect(() => { fetchProfile(); }, [id]);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;
  if (!employee) return <div className="text-center p-20 text-slate-500">Employee not found.</div>;

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-[100px]" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
             <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-800 flex items-center justify-center text-4xl font-black text-slate-500 shadow-inner">
                {employee.first_name[0]}{employee.last_name[0]}
             </div>
             <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                   <h1 className="text-3xl font-black text-white tracking-tight">{employee.first_name} {employee.last_name}</h1>
                   <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block w-fit mx-auto md:mx-0">
                      {employee.status}
                   </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm font-medium">
                   <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-400"/> {employee.designation?.name || employee.role}</div>
                   <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400"/> {employee.department?.name}</div>
                   <div className="font-mono text-xs bg-slate-800 px-3 py-1 rounded-md text-slate-500 tracking-widest font-bold">ID: {employee.employee_id}</div>
                </div>
             </div>
             <div className="flex gap-2">
                <button 
                   onClick={() => {
                      setEditForm(employee);
                      setShowEditModal(true);
                   }}
                   className="px-6 py-3 bg-white text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-white/5">
                   Edit Profile
                </button>
             </div>
          </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
         {['overview', 'documents', 'attendance', 'payroll'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
               activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {activeTab === 'overview' && (
               <div className="bg-white border rounded-[2rem] p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2">Contact Details</h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-4 group">
                              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors"><Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500"/></div>
                              <div><div className="text-[9px] font-black text-slate-300 uppercase">Email Address</div><div className="font-bold text-slate-700">{employee.email}</div></div>
                           </div>
                           <div className="flex items-center gap-4 group">
                              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-emerald-50 transition-colors"><Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-500"/></div>
                              <div><div className="text-[9px] font-black text-slate-300 uppercase">Phone Number</div><div className="font-bold text-slate-700">{employee.phone || 'N/A'}</div></div>
                           </div>
                           <div className="flex items-center gap-4 group">
                              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-amber-50 transition-colors"><MapPin className="w-4 h-4 text-slate-400 group-hover:text-amber-500"/></div>
                              <div><div className="text-[9px] font-black text-slate-300 uppercase">Residential Address</div><div className="font-bold text-slate-700">{employee.address || 'N/A'}</div></div>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2">Employment Info</h3>
                        <div className="space-y-3">
                           <div className="flex items-center gap-4 group">
                              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-purple-50 transition-colors"><Calendar className="w-4 h-4 text-slate-400 group-hover:text-purple-500"/></div>
                              <div><div className="text-[9px] font-black text-slate-300 uppercase">Joining Date</div><div className="font-bold text-slate-700">{employee.join_date}</div></div>
                           </div>
                           <div className="flex items-center gap-4 group">
                              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-pink-50 transition-colors"><DollarSign className="w-4 h-4 text-slate-400 group-hover:text-pink-500"/></div>
                              <div><div className="text-[9px] font-black text-slate-300 uppercase">Basic Monthly Salary</div><div className="font-mono font-bold text-slate-700">{employee.salary} BDT</div></div>
                           </div>
                        </div>
                     </section>
                  </div>
               </div>
            )}

            {activeTab === 'documents' && (
               <div className="bg-white border rounded-[2rem] p-8 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Verified Documents</h3>
                     <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-slate-200">
                        <Plus className="w-4 h-4"/> Upload New
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {documents.length > 0 ? documents.map((doc: any) => (
                        <div key={doc.id} className="p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-100 transition-all group flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all"><FileText className="w-5 h-5"/></div>
                              <div>
                                 <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{doc.title}</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase">Exp: {doc.expiry_date || 'N/A'}</div>
                              </div>
                           </div>
                           <div className="flex gap-1">
                              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${doc.file_path}`} target="_blank" rel="noreferrer">
                                 <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><Download className="w-4 h-4"/></button>
                              </a>
                              <button onClick={() => deleteDoc(doc.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                           </div>
                        </div>
                     )) : (
                        <div className="col-span-2 text-center py-12 text-slate-400 text-sm font-medium">No documents uploaded yet.</div>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'attendance' && (
                <div className="bg-white border rounded-[2rem] shadow-sm animate-in fade-in duration-300">
                   <div className="p-8 border-b flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Attendance Log (Last 30 Days)</h3>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                         <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400">
                            <tr>
                               <th className="px-8 py-4 text-left">Date</th>
                               <th className="px-8 py-4 text-center">Status</th>
                               <th className="px-8 py-4 text-right">In / Out</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {[1,2,3,4,5].map(i => (
                               <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-8 py-4 font-bold text-slate-600">2026-03-{25-i}</td>
                                  <td className="px-8 py-4 text-center">
                                     <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-tighter">Present</span>
                                  </td>
                                  <td className="px-8 py-4 text-right font-mono text-xs text-slate-400">09:00 AM — 06:15 PM</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
            )}
         </div>

         <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg"><DollarSign className="w-4 h-4 text-blue-400"/></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payroll Quick View</h3>
               </div>
               <div className="space-y-6">
                  <div>
                     <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Monthly Gross</div>
                     <div className="text-3xl font-black font-mono tracking-tighter text-white">{employee.salary} BDT</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                     <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Leaves Used</div>
                        <div className="font-black text-blue-400">02 / 14</div>
                     </div>
                     <div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Next Payout</div>
                        <div className="font-black text-slate-200">Apr 01</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white border rounded-[2rem] p-6 shadow-sm">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Security & Roles</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase text-slate-600">Access Role</span>
                        <select 
                           value={employee.role}
                           onChange={async (e) => {
                              try {
                                 const res = await api.put(`/hr/employees/${id}`, { role: e.target.value });
                                 setEmployee(res.data);
                              } catch (err) { console.error(err); }
                           }}
                           className="text-[10px] font-black uppercase bg-white px-2 py-1 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-500"
                        >
                           <option value="admin">Admin</option>
                           <option value="engineer">Engineer</option>
                           <option value="accountant">Accountant</option>
                           <option value="staff">Staff</option>
                        </select>
                     </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl">
                     <span className="text-xs font-black uppercase text-slate-600 mb-3 block">Guard Permissions</span>
                     <div className="flex flex-wrap gap-2">
                        {['admin', 'engineer', 'accountant'].map(r => (
                           <button 
                              key={r}
                              onClick={async () => {
                                 const currentRoles = employee.roles?.map((role: any) => role.role_name) || [];
                                 const newRoles = currentRoles.includes(r) 
                                    ? currentRoles.filter((role: string) => role !== r)
                                    : [...currentRoles, r];
                                 try {
                                    const res = await api.put(`/hr/employees/${id}`, { assigned_roles: newRoles });
                                    setEmployee(res.data);
                                 } catch (err) { console.error(err); }
                              }}
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                                 employee.roles?.some((role: any) => role.role_name === r)
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'
                              }`}
                           >
                              {r}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3">
                     <span className="text-xs font-black uppercase text-red-600 block">Restricted Actions</span>
                     <button 
                        onClick={async () => {
                           const newPass = prompt("Enter new password (min 6 chars):");
                           if (newPass && newPass.length >= 6) {
                              try {
                                 await api.put(`/hr/employees/${id}/password`, { password: newPass });
                                 alert("Password reset successfully.");
                              } catch (err) { alert("Failed to reset password."); }
                           }
                        }}
                        className="w-full py-2 bg-white text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                     >
                        Reset Password
                     </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                     <span className="text-xs font-black uppercase text-slate-600">User Acc.</span>
                     <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                        employee.user_id 
                           ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                           : 'bg-amber-50 text-amber-600 border-amber-100'
                     }`}>
                        {employee.user_id ? 'Connected' : 'Portal Access Off'}
                     </span>
                  </div>
               </div>
            </div>
          </div>
       </div>
 
       <EditEmployeeModal 
          open={showEditModal} 
          onClose={() => setShowEditModal(false)}
          form={editForm}
          setForm={setEditForm}
          onSubmit={handleUpdate}
          departments={depts}
          designations={designations}
       />

       <UploadDocumentModal 
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          form={uploadForm}
          setForm={setUploadForm}
          onSubmit={handleUpload}
       />
     </div>
   );
 }

// Sub-components can be added here or kept as part of the modal
function EditEmployeeModal({ open, onClose, form, setForm, onSubmit, departments, designations }: any) {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
         <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between shrink-0">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Personnel File</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official ECOPAC Employee Record</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-950">✕</button>
            </div>
            
            <form onSubmit={onSubmit} className="p-8 overflow-y-auto space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Primary Identity</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">First Name</label>
                           <input value={form.first_name || ''} onChange={e=>setForm({...form, first_name: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Last Name</label>
                           <input value={form.last_name || ''} onChange={e=>setForm({...form, last_name: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                        </div>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Official Email</label>
                        <input type="email" value={form.email || ''} onChange={e=>setForm({...form, email: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Personnel ID</label>
                        <input value={form.employee_id || ''} onChange={e=>setForm({...form, employee_id: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 font-mono text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Contact Info</h3>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Phone Number</label>
                        <input value={form.phone || ''} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                     </div>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Home Address</label>
                        <textarea value={form.address || ''} onChange={e=>setForm({...form, address: e.target.value})} className="w-full h-24 border-2 rounded-xl p-4 text-sm font-bold focus:border-blue-500 outline-none transition-all resize-none"/>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Assignment & Compensation</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Department</label>
                           <select value={form.department_id || ''} onChange={e=>setForm({...form, department_id: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all appearance-none">
                              <option value="">Select Department</option>
                              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Designation</label>
                           <select value={form.designation_id || ''} onChange={e=>setForm({...form, designation_id: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all appearance-none">
                              <option value="">Select Designation</option>
                              {designations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Monthly Salary</label>
                           <input type="number" value={form.salary || ''} onChange={e=>setForm({...form, salary: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 font-mono text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                        </div>
                        <div>
                           <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Joining Date</label>
                           <input type="date" value={form.join_date || ''} onChange={e=>setForm({...form, join_date: e.target.value})} className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Account Status</h3>
                     <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Employment Status</label>
                        <div className="flex gap-2">
                           {['active', 'inactive', 'on_leave'].map(s => (
                              <button key={s} type="button" onClick={()=>setForm({...form, status: s})} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.status === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                                 {s}
                              </button>
                           ))}
                        </div>
                     </div>
                  </section>
               </div>
               <div className="pt-8 border-t flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-500 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Discard Changes</button>
                  <button type="submit" className="px-12 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">Commit Updates</button>
               </div>
            </form>
         </div>
      </div>
   );
}

function UploadDocumentModal({ open, onClose, form, setForm, onSubmit }: any) {
    if (!open) return null;
    return (
       <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300">
             <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Upload Document</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-900 px-2">✕</button>
             </div>
             
             <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Document Title</label>
                   <input required value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="e.g. NID Card, Employment Contract"
                      className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none transition-all"/>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Type</label>
                   <select value={form.type} onChange={e=>setForm({...form, type: e.target.value})}
                      className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none">
                      <option value="">Select Category</option>
                      <option value="id_proof">ID Card / NID</option>
                      <option value="contract">Contract Agreement</option>
                      <option value="certificate">Educational Certificate</option>
                      <option value="medical">Medical Record</option>
                      <option value="other">Other</option>
                   </select>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Expiry Date (Optional)</label>
                   <input type="date" value={form.expiry_date} onChange={e=>setForm({...form, expiry_date: e.target.value})}
                      className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-blue-500 outline-none"/>
                </div>
                <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Select File (Max 5MB)</label>
                   <input type="file" required onChange={e=>setForm({...form, file: e.target.files?.[0]})}
                      className="w-full text-xs font-mono file:bg-slate-900 file:text-white file:rounded-lg file:px-4 file:py-2 file:border-0 file:mr-4 file:font-black file:uppercase file:text-[9px] file:cursor-pointer"/>
                </div>

                <div className="pt-4 flex gap-2">
                   <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                   <button type="submit" className="flex-2 px-8 py-3 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Upload Now</button>
                </div>
             </form>
          </div>
       </div>
    );
}
