import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  Users, 
  FileText, 
  Bell, 
  User, 
  Brain, 
  Settings,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: Users, label: "Discussions", path: "/discussions" },
  { icon: FileText, label: "Notes & Docs", path: "/notes" },
  { icon: Bell, label: "Notice Board", path: "/notices" },
  { icon: Brain, label: "AI Assistant", path: "/ai" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20">
          <Brain className="h-7 w-7 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-white tracking-tighter text-xl leading-none">MathSphere</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mt-1">G.B. College</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-orange-500" : "text-gray-400 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-gray-300">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold text-white">Math Dept</span>
            <span className="truncate text-xs text-gray-500">G.B.C Student</span>
          </div>
          <Settings className="ml-auto h-4 w-4 text-gray-500 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
};
