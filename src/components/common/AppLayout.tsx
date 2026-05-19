import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { motion, AnimatePresence } from "motion/react";

import { Facebook } from "lucide-react";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#050505] text-gray-200 overflow-x-hidden math-gradient">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
          
          <footer className="mt-12 py-8 border-t border-white/5 flex flex-col items-center gap-2 opacity-30 select-none">
            <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white">MathSphere</div>
            <div className="text-[8px] font-medium text-gray-500 uppercase">Developed for Mathematics Department, Govt. Bhola College</div>
            <div className="mt-4 flex flex-col items-center gap-1 pointer-events-auto opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-nowrap">MADE BY "MD. RIYAD"</span>
              <a 
                href="https://www.facebook.com/share/1K6Y6Vngyv/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[8px] text-blue-500 hover:text-blue-400 font-black uppercase tracking-tighter transition-colors"
                title="Facebook Profile"
              >
                <Facebook className="h-3 w-3" />
                <span>Facebook Profile</span>
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
