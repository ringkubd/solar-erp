"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    company_name: "",
    phone: "",
    email: "",
    project_type: "solar",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leads", formData);
      router.push("/crm/leads");
    } catch (err) {
      console.error(err);
      alert("Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
        <p className="text-muted-foreground mt-1">Fill out the form below to add a new prospect.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" required value={formData.full_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name (Optional)</Label>
            <Input id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="space-y-2 col-span-1 md:col-span-2">
            <Label htmlFor="project_type">Project Type</Label>
            <select
              id="project_type"
              name="project_type"
              value={formData.project_type}
              onChange={handleChange}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="solar">Solar EPC</option>
              <option value="substation">Substation</option>
              <option value="electrical">Industrial Electrical</option>
              <option value="amc">Maintenance & AMC</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Lead'}</Button>
        </div>
      </form>
    </div>
  );
}
