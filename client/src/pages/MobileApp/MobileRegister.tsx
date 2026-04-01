import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sikaLogo from "@/assets/Sika Logo.png";

const inputCls =
  "flex-1 px-3 py-3.5 outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white";
const rowCls =
  "flex items-center border border-[#DCE3DF] rounded-[10px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]";
const iconBoxCls =
  "w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#F8FAF9] self-stretch shrink-0";

export default function MobileRegister() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") || "/m/dashboard";

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPw: "", country: "United Kingdom" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.mobile || !form.password) {
      toast.error("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirmPw) { toast.error("Passwords do not match."); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }

    setLoading(true);
    sessionStorage.setItem("sika_reg", JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email }));
    setTimeout(() => {
      setLoading(false);
      toast.success("Registration successful! Please verify your email.");
      navigate(`/m/verify-email?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirect)}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/80 px-6 pt-[max(16px,env(safe-area-inset-top))] pb-8 text-center overflow-hidden">
          <div className="absolute bottom-[-40px] left-[-40px] w-[140px] h-[140px] rounded-full bg-[#1FAF5A]/15 blur-3xl pointer-events-none" />
          <img src={sikaLogo} alt="SikaCash" className="h-10 w-auto mx-auto drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] mb-3" />
          <h1 className="font-display text-xl font-extrabold text-white">Create Account</h1>
          <p className="text-white/60 text-xs mt-1">It's free — start sending in minutes</p>
        </div>

        {/* Sika badge */}
        <motion.div
          initial={{ opacity: 0, x: -120 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[10px] overflow-hidden mx-5 -mt-4 z-10"
          style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}
        >
          <motion.div animate={{ x: ["-100%", "400%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }} className="absolute inset-0 w-1/4 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
          <div className="relative px-4 py-2 flex items-center gap-2.5">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0"><span className="text-white font-black text-xs font-display">S</span></motion.div>
            <div><p className="text-[8px] text-white/70 uppercase tracking-[0.15em] font-semibold">Managed and Powered by</p><p className="text-sm font-extrabold text-white font-display">SikaCash</p></div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleRegister}
          className="flex-1 px-5 pt-5 pb-8 space-y-3.5 overflow-y-auto"
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">First Name *</label><div className={rowCls}><div className={iconBoxCls}><User className="w-4 h-4 text-[#178A47]" /></div><input value={form.firstName} onChange={set("firstName")} placeholder="First" className={inputCls} /></div></div>
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Last Name *</label><div className={rowCls}><div className={iconBoxCls}><User className="w-4 h-4 text-[#178A47]" /></div><input value={form.lastName} onChange={set("lastName")} placeholder="Last" className={inputCls} /></div></div>
          </div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Email *</label><div className={rowCls}><div className={iconBoxCls}><Mail className="w-4 h-4 text-[#178A47]" /></div><input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls} /></div></div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Mobile *</label><div className={rowCls}><div className={iconBoxCls}><Phone className="w-4 h-4 text-[#178A47]" /></div><input type="tel" value={form.mobile} onChange={set("mobile")} placeholder="+44 7XXX XXXXXX" className={inputCls} /></div></div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Country *</label><div className={rowCls}><div className={iconBoxCls}><Globe className="w-4 h-4 text-[#178A47]" /></div><select value={form.country} onChange={set("country")} className={inputCls + " appearance-none cursor-pointer"}><option>United Kingdom</option><option>United States</option><option>Canada</option><option>Australia</option></select></div></div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Password *</label><div className={rowCls}><div className={iconBoxCls}><Lock className="w-4 h-4 text-[#178A47]" /></div><input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Min 8 characters" className={inputCls} /><button type="button" onClick={() => setShowPw(!showPw)} className="px-3 text-[#9AA6A0]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Confirm Password *</label><div className={rowCls}><div className={iconBoxCls}><Lock className="w-4 h-4 text-[#178A47]" /></div><input type="password" value={form.confirmPw} onChange={set("confirmPw")} placeholder="Re-enter password" className={inputCls} /></div></div>

          <Button type="submit" disabled={loading} className="w-full bg-[#178A47] hover:bg-[#0F6B36] text-white font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-60 mt-2">
            {loading ? "Registering…" : <><span>Register</span><ArrowRight className="w-4 h-4 ml-1.5" /></>}
          </Button>

          <p className="text-center text-sm text-[#5F6F68]">
            Already registered?{" "}
            <button type="button" onClick={() => navigate("/m/login")} className="text-[#1FAF5A] font-semibold">Login</button>
          </p>
        </motion.form>
      </div>
    </div>
  );
}
