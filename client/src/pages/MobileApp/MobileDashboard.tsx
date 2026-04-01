import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Send, Phone, Download, ArrowUpRight, ArrowDownLeft,
  Clock, Wallet, CreditCard, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MobileLayout from "./components/MobileLayout";
import { cn } from "@/lib/utils";

/* ─── Mock transactions for existing users ──────────────── */
const MOCK_TRANSACTIONS = [
  {
    id: "TXN001",
    recipientName: "Adewale Ogunleye",
    amount: "₦485,000.00",
    sendAmount: "£250.00",
    date: "28 Mar 2026",
    status: "completed" as const,
    type: "send" as const,
    country: "Nigeria",
    flag: "🇳🇬",
  },
  {
    id: "TXN002",
    recipientName: "Kwame Asante",
    amount: "₵3,250.00",
    sendAmount: "£180.00",
    date: "25 Mar 2026",
    status: "pending" as const,
    type: "send" as const,
    country: "Ghana",
    flag: "🇬🇭",
  },
  {
    id: "TXN003",
    recipientName: "Grace Muthoni",
    amount: "KSh45,800.00",
    sendAmount: "£320.75",
    date: "22 Mar 2026",
    status: "completed" as const,
    type: "send" as const,
    country: "Kenya",
    flag: "🇰🇪",
  },
];

/* ─── Status badge component ────────────────────────────── */
function StatusBadge({ status }: { status: "completed" | "pending" | "failed" }) {
  const styles = {
    completed: "bg-[#EEF7F1] text-[#1FAF5A]",
    pending: "bg-[#FFF9EC] text-[#F4B400]",
    failed: "bg-[#FFF5F5] text-[#E5484D]",
  };
  const labels = {
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
  };
  return (
    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", styles[status])}>
      {labels[status]}
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default function MobileDashboard() {
  const [, navigate] = useLocation();
  const [isNewUser, setIsNewUser] = useState(false);
  const [userName, setUserName] = useState("Olayinka");

  useEffect(() => {
    const newUser = sessionStorage.getItem("sika_new_user") === "1";
    setIsNewUser(newUser);

    if (newUser) {
      try {
        const reg = JSON.parse(sessionStorage.getItem("sika_reg") || "{}");
        if (reg.firstName) {
          setUserName(reg.firstName);
        } else {
          setUserName("User");
        }
      } catch {
        setUserName("User");
      }
    }
  }, []);

  return (
    <MobileLayout
      showBottomNav
      activeTab="home"
      showBell
    >
      <div className="px-4 py-4 space-y-5">

        {/* ── Sika badge ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#F4B400]/10 to-[#F4B400]/5 border border-[#F4B400]/20"
        >
          <span className="w-2 h-2 rounded-full bg-[#F4B400]" />
          <span className="text-[11px] font-bold text-[#F4B400] tracking-wide">SikaCash</span>
          <span className="text-[11px] text-[#5F6F68]">UK</span>
        </motion.div>

        {/* ── Welcome heading ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-xl font-display font-bold text-[#1E2A24]">
            Welcome, {userName}
          </h1>
          <p className="text-xs text-[#5F6F68] mt-0.5">
            {isNewUser
              ? "Get started by sending your first transfer"
              : "Manage your transfers and recipients"}
          </p>
        </motion.div>

        {/* ── Quick Services ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-bold text-[#1E2A24] uppercase tracking-wider">
            Quick Services
          </h2>

          {/* Send Money */}
          <button
            onClick={() => navigate("/m/send")}
            className="w-full bg-gradient-to-r from-[#1FAF5A] to-[#178A47] rounded-[14px] p-4 flex items-center gap-4 shadow-[0_4px_16px_rgba(31,175,90,0.2)] active:scale-[0.98] transition-transform"
          >
            <div className="w-11 h-11 rounded-[12px] bg-white/20 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-bold text-white block">Send Money</span>
              <span className="text-[11px] text-white/70">Fast transfers to 15+ countries</span>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50 shrink-0" />
          </button>

          {/* Airtime Topup */}
          <button
            disabled
            className="w-full bg-white rounded-[14px] border border-[#E5ECE8] p-4 flex items-center gap-4 opacity-60 cursor-not-allowed"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#EEF7F1] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#1FAF5A]" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-[#1E2A24] block">Airtime Topup</span>
              <span className="text-[11px] text-[#9AA6A0]">Recharge mobiles internationally</span>
            </div>
            <span className="text-[9px] font-bold bg-[#F4B400]/15 text-[#F4B400] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Soon
            </span>
          </button>

          {/* Request Payment */}
          <button
            disabled
            className="w-full bg-white rounded-[14px] border border-[#E5ECE8] p-4 flex items-center gap-4 opacity-60 cursor-not-allowed"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#EEF7F1] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#1FAF5A]" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-[#1E2A24] block">Request Payment</span>
              <span className="text-[11px] text-[#9AA6A0]">Request money from contacts</span>
            </div>
            <span className="text-[9px] font-bold bg-[#F4B400]/15 text-[#F4B400] px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
              Soon
            </span>
          </button>
        </motion.div>

        {/* ── Account Summary ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-[#E5ECE8] flex items-center justify-between">
            <span className="text-[10px] text-[#9AA6A0] uppercase tracking-wider font-semibold">
              Account Summary
            </span>
            <span className="text-[10px] text-[#5F6F68] font-medium">
              #210145
            </span>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* Sent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#FFF5F5] flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-[#E5484D]" />
                </div>
                <span className="text-xs text-[#5F6F68]">Total Sent</span>
              </div>
              <span className="text-sm font-bold text-[#1E2A24] font-display">
                {isNewUser ? "£0.00" : "£750,895.75"}
              </span>
            </div>

            {/* Wallet Balance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#EEF7F1] flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#1FAF5A]" />
                </div>
                <span className="text-xs text-[#5F6F68]">Wallet Balance</span>
              </div>
              <span className="text-sm font-bold text-[#1FAF5A] font-display">
                {isNewUser ? "£0.00" : "£253,007.92"}
              </span>
            </div>

            {/* Collection Account */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <span className="text-xs text-[#5F6F68]">Collection Account</span>
              </div>
              <span className="text-sm font-bold text-[#1E2A24] font-display">
                {isNewUser ? "£0.00" : "£4,357,384.08"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Recent Transactions (existing users only) ──── */}
        {!isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#1E2A24] uppercase tracking-wider">
                Recent Transactions
              </h2>
              <button className="text-[11px] text-[#1FAF5A] font-semibold hover:text-[#178A47] transition-colors">
                View All
              </button>
            </div>

            {MOCK_TRANSACTIONS.map((txn, idx) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + idx * 0.08 }}
                className="bg-white rounded-[12px] border border-[#E5ECE8] p-3.5 flex items-center gap-3"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#EEF7F1] flex items-center justify-center shrink-0">
                  <span className="text-base">{txn.flag}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#1E2A24] truncate">
                      {txn.recipientName}
                    </span>
                    <StatusBadge status={txn.status} />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-[#9AA6A0]" />
                    <span className="text-[10px] text-[#9AA6A0]">{txn.date}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#1E2A24] block">{txn.sendAmount}</span>
                  <span className="text-[10px] text-[#5F6F68]">{txn.amount}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── New user CTA ───────────────────────────────── */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="bg-gradient-to-br from-[#EEF7F1] to-[#F8FAF9] rounded-[14px] border border-[#1FAF5A]/15 p-5 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#1FAF5A]/10 flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-[#1FAF5A]" />
            </div>
            <h3 className="text-sm font-bold text-[#1E2A24] mb-1">
              Ready to send your first transfer?
            </h3>
            <p className="text-[11px] text-[#5F6F68] mb-4">
              Send money to family and friends across Africa and beyond
            </p>
            <Button
              onClick={() => navigate("/m/send")}
              className="bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold px-6 py-2.5 rounded-[10px] text-sm shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
            >
              Send Money Now <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>
    </MobileLayout>
  );
}
