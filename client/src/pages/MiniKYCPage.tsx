import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, User, Calendar, MapPin, Phone, ArrowRight, ChevronLeft, Info, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MitoLayout from "@/components/MitoLayout";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Send Details"  },
  { number: 2, label: "Verify ID"     },
  { number: 3, label: "Pay"           },
];

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Nigeria", "Ghana", "Kenya", "India", "South Africa",
  "United Arab Emirates", "Germany", "France",
];

/* ── Reusable field ────────────────────────────────────────── */
function Field({
  label, icon: Icon, required = false, optional = false, children, hint,
}: {
  label: string; icon: React.ElementType; required?: boolean;
  optional?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
        {label}
        {required && <span className="text-[#E5484D] ml-0.5">*</span>}
        {optional && <span className="text-[#9AA6A0] text-xs ml-1">(optional)</span>}
      </label>
      <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden transition-all duration-200 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
        <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
          <Icon className="w-4 h-4 text-[#178A47]" />
        </div>
        {children}
      </div>
      {hint && (
        <p className="text-[11px] text-[#9AA6A0] mt-1 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" /> {hint}
        </p>
      )}
    </div>
  );
}

function inputCls(extra = "") {
  return cn("flex-1 px-3 py-3 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]", extra);
}

export default function MiniKYCPage() {
  const [, navigate] = useLocation();
  const search  = useSearch();
  const params  = new URLSearchParams(search);
  const redirect  = params.get("redirect") || "/dashboard";
  // Reconstruct the Send Money back-link from the corridor params if present
  const fromCcy   = params.get("from");
  const toCcy     = params.get("to");
  const amount    = params.get("amount");
  const backLink  = fromCcy
    ? `/send?from=${fromCcy}&to=${toCcy}&amount=${amount}`
    : null;

  /* ── Auto-fill from registration sessionStorage ───────── */
  const [form, setForm] = useState({
    country:   "United Kingdom",
    firstName: "",
    lastName:  "",
    dob:       "",
    address1:  "",
    address2:  "",
    city:      "",
    postCode:  "",
    phone:     "",
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sika_reg");
      if (stored) {
        const reg = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          country:   reg.country    || prev.country,
          firstName: reg.firstName  || prev.firstName,
          lastName:  reg.lastName   || prev.lastName,
          phone:     reg.phone      || prev.phone,
        }));
      }
    } catch { /* ignore */ }
  }, []);

  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required: (keyof typeof form)[] = [
      "country", "firstName", "lastName", "dob", "address1", "city", "postCode",
    ];
    if (required.some((k) => !form[k])) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.removeItem("sika_reg");  // clean up
      sessionStorage.setItem("sika_kyc_done", "1");
      toast.success("Identity verified! Now add your recipient details…");
      navigate(redirect);
    }, 1000);
  };

  /* ── max DOB = 18 years ago ──────────────────────────── */
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const maxDobStr = maxDob.toISOString().split("T")[0];

  return (
    <MitoLayout
      steps={STEPS}
      currentStep={2}
      title="Identity Verification"
      subtitle="We need a few details to keep your account secure and compliant"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Back button */}
        {backLink && (
          <button
            onClick={() => navigate(backLink)}
            className="flex items-center gap-1.5 text-sm text-[#5F6F68] hover:text-[#1FAF5A] transition-colors mb-5 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Send Money
          </button>
        )}

        {/* Info banner */}
        <div className="bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[12px] px-5 py-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1FAF5A] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#1E2A24]">Why do we need this?</p>
            <p className="text-xs text-[#5F6F68] mt-0.5 leading-relaxed">
              As an FCA-regulated service, we're required to verify your identity before you send money.
              Your data is encrypted and never shared without your consent.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-[#DCE3DF] overflow-hidden">

            {/* ── Powered by badge — card header ── */}
            <div className="px-6 pt-4 pb-3 border-b border-[#E5ECE8]">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease: "easeOut" }}
                className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
                style={{
                  background: "linear-gradient(135deg, #061410 0%, #0F3A20 55%, #1a5c35 100%)",
                }}
              >
                <motion.div
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
                  className="absolute inset-0 w-1/3 pointer-events-none"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
                <span className="relative shrink-0 flex items-center justify-center w-2 h-2">
                  <motion.span
                    animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inline-flex w-full h-full rounded-full bg-[#1FAF5A]"
                  />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1FAF5A]" />
                </span>
                <Landmark className="w-3 h-3 text-[#F4B400] shrink-0" />
                <span className="text-white/50 text-[11px] font-medium tracking-wide whitespace-nowrap">Powered by</span>
                <span className="text-[#F4B400] text-[11px] font-bold tracking-wide whitespace-nowrap">Mito.Money</span>
                <span className="text-white/30 text-[11px] whitespace-nowrap">in partnership with</span>
                <span className="text-[#7DDBA5] text-[11px] font-semibold whitespace-nowrap">Sika</span>
              </motion.div>
            </div>

            {/* ── Personal Details ─────────────────────── */}
            <div className="px-6 py-3.5 bg-[#1E2A24] flex items-center gap-2">
              <User className="w-4 h-4 text-[#1FAF5A]" />
              <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                Personal Details
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#E5ECE8]">
              {/* Country */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#1E2A24] mb-1.5">
                  Country <span className="text-[#E5484D]">*</span>
                </label>
                <div className="flex items-center border border-[#DCE3DF] rounded-[8px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all">
                  <div className="w-11 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
                    <Globe className="w-4 h-4 text-[#178A47]" />
                  </div>
                  <select
                    value={form.country}
                    onChange={set("country")}
                    className="flex-1 px-3 py-3 outline-none text-[#1E2A24] bg-white text-sm appearance-none cursor-pointer"
                    required
                  >
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* First Name */}
              <Field label="First Name" icon={User} required>
                <input
                  type="text" value={form.firstName} onChange={set("firstName")}
                  placeholder="First Name" className={inputCls()} required
                />
              </Field>

              {/* Last Name */}
              <Field label="Last Name" icon={User} required>
                <input
                  type="text" value={form.lastName} onChange={set("lastName")}
                  placeholder="Last Name" className={inputCls()} required
                />
              </Field>

              {/* DOB */}
              <Field
                label="Date of Birth" icon={Calendar} required
                hint="You must be 18 or over to use SikaCash"
              >
                <input
                  type="date" value={form.dob} onChange={set("dob")}
                  max={maxDobStr} placeholder="dd-mm-yyyy"
                  className={inputCls("text-[#1E2A24]")} required
                />
              </Field>

              {/* Phone */}
              <Field label="Phone Number" icon={Phone} optional>
                <input
                  type="tel" value={form.phone} onChange={set("phone")}
                  placeholder="Phone Number (optional)" className={inputCls()}
                />
              </Field>
            </div>

            {/* ── Address ──────────────────────────────── */}
            <div className="px-6 py-3.5 bg-[#1E2A24] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1FAF5A]" />
              <h3 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                Address
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address Line 1" icon={MapPin} required>
                  <input
                    type="text" value={form.address1} onChange={set("address1")}
                    placeholder="House number and street name" className={inputCls()} required
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Address Line 2" icon={MapPin} optional>
                  <input
                    type="text" value={form.address2} onChange={set("address2")}
                    placeholder="Apartment, suite, floor, etc." className={inputCls()}
                  />
                </Field>
              </div>

              <Field label="City" icon={MapPin} required>
                <input
                  type="text" value={form.city} onChange={set("city")}
                  placeholder="City" className={inputCls()} required
                />
              </Field>

              <Field
                label="Postcode / ZIP" icon={MapPin} required
                hint="E.g. SW1A 1AA (UK)"
              >
                <input
                  type="text" value={form.postCode} onChange={set("postCode")}
                  placeholder="POSTCODE / ZIP" className={inputCls("uppercase")} required
                />
              </Field>
            </div>
          </div>

          <p className="text-[11px] text-[#9AA6A0] mt-3 mb-5">
            Fields marked <span className="text-[#E5484D]">*</span> are required.
          </p>

          <Button
            type="submit" disabled={loading}
            className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold h-13 py-3.5 rounded-[10px] text-base shadow-[0_4px_20px_rgba(31,175,90,0.3)] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? "Verifying…" : (<>Verify & Continue <ArrowRight className="w-5 h-5" /></>)}
          </Button>
        </form>
      </motion.div>
    </MitoLayout>
  );
}
