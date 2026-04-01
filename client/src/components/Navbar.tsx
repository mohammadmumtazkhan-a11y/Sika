import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import sikaLogo from "@/assets/Sika Logo.png";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "How Does It Work", href: "#how-it-works" },
  { label: "FAQs", href: "#about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  // Hide auth buttons when user is logged in (either existing user or new user who registered)
  const isLoggedIn =
    sessionStorage.getItem("sika_kyc_done") === "1" ||
    sessionStorage.getItem("sika_new_user") === "1";

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5ECE8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <button
            onClick={() => handleNavClick("#home")}
            className="flex items-center focus:outline-none shrink-0"
          >
            <img
              src={sikaLogo}
              alt="SikaCash"
              className="h-[52px] w-auto object-contain"
              style={{ maxWidth: "180px" }}
            />
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-[#5F6F68] hover:text-[#1FAF5A] transition-colors duration-200 whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA buttons — hidden when logged in */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center gap-2">
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#178A47] hover:bg-[#0F6B36] text-white font-semibold px-4 h-9 rounded-[6px] transition-colors duration-200 text-sm flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                New Sign up
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#178A47] hover:bg-[#0F6B36] text-white font-semibold px-4 h-9 rounded-[6px] transition-colors duration-200 text-sm flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Login
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-[#1E2A24] hover:bg-[#EEF7F1] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-[#E5ECE8] bg-white"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#1E2A24] hover:bg-[#EEF7F1] hover:text-[#1FAF5A] transition-colors"
                >
                  {link.label}
                </button>
              ))}
              {!isLoggedIn && (
                <div className={cn("flex gap-3 mt-3 pt-3 border-t border-[#E5ECE8]")}>
                  <Button
                    onClick={() => { setIsOpen(false); navigate("/register"); }}
                    className="flex-1 bg-[#178A47] hover:bg-[#0F6B36] text-white rounded-[6px] gap-1.5 text-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    New Sign up
                  </Button>
                  <Button
                    onClick={() => { setIsOpen(false); navigate("/login"); }}
                    className="flex-1 bg-[#178A47] hover:bg-[#0F6B36] text-white rounded-[6px] gap-1.5 text-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Login
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
