import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { clearMitoFlow } from "@/components/MitoTransitionLoader";
import {
  Zap,
  Globe,
  BadgePoundSterling,
  UserPlus,
  ShieldCheck,
  Send,
  Apple,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TransferCalculator from "@/components/TransferCalculator";
import StatCounter from "@/components/StatCounter";
import FeatureCard from "@/components/FeatureCard";
import HowItWorksStep from "@/components/HowItWorksStep";
import CountryPill from "@/components/CountryPill";
import { COUNTRIES } from "@/data/countries";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HomePage() {
  const [, navigate] = useLocation();
  useEffect(() => { clearMitoFlow(); }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <Navbar />

      <main>
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section
          id="home"
          className="relative min-h-screen flex flex-col"
          style={{ paddingTop: "70px" }} // navbar height
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F13] via-[#0F3A20] to-[#1FAF5A]/80 z-0" />

          {/* Decorative circles */}
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-[#1FAF5A]/10 blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-20 left-0 w-[400px] h-[400px] rounded-full bg-[#178A47]/15 blur-3xl pointer-events-none z-0" />

          {/* Sika brand badge */}
          <motion.div
            initial={{ opacity: 0, x: -240 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6"
          >
            <div
              className="relative rounded-[14px] overflow-hidden"
              style={{ background: "linear-gradient(135deg, #E8590C 0%, #F97316 40%, #FB923C 70%, #F59E0B 100%)" }}
            >
              <motion.div
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
                className="absolute inset-0 w-1/4 pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
              />
              <div className="relative px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    >
                      <span className="text-white font-black text-base font-display drop-shadow-sm">S</span>
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/80 uppercase tracking-[0.16em] font-semibold leading-none mb-1">
                      Managed and Powered by
                    </p>
                    <p className="text-lg font-extrabold text-white leading-none tracking-wide font-display drop-shadow-sm">
                      SikaCash
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {[
                    { delay: 0, bg: "bg-white" },
                    { delay: 0.5, bg: "bg-yellow-200" },
                    { delay: 1.0, bg: "bg-white" },
                  ].map(({ delay, bg }, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.5, 1.5, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
                      className={`w-2 h-2 rounded-full ${bg}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
            {/* Left: headline */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <span className="inline-block text-[#F4B400] text-sm font-semibold uppercase tracking-widest mb-4 bg-[#F4B400]/10 px-3 py-1 rounded-full">
                UK's Trusted Transfer Service
              </span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5">
                Send Money To<br />
                <span className="text-[#1FAF5A]">Your Loved Ones</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                Fast, secure, and affordable international transfers from the UK to Africa, Asia, and beyond. Send in minutes, not days.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => navigate("/send")}
                  className="bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold px-8 py-3 h-12 rounded-[8px] text-base transition-all duration-200 shadow-[0_4px_20px_rgba(31,175,90,0.4)]"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  onClick={() => scrollTo("how-it-works")}
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white/60 px-8 py-3 h-12 rounded-[8px] text-base bg-transparent transition-all duration-200"
                >
                  Learn More
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-8 flex-wrap">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#1FAF5A]" />
                  FCA Regulated
                </div>
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <Zap className="w-4 h-4 text-[#F4B400]" />
                  Transfers in minutes
                </div>
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <Globe className="w-4 h-4 text-[#1FAF5A]" />
                  30+ countries
                </div>
              </div>
            </motion.div>

            {/* Right: calculator */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex justify-center lg:justify-end"
            >
              <TransferCalculator />
            </motion.div>
          </div>

          {/* Stat counters bar */}
          <div className="relative z-10 bg-black/30 backdrop-blur-sm border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 gap-4 divide-x divide-white/10">
              <StatCounter value={50000}  suffix="+" label="Happy Customers" />
              <StatCounter value={250000} suffix="+" label="Transfers Completed" />
              <StatCounter value={10}    prefix="£" suffix="M+" label="Total Sent" />
            </div>
          </div>
        </section>

        {/* ─── Why Choose Sika ──────────────────────────────────── */}
        <section id="about" className="bg-[#EEF7F1] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-[#1FAF5A] text-sm font-semibold uppercase tracking-widest">Why Us</span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#1E2A24] mt-2 mb-3">
                Why Choose Sika?
              </h2>
              <p className="text-[#5F6F68] max-w-xl mx-auto leading-relaxed">
                We make international money transfers simple, fast, and transparent — so your money reaches the people who matter most.
              </p>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Zap,
                  title: "Fast & Secure",
                  description:
                    "Most transfers arrive within minutes. Bank-grade encryption and FCA authorisation keep your money safe every step of the way.",
                },
                {
                  icon: BadgePoundSterling,
                  title: "Low Transfer Fees",
                  description:
                    "Transparent, low fees from just £0.99. No hidden charges — what you see is exactly what your recipient gets.",
                },
                {
                  icon: Globe,
                  title: "Worldwide Coverage",
                  description:
                    "Send to 30+ countries across Africa, Asia, the Middle East, and beyond. More corridors added regularly.",
                },
              ].map((card) => (
                <motion.div key={card.title} variants={cardVariant}>
                  <FeatureCard {...card} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── How It Works ─────────────────────────────────────── */}
        <section id="how-it-works" className="bg-[#F8FAF9] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <span className="text-[#1FAF5A] text-sm font-semibold uppercase tracking-widest">Simple Process</span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#1E2A24] mt-2 mb-3">
                How It Works
              </h2>
              <p className="text-[#5F6F68] max-w-lg mx-auto leading-relaxed">
                Send money in three simple steps. No paperwork, no queues, no stress.
              </p>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 relative"
            >
              {[
                {
                  step: 1,
                  icon: UserPlus,
                  title: "Sign Up",
                  description:
                    "Create your free account in under 2 minutes. We only need the basics to get you started.",
                },
                {
                  step: 2,
                  icon: ShieldCheck,
                  title: "Verify",
                  description:
                    "Quick identity check to keep your account secure and compliant. Usually done in seconds.",
                  isLast: false,
                },
                {
                  step: 3,
                  icon: Send,
                  title: "Send",
                  description:
                    "Choose your recipient, pick a payment method, and confirm. Your money is on its way!",
                  isLast: true,
                },
              ].map((step) => (
                <motion.div key={step.step} variants={cardVariant}>
                  <HowItWorksStep {...step} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#1FAF5A] hover:bg-[#178A47] text-white font-semibold px-10 py-3 h-12 rounded-[8px] text-base shadow-[0_4px_20px_rgba(31,175,90,0.25)] transition-all duration-200"
              >
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ─── Supported Countries ──────────────────────────────── */}
        <section id="services" className="bg-[#EEF7F1] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <span className="text-[#1FAF5A] text-sm font-semibold uppercase tracking-widest">Global Reach</span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#1E2A24] mt-2 mb-3">
                Where Can You Send?
              </h2>
              <p className="text-[#5F6F68] max-w-xl mx-auto leading-relaxed">
                We cover the corridors that matter most — and we're adding new destinations every quarter.
              </p>
            </motion.div>

            <motion.div
              variants={staggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-3"
            >
              {COUNTRIES.filter((c) => c.popular).map((c) => (
                <motion.div key={c.code} variants={cardVariant}>
                  <CountryPill flag={c.flag} name={c.name} />
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center text-sm text-[#5F6F68] mt-6"
            >
              + many more countries available.{" "}
              <button
                onClick={() => scrollTo("home")}
                className="text-[#1FAF5A] font-medium hover:underline"
              >
                Try the calculator
              </button>{" "}
              to check your corridor.
            </motion.p>
          </div>
        </section>

        {/* ─── Get the App ──────────────────────────────────────── */}
        <section className="bg-[#F8FAF9] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Phone mockup */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex justify-center order-2 lg:order-1"
              >
                <div className="relative w-56 h-[460px]">
                  {/* Phone shell */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1FAF5A] to-[#0F3A20] rounded-[40px] shadow-[0_20px_60px_rgba(31,175,90,0.3)] overflow-hidden">
                    {/* Screen content placeholder */}
                    <div className="absolute inset-3 bg-[#0B1F13] rounded-[32px] flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-12 h-12 bg-[#1FAF5A]/20 rounded-full flex items-center justify-center">
                        <Send className="w-5 h-5 text-[#1FAF5A]" />
                      </div>
                      <p className="text-white/80 text-xs text-center font-display">
                        Sika App
                        <br />
                        <span className="text-white/40 text-[10px]">Coming Soon</span>
                      </p>
                      {/* Mock UI bars */}
                      <div className="w-full space-y-2 mt-2">
                        {[70, 50, 85, 60].map((w, i) => (
                          <div key={i} className="h-2 bg-[#1FAF5A]/20 rounded-full" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Reflection shine */}
                  <div className="absolute top-4 left-4 w-1 h-20 bg-white/20 rounded-full rotate-12 blur-sm pointer-events-none" />
                </div>
              </motion.div>

              {/* Text + buttons */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <span className="text-[#1FAF5A] text-sm font-semibold uppercase tracking-widest">Mobile App</span>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-[#1E2A24] mt-2 mb-4">
                  Take Sika<br />Everywhere You Go
                </h2>
                <p className="text-[#5F6F68] leading-relaxed mb-8 max-w-md">
                  Download the Sika app and send money on the go. Track your transfers in real time, manage recipients, and stay in control — all from your pocket.
                </p>

                <div className="flex flex-wrap gap-4">
                  {/* App Store button */}
                  <button className="flex items-center gap-3 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-5 py-3 rounded-[10px] transition-colors duration-200 group">
                    <Apple className="w-6 h-6 group-hover:text-white" />
                    <div className="text-left">
                      <p className="text-[9px] text-white/60 uppercase tracking-widest">Download on the</p>
                      <p className="text-sm font-semibold leading-none">App Store</p>
                    </div>
                  </button>
                  {/* Google Play button */}
                  <button className="flex items-center gap-3 bg-[#1E2A24] hover:bg-[#1FAF5A] text-white px-5 py-3 rounded-[10px] transition-colors duration-200 group">
                    <Smartphone className="w-6 h-6" />
                    <div className="text-left">
                      <p className="text-[9px] text-white/60 uppercase tracking-widest">Get it on</p>
                      <p className="text-sm font-semibold leading-none">Google Play</p>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-[#9AA6A0] mt-4">
                  App launching soon — web version available now.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ───────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-[#1FAF5A] to-[#178A47] py-16">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Send Money?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of customers who trust Sika for fast, secure international transfers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate("/register")}
                className="bg-white hover:bg-white/90 text-[#1FAF5A] font-bold px-10 py-3 h-12 rounded-[8px] text-base shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-200"
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-white/50 text-white hover:bg-white/10 hover:border-white px-10 py-3 h-12 rounded-[8px] text-base bg-transparent transition-all duration-200"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
