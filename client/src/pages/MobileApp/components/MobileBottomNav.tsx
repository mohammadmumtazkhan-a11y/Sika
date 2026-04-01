import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, SendHorizonal, Clock, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "home",     icon: Home,           label: "Home",     path: "/m/dashboard" },
  { id: "activity", icon: Clock,          label: "Activity", path: "/m/dashboard" },
  { id: "send",     icon: SendHorizonal,  label: "Send",     path: "/m/send",     fab: true },
  { id: "profile",  icon: UserCircle,     label: "Profile",  path: "/m/dashboard" },
];

interface MobileBottomNavProps {
  activeTab?: string;
}

export default function MobileBottomNav({ activeTab = "home" }: MobileBottomNavProps) {
  const [, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5ECE8] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-[430px] mx-auto flex items-end justify-around px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.fab) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative -mt-5 flex flex-col items-center"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1FAF5A] to-[#178A47] flex items-center justify-center shadow-[0_4px_20px_rgba(31,175,90,0.45)]"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-[10px] font-semibold text-[#1FAF5A] mt-1">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center py-1.5 px-3 min-w-[56px]"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-[#1FAF5A]" : "text-[#9AA6A0]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium mt-0.5 transition-colors",
                  isActive ? "text-[#1FAF5A]" : "text-[#9AA6A0]"
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="w-4 h-[2px] bg-[#1FAF5A] rounded-full mt-0.5"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
