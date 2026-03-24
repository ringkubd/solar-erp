"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin, Zap } from "lucide-react";

export default function PortfolioDetail() {
    const params = useParams();
    const [port, setPort] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/website/portfolio/${params.slug}`)
           .then(res => setPort(res.data))
           .catch(() => setPort(false))
           .finally(() => setLoading(false));
    }, [params.slug]);

    if (loading) return <div className="min-h-screen bg-[#07100d] flex items-center justify-center text-emerald-500 font-bold tracking-widest">LOADING...</div>;
    if (port === false) return <div className="min-h-screen bg-[#07100d] flex flex-col items-center justify-center text-emerald-500"><h1 className="text-4xl font-bold mb-4">404</h1><p>Project not found.</p><Link href="/portfolio" className="mt-8 text-white border-b border-emerald-500 pb-1 hover:text-emerald-400">Back to Portfolio</Link></div>;

    return (
        <div className="min-h-screen bg-[#07100d] text-[#c8e6d4] font-sans selection:bg-emerald-500/30">
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 bg-[#07100d]/90 backdrop-blur-md border-b border-emerald-500/20">
                <Link href="/" className="flex items-center gap-3 decoration-0">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.5)]">EP</div>
                    <div>
                        <div className="font-bold text-lg text-emerald-50 tracking-tight"><span className="text-emerald-500">ECO</span>PAC</div>
                        <div className="text-[10px] text-emerald-300/60 uppercase tracking-widest font-mono">Power and Technology</div>
                    </div>
                </Link>
                <Link href="/portfolio" className="text-emerald-400 font-semibold tracking-widest text-sm hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> All Projects
                </Link>
            </nav>

            <article className="relative z-10 pt-36 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                       <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full">
                           {port.project_type}
                       </span>
                       {port.completion_date && (
                           <span className="text-emerald-300/50 text-sm font-mono tracking-widest uppercase border-l border-emerald-500/20 pl-4">
                               Completed: {new Date(port.completion_date).toLocaleDateString()}
                           </span>
                       )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">{port.title}</h1>
                    {port.client_name && <p className="text-xl text-emerald-300/60 mb-12 border-b border-emerald-500/20 pb-8">Client: <span className="text-emerald-400 font-semibold">{port.client_name}</span></p>}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-[#0d1f16] p-6 rounded-2xl border border-emerald-500/20">
                           <div className="text-emerald-500 mb-2"><Zap className="w-6 h-6"/></div>
                           <h4 className="text-emerald-100/50 text-xs uppercase tracking-widest font-bold mb-1">Capacity / Size</h4>
                           <p className="text-white font-mono font-bold text-lg">{port.capacity || 'N/A'}</p>
                        </div>
                        <div className="bg-[#0d1f16] p-6 rounded-2xl border border-emerald-500/20">
                           <div className="text-emerald-500 mb-2"><MapPin className="w-6 h-6"/></div>
                           <h4 className="text-emerald-100/50 text-xs uppercase tracking-widest font-bold mb-1">Location</h4>
                           <p className="text-white text-lg">{port.location || 'N/A'}</p>
                        </div>
                        <div className="bg-[#0d1f16] p-6 rounded-2xl border border-emerald-500/20 flex flex-col justify-center items-start">
                           <Link href="/#contact" className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-2 group">
                               Discuss Similar Project <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                    </div>
                    
                    <div className="space-y-16">
                        {port.challenge_description && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-sm font-black border border-red-500/20">01</span> 
                                    The Challenge
                                </h2>
                                <p className="text-lg text-emerald-100/70 leading-relaxed font-light whitespace-pre-line px-11">
                                    {port.challenge_description}
                                </p>
                            </div>
                        )}
                        
                        {port.solution_description && (
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-black border border-emerald-500/20"><CheckCircle2 className="w-4 h-4"/></span> 
                                    Our Solution
                                </h2>
                                <div className="p-8 bg-gradient-to-br from-[#0d1f16] to-[#0a150e] border border-emerald-500/30 rounded-3xl ml-11">
                                    <p className="text-lg text-emerald-100/90 leading-relaxed font-light whitespace-pre-line">
                                        {port.solution_description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
}
