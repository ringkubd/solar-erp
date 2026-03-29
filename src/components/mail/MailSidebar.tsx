"use client";

import { 
  Inbox, Send, FileText, Trash2, AlertCircle, 
  ChevronRight, Plus, Mail, Star
} from "lucide-react";

export default function MailSidebar({ activeFolder, setFolder, onCompose }: any) {
  const folders = [
    { id: 'INBOX', label: 'Inbox', icon: Inbox, count: 12, color: 'text-blue-600' },
    { id: 'SENT', label: 'Sent', icon: Send, count: 0, color: 'text-slate-600' },
    { id: 'DRAFTS', label: 'Drafts', icon: FileText, count: 2, color: 'text-amber-600' },
    { id: 'TRASH', label: 'Trash', icon: Trash2, count: 0, color: 'text-slate-600' },
    { id: 'SPAM', label: 'Spam', icon: AlertCircle, count: 0, color: 'text-red-600' },
  ];

  return (
    <div className="w-64 border-r bg-white/50 backdrop-blur-xl flex flex-col h-full overflow-hidden shrink-0">
      <div className="p-6">
        <button 
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> 
          Compose Mail
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-auto">
        <p className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mailboxes</p>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setFolder(folder.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
              activeFolder === folder.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <folder.icon className={`w-4 h-4 ${activeFolder === folder.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="text-xs font-bold">{folder.label}</span>
            </div>
            {folder.count > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeFolder === folder.id ? 'bg-blue-200/50 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {folder.count}
              </span>
            )}
          </button>
        ))}

        <div className="pt-8 px-4 border-t mt-8">
           <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Labels</p>
           <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"/> Project Updates
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
                 <div className="w-2 h-2 rounded-full bg-amber-500"/> CRM Leads
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
                 <div className="w-2 h-2 rounded-full bg-blue-500"/> Accounting
              </div>
           </div>
        </div>
      </nav>

      <div className="p-4 border-t bg-slate-50/50">
         <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
               <Mail className="w-4 h-4 text-blue-600"/>
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black text-slate-900 truncate uppercase">Storage Usage</p>
               <div className="mt-1 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}/>
               </div>
               <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">2.25 GB of 5 GB used</p>
            </div>
         </div>
      </div>
    </div>
  );
}
