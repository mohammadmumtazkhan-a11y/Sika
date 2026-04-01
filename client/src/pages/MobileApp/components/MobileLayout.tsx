import { motion } from "framer-motion";
import MobileTopBar from "./MobileTopBar";
import MobileBottomNav from "./MobileBottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showBell?: boolean;
  showBottomNav?: boolean;
  activeTab?: string;
  topBarRight?: React.ReactNode;
  transparentTopBar?: boolean;
  /** Extra padding at bottom for sticky CTAs (default: true when bottomNav shown) */
  bottomPad?: boolean;
}

export default function MobileLayout({
  children,
  title,
  showBack = false,
  onBack,
  showBell = false,
  showBottomNav = true,
  activeTab = "home",
  topBarRight,
  transparentTopBar = false,
  bottomPad,
}: MobileLayoutProps) {
  const hasPad = bottomPad ?? showBottomNav;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex justify-center">
      {/* Phone-width container */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8FAF9] relative flex flex-col">
        {/* Top bar */}
        <MobileTopBar
          title={title}
          showBack={showBack}
          onBack={onBack}
          showBell={showBell}
          rightElement={topBarRight}
          transparent={transparentTopBar}
        />

        {/* Scrollable content */}
        <motion.main
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: hasPad ? "88px" : "0" }}
        >
          {children}
        </motion.main>

        {/* Bottom nav */}
        {showBottomNav && <MobileBottomNav activeTab={activeTab} />}
      </div>
    </div>
  );
}
