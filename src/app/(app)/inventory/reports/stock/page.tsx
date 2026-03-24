"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  BarChart3, Download, Filter, 
  Loader2, ArrowLeft, Package, 
  Warehouse as WarehouseIcon, Search,
  Briefcase
} from "lucide-react";
import Link from "next/link";

export default function StockReportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/inventory/items'),
      api.get('/inventory/warehouses')
    ]).then(([iRes, wRes]) => {
      setItems(iRes.data);
      setWarehouses(wRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    
    if (filterWarehouse) {
      const whStock = item.warehouse_breakdown?.find((w: any) => w.name === filterWarehouse);
      return matchesSearch && (whStock && whStock.qty > 0);
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/inventory" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stock Valuation Report</h1>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Institutional Inventory Overview</p>
            </div>
         </div>
         <div className="flex gap-2">
            <Link href="/inventory/reports/projects">
               <button className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Project Usage
               </button>
            </Link>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg hover:bg-slate-800 transition-all">
               <Download className="w-4 h-4" /> Export PDF
            </button>
         </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
         <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
               placeholder="Filter by material name or SKU..." 
               value={search}
               onChange={e => setSearch(e.target.value)}
               className="w-full h-12 bg-slate-50 border-2 border-transparent rounded-xl pl-12 pr-4 font-bold focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden md:block" />
            <select 
               value={filterWarehouse}
               onChange={e => setFilterWarehouse(e.target.value)}
               className="h-12 bg-slate-50 border-2 border-transparent rounded-xl px-4 font-bold focus:bg-white focus:border-slate-900 outline-none transition-all w-full md:w-48"
            >
               <option value="">All Warehouses</option>
               {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
         </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-500 border-b">
            <tr>
              <th className="px-8 py-5 text-left">Item Details</th>
              <th className="px-8 py-5 text-center">Batch Cost (Avg)</th>
              <th className="px-8 py-5 text-center">In Stock</th>
              <th className="px-8 py-5 text-center">Warehouse Distribution</th>
              <th className="px-8 py-5 text-right">Total Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" /></td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No matching records found.</td></tr>
            ) : filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                         <Package className="w-5 h-5" />
                      </div>
                      <div>
                         <div className="font-black text-slate-900 leading-tight">{item.name}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.sku} • {item.brand || 'No Brand'}</div>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 text-center font-mono font-bold text-slate-600">
                   ৳{item.avg_cost?.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-center">
                   <div className="font-black text-slate-900">{item.current_stock} <span className="text-[10px] font-bold text-slate-400">{item.unit}</span></div>
                   {item.is_low && (
                      <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-1 rounded animate-pulse">Low Stock</span>
                   )}
                </td>
                <td className="px-8 py-5">
                   <div className="flex flex-wrap gap-1 justify-center">
                      {item.warehouse_breakdown?.map((w: any) => (
                        <span key={w.name} className="px-2 py-0.5 bg-slate-100 text-[8px] font-black uppercase text-slate-500 rounded border">
                           {w.name}: {w.qty}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-8 py-5 text-right">
                   <div className="font-mono font-black text-slate-900">৳{item.total_value?.toLocaleString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
          {!loading && filteredItems.length > 0 && (
             <tfoot className="bg-slate-900 text-white font-black">
                <tr>
                   <td className="px-8 py-6 text-left text-xs uppercase tracking-widest">Total Portfolio Value</td>
                   <td colSpan={3}></td>
                   <td className="px-8 py-6 text-right font-mono text-xl text-emerald-400">
                      ৳{filteredItems.reduce((sum, it) => sum + (it.total_value || 0), 0).toLocaleString()}
                   </td>
                </tr>
             </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
