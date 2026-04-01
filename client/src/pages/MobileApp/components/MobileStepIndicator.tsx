import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  n: number;
  label: string;
}

interface MobileStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function MobileStepIndicator({ steps, currentStep }: MobileStepIndicatorProps) {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map((step, idx) => {
        const done = step.n < currentStep;
        const active = step.n === currentStep;

        return (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done && "bg-[#1FAF5A] text-white shadow-[0_2px_6px_rgba(31,175,90,0.3)]",
                  active && "border-2 border-[#1FAF5A] bg-white text-[#1FAF5A] ring-2 ring-[#1FAF5A]/15",
                  !done && !active && "bg-[#E5ECE8] text-[#9AA6A0]"
                )}
              >
                {done ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.n}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium whitespace-nowrap",
                  done || active ? "text-[#1FAF5A]" : "text-[#9AA6A0]"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-1.5 -mt-4 rounded-full",
                  done ? "bg-[#1FAF5A]" : "bg-[#E5ECE8]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
