import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, Users, FileText, Brain, Bell, User } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const mobileItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Users, label: "Discuss", path: "/discussions" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Brain, label: "Math AI", path: "/ai" },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:pb-6 lg:hidden pointer-events-none">
      <nav className="mx-auto max-w-md w-full bg-[#0a0a0a]/80 border border-white/10 shadow-2xl shadow-black/80 rounded-3xl backdrop-blur-xl flex items-center justify-around py-3 px-2 pointer-events-auto">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl group transition-all"
            >
              <div 
                className={cn(
                  "flex items-center justify-center p-2 rounded-xl transition-all duration-300 relative",
                  isActive 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-110 -translate-y-1" 
                    : "text-gray-400 group-hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span 
                className={cn(
                  "text-[9px] font-black uppercase tracking-wider mt-1 transition-all duration-300",
                  isActive ? "text-orange-500 opacity-100 font-extrabold" : "text-gray-500 opacity-60"
                )}
              >
                {item.label}
              </span>
              
              {isActive && (
                <motion.div 
                  layoutId="mobile-indicator"
                  className="absolute -bottom-1 h-1 w-4 bg-orange-500 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
