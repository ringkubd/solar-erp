"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Users, UserPlus, Mail, Phone, Building2, 
  MapPin, Loader2, Search, Filter, MoreVertical,
  Briefcase, DollarSign, Calendar, CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [depts, setDepts] = useState<any[]>([]);

  const [form, setForm] = useState({
    department_id: '',
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    salary: '',
    join_date: new Date().toISOString().slice(0, 10),
    address: ''
  });

  const fetchHR = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/departments')
      ]);
      setEmployees(empRes.data.data);
      setDepts(deptRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHR(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/hr/employees', form);
      setShowAddModal(false);
      fetchHR();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-slate-500">Manage ECOPAC engineering, sales, and accounts staff.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95">
          <UserPlus className="w-4 h-4"/> Onboard Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Staff', value: employees.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Departments', value: depts.length, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Status', value: employees.filter(e=>e.status==='active').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border rounded-2xl p-6 shadow-sm flex items-center gap-4">
             <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6"/>
             </div>
             <div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] font-black uppercase text-slate-500 border-b bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left">Internal ID & Name</th>
              <th className="px-6 py-4 text-left">Role & Dept</th>
              <th className="px-6 py-4 text-left">Contact Info</th>
              <th className="px-6 py-4 text-left">Join Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600"/></td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <Link href={`/hr/employees/${emp.id}`} className="flex items-center gap-3 group/link">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover/link:bg-blue-100 group-hover/link:text-blue-600 transition-colors">
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover/link:text-blue-600 transition-colors">{emp.first_name} {emp.last_name}</div>
                      <div className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">{emp.employee_id}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                   <div className="font-bold text-slate-700 text-xs">{emp.designation?.name || emp.role}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.department?.name}</div>
                </td>
                <td className="px-6 py-4 space-y-1">
                   <div className="flex items-center gap-2 text-xs text-slate-500 lowercase">
                      <Mail className="w-3 h-3"/> {emp.email}
                   </div>
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3 h-3"/> {emp.phone || '—'}
                   </div>
                </td>
                <td className="px-6 py-4">
                   <div className="text-xs font-medium text-slate-600">{emp.join_date}</div>
                   <div className="text-[10px] font-bold text-slate-300 uppercase">Since joining</div>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                     emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                   }`}>
                     {emp.status}
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/hr/employees/${emp.id}`}>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <MoreVertical className="w-4 h-4"/>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-4 py-8">
         <Link href="/hr/attendance">
            <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2">
               <Calendar className="w-4 h-4"/> Attendance System
            </button>
         </Link>
         <Link href="/hr/timesheets">
            <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center gap-2">
               <Briefcase className="w-4 h-4"/> Productivity Logs
            </button>
         </Link>
         <Link href="/hr/payroll">
            <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-600 hover:border-amber-500 hover:text-amber-600 transition-all flex items-center gap-2">
               <DollarSign className="w-4 h-4"/> Salary & Payroll
            </button>
         </Link>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 relative overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-6 border-b flex items-center justify-between shrink-0">
                <div>
                   <h2 className="font-black text-xl tracking-tight text-slate-900">New Employee Onboarding</h2>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">HR Software System</p>
                </div>
                <button onClick={()=>setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 font-bold px-2">✕</button>
             </div>
             
             <form onSubmit={handleAdd} className="p-8 space-y-6 overflow-auto">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Employee ID</label>
                      <input placeholder="ECO-000" required value={form.employee_id} onChange={e=>setForm({...form, employee_id: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 font-mono font-bold focus:border-emerald-500 outline-none transition-all"/>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Department</label>
                      <select required value={form.department_id} onChange={e=>setForm({...form, department_id: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm font-bold focus:border-emerald-500 outline-none">
                         <option value="">— Select —</option>
                         {depts.map(d=>(<option key={d.id} value={d.id}>{d.name}</option>))}
                      </select>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">First Name</label>
                      <input required value={form.first_name} onChange={e=>setForm({...form, first_name: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm focus:border-emerald-500 outline-none"/>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Last Name</label>
                      <input required value={form.last_name} onChange={e=>setForm({...form, last_name: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm focus:border-emerald-500 outline-none"/>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                      <input type="email" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm focus:border-emerald-500 outline-none"/>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Salary (Monthly)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-300"/>
                        <input type="number" required value={form.salary} onChange={e=>setForm({...form, salary: e.target.value})}
                           className="w-full h-11 border-2 rounded-xl pl-10 pr-4 font-mono font-bold focus:border-emerald-500 outline-none"/>
                      </div>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Designation / Role</label>
                      <input placeholder="e.g. Solar Technician" required value={form.role} onChange={e=>setForm({...form, role: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm focus:border-emerald-500 outline-none"/>
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Joining Date</label>
                      <input type="date" required value={form.join_date} onChange={e=>setForm({...form, join_date: e.target.value})}
                         className="w-full h-11 border-2 rounded-xl px-4 text-sm focus:border-emerald-500 outline-none"/>
                   </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
                   <button type="button" onClick={()=>setShowAddModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all font-mono uppercase text-[10px]">Cancel</button>
                   <button type="submit" className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                      Save Employee
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
