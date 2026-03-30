"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Calendar, Clock, User, CheckCircle2, 
  AlertCircle, Search, Filter, Loader2, ArrowRight
} from "lucide-react";

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState<any>({});

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/employees');
      setEmployees(res.data.data);
      // Initialize attendance data
      const initial: any = {};
      res.data.data.forEach((e: any) => {
        initial[e.id] = { status: 'present', check_in: '09:00', check_out: '18:00', notes: '' };
      });
      setAttendanceData(initial);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleUpdate = (empId: number, field: string, value: string) => {
    setAttendanceData({
      ...attendanceData,
      [empId]: { ...attendanceData[empId], [field]: value }
    });
  };

  const submitAttendance = async () => {
    setSaving(true);
    try {
      for (const empId of Object.keys(attendanceData)) {
        await api.post('/attendance', {
          employee_id: empId,
          date,
          ...attendanceData[empId]
        });
      }
      alert("Attendance records updated successfully!");
    } catch (err: any) {
      alert("Failed to save some records.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Calendar className="w-8 h-8 text-blue-500" /> Attendance Management
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest text-[10px]">Daily workforce tracking & manual overrides</p>
        </div>
        <div className="flex items-center gap-3">
           <input 
              type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="px-6 py-3 border-2 border-slate-100 rounded-2xl font-black text-sm text-slate-700 outline-none focus:border-blue-500 transition-all bg-white"
           />
           <button 
              onClick={submitAttendance} disabled={saving}
              className="px-10 py-3 bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
           >
              {saving ? 'Processing...' : 'Commit Daily Attendance'}
           </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in duration-500">
         <table className="w-full text-sm">
            <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
               <tr>
                  <th className="px-8 py-6 text-left">Employee</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-center">Check In</th>
                  <th className="px-8 py-6 text-center">Check Out</th>
                  <th className="px-8 py-6 text-left">Remarks</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {loading ? (
                  <tr><td colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500/20" /></td></tr>
               ) : employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                     <td className="px-8 py-6">
                        <div className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{emp.designation?.name || emp.role}</div>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex justify-center gap-2">
                           {['present', 'absent', 'on_leave', 'half_day'].map(s => (
                              <button 
                                 key={s}
                                 onClick={() => handleUpdate(emp.id, 'status', s)}
                                 className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all border ${
                                    attendanceData[emp.id]?.status === s 
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                 }`}
                              >
                                 {s.replace('_', ' ')}
                              </button>
                           ))}
                        </div>
                     </td>
                     <td className="px-8 py-6 text-center">
                        <input 
                           type="time" value={attendanceData[emp.id]?.check_in} onChange={e=>handleUpdate(emp.id, 'check_in', e.target.value)}
                           className="px-3 py-1.5 border-2 border-slate-50 rounded-lg font-mono font-bold text-slate-600 focus:border-blue-400 outline-none"
                        />
                     </td>
                     <td className="px-8 py-6 text-center">
                        <input 
                           type="time" value={attendanceData[emp.id]?.check_out} onChange={e=>handleUpdate(emp.id, 'check_out', e.target.value)}
                           className="px-3 py-1.5 border-2 border-slate-50 rounded-lg font-mono font-bold text-slate-600 focus:border-blue-400 outline-none"
                        />
                     </td>
                     <td className="px-8 py-6">
                        <input 
                           placeholder="Type notes..." value={attendanceData[emp.id]?.notes} onChange={e=>handleUpdate(emp.id, 'notes', e.target.value)}
                           className="w-full text-xs font-medium border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none bg-transparent py-1 transition-all"
                        />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
