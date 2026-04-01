import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(31,175,90,0.12)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white rounded-[12px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-4 cursor-default"
    >
      <div className="w-14 h-14 bg-[#EEF7F1] rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-7 h-7 text-[#1FAF5A]" strokeWidth={1.75} />
      </div>
      <h3 className="font-display font-semibold text-[#1E2A24] text-lg">{title}</h3>
      <p className="text-sm text-[#5F6F68] leading-relaxed">{description}</p>
    </motion.div>
  );
}
