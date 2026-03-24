"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CMSPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [services, setServices] = useState([]);
  const [posts, setPosts] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [homeSeo, setHomeSeo] = useState<any>({});
  const [activeTab, setActiveTab] = useState("products");
  
  // Create Forms State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, bRes, sRes, postRes, seoRes, portRes] = await Promise.all([
        api.get("/cms/products"),
        api.get("/cms/brands"),
        api.get("/cms/services"),
        api.get("/cms/posts"),
        api.get("/website/seo/home"),
        api.get("/cms/portfolio")
      ]);
      setProducts(pRes.data);
      setBrands(bRes.data);
      setServices(sRes.data);
      setPosts(postRes.data);
      setPortfolio(portRes.data);
      if(seoRes.data.id) setHomeSeo(seoRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'products') {
         await api.post("/cms/products", { ...formData, specs: formData.specs?.split(',') || [] });
      } else if (activeTab === 'brands') {
         await api.post("/cms/brands", { ...formData, order_num: parseInt(formData.order_num) || 0 });
      } else if (activeTab === 'services') {
         await api.post("/cms/services", { ...formData, order_num: parseInt(formData.order_num) || 0 });
      } else if (activeTab === 'posts') {
         await api.post("/cms/posts", { ...formData, published: formData.published !== false });
      } else if (activeTab === 'portfolio') {
         await api.post("/cms/portfolio", formData);
      } else if (activeTab === 'seo') {
         await api.post("/cms/seo", { page_name: 'home', ...formData });
      }
      setShowForm(false);
      setFormData({});
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create item.");
    }
  };

  const deleteItem = async (endpoint: string, id: number) => {
    if (!confirm("Are you sure?")) return;
    await api.delete(`/cms/${endpoint}/${id}`);
    fetchData();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website CMS</h1>
          <p className="text-muted-foreground mt-1">Manage public website content directly from the ERP.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : `+ Add New ${activeTab.slice(0, -1)}`}
        </Button>
      </div>

      <div className="flex gap-4 border-b pb-2">
        {['products', 'brands', 'services', 'posts', 'portfolio', 'seo'].map(tab => (
          <button key={tab} className={`pb-2 px-2 text-sm font-semibold transition-colors capitalize ${activeTab===tab ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`} onClick={() => { setActiveTab(tab); setShowForm(false); setFormData(tab === 'seo' ? homeSeo : {}); }}>
             {tab === 'seo' ? 'SEO Settings' : tab}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white p-6 border rounded-xl shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold mb-4 capitalize">Create New {activeTab.slice(0, -1)}</h3>
          <form onSubmit={submitForm} className="space-y-4">
            {activeTab === 'products' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><Label>Title</Label><Input required value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} /></div>
                   <div className="space-y-2"><Label>Category</Label><Input required value={formData.category||''} onChange={e=>setFormData({...formData,category:e.target.value})} /></div>
                   <div className="space-y-2"><Label>Icon (Lucide Node)</Label><Input value={formData.icon||''} onChange={e=>setFormData({...formData,icon:e.target.value})} /></div>
                   <div className="space-y-2"><Label>Specs (Comma separated)</Label><Input value={formData.specs||''} onChange={e=>setFormData({...formData,specs:e.target.value})} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea required value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} /></div>
              </>
            )}
            
            {(activeTab === 'brands' || activeTab === 'services') && (
               <>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>{activeTab === 'brands' ? 'Brand Name' : 'Service Title'}</Label><Input required value={formData.name || formData.title || ''} onChange={e=>setFormData({...formData,[activeTab === 'brands' ? 'name' : 'title']:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Order Number</Label><Input type="number" required value={formData.order_num||''} onChange={e=>setFormData({...formData,order_num:e.target.value})} /></div>
                    {activeTab === 'brands' && <div className="space-y-2"><Label>Color Hex (#ff0000)</Label><Input value={formData.color||''} onChange={e=>setFormData({...formData,color:e.target.value})} /></div>}
                    {activeTab === 'services' && <div className="space-y-2"><Label>Icon (Lucide Node)</Label><Input value={formData.icon||''} onChange={e=>setFormData({...formData,icon:e.target.value})} /></div>}
                 </div>
                 <div className="space-y-2"><Label>Description</Label><Textarea required value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} /></div>
               </>
            )}

            {activeTab === 'posts' && (
               <>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Article Title</Label><Input required value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Cover Image URL (Optional)</Label><Input value={formData.cover_image||''} onChange={e=>setFormData({...formData,cover_image:e.target.value})} /></div>
                 </div>
                 <div className="space-y-2"><Label>Article Content formatting</Label><Textarea className="min-h-[150px]" required value={formData.content||''} onChange={e=>setFormData({...formData,content:e.target.value})} /></div>
                 <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="published" checked={formData.published!==false} onChange={e=>setFormData({...formData,published:e.target.checked})} className="w-4 h-4" />
                    <label htmlFor="published" className="text-sm font-medium">Publish Immediately</label>
                 </div>
               </>
            )}

            {activeTab === 'portfolio' && (
               <>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Project Title</Label><Input required value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Client Name</Label><Input value={formData.client_name||''} onChange={e=>setFormData({...formData,client_name:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Project Type</Label>
                       <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors" required value={formData.project_type||''} onChange={e=>setFormData({...formData,project_type:e.target.value})}>
                          <option value="">Select Type</option>
                          <option value="Solar">Solar System</option>
                          <option value="Substation">Substation / Transformers</option>
                          <option value="Electrical">Industrial Electrical</option>
                       </select>
                    </div>
                    <div className="space-y-2"><Label>Capacity (e.g. 500kW)</Label><Input value={formData.capacity||''} onChange={e=>setFormData({...formData,capacity:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Location</Label><Input value={formData.location||''} onChange={e=>setFormData({...formData,location:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Completion Date</Label><Input type="date" value={formData.completion_date||''} onChange={e=>setFormData({...formData,completion_date:e.target.value})} /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Challenge</Label><Textarea value={formData.challenge_description||''} onChange={e=>setFormData({...formData,challenge_description:e.target.value})} /></div>
                    <div className="space-y-2"><Label>Solution</Label><Textarea value={formData.solution_description||''} onChange={e=>setFormData({...formData,solution_description:e.target.value})} /></div>
                 </div>
               </>
            )}

            {activeTab === 'seo' && (
               <>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Meta Title</Label><Input required value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} maxLength={60} /></div>
                    <div className="space-y-2"><Label>OG Image URL</Label><Input value={formData.og_image||''} onChange={e=>setFormData({...formData,og_image:e.target.value})} /></div>
                 </div>
                 <div className="space-y-2"><Label>Meta Keywords (comma separated)</Label><Input value={formData.keywords||''} onChange={e=>setFormData({...formData,keywords:e.target.value})} /></div>
                 <div className="space-y-2"><Label>Meta Description</Label><Textarea required value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} maxLength={160} /></div>
               </>
            )}

            {activeTab !== 'posts' && <Button type="submit" className="mt-4">Save Data</Button>}
          </form>
        </div>
      )}

      {activeTab === 'seo' && !showForm && (
        <div className="bg-white rounded-xl border shadow-sm p-8">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Homepage SEO Setup</h3>
              <Button variant="outline" onClick={() => { setFormData(homeSeo); setShowForm(true); }}>Edit SEO</Button>
           </div>
           <div className="space-y-4">
              <div><span className="font-bold text-slate-500 text-sm">Meta Title</span><p className="text-lg">{homeSeo.title || 'Not Set'}</p></div>
              <div><span className="font-bold text-slate-500 text-sm">Meta Description</span><p>{homeSeo.description || 'Not Set'}</p></div>
              <div><span className="font-bold text-slate-500 text-sm">Keywords</span><p>{homeSeo.keywords || 'Not Set'}</p></div>
              <div><span className="font-bold text-slate-500 text-sm">OpenGraph Image</span><p className="text-emerald-500 text-sm hover:underline">{homeSeo.og_image || 'Not Set'}</p></div>
           </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Icon</th><th className="px-4 py-3 font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.icon}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => deleteItem('products', p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No products found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {brands.map((b: any) => (
                  <tr key={b.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold" style={{color: b.color || '#333'}}>{b.name}</td>
                    <td className="px-4 py-3 text-slate-500">{b.description}</td>
                    <td className="px-4 py-3">{b.order_num}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => deleteItem('brands', b.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Icon</th><th className="px-4 py-3 font-medium">Order</th><th className="px-4 py-3 font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {services.map((s: any) => (
                  <tr key={s.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{s.title}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.icon}</td>
                    <td className="px-4 py-3">{s.order_num}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => deleteItem('services', s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Slug</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Date Created</th><th className="px-4 py-3 font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {posts.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.slug}</td>
                    <td className="px-4 py-3 text-slate-500">{p.published ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">Published</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest">Draft</span>}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => deleteItem('posts', p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No blog posts found. Click Add New to start writing!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Client</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Capacity</th><th className="px-4 py-3 font-medium">Actions</th></tr>
              </thead>
              <tbody>
                {portfolio.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">{p.title}</td>
                    <td className="px-4 py-3 text-slate-500">{p.client_name || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{p.project_type}</td>
                    <td className="px-4 py-3 text-emerald-600 font-mono text-xs font-bold">{p.capacity || '-'}</td>
                    <td className="px-4 py-3">
                      <button className="text-red-500 hover:text-red-700 font-medium" onClick={() => deleteItem('portfolio', p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {portfolio.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No projects in portfolio. Add your recent case studies!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
