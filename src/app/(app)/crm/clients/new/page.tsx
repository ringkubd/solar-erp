"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    trade_license: "",
    tax_id: "",
    district: "",
    billing_address: "",
    site_address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/clients", formData);
      router.push("/crm/clients");
    } catch (err) {
      console.error(err);
      alert("Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/crm/clients" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboard Client</h1>
          <p className="text-muted-foreground mt-1 text-sm">Convert a lead into an official corporate client entity.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" name="company_name" required value={formData.company_name} onChange={handleChange} placeholder="EcoPac Power and Technology Ltd." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trade_license">Trade License No.</Label>
            <Input id="trade_license" name="trade_license" value={formData.trade_license} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / BIN</Label>
            <Input id="tax_id" name="tax_id" value={formData.tax_id} onChange={handleChange} />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="district">District / City</Label>
            <Input id="district" name="district" value={formData.district} onChange={handleChange} placeholder="Dhaka" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="billing_address">Registered Billing Address</Label>
            <Textarea id="billing_address" name="billing_address" value={formData.billing_address} onChange={handleChange} className="min-h-[80px]" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="site_address">Default Site Address</Label>
            <Textarea id="site_address" name="site_address" value={formData.site_address} onChange={handleChange} className="min-h-[80px]" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="font-bold tracking-wide">
             {loading ? 'Creating Client...' : 'Create Client Entity'}
          </Button>
        </div>
      </form>
    </div>
  );
}
