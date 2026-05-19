import React from "react";
import { motion } from "motion/react";
import { Brain, Sparkles, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

export const Login = () => {
  const { login, authError } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] math-gradient p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Brand */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">MathSphere</h1>
              <p className="text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase mt-2">Govt. Bhola College</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
              A Universe of <span className="text-orange-500">Theorems</span> & <span className="text-purple-500">Logic.</span>
            </h2>
            <p className="text-lg text-gray-400 font-medium max-w-md">
              Connecting students and teachers through real-time communication and advanced AI study tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
            <div className="space-y-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Secured</h3>
              <p className="text-xs text-gray-500">End-to-end encrypted profile and data storage.</p>
            </div>
            <div className="space-y-2">
              <Brain className="h-6 w-6 text-blue-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Powered</h3>
              <p className="text-xs text-gray-500">Powered by Gemini for academic assistance.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 space-y-12 shadow-2xl shadow-orange-500/10 border-white/20"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500">Please sign in with your institutional account to continue.</p>
          </div>

          <div className="space-y-4">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center"
              >
                {authError}
              </motion.div>
            )}

            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-white px-8 py-5 text-sm font-black text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoggingIn ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="google" className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Continue with Google
                </>
              )}
            </button>
            
            <button className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-white/5 border border-white/10 px-8 py-5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <Mail className="h-5 w-5" />
              Login with Email
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-10 rounded-full bg-gray-800 border-2 border-[#050505] overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full bg-orange-500 border-2 border-[#050505] flex items-center justify-center text-[10px] font-black text-white">
                +45
              </div>
            </div>
            <p className="text-xs text-gray-500 font-bold">450+ students active now</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
