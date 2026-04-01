import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import sikaLogo from "@/assets/Sika Logo.png";
import mitoLogo from "@/assets/Mito_logo.svg";

const FOOTER_LINKS = {
  Company: [
    { label: "About Us", href: "#about" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Services: [
    { label: "Send Money", href: "#" },
    { label: "Track Transfer", href: "#" },
    { label: "Exchange Rates", href: "#" },
    { label: "Group Pay", href: "#" },
  ],
  Support: [
    { label: "Help Centre", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Security", href: "#" },
    { label: "Complaints", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "AML Policy", href: "#" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1E2A24] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <img
              src={sikaLogo}
              alt="Sika"
              className="h-12 w-auto mb-3 brightness-0 invert"
            />
            <p className="text-sm text-white/50 leading-relaxed mb-5">
              Fast, secure, and affordable international money transfers from the UK.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: "Twitter" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1FAF5A] transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display font-semibold text-sm text-white/90 mb-4 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>Powered by</span>
            <img src={mitoLogo} alt="Mito.Money" className="h-5 w-auto brightness-0 invert opacity-50" />
            <span>in partnership with Sika</span>
          </div>
          <p className="text-xs text-white/30 text-center md:text-right">
            © {year} Africa Remittance Co LLC. All rights reserved.
            <br className="md:hidden" />
            <span className="hidden md:inline"> · </span>
            Authorised by the FCA under the Money Laundering Regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
