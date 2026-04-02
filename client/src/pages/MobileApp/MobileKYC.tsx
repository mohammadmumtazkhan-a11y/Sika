import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, User, Calendar, MapPin, Phone, ArrowRight, Info, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import MobileLayout from "./components/MobileLayout";
import MitoTransitionLoader from "@/components/MitoTransitionLoader";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Nigeria", "Ghana", "Kenya", "India", "South Africa",
  "United Arab Emirates", "Germany", "France",
];

/* ── Reusable field with icon (matches web MiniKYCPage) ── */
function Field({
  label, icon: Icon, required = false, optional = false, children, hint,
}: {
  label: string; icon: React.ElementType; required?: boolean;
  optional?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#1E2A24] mb-1.5">
        {label}
        {required && <span className="text-[#E5484D] ml-0.5">*</span>}
        {optional && <span className="text-[#9AA6A0] text-[10px] ml-1">(optional)</span>}
      </label>
      <div className="flex items-center border border-[#DCE3DF] rounded-[10px] overflow-hidden transition-all duration-200 focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)]">
        <div className="w-10 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
          <Icon className="w-4 h-4 text-[#178A47]" />
        </div>
        {children}
      </div>
      {hint && (
        <p className="text-[10px] text-[#9AA6A0] mt-1 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" /> {hint}
        </p>
      )}
    </div>
  );
}

function inputCls(extra = "") {
  return cn("flex-1 px-3 py-3 outline-none text-[#1E2A24] bg-white text-sm placeholder:text-[#9AA6A0]", extra);
}

export default function MobileKYC() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect") || "/m/dashboard";

  const [form, setForm] = useState({
    country: "United Kingdom", firstName: "", lastName: "", dob: "",
    address1: "", address2: "", city: "", postCode: "", phone: "",
  });
  const [loading, setLoading] = useState(false);

  /* ── Auto-fill from registration sessionStorage ── */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sika_reg");
      if (stored) {
        const reg = JSON.parse(stored);
        setForm((prev) => ({
          ...prev,
          country:   reg.country   || prev.country,
          firstName: reg.firstName || prev.firstName,
          lastName:  reg.lastName  || prev.lastName,
          phone:     reg.phone     || prev.phone,
        }));
      }
    } catch { /* ignore */ }
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
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
      sessionStorage.removeItem("sika_reg");
      sessionStorage.setItem("sika_kyc_done", "1");
      toast.success("Identity verified! Now add your recipient details…");
      navigate(redirect);
    }, 1000);
  };

  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const maxDobStr = maxDob.toISOString().split("T")[0];

  return (
    <>
      <MitoTransitionLoader />
      <MobileLayout title="Identity Verification" showBack showBottomNav={false}>
        <div className="px-4 py-4 space-y-4">

          {/* Mito.Money badge */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
            style={{ background: "linear-gradient(135deg, #061410 0%, #0F3A20 55%, #1a5c35 100%)" }}
          >
            <motion.div
              animate={{ x: ["-100%", "400%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
              className="absolute inset-0 w-1/3 pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }}
            />
            <span className="relative shrink-0 flex items-center justify-center w-2 h-2">
              <motion.span
                animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
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

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[10px] px-3.5 py-3">
            <Info className="w-4 h-4 text-[#1FAF5A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#1E2A24]">Why do we need this?</p>
              <p className="text-[11px] text-[#5F6F68] mt-0.5 leading-relaxed">
                As an FCA-regulated service, we're required to verify your identity before you send money.
                Your data is encrypted and never shared without your consent.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-[14px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[#DCE3DF] overflow-hidden">

              {/* ── Personal Details header ── */}
              <div className="px-4 py-3 bg-[#1E2A24] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#1FAF5A]" />
                <h3 className="font-display font-semibold text-white text-[11px] uppercase tracking-wider">
                  Personal Details
                </h3>
              </div>

              <div className="p-4 space-y-3 border-b border-[#E5ECE8]">
                {/* Country */}
                <div>
                  <label className="block text-xs font-medium text-[#1E2A24] mb-1.5">
                    Country <span className="text-[#E5484D]">*</span>
                  </label>
                  <div className="flex items-center border border-[#DCE3DF] rounded-[10px] overflow-hidden focus-within:border-[#1FAF5A] focus-within:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all">
                    <div className="w-10 flex items-center justify-center border-r border-[#DCE3DF] bg-[#EEF7F1] self-stretch shrink-0">
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

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name" icon={User} required>
                    <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="First Name" className={inputCls()} required />
                  </Field>
                  <Field label="Last Name" icon={User} required>
                    <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Last Name" className={inputCls()} required />
                  </Field>
                </div>

                {/* DOB + Phone row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date of Birth" icon={Calendar} required hint="You must be 18 or over">
                    <input type="date" value={form.dob} onChange={set("dob")} max={maxDobStr} className={inputCls("text-[#1E2A24]")} required />
                  </Field>
                  <Field label="Phone" icon={Phone} optional>
                    <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+44" className={inputCls()} />
                  </Field>
                </div>
              </div>

              {/* ── Address header ── */}
              <div className="px-4 py-3 bg-[#1E2A24] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#1FAF5A]" />
                <h3 className="font-display font-semibold text-white text-[11px] uppercase tracking-wider">
                  Address
                </h3>
              </div>

              <div className="p-4 space-y-3">
                <Field label="Address Line 1" icon={MapPin} required>
                  <input type="text" value={form.address1} onChange={set("address1")} placeholder="House number and street" className={inputCls()} required />
                </Field>
                <Field label="Address Line 2" icon={MapPin} optional>
                  <input type="text" value={form.address2} onChange={set("address2")} placeholder="Apartment, suite, floor" className={inputCls()} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" icon={MapPin} required>
                    <input type="text" value={form.city} onChange={set("city")} placeholder="City" className={inputCls()} required />
                  </Field>
                  <Field label="Postcode" icon={MapPin} required hint="E.g. SW1A 1AA">
                    <input type="text" value={form.postCode} onChange={set("postCode")} placeholder="POSTCODE" className={inputCls("uppercase")} required />
                  </Field>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#9AA6A0] mt-2.5 mb-4">
              Fields marked <span className="text-[#E5484D]">*</span> are required.
            </p>

            <Button
              type="submit" disabled={loading}
              className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-60 shadow-[0_4px_16px_rgba(31,175,90,0.3)]"
            >
              {loading ? "Verifying…" : (<>Verify & Continue <ArrowRight className="w-4 h-4 ml-1" /></>)}
            </Button>
          </form>
        </div>
      </MobileLayout>
    </>
  );
}
