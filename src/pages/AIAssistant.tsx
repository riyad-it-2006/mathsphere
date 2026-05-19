import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Brain, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/src/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/src/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
}

export const AIAssistant = () => {
  const { profile } = useAuth();
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your Math Department AI. How can I help you with your studies or department queries today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !image) || isLoading) return;

    const userMsg = input.trim();
    const currentImage = image;
    
    setInput("");
    setImage(null);
    setMessages(prev => [...prev, { role: "user", content: (userMsg || "Analyzing image...") + (currentImage ? " [Attached Image]" : "") }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          image: currentImage,
          context: {
            name: profile?.displayName,
            batch: profile?.batch,
            role: profile?.role
          }
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Academic AI Assistant</h1>
          <p className="text-xs text-gray-500">Powered by Gemini 3.0 • Math Expert</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 glass-card overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i}
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-white/10",
                msg.role === "ai" ? "bg-orange-500 text-white" : "bg-white/10 text-gray-400"
              )}>
                {msg.role === "ai" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                msg.role === "ai" 
                  ? "bg-white/5 border border-white/5 text-gray-200" 
                  : "bg-orange-500 text-white font-medium"
              )}>
                <div className="markdown-body prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4 items-center text-gray-500 text-xs animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" /> Gemini is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {image && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative inline-block"
            >
              <img src={image} alt="Selected" className="h-20 w-20 rounded-xl object-cover border-2 border-orange-500" />
              <button 
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all border border-white/5"
            title="Attach Math Problem Photo"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Calculus, Linear Algebra, or upload a photo of your problem..."
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 pl-14 pr-16 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-3 h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/40 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
