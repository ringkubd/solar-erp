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

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/hr/employees/${id}`);
      setEmployee(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
                <button className="px-6 py-3 bg-white text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-white/5">
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
                     <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Plus className="w-4 h-4"/> Upload New
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {employee.documents?.length > 0 ? employee.documents.map((doc: any) => (
                        <div key={doc.id} className="p-4 border-2 border-slate-50 rounded-2xl hover:border-blue-100 transition-all group flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all"><FileText className="w-5 h-5"/></div>
                              <div>
                                 <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{doc.title}</div>
                                 <div className="text-[9px] font-bold text-slate-400 uppercase">Exp: {doc.expiry_date || 'N/A'}</div>
                              </div>
                           </div>
                           <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Download className="w-4 h-4"/></button>
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
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                     <span className="text-xs font-black uppercase text-slate-600">Access Role</span>
                     <span className="text-[10px] font-black uppercase bg-white px-3 py-1 border border-slate-200 rounded-lg text-slate-800">{employee.role}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                     <span className="text-xs font-black uppercase text-slate-600">User Acc.</span>
                     <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg">Connected</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
