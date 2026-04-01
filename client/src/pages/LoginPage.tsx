import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Apple, Smartphone, Users, CheckCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sikaLogo from "@/assets/Sika Logo.png";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: Users,       value: "2,708,861", label: "Customers"  },
  { icon: CheckCircle, value: "8,784,247", label: "Transfers"  },
  { icon: Globe,       value: "5,248",     label: "Locations"  },
];

export default function LoginPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  // The `redirect` param is already a full path (possibly with its own query string)
  const fullRedirect = params.get("redirect") || "/dashboard";

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setLoading(true);
    // Stub — navigates to redirect target (auth will be wired to backend later)
    setTimeout(() => {
      setLoading(false);
      // Existing users are already KYC'd — skip KYC step
      sessionStorage.removeItem("sika_new_user");
      sessionStorage.setItem("sika_kyc_done", "1");
      toast.success("Welcome back! Logging you in…");
      navigate(fullRedirect);
    }, 900);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Marketing panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/60" />
        {/* Blurred circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#1FAF5A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full bg-[#178A47]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <img
            src={sikaLogo}
            alt="SikaCash"
            className="h-12 w-auto object-contain self-start brightness-0 invert mb-10"
          />

          {/* App download section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="font-display text-4xl font-extrabold text-white mb-4 leading-tight">
              Get the app
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-7 max-w-sm">
              Download our app for free to send money online in minutes. Track your payments and view your transfer history from anywhere.
            </p>

            {/* Store buttons */}
            <div className="flex gap-3 mb-10 flex-wrap">
              <button className="flex items-center gap-2.5 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-4 py-2.5 rounded-[10px] transition-colors duration-200 border border-white/10">
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider leading-none">Available on the</p>
                  <p className="text-sm font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2.5 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-4 py-2.5 rounded-[10px] transition-colors duration-200 border border-white/10">
                <Smartphone className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider leading-none">Get it on</p>
                  <p className="text-sm font-semibold leading-tight">Google Play</p>
                </div>
              </button>
            </div>

            {/* Promo banner */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[14px] p-5 mb-8 max-w-sm">
              <p className="text-[#F4B400] text-xs font-bold uppercase tracking-wider mb-3">
                Current Offer(s)
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1FAF5A]/20 border-2 border-[#F4B400]/40 flex items-center justify-center shrink-0 text-2xl">
                  🎁
                </div>
                <div>
                  <p className="text-white font-bold font-display text-sm leading-tight mb-1">
                    New Customer Bonus
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Sign up today and get your first transfer fee waived. Limited time offer.
                  </p>
                  <p className="text-[#F4B400] text-[10px] font-semibold mt-1">
                    Valid: 1st Apr – 30th Apr 2025
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="bg-[#178A47] rounded-[12px] px-3 py-4 flex flex-col items-center text-center"
              >
                <Icon className="w-5 h-5 text-white/80 mb-1.5" />
                <p className="font-display font-extrabold text-white text-lg leading-none">{value}</p>
                <p className="text-white/60 text-[10px] mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right: Login form ─────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-white px-6 py-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          {/* Logo (shown on mobile too) */}
          <div className="flex justify-center mb-5">
            <img src={sikaLogo} alt="SikaCash" className="h-14 w-auto object-contain" />
          </div>

          {/* Sika brand badge */}
          <motion.div
            initial={{ opacity: 0, x: -160 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[14px] overflow-hidden mb-6"
            style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}
          >
            <motion.div
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
              className="absolute inset-0 w-1/4 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            />
            <div className="relative px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center"
                  >
                    <span className="text-white font-black text-sm font-display drop-shadow-sm">S</span>
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
                  />
                </div>
                <div>
                  <p className="text-[9px] text-white/80 uppercase tracking-[0.16em] font-semibold leading-none mb-1">Managed and Powered by</p>
                  <p className="text-base font-extrabold text-white leading-none tracking-wide font-display drop-shadow-sm">SikaCash</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {[{ delay: 0, bg: "bg-white" }, { delay: 0.5, bg: "bg-yellow-200" }, { delay: 1, bg: "bg-white" }].map(({ delay, bg }, i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.5, 1.5, 0.5] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
                    className={`w-2 h-2 rounded-full ${bg}`} />
                ))}
              </div>
            </div>
          </motion.div>

          <p className="text-center text-[#1FAF5A] font-semibold text-base mb-8">
            Welcome, please login to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
                Email Address
              </label>
              <div
                className={cn(
                  "flex items-center border rounded-[8px] overflow-hidden transition-all duration-200",
                  "border-[#DCE3DF] focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]"
                )}
              >
                <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#F8FAF9] self-stretch">
                  <Mail className="w-4 h-4 text-[#178A47]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 px-3 py-3 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
                Password
              </label>
              <div
                className={cn(
                  "flex items-center border rounded-[8px] overflow-hidden transition-all duration-200",
                  "border-[#DCE3DF] focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]"
                )}
              >
                <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#F8FAF9] self-stretch">
                  <Lock className="w-4 h-4 text-[#178A47]" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 px-3 py-3 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="px-3 text-[#9AA6A0] hover:text-[#1FAF5A] transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[#1FAF5A] hover:text-[#178A47] hover:underline transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#178A47] hover:bg-[#0F6B36] text-white font-bold py-3 h-12 rounded-[8px] text-base transition-all duration-200 disabled:opacity-70 mt-2"
            >
              {loading ? "Logging in…" : "Login"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-[#5F6F68]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate(`/register?redirect=${encodeURIComponent(fullRedirect)}`)}
                className="text-[#1FAF5A] font-semibold hover:text-[#178A47] hover:underline transition-colors"
              >
                New Sign up
              </button>
            </p>
            <p>
              <button
                onClick={() => navigate("/")}
                className="text-sm text-[#5F6F68] hover:text-[#1FAF5A] hover:underline transition-colors"
              >
                Back To Home
              </button>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-[#E5ECE8] flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#5F6F68] text-xs">
              <Lock className="w-3.5 h-3.5 text-[#1FAF5A]" />
              <span className="font-semibold text-[10px] uppercase tracking-wide">Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#1A1F71] text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-widest">
                VISA
              </div>
              <div className="flex">
                <div className="w-6 h-6 rounded-full bg-[#EB001B]" />
                <div className="w-6 h-6 rounded-full bg-[#F79E1B] -ml-3 opacity-90" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
