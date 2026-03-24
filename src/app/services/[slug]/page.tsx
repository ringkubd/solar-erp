"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, CheckCircle2, ChevronRight, Zap, Plug, Server, CloudLightning, ArrowUpDown, Snowflake, RadioReceiver, Building2, Layers, ShieldCheck, Lightbulb, Microscope, Award, Wrench, Building } from "lucide-react";

const getIcon = (iconName: string, className: string) => {
    const icons: any = {
      'plug': <Plug className={className} />,
      'server': <Server className={className} />,
      'zap': <Zap className={className} />,
      'sun': <Zap className={className} />,
      'cloud-lightning': <CloudLightning className={className} />,
      'arrow-up-down': <ArrowUpDown className={className} />,
      'snowflake': <Snowflake className={className} />,
      'radio-receiver': <RadioReceiver className={className} />,
      'building-2': <Building2 className={className} />,
      'layers': <Layers className={className} />,
      'shield-check': <ShieldCheck className={className} />,
      'lightbulb': <Lightbulb className={className} />,
      'award': <Award className={className} />,
      'microscope': <Microscope className={className} />,
      'zap-fast': <Zap className={className} />,
      'wrench': <Wrench className={className} />,
      'building': <Building className={className} />
    };
    return icons[iconName] || <Zap className={className} />;
};

export default function ServiceDetail() {
    const params = useParams();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/website/services/${params.slug}`)
           .then(res => setService(res.data))
           .catch(() => setService(false))
           .finally(() => setLoading(false));
    }, [params.slug]);

    if (loading) return <div className="min-h-screen bg-[#07100d] flex items-center justify-center text-emerald-500 font-bold tracking-widest">LOADING...</div>;
    if (service === false) return <div className="min-h-screen bg-[#07100d] flex flex-col items-center justify-center text-emerald-500"><h1 className="text-4xl font-bold mb-4">404</h1><p>Service not found.</p><Link href="/#services" className="mt-8 text-white border-b border-emerald-500 pb-1 hover:text-emerald-400">Back Home</Link></div>;

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
                <Link href="/#why" className="text-emerald-400 font-semibold tracking-widest text-sm hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> All Services
                </Link>
            </nav>

            <article className="relative z-10 pt-36 pb-24 px-6 md:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl">
                         {getIcon(service.icon, "w-6 h-6")}
                         <span className="font-bold tracking-widest uppercase text-xs">Engineering Services</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">{service.title}</h1>
                    <p className="text-xl text-emerald-100/70 mb-12 font-light leading-relaxed">{service.description}</p>
                    
                    <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-p:text-emerald-100/80 prose-headings:text-white prose-li:text-emerald-100/80 prose-li:marker:text-emerald-500">
                        {service.detailed_content ? (
                            service.detailed_content.split('\n').map((paragraph: string, i: number) => (
                                <p key={i} className="mb-6 text-lg">{paragraph}</p>
                            ))
                        ) : (
                            <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl italic text-emerald-300/50 text-center">
                                Detailed content for this service is currently being updated by our engineering team. Contact us for specifics.
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Sidebar CTA */}
                <div className="relative">
                    <div className="sticky top-32 bg-gradient-to-b from-[#0d1f16] to-[#0a150e] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-[30px]"></div>
                        <h3 className="text-2xl font-bold text-white mb-4">Need {service.title}?</h3>
                        <p className="text-emerald-100/60 mb-8 font-light leading-relaxed text-sm">
                            Our dedicated engineering team is ready to analyze your requirements and provide a technical proposal.
                        </p>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-emerald-100/80"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> SREDA Approved Methods</div>
                            <div className="flex items-center gap-3 text-sm text-emerald-100/80"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Guaranteed ROI</div>
                            <div className="flex items-center gap-3 text-sm text-emerald-100/80"><CheckCircle2 className="w-5 h-5 text-emerald-500"/> Turnkey Handover</div>
                        </div>
                        <Link href="/#contact" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                            Request Consultation <ChevronRight className="w-4 h-4" />
                        </Link>
                        
                        <div className="mt-8 pt-8 border-t border-emerald-500/20 text-center">
                            <p className="text-xs text-emerald-300/40 uppercase tracking-widest font-bold mb-2">Direct Hotline</p>
                            <p className="text-lg text-emerald-400 font-mono tracking-wider">+880 1339 671631</p>
                        </div>
                    </div>
                </div>

            </article>
        </div>
    );
}
