"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Shield, Sun, Building, ChevronRight, CheckCircle2, PhoneCall, Plug, Server, CloudLightning, ArrowUpDown, Snowflake, RadioReceiver, Building2, Layers, ShieldCheck, Lightbulb, Microscope, Award, Wrench } from "lucide-react";
import api from "@/lib/api";

const getIcon = (iconName: string, className: string) => {
  const icons: any = {
    'plug': <Plug className={className} />,
    'server': <Server className={className} />,
    'zap': <Zap className={className} />,
    'sun': <Sun className={className} />,
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

export default function LandingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [content, setContent] = useState({ products: [], brands: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({
    full_name: "",  phone: "", email: "", 
    company_name: "", project_type: "solar", notes: "",
    monthly_bill: "", roof_size: "", capacity: ""
  });

  useEffect(() => {
    api.get('/website/content')
      .then(res => setContent(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", formData);
      setSuccess(true);
      setFormData({ full_name: "", phone: "", email: "", company_name: "", project_type: "solar", notes: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07100d] text-[#c8e6d4] font-sans overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40" 
           style={{ backgroundImage: 'linear-gradient(rgba(29,185,84,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(29,185,84,0.18) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 bg-[#07100d]/90 backdrop-blur-md border-b border-emerald-500/20">
        <Link href="/" className="flex items-center gap-3 decoration-0">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.5)]">EP</div>
          <div>
            <div className="font-bold text-lg text-emerald-50 tracking-tight"><span className="text-emerald-500">ECO</span>PAC</div>
            <div className="text-[10px] text-emerald-300/60 uppercase tracking-widest font-mono">Power and Technology</div>
          </div>
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <a href="/#about" className="text-emerald-300/80 hover:text-emerald-400 text-sm font-semibold tracking-wide transition-colors">ABOUT</a>
          <a href="/#products" className="text-emerald-300/80 hover:text-emerald-400 text-sm font-semibold tracking-wide transition-colors">PRODUCTS</a>
          <Link href="/portfolio" className="text-emerald-300/80 hover:text-emerald-400 text-sm font-semibold tracking-wide transition-colors">PORTFOLIO</Link>
          <a href="/#contact" className="text-emerald-300/80 hover:text-emerald-400 text-sm font-semibold tracking-wide transition-colors">CONTACT</a>
          <div className="h-4 w-px bg-emerald-500/20 mx-2"></div>
          <Link href="/blog" className="text-emerald-300/80 hover:text-emerald-400 text-sm font-semibold tracking-wide transition-colors">BLOG</Link>
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-bold tracking-wide transition-colors ml-4 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">CLIENT LOGIN</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[95vh] flex items-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-green-700/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span> SREDA Approved · Bangladesh
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            <span className="text-emerald-500">Powering</span> a<br/>
            <span className="bg-gradient-to-r from-emerald-50 to-emerald-400 bg-clip-text text-transparent">Sustainable Future</span>
          </h1>
          <p className="text-lg text-emerald-100/70 max-w-xl mb-10 leading-relaxed font-light">
            Bangladesh's trusted engineering partner for transformers, solar systems, diesel generators, switchgear, lightning protection, elevators & industrial electrical solutions.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#products" className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-all shadow-[0_0_24px_rgba(16,185,129,0.4)] flex items-center gap-2">
              <Zap className="w-4 h-4" /> Explore Products
            </a>
            <a href="#contact" className="px-8 py-3.5 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 font-bold rounded-lg transition-all flex items-center gap-2">
              Get a Quote <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Standards Bar */}
      <div className="relative z-10 bg-[#0d1f16] border-y border-emerald-500/20 py-8 px-6 md:px-12 flex flex-wrap justify-center items-center gap-4">
        <span className="text-emerald-300/60 font-semibold text-sm uppercase tracking-widest mr-4">Standards Compliance</span>
        {['IEC 60076', 'BDS 1081', 'ANSI', 'IEC 62271', 'IEC 62305', 'NFPA 780', 'IEC 60529', 'UL 857', 'SREDA', 'ACCORD'].map(std =>(
          <span key={std} className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold font-mono">{std}</span>
        ))}
      </div>

      {/* About Section */}
      <section id="about" className="relative z-10 bg-[#0a150e] py-24 px-6 md:px-12 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">About ECOPAC</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Your Complete<br/><span className="text-emerald-500">Power Solutions</span> Partner</h2>
            <p className="text-emerald-100/70 text-lg mb-6 leading-relaxed font-light">ECOPAC Power and Technology is a leading supplier and engineering service provider based in Bangladesh, delivering complete power and energy solutions for industrial, commercial, and residential sectors across the country.</p>
            <p className="text-emerald-100/70 text-lg mb-8 leading-relaxed font-light">From high-voltage distribution transformers to SREDA-approved solar systems, from precision diesel generators to intelligent Building Management Systems — we are your single-window partner for all electrical and power infrastructure needs.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#0d1f16] border border-emerald-500/20 rounded-xl hover:border-emerald-500/50 transition-colors">
                <div className="text-xl mb-2 text-emerald-500"><Zap className="w-5 h-5"/></div>
                <h4 className="font-bold text-white text-sm mb-1">Full Electrical Range</h4>
                <p className="text-emerald-100/50 text-xs">From LT panels to 33kV transformers</p>
              </div>
              <div className="p-4 bg-[#0d1f16] border border-emerald-500/20 rounded-xl hover:border-emerald-500/50 transition-colors">
                <div className="text-xl mb-2 text-emerald-500"><Sun className="w-5 h-5"/></div>
                <h4 className="font-bold text-white text-sm mb-1">SREDA Approved Solar</h4>
                <p className="text-emerald-100/50 text-xs">On-grid, off-grid & hybrid systems</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 h-fit">
            {[
              { icon: '🏭', title: 'Testing Laboratory' },
              { icon: '✅', title: 'BII Quality Control' },
              { icon: '📋', title: 'ACCORD Alliance' },
              { icon: '🇧🇩', title: 'Bangladesh SREDA' },
              { icon: '⚙️', title: 'IEC / BDS Certified' },
              { icon: '🌱', title: 'Green Energy Focus' }
            ].map((cert, i) => (
              <div key={i} className="p-6 bg-[#0d1f16] border border-emerald-500/20 rounded-xl text-center hover:bg-[#102319] hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="text-4xl mb-3">{cert.icon}</div>
                <h4 className="font-bold text-white text-sm">{cert.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products Grid */}
      <section id="products" className="relative z-10 bg-[#07100d] py-24 px-6 md:px-12 border-t border-emerald-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">Product Portfolio</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Complete Range of <span className="text-emerald-500">Power Equipment</span></h2>
            <p className="text-emerald-100/60 text-lg max-w-2xl font-light">End-to-end electrical and power solutions — from generation to distribution, protection to management.</p>
          </div>

          {loading ? (
             <div className="text-emerald-500 animate-pulse text-xl">Loading Products...</div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.products.map((p: any) => (
                  <div key={p.id} className="bg-[#0d1f16] border border-emerald-500/20 rounded-2xl overflow-hidden hover:border-emerald-500/60 hover:-translate-y-1 transition-all group">
                    <div className="h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                    <div className="p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                          {getIcon(p.icon, "w-8 h-8")}
                        </div>
                        <div>
                          <div className="text-xs text-emerald-500 tracking-widest uppercase font-bold mb-1">{p.category}</div>
                          <h3 className="text-xl font-bold text-white leading-tight">{p.title}</h3>
                        </div>
                      </div>
                      <p className="text-emerald-100/60 text-sm leading-relaxed mb-6 h-20 overflow-hidden line-clamp-3">{p.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {p.specs?.map((s: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 rounded-full text-[10px] uppercase tracking-wider text-emerald-300 font-bold">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      </section>

      {/* Dynamic Brands Showcase */}
      <section id="brands" className="relative z-10 bg-[#0a150e] py-24 px-6 md:px-12 border-t border-emerald-500/20">
        <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">Our Partners</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Trusted <span className="text-emerald-500">Global Brands</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-16">
               {content.brands.map((b: any) => (
                  <div key={b.id} className="bg-[#0d1f16] border border-emerald-500/20 rounded-xl p-6 hover:bg-[#102319] hover:border-emerald-500/50 transition-all text-center flex flex-col justify-center">
                    <h4 className="font-extrabold text-xl text-white mb-1" style={{color: b.color || '#fff'}}>{b.name}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-emerald-100/40">{b.description}</span>
                  </div>
               ))}
            </div>
        </div>
      </section>

      {/* Dynamic Services / Why Us */}
      <section id="why" className="relative z-10 bg-[#0f2218] py-24 px-6 md:px-12 border-t border-emerald-500/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">The <span className="text-emerald-500">ECOPAC</span> Advantage</h2>
            <p className="text-emerald-100/60 text-lg max-w-2xl font-light">From product supply to engineering consultation, we deliver end-to-end value on every project.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {content.services.map((s: any, idx) => (
               <Link href={`/services/${s.slug}`} key={s.id} className="block group">
                 <div className="p-8 bg-[#0d1f16] border border-emerald-500/20 rounded-2xl hover:border-emerald-500/60 hover:-translate-y-2 transition-all h-full relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      {getIcon(s.icon, "w-32 h-32")}
                   </div>
                   <div className="font-mono text-emerald-500/50 font-black text-xl mb-4">0{idx+1}</div>
                   <div className="text-emerald-400 mb-6">{getIcon(s.icon, "w-10 h-10")}</div>
                   <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{s.title}</h3>
                   <p className="text-emerald-100/60 text-sm leading-relaxed mb-6">{s.description}</p>
                   <div className="text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                     Explore Service <ChevronRight className="w-4 h-4" />
                   </div>
                 </div>
               </Link>
             ))}
          </div>
        </div>
      </section>

      {/* Smart Lead & ROI Calculator Section */}
      <section id="contact" className="relative z-10 py-24 px-6 md:px-12 border-t border-emerald-500/20 bg-gradient-to-b from-[#07100d] to-[#0a150e]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">Engineering Consultation</div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">Request Your <br/><span className="text-emerald-500">Technical Quote</span></h2>
            <p className="text-emerald-100/60 font-light mb-12 text-lg">Provide your basic engineering requirements. Our technical team will analyze your load and respond with a preliminary design and commercial estimate.</p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0d1f16] border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg"><PhoneCall className="w-6 h-6"/></div>
                <div><div className="text-sm uppercase tracking-widest text-emerald-100/40 font-bold mb-1">Direct Hotline</div><div className="text-2xl font-mono font-medium text-white tracking-wider">+880 1339 671631</div></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#0d1f16] border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg"><Building className="w-6 h-6"/></div>
                <div><div className="text-sm uppercase tracking-widest text-emerald-100/40 font-bold mb-1">Corporate Office</div><div className="text-emerald-50">Dhaka, Bangladesh</div></div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-[#0d1f16] border border-emerald-500/20 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Zap className="w-64 h-64" /></div>
              
              {success ? (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Request Logged</h3>
                  <p className="text-emerald-100/60 text-lg">Our engineering team has received your specifications and will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                   // Inject Smart calculations into notes before submitting
                   let finalNotes = formData.notes;
                   if (formData.project_type === 'solar') {
                      const estimatedKw = Math.round((parseInt(formData.monthly_bill || '0') / 15) / 120);
                      finalNotes += `\n[SMART LEAD CALC: Monthly Bill: ${formData.monthly_bill} BDT | Roof Size: ${formData.roof_size} sq.ft | Estimated Req: ${estimatedKw} kW]`;
                   } else if (formData.project_type === 'substation') {
                      finalNotes += `\n[SMART LEAD CALC: Required Capacity: ${formData.capacity} kVA]`;
                   }
                   
                   e.preventDefault();
                   setSubmitting(true);
                   api.post("/contact", { ...formData, notes: finalNotes })
                      .then(() => setSuccess(true))
                      .catch(err => alert(err.response?.data?.message || "Submit failed."))
                      .finally(() => setSubmitting(false));
                }} className="space-y-8 relative z-10">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Company Name *</label>
                      <input type="text" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-4 text-white hover:border-emerald-500/50 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Acme Industries Ltd." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Contact Person *</label>
                      <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-4 text-white hover:border-emerald-500/50 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Direct Phone *</label>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-4 text-white hover:border-emerald-500/50 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="+880 1..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-4 text-white hover:border-emerald-500/50 focus:outline-none focus:border-emerald-500 transition-colors" placeholder="name@company.com" />
                    </div>
                  </div>

                  <div className="border-t border-emerald-500/20 pt-8 mt-8">
                      <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">Select Engineering Requirement</label>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                         {[
                            {id: 'solar', label: 'Solar PV', icon: <Zap className="w-5 h-5 mb-2 mx-auto"/>},
                            {id: 'substation', label: 'Substation', icon: <Server className="w-5 h-5 mb-2 mx-auto"/>},
                            {id: 'electrical', label: 'Electrical', icon: <Plug className="w-5 h-5 mb-2 mx-auto"/>}
                         ].map(type => (
                             <div key={type.id} onClick={() => setFormData({...formData, project_type: type.id})} className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${formData.project_type === type.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-[#102319]/50 border-emerald-500/10 text-emerald-100/50 hover:bg-[#102319]'}`}>
                                {type.icon}
                                <span className="text-xs uppercase tracking-wider">{type.label}</span>
                             </div>
                         ))}
                      </div>

                      {/* Dynamic Smart Forms based on Project Type */}
                      {formData.project_type === 'solar' && (
                         <div className="bg-[#0f2a1b] border border-emerald-500/30 rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                            <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><ArrowUpDown className="w-4 h-4"/> Solar Pre-Assessment</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                               <div>
                                  <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Avg. Monthly Bill (BDT)</label>
                                  <input type="number" required value={formData.monthly_bill || ''} onChange={e => setFormData({...formData, monthly_bill: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="100000" />
                               </div>
                               <div>
                                  <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Available Roof Space (sq.ft)</label>
                                  <input type="number" required value={formData.roof_size || ''} onChange={e => setFormData({...formData, roof_size: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="5000" />
                               </div>
                            </div>
                            
                            {/* Live ROI Calculator */}
                            {(parseInt(formData.monthly_bill || '0') > 0) && (
                               <div className="bg-[#0a150e] rounded-xl p-4 border border-emerald-500/20 flex flex-wrap justify-between items-center mt-4">
                                  <div>
                                     <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Estimated System Size Requirement</div>
                                     <div className="text-2xl font-mono text-white font-bold">{Math.round((parseInt(formData.monthly_bill || '0') / 15) / 120)} kW</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-1">Estimated ROI Period</div>
                                     <div className="text-2xl font-mono text-white font-bold">~ 3.5 Years</div>
                                  </div>
                               </div>
                            )}
                         </div>
                      )}

                      {formData.project_type === 'substation' && (
                         <div className="bg-[#0f2a1b] border border-emerald-500/30 rounded-2xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
                            <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><Server className="w-4 h-4"/> Substation Specifications</h4>
                            <div>
                               <label className="block text-xs font-bold text-emerald-100/50 uppercase tracking-widest mb-2">Required Capacity (kVA)</label>
                               <input type="text" required value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-[#102319]/80 border border-emerald-500/20 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. 1250 kVA" />
                            </div>
                         </div>
                      )}
                  </div>

                  <button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-5 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all uppercase tracking-widest mt-8 text-sm">
                    {submitting ? 'Analyzing & Sending...' : 'Submit Engineering Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
