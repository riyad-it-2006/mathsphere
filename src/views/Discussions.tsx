import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  MessageCircle, 
  ArrowBigUp, 
  ArrowBigDown, 
  Tag, 
  Clock, 
  User as UserIcon,
  Filter,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useAuth } from "@/src/hooks/useAuth";
import { Discussion } from "@/src/types";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn, formatDate } from "@/src/lib/utils";

export const Discussions = () => {
  const { user, profile } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });

  useEffect(() => {
    const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discussion));
      setDiscussions(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.title.trim()) return;

    try {
      await addDoc(collection(db, "discussions"), {
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags.split(",").map(t => t.trim()).filter(Boolean),
        authorId: user.uid,
        authorName: profile?.displayName || "Anonymous",
        upvotes: 0,
        downvotes: 0,
        createdAt: serverTimestamp(),
      });
      setIsCreating(false);
      setNewPost({ title: "", content: "", tags: "" });
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Calculator className="h-8 w-8 text-orange-500" /> Math Discussions
          </h1>
          <p className="text-gray-500 text-sm mt-1">Ask questions, share solutions, and discuss complex topics.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="h-5 w-5" /> Start New Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter Topics
            </h3>
            <div className="space-y-2">
              {["Calculus", "Linear Algebra", "Geometry", "Statistics", "PDE", "Number Theory"].map((tag) => (
                <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                  <div className="h-4 w-4 rounded border border-white/10 bg-white/5 group-hover:border-orange-500/50 transition-colors" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Discussions List */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence>
            {isCreating && (
              <motion.form 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleCreatePost}
                className="glass-card p-8 space-y-4 border-orange-500/30"
              >
                <input 
                  autoFocus
                  placeholder="Problem Title (e.g., Finding the limit of x^x as x -> 0)"
                  className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-600 outline-none"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
                <textarea 
                  placeholder="Describe the problem or share knowledge. Use $ LaTeX $ for math equations."
                  className="w-full bg-transparent text-gray-300 placeholder-gray-700 outline-none min-h-[150px] resize-none py-2"
                  value={newPost.content}
                  onChange={e => setNewPost({...newPost, content: e.target.value})}
                />
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <Tag className="h-3 w-3 text-gray-500" />
                    <input 
                      placeholder="Tags (comma separated)"
                      className="bg-transparent text-xs text-white outline-none w-40"
                      value={newPost.tags}
                      onChange={e => setNewPost({...newPost, tags: e.target.value})}
                    />
                  </div>
                  <div className="ml-auto flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="rounded-xl bg-orange-500 px-6 py-2 text-xs font-bold text-white"
                    >
                      Post Discussion
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {discussions.map((post) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={post.id} 
                className="glass-card p-6 group cursor-pointer hover:border-white/20 transition-all shadow-lg hover:shadow-orange-500/5"
              >
                <div className="flex gap-6">
                  {/* Vote Side */}
                  <div className="flex flex-col items-center gap-1 text-gray-500">
                    <button className="p-1 hover:text-orange-500 transition-colors">
                      <ArrowBigUp className="h-7 w-7" />
                    </button>
                    <span className="text-sm font-black text-white">{post.upvotes - post.downvotes}</span>
                    <button className="p-1 hover:text-blue-500 transition-colors">
                      <ArrowBigDown className="h-7 w-7" />
                    </button>
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 space-y-3">
                    <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-orange-500 transition-colors">
                      <UserIcon className="h-3 w-3" /> {post.authorName} • <Clock className="h-3 w-3" /> {post.createdAt ? formatDate(post.createdAt) : "Just now"}
                    </Link>
                    <h2 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{post.title}</h2>
                    <div className="markdown-body prose prose-invert prose-sm max-w-none line-clamp-3 opacity-80">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <MessageCircle className="h-4 w-4" /> 12 Comments
                      </div>
                      <div className="flex gap-2">
                        {post.tags?.map(tag => (
                          <span key={tag} className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-bold text-orange-400 border border-white/5">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
