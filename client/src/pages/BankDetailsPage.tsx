import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ArrowRight, ChevronLeft, Clock,
  Check, Info, AlertTriangle, ChevronDown, Loader2, Landmark,
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
const CURRENT_STEP = 3;

/* ─── Bank lists by currency ────────────────────────────── */
const BANK_LISTS: Record<string, string[]> = {
  NGN: [
    "Access Bank", "First Bank of Nigeria", "GTBank", "Zenith Bank", "UBA",
    "Fidelity Bank", "FCMB", "Ecobank", "Opay", "PalmPay", "Kuda Bank",
    "Polaris Bank", "Stanbic IBTC", "Sterling Bank", "Wema Bank",
  ],
  GHS: [
    "GCB Bank", "Ecobank Ghana", "Absa Bank Ghana",
    "MTN Mobile Money", "Vodafone Cash", "AirtelTigo Money",
  ],
  KES: ["M-Pesa (Safaricom)", "Equity Bank Kenya", "KCB Bank", "Co-op Bank", "Absa Kenya"],
  ZAR: ["ABSA", "First National Bank", "Nedbank", "Standard Bank", "Capitec"],
  INR: ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda"],
  AED: ["Emirates NBD", "Abu Dhabi Commercial Bank", "Dubai Islamic Bank", "Mashreq Bank", "RAK Bank"],
  XOF: ["Ecobank Sénégal", "SGBS", "UBA Sénégal", "BHS"],
  XAF: ["Ecobank Cameroun", "UBA Cameroun", "BGFIBANK", "Société Générale Cameroun"],
  GNF: ["Ecobank Guinée", "UBA Guinée", "BDG", "BICIGUI"],
  CNY: ["Industrial & Commercial Bank of China", "China Construction Bank", "Bank of China", "Agricultural Bank of China"],
  JPY: ["Sumitomo Mitsui Banking", "Mizuho Bank", "MUFG Bank", "Japan Post Bank"],
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
  return { display: `${m}:${s}`, expired: secs <= 0 };
}

const inputCls =
  "w-full px-3 py-3 border border-[#DCE3DF] rounded-[8px] outline-none text-sm " +
  "text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white transition-all " +
  "focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]";

const selectCls = inputCls + " appearance-none cursor-pointer pr-9";

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
      {label}
      {required && <span className="text-[#E5484D] ml-0.5">*</span>}
      {hint && <span className="text-[#9AA6A0] text-xs font-normal ml-1">({hint})</span>}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6A0] pointer-events-none" />
    </div>
  );
}

/* ─── Verification states ───────────────────────────────── */
type VerifyState = "idle" | "checking" | "unverified" | "verified";

/* ─── Page ──────────────────────────────────────────────── */
export default function BankDetailsPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy     = p.get("from")        || "GBP";
  const toCcy       = p.get("to")          || "NGN";
  const amount      = p.get("amount")      || "100";
  const delivery    = p.get("delivery")    || "bank_deposit";
  const preVerified = p.get("preVerified") === "1";

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

  /* ── Corridor flags ─────────────────────────────────────  */
  const isSwift    = ["AED", "EUR"].includes(toCcy) || toCcy === "USD";
  const isUPI      = toCcy === "INR" && delivery === "upi";
  const isINR      = toCcy === "INR" && !isUPI;
  const isMobile   = delivery === "mobile_money" || delivery === "m-pesa";
  const bankList   = BANK_LISTS[toCcy] ?? [];

  /* ── Form state — pre-fill from sessionStorage if pre-verified ── */
  const savedBank = preVerified
    ? (() => { try { return JSON.parse(sessionStorage.getItem("sika_bank") || "{}"); } catch { return {}; } })()
    : {};

  const [form, setForm] = useState({
    accountNo: savedBank.accountNo || "",
    bankName:  savedBank.bankName  || bankList[0] || "",
    ifsc:      savedBank.ifsc      || "",
    bic:       savedBank.bic       || "",
    iban:      savedBank.iban      || "",
    upiId:     savedBank.upiId     || "",
  });

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Verification state ──────────────────────────────── */
  // Pre-verified when an existing recipient is selected from the recipient list
  const [verifyState, setVerifyState] = useState<VerifyState>(preVerified ? "verified" : "idle");

  const runVerification = () => {
    setVerifyState("checking");
    // Simulate API call — always returns "unverified" in prototype
    setTimeout(() => {
      setVerifyState("unverified");
    }, 2000);
  };

  /* ── Validation ──────────────────────────────────────── */
  const validate = (): boolean => {
    if (expired) {
      toast.error("Rate expired. Please restart your transfer.");
      navigate(`/send?from=${fromCcy}&to=${toCcy}&amount=${amount}`);
      return false;
    }
    if (isUPI && !form.upiId.trim()) {
      toast.error("Please enter the recipient's UPI ID.");
      return false;
    }
    if (!isUPI && !isSwift && !form.accountNo.trim()) {
      toast.error("Please enter the account number.");
      return false;
    }
    if (!isUPI && !form.bankName.trim()) {
      toast.error("Please select or enter the bank name.");
      return false;
    }
    if (isINR && !form.ifsc.trim()) {
      toast.error("Please enter the IFSC code.");
      return false;
    }
    if (isSwift && (!form.bic.trim() || !form.iban.trim())) {
      toast.error("Please enter both BIC/SWIFT and IBAN.");
      return false;
    }
    return true;
  };

  /* ── Continue handler ────────────────────────────────── */
  const handleContinue = () => {
    if (!validate()) return;

    // First click → run verification (unless already pre-verified)
    if (verifyState === "idle") {
      runVerification();
      return;
    }

    // Second click (after warning shown) OR pre-verified from existing recipient → proceed
    sessionStorage.setItem(
      "sika_bank",
      JSON.stringify({
        accountNo: form.accountNo,
        bankName:  form.bankName,
        ifsc:      form.ifsc,
        bic:       form.bic,
        iban:      form.iban,
        upiId:     form.upiId,
        verified:  verifyState === "verified",
      })
    );
    toast.success("Bank details saved! Reviewing your transfer…");
    navigate(
      `/dashboard/send/summary?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
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

          {/* ── Left: bank form ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Card header */}
              <div className="px-6 pt-4 pb-3 border-b border-[#E5ECE8]">
                {/* Powered by badge */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
                  className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px] mb-3"
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

                {/* Title row */}
                <div className="flex items-center gap-2 mb-0.5">
                  <Building2 className="w-4 h-4 text-[#1FAF5A]" />
                  <h2 className="font-display font-semibold text-[#1E2A24] text-base uppercase tracking-wide text-xs">
                    Bank / Account Details
                  </h2>
                </div>
                <p className="text-xs text-[#9AA6A0] mt-0.5 ml-6">
                  Enter the recipient's bank account details for this transfer
                </p>
              </div>

              <div className="p-6">

                {/* ── UPI ─────────────────────────────── */}
                {isUPI && (
                  <div>
                    <FieldLabel label="UPI ID" required />
                    <input
                      type="text" value={form.upiId} onChange={set("upiId")}
                      placeholder="e.g. name@upi or 9876543210@paytm"
                      className={inputCls}
                    />
                    <p className="text-[11px] text-[#9AA6A0] mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3 shrink-0" />
                      Enter the recipient's UPI VPA (Virtual Payment Address)
                    </p>
                  </div>
                )}

                {/* ── SWIFT / IBAN (AED / EUR / international) ── */}
                {isSwift && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel label="BIC / SWIFT Code" required />
                      <input
                        type="text" value={form.bic} onChange={set("bic")}
                        placeholder="e.g. TESTDEFFXXX"
                        className={inputCls + " font-mono tracking-wider uppercase"}
                        maxLength={11}
                      />
                      <p className="text-[11px] text-[#9AA6A0] mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        8 or 11-character bank identifier code
                      </p>
                    </div>
                    <div>
                      <FieldLabel label="IBAN" required />
                      <input
                        type="text" value={form.iban} onChange={set("iban")}
                        placeholder="e.g. DE75512108001245126199"
                        className={inputCls + " font-mono tracking-wide"}
                        maxLength={34}
                      />
                      <p className="text-[11px] text-[#9AA6A0] mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3 shrink-0" />
                        International Bank Account Number (up to 34 characters)
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Standard account number + bank ─── */}
                {!isUPI && !isSwift && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel
                        label={isMobile ? "Mobile Number" : "Account Number"}
                        required
                        hint={toCcy === "NGN" ? "10-digit NUBAN" : undefined}
                      />
                      <input
                        type="text"
                        value={form.accountNo}
                        onChange={set("accountNo")}
                        placeholder={
                          isMobile ? "e.g. 07XXXXXXXXX"
                          : toCcy === "NGN" ? "10-digit account number"
                          : "Account number"
                        }
                        maxLength={toCcy === "NGN" ? 10 : 34}
                        className={inputCls + " font-mono tracking-wide"}
                      />
                    </div>
                    <div>
                      <FieldLabel
                        label={isMobile ? "Mobile Money Provider" : "Bank Name"}
                        required
                      />
                      {bankList.length > 0 ? (
                        <SelectWrapper>
                          <select value={form.bankName} onChange={set("bankName")} className={selectCls}>
                            {bankList.map((b) => <option key={b}>{b}</option>)}
                          </select>
                        </SelectWrapper>
                      ) : (
                        <input
                          type="text" value={form.bankName} onChange={set("bankName")}
                          placeholder="Bank name" className={inputCls}
                        />
                      )}
                    </div>

                    {/* IFSC for INR bank transfer */}
                    {isINR && (
                      <div className="sm:col-span-2">
                        <FieldLabel label="IFSC Code" required />
                        <input
                          type="text" value={form.ifsc} onChange={set("ifsc")}
                          placeholder="e.g. SBIN0001234"
                          className={inputCls + " font-mono tracking-wider uppercase"}
                          maxLength={11}
                        />
                        <p className="text-[11px] text-[#9AA6A0] mt-1.5 flex items-center gap-1">
                          <Info className="w-3 h-3 shrink-0" />
                          11-character Indian Financial System Code
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Verification result banner ────────── */}
                <AnimatePresence>
                  {verifyState === "unverified" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="mt-5 flex items-start gap-3 bg-[#FFF9EC] border border-[#F4B400]/40 rounded-[10px] px-4 py-4"
                    >
                      <AlertTriangle className="w-5 h-5 text-[#F4B400] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#1E2A24] mb-0.5">
                          Could not verify this account automatically
                        </p>
                        <p className="text-xs text-[#5F6F68] leading-relaxed">
                          We were unable to confirm these bank details with our verification service.
                          If you are certain about the account details, you can still proceed —
                          however, please double-check before continuing to avoid failed transfers.
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {verifyState === "verified" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 flex items-start gap-3 bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[10px] px-4 py-4"
                    >
                      <Check className="w-5 h-5 text-[#1FAF5A] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[#1FAF5A]">Account verified</p>
                        <p className="text-xs text-[#5F6F68] mt-0.5">
                          Bank account details have been confirmed successfully.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>

            {/* ── Back / Continue buttons ────────────── */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard/send/recipient?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
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
                disabled={verifyState === "checking" || expired}
                className={cn(
                  "flex-1 h-12 font-bold rounded-[10px] transition-all duration-200 disabled:opacity-60",
                  verifyState === "unverified"
                    ? "bg-[#F4B400] hover:bg-[#D4A000] text-[#1E2A24] shadow-[0_4px_16px_rgba(244,180,0,0.3)]"
                    : "bg-[#1FAF5A] hover:bg-[#178A47] text-white shadow-[0_4px_16px_rgba(31,175,90,0.25)]"
                )}
              >
                {verifyState === "checking" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                  </span>
                ) : verifyState === "unverified" ? (
                  <>Proceed Anyway <ArrowRight className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>

          {/* ── Right: Amount summary ─────────────────── */}
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
                    Rate has expired. Please go back and restart.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Verification loading overlay modal ────────────── */}
      <AnimatePresence>
        {verifyState === "checking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] px-10 py-10 flex flex-col items-center text-center max-w-sm w-full mx-4"
            >
              {/* Spinner */}
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#E5ECE8]" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1FAF5A]"
                />
              </div>
              <h3 className="font-display font-bold text-[#1E2A24] text-xl mb-2">
                Just a moment
              </h3>
              <p className="text-sm text-[#5F6F68] leading-relaxed">
                We're confirming your bank details — it might take a moment or two.
                Thanks for hanging in there!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
