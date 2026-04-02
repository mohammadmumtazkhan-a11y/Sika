import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Info, AlertTriangle, Check, ChevronDown, Loader2, Landmark,
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
  XOF: ["Ecobank S\u00e9n\u00e9gal", "SGBS", "UBA S\u00e9n\u00e9gal", "BHS"],
  XAF: ["Ecobank Cameroun", "UBA Cameroun", "BGFIBANK", "Soci\u00e9t\u00e9 G\u00e9n\u00e9rale Cameroun"],
  GNF: ["Ecobank Guin\u00e9e", "UBA Guin\u00e9e", "BDG", "BICIGUI"],
  CNY: ["Industrial & Commercial Bank of China", "China Construction Bank", "Bank of China", "Agricultural Bank of China"],
  JPY: ["Sumitomo Mitsui Banking", "Mizuho Bank", "MUFG Bank", "Japan Post Bank"],
};

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

const inputCls =
  "w-full px-3 py-3 border border-[#DCE3DF] rounded-[10px] outline-none text-sm " +
  "text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white transition-all " +
  "focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]";

const selectCls = inputCls + " appearance-none cursor-pointer pr-9";

type VerifyState = "idle" | "checking" | "unverified" | "verified";

/* ─── Page ──────────────────────────────────────────────── */
export default function MobileBankDetails() {
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

  /* ── Corridor flags ─────────────────────────────────────  */
  const isSwift  = ["AED", "EUR", "USD"].includes(toCcy);
  const isUPI    = toCcy === "INR" && delivery === "upi";
  const isINR    = toCcy === "INR" && !isUPI;
  const isMobile = delivery === "mobile_money" || delivery === "m-pesa";
  const bankList = BANK_LISTS[toCcy] ?? [];

  /* ── Form state ─────────────────────────────────────────  */
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
  const [verifyState, setVerifyState] = useState<VerifyState>(preVerified ? "verified" : "idle");

  const runVerification = () => {
    setVerifyState("checking");
    setTimeout(() => {
      setVerifyState("unverified");
    }, 2000);
  };

  /* ── Validation ──────────────────────────────────────── */
  const validate = (): boolean => {
    if (isUPI && !form.upiId.trim()) {
      toast.error("Please enter the recipient's UPI ID.");
      return false;
    }
    if (!isUPI && !isSwift && !form.accountNo.trim()) {
      toast.error(isMobile ? "Please enter the mobile number." : "Please enter the account number.");
      return false;
    }
    if (!isUPI && !form.bankName.trim()) {
      toast.error(isMobile ? "Please select a provider." : "Please select or enter the bank name.");
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

    // First click - run verification (unless pre-verified)
    if (verifyState === "idle") {
      runVerification();
      return;
    }

    // Second click or pre-verified - proceed
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
    toast.success("Bank details saved! Reviewing your transfer...");
    navigate(
      `/m/dashboard/send/summary?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`
    );
  };

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title="Bank Details"
      showBack
      onBack={() => navigate(`/m/dashboard/send/recipient/new?${urlParams}`)}
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
        <MobileStepIndicator steps={FLOW_STEPS} currentStep={3} />

        {/* Bank form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm p-4 space-y-3.5"
        >
          <p className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
            {isMobile ? "Mobile Money Details" : isUPI ? "UPI Details" : isSwift ? "International Transfer" : "Bank Account Details"}
          </p>

          {/* ── UPI ──────────────────────────────────── */}
          {isUPI && (
            <div>
              <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                UPI ID <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                value={form.upiId}
                onChange={set("upiId")}
                placeholder="e.g. name@upi or 9876543210@paytm"
                className={inputCls}
              />
              <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 shrink-0" />
                Enter the recipient's UPI VPA (Virtual Payment Address)
              </p>
            </div>
          )}

          {/* ── SWIFT / IBAN ─────────────────────────── */}
          {isSwift && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  BIC / SWIFT Code <span className="text-[#E5484D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.bic}
                  onChange={set("bic")}
                  placeholder="e.g. TESTDEFFXXX"
                  className={inputCls + " font-mono tracking-wider uppercase"}
                  maxLength={11}
                />
                <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  8 or 11-character bank identifier code
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  IBAN <span className="text-[#E5484D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.iban}
                  onChange={set("iban")}
                  placeholder="e.g. DE75512108001245126199"
                  className={inputCls + " font-mono tracking-wide"}
                  maxLength={34}
                />
                <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  International Bank Account Number (up to 34 characters)
                </p>
              </div>
            </div>
          )}

          {/* ── Standard account + bank ──────────────── */}
          {!isUPI && !isSwift && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  {isMobile ? "Mobile Number" : "Account Number"}{" "}
                  <span className="text-[#E5484D]">*</span>
                  {toCcy === "NGN" && !isMobile && (
                    <span className="text-[#9AA6A0] text-[10px] font-normal ml-1">(10-digit NUBAN)</span>
                  )}
                </label>
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
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  {isMobile ? "Mobile Money Provider" : "Bank Name"}{" "}
                  <span className="text-[#E5484D]">*</span>
                </label>
                {bankList.length > 0 ? (
                  <div className="relative">
                    <select value={form.bankName} onChange={set("bankName")} className={selectCls}>
                      {bankList.map((b) => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6A0] pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.bankName}
                    onChange={set("bankName")}
                    placeholder="Bank name"
                    className={inputCls}
                  />
                )}
              </div>

              {/* IFSC for INR bank transfer */}
              {isINR && (
                <div>
                  <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                    IFSC Code <span className="text-[#E5484D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.ifsc}
                    onChange={set("ifsc")}
                    placeholder="e.g. SBIN0001234"
                    className={inputCls + " font-mono tracking-wider uppercase"}
                    maxLength={11}
                  />
                  <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    11-character Indian Financial System Code
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Verification banners ────────────────── */}
          <AnimatePresence>
            {verifyState === "verified" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[10px] px-3.5 py-3"
              >
                <Check className="w-4 h-4 text-[#1FAF5A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1FAF5A]">Account verified</p>
                  <p className="text-[10px] text-[#5F6F68] mt-0.5">
                    Bank account details have been confirmed successfully.
                  </p>
                </div>
              </motion.div>
            )}
            {verifyState === "unverified" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-2.5 bg-[#FFF9EC] border border-[#F4B400]/40 rounded-[10px] px-3.5 py-3"
              >
                <AlertTriangle className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#1E2A24]">Could not verify automatically</p>
                  <p className="text-[10px] text-[#5F6F68] mt-0.5 leading-relaxed">
                    We were unable to confirm these bank details. Double-check before continuing to avoid failed transfers.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            onClick={handleContinue}
            disabled={
              verifyState === "checking" ||
              (isUPI && !form.upiId.trim()) ||
              (!isUPI && !isSwift && !form.accountNo.trim()) ||
              (isSwift && (!form.bic.trim() || !form.iban.trim())) ||
              (isINR && !form.ifsc.trim())
            }
            className={cn(
              "w-full font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
              verifyState === "unverified"
                ? "bg-[#F4B400] hover:bg-[#D4A000] text-[#1E2A24] shadow-[0_4px_16px_rgba(244,180,0,0.3)]"
                : "bg-[#1FAF5A] hover:bg-[#178A47] text-white shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
            )}
          >
            {verifyState === "checking" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </span>
            ) : verifyState === "unverified" ? (
              <>Proceed Anyway <ArrowRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>

      {/* ── Verification loading overlay modal ──────────── */}
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
              className="bg-white rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,0.2)] px-8 py-8 flex flex-col items-center text-center max-w-[340px] w-full mx-6"
            >
              {/* Spinner */}
              <div className="relative w-14 h-14 mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-[#E5ECE8]" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#1FAF5A]"
                />
              </div>
              <h3 className="font-display font-bold text-[#1E2A24] text-lg mb-2">
                Just a moment
              </h3>
              <p className="text-sm text-[#5F6F68] leading-relaxed">
                We're confirming your bank details -- it might take a moment or two.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
    </>
  );
}
