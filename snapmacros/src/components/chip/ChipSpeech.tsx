"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ChipSpeechPosition = "right" | "left" | "bottom";

export interface ChipSpeechProps {
  text: string;
  position: ChipSpeechPosition;
  visible: boolean;
  className?: string;
}

const tailSize = 8;
const bubbleMaxWidth = 200;

export function ChipSpeech({ text, position, visible, className }: ChipSpeechProps) {
  return (
    <AnimatePresence>
      {visible && text ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 24,
          }}
          className={cn("relative max-w-[200px]", className)}
          style={{ maxWidth: bubbleMaxWidth }}
        >
          <div
            className="rounded-2xl px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--bg-border)",
              fontFamily: "var(--font-body), DM Sans, sans-serif",
            }}
          >
            {text}
          </div>
          {/* Tail: 8px rotated square, same background */}
          <div
            className="absolute w-2 h-2"
            style={{
              width: tailSize,
              height: tailSize,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--bg-border)",
              ...(position === "right"
                ? {
                    left: "100%",
                    top: "50%",
                    marginTop: -tailSize / 2,
                    marginLeft: -tailSize / 2,
                    transform: "rotate(45deg)",
                  }
                : position === "left"
                  ? {
                      right: "100%",
                      left: "auto",
                      top: "50%",
                      marginTop: -tailSize / 2,
                      marginRight: -tailSize / 2,
                      transform: "rotate(-135deg)",
                    }
                  : {
                      left: "50%",
                      top: "100%",
                      marginLeft: -tailSize / 2,
                      marginTop: -tailSize / 2,
                      transform: "rotate(45deg)",
                    }),
            }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
