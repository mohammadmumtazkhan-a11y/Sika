import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { clearMitoFlow } from "@/components/MitoTransitionLoader";
import {
  User, Mail, Lock, Eye, EyeOff, Phone, Gift,
  Apple, Smartphone, Users, CheckCircle, Globe, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sikaLogo from "@/assets/Sika Logo.png";
import { cn } from "@/lib/utils";

/* ── Country list (send-from countries + popular destinations) ── */
const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Nigeria", "Ghana", "Kenya", "India", "South Africa",
  "United Arab Emirates", "Germany", "France", "China", "Japan",
  "Senegal", "Ivory Coast", "Cameroon", "Guinea",
];

const STATS = [
  { icon: Users,       value: "30,000",    label: "Customers"  },
  { icon: CheckCircle, value: "8,784,289", label: "Transfers"  },
  { icon: Globe,       value: "5,248",     label: "Locations"  },
];

/* ── Reusable field wrapper ─────────────────────────────────── */
function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1E2A24] mb-1">{label}</label>
      <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden transition-all duration-200 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
        <div className="w-10 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
          <Icon className="w-4 h-4 text-[#178A47]" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [, navigate] = useLocation();
  useEffect(() => { clearMitoFlow(); }, []);
  const search = useSearch();
  const params = new URLSearchParams(search);
  const redirectPath = params.get("redirect") || "/dashboard";

  const [form, setForm] = useState({
    firstName:    "",
    middleName:   "",
    lastName:     "",
    email:        "",
    country:      "United Kingdom",
    referralCode: "",
    mobile:       "",
    password:     "",
    confirmPass:  "",
  });
  const [showPass,     setShowPass]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [otpConsent,   setOtpConsent]   = useState(false);
  const [marketingOk,  setMarketingOk]  = useState(false);
  const [loading,      setLoading]      = useState(false);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.mobile || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPass) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    // Stub — registration not yet implemented
    setTimeout(() => {
      setLoading(false);
      // Persist registration data so KYC page can auto-fill it
      sessionStorage.setItem("sika_reg", JSON.stringify({
        firstName:  form.firstName,
        middleName: form.middleName,
        lastName:   form.lastName,
        email:      form.email,
        country:    form.country,
        phone:      form.mobile,
      }));
      toast.success("Account created! Please verify your email.");
      navigate(`/verify-email?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirectPath)}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Marketing panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/60" />
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-[#1FAF5A]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full bg-[#178A47]/25 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <img
            src={sikaLogo}
            alt="SikaCash"
            className="h-12 w-auto object-contain self-start brightness-0 invert mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="font-display text-4xl font-extrabold text-white mb-3 leading-tight">
              Get the app
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-xs">
              Download our app for free to send money online in minutes. Track your payments and view your transfer history from anywhere.
            </p>

            {/* Store buttons */}
            <div className="flex gap-3 mb-8 flex-wrap">
              <button className="flex items-center gap-2 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-3.5 py-2 rounded-[10px] transition-colors duration-200 border border-white/10">
                <Apple className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-[8px] text-white/60 uppercase tracking-wider leading-none">Available on the</p>
                  <p className="text-xs font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-3.5 py-2 rounded-[10px] transition-colors duration-200 border border-white/10">
                <Smartphone className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-[8px] text-white/60 uppercase tracking-wider leading-none">Get it on</p>
                  <p className="text-xs font-semibold leading-tight">Google Play</p>
                </div>
              </button>
            </div>

            {/* Promo banner */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-[12px] p-4 mb-6 max-w-xs">
              <p className="text-[#F4B400] text-[10px] font-bold uppercase tracking-wider mb-3">
                Current Offer(s)
              </p>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1FAF5A]/20 border-2 border-[#F4B400]/40 flex items-center justify-center shrink-0 text-xl">
                  🎁
                </div>
                <div>
                  <p className="text-white font-bold font-display text-sm leading-tight mb-1">
                    New Customer Bonus
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Sign up today and get your first transfer fee waived!
                  </p>
                  <p className="text-[#F4B400] text-[10px] font-semibold mt-1.5">
                    Win Every Week: 1st Apr – 30th Apr 2025
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-3 gap-2">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="bg-[#178A47] rounded-[10px] px-2 py-3 flex flex-col items-center text-center"
                >
                  <Icon className="w-4 h-4 text-white/80 mb-1" />
                  <p className="font-display font-extrabold text-white text-sm leading-none">{value}</p>
                  <p className="text-white/60 text-[9px] mt-0.5 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Trustpilot */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <span key={i} className="text-[#F4B400] text-sm">★</span>
                ))}
              </div>
              <span className="text-white/60 text-[10px]">Excellent · 436 reviews on</span>
              <span className="text-[#1FAF5A] text-[10px] font-bold">Trustpilot</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Registration form ───────────────────── */}
      <div className="w-full lg:w-[55%] flex items-start justify-center bg-white overflow-y-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img src={sikaLogo} alt="SikaCash" className="h-14 w-auto object-contain" />
          </div>
          <p className="text-center text-[#1FAF5A] font-semibold text-sm mb-4">
            Register your account, it's free!
          </p>

          {/* Sika brand badge */}
          <motion.div
            initial={{ opacity: 0, x: -160 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[14px] overflow-hidden mb-5"
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

          <form onSubmit={handleRegister} className="space-y-3">
            {/* First Name */}
            <Field label="First Name" icon={User}>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="First Name"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
              />
            </Field>

            {/* Middle Name */}
            <Field label="Middle Name (optional)" icon={User}>
              <input
                type="text"
                value={form.middleName}
                onChange={set("middleName")}
                placeholder="Middle Name (optional)"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
              />
            </Field>

            {/* Last Name */}
            <Field label="Last Name" icon={User}>
              <input
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Last Name"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
              />
            </Field>

            {/* Email */}
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="Email"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
                autoComplete="email"
              />
            </Field>

            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-[#1E2A24] mb-1">Country</label>
              <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden transition-all duration-200 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
                <div className="w-10 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
                  <Globe className="w-4 h-4 text-[#178A47]" />
                </div>
                <select
                  value={form.country}
                  onChange={set("country")}
                  className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm appearance-none cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#9AA6A0] mr-3 shrink-0 pointer-events-none" />
              </div>
            </div>

            {/* Referral Code */}
            <Field label="Referral Code (optional)" icon={Gift}>
              <input
                type="text"
                value={form.referralCode}
                onChange={set("referralCode")}
                placeholder="Referral Code (optional)"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
              />
            </Field>

            {/* Mobile */}
            <Field label="Mobile" icon={Phone}>
              <input
                type="tel"
                value={form.mobile}
                onChange={set("mobile")}
                placeholder="Mobile"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
                autoComplete="tel"
              />
            </Field>

            {/* Password */}
            <Field label="Password" icon={Lock}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Password"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="px-3 text-[#9AA6A0] hover:text-[#1FAF5A] transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" icon={Lock}>
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPass}
                onChange={set("confirmPass")}
                placeholder="Confirm Password"
                className="flex-1 px-3 py-2.5 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="px-3 text-[#9AA6A0] hover:text-[#1FAF5A] transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </Field>

            {/* Consents */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={otpConsent}
                  onChange={(e) => setOtpConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#1FAF5A] shrink-0"
                />
                <span className="text-xs text-[#5F6F68] leading-relaxed">
                  Send me OTP (One Time Password) via SMS to complete registration
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingOk}
                  onChange={(e) => setMarketingOk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#1FAF5A] shrink-0"
                />
                <span className="text-xs text-[#5F6F68] leading-relaxed">
                  Send me Email / SMS about Notifications, Offers, and Promotions
                </span>
              </label>
            </div>

            {/* Terms */}
            <p className="text-[11px] text-[#5F6F68] leading-relaxed">
              By tapping "Sign Up" you agree to our{" "}
              <button type="button" className="text-[#1FAF5A] hover:underline">Terms of Use</button>{" "}
              and consent to the collection, use, disclosure, and transfer (including cross-border transfer)
              of your personal information as described in our{" "}
              <button type="button" className="text-[#1FAF5A] hover:underline">Privacy Policy</button>.
            </p>

            <p className="text-[11px] text-[#5F6F68] leading-relaxed">
              By providing a mobile number above, you hereby expressly consent to receiving informational
              messages regarding the SikaCash Pay services (e.g., confirmation that the beneficiary received
              funds) at such number via text message. Please review our{" "}
              <button type="button" className="text-[#1FAF5A] hover:underline">Privacy Policy</button>{" "}
              to learn more about how Africa Remittance Company dba SikaCash uses your information.
            </p>

            {/* reCAPTCHA placeholder */}
            <div className="border border-[#DCE3DF] rounded-[8px] p-3 flex items-center justify-between bg-[#F8FAF9]">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#1FAF5A]" />
                <span className="text-sm text-[#1E2A24]">I'm not a robot</span>
              </label>
              <div className="text-right">
                <div className="text-[8px] text-[#9AA6A0] leading-tight">reCAPTCHA</div>
                <div className="text-[7px] text-[#9AA6A0] leading-tight">Privacy · Terms</div>
              </div>
            </div>

            {/* Register button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#178A47] hover:bg-[#0F6B36] text-white font-bold py-3 h-12 rounded-[8px] text-base transition-all duration-200 disabled:opacity-70 mt-1"
            >
              {loading ? "Registering…" : "Register"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center space-y-1.5">
            <p className="text-xs text-[#5F6F68]">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#1FAF5A] font-semibold hover:text-[#178A47] hover:underline transition-colors"
              >
                Login here
              </button>
            </p>
            <p>
              <button
                onClick={() => navigate("/")}
                className="text-xs text-[#5F6F68] hover:text-[#1FAF5A] hover:underline transition-colors"
              >
                Back To Home
              </button>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-6 pt-5 border-t border-[#E5ECE8] flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[#5F6F68]">
              <Lock className="w-3.5 h-3.5 text-[#1FAF5A]" />
              <span className="font-semibold text-[9px] uppercase tracking-wide text-[#5F6F68]">
                Secure SSL Encryption
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#1A1F71] text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-widest">
                VISA
              </div>
              <div className="flex">
                <div className="w-5 h-5 rounded-full bg-[#EB001B]" />
                <div className="w-5 h-5 rounded-full bg-[#F79E1B] -ml-2.5 opacity-90" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
