import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Search, UserPlus, ArrowRight, ChevronRight, Landmark,
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

/* ─── Mock saved recipients ─────────────────────────────── */
interface SavedRecipient {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  bankName: string;
  accountNo: string;
  delivery: string;
  avatarBg: string;
  avatarText: string;
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
  upi: "UPI Transfer",
  "m-pesa": "M-Pesa",
  cash_pickup: "Cash Pickup",
  alipay: "Alipay",
};

/* ─── Helpers ───────────────────────────────────────────── */
function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function initials(r: SavedRecipient) {
  return `${r.firstName[0]}${r.lastName[0]}`.toUpperCase();
}

/* ─── Page ──────────────────────────────────────────────── */
export default function MobileSelectRecipient() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const fromCcy  = p.get("from")     || "GBP";
  const toCcy    = p.get("to")       || "NGN";
  const amount   = p.get("amount")   || "100";
  const delivery = p.get("delivery") || "bank_deposit";

  /* ── Amount calculations ──────────────────────────────── */
  const sendCur = getCurrency(fromCcy);
  const recvCur = getCurrency(toCcy);
  const rate    = (MOCK_RATES[toCcy] ?? 1) / (MOCK_RATES[fromCcy] ?? 1);
  const baseFee = TRANSFER_FEES[toCcy] ?? TRANSFER_FEES.DEFAULT;
  const delivFee = (DELIVERY_METHODS[toCcy] ?? []).find((d) => d.id === delivery)?.fee ?? 0;
  const totalFee = baseFee + delivFee;
  const sendAmt  = parseFloat(amount || "0");
  const recvAmt  = Math.max(0, (sendAmt - totalFee) * rate);

  const formatRecv = (v: number) =>
    v.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });

  /* ── Search ────────────────────────────────────────────── */
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return SAVED_RECIPIENTS;
    return SAVED_RECIPIENTS.filter(
      (r) =>
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.bankName.toLowerCase().includes(q)
    );
  }, [query]);

  /* ── Select recipient handler ─────────────────────────── */
  const selectRecipient = (r: SavedRecipient) => {
    sessionStorage.setItem(
      "sika_recipient",
      JSON.stringify({
        firstName: r.firstName,
        lastName: r.lastName,
        nickname: r.firstName,
        relationship: r.relationship,
        reason: "",
        narration: "",
      })
    );
    sessionStorage.setItem(
      "sika_bank",
      JSON.stringify({
        accountNo: r.accountNo,
        bankName: r.bankName,
        ifsc: "",
        bic: "",
        iban: "",
        upiId: "",
        verified: true,
      })
    );
    navigate(
      `/m/dashboard/send/recipient/new?from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${r.delivery}&existing=1`
    );
  };

  const urlParams = `from=${fromCcy}&to=${toCcy}&amount=${amount}&delivery=${delivery}`;

  return (
    <>
    <MitoTransitionLoader />
    <MobileLayout
      title="Select Recipient"
      showBack
      onBack={() => navigate(`/m/send?${urlParams}`)}
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

        {/* Recent recipients — horizontal avatars */}
        <div>
          <p className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold mb-2.5">
            Recent Recipients
          </p>
          <div className="flex gap-4">
            {SAVED_RECIPIENTS.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => selectRecipient(r)}
                className="flex flex-col items-center gap-1.5 group min-h-[44px]"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold",
                    "ring-2 ring-transparent group-hover:ring-[#1FAF5A] group-active:ring-[#1FAF5A] transition-all",
                    r.avatarBg, r.avatarText
                  )}
                >
                  {initials(r)}
                </div>
                <span className="text-[11px] text-[#5F6F68] group-hover:text-[#1FAF5A] transition-colors">
                  {r.firstName}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 border border-[#DCE3DF] rounded-[10px] px-3 py-3 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all bg-white">
          <Search className="w-4 h-4 text-[#9AA6A0] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipient by name"
            className="flex-1 outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-transparent"
          />
        </div>

        {/* New Recipient button */}
        <Button
          onClick={() => navigate(`/m/dashboard/send/recipient/new?${urlParams}`)}
          className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold h-12 rounded-[10px] text-sm shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          New Recipient
        </Button>

        {/* Saved recipients list */}
        <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#E5ECE8]">
            <span className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
              Saved Recipients ({filtered.length})
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF7F1] flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-[#1FAF5A]" />
              </div>
              <p className="font-semibold text-[#1E2A24] text-sm mb-1">No recipients found</p>
              <p className="text-xs text-[#9AA6A0]">Try a different name or add a new recipient</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F4F2]">
              {filtered.map((r, idx) => (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => selectRecipient(r)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-[#F8FAF9] transition-colors text-left min-h-[56px]"
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      r.avatarBg, r.avatarText
                    )}
                  >
                    {initials(r)}
                  </div>

                  {/* Name + bank */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1E2A24] text-sm truncate">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="text-[11px] text-[#9AA6A0] mt-0.5 truncate">{r.bankName}</p>
                  </div>

                  {/* Delivery type + account */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-semibold text-[#1FAF5A]">
                      {DELIVERY_LABEL[r.delivery] ?? r.delivery}
                    </p>
                    <p className="text-[10px] text-[#9AA6A0] mt-0.5 font-mono">
                      {r.accountNo}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#DCE3DF] shrink-0" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Sticky footer: Amount card ────────────────────── */}
      <div className="sticky bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#F8FAF9] via-[#F8FAF9] to-[#F8FAF9]/80 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        <MobileAmountCard
          sendAmount={sendAmt}
          sendSymbol={sendCur.symbol}
          sendCode={fromCcy}
          recvAmount={formatRecv(recvAmt)}
          recvCode={toCcy}
          totalFee={totalFee}
        />
      </div>
    </MobileLayout>
    </>
  );
}
