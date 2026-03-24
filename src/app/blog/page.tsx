"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/website/posts")
           .then(res => setPosts(res.data))
           .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#07100d] text-[#c8e6d4] selection:bg-emerald-500/30">
            {/* Background Grid Pattern */}
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
                <div className="max-w-4xl mx-auto">
                    <div className="mb-16 border-b border-emerald-500/20 pb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                            <BookOpen className="w-3 h-3" /> Knowledge Base
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">Our <span className="text-emerald-500">Blog</span></h1>
                        <p className="text-emerald-100/60 text-lg">Insights on solar energy, power distribution, and SREDA regulations.</p>
                    </div>

                    {loading ? (
                        <div className="animate-pulse text-emerald-500 text-xl font-bold tracking-wider">Loading articles...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {posts.length === 0 && <p className="text-emerald-300/50 text-xl">No articles published yet. Check back soon!</p>}
                            {posts.map((post: any) => (
                                <Link href={`/blog/${post.slug}`} key={post.id} className="block group">
                                    <article className="bg-[#0d1f16] border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 hover:-translate-y-1 transition-all">
                                        <div className="flex items-center gap-2 text-emerald-500/80 font-mono text-xs font-semibold mb-4 uppercase tracking-widest">
                                            <Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">{post.title}</h2>
                                        <p className="text-emerald-100/70 line-clamp-3">{post.content}</p>
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
