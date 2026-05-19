import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Upload, 
  Filter,
  MoreVertical,
  BookOpen,
  ChevronDown,
  User as UserIcon,
  Plus,
  Paperclip,
  X,
  Loader2,
  File as FileIcon,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";
import { Note } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";

export const Notes = () => {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", description: "", course: "MAT-101", year: "1st Year" });
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthorized = profile?.role === "admin" || profile?.role === "cr" || profile?.role === "teacher" || profile?.email === "skriyad0131@gmail.com";

  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
    }, (err) => {
      console.error(err);
      setErrorMsg("Permission denied to view notes.");
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20 * 1024 * 1024) {
        setErrorMsg("File too large. Max 20MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user || !newNote.title || !file || isPublishing) return;

    setIsPublishing(true);
    try {
      const fileRef = ref(storage, `notes/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(uploadResult.ref);
      const fileType = file.name.split('.').pop()?.toUpperCase() || "PDF";

      await addDoc(collection(db, "notes"), {
        title: newNote.title,
        description: newNote.description,
        year: newNote.year,
        courseCode: newNote.course,
        uploaderId: user.uid,
        uploaderName: profile?.displayName || "Anonymous",
        fileUrl,
        fileType,
        createdAt: serverTimestamp(),
      });
      setIsUploading(false);
      setNewNote({ title: "", description: "", course: "MAT-101", year: "1st Year" });
      setFile(null);
    } catch (error: any) {
      console.error("Upload failed", error);
      setErrorMsg(error.message || "Failed to upload document. Check your connection or permissions.");
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    activeTab === "all" || n.year.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" /> Notes & Documents
          </h1>
          <p className="text-gray-500 text-sm mt-1">Access verified study materials and academic resources.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              placeholder="Search documents..."
              className="w-full bg-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs text-white border border-white/5 outline-none focus:border-blue-500/30 transition-all min-w-[280px]"
            />
          </div>
          {isAuthorized && (
            <button 
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-xs font-black text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Upload className="h-4 w-4" /> Share Note
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isUploading && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleUpload}
            className="glass-card p-8 border-blue-500/20 space-y-4 overflow-hidden"
          >
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Document Title</label>
                <input 
                  placeholder="e.g. Calculus I - Lecture Notes"
                  className="w-full bg-white/5 rounded-xl p-3 text-sm text-white outline-none border border-white/10"
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Academic Year</label>
                <select 
                  className="w-full bg-[#0a0a0a] rounded-xl p-3 text-sm text-gray-400 outline-none border border-white/10"
                  value={newNote.year}
                  onChange={e => setNewNote({...newNote, year: e.target.value})}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Description</label>
              <textarea 
                placeholder="Brief description of the material..."
                className="w-full bg-white/5 rounded-xl p-3 text-sm text-white outline-none border border-white/10 min-h-[100px]"
                value={newNote.description}
                onChange={e => setNewNote({...newNote, description: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Select File (PNG, JPG, PDF, DOCX)</label>
              <div className="flex items-center gap-4">
                <label className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 border-2 border-dashed border-white/10 p-6 hover:border-blue-500/50 cursor-pointer transition-all">
                  <input type="file" className="hidden" onChange={handleFileChange} accept=".png,.jpg,.jpeg,.pdf,.docx" />
                  <Paperclip className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-400 truncate max-w-[300px]">
                    {file ? file.name : "Select Document"}
                  </span>
                </label>
                {file && (
                  <button 
                    type="button" 
                    onClick={() => setFile(null)}
                    className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setIsUploading(false)} 
                className="px-6 py-3 text-xs font-bold text-gray-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isPublishing || !file}
                className="bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-black disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-blue-500/20"
              >
                {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Note
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "1st Year", "2nd Year", "3rd Year", "4th Year"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={cn(
              "whitespace-nowrap rounded-2xl px-6 py-3 text-xs font-bold transition-all border",
              activeTab === tab.toLowerCase() 
                ? "bg-white text-black border-white shadow-lg" 
                : "bg-white/5 text-gray-500 border-white/5 hover:text-white hover:bg-white/10"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <motion.div
            whileHover={{ y: -5 }}
            key={note.id}
            className="glass-card p-6 flex flex-col gap-6 group hover:border-blue-500/30 transition-all shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8" />
              </div>
              <button className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {note.courseCode}
                </span>
                <span className="text-[10px] font-black uppercase text-gray-500">
                  {note.year}
                </span>
              </div>
              <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase leading-tight">{note.title}</h3>
              {note.description && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{note.description}</p>
              )}
              <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/5">
                <Link href={`/profile/${note.uploaderId}`} className="h-8 w-8 rounded-full bg-gray-700 flex-shrink-0 hover:scale-110 transition-transform overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${note.uploaderId}`} alt="avatar" />
                </Link>
                <div className="flex flex-col">
                  <Link href={`/profile/${note.uploaderId}`} className="text-[10px] font-black text-white hover:underline hover:text-blue-500 transition-colors">
                    {(note as any).uploaderName || "Anonymous"}
                  </Link>
                  <span className="text-[10px] text-gray-500">Member ID: {note.uploaderId.slice(0, 6)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-auto">
              <a 
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all outline-none"
              >
                <Eye className="h-4 w-4" /> Preview
              </a>
              <a 
                href={note.fileUrl}
                download
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-3 text-xs font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all outline-none"
              >
                <Download className="h-4 w-4" /> Get {note.fileType}
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
