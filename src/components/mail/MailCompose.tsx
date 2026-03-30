"use client";

import { useState } from "react";
import { X, Send, Paperclip, Sparkles, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function MailCompose({ onClose, onSent }: any) {
  const [form, setForm] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAi, setShowAi] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/mail/send', form);
      onSent();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send mail");
    } finally {
      setLoading(false);
    }
  };

  const generateAiDraft = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
      const res = await api.post('/mail/ai-generate', { prompt: aiPrompt });
      const draft = res.data.draft;

      // Improved parsing for Subject and Body from AI response
      const subjectMatch = draft.match(/Subject:\s*(.*)/i);
      const bodyMatch = draft.match(/Body:\s*([\s\S]*)/i);

      if (subjectMatch && bodyMatch) {
        setForm(prev => ({
          ...prev,
          subject: subjectMatch[1].trim(),
          body: bodyMatch[1].trim()
        }));
      } else if (subjectMatch) {
        setForm(prev => ({
          ...prev,
          subject: subjectMatch[1].trim(),
          body: draft.replace(/Subject:\s*(.*)/i, '').trim()
        }));
      } else {
        setForm(prev => ({ ...prev, body: draft }));
      }

      setShowAi(false);
    } catch (err) {
      alert("AI Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-6 pointer-events-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden max-h-[100vh] md:min-h-[60vh]">
        <div className="bg-slate-900 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-[10px]">New Message</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="px-6 py-4 space-y-4 bg-white border-b shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 w-12 tracking-widest">To</span>
              <input
                required type="email" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}
                className="flex-1 outline-none text-sm font-bold text-slate-900"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-400 w-12 tracking-widest">Subject</span>
              <input
                required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                className="flex-1 outline-none text-sm font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 p-6 relative">
            {showAi ? (
              <div className="absolute inset-0 z-10 p-4 bg-blue-50/90 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-200 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">AI Assistant</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500">What would you like me to write? (e.g. "Request for project update", "Resignation letter", "Thank you note")</p>
                  <textarea
                    value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                    placeholder="Type your instruction..."
                    className="w-full h-32 border-2 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none resize-none transition-all"
                  />
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAi(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                    <button
                      type="button"
                      onClick={generateAiDraft}
                      disabled={aiLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Generate Draft
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                placeholder="Compose your email..."
                className="w-full h-full outline-none text-sm font-medium text-slate-700 bg-transparent resize-none leading-relaxed"
              />
            )}
          </div>

          <div className="p-4 border-t bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAi(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
              >
                <Sparkles className="w-4 h-4" /> AI Assist
              </button>
              <button type="button" className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
