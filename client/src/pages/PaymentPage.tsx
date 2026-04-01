import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Clock, Copy, CopyCheck, Mail,
  ChevronLeft, ArrowRight, AlertTriangle, Info,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES } from "@/data/currencies";
import { DELIVERY_METHODS } from "@/data/deliveryMethods";
import { cn } from "@/lib/utils";

/* ─── Step definitions ──────────────────────────────────── */
const FLOW_STEPS = [
  { n: 1, label: "Amount"    },
  { n: 2, label: "Recipient" },
  { n: 3, label: "Bank"      },
  { n: 4, label: "Summary"   },
  { n: 5, label: "Payment"   },
];
const CURRENT_STEP = 5;

/* ─── TXN status stages ─────────────────────────────────── */
const TXN_STAGES = [
  { key: "created",    label: "Transaction\nCreated"   },
  { key: "awaiting",   label: "Awaiting\nPayment"      },
  { key: "received",   label: "Payment\nReceived"      },
  { key: "processing", label: "Processing\nTransfer"   },
];

/* ─── Mock collection account (Mito.Money UK) ──────────── */
const COLLECTION = {
  txnRef:      "SK" + Math.floor(10000000 + Math.random() * 90000000),
  accountName: "Sika Payments Ltd",
  bankName:    "Barclays Bank UK PLC",
  sortCode:    "20-34-56",
  accountNo:   "43987612",
};

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);
  if (secs > 0) setTimeout(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  const pct = Math.round((secs / totalSecs) * 100);
  return { display: `${m}:${s}`, expired: secs <= 0, pct };
}

/* ─── Copy row component ────────────────────────────────── */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#F0F4F2] last:border-0">
      <div>
        <p className="text-xs text-[#9AA6A0] mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-[#1E2A24] font-mono tracking-wide">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className={cn(
          "w-8 h-8 rounded-[6px] flex items-center justify-center transition-all duration-200 shrink-0 ml-4",
          copied
            ? "bg-[#EEF7F1] text-[#1FAF5A]"
            : "bg-[#F8FAF9] hover:bg-[#EEF7F1] text-[#9AA6A0] hover:text-[#1FAF5A]"
        )}
      >
        {copied
          ? <CopyCheck className="w-3.5 h-3.5" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </button>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function PaymentPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

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
  const recvAmt  = Math.max(0, (sendAmt - totalFee) * rate);

  const formatRecv = (v: number) =>
    v.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });

  /* ── 10-minute payment countdown ─────────────────────── */
  const { display: timerDisplay, expired, pct } = useCountdown(10 * 60);

  /* ── Copy All ──────────────────────────────────────────  */
  const [allCopied, setAllCopied] = useState(false);
  const copyAll = () => {
    const text = [
      `Transaction Ref: ${COLLECTION.txnRef}`,
      `Account Name: ${COLLECTION.accountName}`,
      `Bank: ${COLLECTION.bankName}`,
      `Sort Code: ${COLLECTION.sortCode}`,
      `Account Number: ${COLLECTION.accountNo}`,
      `Amount: ${sendCur.symbol}${sendAmt.toFixed(2)} ${fromCcy}`,
    ].join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setAllCopied(true);
    toast.success("All payment details copied to clipboard!");
    setTimeout(() => setAllCopied(false), 3000);
  };

  /* ── Memoised TXN ref (stable across re-renders) ─────── */
  const txnRef = useMemo(() => COLLECTION.txnRef, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Page heading ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <h1 className="font-display text-2xl font-bold text-[#1E2A24]">Send Money</h1>
          <span className="text-sm text-[#9AA6A0] font-medium">
            step {CURRENT_STEP} of {FLOW_STEPS.length}
          </span>
        </div>

        {/* ── 5-step progress (all done) ─────────────────  */}
        <div className="flex items-start mb-8">
          {FLOW_STEPS.map((step, idx) => {
            const done   = step.n < CURRENT_STEP;
            const active = step.n === CURRENT_STEP;
            return (
              <div key={step.n} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    done   && "bg-[#1FAF5A] text-white shadow-[0_2px_8px_rgba(31,175,90,0.35)]",
                    active && "border-2 border-[#1FAF5A] bg-white text-[#1FAF5A] ring-4 ring-[#1FAF5A]/15",
                    !done && !active && "bg-[#E5ECE8] text-[#9AA6A0]",
                  )}>
                    {done ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.n}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block whitespace-nowrap",
                    (done || active) ? "text-[#1FAF5A]" : "text-[#9AA6A0]",
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < FLOW_STEPS.length - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-2 -mt-5 sm:-mt-6 rounded-full",
                    done ? "bg-[#1FAF5A]" : "bg-[#E5ECE8]",
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Back link ─────────────────────────────────── */}
        <button
          onClick={() =>
            navigate(
              `/dashboard/send/payment-methods?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
            )
          }
          className="flex items-center gap-1.5 text-sm text-[#5F6F68] hover:text-[#1FAF5A] transition-colors mb-6 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Payment Methods
        </button>

        {/* ── Content grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: main payment panel ─────────────────  */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── TXN status track ──────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  {TXN_STAGES.map((stage, idx) => {
                    const done   = stage.key === "created";
                    const active = stage.key === "awaiting";
                    return (
                      <div key={stage.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5 shrink-0">
                          {/* Circle */}
                          <div className={cn(
                            "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all",
                            done   && "bg-[#1FAF5A] border-[#1FAF5A]",
                            active && "bg-white border-[#1FAF5A] ring-4 ring-[#1FAF5A]/15",
                            !done && !active && "bg-white border-[#DCE3DF]",
                          )}>
                            {done
                              ? <Check className="w-4 h-4 text-white stroke-[2.5]" />
                              : active
                                ? <Clock className="w-4 h-4 text-[#1FAF5A]" />
                                : (
                                  <div className="w-2 h-2 rounded-full bg-[#DCE3DF]" />
                                )
                            }
                          </div>
                          {/* Label */}
                          <span className={cn(
                            "text-[10px] font-medium text-center leading-tight whitespace-pre-line hidden sm:block",
                            (done || active) ? "text-[#1FAF5A]" : "text-[#9AA6A0]",
                          )}>
                            {stage.label}
                          </span>
                        </div>
                        {/* Connector */}
                        {idx < TXN_STAGES.length - 1 && (
                          <div className={cn(
                            "h-[2px] flex-1 mx-2 -mt-5 sm:-mt-6 rounded-full",
                            done ? "bg-[#1FAF5A]" : "bg-[#E5ECE8]",
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* ── Countdown warning ─────────────────────── */}
            <AnimatePresence>
              {!expired ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-start gap-4 bg-[#FFF9EC] border border-[#F4B400]/40 rounded-[14px] px-5 py-4"
                >
                  {/* Circular timer */}
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#F4B400" strokeWidth="4" strokeOpacity="0.2" />
                      <circle
                        cx="28" cy="28" r="24"
                        fill="none"
                        stroke="#F4B400"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 24}`}
                        strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold font-mono text-[#B8860B]">{timerDisplay}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1E2A24] mb-1">Complete your payment</p>
                    <p className="text-xs text-[#5F6F68] leading-relaxed">
                      Please make your bank transfer within{" "}
                      <span className="font-semibold text-[#B8860B]">10 minutes</span>.
                      Your transaction will be automatically cancelled if payment is not received in time.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 bg-[#FFF5F5] border border-[#E5484D]/30 rounded-[14px] px-5 py-4"
                >
                  <AlertTriangle className="w-5 h-5 text-[#E5484D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#E5484D]">Payment window expired</p>
                    <p className="text-xs text-[#5F6F68] mt-0.5 leading-relaxed">
                      Your transaction has been automatically cancelled. Please start a new transfer from the Dashboard.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Pay by Bank Transfer card ─────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Card header */}
              <div className="px-6 pt-4 pb-3 border-b border-[#E5ECE8]">
                {/* Top row: title + Copy All */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[8px] bg-[#EEF7F1] flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4 text-[#1FAF5A]" />
                    </div>
                    <h2 className="font-display font-semibold text-[#1E2A24] text-base">
                      Pay with Bank Transfer
                    </h2>
                  </div>
                  <button
                    onClick={copyAll}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] border transition-all duration-200",
                    allCopied
                      ? "bg-[#EEF7F1] border-[#1FAF5A]/30 text-[#1FAF5A]"
                      : "bg-white border-[#DCE3DF] text-[#5F6F68] hover:border-[#1FAF5A] hover:text-[#1FAF5A]"
                  )}
                >
                  {allCopied
                    ? <><CopyCheck className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy All</>
                  }
                </button>
              </div>

              {/* ── Premium "Powered by" animated badge ── */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
                className="mt-3 relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
                style={{
                  background: "linear-gradient(135deg, #061410 0%, #0F3A20 55%, #1a5c35 100%)",
                }}
              >
                {/* Animated shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                  className="absolute inset-0 w-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
                {/* Pulsing live dot */}
                <span className="relative shrink-0 flex items-center justify-center w-2 h-2">
                  <motion.span
                    animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inline-flex w-full h-full rounded-full bg-[#1FAF5A]"
                  />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1FAF5A]" />
                </span>
                <span className="text-white/50 text-[11px] font-medium tracking-wide whitespace-nowrap">
                  Powered by
                </span>
                <span className="text-[#F4B400] text-[11px] font-bold tracking-wide whitespace-nowrap">
                  Mito.Money
                </span>
                <span className="text-white/30 text-[11px] whitespace-nowrap">in partnership with</span>
                <span className="text-[#7DDBA5] text-[11px] font-semibold whitespace-nowrap">
                  Sika
                </span>
              </motion.div>
              </div>

              <div className="px-6 pt-4 pb-2">
                <div className="bg-[#EEF7F1] rounded-[10px] px-4 py-3 mb-4">
                  <p className="text-sm text-[#5F6F68]">
                    Kindly make a payment of{" "}
                    <span className="font-bold text-[#1E2A24]">
                      {sendCur.symbol}{sendAmt.toFixed(2)} {fromCcy}
                    </span>
                    {" "}to the bank account details below
                  </p>
                </div>

                {/* Copy rows */}
                <CopyRow label="Transaction Reference No." value={txnRef} />
                <CopyRow label="Account Name"              value={COLLECTION.accountName} />
                <CopyRow label="Bank Name"                 value={COLLECTION.bankName} />
                <CopyRow label="Sort Code"                 value={COLLECTION.sortCode} />
                <CopyRow label="Account Number"            value={COLLECTION.accountNo} />
              </div>

              {/* Email notice */}
              <div className="mx-6 mb-5 mt-2 flex items-start gap-3 bg-[#EFF6FF] border border-[#3B82F6]/20 rounded-[10px] px-4 py-3.5">
                <Mail className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1E2A24] mb-0.5">
                    Bank details sent to your email
                  </p>
                  <p className="text-xs text-[#5F6F68] leading-relaxed">
                    We've sent the payment details to your registered email address for reference.
                    You can also complete the transfer using those details.
                  </p>
                </div>
              </div>

              {/* Important note */}
              <div className="mx-6 mb-5 flex items-start gap-2.5 bg-[#FFF9EC] border border-[#F4B400]/30 rounded-[10px] px-4 py-3">
                <Info className="w-3.5 h-3.5 text-[#F4B400] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#5F6F68] leading-relaxed">
                  <span className="font-semibold text-[#1E2A24]">Important:</span>{" "}
                  Please use the exact Transaction Reference No. as your payment reference so we
                  can match your payment automatically. Your transfer will be processed once
                  payment is confirmed.
                </p>
              </div>
            </motion.div>

            {/* ── Take me to Dashboard button ───────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full group border border-[#DCE3DF] hover:border-[#1FAF5A]/50 bg-white hover:bg-[#F8FAF9] rounded-[14px] px-6 py-4 flex flex-col items-center transition-all duration-200"
              >
                <span className="text-sm font-semibold text-[#1E2A24] group-hover:text-[#1FAF5A] transition-colors">
                  I've noted the details — take me to Dashboard
                </span>
                <span className="text-xs text-[#9AA6A0] mt-0.5">
                  I'll complete the bank transfer within 10 minutes
                </span>
              </button>
            </motion.div>

          </div>

          {/* ── Right: Amount summary ─────────────────────  */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden sticky top-6"
            >
              <div className="px-5 py-3.5 border-b border-[#E5ECE8] flex items-center justify-between">
                <h3 className="font-display font-semibold text-[#1E2A24] text-sm">Amount</h3>
                <div className={cn(
                  "flex items-center gap-1.5 text-sm font-bold font-mono px-2.5 py-1 rounded-[6px]",
                  expired ? "bg-[#FFF5F5] text-[#E5484D]" : "bg-[#EEF7F1] text-[#1FAF5A]",
                )}>
                  <Clock className="w-3.5 h-3.5" />
                  {timerDisplay}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#5F6F68]">You Send</span>
                  <span className="text-sm font-semibold text-[#1E2A24]">
                    {sendCur.symbol}{sendAmt.toFixed(2)} {fromCcy}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#5F6F68]">Fees</span>
                  <span className="text-sm font-semibold text-[#1E2A24]">
                    {sendCur.symbol}{totalFee.toFixed(2)} {fromCcy}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E5ECE8]">
                  <span className="text-sm font-bold text-[#1E2A24]">Total to Pay</span>
                  <span className="text-base font-extrabold text-[#1E2A24] font-display">
                    {sendCur.symbol}{sendAmt.toFixed(2)} {fromCcy}
                  </span>
                </div>
                <div className="bg-[#EEF7F1] rounded-[10px] p-4 mt-1">
                  <p className="text-xs text-[#5F6F68] mb-1.5">They Receive</p>
                  <p className="font-display font-extrabold text-[#1FAF5A] text-[1.375rem] leading-tight">
                    {formatRecv(recvAmt)} {toCcy}
                  </p>
                </div>

                {/* TXN reference in summary panel */}
                <div className="pt-2 border-t border-[#E5ECE8]">
                  <p className="text-xs text-[#9AA6A0] mb-1">Transaction Reference</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono font-bold text-[#1E2A24] tracking-wide">{txnRef}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(txnRef).catch(() => {});
                        toast.success("Reference copied!");
                      }}
                      className="text-[#9AA6A0] hover:text-[#1FAF5A] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {expired && (
                  <div className="bg-[#FFF5F5] border border-[#E5484D]/20 rounded-[8px] p-3 text-xs text-[#E5484D] flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Payment window expired. Please start a new transfer.
                  </div>
                )}
              </div>

              {/* New Transfer button */}
              {!expired && (
                <div className="px-5 pb-5">
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="w-full h-10 bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold rounded-[8px] text-sm shadow-[0_3px_12px_rgba(31,175,90,0.2)] transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
