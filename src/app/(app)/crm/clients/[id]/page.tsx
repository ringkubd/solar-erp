"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function EditClientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    trade_license: "",
    tax_id: "",
    district: "",
    billing_address: "",
    site_address: "",
    is_active: true,
  });

  useEffect(() => {
    api.get(`/clients/${id}`).then(res => {
      setFormData({
        ...res.data,
        password: "", // Don't show hashed password
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert("Failed to load client");
      router.push("/crm/clients");
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/clients/${id}`, formData);
      alert("Client updated successfully");
      router.push("/crm/clients");
    } catch (err) {
      console.error(err);
      alert("Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/crm/clients" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update profile and portal access for this client.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input id="company_name" name="company_name" required value={formData.company_name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Portal Email *</Label>
            <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Reset Password (leave blank to keep current)</Label>
            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2 p-3 bg-slate-50 rounded-lg">
             <input 
                type="checkbox" 
                id="is_active" 
                name="is_active" 
                checked={formData.is_active} 
                onChange={handleChange}
                className="w-4 h-4 rounded text-blue-600"
             />
             <Label htmlFor="is_active" className="font-bold text-slate-700">Client Portal Active</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trade_license">Trade License No.</Label>
            <Input id="trade_license" name="trade_license" value={formData.trade_license || ""} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID / BIN</Label>
            <Input id="tax_id" name="tax_id" value={formData.tax_id || ""} onChange={handleChange} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="billing_address">Registered Billing Address</Label>
            <Textarea id="billing_address" name="billing_address" value={formData.billing_address || ""} onChange={handleChange} className="min-h-[80px]" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving} className="font-bold tracking-wide gap-2">
             <Save className="w-4 h-4" />
             {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
