import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ShieldCheck, ChevronRight } from "lucide-react";
import sikaLogo from "@/assets/Sika Logo.png";
import mitoLogo from "@/assets/Mito_logo.svg";

interface MitoTransitionLoaderProps {
  duration?: number; // ms the overlay stays fully visible before fading
}

const FLOW_KEY = "mito_flow_active";

/** Call this on non-Mito pages to reset the flag so the loader shows again on next entry */
export function clearMitoFlow() {
  try { sessionStorage.removeItem(FLOW_KEY); } catch {}
}

export default function MitoTransitionLoader({ duration = 2600 }: MitoTransitionLoaderProps) {
  // Skip if already inside the Mito flow
  const alreadyInFlow = (() => {
    try { return sessionStorage.getItem(FLOW_KEY) === "true"; } catch { return false; }
  })();

  const [opacity, setOpacity] = useState(1);
  const [gone, setGone] = useState(alreadyInFlow);

  useEffect(() => {
    if (alreadyInFlow) return;
    // Mark that we're in the Mito flow
    try { sessionStorage.setItem(FLOW_KEY, "true"); } catch {}
    const fadeTimer = setTimeout(() => setOpacity(0), duration);
    const removeTimer = setTimeout(() => setGone(true), duration + 700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
        opacity,
        transition: "opacity 0.7s ease-in-out",
        background: "radial-gradient(ellipse at 50% 40%, #0F3A20 0%, #061410 100%)",
      }}
    >
      {/* ── Ambient blobs ── */}
      {[
        { size: 280, top: "-8%", left: "-10%", delay: 0, dur: 4.5 },
        { size: 200, top: "auto", bottom: "8%", left: "auto", right: "-8%", delay: 1.2, dur: 5 },
        { size: 140, top: "60%", left: "10%", delay: 0.6, dur: 3.8 },
      ].map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            pointerEvents: "none",
            top: b.top ?? undefined,
            bottom: (b as { bottom?: string }).bottom ?? undefined,
            left: b.left ?? undefined,
            right: (b as { right?: string }).right ?? undefined,
            background: "radial-gradient(circle, rgba(31,175,90,0.13) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "0 24px",
          maxWidth: 360,
          width: "100%",
        }}
      >
        {/* Shield */}
        <motion.div
          style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
        >
          <motion.div
            style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", border: "2px solid rgba(31,175,90,0.5)" }}
            animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            style={{ position: "absolute", width: 64, height: 64, borderRadius: "50%", border: "1.5px solid rgba(31,175,90,0.3)" }}
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
          />
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(31,175,90,0.15)", border: "1px solid rgba(31,175,90,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck style={{ width: 28, height: 28, color: "#1FAF5A" }} />
          </div>
        </motion.div>

        {/* Logo handoff row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
          {/* Sika card */}
          <motion.div
            style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", flexShrink: 0 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={sikaLogo} alt="SikaCash" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </motion.div>

          {/* Chevrons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0, 1, 0], x: [-5, 0, 5] }}
                transition={{ duration: 1.1, delay, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight style={{ width: i === 1 ? 22 : 15, height: i === 1 ? 22 : 15, color: "#1FAF5A" }} />
              </motion.div>
            ))}
          </div>

          {/* Mito card */}
          <motion.div
            style={{ width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", flexShrink: 0 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={mitoLogo}
              alt="Mito.Money"
              style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }}
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ delay: 1.0, duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* Text */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
          <motion.p
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Connecting to Mito.Money
          </motion.p>

          <motion.p
            style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", maxWidth: 270, lineHeight: 1.65, margin: 0, fontFamily: "Inter, sans-serif" }}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Loading our licensed partner to securely process your transaction
          </motion.p>

          {/* FCA badge */}
          <motion.div
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "6px 14px", marginTop: 4 }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <ShieldCheck style={{ width: 12, height: 12, color: "#1FAF5A", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              FCA Authorised
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F4B400", fontFamily: "Inter, sans-serif", letterSpacing: "0.03em" }}>
              FRN 815146
            </span>
          </motion.div>

          <motion.p
            style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", margin: 0, fontFamily: "Inter, sans-serif" }}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Funtech Global Communications Ltd
          </motion.p>
        </div>

        {/* Progress bar */}
        <div style={{ width: 280, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
          <motion.div
            style={{ height: "100%", borderRadius: 999, background: "linear-gradient(to right, #1FAF5A, #F4B400)", transformOrigin: "left center" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000, ease: "linear" }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
