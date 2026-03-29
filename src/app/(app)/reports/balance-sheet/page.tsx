"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BalanceSheetPage() {
  const [data, setData] = useState<any>(null);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchReport = (date: string) => {
    setLoading(true);
    api.get(`/reports/balance-sheet?as_of=${date}`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport(asOf);
  }, [asOf]);

  const renderSection = (title: string, items: any[], total: number) => (
    <div className="space-y-2">
      <h3 className="font-bold text-slate-900 border-b pb-1 uppercase text-sm tracking-widest">{title}</h3>
      <div className="space-y-1">
        {items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1 hover:bg-slate-50 px-1 rounded transition-colors group">
            <span className="text-slate-600 group-hover:text-slate-900">[{item.code}] {item.name}</span>
            <span className="font-mono">৳{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between font-black text-slate-900 pt-2 border-t-2 border-slate-900 bg-slate-100 p-2 rounded-lg">
        <span>TOTAL {title}</span>
        <span className="font-mono tracking-tighter text-lg">৳{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="bg-slate-900 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black tracking-tighter">BALANCE SHEET</h1>
              <p className="text-slate-400 text-sm mt-1 uppercase font-bold tracking-widest">Statement of Financial Position</p>
            </div>
            <div className="text-right">
              <label className="block text-[10px] text-slate-400 uppercase font-black mb-1">Fiscal Date</label>
              <Input 
                type="date" 
                value={asOf} 
                onChange={(e) => setAsOf(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white w-40 text-sm"
              />
            </div>
          </div>
        </div>

        <CardContent className="p-8 space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse font-bold text-sm">GATHERING BALANCES...</p>
            </div>
          ) : (
            <>
              {renderSection("ASSETS", data?.assets, data?.total_assets)}
              <div className="space-y-10">
                {renderSection("LIABILITIES", data?.liabilities, collectSum(data?.liabilities))}
                {renderSection("EQUITY", data?.equity, collectSum(data?.equity))}
              </div>

              <div className="flex justify-between items-center p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verification Status</span>
                   <span className="text-xl font-bold text-emerald-900">Total Liabilities & Equity</span>
                </div>
                <div className="text-3xl font-black text-emerald-700 font-mono tracking-tighter">
                  ৳{data?.total_liabilities_equity?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">Immutable Audit Trail Secured by SolarEdge Core v2.4</p>
    </div>
  );
}

function collectSum(arr: any[]) {
  return arr?.reduce((sum, item) => sum + item.amount, 0) || 0;
}
