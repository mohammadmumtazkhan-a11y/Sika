import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  SendHorizonal, Phone, ArrowDownLeft,
  ArrowRight, ChevronDown, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_USER = {
  name:             "Olayinka",
  accountNo:        "210145",
  sentBalance:      750895.75,
  walletBalance:    253007.92,
  collectionBalance: 4357384.08,
};

const MOCK_TRANSACTIONS = [
  { ref: "22502784", recipient: "Bob Woolmer",    service: "Bank Deposit",  date: "29 Oct 2025", amount: "GBP 60.00",  status: "Pending"   },
  { ref: "22502785", recipient: "Sarah Chen",     service: "Mobile Money",  date: "28 Oct 2025", amount: "GBP 150.00", status: "Completed" },
  { ref: "22502786", recipient: "James Okonkwo",  service: "Bank Deposit",  date: "27 Oct 2025", amount: "GBP 200.00", status: "Completed" },
  { ref: "22502787", recipient: "Amara Diallo",   service: "Mobile Money",  date: "25 Oct 2025", amount: "GBP 75.00",  status: "Completed" },
  { ref: "22502788", recipient: "Fatima Hassan",  service: "Bank Deposit",  date: "22 Oct 2025", amount: "GBP 500.00", status: "Failed"    },
];

const STATUS_STYLES: Record<string, string> = {
  Pending:   "bg-[#FFF3CD] text-[#997A00]",
  Completed: "bg-[#D1FAE5] text-[#065F46]",
  Failed:    "bg-[#FEE2E2] text-[#991B1B]",
};

const STATUS_DOT: Record<string, string> = {
  Pending:   "bg-[#F4B400]",
  Completed: "bg-[#1FAF5A]",
  Failed:    "bg-[#E5484D]",
};

type TransactionTab = "recent" | "scheduled";

/* ── Balance pill with currency selector ─────────────────── */
function BalanceRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E5ECE8] last:border-0">
      <span className="text-sm text-[#5F6F68]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#1FAF5A]">{value}</span>
        <div className="flex items-center gap-1 bg-[#F8FAF9] border border-[#DCE3DF] rounded-[6px] px-2 py-0.5 text-xs text-[#5F6F68] cursor-pointer hover:border-[#1FAF5A] transition-colors">
          {sub ?? "GBP"}
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [txTab, setTxTab] = useState<TransactionTab>("recent");

  // Hide transactions for freshly registered users (flag set by VerifyEmailPage)
  const isNewUser = sessionStorage.getItem("sika_new_user") === "1";

  const cardVariant = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0  },
  };

  return (
    <DashboardLayout userName={MOCK_USER.name}>
      {/* ── Welcome heading ────────────────────────────── */}
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-extrabold text-[#1E2A24] mb-6"
      >
        Welcome {MOCK_USER.name}
      </motion.h1>

      {/* ── Sika brand badge ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[14px] overflow-hidden mb-6"
        style={{
          background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)",
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
          className="absolute inset-0 w-1/4 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
        />
        <div className="relative px-5 py-3.5 flex items-center justify-between">
          {/* Left: Sika icon + text */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              >
                <span className="text-white font-black text-base font-display drop-shadow-sm">S</span>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
              />
            </div>
            <div>
              <p className="text-[10px] text-white/80 uppercase tracking-[0.16em] font-semibold leading-none mb-1">
                Managed and Powered by
              </p>
              <p className="text-lg font-extrabold text-white leading-none tracking-wide font-display drop-shadow-sm">
                SikaCash
              </p>
            </div>
          </div>
          {/* Right: animated sparkle dots */}
          <div className="flex items-center gap-2 shrink-0">
            {[
              { delay: 0,   bg: "bg-white" },
              { delay: 0.5, bg: "bg-yellow-200" },
              { delay: 1.0, bg: "bg-white" },
            ].map(({ delay, bg }, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
                className={`w-2 h-2 rounded-full ${bg}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Two-column grid: Quick Services + Account Summary ── */}
      <motion.div
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6"
      >
        {/* Quick Services */}
        <motion.div variants={cardVariant} className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#EEF7F1] flex items-center justify-center">
              <SendHorizonal className="w-4 h-4 text-[#1FAF5A]" />
            </div>
            <h2 className="font-display font-bold text-[#1E2A24]">Quick Services</h2>
          </div>
          <div className="space-y-2.5">
            {/* Send Money */}
            <button
              onClick={() => navigate("/send")}
              className="w-full flex items-center justify-between bg-[#1FAF5A] hover:bg-[#178A47] text-white rounded-[10px] px-4 py-3.5 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <SendHorizonal className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Send Money</p>
                  <p className="text-white/70 text-xs">Transfer globally</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Airtime Topup */}
            <button
              onClick={() => toast.info("Airtime Topup coming soon.")}
              className="w-full flex items-center justify-between bg-[#F8FAF9] hover:bg-[#EEF7F1] border border-[#DCE3DF] text-[#5F6F68] hover:text-[#1FAF5A] rounded-[10px] px-4 py-3.5 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E5ECE8] flex items-center justify-center group-hover:bg-[#EEF7F1]">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Airtime Topup</p>
                  <p className="text-[#9AA6A0] text-xs">Recharge mobile</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Request Payment */}
            <button
              onClick={() => toast.info("Request Payment coming soon.")}
              className="w-full flex items-center justify-between bg-[#178A47] hover:bg-[#0F6B36] text-white rounded-[10px] px-4 py-3.5 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Request Payment</p>
                  <p className="text-white/70 text-xs">Get paid fast</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Account Summary */}
        <motion.div variants={cardVariant} className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5">
          <h2 className="font-display font-bold text-[#1E2A24] mb-2">Account Summary</h2>
          <BalanceRow label="Account" value={MOCK_USER.accountNo} />
          <BalanceRow
            label="Sent"
            value={isNewUser ? "0.00" : MOCK_USER.sentBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          />
          <div className="pt-2">
            <p className="text-xs font-semibold text-[#9AA6A0] uppercase tracking-wider mb-1">Wallet</p>
            <BalanceRow
              label="Balance"
              value={isNewUser ? "0.00" : MOCK_USER.walletBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            />
          </div>
          <div className="pt-2">
            <p className="text-xs font-semibold text-[#9AA6A0] uppercase tracking-wider mb-1">Collection Account</p>
            <BalanceRow
              label="Balance"
              value={isNewUser ? "0.00" : MOCK_USER.collectionBalance.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Transactions (existing users only) ────────── */}
      {!isNewUser && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden"
      >
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5ECE8]">
          <div className="flex items-center gap-1">
            {(["recent", "scheduled"] as TransactionTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTxTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize",
                  txTab === tab
                    ? "bg-[#EEF7F1] text-[#1FAF5A] font-semibold"
                    : "text-[#9AA6A0] hover:text-[#5F6F68]"
                )}
              >
                {tab === "recent" ? "Recent Transactions" : "Scheduled"}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/dashboard/transfers")}
            className="flex items-center gap-1 text-sm font-semibold text-[#1FAF5A] hover:text-[#178A47] transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        {txTab === "recent" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E5ECE8]">
                  {["Ref No.", "Recipient", "Service", "Date", "Amount", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold text-[#9AA6A0] uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map((tx, i) => (
                  <tr
                    key={tx.ref}
                    className={cn(
                      "border-b border-[#E5ECE8] transition-colors hover:bg-[#FAFCFA]",
                      i === MOCK_TRANSACTIONS.length - 1 && "border-0"
                    )}
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/dashboard/transactions/${tx.ref}`)}
                        className="text-sm font-semibold text-[#1FAF5A] hover:underline flex items-center gap-1"
                      >
                        {tx.ref}
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#1E2A24]">{tx.recipient}</td>
                    <td className="px-5 py-4 text-sm text-[#5F6F68]">{tx.service}</td>
                    <td className="px-5 py-4 text-sm text-[#5F6F68] whitespace-nowrap">{tx.date}</td>
                    <td className="px-5 py-4 text-sm font-bold text-[#1E2A24] whitespace-nowrap">{tx.amount}</td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                        STATUS_STYLES[tx.status]
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[tx.status])} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        onClick={() => toast.info(`Resending transaction ${tx.ref}…`)}
                        className="bg-[#1FAF5A] hover:bg-[#178A47] text-white text-xs font-semibold h-8 px-4 rounded-[6px]"
                      >
                        Resend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#EEF7F1] flex items-center justify-center mb-3">
              <SendHorizonal className="w-6 h-6 text-[#1FAF5A]" />
            </div>
            <p className="font-semibold text-[#1E2A24] mb-1">No scheduled transfers</p>
            <p className="text-sm text-[#9AA6A0]">Schedule a recurring transfer to see it here.</p>
          </div>
        )}
      </motion.div>}
    </DashboardLayout>
  );
}
