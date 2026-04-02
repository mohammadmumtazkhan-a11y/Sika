import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Search, UserPlus, ArrowRight, ChevronLeft,
  Clock, Check, Info, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

/* ─── Mock saved recipients ─────────────────────────────── */
interface SavedRecipient {
  id:           string;
  firstName:    string;
  lastName:     string;
  relationship: string;
  bankName:     string;
  accountNo:    string;
  delivery:     string;
  avatarBg:     string;
  avatarText:   string;
}

const SAVED_RECIPIENTS: SavedRecipient[] = [
  { id: "1", firstName: "Akshita",  lastName: "Gupta",   relationship: "Family",             bankName: "GTBank",       accountNo: "1234567890", delivery: "bank_deposit",  avatarBg: "bg-[#E0E7FF]", avatarText: "text-[#4338CA]" },
  { id: "2", firstName: "Sarah",    lastName: "Chen",    relationship: "Friend",              bankName: "Opay",         accountNo: "9876543210", delivery: "mobile_money",  avatarBg: "bg-[#EDE9FE]", avatarText: "text-[#7C3AED]" },
  { id: "3", firstName: "David",    lastName: "Okonkwo", relationship: "Business Associate", bankName: "Zenith Bank",  accountNo: "1122334455", delivery: "bank_deposit",  avatarBg: "bg-[#DCFCE7]", avatarText: "text-[#15803D]" },
  { id: "4", firstName: "Amara",    lastName: "Diallo",  relationship: "Family",             bankName: "Access Bank",  accountNo: "5544332211", delivery: "bank_deposit",  avatarBg: "bg-[#FEF3C7]", avatarText: "text-[#D97706]" },
  { id: "5", firstName: "Fatima",   lastName: "Hassan",  relationship: "Family",             bankName: "UBA",          accountNo: "6677889900", delivery: "bank_deposit",  avatarBg: "bg-[#FCE7F3]", avatarText: "text-[#BE185D]" },
];

const DELIVERY_LABEL: Record<string, string> = {
  bank_deposit: "Bank Deposit",
  mobile_money: "Mobile Money",
  upi:          "UPI Transfer",
  "m-pesa":     "M-Pesa",
  cash_pickup:  "Cash Pickup",
  alipay:       "Alipay",
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

function initials(r: SavedRecipient) {
  return `${r.firstName[0]}${r.lastName[0]}`.toUpperCase();
}

/* ─── Page ──────────────────────────────────────────────── */
export default function SelectRecipientPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy  = p.get("from")     || "GBP";
  const toCcy    = p.get("to")       || "NGN";
  const amount   = p.get("amount")   || "100";
  const delivery = p.get("delivery") || "bank_deposit";

  // New customers have no saved recipients — go straight to add form
  useEffect(() => {
    if (sessionStorage.getItem("sika_new_user") === "1") {
      navigate(`/dashboard/send/recipient/new?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* ── Search & display ────────────────────────────────── */
  const [query, setQuery]       = useState("");
  const [showAll, setShowAll]   = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return SAVED_RECIPIENTS;
    return SAVED_RECIPIENTS.filter(
      (r) =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.bankName.toLowerCase().includes(q)
    );
  }, [query]);

  const VISIBLE_DEFAULT = 3;
  const displayed = showAll ? filtered : filtered.slice(0, VISIBLE_DEFAULT);

  /* ── Select recipient ────────────────────────────────── */
  const selectRecipient = (r: SavedRecipient) => {
    // Store selected recipient + bank data for pre-fill on the next pages
    sessionStorage.setItem(
      "sika_recipient",
      JSON.stringify({
        firstName:    r.firstName,
        lastName:     r.lastName,
        nickname:     r.firstName,
        relationship: r.relationship,
        reason:       "",
        narration:    "",
      })
    );
    sessionStorage.setItem(
      "sika_bank",
      JSON.stringify({
        accountNo: r.accountNo,
        bankName:  r.bankName,
        ifsc:      "",
        bic:       "",
        iban:      "",
        upiId:     "",
        verified:  true,
      })
    );
    // Navigate to Recipient Details page for user to review pre-filled data
    // and fill in Reason + Narration, then continue to Bank details
    navigate(
      `/dashboard/send/recipient/new?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${r.delivery}&existing=1`
    );
  };

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

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
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold",
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

          {/* ── Left: recipient selection ─────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Back button */}
            <button
              onClick={() => navigate(`/send?${urlParams}`)}
              className="flex items-center gap-1.5 text-sm font-medium text-[#5F6F68] hover:text-[#1FAF5A] transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-[16px] border border-[#DCE3DF] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              {/* Badge header */}
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
              </div>

              <div className="px-6 pt-6 pb-4 border-b border-[#E5ECE8]">
                <h2 className="font-display font-bold text-[#1E2A24] text-xl mb-5">
                  Who are you sending to?
                </h2>

                {/* Recent recipients avatars */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-[#9AA6A0] uppercase tracking-wider mb-3">
                    Recent Recipients
                  </p>
                  <div className="flex gap-4">
                    {SAVED_RECIPIENTS.slice(0, 3).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => selectRecipient(r)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold",
                          "ring-2 ring-transparent group-hover:ring-[#1FAF5A] transition-all",
                          r.avatarBg, r.avatarText,
                        )}>
                          {initials(r)}
                        </div>
                        <span className="text-xs text-[#5F6F68] group-hover:text-[#1FAF5A] transition-colors">
                          {r.firstName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search + New Recipient */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center gap-2 border border-[#DCE3DF] rounded-[8px] px-3 py-2.5 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all bg-white">
                    <Search className="w-4 h-4 text-[#9AA6A0] shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setShowAll(true); }}
                      placeholder="Search recipient"
                      className="flex-1 outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-transparent"
                    />
                  </div>
                  <Button
                    onClick={() =>
                      navigate(`/dashboard/send/recipient/new?${urlParams}`)
                    }
                    className="flex items-center gap-2 bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold px-4 rounded-[8px] h-auto py-2.5 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    New Recipient
                  </Button>
                </div>
              </div>

              {/* Recipients list */}
              <div className="divide-y divide-[#F0F4F2]">
                {displayed.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center px-6">
                    <div className="w-14 h-14 rounded-full bg-[#EEF7F1] flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-[#1FAF5A]" />
                    </div>
                    <p className="font-semibold text-[#1E2A24] mb-1">No recipients found</p>
                    <p className="text-sm text-[#9AA6A0]">
                      Try a different name or{" "}
                      <button
                        onClick={() => navigate(`/dashboard/send/recipient/new?${urlParams}`)}
                        className="text-[#1FAF5A] font-semibold hover:underline"
                      >
                        add a new recipient
                      </button>
                    </p>
                  </div>
                ) : (
                  displayed.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRecipient(r)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAF9] transition-colors group text-left"
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                        "ring-2 ring-transparent group-hover:ring-[#1FAF5A]/40 transition-all",
                        r.avatarBg, r.avatarText,
                      )}>
                        {initials(r)}
                      </div>

                      {/* Name + bank */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1E2A24] text-sm group-hover:text-[#1FAF5A] transition-colors">
                          {r.firstName} {r.lastName}
                        </p>
                        <p className="text-xs text-[#9AA6A0] mt-0.5">{r.bankName}</p>
                      </div>

                      {/* Service type + account */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-[#1FAF5A]">
                          {DELIVERY_LABEL[r.delivery] ?? r.delivery}
                        </p>
                        <p className="text-xs text-[#9AA6A0] mt-0.5 font-mono">
                          {r.accountNo}
                        </p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-[#DCE3DF] group-hover:text-[#1FAF5A] transition-colors shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {/* Show More */}
              {!query && filtered.length > VISIBLE_DEFAULT && (
                <div className="px-6 py-4 border-t border-[#E5ECE8]">
                  <Button
                    onClick={() => setShowAll((v) => !v)}
                    variant="outline"
                    className="w-full h-11 rounded-[8px] border-[#DCE3DF] text-[#5F6F68] font-semibold hover:border-[#1FAF5A] hover:text-[#1FAF5A] transition-all"
                  >
                    {showAll ? "Show Less" : `Show More (${filtered.length - VISIBLE_DEFAULT} more)`}
                  </Button>
                </div>
              )}
            </motion.div>
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
