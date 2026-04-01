import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sikaLogo from "@/assets/Sika Logo.png";
import { cn } from "@/lib/utils";

export default function MobileLogin() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const fullRedirect = params.get("redirect") || "/m/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.removeItem("sika_new_user");
      sessionStorage.setItem("sika_kyc_done", "1");
      toast.success("Welcome back! Logging you in…");
      navigate(fullRedirect);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col">

        {/* Green header */}
        <div className="relative bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/80 px-6 pt-[max(20px,env(safe-area-inset-top))] pb-10 text-center overflow-hidden">
          <div className="absolute top-[-40px] right-[-40px] w-[160px] h-[160px] rounded-full bg-[#1FAF5A]/15 blur-3xl pointer-events-none" />
          <img src={sikaLogo} alt="SikaCash" className="h-11 w-auto mx-auto drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] mb-4" />
          <h1 className="font-display text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to continue</p>
        </div>

        {/* Sika badge */}
        <motion.div
          initial={{ opacity: 0, x: -120 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[10px] overflow-hidden mx-5 -mt-5 z-10"
          style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}
        >
          <motion.div animate={{ x: ["-100%", "400%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }} className="absolute inset-0 w-1/4 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
          <div className="relative px-4 py-2.5 flex items-center gap-2.5">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs font-display">S</span>
            </motion.div>
            <div><p className="text-[8px] text-white/70 uppercase tracking-[0.15em] font-semibold">Managed and Powered by</p><p className="text-sm font-extrabold text-white font-display">SikaCash</p></div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleLogin}
          className="flex-1 px-5 pt-6 pb-8 space-y-5"
        >
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#1E2A24] mb-1.5 block">Email Address</label>
            <div className="flex items-center border border-[#DCE3DF] rounded-[10px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
              <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#F8FAF9] self-stretch"><Mail className="w-4 h-4 text-[#178A47]" /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-3 py-3.5 outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-[#1E2A24] mb-1.5 block">Password</label>
            <div className="flex items-center border border-[#DCE3DF] rounded-[10px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
              <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#F8FAF9] self-stretch"><Lock className="w-4 h-4 text-[#178A47]" /></div>
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="flex-1 px-3 py-3.5 outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="px-3 text-[#9AA6A0]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>

          <button type="button" className="text-xs text-[#1FAF5A] font-semibold">Forgot Password?</button>

          <Button type="submit" disabled={loading} className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base shadow-[0_4px_16px_rgba(31,175,90,0.3)] disabled:opacity-60">
            {loading ? "Signing in…" : <><span>Login</span><ArrowRight className="w-4 h-4 ml-1.5" /></>}
          </Button>

          <p className="text-center text-sm text-[#5F6F68]">
            Don't have an account?{" "}
            <button type="button" onClick={() => navigate("/m/register")} className="text-[#1FAF5A] font-semibold">Sign Up</button>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
