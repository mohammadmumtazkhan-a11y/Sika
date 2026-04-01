import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Check, Clock, ArrowRight, ChevronLeft,
  Building2, CreditCard, Smartphone, Info, Landmark,
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

/* ─── Payment method definitions ────────────────────────── */
const PAYMENT_METHODS = [
  {
    id:          "bank_transfer",
    icon:        Building2,
    label:       "Bank Transfer",
    description: "Transfer funds directly from your UK bank account",
    fee:         "Free",
    time:        "Instant confirmation",
    available:   true,
    badge:       null,
  },
  {
    id:          "debit_card",
    icon:        CreditCard,
    label:       "Debit / Credit Card",
    description: "Pay securely with Visa, Mastercard or Maestro",
    fee:         "+1.5%",
    time:        "Instant",
    available:   false,
    badge:       "Coming Soon",
  },
  {
    id:          "open_banking",
    icon:        Smartphone,
    label:       "Open Banking",
    description: "Pay instantly via your bank's mobile app",
    fee:         "Free",
    time:        "Instant",
    available:   false,
    badge:       "Coming Soon",
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);
  if (secs > 0) setTimeout(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: secs <= 0 };
}

/* ─── Page ──────────────────────────────────────────────── */
export default function PaymentMethodsPage() {
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

  const { display: timerDisplay, expired } = useCountdown(15 * 60);

  /* ── Selected method ─────────────────────────────────── */
  const [selected, setSelected] = useState("bank_transfer");

  /* ── Continue ────────────────────────────────────────── */
  const handleContinue = () => {
    if (expired) {
      toast.error("Rate expired. Please restart your transfer.");
      navigate(`/send?from=${fromCcy}&to=${toCcy}&amount=${amount}`);
      return;
    }
    if (!selected) {
      toast.error("Please select a payment method to continue.");
      return;
    }
    navigate(
      `/dashboard/send/payment?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}&method=${selected}`
    );
  };

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

        {/* ── 5-step progress ───────────────────────────── */}
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

        {/* ── Content grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: payment method selection ───────────  */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Card header — Mito.Money branding */}
              <div className="px-6 pt-4 pb-3 border-b border-[#E5ECE8]">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-[8px] bg-[#EEF7F1] flex items-center justify-center shrink-0">
                    <Landmark className="w-4 h-4 text-[#1FAF5A]" />
                  </div>
                  <h2 className="font-display font-semibold text-[#1E2A24] text-base">
                    Select Payment Method
                  </h2>
                </div>

                {/* ── Premium "Powered by" animated badge ── */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
                  className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
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

              <div className="p-6 space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon     = method.icon;
                  const isActive = selected === method.id && method.available;

                  return (
                    <motion.button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        if (!method.available) return;
                        setSelected(method.id);
                      }}
                      whileTap={method.available ? { scale: 0.99 } : {}}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-[12px] border-2 text-left transition-all duration-200",
                        isActive
                          ? "border-[#1FAF5A] bg-[#EEF7F1]"
                          : method.available
                            ? "border-[#DCE3DF] bg-white hover:border-[#1FAF5A]/40 hover:bg-[#F8FAF9] cursor-pointer"
                            : "border-[#E5ECE8] bg-[#F8FAF9] opacity-60 cursor-not-allowed"
                      )}
                    >
                      {/* Radio circle */}
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                        isActive ? "border-[#1FAF5A]" : "border-[#DCE3DF]",
                      )}>
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#1FAF5A]" />}
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        isActive ? "bg-[#1FAF5A]/15" : "bg-[#F0F4F2]"
                      )}>
                        <Icon className={cn("w-5 h-5", isActive ? "text-[#1FAF5A]" : "text-[#9AA6A0]")} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-[#1FAF5A]" : "text-[#1E2A24]"
                          )}>
                            {method.label}
                          </p>
                          {method.badge && (
                            <span className="text-[10px] font-semibold bg-[#E5ECE8] text-[#9AA6A0] px-2 py-0.5 rounded-full">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#5F6F68] mt-0.5">{method.description}</p>
                      </div>

                      {/* Fee + time */}
                      <div className="text-right shrink-0 ml-2">
                        <p className={cn(
                          "text-sm font-bold",
                          method.fee === "Free" ? "text-[#1FAF5A]" : "text-[#1E2A24]"
                        )}>
                          {method.fee}
                        </p>
                        <p className="text-[10px] text-[#9AA6A0] mt-0.5 flex items-center gap-0.5 justify-end">
                          <Clock className="w-2.5 h-2.5" />
                          {method.time}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Security note */}
              <div className="mx-6 mb-5 flex items-start gap-2.5 bg-[#F8FAF9] border border-[#DCE3DF] rounded-[10px] px-4 py-3">
                <Info className="w-3.5 h-3.5 text-[#9AA6A0] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#5F6F68] leading-relaxed">
                  All payments are processed securely via Mito.Money's FCA-regulated payment infrastructure.
                  Your payment details are never stored on Sika's servers.
                </p>
              </div>
            </motion.div>

            {/* ── Back / Continue buttons ────────────── */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard/send/summary?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
                  )
                }
                variant="outline"
                className="flex-1 h-12 rounded-[10px] border-[#DCE3DF] text-[#1E2A24] font-semibold hover:border-[#1FAF5A] hover:text-[#1FAF5A] transition-all"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selected || expired}
                className="flex-1 h-12 bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold rounded-[10px] shadow-[0_4px_16px_rgba(31,175,90,0.25)] transition-all duration-200 disabled:opacity-60"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
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
                {expired && (
                  <div className="bg-[#FFF5F5] border border-[#E5484D]/20 rounded-[8px] p-3 text-xs text-[#E5484D] flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    Rate has expired. Please go back and restart your transfer.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
