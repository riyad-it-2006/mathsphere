import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Calendar, 
  Clock, 
  Pin, 
  ExternalLink, 
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Plus,
  X,
  Paperclip,
  File as FileIcon,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";
import { Notice } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";

export const NoticeBoard = () => {
  const { user, profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", type: "general", isPinned: false });
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthorized = profile?.role === "admin" || profile?.role === "cr" || profile?.role === "teacher" || profile?.email === "skriyad0131@gmail.com";

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
      setNotices(docs);
    }, (err) => {
      console.error(err);
      setErrorMsg("Permission denied to view notices.");
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg("File too large. Max 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user || !newNotice.title || isPublishing) return;

    setIsPublishing(true);
    try {
      let attachmentUrl = "";
      let attachmentType = "";

      if (file) {
        const fileRef = ref(storage, `notices/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(fileRef, file);
        attachmentUrl = await getDownloadURL(uploadResult.ref);
        attachmentType = file.name.split('.').pop()?.toUpperCase() || "FILE";
      }

      await addDoc(collection(db, "notices"), {
        ...newNotice,
        authorId: user.uid,
        authorName: profile?.displayName || "Admin",
        attachmentUrl,
        attachmentType,
        createdAt: serverTimestamp(),
      });
      setIsAdding(false);
      setNewNotice({ title: "", content: "", type: "general", isPinned: false });
      setFile(null);
    } catch (error: any) {
      console.error("Failed to add notice", error);
      setErrorMsg(error.message || "Failed to publish notice. Check your internet or permissions.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-2xl shadow-purple-500/20">
            <Megaphone className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Notice Board</h1>
            <p className="text-gray-500 font-medium">Official announcements from MathSphere.</p>
          </div>
        </div>
        
        {isAuthorized && (
          <button 
            onClick={() => setIsAdding(true)}
            className="rounded-2xl bg-purple-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5 inline mr-2" /> Post Notice
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddNotice}
            className="glass-card p-8 border-purple-500/20 space-y-4 overflow-hidden"
          >
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm mb-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-white">New Announcement</h2>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Title"
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50"
                value={newNotice.title}
                onChange={e => setNewNotice({...newNotice, title: e.target.value})}
              />
              <select 
                className="bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50"
                value={newNotice.type}
                onChange={e => setNewNotice({...newNotice, type: e.target.value})}
              >
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <textarea 
              placeholder="Notice Content..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50 h-32 resize-none"
              value={newNotice.content}
              onChange={e => setNewNotice({...newNotice, content: e.target.value})}
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Attachment (optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 border-2 border-dashed border-white/10 p-4 hover:border-purple-500/50 cursor-pointer transition-all">
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf,.docx" />
                  <Paperclip className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-400 truncate max-w-[200px]">
                    {file ? file.name : "Select File (PNG, JPG, PDF, DOCX)"}
                  </span>
                </label>
                {file && (
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={newNotice.isPinned}
                onChange={e => setNewNotice({...newNotice, isPinned: e.target.checked})}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-purple-500"
              />
              <span className="text-sm text-gray-400">Pin this notice to top</span>
            </label>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="submit" 
                disabled={isPublishing}
                className="bg-purple-500 text-white px-8 py-3 rounded-xl text-sm font-black disabled:opacity-50 flex items-center gap-2"
              >
                {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Notice
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {notices.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500">
            <Bell className="h-10 w-10 mx-auto mb-4 opacity-20" />
            No notices found.
          </div>
        ) : (
          notices.map((notice) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={notice.id}
              className={cn(
                "glass-card p-8 relative overflow-hidden group transition-all",
                notice.isPinned ? "border-orange-500/30" : ""
              )}
            >
              <div className="relative z-10 flex gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> {notice.createdAt ? formatDate(notice.createdAt) : "Recently"}
                      </span>
                      {notice.isPinned && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          <Pin className="h-3 w-3" /> Pinned
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      notice.type === "exam" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                      notice.type === "assignment" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                      "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    )}>
                      {notice.type}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors leading-tight uppercase tracking-tight">{notice.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">{notice.content}</p>

                  {notice.attachmentUrl && (
                    <div className="pt-2">
                       <a 
                        href={notice.attachmentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-all group/attachment"
                      >
                        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover/attachment:scale-110 transition-transform">
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col pr-4">
                          <span className="text-xs font-black text-white uppercase">Download Attachment</span>
                          <span className="text-[10px] text-gray-500 uppercase font-bold">{notice.attachmentType} File</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-500 group-hover/attachment:text-purple-500 transition-colors" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-white/5 mt-4">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Post By: {notice.authorName}</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-purple-500/5 blur-[100px] pointer-events-none group-hover:bg-purple-500/10 transition-all" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
