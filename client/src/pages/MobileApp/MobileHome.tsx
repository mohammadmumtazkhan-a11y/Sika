import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, Clock, ArrowRight, Globe, Zap, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES, SEND_CURRENCIES, RECEIVE_CURRENCIES } from "@/data/currencies";
import { cn } from "@/lib/utils";
import sikaLogo from "@/assets/Sika Logo.png";

function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export default function MobileHome() {
  const [, navigate] = useLocation();
  const [sendAmt, setSendAmt] = useState("100");
  const [sendCcy, setSendCcy] = useState("GBP");
  const [recvCcy, setRecvCcy] = useState("NGN");

  const sendCur = getCurrency(sendCcy);
  const recvCur = getCurrency(recvCcy);
  const rate = (MOCK_RATES[recvCcy] ?? 1) / (MOCK_RATES[sendCcy] ?? 1);
  const fee = TRANSFER_FEES[recvCcy] ?? TRANSFER_FEES.DEFAULT;
  const amt = parseFloat(sendAmt || "0");
  const recvAmt = Math.max(0, (amt - fee) * rate);

  const formatRecv = (v: number) =>
    v.toLocaleString("en-GB", { minimumFractionDigits: recvCur.decimals, maximumFractionDigits: recvCur.decimals });

  const isLoggedIn = sessionStorage.getItem("sika_kyc_done") === "1" || sessionStorage.getItem("sika_new_user") === "1";

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen flex flex-col">

        {/* ── Dark hero header ──────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/80 px-5 pt-[max(12px,env(safe-area-inset-top))] pb-8 overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-[#1FAF5A]/15 blur-3xl pointer-events-none" />

          {/* Logo + Auth buttons */}
          <div className="flex items-center justify-between mb-6">
            <img src={sikaLogo} alt="SikaCash" className="h-9 w-auto drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
            {!isLoggedIn ? (
              <div className="flex gap-2">
                <button onClick={() => navigate("/m/login")} className="text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                  Login
                </button>
                <button onClick={() => navigate("/m/register")} className="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1FAF5A] hover:bg-[#178A47] transition-colors">
                  Sign Up
                </button>
              </div>
            ) : (
              <button onClick={() => navigate("/m/dashboard")} className="text-white text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1FAF5A] hover:bg-[#178A47] transition-colors">
                Dashboard
              </button>
            )}
          </div>

          {/* Orange Sika badge */}
          <motion.div
            initial={{ opacity: 0, x: -120 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[10px] overflow-hidden mb-5"
            style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}
          >
            <motion.div
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
              className="absolute inset-0 w-1/4 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            />
            <div className="relative px-4 py-2.5 flex items-center gap-2.5">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0"
              >
                <span className="text-white font-black text-xs font-display">S</span>
              </motion.div>
              <div>
                <p className="text-[8px] text-white/70 uppercase tracking-[0.15em] font-semibold">Managed and Powered by</p>
                <p className="text-sm font-extrabold text-white font-display">SikaCash</p>
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-2xl font-extrabold text-white leading-tight mb-2"
          >
            Send Money To{"\n"}
            <span className="text-[#1FAF5A]">Your Loved Ones</span>
          </motion.h1>
          <p className="text-white/60 text-sm mb-1">Fast, secure transfers from the UK.</p>
        </div>

        {/* ── Calculator card ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mx-4 -mt-4 bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#DCE3DF] overflow-hidden"
        >
          <div className="p-4 space-y-3">
            {/* You Send */}
            <div>
              <label className="text-[10px] text-[#5F6F68] uppercase tracking-wider font-semibold mb-1 block">You Send</label>
              <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden focus-within:border-[#1FAF5A]">
                <input
                  type="number" value={sendAmt} onChange={(e) => setSendAmt(e.target.value)}
                  className="flex-1 px-3 py-3 outline-none text-[#1E2A24] font-bold text-lg bg-white min-w-0"
                  placeholder="0.00"
                />
                <select
                  value={sendCcy} onChange={(e) => setSendCcy(e.target.value)}
                  className="border-l border-[#DCE3DF] bg-[#F8FAF9] px-2 py-3 text-sm font-semibold text-[#1E2A24] outline-none appearance-none cursor-pointer"
                >
                  {SEND_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
              </div>
            </div>

            {/* Rate */}
            <div className="flex items-center justify-center bg-[#EEF7F1] rounded-full px-3 py-1.5">
              <span className="text-xs font-bold text-[#1FAF5A]">
                1 {sendCcy} = {rate >= 1000 ? rate.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : rate.toFixed(2)} {recvCcy}
              </span>
            </div>

            {/* They Receive */}
            <div>
              <label className="text-[10px] text-[#5F6F68] uppercase tracking-wider font-semibold mb-1 block">They Receive</label>
              <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden bg-[#F8FAF9]">
                <div className="flex-1 px-3 py-3 text-[#1E2A24] font-bold text-lg">{formatRecv(recvAmt)}</div>
                <select
                  value={recvCcy} onChange={(e) => setRecvCcy(e.target.value)}
                  className="border-l border-[#DCE3DF] bg-[#EEF7F1] px-2 py-3 text-sm font-semibold text-[#1E2A24] outline-none appearance-none cursor-pointer"
                >
                  {RECEIVE_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-between text-xs text-[#5F6F68]">
              <span>Transfer Fee</span>
              <span className="font-semibold text-[#1E2A24]">{sendCur.symbol}{fee.toFixed(2)}</span>
            </div>

            <Button
              onClick={() => navigate("/m/login")}
              className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3 h-12 rounded-[10px] text-base shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
            >
              Send Money <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-center text-[10px] text-[#9AA6A0]">
              *Rate locked for 15 minutes. Final rate confirmed at time of payment.
            </p>
          </div>
        </motion.div>

        {/* ── Trust badges ─────────────────────────── */}
        <div className="px-4 pt-6 pb-4 space-y-3">
          {[
            { icon: Shield, title: "FCA Regulated", desc: "128-bit encrypted transfers" },
            { icon: Clock, title: "Fast Transfers", desc: "Arrives within minutes" },
            { icon: Globe, title: "30+ Countries", desc: "Africa, Asia, and beyond" },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-white rounded-[12px] border border-[#E5ECE8] px-4 py-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-full bg-[#EEF7F1] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#1FAF5A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1E2A24]">{title}</p>
                <p className="text-[11px] text-[#5F6F68]">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom safe area spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
