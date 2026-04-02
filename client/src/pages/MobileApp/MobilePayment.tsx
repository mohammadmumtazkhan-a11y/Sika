import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Landmark, Copy, CheckCircle2, Clock, AlertTriangle,
  Mail, Info, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MobileLayout from "./components/MobileLayout";
import MobileStepIndicator from "./components/MobileStepIndicator";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES } from "@/data/currencies";
import { DELIVERY_METHODS } from "@/data/deliveryMethods";
import { cn } from "@/lib/utils";
import MitoTransitionLoader from "@/components/MitoTransitionLoader";
import SikaReturnLoader from "@/components/SikaReturnLoader";

/* ─── Step definitions ──────────────────────────────────── */
const FLOW_STEPS = [
  { n: 1, label: "Amount" },
  { n: 2, label: "Recipient" },
  { n: 3, label: "Bank" },
  { n: 4, label: "Summary" },
  { n: 5, label: "Payment" },
];

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/* ─── Countdown hook (10 minutes) ───────────────────────── */
function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);

  useEffect(() => {
    if (secs <= 0) return;
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [secs > 0]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const display = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  const fraction = secs / totalSecs;
  return { display, expired: secs <= 0, fraction, secs };
}

/* ─── Transaction status stages ─────────────────────────── */
const STAGES = [
  { label: "Transaction Created", status: "done" as const },
  { label: "Awaiting Payment", status: "active" as const },
  { label: "Payment Received", status: "pending" as const },
  { label: "Processing Transfer", status: "pending" as const },
];

/* ─── Page ──────────────────────────────────────────────── */
export default function MobilePayment() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);
  const [showReturn, setShowReturn] = useState(false);

  const fromCcy  = p.get("from")     || "GBP";
  const toCcy    = p.get("to")       || "NGN";
  const amount   = p.get("amount")   || "100";
  const delivery = p.get("delivery") || "bank_deposit";

  /* ── Amount calculations ──────────────────────────────── */
  const sendCur  = getCurrency(fromCcy);
  const recvCur  = getCurrency(toCcy);
  const rate     = (MOCK_RATES[toCcy] ?? 1) / (MOCK_RATES[fromCcy] ?? 1);
  const baseFee  = TRANSFER_FEES[toCcy] ?? TRANSFER_FEES.DEFAULT;
  const delivFee = (DELIVERY_METHODS[toCcy] ?? []).find((d) => d.id === delivery)?.fee ?? 0;
  const totalFee = baseFee + delivFee;
  const sendAmt  = parseFloat(amount || "0");
  const amtSent  = Math.max(0, sendAmt - totalFee);
  const recvAmt  = amtSent * rate;

  const formatRecv = (v: number) =>
    v.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });

  /* ── Countdown (10 minutes) ──────────────────────────── */
  const { display, expired, fraction } = useCountdown(10 * 60);

  /* ── Stable TXN ref ──────────────────────────────────── */
  const txnRef = useMemo(() => {
    const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `SK${digits}`;
  }, []);

  /* ── Collection details ──────────────────────────────── */
  const bankDetails = [
    { label: "TXN Reference", value: txnRef },
    { label: "Account Name", value: "Sika Payments Ltd" },
    { label: "Bank", value: "Barclays Bank UK PLC" },
    { label: "Sort Code", value: "20-34-56" },
    { label: "Account Number", value: "43987612" },
    { label: "Amount", value: `${sendCur.symbol}${sendAmt.toFixed(2)} ${fromCcy}` },
  ];

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const copyAll = () => {
    const text = bankDetails.map((d) => `${d.label}: ${d.value}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast.success("All details copied to clipboard");
    });
  };

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  /* ── Circular countdown SVG ──────────────────────────── */
  const RADIUS = 38;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE * (1 - fraction);

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title="Payment"
      showBack
      onBack={() => navigate(`/m/dashboard/send/payment-methods?${urlParams}`)}
      showBottomNav={false}
    >
      <div className="px-4 py-4 space-y-4">

        {/* Mito.Money badge */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
          style={{ background: "linear-gradient(135deg, #061410 0%, #0F3A20 55%, #1a5c35 100%)" }}
        >
          <motion.div
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
            className="absolute inset-0 w-1/3 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }}
          />
          <span className="relative shrink-0 flex items-center justify-center w-2 h-2">
            <motion.span
              animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inline-flex w-full h-full rounded-full bg-[#1FAF5A]"
            />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1FAF5A]" />
          </span>
          <Landmark className="w-3 h-3 text-[#F4B400] shrink-0" />
          <span className="text-white/50 text-[11px] font-medium tracking-wide">Powered by</span>
          <span className="text-[#F4B400] text-[11px] font-bold tracking-wide">Mito.Money</span>
          <span className="text-white/30 text-[11px]">&times;</span>
          <span className="text-[#7DDBA5] text-[11px] font-semibold">Sika</span>
        </motion.div>

        {/* Step indicator */}
        <MobileStepIndicator steps={FLOW_STEPS} currentStep={5} />

        {/* ── Transaction status track ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm p-4"
        >
          <h3 className="text-xs font-bold text-[#1E2A24] mb-3">Transaction Status</h3>
          <div className="space-y-0">
            {STAGES.map((stage, idx) => (
              <div key={stage.label} className="flex items-start gap-3">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      stage.status === "done" && "bg-[#1FAF5A]",
                      stage.status === "active" && "border-2 border-[#F4B400] bg-[#FFF9EC]",
                      stage.status === "pending" && "border-2 border-[#DCE3DF] bg-white"
                    )}
                  >
                    {stage.status === "done" && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                    {stage.status === "active" && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-[#F4B400]"
                      />
                    )}
                  </div>
                  {idx < STAGES.length - 1 && (
                    <div
                      className={cn(
                        "w-[2px] h-6",
                        stage.status === "done" ? "bg-[#1FAF5A]" : "bg-[#E5ECE8]"
                      )}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium pt-0.5",
                    stage.status === "done" && "text-[#1FAF5A]",
                    stage.status === "active" && "text-[#F4B400] font-semibold",
                    stage.status === "pending" && "text-[#9AA6A0]"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Countdown timer ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex flex-col items-center py-3"
        >
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                stroke="#E5ECE8"
                strokeWidth="5"
              />
              <circle
                cx="50" cy="50" r={RADIUS}
                fill="none"
                stroke={expired ? "#E5484D" : "#F4B400"}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "text-lg font-bold font-mono",
                  expired ? "text-[#E5484D]" : "text-[#F4B400]"
                )}
              >
                {display}
              </span>
              <span className="text-[9px] text-[#9AA6A0]">remaining</span>
            </div>
          </div>
          <p className="text-[10px] text-[#5F6F68] mt-2 text-center">
            Complete your payment within the time limit
          </p>
        </motion.div>

        {/* ── Expired banner ───────────────────────────────── */}
        {expired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFF5F5] border border-[#E5484D]/20 rounded-[10px] p-3 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-[#E5484D] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#E5484D]">Payment window expired</p>
              <p className="text-[10px] text-[#E5484D]/70 mt-0.5">
                Please go back and start a new transaction.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Bank transfer details card ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[#E5ECE8] flex items-center justify-between">
            <span className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
              Pay with Bank Transfer
            </span>
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#1FAF5A] hover:text-[#178A47] transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy All
            </button>
          </div>

          <div className="px-4 py-3 space-y-0">
            {bankDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between py-2 border-b border-[#F8FAF9] last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#9AA6A0] block">{detail.label}</span>
                  <span className="text-xs font-semibold text-[#1E2A24]">{detail.value}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(detail.label, detail.value)}
                  className={cn(
                    "ml-2 p-1.5 rounded-[6px] transition-all shrink-0",
                    copiedField === detail.label
                      ? "bg-[#EEF7F1] text-[#1FAF5A]"
                      : "bg-[#F8FAF9] text-[#9AA6A0] hover:bg-[#EEF7F1] hover:text-[#1FAF5A]"
                  )}
                >
                  {copiedField === detail.label ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Email notice ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="flex items-start gap-2.5 bg-[#EFF6FF] border border-[#3B82F6]/15 rounded-[10px] px-3.5 py-3"
        >
          <Mail className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#5F6F68] leading-relaxed">
            Bank details have been sent to your{" "}
            <span className="text-[#3B82F6] font-semibold">registered email address</span>.
          </p>
        </motion.div>

        {/* ── Important note ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-start gap-2.5 bg-[#FFF9EC] border border-[#F4B400]/30 rounded-[10px] px-3.5 py-3"
        >
          <Info className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#5F6F68] leading-relaxed">
            <span className="font-bold text-[#1E2A24]">Important:</span> Use the exact TXN reference{" "}
            <span className="font-bold text-[#F4B400]">{txnRef}</span>{" "}
            as your payment reference. Payments without the correct reference may be delayed.
          </p>
        </motion.div>

        {/* ── Dashboard CTA ────────────────────────────────── */}
        <Button
          onClick={() => {
            toast.success("Transaction created! We'll notify you once payment is confirmed.");
            setShowReturn(true);
          }}
          className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold py-3.5 h-auto min-h-[48px] rounded-[10px] text-sm shadow-[0_4px_16px_rgba(31,175,90,0.3)] px-4"
        >
          Go to Dashboard
        </Button>
        {showReturn && <SikaReturnLoader onComplete={() => navigate("/m/dashboard")} />}
      </div>
    </MobileLayout>
    </>
  );
}
