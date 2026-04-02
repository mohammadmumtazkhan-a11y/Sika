import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Info, Landmark, Shield,
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

/* ─── Delivery label lookup ─────────────────────────────── */
const DELIVERY_LABEL: Record<string, string> = {
  bank_deposit: "Bank Deposit",
  mobile_money: "Mobile Money",
  upi: "UPI Transfer",
  "m-pesa": "M-Pesa",
  cash_pickup: "Cash Pickup",
  alipay: "Alipay",
};

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/* ─── Page ──────────────────────────────────────────────── */
export default function MobileSummary() {
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
  const amtSent  = Math.max(0, sendAmt - totalFee);
  const recvAmt  = amtSent * rate;

  const formatRecv = (v: number) =>
    v.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });

  const formatRate = (r: number) =>
    r >= 1000 ? r.toLocaleString("en-GB", { maximumFractionDigits: 0 })
    : r >= 10 ? r.toFixed(2)
    : r.toFixed(4);

  /* ── Read session data ────────────────────────────────── */
  const [recipient, setRecipient] = useState<Record<string, string>>({});
  const [bank, setBank] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      setRecipient(JSON.parse(sessionStorage.getItem("sika_recipient") || "{}"));
    } catch {}
    try {
      setBank(JSON.parse(sessionStorage.getItem("sika_bank") || "{}"));
    } catch {}
  }, []);

  /* ── Corridor flags for display ─────────────────────────  */
  const isSwift  = ["AED", "EUR", "USD"].includes(toCcy);
  const isUPI    = toCcy === "INR" && delivery === "upi";
  const isINR    = toCcy === "INR" && !isUPI;
  const isMobile = delivery === "mobile_money" || delivery === "m-pesa";

  const fullName = `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim() || "N/A";

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  /* ── Row component ────────────────────────────────────── */
  function Row({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
    return (
      <div className="flex justify-between items-start py-1.5">
        <span className="text-xs text-[#5F6F68]">{label}</span>
        <span
          className={cn(
            "text-xs text-right max-w-[55%] break-words",
            bold && "font-bold",
            green ? "text-[#1FAF5A] font-extrabold" : "text-[#1E2A24] font-semibold"
          )}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title="Transfer Summary"
      showBack
      onBack={() => navigate(`/m/dashboard/send/bank?${urlParams}`)}
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
        <MobileStepIndicator steps={FLOW_STEPS} currentStep={4} />

        {/* ── Amount section ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[#E5ECE8]">
            <span className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">Amount Details</span>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <Row label="You Send" value={`${sendCur.symbol}${sendAmt.toFixed(2)} ${fromCcy}`} bold />
            <Row label="Transfer Fee" value={`${sendCur.symbol}${totalFee.toFixed(2)} ${fromCcy}`} />
            <Row label="Amount Sent" value={`${sendCur.symbol}${amtSent.toFixed(2)} ${fromCcy}`} />
            <Row label="Exchange Rate" value={`1 ${fromCcy} = ${formatRate(rate)} ${toCcy}`} />
            <div className="border-t border-[#E5ECE8] mt-2 pt-2">
              <Row label="They Receive" value={`${recvCur.symbol}${formatRecv(recvAmt)} ${toCcy}`} green />
            </div>
          </div>
        </motion.div>

        {/* ── Recipient section ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[#E5ECE8]">
            <span className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">Recipient Details</span>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <Row label="Full Name" value={fullName} bold />
            {recipient.relationship && (
              <Row label="Relationship" value={recipient.relationship} />
            )}
            {recipient.reason && (
              <Row label="Reason" value={recipient.reason} />
            )}
            <Row label="Delivery Method" value={DELIVERY_LABEL[delivery] ?? delivery} />

            {/* Corridor-adaptive bank fields */}
            {isUPI && bank.upiId && (
              <Row label="UPI ID" value={bank.upiId} />
            )}
            {isSwift && (
              <>
                {bank.bic && <Row label="BIC/SWIFT" value={bank.bic} />}
                {bank.iban && <Row label="IBAN" value={bank.iban} />}
              </>
            )}
            {!isUPI && !isSwift && (
              <>
                {bank.accountNo && (
                  <Row label={isMobile ? "Mobile Number" : "Account Number"} value={bank.accountNo} />
                )}
                {bank.bankName && (
                  <Row label={isMobile ? "Provider" : "Bank"} value={bank.bankName} />
                )}
                {isINR && bank.ifsc && (
                  <Row label="IFSC Code" value={bank.ifsc} />
                )}
              </>
            )}

            {recipient.narration && (
              <div className="border-t border-[#E5ECE8] mt-2 pt-2">
                <Row label="Narration" value={recipient.narration} />
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Total section ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="bg-[#EEF7F1] rounded-[14px] border border-[#1FAF5A]/20 px-4 py-4"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#1E2A24]">Total Due</span>
            <span className="text-base font-extrabold text-[#1E2A24] font-display">
              {sendCur.symbol}{sendAmt.toFixed(2)} {fromCcy}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#1E2A24]">They Receive</span>
            <span className="text-xl font-extrabold text-[#1FAF5A] font-display">
              {recvCur.symbol}{formatRecv(recvAmt)} {toCcy}
            </span>
          </div>
        </motion.div>

        {/* ── Legal notice ───────────────────────────────── */}
        <div className="flex items-start gap-2.5 bg-[#FFF9EC] border border-[#F4B400]/30 rounded-[10px] px-3.5 py-3">
          <Shield className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#5F6F68] leading-relaxed">
            By clicking Continue you agree to Sika's{" "}
            <span className="text-[#1FAF5A] font-semibold">Terms of Service</span> and{" "}
            <span className="text-[#1FAF5A] font-semibold">Privacy Policy</span>.
            This transaction is regulated by the FCA.
          </p>
        </div>

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
              toast.success("Proceeding to payment...");
              navigate(`/m/dashboard/send/payment-methods?${urlParams}`);
            }}
            className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
          >
            Continue to Payment <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </MobileLayout>
    </>
  );
}
