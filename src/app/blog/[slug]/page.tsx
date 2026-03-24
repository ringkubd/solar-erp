"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Calendar } from "lucide-react";

export default function BlogPost() {
    const params = useParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/website/posts/${params.slug}`)
           .then(res => setPost(res.data))
           .catch(() => setPost(false))
           .finally(() => setLoading(false));
    }, [params.slug]);

    if (loading) return <div className="min-h-screen bg-[#07100d] flex items-center justify-center text-emerald-500 font-bold tracking-widest">LOADING...</div>;

    if (post === false) return <div className="min-h-screen bg-[#07100d] flex flex-col items-center justify-center text-emerald-500"><h1 className="text-4xl font-bold mb-4">404</h1><p>Article not found.</p><Link href="/blog" className="mt-8 text-white border-b border-emerald-500 pb-1 hover:text-emerald-400">Back to Blog</Link></div>;

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
                <Link href="/blog" className="text-emerald-400 font-semibold tracking-widest text-sm hover:text-emerald-300 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> All Articles
                </Link>
            </nav>

            <article className="relative z-10 pt-36 pb-24 px-6 md:px-12">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 text-emerald-500 font-mono text-sm font-semibold mb-6 uppercase tracking-widest">
                        <Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-12 leading-tight">{post.title}</h1>
                    
                    {post.cover_image && (
                        <div className="w-full h-96 bg-[#102319] rounded-2xl mb-12 bg-cover bg-center border border-emerald-500/20" style={{ backgroundImage: `url(${post.cover_image})` }}></div>
                    )}
                    
                    <div className="prose prose-invert prose-emerald max-w-none prose-p:leading-relaxed prose-p:text-emerald-100/80 prose-headings:text-white prose-a:text-emerald-400">
                        {/* We are directly rendering text as they might type raw strings, or simple paragraphs. 
                            In a real scenario, this could be Markdown parsed. */}
                        {post.content.split('\n').map((paragraph: string, i: number) => (
                            <p key={i} className="mb-6">{paragraph}</p>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
}
