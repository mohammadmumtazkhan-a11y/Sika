import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Globe, User, Calendar, MapPin, Phone, ArrowRight, Info, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MobileLayout from "./components/MobileLayout";
import MitoTransitionLoader from "@/components/MitoTransitionLoader";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Nigeria", "Ghana", "Kenya", "India", "South Africa",
  "United Arab Emirates", "Germany", "France",
];

const inputCls = "w-full px-3 py-3 border border-[#DCE3DF] rounded-[10px] outline-none text-sm text-[#1E2A24] placeholder:text-[#9AA6A0] bg-white focus:border-[#1FAF5A] focus:shadow-[0_0_0_3px_rgba(31,175,90,0.12)] transition-all";

export default function MobileKYC() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect") || "/m/dashboard";

  const [form, setForm] = useState({
    country: "United Kingdom", firstName: "", lastName: "", dob: "", address1: "", address2: "", city: "", postCode: "", phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const reg = JSON.parse(sessionStorage.getItem("sika_reg") || "{}");
      if (reg.firstName) setForm((p) => ({ ...p, firstName: reg.firstName, lastName: reg.lastName || "" }));
    } catch {}
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dob || !form.address1 || !form.city || !form.postCode) {
      toast.error("Please fill in all required fields."); return;
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

  const maxDob = new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split("T")[0];

  return (
    <>
      <MitoTransitionLoader />
      <MobileLayout title="Identity Verification" showBack showBottomNav={false}>
      <div className="px-4 py-4 space-y-4">

        {/* Mito.Money badge */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden inline-flex items-center gap-2.5 px-4 py-2 rounded-[10px]"
          style={{ background: "linear-gradient(135deg, #061410 0%, #0F3A20 55%, #1a5c35 100%)" }}>
          <motion.div animate={{ x: ["-100%", "400%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 5 }} className="absolute inset-0 w-1/3 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }} />
          <span className="relative shrink-0 flex items-center justify-center w-2 h-2"><motion.span animate={{ scale: [1, 2.4, 1], opacity: [0.9, 0, 0.9] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inline-flex w-full h-full rounded-full bg-[#1FAF5A]" /><span className="relative inline-flex w-2 h-2 rounded-full bg-[#1FAF5A]" /></span>
          <Landmark className="w-3 h-3 text-[#F4B400] shrink-0" />
          <span className="text-white/50 text-[11px] font-medium tracking-wide">Powered by</span>
          <span className="text-[#F4B400] text-[11px] font-bold tracking-wide">Mito.Money</span>
          <span className="text-white/30 text-[11px]">×</span>
          <span className="text-[#7DDBA5] text-[11px] font-semibold">Sika</span>
        </motion.div>

        {/* Info */}
        <div className="flex items-start gap-2.5 bg-[#EEF7F1] border border-[#1FAF5A]/30 rounded-[10px] px-3.5 py-3">
          <Info className="w-4 h-4 text-[#1FAF5A] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#1E2A24]">Why do we need this?</p>
            <p className="text-[11px] text-[#5F6F68] mt-0.5">FCA-regulated identity check. Your data is encrypted and never shared.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Country *</label><select value={form.country} onChange={set("country")} className={inputCls + " appearance-none cursor-pointer"}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">First Name *</label><input value={form.firstName} onChange={set("firstName")} placeholder="First" className={inputCls} /></div>
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Last Name *</label><input value={form.lastName} onChange={set("lastName")} placeholder="Last" className={inputCls} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Date of Birth *</label><input type="date" value={form.dob} onChange={set("dob")} max={maxDob} className={inputCls} /></div>
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Phone <span className="text-[#9AA6A0] text-[10px]">(optional)</span></label><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+44" className={inputCls} /></div>
          </div>

          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Address Line 1 *</label><input value={form.address1} onChange={set("address1")} placeholder="Street address" className={inputCls} /></div>
          <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Address Line 2 <span className="text-[#9AA6A0] text-[10px]">(optional)</span></label><input value={form.address2} onChange={set("address2")} placeholder="Apartment, floor" className={inputCls} /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">City *</label><input value={form.city} onChange={set("city")} placeholder="City" className={inputCls} /></div>
            <div><label className="text-xs font-medium text-[#1E2A24] mb-1 block">Postcode *</label><input value={form.postCode} onChange={set("postCode")} placeholder="E.g. SW1A 1AA" className={inputCls} /></div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#1FAF5A] hover:bg-[#178A47] text-white font-bold py-3.5 h-12 rounded-[10px] text-base disabled:opacity-60 shadow-[0_4px_16px_rgba(31,175,90,0.3)] mt-2">
            {loading ? "Verifying…" : <><span>Verify & Continue</span><ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </form>
      </div>
    </MobileLayout>
    </>
  );
}
