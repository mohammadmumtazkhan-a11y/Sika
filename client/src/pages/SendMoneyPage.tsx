import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowRight,
  Clock,
  Shield,
  ChevronRight,
  Banknote,
  Smartphone,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CURRENCIES, MOCK_RATES, TRANSFER_FEES, SEND_CURRENCIES, RECEIVE_CURRENCIES } from "@/data/currencies";
import { COUNTRIES } from "@/data/countries";
import { DELIVERY_METHODS, getDefaultDelivery } from "@/data/deliveryMethods";
import { cn } from "@/lib/utils";

function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

function getCountryByCurrency(currencyCode: string) {
  return COUNTRIES.find((c) => c.currency === currencyCode);
}

const DELIVERY_ICONS: Record<string, React.ElementType> = {
  bank_deposit: Building2,
  mobile_money: Smartphone,
  cash_pickup:  PackageOpen,
  upi:          Banknote,
  alipay:       Smartphone,
  "m-pesa":     Smartphone,
};

export default function SendMoneyPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);

  const initialFrom   = params.get("from")   || "GBP";
  const initialTo     = params.get("to")     || "NGN";
  const initialAmount = params.get("amount") || "100";

  const [sendAmount,      setSendAmount]      = useState(initialAmount);
  const [sendCurrency,    setSendCurrency]    = useState(initialFrom);
  const [receiveCurrency, setReceiveCurrency] = useState(initialTo);
  const [deliveryMethod,  setDeliveryMethod]  = useState(() => getDefaultDelivery(initialTo));

  // Recalculate when receive currency changes
  const handleReceiveCurrencyChange = (val: string) => {
    setReceiveCurrency(val);
    setDeliveryMethod(getDefaultDelivery(val));
  };

  const destCountry  = getCountryByCurrency(receiveCurrency);
  const sendCur      = getCurrency(sendCurrency);
  const recvCur      = getCurrency(receiveCurrency);
  const deliveryOpts = DELIVERY_METHODS[receiveCurrency] ?? [];
  const selectedDelivery = deliveryOpts.find((d) => d.id === deliveryMethod) ?? deliveryOpts[0];

  const { rate, baseFee, totalFee, receiveAmount } = useMemo(() => {
    const sendRate  = MOCK_RATES[sendCurrency]    ?? 1;
    const recvRate  = MOCK_RATES[receiveCurrency] ?? 1;
    const rate      = recvRate / sendRate;
    const baseFee   = TRANSFER_FEES[receiveCurrency] ?? TRANSFER_FEES.DEFAULT;
    const totalFee  = baseFee + (selectedDelivery?.fee ?? 0);
    const amount    = parseFloat(sendAmount || "0");
    const receiveAmount = Math.max(0, (amount - totalFee) * rate);
    return { rate, baseFee, totalFee, receiveAmount };
  }, [sendAmount, sendCurrency, receiveCurrency, selectedDelivery]);

  const formatReceive = (val: number) =>
    val.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });

  const formatRate = (r: number) => {
    if (r >= 1000) return r.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    if (r >= 10)   return r.toLocaleString("en-GB", { maximumFractionDigits: 2 });
    return r.toFixed(4);
  };

  const handleContinue = () => {
    // ── KYC routing rule ──────────────────────────────────────────────
    // sika_kyc_done is set in two situations:
    //   1. LoginPage  → existing customer logs in (already KYC'd on record)
    //   2. MiniKYCPage → new customer completes KYC for the first time
    // Once set in either case, KYC is NEVER shown again for that session.
    // ─────────────────────────────────────────────────────────────────
    const kycDone = sessionStorage.getItem("sika_kyc_done") === "1";

    if (kycDone) {
      // KYC already done (logged-in existing user OR new user who completed
      // KYC earlier this session) — go straight to recipient selection
      navigate(
        `/dashboard/send/recipient?from=${sendCurrency}&to=${receiveCurrency}&amount=${sendAmount}&delivery=${deliveryMethod}`
      );
    } else {
      // KYC not yet done — new user on their first send this session.
      // Route through Mini KYC; post-KYC lands on Add New Recipient form.
      const newRecipientUrl = `/dashboard/send/recipient/new?from=${sendCurrency}&to=${receiveCurrency}&amount=${sendAmount}&delivery=${deliveryMethod}`;
      navigate(
        `/kyc?redirect=${encodeURIComponent(newRecipientUrl)}&from=${sendCurrency}&to=${receiveCurrency}&amount=${sendAmount}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        className="relative flex items-end"
        style={{ paddingTop: "70px", minHeight: "240px" }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#178A47]/80" />
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/60 text-sm mb-1 flex items-center gap-2">
              <span
                onClick={() => navigate("/")}
                className="cursor-pointer hover:text-white transition-colors"
              >
                Home
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">Send Money</span>
              {destCountry && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-[#1FAF5A]">{destCountry.name}</span>
                </>
              )}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2 leading-tight">
              Easily send money to those who matter most.
            </h1>
            {destCountry && (
              <p className="text-[#1FAF5A] text-5xl font-extrabold font-display mt-1 tracking-tight">
                {destCountry.name.toUpperCase()}
              </p>
            )}
            <p className="text-white/50 text-sm mt-2">
              Use our services to securely send money to {destCountry?.name ?? "your destination"}.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: corridor info ──────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#DCE3DF] p-5"
            >
              <h3 className="font-display font-semibold text-[#1E2A24] mb-4 text-sm uppercase tracking-wider">
                Why send with Sika?
              </h3>
              {[
                { icon: Shield, label: "FCA Regulated & Secure", desc: "Bank-grade 128-bit encrypted transfers." },
                { icon: Clock,  label: "Fast Transfers",          desc: "Most transfers arrive within minutes." },
                { icon: ArrowRight, label: "Best Rates",          desc: "Competitive exchange rates, low fees." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-3 mb-4 last:mb-0">
                  <div className="w-9 h-9 rounded-full bg-[#EEF7F1] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#1FAF5A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E2A24]">{label}</p>
                    <p className="text-xs text-[#5F6F68] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Corridor info */}
            {destCountry && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#DCE3DF] p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{destCountry.flag}</span>
                  <div>
                    <p className="font-display font-bold text-[#1E2A24]">{destCountry.name}</p>
                    <p className="text-xs text-[#5F6F68]">Receive in {receiveCurrency}</p>
                  </div>
                </div>
                <div className="bg-[#EEF7F1] rounded-[8px] p-3">
                  <p className="text-xs text-[#5F6F68] mb-1">Current exchange rate</p>
                  <p className="text-lg font-bold text-[#1FAF5A] font-display">
                    1 {sendCurrency} = {formatRate(rate)} {receiveCurrency}
                  </p>
                  <p className="text-[10px] text-[#9AA6A0] mt-1">
                    Rate locked for 15 minutes after account creation
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right: transfer form ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-[#DCE3DF] overflow-hidden">
              {/* Form header — Sika badge */}
              <motion.div
                initial={{ opacity: 0, x: -200 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-t-[16px]"
                style={{
                  background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)",
                }}
              >
                <motion.div
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                  className="absolute inset-0 w-1/4 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
                />
                <div className="relative px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center"
                      >
                        <span className="text-white font-black text-sm font-display drop-shadow-sm">S</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
                      />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/80 uppercase tracking-[0.16em] font-semibold leading-none mb-0.5">Managed and Powered by</p>
                      <p className="text-sm font-extrabold text-white leading-none tracking-wide font-display drop-shadow-sm">SikaCash</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {[{ delay: 0, bg: "bg-white" }, { delay: 0.5, bg: "bg-yellow-200" }, { delay: 1, bg: "bg-white" }].map(({ delay, bg }, i) => (
                      <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
                        className={`w-1.5 h-1.5 rounded-full ${bg}`} />
                    ))}
                  </div>
                </div>
              </motion.div>
              <div className="px-6 pt-4 pb-1">
                <h2 className="font-display font-bold text-[#1E2A24] text-lg">Transfer Details</h2>
                <p className="text-[#5F6F68] text-sm">Enter the amount and choose how to deliver funds</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Amount row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* You Send */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6F68] mb-1.5 uppercase tracking-wider">
                      You Send
                    </label>
                    <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="flex-1 px-3 py-3 outline-none text-[#1E2A24] font-bold text-xl bg-white min-w-0"
                        placeholder="0.00"
                      />
                      <div className="border-l border-[#DCE3DF] bg-[#F8FAF9]">
                        <Select value={sendCurrency} onValueChange={setSendCurrency}>
                          <SelectTrigger className="border-0 bg-transparent px-3 py-3 min-w-[110px] rounded-none focus:ring-0 font-semibold text-sm h-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#DCE3DF] shadow-lg rounded-[10px] z-[100]">
                            {SEND_CURRENCIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  <span className="font-medium">{c.code}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* They Receive */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6F68] mb-1.5 uppercase tracking-wider">
                      They Receive
                    </label>
                    <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden bg-[#F8FAF9]">
                      <div className="flex-1 px-3 py-3 text-[#1E2A24] font-bold text-xl">
                        {formatReceive(receiveAmount)}
                      </div>
                      <div className="border-l border-[#DCE3DF] bg-[#EEF7F1]">
                        <Select value={receiveCurrency} onValueChange={handleReceiveCurrencyChange}>
                          <SelectTrigger className="border-0 bg-transparent px-3 py-3 min-w-[110px] rounded-none focus:ring-0 font-semibold text-sm h-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#DCE3DF] shadow-lg rounded-[10px] z-[100]">
                            {RECEIVE_CURRENCIES.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                <span className="flex items-center gap-2">
                                  <span>{c.flag}</span>
                                  <span className="font-medium">{c.code}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exchange rate bar */}
                <div className="flex items-center justify-between bg-[#EEF7F1] rounded-[8px] px-4 py-2.5">
                  <span className="text-sm text-[#5F6F68]">Exchange Rate</span>
                  <span className="text-sm font-bold text-[#1FAF5A]">
                    1 {sendCurrency} = {formatRate(rate)} {receiveCurrency}
                  </span>
                </div>

                {/* Delivery Method */}
                {deliveryOpts.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5F6F68] mb-3 uppercase tracking-wider">
                      Delivery Method
                    </label>
                    <div className="space-y-2.5">
                      {deliveryOpts.map((dm) => {
                        const Icon = DELIVERY_ICONS[dm.id] ?? Building2;
                        const selected = deliveryMethod === dm.id;
                        return (
                          <button
                            key={dm.id}
                            onClick={() => setDeliveryMethod(dm.id)}
                            className={cn(
                              "w-full flex items-center gap-4 px-4 py-3.5 rounded-[8px] border-2 text-left transition-all duration-200",
                              selected
                                ? "border-[#1FAF5A] bg-[#EEF7F1]"
                                : "border-[#DCE3DF] bg-white hover:border-[#1FAF5A]/40"
                            )}
                          >
                            {/* Radio circle */}
                            <div className={cn(
                              "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                              selected ? "border-[#1FAF5A]" : "border-[#DCE3DF]"
                            )}>
                              {selected && <div className="w-2 h-2 rounded-full bg-[#1FAF5A]" />}
                            </div>

                            <div className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                              selected ? "bg-[#1FAF5A]/15" : "bg-[#F8FAF9]"
                            )}>
                              <Icon className={cn("w-4 h-4", selected ? "text-[#1FAF5A]" : "text-[#9AA6A0]")} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-semibold",
                                selected ? "text-[#1FAF5A]" : "text-[#1E2A24]"
                              )}>
                                {dm.label}
                              </p>
                              <p className="text-xs text-[#5F6F68] mt-0.5 truncate">{dm.description}</p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-xs font-semibold text-[#1E2A24]">
                                {dm.fee === 0 ? "Free" : `+${sendCur.symbol}${dm.fee.toFixed(2)}`}
                              </p>
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <Clock className="w-3 h-3 text-[#9AA6A0]" />
                                <p className="text-[10px] text-[#9AA6A0]">{dm.estimatedTime}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Summary box */}
                <div className="bg-[#F8FAF9] rounded-[10px] border border-[#DCE3DF] overflow-hidden">
                  <div className="px-5 py-3 bg-[#1E2A24]">
                    <p className="text-white text-xs font-semibold uppercase tracking-wider">Transfer Summary</p>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    {[
                      { label: "You Send",     value: `${sendCur.symbol}${parseFloat(sendAmount || "0").toFixed(2)} ${sendCurrency}` },
                      { label: "Transfer Fee", value: `${sendCur.symbol}${baseFee.toFixed(2)} ${sendCurrency}` },
                      { label: "Delivery Fee", value: `${sendCur.symbol}${(selectedDelivery?.fee ?? 0).toFixed(2)} ${sendCurrency}`, hide: (selectedDelivery?.fee ?? 0) === 0 },
                      { label: "Total Fees",   value: `${sendCur.symbol}${totalFee.toFixed(2)} ${sendCurrency}`, bold: true },
                    ].filter((r) => !r.hide).map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className={cn("text-sm text-[#5F6F68]", row.bold && "font-semibold text-[#1E2A24]")}>
                          {row.label}
                        </span>
                        <span className={cn("text-sm text-[#1E2A24]", row.bold && "font-bold")}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-[#DCE3DF] pt-3 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#1E2A24]">Total Received</span>
                        <span className="text-xl font-extrabold text-[#1FAF5A] font-display">
                          {formatReceive(receiveAmount)} {receiveCurrency}
                        </span>
                      </div>
                      {destCountry && (
                        <p className="text-xs text-[#9AA6A0] mt-1 text-right flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedDelivery?.estimatedTime ?? "Same day"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Continue CTA */}
                <Button
                  onClick={handleContinue}
                  className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-4 h-14 rounded-[10px] text-lg shadow-[0_4px_20px_rgba(31,175,90,0.3)] transition-all duration-200"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center text-xs text-[#9AA6A0]">
                  A quick identity check is required before completing the transfer.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Corridor description */}
      {destCountry && (
        <div className="border-t border-[#DCE3DF] bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display font-bold text-[#1E2A24] text-xl mb-3">
              Transfer funds to support your loved ones: {destCountry.name}
            </h2>
            <p className="text-[#5F6F68] text-sm leading-relaxed max-w-3xl">
              Africa Remittance Company, doing business as SikaCash, provides a secure online money transfer service through a 128-bit encrypted web browser. This service is perfect for sending money to family, friends, and trusted acquaintances in {destCountry.name}.
              Powered by Mito.Money in partnership with Sika.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
