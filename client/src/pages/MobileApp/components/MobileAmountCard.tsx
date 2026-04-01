import { useState } from "react";
import { Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileAmountCardProps {
  sendAmount: number;
  sendSymbol: string;
  sendCode: string;
  recvAmount: string;
  recvCode: string;
  totalFee: number;
}

function useCountdown(totalSecs: number) {
  const [secs, setSecs] = useState(totalSecs);
  if (secs > 0) setTimeout(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: secs <= 0 };
}

export default function MobileAmountCard({
  sendAmount,
  sendSymbol,
  sendCode,
  recvAmount,
  recvCode,
  totalFee,
}: MobileAmountCardProps) {
  const { display, expired } = useCountdown(15 * 60);

  return (
    <div className="bg-white rounded-[14px] border border-[#E5ECE8] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] mx-4 mb-4 overflow-hidden">
      {/* Timer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E5ECE8]">
        <span className="text-xs font-semibold text-[#1E2A24]">Transfer Summary</span>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full",
            expired ? "bg-[#FFF5F5] text-[#E5484D]" : "bg-[#EEF7F1] text-[#1FAF5A]"
          )}
        >
          <Clock className="w-3 h-3" />
          {display}
        </div>
      </div>

      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-[#5F6F68]">You Send</span>
          <span className="font-semibold text-[#1E2A24]">
            {sendSymbol}{sendAmount.toFixed(2)} {sendCode}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#5F6F68]">Fees</span>
          <span className="font-semibold text-[#1E2A24]">
            {sendSymbol}{totalFee.toFixed(2)} {sendCode}
          </span>
        </div>
        <div className="border-t border-[#E5ECE8] pt-2 flex justify-between items-center">
          <span className="text-xs font-bold text-[#1E2A24]">They Receive</span>
          <span className="text-base font-extrabold text-[#1FAF5A] font-display">
            {recvAmount} {recvCode}
          </span>
        </div>
      </div>

      {expired && (
        <div className="mx-4 mb-3 bg-[#FFF5F5] border border-[#E5484D]/20 rounded-[8px] p-2.5 flex items-start gap-2">
          <Info className="w-3 h-3 text-[#E5484D] mt-0.5 shrink-0" />
          <span className="text-[10px] text-[#E5484D]">Rate expired. Please restart.</span>
        </div>
      )}
    </div>
  );
}
