"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

import { useAuth } from "@/lib/useAuth";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, guard, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-1 bg-emerald-500 rounded-full animate-pulse-slow shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-40 animate-pulse">Initializing Neural Interface</span>
      </div>
    </div>
  );

  const renderSidebarLinks = () => {
    if (guard === 'employee') {
      return (
        <>
          <Link href="/employee/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Dashboard
          </Link>
          <Link href="/employee/tasks" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            My Tasks
          </Link>
          <Link href="/employee/attendance" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Attendance
          </Link>
          <Link href="/employee/timesheets" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Timesheets
          </Link>
          <Link href="/mail" className="block px-3 py-2 mt-4 text-sm font-bold rounded-md text-blue-700 bg-blue-50 dark:bg-blue-950/30">
            Internal Webmail
          </Link>
        </>
      );
    }

    if (guard === 'client') {
      return (
        <>
          <Link href="/client/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Portal Overview
          </Link>
          <Link href="/client/projects" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            My Projects
          </Link>
          <Link href="/client/invoices" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Invoices & Payments
          </Link>
        </>
      );
    }

    // Default Admin (web) guard
    return (
      <>
        <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          Dashboard
        </Link>

        {/* CRM SECTION */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">CRM</div>
        <Link href="/crm/leads" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Leads</Link>
        <Link href="/crm/clients" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Clients</Link>
        <Link href="/inventory" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Inventory</Link>
        
        {/* OPERATIONS SECTION */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OPERATIONS</div>
        <Link href="/projects" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Projects</Link>
        <Link href="/inventory" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Inventory</Link>

        {/* FINANCE & HR SECTION */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINANCE & HR</div>
        <Link href="/invoices" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Invoices</Link>
        <Link href="/receipts" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Money Receipts</Link>
        <Link href="/hr/employees" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Employees (HR)</Link>
        <Link href="/reports/hub" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Financial Reports</Link>
        <Link href="/accounting" className="block px-3 py-2 mt-2 text-sm font-bold rounded-md text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">Accounting Hub</Link>
        <Link href="/mail" className="block px-3 py-2 mt-2 text-sm font-bold rounded-md text-blue-700 bg-blue-50 dark:bg-blue-950/30">Company Webmail</Link>

        {/* CMS SECTION */}
        <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System</div>
        <Link href="/cms" className="block px-3 py-2 text-sm font-medium rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 border border-transparent hover:border-emerald-500/20">Website CMS</Link>
      </>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <span className="text-emerald-600 mr-1">SOLAR</span> ERP
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {renderSidebarLinks()}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
              {user?.full_name || user?.company_name || 'System User'}
            </div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            <div className="mt-1"><span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase rounded text-slate-500">{guard}</span></div>
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white dark:bg-slate-900 shrink-0 shadow-sm">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            ERP Global Cloud — <span className="font-mono text-xs uppercase tracking-tighter opacity-70">Region: DHAKA-01</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
