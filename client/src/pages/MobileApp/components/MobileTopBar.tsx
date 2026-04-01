import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Bell } from "lucide-react";
import sikaLogo from "@/assets/Sika Logo.png";
import { cn } from "@/lib/utils";

interface MobileTopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showBell?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export default function MobileTopBar({
  title,
  showBack = false,
  onBack,
  showBell = false,
  rightElement,
  transparent = false,
}: MobileTopBarProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center justify-between px-4 h-14",
        transparent
          ? "bg-transparent"
          : "bg-white border-b border-[#E5ECE8] shadow-sm"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-[48px]">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#EEF7F1] active:bg-[#DCE3DF] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#1E2A24]" />
          </button>
        ) : (
          <button onClick={() => navigate("/m")} className="shrink-0">
            <img src={sikaLogo} alt="SikaCash" className="h-8 w-auto object-contain" />
          </button>
        )}
      </div>

      {/* Centre */}
      {title && (
        <motion.h1
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-bold text-[#1E2A24] text-base truncate px-2 text-center flex-1"
        >
          {title}
        </motion.h1>
      )}

      {/* Right */}
      <div className="flex items-center gap-1 min-w-[48px] justify-end">
        {showBell && (
          <button className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#EEF7F1] active:bg-[#DCE3DF] transition-colors">
            <Bell className="w-5 h-5 text-[#1E2A24]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E5484D] rounded-full" />
          </button>
        )}
        {rightElement}
      </div>
    </header>
  );
}
