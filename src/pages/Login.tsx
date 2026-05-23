import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  ShieldCheck, 
  Phone, 
  Lock, 
  User, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";

type AuthMode = "login" | "register" | "forgot";

export const Login = () => {
  const { login, loginWithEmail, registerWithEmail, sendPasswordReset, authError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryInput, setRecoveryInput] = useState("");

  const resetForms = () => {
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setRecoveryInput("");
    setSuccessMsg(null);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePhone = (num: string): boolean => {
    // Bangladeshi / standard numeric validation (digit count between 8 to 15)
    return /^[0-9]{8,15}$/.test(num.replace(/[^0-9]/g, ""));
  };

  const validateEmail = (mail: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    if (!password) return;

    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!validateEmail(email)) return;
    if (password.length < 6) return;

    setIsLoading(true);
    try {
      await registerWithEmail(name, email, password);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryInput.trim()) return;

    setIsLoading(true);
    setSuccessMsg(null);
    try {
      await sendPasswordReset(recoveryInput);
      setSuccessMsg(
        "A password reset link has been dispatched to your associated email. Please check your spam/junk foldered inbox if not received immediately."
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] math-gradient p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Editorial Brand Concept */}
        <div className="space-y-8 select-none">
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
              Connecting students and teachers through real-time communication, lecture distribution, and advanced academic tools.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/5">
            <div className="space-y-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Secured Portal</h3>
              <p className="text-xs text-gray-500">End-to-end encrypted profile and record indexing.</p>
            </div>
            <div className="space-y-2">
              <Brain className="h-6 w-6 text-blue-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Edu AI Sync</h3>
              <p className="text-xs text-gray-500">Direct integration with Gemini models for instant mathematics help.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 md:p-12 space-y-8 shadow-2xl shadow-orange-500/5 border border-white/10 relative overflow-hidden"
        >
          {/* Main Error Alert */}
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center"
              >
                {authError}
              </motion.div>
            )}
            
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab switches between Login and Create Account */}
          {mode !== "forgot" && (
            <div className="flex bg-white/5 rounded-2xl p-1 gap-1 border border-white/5">
              <button
                type="button"
                onClick={() => { setMode("login"); resetForms(); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  mode === "login" 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); resetForms(); }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                  mode === "register" 
                    ? "bg-white text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLoginSubmit}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Access Hub</h2>
                  <p className="text-xs text-gray-500 mt-1">Authenticate using your registered email credentials.</p>
                </div>

                <div className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        placeholder="john.doe@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-4 py-4 text-sm text-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[10px] font-bold text-orange-500 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-12 py-4 text-sm text-white transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-[0.98] transition-all px-8 py-5 text-sm font-black text-white mt-6 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-orange-500/10"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Let's Start</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {mode === "register" && (
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRegisterSubmit}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Create Profile</h2>
                  <p className="text-xs text-gray-500 mt-1">Join GBC mathematics portal securely.</p>
                </div>

                <div className="space-y-3">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Email Address (Required for Password Recovery)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        placeholder="john.doe@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Password (6+ Characters)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-12 py-3.5 text-sm text-white transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-[0.98] transition-all px-8 py-5 text-sm font-black text-white mt-6 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-orange-500/10"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Register</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {mode === "forgot" && (
              <motion.form
                key="forgot-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRecoverySubmit}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => { setMode("login"); resetForms(); }}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </button>
                  <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password?</h2>
                  <p className="text-xs text-gray-500">Provide your registered Email Address or Phone Number. We'll search and send a password reset mail corresponding to this address.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Registered Email or Phone</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01712345678 or name@domain.com"
                      value={recoveryInput}
                      onChange={(e) => setRecoveryInput(e.target.value)}
                      className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 outline-none border border-white/10 focus:border-orange-500/50 rounded-2xl pl-12 pr-4 py-4 text-sm text-white transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 active:scale-[0.98] transition-all px-8 py-5 text-sm font-black text-white mt-6 cursor-pointer disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-orange-500/10"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Recovery Email</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Google Quick Access Divider */}
          <div className="relative my-6 text-center select-none">
            <span className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 border-t border-white/5" />
            <span className="relative bg-[#050505] lg:bg-[#0c0c0d] px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              Alternative access
            </span>
          </div>

          {/* Google Button */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-white text-black px-8 py-4.5 text-xs font-black hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <img src="https://www.google.com/favicon.ico" alt="google" className="h-4 w-4" />
              <span>Continue with Google</span>
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSetupGuide(true)}
                className="text-[10px] font-extrabold text-orange-500/80 hover:text-orange-500 hover:underline transition-all uppercase tracking-wider"
              >
                গুগল লগইন চালু করার নির্দেশিকা (Google Setup Guide)
              </button>
            </div>
          </div>

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between select-none">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 w-8 rounded-full bg-gray-800 border-[1.5px] border-[#0c0c0d] overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user avatar" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="h-8 w-8 rounded-full bg-orange-500 border-[1.5px] border-[#0c0c0d] flex items-center justify-center text-[9px] font-black text-white">
                +45
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">450+ students active now</p>
          </div>

        </motion.div>
      </div>

      {/* Supabase Google Auth Setup Guide Modal */}
      <AnimatePresence>
        {showSetupGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-[#0c0c0d] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 text-white shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <img src="https://www.google.com/favicon.ico" alt="google" className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-orange-500">Google Auth Configuration</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(false)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/14 text-white font-extrabold rounded-lg text-xs tracking-wider uppercase transition-all"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                <p className="font-bold text-white text-sm">
                  আপনার Supabase প্রজেক্টে গুগল লগইন চালু করার জন্য নিচের ৪টি সহজ ধাপ সম্পন্ন করুন:
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 bg-white/5 rounded-2xl space-y-1 border border-white/5">
                    <span className="text-orange-500 font-black tracking-wider uppercase text-[10px] block">ধাপ ১: Supabase Dashboard</span>
                    <p>আপনার Supabase একাউন্টে প্রবেশ করুন: <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-orange-400 font-bold hover:underline">supabase.com/dashboard</a></p>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl space-y-1 border border-white/5">
                    <span className="text-orange-500 font-black tracking-wider uppercase text-[10px] block">ধাপ ২: Google Provider Select</span>
                    <p>মেনু থেকে <strong>Authentication</strong> tab-এ যান, তারপর <strong>Providers</strong>-এ ক্লিক করে <strong>Google</strong> সিলেক্ট করুন এবং এটি <strong>Enabled</strong> করুন।</p>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl space-y-1 border border-white/5">
                    <span className="text-orange-500 font-black tracking-wider uppercase text-[10px] block">ধাপ ৩: OAuth Client Credentials</span>
                    <p>গুগল ডেভলপার কনসোল থেকে আপনার <strong>Client ID</strong> এবং <strong>Client Secret</strong> কী দুইটি এনে Supabase-এর Google Provider সেটিংসে পেস্ট করে Save করুন।</p>
                  </div>

                  <div className="p-3.5 bg-white/5 rounded-2xl space-y-1 border border-white/5">
                    <span className="text-orange-500 font-black tracking-wider uppercase text-[10px] block">ধাপ ৪: Callback URL Copy-Paste</span>
                    <p className="mb-2">Google Cloud Console-এর <strong>Authorized redirect URIs</strong> বক্সে নিচের callback url টি কপি করে বসিয়ে দিন:</p>
                    <code className="block bg-black/60 p-3 rounded-xl font-mono text-[11px] text-orange-400 select-all border border-orange-500/25 break-all text-center">
                      https://fshohs.supabase.co/auth/v1/callback
                    </code>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <p className="font-bold text-orange-400 mb-1">প্রোভাইডার আন-এনেবল্ড সমস্যাটি কেন হয়?</p>
                  <p className="text-[11px] text-gray-400">
                    Supabase গুগলের সাথে ওঅথ সিকিউরিটি গেটওয়ে রক্ষা করার জন্য এই ক্রিডেনশিয়ালগুলোর ওপর নির্ভর করে। আপনার Supabase কনসোল থেকে Google Provider অন করে কীগুলো সাবমিট করলেই "Continue with Google" বাটনটি ১০০% সুন্দরভাবে কাজ করা শুরু করবে।
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(false)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black uppercase text-xs tracking-wider rounded-2rem transition-all"
                >
                  ঠিক আছে (Got It)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
