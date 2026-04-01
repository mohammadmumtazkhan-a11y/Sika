import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Building2, Smartphone, PackageOpen, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "./components/MobileLayout";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES, SEND_CURRENCIES, RECEIVE_CURRENCIES } from "@/data/currencies";
import { DELIVERY_METHODS, getDefaultDelivery } from "@/data/deliveryMethods";
import { COUNTRIES } from "@/data/countries";
import { cn } from "@/lib/utils";

function getCurrency(code: string) { return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]; }

const DELIVERY_ICONS: Record<string, React.ElementType> = {
  bank_deposit: Building2, mobile_money: Smartphone, cash_pickup: PackageOpen, upi: Banknote, alipay: Smartphone, "m-pesa": Smartphone,
};

export default function MobileSendMoney() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const p = new URLSearchParams(search);

  const [sendAmt, setSendAmt] = useState(p.get("amount") || "100");
  const [sendCcy, setSendCcy] = useState(p.get("from") || "GBP");
  const [recvCcy, setRecvCcy] = useState(p.get("to") || "NGN");
  const [delivery, setDelivery] = useState(() => getDefaultDelivery(p.get("to") || "NGN"));

  const sendCur = getCurrency(sendCcy);
  const recvCur = getCurrency(recvCcy);
  const deliveryOpts = DELIVERY_METHODS[recvCcy] ?? [];
  const selectedDel = deliveryOpts.find((d) => d.id === delivery) ?? deliveryOpts[0];
  const destCountry = COUNTRIES.find((c) => c.currency === recvCcy);

  const { rate, totalFee, recvAmt } = useMemo(() => {
    const r = (MOCK_RATES[recvCcy] ?? 1) / (MOCK_RATES[sendCcy] ?? 1);
    const baseFee = TRANSFER_FEES[recvCcy] ?? TRANSFER_FEES.DEFAULT;
    const tf = baseFee + (selectedDel?.fee ?? 0);
    const amt = parseFloat(sendAmt || "0");
    return { rate: r, totalFee: tf, recvAmt: Math.max(0, (amt - tf) * r) };
  }, [sendAmt, sendCcy, recvCcy, selectedDel]);

  const formatRecv = (v: number) => v.toLocaleString("en-GB", { minimumFractionDigits: recvCur.decimals, maximumFractionDigits: recvCur.decimals });
  const formatRate = (r: number) => r >= 1000 ? r.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : r >= 10 ? r.toFixed(2) : r.toFixed(4);

  const handleContinue = () => {
    const kycDone = sessionStorage.getItem("sika_kyc_done") === "1";
    if (kycDone) {
      navigate(`/m/dashboard/send/recipient?from=${sendCcy}&to=${recvCcy}&amount=${sendAmt}&delivery=${delivery}`);
    } else {
      const newRecUrl = `/m/dashboard/send/recipient/new?from=${sendCcy}&to=${recvCcy}&amount=${sendAmt}&delivery=${delivery}`;
      navigate(`/m/kyc?redirect=${encodeURIComponent(newRecUrl)}&from=${sendCcy}&to=${recvCcy}&amount=${sendAmt}`);
    }
  };

  return (
    <MobileLayout title="Send Money" showBack showBottomNav={false}>
      <div className="px-4 py-4 space-y-4">

        {/* Orange Sika badge */}
        <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="relative rounded-[10px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}>
          <motion.div animate={{ x: ["-100%", "400%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }} className="absolute inset-0 w-1/4 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }} />
          <div className="relative px-4 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0"><span className="text-white font-black text-xs font-display">S</span></div>
            <div><p className="text-[8px] text-white/70 uppercase tracking-[0.15em] font-semibold">Managed and Powered by</p><p className="text-sm font-extrabold text-white font-display">SikaCash</p></div>
          </div>
        </motion.div>

        {/* Amount inputs */}
        <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm p-4 space-y-3">
          <div>
            <label className="text-[10px] text-[#5F6F68] uppercase tracking-wider font-semibold mb-1 block">You Send</label>
            <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden focus-within:border-[#1FAF5A]">
              <input type="number" value={sendAmt} onChange={(e) => setSendAmt(e.target.value)} className="flex-1 px-3 py-3 outline-none text-[#1E2A24] font-bold text-lg bg-white min-w-0" placeholder="0.00" />
              <select value={sendCcy} onChange={(e) => setSendCcy(e.target.value)} className="border-l border-[#DCE3DF] bg-[#F8FAF9] px-2 py-3 text-sm font-semibold outline-none appearance-none cursor-pointer">
                {SEND_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#EEF7F1] rounded-full px-3 py-1.5">
            <span className="text-xs font-bold text-[#1FAF5A]">1 {sendCcy} = {formatRate(rate)} {recvCcy}</span>
          </div>

          <div>
            <label className="text-[10px] text-[#5F6F68] uppercase tracking-wider font-semibold mb-1 block">They Receive</label>
            <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden bg-[#F8FAF9]">
              <div className="flex-1 px-3 py-3 text-[#1E2A24] font-bold text-lg">{formatRecv(recvAmt)}</div>
              <select value={recvCcy} onChange={(e) => { setRecvCcy(e.target.value); setDelivery(getDefaultDelivery(e.target.value)); }} className="border-l border-[#DCE3DF] bg-[#EEF7F1] px-2 py-3 text-sm font-semibold outline-none appearance-none cursor-pointer">
                {RECEIVE_CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Delivery methods — horizontal scroll */}
        {deliveryOpts.length > 0 && (
          <div>
            <p className="text-[10px] text-[#5F6F68] uppercase tracking-wider font-semibold mb-2 px-1">Delivery Method</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              {deliveryOpts.map((dm) => {
                const Icon = DELIVERY_ICONS[dm.id] ?? Building2;
                const sel = delivery === dm.id;
                return (
                  <button key={dm.id} onClick={() => setDelivery(dm.id)}
                    className={cn("shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-[12px] border-2 min-w-[100px] transition-all",
                      sel ? "border-[#1FAF5A] bg-[#EEF7F1]" : "border-[#E5ECE8] bg-white"
                    )}>
                    <Icon className={cn("w-5 h-5", sel ? "text-[#1FAF5A]" : "text-[#9AA6A0]")} />
                    <span className={cn("text-[10px] font-semibold whitespace-nowrap", sel ? "text-[#1FAF5A]" : "text-[#5F6F68]")}>{dm.label}</span>
                    <span className="text-[9px] text-[#9AA6A0]">{dm.fee === 0 ? "Free" : `+${sendCur.symbol}${dm.fee.toFixed(2)}`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary strip */}
        <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-sm px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-[#5F6F68]">Total Fees</span><span className="font-semibold text-[#1E2A24]">{sendCur.symbol}{totalFee.toFixed(2)}</span></div>
          <div className="flex justify-between items-center border-t border-[#E5ECE8] pt-2">
            <span className="text-xs font-bold text-[#1E2A24]">They Receive</span>
            <span className="text-lg font-extrabold text-[#1FAF5A] font-display">{formatRecv(recvAmt)} {recvCcy}</span>
          </div>
        </div>

        {/* CTA */}
        <Button onClick={handleContinue} className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-13 rounded-[12px] text-base shadow-[0_4px_16px_rgba(31,175,90,0.3)]">
          Continue <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

        <p className="text-center text-[10px] text-[#9AA6A0]">A quick identity check is required before completing the transfer.</p>
      </div>
    </MobileLayout>
  );
}
