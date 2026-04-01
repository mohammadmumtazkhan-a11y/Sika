import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, SendHorizonal, ArrowDownLeft, ShieldCheck,
  HeadphonesIcon, Gift, Settings, LogOut, ChevronDown,
  Bell, Menu, X, ChevronRight, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sikaLogo from "@/assets/Sika Logo.png";

interface NavItem {
  label:    string;
  icon:     React.ElementType;
  href?:    string;
  badge?:   string;
  badgeColor?: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    icon:  LayoutDashboard,
    href:  "/dashboard",
  },
  {
    label: "Money Sent",
    icon:  SendHorizonal,
    children: [
      { label: "All Transfers",   href: "/dashboard/transfers"   },
      { label: "Scheduled",       href: "/dashboard/scheduled"   },
    ],
  },
  {
    label: "Payments Received",
    icon:  ArrowDownLeft,
    children: [
      { label: "Received",        href: "/dashboard/received"    },
      { label: "Requests",        href: "/dashboard/requests"    },
    ],
  },
  { label: "Compliance", icon: ShieldCheck, href: "/dashboard/compliance" },
  { label: "Support",    icon: HeadphonesIcon, href: "/dashboard/support" },
  {
    label: "Bonus & Discounts",
    icon:  Gift,
    href:  "/dashboard/bonuses",
    badge: "NEW",
    badgeColor: "bg-[#F4B400] text-[#1E2A24]",
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  { label: "Logout",   icon: LogOut,   href: "/login"              },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName?: string;
}

function NavLink({
  item,
  currentPath,
  onNavigate,
}: {
  item: NavItem;
  currentPath: string;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isActive  = item.href === currentPath;
  const hasChildren = !!item.children?.length;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setOpen(!open);
          else if (item.href) onNavigate(item.href);
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 group",
          isActive
            ? "bg-[#EEF7F1] text-[#1FAF5A]"
            : "text-[#5F6F68] hover:bg-[#F8FAF9] hover:text-[#1E2A24]",
          item.label === "Bonus & Discounts" && !isActive && "bg-[#FFF9EC]"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors",
          isActive
            ? "bg-[#1FAF5A] text-white"
            : item.label === "Bonus & Discounts"
              ? "bg-[#F4B400]/20 text-[#F4B400]"
              : "bg-[#F8FAF9] text-[#9AA6A0] group-hover:bg-[#EEF7F1] group-hover:text-[#1FAF5A]"
        )}>
          <item.icon className="w-4 h-4" />
        </div>

        <span className="flex-1 text-left leading-tight">{item.label}</span>

        {item.badge && (
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", item.badgeColor)}>
            {item.badge}
          </span>
        )}

        {hasChildren && (
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
        )}
      </button>

      {/* Sub-items */}
      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-11 mt-0.5 space-y-0.5"
          >
            {item.children!.map((child) => (
              <button
                key={child.label}
                onClick={() => onNavigate(child.href)}
                className={cn(
                  "w-full text-left text-xs px-2 py-2 rounded-[8px] transition-colors flex items-center gap-1.5",
                  currentPath === child.href
                    ? "text-[#1FAF5A] font-semibold"
                    : "text-[#9AA6A0] hover:text-[#1FAF5A] hover:bg-[#EEF7F1]"
                )}
              >
                <ChevronRight className="w-3 h-3" />
                {child.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardLayout({ children, userName = "User" }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount] = useState(3);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#E5ECE8]">
        <button onClick={() => navigate("/dashboard")} className="focus:outline-none">
          <img src={sikaLogo} alt="SikaCash" className="h-11 w-auto object-contain" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            currentPath={location}
            onNavigate={(href) => { navigate(href); setMobileOpen(false); }}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2 border-t border-[#E5ECE8] space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            currentPath={location}
            onNavigate={(href) => { navigate(href); setMobileOpen(false); }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAF9] overflow-hidden">
      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-[#E5ECE8] shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: -224 }}
              animate={{ x: 0 }}
              exit={{ x: -224 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#E5ECE8] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E5ECE8] h-14 px-4 sm:px-6 flex items-center justify-between shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-[8px] text-[#5F6F68] hover:bg-[#EEF7F1] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />

          {/* Right: notifications + profile */}
          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <button className="relative p-2 rounded-[8px] text-[#5F6F68] hover:bg-[#EEF7F1] transition-colors">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E5484D] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] border border-[#DCE3DF] hover:bg-[#EEF7F1] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#1FAF5A] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-[#1E2A24] hidden sm:block">
                Individual Profile
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9AA6A0]" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
