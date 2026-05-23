import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Smile, 
  Image as ImageIcon, 
  Users, 
  Circle,
  MoreVertical,
  MessageSquare,
  ShieldCheck,
  Brain,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, where, limit, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";
import { Message } from "@/src/types";
import { cn, formatDate } from "@/src/lib/utils";

export const Chat = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [onlineCount, setOnlineCount] = useState(24); // Mock online count
  const scrollRef = useRef<HTMLDivElement>(null);

  const GLOBAL_ROOM_ID = "global_mathsphere";

  // Initialize/Join Global Room
  useEffect(() => {
    const initGlobalRoom = async () => {
      const roomRef = doc(db, "chatRooms", GLOBAL_ROOM_ID);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          name: "MathSphere Community",
          type: "public",
          members: [],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }
    };
    initGlobalRoom();
  }, []);

  // Fetch Messages for global room
  useEffect(() => {
    const q = query(
      collection(db, "chatRooms", GLOBAL_ROOM_ID, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageUrl) || !user) return;

    const messageContent = inputText.trim();
    const currentImageUrl = imageUrl;
    
    setInputText("");
    setImageUrl("");
    setShowImageInput(false);

    try {
      await addDoc(collection(db, "chatRooms", GLOBAL_ROOM_ID, "messages"), {
        senderId: user.uid,
        senderName: profile?.displayName || "Anonymous",
        senderPhoto: profile?.photoURL || null,
        text: messageContent,
        imageUrl: currentImageUrl || null,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Message send failed", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] -mt-6 -mx-10 glass-card overflow-hidden rounded-none border-x-0 border-y border-white/5">
      <div className="flex-1 flex flex-col bg-[#050505]/40 relative">
        {/* Chat Header */}
        <div className="h-20 flex items-center justify-between px-8 bg-[#0a0a0a]/60 backdrop-blur-3xl border-b border-white/5 z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">MathSphere Community</h2>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" /> {onlineCount} Online • Global Chat
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-gray-800 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] bg-white/5 flex items-center justify-center text-[8px] font-black text-white">
                  +21
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <button className="hover:text-white transition-colors"><ShieldCheck className="h-5 w-5" /></button>
            <button className="hover:text-white transition-colors"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <div className="h-24 w-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-orange-500" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest">Beginning of MathSphere History</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={cn("flex gap-4 group animate-in fade-in slide-in-from-bottom-4 duration-500", isMe ? "flex-row-reverse" : "")}>
                <Link to={`/profile/${msg.senderId}`} className="h-10 w-10 shrink-0 rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:scale-110 transition-transform shadow-xl">
                  <img src={(msg as any).senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} alt="avatar" className="h-full w-full object-cover" />
                </Link>
                <div className={cn("space-y-1.5 max-w-[75%] md:max-w-[60%]", isMe ? "items-end flex flex-col" : "")}>
                  <div className="flex items-center gap-2 px-1">
                    <Link to={`/profile/${msg.senderId}`} className="text-[10px] font-black text-white hover:text-orange-500 uppercase tracking-widest">{msg.senderName}</Link>
                    <span className="text-[8px] text-gray-600 font-bold">{msg.createdAt ? formatDate(msg.createdAt) : "Just now"}</span>
                  </div>
                  <div className={cn(
                    "p-4 rounded-3xl text-sm transition-all relative overflow-hidden",
                    isMe 
                      ? "bg-orange-600 text-white shadow-2xl shadow-orange-600/20 rounded-tr-none" 
                      : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-tl-none group-hover:bg-[#222]"
                  )}>
                    {msg.imageUrl && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img src={msg.imageUrl} alt="attached" className="max-h-72 w-full object-contain" />
                      </div>
                    )}
                    {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0">
          {!user ? (
            <div className="glass-card bg-orange-500/5 border border-orange-500/20 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl shrink-0">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Join GBC mathematics portal to chat</h4>
                  <p className="text-xs text-gray-500">You are currently viewing in read-only mode.</p>
                </div>
              </div>
              <Link
                to="/login"
                className="w-full sm:w-auto text-center px-6 py-3 shrink-0 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black text-xs text-white uppercase tracking-wider transition-all"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {showImageInput && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, y: 10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 10 }}
                    className="mb-4 glass-card bg-orange-500/5 border border-orange-500/20 p-4 rounded-3xl overflow-hidden flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <input 
                      autoFocus
                      placeholder="Paste Image URL here..."
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                    />
                    <button onClick={() => {setShowImageInput(false); setImageUrl("");}} className="text-gray-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form 
                onSubmit={handleSendMessage}
                className="glass-card bg-[#0a0a0a]/80 border border-white/10 p-2 flex items-center gap-2 focus-within:border-orange-500/40 transition-all rounded-[2.5rem] shadow-2xl group"
              >
                <button 
                  type="button" 
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={cn(
                    "p-4 rounded-full transition-all",
                    showImageInput ? "bg-orange-500 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <input 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Write something to the community..."
                  className="flex-1 bg-transparent py-4 px-2 text-sm text-white placeholder-gray-600 outline-none"
                />
                <div className="flex items-center gap-2 pr-2">
                  <button 
                    type="submit"
                    disabled={!inputText.trim() && !imageUrl}
                    className="h-14 w-14 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                  >
                    <Send className="h-6 w-6" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
