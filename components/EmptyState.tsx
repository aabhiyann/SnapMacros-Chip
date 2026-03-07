import { Chip } from "@/components/Chip";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "dashboard" | "default";
}

export function EmptyState({ title, description, actionLabel, onAction, variant = "dashboard" }: EmptyStateProps) {

  if (variant === "dashboard") {
    return (
      <div className="flex flex-col items-center justify-center pt-10 pb-8 text-center px-6">
        <Chip emotion="happy" size={80} className="mb-4" />
        <h3 className="font-['DM_Sans'] text-[16px] font-medium text-white/80 mb-1">
          No meals logged yet.
        </h3>
        <p className="text-[#A0A0B8] text-[14px] font-['DM_Sans'] mb-8">
          Tap the snap button below to get started
        </p>

        <motion.div
          initial={{ y: -5 }}
          animate={{ y: 5 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4V20M12 20L5 13M12 20L19 13" stroke="#A0A0B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </div>
    );
  }

  // Fallback for older screens
  return (
    <div className="rounded-xl bg-card border border-elevated p-8 text-center">
      <h3 className="font-heading text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="touch-target inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
