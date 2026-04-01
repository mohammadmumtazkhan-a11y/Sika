import { useRef, useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Mail, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MitoLayout from "@/components/MitoLayout";

const STEPS = [
  { number: 1, label: "Register"     },
  { number: 2, label: "Verify Email" },
  { number: 3, label: "Dashboard"    },
];

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email    = params.get("email") || "your registered email";
  const redirect = params.get("redirect") || "";

  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading,   setLoading]   = useState(false);
  const [resendSec, setResendSec] = useState(RESEND_SECONDS);
  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Resend countdown ──────────────────────────────────── */
  useEffect(() => {
    if (resendSec <= 0) return;
    const t = setTimeout(() => setResendSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSec]);

  /* ── OTP input handlers ────────────────────────────────── */
  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text   = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const digits = text.split("");
    const next   = Array(OTP_LENGTH).fill("");
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  const handleResend = () => {
    setResendSec(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    toast.info("Verification code resent to your email.");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((d) => !d)) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Email verified! Welcome to SikaCash.");
      // Mark as new user so dashboard hides transaction history on first login
      sessionStorage.setItem("sika_new_user", "1");
      navigate(redirect || "/dashboard");
    }, 900);
  };

  const isComplete = otp.every(Boolean);

  return (
    <MitoLayout
      steps={STEPS}
      currentStep={2}
      title="Verify Your Email"
      subtitle="One step closer — check your inbox for the code"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        {/* Sika brand badge */}
        <motion.div
          initial={{ opacity: 0, x: -160 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[14px] overflow-hidden mb-4"
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

        <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-[#DCE3DF] overflow-hidden">
          {/* Card header */}
          <div className="bg-[#EEF7F1] px-6 py-5 flex flex-col items-center text-center border-b border-[#DCE3DF]">
            <div className="w-16 h-16 rounded-full bg-white shadow-[0_4px_16px_rgba(31,175,90,0.2)] flex items-center justify-center mb-3">
              <Mail className="w-7 h-7 text-[#1FAF5A]" />
            </div>
            <h2 className="font-display font-bold text-[#1E2A24] text-lg">Check your email</h2>
            <p className="text-sm text-[#5F6F68] mt-1 leading-relaxed">
              We sent a 6-digit verification code to
            </p>
            <p className="text-sm font-semibold text-[#178A47] mt-0.5 break-all">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="px-6 py-6 space-y-6">
            {/* OTP inputs */}
            <div>
              <label className="block text-xs font-semibold text-[#5F6F68] text-center mb-4 uppercase tracking-wider">
                Enter verification code
              </label>
              <div
                className="flex justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
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
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-[10px] border-2 outline-none transition-all duration-200 ${
                      digit
                        ? "border-[#1FAF5A] bg-[#EEF7F1] text-[#1FAF5A]"
                        : "border-[#DCE3DF] bg-white text-[#1E2A24] focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Verify button */}
            <Button
              type="submit"
              disabled={!isComplete || loading}
              className={`w-full font-bold h-12 rounded-[8px] text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                isComplete
                  ? "bg-[#1FAF5A] hover:bg-[#178A47] text-white shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
                  : "bg-[#D3D9D6] text-[#8A9490] cursor-not-allowed"
              }`}
            >
              {loading ? (
                "Verifying…"
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* Resend */}
            <div className="text-center">
              {resendSec > 0 ? (
                <p className="text-sm text-[#9AA6A0]">
                  Resend code in{" "}
                  <span className="font-semibold text-[#5F6F68]">{resendSec}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-sm text-[#1FAF5A] font-semibold hover:text-[#178A47] hover:underline transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
              )}
            </div>

            {/* Help note */}
            <p className="text-center text-[11px] text-[#9AA6A0] leading-relaxed">
              Didn't receive the email? Check your spam folder or contact{" "}
              <button type="button" className="text-[#1FAF5A] hover:underline">
                support
              </button>
              .
            </p>
          </form>
        </div>
      </motion.div>
    </MitoLayout>
  );
}
