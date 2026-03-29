"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/client/dashboard")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mt-20"></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{data?.client?.company_name}</h1>
          <p className="text-slate-500">Welcome to your Solar EPC Portal</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outstanding Balance</div>
          <div className="text-3xl font-black text-red-600">৳{data?.outstanding_balance?.toLocaleString()}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data?.project_count || 0}</div>
            <p className="text-xs text-slate-500 mt-2">Overseen by SolarEdge Engineering Team</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle>Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">৳{data?.total_invoiced?.toLocaleString() || 0}</div>
            <p className="text-xs text-slate-500 mt-2">Cumulative billing for all project phases</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data?.projects?.map((p: any) => (
              <div key={p.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-700">{p.name}</div>
                  <div className="text-sm font-bold text-emerald-600">{p.progress}%</div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span>Status: {p.status}</span>
                  <span>Last Update: {new Date(p.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
