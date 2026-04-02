import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Building2, CreditCard, Smartphone, Landmark, Shield, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MobileLayout from "./components/MobileLayout";
import MobileStepIndicator from "./components/MobileStepIndicator";
import MobileAmountCard from "./components/MobileAmountCard";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES } from "@/data/currencies";
import { DELIVERY_METHODS } from "@/data/deliveryMethods";
import { cn } from "@/lib/utils";
import MitoTransitionLoader from "@/components/MitoTransitionLoader";

/* ─── Step definitions ──────────────────────────────────── */
const FLOW_STEPS = [
  { n: 1, label: "Amount" },
  { n: 2, label: "Recipient" },
  { n: 3, label: "Bank" },
  { n: 4, label: "Summary" },
  { n: 5, label: "Payment" },
];

/* ─── Payment method options ─────────────────────────────── */
interface PaymentOption {
  id: string;
  label: string;
  description: string;
  feeLabel: string;
  speed: string;
  icon: React.ReactNode;
  available: boolean;
  badge?: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    description: "Transfer from UK bank account",
    feeLabel: "Free",
    speed: "Instant confirmation",
    icon: <Building2 className="w-5 h-5" />,
    available: true,
  },
  {
    id: "debit_credit_card",
    label: "Debit/Credit Card",
    description: "Visa, Mastercard or Maestro",
    feeLabel: "+1.5%",
    speed: "Instant",
    icon: <CreditCard className="w-5 h-5" />,
    available: false,
    badge: "Coming Soon",
  },
  {
    id: "open_banking",
    label: "Open Banking",
    description: "Pay via bank's mobile app",
    feeLabel: "Free",
    speed: "Instant",
    icon: <Smartphone className="w-5 h-5" />,
    available: false,
    badge: "Coming Soon",
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/* ─── Page ──────────────────────────────────────────────── */
export default function MobilePaymentMethods() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy  = p.get("from")     || "GBP";
  const toCcy    = p.get("to")       || "NGN";
  const amount   = p.get("amount")   || "100";
  const delivery = p.get("delivery") || "bank_deposit";

  const [selected, setSelected] = useState("bank_transfer");

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

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title="Payment"
      showBack
      onBack={() => navigate(`/m/dashboard/send/summary?${urlParams}`)}
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

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-sm font-bold text-[#1E2A24] mb-1">Select Payment Method</h2>
          <p className="text-[11px] text-[#5F6F68]">Choose how you'd like to pay for this transfer</p>
        </motion.div>

        {/* Payment method cards */}
        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.id && opt.available;
            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.08 }}
                type="button"
                disabled={!opt.available}
                onClick={() => {
                  if (opt.available) {
                    setSelected(opt.id);
                  }
                }}
                className={cn(
                  "w-full relative rounded-[12px] border p-4 text-left transition-all",
                  opt.available
                    ? isSelected
                      ? "border-[#1FAF5A] bg-[#EEF7F1] shadow-[0_0_0_1px_#1FAF5A]"
                      : "border-[#E5ECE8] bg-white hover:border-[#1FAF5A]/40"
                    : "border-[#E5ECE8] bg-[#F8FAF9] opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0",
                      opt.available
                        ? isSelected
                          ? "bg-[#1FAF5A] text-white"
                          : "bg-[#EEF7F1] text-[#1FAF5A]"
                        : "bg-[#E5ECE8] text-[#9AA6A0]"
                    )}
                  >
                    {opt.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          opt.available ? "text-[#1E2A24]" : "text-[#9AA6A0]"
                        )}
                      >
                        {opt.label}
                      </span>
                      {opt.badge && (
                        <span className="text-[9px] font-bold bg-[#F4B400]/15 text-[#F4B400] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[11px] mt-0.5",
                        opt.available ? "text-[#5F6F68]" : "text-[#9AA6A0]"
                      )}
                    >
                      {opt.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          opt.available
                            ? opt.feeLabel === "Free"
                              ? "bg-[#EEF7F1] text-[#1FAF5A]"
                              : "bg-[#FFF5F5] text-[#E5484D]"
                            : "bg-[#E5ECE8] text-[#9AA6A0]"
                        )}
                      >
                        {opt.feeLabel}
                      </span>
                      <span
                        className={cn(
                          "text-[10px]",
                          opt.available ? "text-[#5F6F68]" : "text-[#9AA6A0]"
                        )}
                      >
                        {opt.speed}
                      </span>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div className="shrink-0 mt-1">
                    {opt.available ? (
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "border-[#1FAF5A] bg-[#1FAF5A]"
                            : "border-[#DCE3DF] bg-white"
                        )}
                      >
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#DCE3DF] bg-[#F8FAF9]" />
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="flex items-start gap-2.5 bg-[#EEF7F1] border border-[#1FAF5A]/10 rounded-[10px] px-3.5 py-3"
        >
          <Shield className="w-4 h-4 text-[#1FAF5A] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#5F6F68] leading-relaxed">
            All payments are secured with{" "}
            <span className="text-[#1FAF5A] font-semibold">256-bit SSL encryption</span>{" "}
            and processed through FCA-regulated channels.
          </p>
        </motion.div>

      </div>

      {/* ── Sticky footer: Amount card + CTA ─────────────── */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#F8FAF9] via-[#F8FAF9] to-[#F8FAF9]/80 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        <MobileAmountCard
          sendAmount={sendAmt}
          sendSymbol={sendCur.symbol}
          sendCode={fromCcy}
          recvAmount={formatRecv(recvAmt)}
          recvCode={toCcy}
          totalFee={totalFee}
        />
        <div className="px-4 pt-2">
          <Button
            onClick={() => {
              toast.success("Payment method selected");
              navigate(`/m/dashboard/send/payment?${urlParams}&method=${selected}`);
            }}
            disabled={!selected}
            className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
          >
            Continue <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </MobileLayout>
    </>
  );
}
