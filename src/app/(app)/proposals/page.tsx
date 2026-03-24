"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProposalsPage() {
  const router = useRouter();

  useEffect(() => {
     router.replace("/crm/proposals");
  }, [router]);

  return <div className="p-8 text-center text-slate-500">Redirecting to advanced Deal Flow Hub...</div>;
}
