import type { LucideIcon } from "lucide-react";

interface HowItWorksStepProps {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function HowItWorksStep({
  step,
  icon: Icon,
  title,
  description,
  isLast = false,
}: HowItWorksStepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Connector line (desktop only, hidden on last step) */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-0.5 bg-[#DCE3DF] z-0" />
      )}

      {/* Icon circle */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-[#1FAF5A] flex items-center justify-center shadow-[0_4px_16px_rgba(31,175,90,0.3)] mb-4">
        <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
      </div>

      {/* Step number badge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-x-5 -translate-y-1 w-5 h-5 bg-[#F4B400] rounded-full flex items-center justify-center z-20">
        <span className="text-[10px] font-bold text-[#1E2A24]">{step}</span>
      </div>

      <h3 className="font-display font-semibold text-[#1E2A24] text-lg mb-2">{title}</h3>
      <p className="text-sm text-[#5F6F68] leading-relaxed max-w-xs">{description}</p>
    </div>
  );
}
