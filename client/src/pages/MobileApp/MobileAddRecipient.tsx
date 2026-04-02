import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Info, ChevronDown, Landmark,
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

const inputCls =
  "w-full px-3 py-3 border border-[#DCE3DF] rounded-[10px] outline-none text-sm " +
  "text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white transition-all " +
  "focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]";

const selectCls = inputCls + " appearance-none cursor-pointer pr-9";

const disabledCls = " bg-[#F8FAF9] text-[#5F6F68] cursor-not-allowed";

/* ─── Page ──────────────────────────────────────────────── */
export default function MobileAddRecipient() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy    = p.get("from")     || "GBP";
  const toCcy      = p.get("to")       || "NGN";
  const amount     = p.get("amount")   || "100";
  const delivery   = p.get("delivery") || "bank_deposit";
  const isExisting = p.get("existing") === "1";

  /* ── Pre-fill from sessionStorage ─────────────────────── */
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

  const isNGN = toCcy === "NGN";

  /* ── Form state ───────────────────────────────────────── */
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

  /* ── Submit ───────────────────────────────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter the recipient's first and last name.");
      return;
    }
    if (!form.relationship) {
      toast.error("Please select a relationship.");
      return;
    }
    if (!form.reason) {
      toast.error("Please select a reason for transfer.");
      return;
    }
    if (isNGN && !form.narration.trim()) {
      toast.error("Narration / TXN remarks are mandatory for transfers to Nigeria.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
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
      toast.success("Recipient details saved!");
      const bankUrl = isExisting
        ? `/m/dashboard/send/bank?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}&preVerified=1`
        : `/m/dashboard/send/bank?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;
      navigate(bankUrl);
    }, 600);
  };

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title={isExisting ? "Verify Recipient Details" : "Recipient Details"}
      showBack
      onBack={() => navigate(`/m/dashboard/send/recipient?${urlParams}`)}
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
        <MobileStepIndicator steps={FLOW_STEPS} currentStep={2} />

        {/* Existing recipient info banner */}
        {isExisting && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[10px] px-3.5 py-3"
          >
            <Info className="w-4 h-4 text-[#1FAF5A] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#5F6F68] leading-relaxed">
              Recipient details are pre-filled from your saved contacts. Please verify and provide the transfer details below.
            </p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* Personal info card */}
          <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm p-4 space-y-3">
            <p className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
              Personal Information
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  First Name <span className="text-[#E5484D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={set("firstName")}
                  placeholder="First name"
                  disabled={isExisting}
                  className={inputCls + (isExisting ? disabledCls : "")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                  Last Name <span className="text-[#E5484D]">*</span>
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={set("lastName")}
                  placeholder="Last name"
                  disabled={isExisting}
                  className={inputCls + (isExisting ? disabledCls : "")}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                Relationship <span className="text-[#E5484D]">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.relationship}
                  onChange={set("relationship")}
                  disabled={isExisting}
                  className={selectCls + (isExisting ? disabledCls : "")}
                >
                  {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6A0] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                Nickname <span className="text-[#9AA6A0] text-[10px]">(optional)</span>
              </label>
              <input
                type="text"
                value={form.nickname}
                onChange={set("nickname")}
                placeholder="e.g. My Brother"
                disabled={isExisting}
                className={inputCls + (isExisting ? disabledCls : "")}
              />
            </div>
          </div>

          {/* Transfer details card */}
          <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
                Transfer Details
              </p>
              {isNGN && (
                <span className="text-[9px] font-medium text-[#D97706] bg-[#FFF9EC] border border-[#F4B400]/30 px-2 py-0.5 rounded-full">
                  Narration required
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                Reason for Transfer <span className="text-[#E5484D]">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.reason}
                  onChange={set("reason")}
                  className={selectCls}
                >
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6A0] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#1E2A24] mb-1 block">
                Narration / TXN Remarks{" "}
                {isNGN
                  ? <span className="text-[#E5484D]">*</span>
                  : <span className="text-[#9AA6A0] text-[10px]">(optional)</span>
                }
              </label>
              <textarea
                value={form.narration}
                onChange={set("narration")}
                placeholder="e.g. Monthly allowance for February"
                rows={3}
                className={inputCls + " resize-none"}
              />
              {isNGN && (
                <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 shrink-0" />
                  Required by Nigerian banking regulations
                </p>
              )}
            </div>
          </div>

        </form>
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
            type="button"
            onClick={() => document.querySelector<HTMLFormElement>("form")?.requestSubmit()}
            disabled={loading || !form.firstName.trim() || !form.lastName.trim() || (isNGN && !form.narration.trim())}
            className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
          >
            {loading ? "Saving..." : (
              <>Continue <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
    </>
  );
}
