import React, { useEffect, useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Sparkles,
  Bell,
  Brain,
  Download
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { collection, getDocs, addDoc, serverTimestamp, query, limit, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { formatDate } from "@/src/lib/utils";

export const Dashboard = () => {
  const lang = localStorage.getItem("app_lang") || "en";
  
  const translations = {
    en: {
      welcome: "Welcome to the Community",
      heroTitle: "MathSphere: Advancing Mathematics Together.",
      heroSub: "The official community platform for the Mathematics Department of Govt. Bhola College. Connect, share notes, and solve complex problems with AI assistance.",
      startDisc: "Start Discussion",
      browseNotes: "Browse Notes",
      viewAll: "View all",
      recentNotices: "Recent Notices",
      viewNoticeBoard: "View Notice Board",
      groupChat: "Group Chat",
      notesDocs: "Notes & Docs",
      discussions: "Discussions",
      mathAi: "Math AI",
      recentDiscussions: "Recent Discussions",
      recentNotes: "Recent Shared Notes",
      noDiscussions: "No discussions raised yet. Be the first to start one!",
      noNotes: "No shared notes available yet. Upload yours today!",
      noNotices: "No active notices on the board."
    },
    bn: {
      welcome: "কমিউনিটিতে স্বাগতম",
      heroTitle: "ম্যাপস্ফেয়ার: একসাথে গণিত এগিয়ে নিয়ে যাওয়া।",
      heroSub: "সরকারি ভোলা কলেজের গণিত বিভাগের অফিসিয়াল কমিউনিটি প্ল্যাটফর্ম। সংযুক্ত হন, নোট শেয়ার করুন এবং এআই এর সাহায্যে জটিল সমস্যা সমাধান করুন।",
      startDisc: "আলোচনা শুরু করুন",
      browseNotes: "নোট দেখুন",
      viewAll: "সব দেখুন",
      recentNotices: "সাম্প্রতিক নোটিশ",
      viewNoticeBoard: "নোটিশ বোর্ড দেখুন",
      groupChat: "গ্রুপ চ্যাট",
      notesDocs: "নোট এবং নথি",
      discussions: "আলোচনা",
      mathAi: "ম্যাথ এআই",
      recentDiscussions: "সাম্প্রতিক আলোচনা সমূহ",
      recentNotes: "সাম্প্রতিক শেয়ারকৃত গণিত নোট",
      noDiscussions: "এখনো কোনো আলোচনা শুরু হয়নি। প্রথম আলোচনাটি আপনি শুরু করুন!",
      noNotes: "এখনো কোনো নোট শেয়ার করা হয়নি। আজই আপনারটি আপলোড করুন!",
      noNotices: "নোটিশ বোর্ডে কোনো সক্রিয় নোটিশ নেই।"
    }
  };

  const t = translations[lang as 'en' | 'bn'] || translations.en;

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Fetch real-time discussions
  useEffect(() => {
    const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDiscussions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Discussions fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time notes
  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Notes fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time notices
  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(2));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Notices fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const initRooms = async () => {
      const q = query(collection(db, "chatRooms"), where("type", "==", "public"), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, "chatRooms"), {
          name: "General Discussion",
          type: "public",
          members: [],
          updatedAt: serverTimestamp(),
        });
        await addDoc(collection(db, "chatRooms"), {
          name: "Math Problem Soloing",
          type: "public",
          members: [],
          updatedAt: serverTimestamp(),
        });
        await addDoc(collection(db, "chatRooms"), {
          name: "Batch 2024 (Official)",
          type: "batch",
          batch: "2024",
          members: [],
          updatedAt: serverTimestamp(),
        });
      }
    };
    initRooms();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-orange-500 p-8 lg:p-12 text-white shadow-2xl shadow-orange-500/20">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3" /> {t.welcome}
          </motion.div>
          <h1 className="text-4xl font-black leading-tight tracking-tighter lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="text-lg text-orange-50 font-medium opacity-90 max-w-xl">
            {t.heroSub}
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/discussions" className="rounded-2xl bg-white px-8 py-4 text-sm font-black text-orange-600 shadow-xl transition-transform hover:scale-105 active:scale-95">
              {t.startDisc}
            </Link>
            <Link to="/notes" className="rounded-2xl bg-orange-600 px-8 py-4 text-sm font-black text-white shadow-xl transition-transform hover:scale-105 active:scale-95 border border-white/10">
              {t.browseNotes}
            </Link>
          </div>
        </div>
        
        {/* Abstract shapes for design */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <path fill="#FFF" d="M45.7,-77.2C58.9,-71.5,69.1,-58.5,76.5,-44.6C83.9,-30.7,88.5,-15.8,87.3,-1.2C86.1,13.4,79,27.7,71.1,41.2C63.2,54.7,54.5,67.4,42.5,75C30.4,82.5,15.2,85,-0.4,85.7C-16,86.4,-31.9,85.2,-46.4,79C-60.8,72.7,-73.8,61.4,-81.4,47.4C-89,33.4,-91.3,16.7,-88.9,1.4C-86.5,-13.9,-79.4,-27.9,-70.6,-40.1C-61.7,-52.3,-51.2,-62.8,-39,-69.1C-26.8,-75.4,-13.4,-77.5,0.7,-78.7C14.8,-79.9,29.7,-80.1,45.7,-77.2Z" transform="translate(100 100)" />
          </svg>
        </div>
      </section>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Real-time Discussions */}
        <div className="glass-card p-8 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" /> {t.recentDiscussions}
            </h2>
            <Link to="/discussions" className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {discussions.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 text-center">{t.noDiscussions}</p>
            ) : (
              discussions.map((disc) => (
                <Link 
                  to="/discussions"
                  key={disc.id} 
                  className="group flex items-center gap-4 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10 cursor-pointer border border-white/5"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold shrink-0">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">{disc.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Posted by {disc.authorName || "Anonymous"} • {disc.createdAt ? formatDate(disc.createdAt) : "Just now"}
                    </p>
                  </div>
                  {disc.tags && disc.tags.length > 0 && (
                    <div className="hidden sm:flex gap-1.5">
                      {disc.tags.slice(0, 2).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 font-medium">#{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Notices */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" /> {t.recentNotices}
            </h2>
          </div>
          <div className="space-y-4">
            {notices.length === 0 ? (
              <p className="text-sm text-gray-500 italic p-4 text-center">{t.noNotices}</p>
            ) : (
              notices.map((notice) => (
                <Link
                  to="/notices"
                  key={notice.id}
                  className="block rounded-2xl bg-purple-500/10 p-4 border border-purple-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform"
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase text-purple-400">{notice.category || "Notice"}</span>
                    <h3 className="mt-1 text-sm font-bold text-white line-clamp-2">{notice.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" /> Posted {notice.createdAt ? formatDate(notice.createdAt) : "Just now"}
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-purple-500/20 blur-2xl group-hover:bg-purple-500/40 transition-colors" />
                </Link>
              ))
            )}
          </div>
          <Link to="/notices" className="w-full block text-center rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
            {t.viewNoticeBoard}
          </Link>
        </div>

        {/* Real-time Notes Column (Span 3 to sit elegantly on next row) */}
        <div className="glass-card p-8 space-y-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" /> {t.recentNotes}
            </h2>
            <Link to="/notes" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notes.length === 0 ? (
              <div className="col-span-3 text-center py-6">
                <p className="text-sm text-gray-500 italic">{t.noNotes}</p>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id} 
                  className="rounded-2xl bg-white/5 p-5 border border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-1 rounded-md bg-blue-500/10 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                        {note.courseCode}
                      </span>
                      <span className="text-[9px] text-gray-500 font-bold">{note.year}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.description || "No description provided."}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                      By {note.uploaderName || "Anonymous"}
                    </span>
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white text-xs font-black uppercase transition-all"
                    >
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories / Sections */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link to="/chat" className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:border-orange-500/30 transition-all group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-7 w-7" />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{t.groupChat}</span>
          </Link>
          <Link to="/notes" className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:border-blue-500/30 transition-all group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <FileText className="h-7 w-7" />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{t.notesDocs}</span>
          </Link>
          <Link to="/discussions" className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:border-green-500/30 transition-all group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <Users className="h-7 w-7" />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{t.discussions}</span>
          </Link>
          <Link to="/ai" className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:border-purple-500/30 transition-all group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <Brain className="h-7 w-7" />
            </div>
            <span className="text-sm font-bold text-white whitespace-nowrap">{t.mathAi}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
