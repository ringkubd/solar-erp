"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/register", formData);
      const { token, user } = res.data;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("guard", "client");
      }
      
      router.push("/client/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <span className="text-emerald-600 font-black">SOLAR</span> EPC
          </h2>
          <p className="mt-2 text-sm text-slate-500 italic">Client Onboarding</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 animate-fade-in">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="company_name" className="text-slate-600 dark:text-slate-400 font-medium">Company Name</Label>
              <Input
                id="company_name"
                required
                className="rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Solar Solutions Ltd."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-600 dark:text-slate-400 font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                className="rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-600 dark:text-slate-400 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                className="rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation" className="text-slate-600 dark:text-slate-400 font-medium">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                required
                className="rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all transform active:scale-95" disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </Button>
          
          <p className="text-center text-xs text-slate-500 mt-4">
            Already have an account? <a href="/login" className="text-emerald-600 font-bold hover:underline">Login here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
