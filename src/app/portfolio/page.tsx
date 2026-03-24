"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, Briefcase, MapPin, Zap } from "lucide-react";

export default function PortfolioIndex() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/website/portfolio")
           .then(res => setProjects(res.data))
           .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#07100d] text-[#c8e6d4] selection:bg-emerald-500/30">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40" 
                style={{ backgroundImage: 'linear-gradient(rgba(29,185,84,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(29,185,84,0.18) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 bg-[#07100d]/90 backdrop-blur-md border-b border-emerald-500/20">
                <Link href="/" className="flex items-center gap-3 decoration-0">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.5)]">EP</div>
                    <div>
                        <div className="font-bold text-lg text-emerald-50 tracking-tight"><span className="text-emerald-500">ECO</span>PAC</div>
                        <div className="text-[10px] text-emerald-300/60 uppercase tracking-widest font-mono">Power and Technology</div>
                    </div>
                </Link>
                <Link href="/" className="text-emerald-400 font-semibold tracking-widest text-sm hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </nav>

            <section className="relative z-10 pt-36 pb-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-16 border-b border-emerald-500/20 pb-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                            <Briefcase className="w-3 h-3" /> Case Studies
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">Our <span className="text-emerald-500">Project Portfolio</span></h1>
                        <p className="text-emerald-100/60 text-lg">Real-world engineering solutions delivered across Bangladesh.</p>
                    </div>

                    {loading ? (
                        <div className="animate-pulse text-emerald-500 text-xl font-bold tracking-wider">Loading projects...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {projects.length === 0 && <p className="text-emerald-300/50 text-xl col-span-full">No projects published yet. Check back soon!</p>}
                            {projects.map((port: any) => (
                                <Link href={`/portfolio/${port.slug}`} key={port.id} className="block group h-full">
                                    <article className="bg-[#0d1f16] border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 hover:-translate-y-2 transition-all h-full flex flex-col relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Zap className="w-24 h-24 text-emerald-500" />
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-semibold mb-4 uppercase tracking-widest bg-emerald-500/10 w-fit px-2 py-1 rounded">
                                            {port.project_type}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{port.title}</h2>
                                        {port.client_name && <p className="text-emerald-100/40 text-sm font-medium mb-6">{port.client_name}</p>}
                                        
                                        <div className="mt-auto space-y-2 border-t border-emerald-500/10 pt-4">
                                           {port.capacity && <div className="flex items-center gap-2 text-sm text-emerald-200"><Zap className="w-4 h-4 text-emerald-500"/> <span className="font-mono font-bold">{port.capacity}</span></div>}
                                           {port.location && <div className="flex items-center gap-2 text-sm text-emerald-200"><MapPin className="w-4 h-4 text-emerald-500"/> <span>{port.location}</span></div>}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
