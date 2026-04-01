import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  User, ArrowRight, ChevronLeft, Clock,
  Check, Info, FileText, ChevronDown, Landmark,
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
const CURRENT_STEP = 2;

/* ─── Dropdown options ──────────────────────────────────── */
const RELATIONSHIPS = [
  "Family", "Spouse / Partner", "Friend",
  "Business Associate", "Self", "Other",
];

const REASONS = [
  "Family Support", "Business Payment", "Education Fees",
  "Rent / Housing", "Medical Expenses", "Gift", "Investment", "Travel", "Other",
];

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);
  const [active, setActive] = useState(true);
  if (active && secs > 0) {
    setTimeout(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
  }
  if (secs === 0 && active) setActive(false);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: secs <= 0 };
}

const inputCls =
  "w-full px-3 py-3 border border-[#DCE3DF] rounded-[8px] outline-none text-sm " +
  "text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white transition-all " +
  "focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]";

const selectCls = inputCls + " appearance-none cursor-pointer pr-9";

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <p className="text-xs font-semibold text-[#5F6F68] uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-[#1FAF5A]" />
      {label}
    </p>
  );
}

function FieldLabel({ label, required, optional }: { label: string; required?: boolean; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
      {label}
      {required && <span className="text-[#E5484D] ml-0.5">*</span>}
      {optional && <span className="text-[#9AA6A0] text-xs font-normal ml-1">(Optional)</span>}
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

/* ─── Page ──────────────────────────────────────────────── */
export default function AddRecipientPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy    = p.get("from")     || "GBP";
  const toCcy      = p.get("to")       || "NGN";
  const amount     = p.get("amount")   || "100";
  const delivery   = p.get("delivery") || "bank_deposit";
  const isExisting = p.get("existing") === "1"; // existing recipient selected from list

  /* ── Pre-fill from sessionStorage when editing an existing recipient ── */
  const prefill = isExisting
    ? (() => { try { return JSON.parse(sessionStorage.getItem("sika_recipient") || "{}"); } catch { return {}; } })()
    : {};

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

  const isNGN = toCcy === "NGN";

  /* ── Form state — pre-filled & locked for existing recipients ── */
  const [form, setForm] = useState({
    firstName:    prefill.firstName    || "",
    lastName:     prefill.lastName     || "",
    nickname:     prefill.nickname     || "",
    relationship: prefill.relationship || RELATIONSHIPS[0],
    reason:       prefill.reason       || REASONS[0],
    narration:    prefill.narration    || "",
  });

  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /* ── Submit ──────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (expired) {
      toast.error("Rate expired. Please restart your transfer.");
      navigate(`/send?from=${fromCcy}&to=${toCcy}&amount=${amount}`);
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter the recipient's first and last name.");
      return;
    }
    if (isNGN && !form.narration.trim()) {
      toast.error("Narration / TXN remarks are mandatory for transfers to Nigeria.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Persist recipient details for the summary step
      sessionStorage.setItem(
        "sika_recipient",
        JSON.stringify({
          firstName:    form.firstName,
          lastName:     form.lastName,
          nickname:     form.nickname,
          relationship: form.relationship,
          reason:       form.reason,
          narration:    form.narration,
        })
      );
      // Existing recipient → bank details pre-filled & pre-verified
      // New recipient → bank details blank, needs verification
      const bankUrl = isExisting
        ? `/dashboard/send/bank?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}&preVerified=1`
        : `/dashboard/send/bank?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;
      navigate(bankUrl);
    }, 600);
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: form ───────────────────────────── */}
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
                    <motion.div
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                      className="absolute inset-0 w-1/3 pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                      }}
                    />
                    <span className="relative shrink-0 flex items-center justify-center w-2 h-2">
                      <motion.span
                        animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inline-flex w-full h-full rounded-full bg-[#1FAF5A]"
                      />
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1FAF5A]" />
                    </span>
                    <Landmark className="w-3 h-3 text-[#F4B400] shrink-0" />
                    <span className="text-white/50 text-[11px] font-medium tracking-wide whitespace-nowrap">Powered by</span>
                    <span className="text-[#F4B400] text-[11px] font-bold tracking-wide whitespace-nowrap">Mito.Money</span>
                    <span className="text-white/30 text-[11px] whitespace-nowrap">in partnership with</span>
                    <span className="text-[#7DDBA5] text-[11px] font-semibold whitespace-nowrap">Sika</span>
                  </motion.div>

                  {/* Title + NGN badge row */}
                  <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display font-semibold text-[#1E2A24] text-base">
                      {isExisting ? "Verify Recipient Details" : "Recipient Details"}
                    </h2>
                    <p className="text-xs text-[#9AA6A0] mt-0.5">
                      {isExisting
                        ? "Review the details and provide transfer information"
                        : "Tell us about who you're sending to"}
                    </p>
                  </div>
                  {isNGN && (
                    <div className="flex items-center gap-1.5 bg-[#FFF9EC] border border-[#F4B400]/30 text-[#B8860B] text-xs font-medium px-3 py-1.5 rounded-[6px] shrink-0">
                      <Info className="w-3.5 h-3.5" />
                      Narration required for Nigeria
                    </div>
                  )}
                  </div>{/* close title+badge row */}
                </div>{/* close card header */}

                <div className="p-6 space-y-6">

                  {/* ── Personal info ──────────────────── */}
                  <div>
                    <SectionHeader icon={User} label="Personal Information" />
                    {isExisting && (
                      <div className="flex items-center gap-2 mb-3 bg-[#EEF7F1] border border-[#1FAF5A]/25 rounded-[8px] px-3 py-2">
                        <Info className="w-3.5 h-3.5 text-[#1FAF5A] shrink-0" />
                        <p className="text-xs text-[#5F6F68]">
                          Recipient details are pre-filled from your saved contacts. Please verify and provide the transfer details below.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel label="First Name" required />
                        <input
                          type="text" value={form.firstName} onChange={set("firstName")}
                          placeholder="First name"
                          disabled={isExisting}
                          className={inputCls + (isExisting ? " bg-[#F8FAF9] text-[#5F6F68] cursor-not-allowed" : "")}
                        />
                      </div>
                      <div>
                        <FieldLabel label="Last Name" required />
                        <input
                          type="text" value={form.lastName} onChange={set("lastName")}
                          placeholder="Last name"
                          disabled={isExisting}
                          className={inputCls + (isExisting ? " bg-[#F8FAF9] text-[#5F6F68] cursor-not-allowed" : "")}
                        />
                      </div>
                      <div>
                        <FieldLabel label="Relationship" required />
                        <SelectWrapper>
                          <select
                            value={form.relationship}
                            onChange={set("relationship")}
                            disabled={isExisting}
                            className={selectCls + (isExisting ? " bg-[#F8FAF9] text-[#5F6F68] cursor-not-allowed" : "")}
                          >
                            {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel label="Nickname" optional />
                        <input
                          type="text" value={form.nickname} onChange={set("nickname")}
                          placeholder="e.g. My Brother"
                          disabled={isExisting}
                          className={inputCls + (isExisting ? " bg-[#F8FAF9] text-[#5F6F68] cursor-not-allowed" : "")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Transfer details ───────────────── */}
                  <div className="border-t border-[#E5ECE8] pt-5">
                    <SectionHeader icon={FileText} label="Transfer Details" />
                    <div className="space-y-4">
                      <div>
                        <FieldLabel label="Reason for Transfer" required />
                        <SelectWrapper>
                          <select value={form.reason} onChange={set("reason")} className={selectCls}>
                            {REASONS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </SelectWrapper>
                      </div>
                      <div>
                        <FieldLabel
                          label="Narration / TXN Remarks"
                          required={isNGN}
                          optional={!isNGN}
                        />
                        <textarea
                          value={form.narration}
                          onChange={set("narration")}
                          placeholder="e.g. Monthly allowance for February"
                          rows={3}
                          className={inputCls + " resize-none"}
                        />
                        {isNGN && (
                          <p className="text-[11px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3 shrink-0" />
                            Required by Nigerian banking regulations
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
                  type="submit"
                  disabled={loading || expired}
                  className="flex-1 h-12 bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold rounded-[10px] shadow-[0_4px_16px_rgba(31,175,90,0.25)] transition-all duration-200 disabled:opacity-60"
                >
                  {loading ? "Saving…" : (<>Continue <ArrowRight className="w-4 h-4 ml-1" /></>)}
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
                      Rate has expired. Please go back and restart your transfer.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
