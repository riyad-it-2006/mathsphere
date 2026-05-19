import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Command, ArrowLeft, UserCircle, Brain, Languages } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem("app_lang") || "en");
  const isDashboard = location.pathname === "/";

  const toggleLang = () => {
    const newLang = lang === "en" ? "bn" : "en";
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
    window.location.reload(); 
  };

  useEffect(() => {
    // Real-time notices listener for badge
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lastSeen = localStorage.getItem("last_seen_notice_time") || "0";
      let count = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0;
        if (createdAt > parseInt(lastSeen)) {
          count++;
        }
      });
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [location.pathname]);

  // Reset count when visiting notices page
  useEffect(() => {
    if (location.pathname === "/notices") {
      localStorage.setItem("last_seen_notice_time", Date.now().toString());
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/60 backdrop-blur-md px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="lg:hidden flex items-center gap-2 mr-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-white tracking-tighter text-sm uppercase">MathSphere</span>
          </Link>
          {!isDashboard && (
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
          )}
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search everything..."
              className="h-10 w-full rounded-xl bg-white/5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-white/5 focus:ring-orange-500/50 transition-all border-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-500 font-mono">
              <Command className="h-3 w-3" /> K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLang}
            className="flex h-10 px-4 items-center gap-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/5 text-[10px] font-black uppercase"
          >
            <Languages className="h-4 w-4" />
            <span>{lang === "en" ? "English" : "বাংলা"}</span>
          </motion.button>

          <Link to="/profile" className="flex items-center gap-3 rounded-2xl bg-white/5 p-1.5 pr-4 border border-white/5 hover:bg-white/10 transition-all group shrink-0">
            <div className="h-8 w-8 rounded-xl bg-orange-500/20 flex items-center justify-center overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <div className="flex flex-col text-left hidden sm:flex">
              <span className="text-[10px] font-black text-orange-500 uppercase leading-none mb-0.5">My Profile</span>
              <span className="text-xs font-bold text-white truncate max-w-[80px]">
                {profile?.displayName?.split(' ')[0] || "Student"}
              </span>
            </div>
          </Link>

          <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

          <Link to="/notices" className="relative group shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/5"
            >
              <Bell className="h-5 w-5" />
            </motion.div>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#0a0a0a] shadow-lg shadow-orange-500/20"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </header>
  );
};
