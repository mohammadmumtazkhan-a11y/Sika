import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCIES,
  MOCK_RATES,
  TRANSFER_FEES,
  SEND_CURRENCIES,
  RECEIVE_CURRENCIES,
} from "@/data/currencies";
import { cn } from "@/lib/utils";

function getCurrency(code: string) {
  return CURRENCIES.find((c) => c.code === code)!;
}

export default function TransferCalculator() {
  const [, navigate] = useLocation();
  const [sendAmount, setSendAmount] = useState("100");
  const [sendCurrency, setSendCurrency] = useState("GBP");
  const [receiveCurrency, setReceiveCurrency] = useState("NGN");

  const { rate, fee, receiveAmount } = useMemo(() => {
    const sendRate = MOCK_RATES[sendCurrency] ?? 1;
    const recvRate = MOCK_RATES[receiveCurrency] ?? 1;
    const rate = recvRate / sendRate;
    const fee = TRANSFER_FEES[receiveCurrency] ?? TRANSFER_FEES.DEFAULT;
    const amount = parseFloat(sendAmount || "0");
    const receiveAmount = Math.max(0, (amount - fee) * rate);
    return { rate, fee, receiveAmount };
  }, [sendAmount, sendCurrency, receiveCurrency]);

  const sendCur = getCurrency(sendCurrency);
  const recvCur = getCurrency(receiveCurrency);

  const formatReceive = (val: number) => {
    return val.toLocaleString("en-GB", {
      minimumFractionDigits: recvCur.decimals,
      maximumFractionDigits: recvCur.decimals,
    });
  };

  const formatRate = (r: number) => {
    if (r >= 1000) return r.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    if (r >= 10) return r.toLocaleString("en-GB", { maximumFractionDigits: 2 });
    return r.toFixed(4);
  };

  return (
    <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-6 w-full max-w-[360px]">
      <h3 className="font-display font-bold text-[#1E2A24] text-lg mb-5">
        Send Money
      </h3>

      {/* You Send */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-[#5F6F68] mb-1.5">
          You Send
        </label>
        <div
          className={cn(
            "flex items-center border rounded-[8px] overflow-hidden transition-all duration-200",
            "border-[#DCE3DF] focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]"
          )}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            className="flex-1 px-3 py-3 outline-none text-[#1E2A24] font-semibold bg-white text-base min-w-0"
            placeholder="0.00"
          />
          <div className="border-l border-[#DCE3DF] bg-[#F8FAF9]">
            <Select value={sendCurrency} onValueChange={setSendCurrency}>
              <SelectTrigger className="border-0 bg-transparent h-full px-3 py-3 min-w-[100px] rounded-none focus:ring-0 font-medium text-sm">
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

      {/* Exchange rate display */}
      <div className="flex items-center justify-center gap-2 my-3 py-2 px-3 bg-[#EEF7F1] rounded-[8px]">
        <span className="text-xs text-[#5F6F68]">
          1 {sendCurrency} = <span className="font-semibold text-[#1FAF5A]">{formatRate(rate)} {receiveCurrency}</span>
        </span>
        <ArrowRight className="w-3 h-3 text-[#1FAF5A]" />
        <span className="text-xs text-[#9AA6A0] flex items-center gap-1">
          <Info className="w-3 h-3" />
          Indicative rate
        </span>
      </div>

      {/* They Receive */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-[#5F6F68] mb-1.5">
          They Receive
        </label>
        <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden bg-[#F8FAF9]">
          <div className="flex-1 px-3 py-3 text-[#1E2A24] font-semibold text-base">
            {formatReceive(receiveAmount)}
          </div>
          <div className="border-l border-[#DCE3DF] bg-[#EEF7F1]">
            <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
              <SelectTrigger className="border-0 bg-transparent h-full px-3 py-3 min-w-[100px] rounded-none focus:ring-0 font-medium text-sm">
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

      {/* Fee row */}
      <div className="flex items-center justify-between text-xs text-[#9AA6A0] mb-4 px-1">
        <span>Transfer Fee</span>
        <span className="font-medium text-[#5F6F68]">
          {sendCur.symbol}{fee.toFixed(2)}
        </span>
      </div>

      {/* CTA */}
      <Button
        onClick={() => navigate("/login")}
        className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold py-3 h-12 rounded-[8px] text-base transition-colors duration-200"
      >
        Send Money
      </Button>

      {/* Disclaimer */}
      <p className="text-[10px] text-[#9AA6A0] text-center mt-3 leading-tight">
        *Rate locked for 15 minutes after account creation.
        <br />
        Final rate confirmed at time of payment.
      </p>
    </div>
  );
}
