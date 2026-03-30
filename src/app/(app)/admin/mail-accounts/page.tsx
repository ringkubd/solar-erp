"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2, Shield, Mail, Key, HardDrive, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function MailAccountManagement() {
  const [data, setData] = useState<any>({ accounts: [], unassigned_employees: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employee_id: "",
    email: "",
    password: "",
    quota_gb: "5"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/email/accounts");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post("/email/sync");
      fetchData();
    } catch (err) {
      alert("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/email/accounts", formData);
      setOpen(false);
      setFormData({ employee_id: "", email: "", password: "", quota_gb: "5" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create account");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this email account? This action cannot be undone.")) return;
    try {
      await api.delete(`/email/accounts/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">System Mail Service</h1>
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin Dashboard — Mail Account Registry</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSync} disabled={syncing} className="rounded-xl border-slate-200 dark:border-slate-800">
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sync Accounts
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button className="bg-slate-900 text-white hover:bg-blue-600 rounded-xl transition-all shadow-lg shadow-slate-200 dark:shadow-none">
                <Plus className="w-4 h-4 mr-2" /> Add Email
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Provision Mailbox</DialogTitle>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Create a new corporate email for an employee</p>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assign to Employee</Label>
                  <Select onValueChange={(v: any) => setFormData({...formData, employee_id: v})}>
                    <SelectTrigger className="rounded-xl border-2">
                      <SelectValue placeholder="Select an unassigned employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.unassigned_employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} ({emp.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                  <Input 
                    placeholder="name@ecopacpowertech.com" 
                    className="rounded-xl border-2"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Password</Label>
                  <Input 
                    type="password" 
                    className="rounded-xl border-2"
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quota Allocation (GB)</Label>
                  <Input 
                    type="number" 
                    className="rounded-xl border-2"
                    value={formData.quota_gb} 
                    onChange={e => setFormData({...formData, quota_gb: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-6 font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all">Provision Account</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-200/50 rounded-3xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <Mail className="w-24 h-24" />
             </div>
             <CardContent className="pt-8 flex flex-col gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <Mail className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Mailboxes</p>
                   <p className="text-5xl font-black tracking-tighter mt-1">{data.accounts.length}</p>
                </div>
             </CardContent>
          </Card>
          <Card className="bg-slate-900 text-white border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <Key className="w-24 h-24" />
             </div>
             <CardContent className="pt-8 flex flex-col gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md text-emerald-400">
                   <Key className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Provisioned Jobs</p>
                   <p className="text-5xl font-black tracking-tighter mt-1">{data.accounts.filter((a:any) => a.provision_job_id).length}</p>
                </div>
             </CardContent>
          </Card>
          <Card className="bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200/50 rounded-3xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <HardDrive className="w-24 h-24" />
             </div>
             <CardContent className="pt-8 flex flex-col gap-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <HardDrive className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Storage (GB)</p>
                   <p className="text-5xl font-black tracking-tighter mt-1">{data.accounts.reduce((acc:any, curr:any) => acc + Number(curr.quota_gb), 0).toFixed(1)}</p>
                </div>
             </CardContent>
          </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3 h-3" /> Assigned Email Accounts Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Employee</TableHead>
                <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Email Address</TableHead>
                <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Quota</TableHead>
                <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-50"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
              ) : data.accounts.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-50 font-bold text-slate-400 uppercase tracking-widest">No Provisioned Accounts Found</TableCell></TableRow>
              ) : data.accounts.map((acc: any) => (
                <TableRow key={acc.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-100 dark:border-slate-800">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                          <Shield className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-slate-900 dark:text-white">{acc.employee?.full_name}</p>
                          <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5">{acc.employee?.employee_id || 'EXTERNAL'}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                     <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                        {acc.email}
                     </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                     <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900 dark:text-white">{acc.quota_gb}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gigabytes</span>
                     </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border-2 shadow-sm ${acc.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {acc.is_active ? 'Online' : 'Restricted'}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl border-slate-200 hover:text-blue-600 hover:border-blue-200 transition-all">
                          <HardDrive className="w-4 h-4" />
                       </Button>
                       <Button variant="outline" size="icon" className="w-9 h-9 rounded-xl border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => handleDelete(acc.id)}>
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
