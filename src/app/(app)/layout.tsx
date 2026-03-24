"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  if (!mounted) return null; // Avoid hydration mismatch
  
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <span className="text-emerald-600 mr-1">ECO</span>PAC ERP
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Dashboard
          </Link>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            CRM
          </div>
          <Link href="/crm/leads" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Leads
          </Link>
          <Link href="/crm/clients" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Clients
          </Link>
          <Link href="/inventory" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Inventory
          </Link>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Operations
          </div>
          <Link href="/projects" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Projects
          </Link>
          <Link href="/inventory" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Inventory
          </Link>
          
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Finance & HR
          </div>
          <Link href="/invoices" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Invoices
          </Link>
          <Link href="/receipts" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Money Receipts
          </Link>
          <Link href="/hr/employees" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Employees (HR)
          </Link>
          <Link href="/reports/hub" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            Financial Reports
          </Link>
          <Link href="/accounting" className="block px-3 py-2 mt-2 text-sm font-bold rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40">
            Accounting Hub
          </Link>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
             <Link href="/cms" className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
               Website CMS
             </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin User</div>
            <div className="text-xs text-slate-500">admin@ecopac.com</div>
          </div>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white dark:bg-slate-900 shrink-0">
          <div className="text-sm text-slate-500">
            Connected to <strong>SolarEdge API V1</strong>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
