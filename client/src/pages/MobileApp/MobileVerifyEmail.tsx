import { useRef, useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Mail, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import sikaLogo from "@/assets/Sika Logo.png";
import MitoTransitionLoader from "@/components/MitoTransitionLoader";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function MobileVerifyEmail() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email") || "your email";
  const redirect = params.get("redirect") || "/m/kyc";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendSec > 0) {
      const t = setTimeout(() => setResendSec((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendSec]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((d) => !d)) { toast.error("Please enter the full 6-digit code."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Email verified! Welcome to SikaCash.");
      sessionStorage.setItem("sika_new_user", "1");
      navigate(redirect);
    }, 900);
  };

  const isComplete = otp.every(Boolean);

  return (
    <>
      <div className="min-h-screen bg-[#F8FAF9] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white flex flex-col">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/80 px-6 pt-[max(20px,env(safe-area-inset-top))] pb-10 text-center overflow-hidden">
          <img src={sikaLogo} alt="SikaCash" className="h-10 w-auto mx-auto drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)] mb-4" />
          <h1 className="font-display text-xl font-extrabold text-white">Verify Your Email</h1>
          <p className="text-white/60 text-xs mt-1">One step closer — check your inbox</p>
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
          <div className="relative px-4 py-2 flex items-center gap-2.5">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0"><span className="text-white font-black text-xs font-display">S</span></motion.div>
            <div><p className="text-[8px] text-white/70 uppercase tracking-[0.15em] font-semibold">Managed and Powered by</p><p className="text-sm font-extrabold text-white font-display">SikaCash</p></div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 px-5 pt-6 pb-8"
        >
          <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-[#DCE3DF] overflow-hidden">
            {/* Icon */}
            <div className="bg-[#EEF7F1] px-6 py-5 flex flex-col items-center text-center border-b border-[#DCE3DF]">
              <div className="w-14 h-14 rounded-full bg-white shadow-[0_4px_16px_rgba(31,175,90,0.2)] flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-[#1FAF5A]" />
              </div>
              <h2 className="font-display font-bold text-[#1E2A24] text-base">Check your email</h2>
              <p className="text-xs text-[#5F6F68] mt-1">We sent a 6-digit code to</p>
              <p className="text-xs font-semibold text-[#178A47] mt-0.5 break-all">{email}</p>
            </div>

            <form onSubmit={handleVerify} className="px-5 py-5 space-y-5">
              {/* OTP */}
              <div>
                <p className="text-[10px] font-semibold text-[#5F6F68] uppercase tracking-wider text-center mb-3">Enter Verification Code</p>
                <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-13 text-center text-xl font-bold border-2 border-[#DCE3DF] rounded-[10px] outline-none focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] text-[#1E2A24] transition-all"
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={!isComplete || loading} className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3 h-12 rounded-[10px] text-base disabled:opacity-50 shadow-[0_4px_16px_rgba(31,175,90,0.3)]">
                {loading ? "Verifying…" : <><span>Verify Email</span><ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>

              <div className="text-center">
                {resendSec > 0 ? (
                  <p className="text-xs text-[#9AA6A0]">Resend code in <span className="font-bold text-[#1E2A24]">{resendSec}s</span></p>
                ) : (
                  <button type="button" onClick={() => { setResendSec(RESEND_SECONDS); setOtp(Array(OTP_LENGTH).fill("")); toast.info("Code resent!"); }} className="text-xs text-[#1FAF5A] font-semibold flex items-center gap-1 mx-auto">
                    <RotateCcw className="w-3 h-3" /> Resend Code
                  </button>
                )}
              </div>

              <p className="text-center text-[10px] text-[#9AA6A0]">
                Didn't receive the email? Check your spam folder or contact <button type="button" className="text-[#1FAF5A] font-medium">support</button>.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}

