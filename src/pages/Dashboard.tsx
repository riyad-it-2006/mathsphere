import React, { useEffect } from "react";
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
  Brain
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { collection, getDocs, addDoc, serverTimestamp, query, limit, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export const Dashboard = () => {
  const lang = localStorage.getItem("app_lang") || "en";
  
  const translations = {
    en: {
      welcome: "Welcome to the Community",
      heroTitle: "MathSphere: Advancing Mathematics Together.",
      heroSub: "The official community platform for the Mathematics Department of Govt. Bhola College. Connect, share notes, and solve complex problems with AI assistance.",
      startDisc: "Start Discussion",
      browseNotes: "Browse Notes",
      deptActivity: "Department Activity",
      viewAll: "View all",
      recentNotices: "Recent Notices",
      viewNoticeBoard: "View Notice Board",
      groupChat: "Group Chat",
      notesDocs: "Notes & Docs",
      discussions: "Discussions",
      mathAi: "Math AI"
    },
    bn: {
      welcome: "কমিউনিটিতে স্বাগতম",
      heroTitle: "ম্যাথস্ফেয়ার: একসাথে গণিত এগিয়ে নিয়ে যাওয়া।",
      heroSub: "সরকারি ভোলা কলেজের গণিত বিভাগের অফিসিয়াল কমিউনিটি প্ল্যাটফর্ম। সংযুক্ত হন, নোট শেয়ার করুন এবং এআই এর সাহায্যে জটিল সমস্যা সমাধান করুন।",
      startDisc: "আলোচনা শুরু করুন",
      browseNotes: "নোট দেখুন",
      deptActivity: "বিভাগের কার্যক্রম",
      viewAll: "সব দেখুন",
      recentNotices: "সাম্প্রতিক নোটিশ",
      viewNoticeBoard: "নোটিশ বোর্ড দেখুন",
      groupChat: "গ্রুপ চ্যাট",
      notesDocs: "নোট এবং নথি",
      discussions: "আলোচনা",
      mathAi: "ম্যাথ এআই"
    }
  };

  const t = translations[lang as 'en' | 'bn'] || translations.en;

  useEffect(() => {
    const initRooms = async () => {
      // Query only for public rooms as per rules
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Stats / Activity */}
        <div className="glass-card p-8 space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" /> {t.deptActivity}
            </h2>
            <Link to="/discussions" className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
              {t.viewAll} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group flex items-center gap-4 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10 cursor-pointer border border-white/5">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                  {i}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">Complex Analysis: Chapter 4 Discussion</h3>
                  <p className="text-xs text-gray-500 mt-1">24 comments • Active 5m ago</p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(u => (
                    <div key={u} className="h-7 w-7 rounded-full border-2 border-[#0a0a0a] bg-gray-700 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}${u}`} alt="user" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Notices */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-500" /> {t.recentNotices}
            </h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-purple-500/10 p-4 border border-purple-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase text-purple-400">Exam Alert</span>
                <h3 className="mt-1 text-sm font-bold text-white">Final Semester Schedule Out</h3>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> Posted 1h ago
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-purple-500/20 blur-2xl group-hover:bg-purple-500/40 transition-colors" />
            </div>

            <div className="rounded-2xl bg-blue-500/10 p-4 border border-blue-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase text-blue-400">Assignment</span>
                <h3 className="mt-1 text-sm font-bold text-white">Linear Algebra Project Due</h3>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" /> Posted 5h ago
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-blue-500/20 blur-2xl group-hover:bg-blue-500/40 transition-colors" />
            </div>
          </div>
          <Link to="/notices" className="w-full block text-center rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
            {t.viewNoticeBoard}
          </Link>
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
