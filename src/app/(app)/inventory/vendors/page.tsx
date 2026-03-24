"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  Truck, Plus, Phone, 
  Mail, ArrowLeft, Loader2, Landmark
} from "lucide-react";
import Link from "next/link";

export default function VendorListPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', bin_no: '' });

  const fetchVendors = () => {
    setLoading(true);
    api.get('/inventory/vendors').then(res => setVendors(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inventory/vendors', form);
      setShowAddModal(false);
      setForm({ name: '', contact_person: '', email: '', phone: '', address: '', bin_no: '' });
      fetchVendors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
           </Link>
           <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suppliers & Vendors</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Procurement Partners</p>
           </div>
        </div>
        <button onClick={() => setShowAddModal(true)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
          <Plus className="w-4 h-4"/> New Supplier
        </button>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-500 border-b">
            <tr>
              <th className="px-8 py-5 text-left">Supplier Info</th>
              <th className="px-8 py-5 text-left">Contact Person</th>
              <th className="px-8 py-5 text-left">Email & Phone</th>
              <th className="px-8 py-5 text-right">Tax ID (BIN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /></td></tr>
            ) : vendors.map(vendor => (
              <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                         <Truck className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-black text-slate-900 leading-tight">{vendor.name}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{vendor.address || 'No address'}</div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 font-bold text-slate-600">{vendor.contact_person || '—'}</td>
                <td className="px-8 py-5">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                         <Mail className="w-3 h-3" /> {vendor.email || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                         <Phone className="w-3 h-3" /> {vendor.phone || '—'}
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono text-[10px] font-black uppercase">
                      {vendor.bin_no || 'NOT SET'}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Register New Supplier</h2>
              <form onSubmit={handleCreate} className="grid grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Company Name</label>
                    <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-bold focus:border-emerald-500 outline-none transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Person</label>
                    <input value={form.contact_person} onChange={e=>setForm({...form, contact_person: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-bold focus:border-emerald-500 outline-none transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tax ID / BIN</label>
                    <input value={form.bin_no} onChange={e=>setForm({...form, bin_no: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-mono font-bold focus:border-emerald-500 outline-none transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
                    <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-bold focus:border-emerald-500 outline-none transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone Number</label>
                    <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})}
                      className="w-full h-12 border-2 rounded-xl px-4 font-bold focus:border-emerald-500 outline-none transition-all" />
                 </div>
                 <div className="col-span-2 text-right flex gap-3 pt-4">
                    <button type="button" onClick={()=>setShowAddModal(false)} className="flex-1 h-12 border-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 h-12 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-emerald-700 transition-all">Save Supplier</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
