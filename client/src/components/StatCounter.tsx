import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion, useInView } from "framer-motion";

interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function StatCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  duration = 2000,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const count = useMotionValue(0);
  const spring = useSpring(count, { duration, bounce: 0 });
  const rounded = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString("en-GB")
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="text-2xl sm:text-3xl font-bold font-display text-white">
        {prefix}
        <motion.span>{rounded}</motion.span>
        {suffix}
      </div>
      <p className="text-white/70 text-xs sm:text-sm mt-1">{label}</p>
    </div>
  );
}
