"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  DollarSign, Calculator, User, CheckCircle2, 
  AlertCircle, Search, Filter, Loader2, ArrowRight,
  Download, History, ShieldCheck, TrendingUp
} from "lucide-react";

export default function PayrollPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [run, setRun] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const [payrolls, setPayrolls] = useState<any[]>([]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const [empRes, payrollRes] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/payroll', { params: { month: run.month, year: run.year } })
      ]);
      setEmployees(empRes.data.data);
      setPayrolls(payrollRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonthlyData(); }, [run.month, run.year]);

  const runPayroll = async (empId: number) => {
    setProcessing(true);
    try {
      await api.post('/payroll', {
        employee_id: empId,
        ...run
      });
      fetchMonthlyData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to process payroll.");
    } finally {
      setProcessing(false);
    }
  };

  const bulkProcess = async () => {
    if (!confirm(`Process payroll for ALL employees for ${run.month}/${run.year}?`)) return;
    setProcessing(true);
    try {
      const res = await api.post('/payroll/bulk', run);
      alert(`Successfully processed ${res.data.count} payrolls.`);
      fetchMonthlyData();
    } catch (err: any) {
      alert("Failed to run bulk payroll.");
    } finally {
      setProcessing(false);
    }
  };

  const markPaid = async (payrollId: number) => {
    if (!confirm("Confirm salary disbursement? This will record a cash/bank transaction.")) return;
    setProcessing(true);
    try {
      await api.post(`/payroll/${payrollId}/pay`);
      fetchMonthlyData();
    } catch (err: any) {
      alert("Disbursement failed.");
    } finally {
      setProcessing(false);
    }
  };

  const totalExp = payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <DollarSign className="w-8 h-8 text-amber-500" /> Salary Generation
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest text-[10px]">Monthly payroll processing & accounting integration</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex gap-2">
              <select value={run.month} onChange={e=>setRun({...run, month: parseInt(e.target.value)})}
                 className="px-6 py-3 border-2 border-slate-100 rounded-2xl font-black text-xs text-slate-700 outline-none focus:border-amber-500 transition-all">
                 {[1,2,3,4,5,6,7,8,9,10,11,12].map(m=>(<option key={m} value={m}>{new Date(0, m-1).toLocaleString('default', { month: 'long' })}</option>))}
              </select>
              <select value={run.year} onChange={e=>setRun({...run, year: parseInt(e.target.value)})}
                 className="px-6 py-3 border-2 border-slate-100 rounded-2xl font-black text-xs text-slate-700 outline-none focus:border-amber-500 transition-all">
                 {[2024, 2025, 2026].map(y=>(<option key={y} value={y}>{y}</option>))}
              </select>
           </div>
            <button 
              disabled={processing}
              onClick={bulkProcess}
              className="px-8 py-3 bg-amber-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50">
              {processing ? "Processing..." : "Bulk Process All"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3">
            <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm overflow-hidden animate-in fade-in duration-500">
               <table className="w-full text-sm">
                  <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                     <tr>
                        <th className="px-8 py-6 text-left">Personnel</th>
                        <th className="px-8 py-6 text-left">Base Structure</th>
                        <th className="px-8 py-6 text-center">Status</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                        <tr><td colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500/20" /></td></tr>
                     ) : employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-300">{emp.first_name[0]}{emp.last_name[0]}</div>
                                 <div>
                                    <div className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{emp.designation?.name || emp.role}</div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="font-mono font-bold text-slate-700">{emp.salary} BDT</div>
                              <div className="text-[9px] font-black text-slate-300 uppercase">Monthly Fixed</div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {(() => {
                                 const p = payrolls.find(x => x.employee_id === emp.id);
                                 if (!p) return <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">Unprocessed</span>;
                                 if (p.status === 'paid') return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">Paid</span>;
                                 return <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase tracking-widest">Processed</span>;
                              })()}
                           </td>
                           <td className="px-8 py-6 text-right">
                              {(() => {
                                 const p = payrolls.find(x => x.employee_id === emp.id);
                                 if (!p) return (
                                    <button onClick={() => runPayroll(emp.id)} disabled={processing}
                                       className="px-6 py-2 bg-slate-900 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 ml-auto disabled:opacity-50">
                                       <Calculator className="w-3.5 h-3.5"/> Process
                                    </button>
                                 );
                                 if (p.status === 'processed') return (
                                    <button onClick={() => markPaid(p.id)} disabled={processing}
                                       className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 ml-auto disabled:opacity-50">
                                       <DollarSign className="w-3.5 h-3.5"/> Disburse
                                    </button>
                                 );
                                 return <div className="text-[10px] font-black text-slate-400 uppercase">Settled</div>;
                              })()}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="lg:col-span-1 space-y-8">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 bg-amber-500 rounded-xl"><ShieldCheck className="w-5 h-5 text-white"/></div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Payroll Integrity</h3>
                </div>
                <div className="space-y-6">
                   <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Expenditure</div>
                      <div className="text-3xl font-black font-mono tracking-tighter">{totalExp.toLocaleString()} BDT</div>
                   </div>
                   <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-400">Total Staff</span>
                         <span className="font-black text-slate-200">{employees.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-400">Tax Deductions</span>
                         <span className="font-black text-slate-200">0%</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between">
                   System Health <TrendingUp className="w-4 h-4 text-emerald-500" />
                </h3>
                <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"Salary processing automatically triggers double-entry bookkeeping in the Finance Ledger (Codes 5210 and 2110)."</p>
             </div>
         </div>
      </div>
    </div>
  );
}
