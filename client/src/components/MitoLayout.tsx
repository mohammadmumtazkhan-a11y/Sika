import { useLocation } from "wouter";
import sikaLogo from "@/assets/Sika Logo.png";
import mitoLogo from "@/assets/Mito_logo.svg";
import MitoTransitionLoader from "./MitoTransitionLoader";

interface Step {
  number: number;
  label: string;
}

interface MitoLayoutProps {
  children: React.ReactNode;
  steps?: Step[];
  currentStep?: number;
  title: string;
  subtitle?: string;
  hideFooter?: boolean;
}

export default function MitoLayout({
  children,
  steps,
  currentStep,
  title,
  subtitle,
  hideFooter,
}: MitoLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <>
      <MitoTransitionLoader />
      <div className="min-h-screen bg-[#F8FAF9] flex flex-col">
      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="bg-white border-b border-[#E5ECE8] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="focus:outline-none">
            <img src={sikaLogo} alt="SikaCash" className="h-11 w-auto object-contain" />
          </button>

          {/* Powered by badge */}
          <div className="flex items-center gap-2 bg-[#EEF7F1] border border-[#DCE3DF] rounded-full px-3 py-1.5">
            <span className="text-[10px] text-[#5F6F68]">Powered by</span>
            <img src={mitoLogo} alt="Mito.Money" className="h-4 w-auto" />
            <span className="text-[10px] text-[#5F6F68]">in partnership with</span>
            <span className="text-[10px] font-bold text-[#1FAF5A]">Sika</span>
          </div>
        </div>
      </header>

      {/* ── Step progress bar ─────────────────────────────── */}
      {steps && steps.length > 0 && (
        <div className="bg-white border-b border-[#E5ECE8]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-0">
              {steps.map((step, idx) => {
                const done    = currentStep !== undefined && step.number < currentStep;
                const active  = currentStep === step.number;
                const isLast  = idx === steps.length - 1;

                return (
                  <div key={step.number} className="flex items-center flex-1 last:flex-none">
                    {/* Circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300 ${
                          done
                            ? "bg-[#1FAF5A] text-white"
                            : active
                            ? "bg-[#178A47] text-white ring-4 ring-[#1FAF5A]/20"
                            : "bg-[#DCE3DF] text-[#9AA6A0]"
                        }`}
                      >
                        {done ? (
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                      <span
                        className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                          active ? "text-[#178A47]" : done ? "text-[#1FAF5A]" : "text-[#9AA6A0]"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>

                    {/* Connector line */}
                    {!isLast && (
                      <div className="flex-1 mx-2 mb-4">
                        <div
                          className={`h-0.5 w-full transition-all duration-300 ${
                            done ? "bg-[#1FAF5A]" : "bg-[#DCE3DF]"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Page heading ──────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0F3A20] to-[#178A47] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">{title}</h1>
          {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      {!hideFooter && <footer className="border-t border-[#E5ECE8] bg-white py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#9AA6A0]">
            <img src={mitoLogo} alt="Mito.Money" className="h-4 w-auto opacity-60" />
            <span>Powered by Mito.Money in partnership with Sika</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-[#9AA6A0]">
              <svg className="w-3 h-3 text-[#1FAF5A]" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a5 5 0 0 0-5 5v1H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V6a5 5 0 0 0-5-5zm3 6H5V6a3 3 0 1 1 6 0v1z"/>
              </svg>
              SSL Secured
            </div>
            <div className="bg-[#1A1F71] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-widest">VISA</div>
            <div className="flex">
              <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
              <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-2 opacity-90" />
            </div>
          </div>
        </div>
      </footer>}
    </div>
    </>
  );
}
