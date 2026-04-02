import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, Clock, Check,
  AlertCircle, Info, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES } from "@/data/currencies";
import { DELIVERY_METHODS } from "@/data/deliveryMethods";
import { COUNTRIES } from "@/data/countries";
import { cn } from "@/lib/utils";

/* ─── Step definitions ──────────────────────────────────── */
const FLOW_STEPS = [
  { n: 1, label: "Amount"    },
  { n: 2, label: "Recipient" },
  { n: 3, label: "Bank"      },
  { n: 4, label: "Summary"   },
  { n: 5, label: "Payment"   },
];
const CURRENT_STEP = 4;

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function getCountryByCurrency(code: string) {
  return COUNTRIES.find((c) => c.currency === code);
}

function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);
  if (secs > 0) setTimeout(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: secs <= 0 };
}

function fmt(v: number, decimals: number) {
  return v.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ─── Summary row ───────────────────────────────────────── */
function SummaryRow({
  label, value, bold, green, large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  green?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F0F4F2] last:border-0">
      <span className={cn(
        "text-sm text-[#5F6F68]",
        bold && "font-semibold text-[#1E2A24]",
      )}>
        {label}
      </span>
      <span className={cn(
        "text-sm font-semibold text-[#1E2A24] text-right",
        bold && "font-bold",
        green && "text-[#1FAF5A]",
        large && "text-base font-extrabold font-display",
      )}>
        {value}
      </span>
    </div>
  );
}

/* ─── Section heading ───────────────────────────────────── */
function SectionHeading({ label }: { label: string }) {
  return (
    <h3 className="font-display font-bold text-[#1E2A24] text-base mb-3 mt-6 first:mt-0">
      {label}
    </h3>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function SummaryPage() {
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
  const destCountry = getCountryByCurrency(toCcy);

  const rate     = (MOCK_RATES[toCcy] ?? 1) / (MOCK_RATES[fromCcy] ?? 1);
  const baseFee  = TRANSFER_FEES[toCcy] ?? TRANSFER_FEES.DEFAULT;
  const delivOpts = DELIVERY_METHODS[toCcy] ?? [];
  const delivMethod = delivOpts.find((d) => d.id === delivery);
  const delivFee = delivMethod?.fee ?? 0;
  const totalFee = baseFee + delivFee;
  const sendAmt  = parseFloat(amount || "0");
  const amtSent  = Math.max(0, sendAmt - totalFee);   // after fee deduction
  const recvAmt  = amtSent * rate;

  const formatSend = (v: number) => fmt(v, sendCur.decimals);
  const formatRecv = (v: number) => fmt(v, recvCur.decimals);
  const formatRate = (r: number) => {
    if (r >= 1000) return r.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    if (r >= 10)   return r.toLocaleString("en-GB", { maximumFractionDigits: 2 });
    return r.toFixed(4);
  };

  /* ── Rate countdown ───────────────────────────────────── */
  const { display: timerDisplay, expired } = useCountdown(15 * 60);

  /* ── Session data ─────────────────────────────────────── */
  const recipient = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("sika_recipient");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const bankData = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("sika_bank");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  /* ── Recipient display fields ─────────────────────────── */
  const fullName    = recipient ? `${recipient.firstName} ${recipient.lastName}` : "—";
  const narration   = recipient?.narration || "—";
  const serviceType = delivMethod?.label || "Bank Deposit";

  const showIban    = !!(bankData?.bic || bankData?.iban);
  const showUpi     = !!(bankData?.upiId);
  const showIfsc    = !!(bankData?.ifsc);

  /* ── Continue ─────────────────────────────────────────── */
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (expired) {
      toast.error("Rate expired. Please restart your transfer.");
      navigate(`/send?from=${fromCcy}&to=${toCcy}&amount=${amount}`);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(
        `/dashboard/send/payment-methods?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
      );
    }, 600);
  };

  return (
    <DashboardLayout showMitoLoader>
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

          {/* ── Left: summary detail ─────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Info banner */}
              <div className="flex items-start gap-3 bg-[#EEF7F1] border border-[#1FAF5A]/25 rounded-[12px] px-5 py-4 mb-5">
                <Info className="w-5 h-5 text-[#1FAF5A] shrink-0 mt-0.5" />
                <p className="text-sm text-[#5F6F68] leading-relaxed">
                  Please check your transaction summary below. If you are happy with all the
                  details, click <span className="font-semibold text-[#1E2A24]">Continue</span> to
                  proceed to payment. To make changes, click{" "}
                  <span className="font-semibold text-[#1E2A24]">Back</span>.
                </p>
              </div>

              {/* Main summary card */}
              <div className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">

                {/* ── Powered by badge — card header ── */}
                <div className="px-6 pt-4 pb-3 border-b border-[#E5ECE8]">
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
                    <Landmark className="w-3 h-3 text-[#F4B400] shrink-0" />
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

                <div className="p-6">

                  {/* ── Amount section ───────────────── */}
                  <SectionHeading label="Amount" />
                  <div className="bg-[#F8FAF9] rounded-[10px] px-4 py-1">
                    <SummaryRow
                      label="You Send"
                      value={`${sendCur.symbol}${formatSend(sendAmt)} ${fromCcy}`}
                    />
                    <SummaryRow
                      label="Amount Sent"
                      value={`${sendCur.symbol}${formatSend(amtSent)} ${fromCcy}`}
                    />
                    <SummaryRow
                      label="They Receive"
                      value={`${formatRecv(recvAmt)} ${toCcy}`}
                      green
                    />
                    <SummaryRow
                      label="Exchange Rate"
                      value={`1 ${fromCcy} = ${formatRate(rate)} ${toCcy}`}
                    />
                    <SummaryRow
                      label="Transaction Fee"
                      value={`${sendCur.symbol}${formatSend(totalFee)} ${fromCcy}`}
                    />
                  </div>

                  {/* ── Recipient section ─────────────── */}
                  <SectionHeading label="Recipient" />
                  <div className="bg-[#F8FAF9] rounded-[10px] px-4 py-1">
                    <SummaryRow label="Service Type"  value={serviceType} />
                    <SummaryRow label="Recipient Type" value="Individual" />
                    <SummaryRow
                      label="Destination"
                      value={
                        destCountry
                          ? `${destCountry.flag} ${destCountry.name}`
                          : toCcy
                      }
                    />
                    <SummaryRow label="Receive Currency" value={toCcy} />
                    <SummaryRow label="Full Name" value={fullName} bold />

                    {/* Corridor-specific account details */}
                    {showUpi && (
                      <SummaryRow label="UPI ID" value={bankData.upiId || "—"} />
                    )}
                    {showIban && (
                      <>
                        <SummaryRow label="BIC / SWIFT" value={bankData.bic || "—"} />
                        <SummaryRow label="IBAN"        value={bankData.iban || "—"} />
                      </>
                    )}
                    {!showUpi && !showIban && (
                      <>
                        <SummaryRow
                          label="Account Number"
                          value={bankData?.accountNo || "—"}
                        />
                        {showIfsc && (
                          <SummaryRow label="IFSC Code" value={bankData.ifsc || "—"} />
                        )}
                        <SummaryRow
                          label="Bank Name"
                          value={bankData?.bankName || "—"}
                        />
                      </>
                    )}
                    <SummaryRow
                      label="Narration"
                      value={narration}
                    />
                  </div>

                  {/* ── Total section ─────────────────── */}
                  <SectionHeading label="Total" />
                  <div className="bg-[#F8FAF9] rounded-[10px] px-4 py-1">
                    <SummaryRow
                      label="Total Due"
                      value={`${sendCur.symbol}${formatSend(sendAmt)} ${fromCcy}`}
                      bold
                    />
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm font-semibold text-[#1E2A24]">They Receive</span>
                      <span className="font-display font-extrabold text-[#1FAF5A] text-lg">
                        {formatRecv(recvAmt)} {toCcy}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Legal notice */}
                <div className="mx-6 mb-6 flex items-start gap-3 bg-[#FFF9EC] border border-[#F4B400]/35 rounded-[10px] px-4 py-4">
                  <AlertCircle className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5F6F68] leading-relaxed">
                    By clicking <span className="font-semibold text-[#1E2A24]">Continue</span> you
                    are submitting this transaction and agree to Sika's{" "}
                    <button className="text-[#1FAF5A] hover:underline font-medium">Terms of Use</button>
                    {" "}and{" "}
                    <button className="text-[#1FAF5A] hover:underline font-medium">Privacy Policy</button>.
                    Kindly proceed to select your payment method.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ── Back / Continue buttons ────────────── */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard/send/bank?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
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
                disabled={loading || expired}
                className="flex-1 h-12 bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold rounded-[10px] shadow-[0_4px_16px_rgba(31,175,90,0.25)] transition-all duration-200 disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : (<>Continue <ArrowRight className="w-4 h-4 ml-1" /></>)
                }
              </Button>
            </div>
          </div>

          {/* ── Right: Amount summary (sticky) ───────────── */}
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
                    {sendCur.symbol}{formatSend(sendAmt)} {fromCcy}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#5F6F68]">Fees</span>
                  <span className="text-sm font-semibold text-[#1E2A24]">
                    {sendCur.symbol}{formatSend(totalFee)} {fromCcy}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#E5ECE8]">
                  <span className="text-sm font-bold text-[#1E2A24]">Total to Pay</span>
                  <span className="text-base font-extrabold text-[#1E2A24] font-display">
                    {sendCur.symbol}{formatSend(sendAmt)} {fromCcy}
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
                    Rate expired. Please go back and restart.
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
