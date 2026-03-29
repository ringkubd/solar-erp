"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import MailSidebar from "@/components/mail/MailSidebar";
import MailCompose from "@/components/mail/MailCompose";
import { 
  Search, RefreshCcw, MoreHorizontal, 
  Star, Paperclip, Sparkles, Loader2, ArrowLeft,
  Trash2, Archive, MailOpen, Clock, Send
} from "lucide-react";

export default function MailPage() {
  const [folder, setFolder] = useState('INBOX');
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [sumLoading, setSumLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/mail/inbox?folder=${folder}`);
      setMessages(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [folder]);

  const selectMessage = async (msg: any) => {
    setMsgLoading(true);
    setSelectedMsg(msg);
    setSummary('');
    try {
      const res = await api.get(`/mail/message/${msg.uid}?folder=${folder}`);
      setSelectedMsg(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setMsgLoading(false);
    }
  };

  const summarize = async () => {
    if (!selectedMsg) return;
    setSumLoading(true);
    try {
      const res = await api.get(`/mail/message/${selectedMsg.uid}/summarize?folder=${folder}`);
      setSummary(res.data.summary);
    } catch (e) {
      alert("AI Summarization failed");
    } finally {
      setSumLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50/50 rounded-3xl border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
      <MailSidebar 
        activeFolder={folder} 
        setFolder={(f: string) => { setFolder(f); setSelectedMsg(null); }} 
        onCompose={() => setShowCompose(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header / Search */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  placeholder="Search in mail..." 
                  className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono uppercase"
                />
             </div>
             <button onClick={fetchMessages} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <RefreshCcw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin text-blue-500' : ''}`} />
             </button>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2 hover:bg-slate-100 rounded-xl transition-all"><MoreHorizontal className="w-4 h-4 text-slate-400"/></button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Inbox List */}
          <div className={`w-full md:w-[400px] border-r flex flex-col overflow-hidden ${selectedMsg ? 'hidden md:flex' : 'flex'}`}>
             <div className="flex-1 overflow-auto divide-y bg-slate-50/30">
                {loading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Dovecot...</p>
                   </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                       <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                          <Clock className="w-8 h-8 text-slate-300"/>
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your inbox is empty</p>
                    </div>
                ) : messages.map((msg) => (
                  <div 
                    key={msg.uid} 
                    onClick={() => selectMessage(msg)}
                    className={`p-5 cursor-pointer hover:bg-white transition-all border-l-4 ${
                      selectedMsg?.uid === msg.uid ? 'bg-white border-blue-500 shadow-lg z-10' : 'border-transparent'
                    } ${!msg.is_seen ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${!msg.is_seen ? 'text-blue-600' : 'text-slate-400'}`}>
                          {msg.from.split(' <')[0]}
                       </span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase">{msg.date.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className={`text-xs ${!msg.is_seen ? 'font-black text-slate-900' : 'font-bold text-slate-700'} line-clamp-1 mb-1 tracking-tight`}>
                       {msg.subject || '(No Subject)'}
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
                       {msg.preview}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-slate-300">
                       <Star className="w-3 h-3 hover:text-amber-400 transition-colors" />
                       {msg.has_attachments && <Paperclip className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Message Content */}
          <div className={`flex-1 flex flex-col overflow-hidden bg-white ${selectedMsg ? 'flex' : 'hidden md:flex'}`}>
             {selectedMsg ? (
                <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
                   {/* Msg Header */}
                   <div className="p-6 border-b shrink-0 bg-white">
                      <div className="flex items-center justify-between mb-6">
                         <div className="flex items-center gap-4">
                            <button onClick={()=>setSelectedMsg(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl">
                               <ArrowLeft className="w-4 h-4"/>
                            </button>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{selectedMsg.subject}</h2>
                         </div>
                         <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Trash2 className="w-4 h-4"/></button>
                            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Archive className="w-4 h-4"/></button>
                            <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><MailOpen className="w-4 h-4"/></button>
                         </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 text-sm">
                               {selectedMsg.from[0]}
                            </div>
                            <div>
                               <div className="text-xs font-black text-slate-900 uppercase tracking-widest">{selectedMsg.from}</div>
                               <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">To: {selectedMsg.to || 'Me'}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedMsg.date}</span>
                            <button 
                              onClick={summarize}
                              disabled={sumLoading}
                              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 flex items-center gap-2"
                            >
                               {sumLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
                               AI summarize
                            </button>
                         </div>
                      </div>
                   </div>

                   {/* AI Summary Box */}
                   {summary && (
                     <div className="mx-6 mt-6 p-5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                           <Sparkles className="w-20 h-20" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                           <Sparkles className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">AI Hub Summary</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">{summary}</p>
                     </div>
                   )}

                   {/* Msg Body */}
                   <div className="flex-1 overflow-auto p-10 font-medium text-slate-700 leading-relaxed text-sm">
                      {msgLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Message Body...</p>
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: selectedMsg.body }} />
                      )}

                      {selectedMsg.attachments?.length > 0 && (
                        <div className="mt-12 pt-8 border-t grid grid-cols-2 lg:grid-cols-3 gap-4">
                           {selectedMsg.attachments.map((at: any) => (
                             <div key={at.id} className="p-4 border-2 border-slate-50 rounded-2xl flex items-center gap-4 hover:border-blue-100 hover:bg-blue-50 group cursor-pointer transition-all">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                   <Paperclip className="w-5 h-5"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-black text-slate-900 truncate uppercase">{at.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{(at.size / 1024).toFixed(1)} KB</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-20 bg-slate-50/20">
                   <div className="w-32 h-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center relative overflow-hidden group border border-slate-100">
                      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                      <Send className="w-12 h-12 text-blue-500 group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-2 group-hover:translate-x-2" />
                   </div>
                   <div className="text-center">
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">Select a thread</h3>
                      <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed uppercase">
                         Connect with your team and clients directly from the Solar ERP.
                      </p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {showCompose && <MailCompose onClose={()=>setShowCompose(false)} onSent={fetchMessages} />}
    </div>
  );
}
