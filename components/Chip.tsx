"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export type ChipEmotion =
  | "happy"
  | "hype"
  | "shocked"
  | "laughing"
  | "sad"
  | "on_fire"
  | "thinking"
  | "sleepy";

export interface ChipProps {
  emotion?: ChipEmotion;
  size?: number;
  className?: string;
}

// Map each emotion to the best available image
const EMOTION_IMAGES: Record<ChipEmotion, string> = {
  happy: "/icons/happy-state.png",
  hype: "/icons/happy-state.png",
  shocked: "/icons/chip.png",
  laughing: "/icons/happy-state.png",
  sad: "/icons/sad-state.png",
  on_fire: "/icons/on-fire-state.png",
  thinking: "/icons/chip.png",
  sleepy: "/icons/sad-state.png",
};

// CSS filters for emotions using fallback images
const EMOTION_FILTERS: Partial<Record<ChipEmotion, string>> = {
  hype: "brightness(1.15) saturate(1.3)",
  shocked: "contrast(1.1) saturate(0.9)",
  laughing: "brightness(1.1) hue-rotate(5deg)",
  thinking: "brightness(0.95) saturate(0.85)",
  sleepy: "brightness(0.85) saturate(0.7)",
};

// Emoji badges for emotions without unique images
const EMOTION_BADGES: Partial<Record<ChipEmotion, string>> = {
  hype: "🎉",
  shocked: "😱",
  laughing: "😂",
  thinking: "🤔",
  sleepy: "💤",
};

// Framer Motion variants
const variants: Record<
  ChipEmotion,
  { animate: Record<string, unknown> }
> = {
  happy: {
    animate: {
      y: [0, -6, 0],
      transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
    },
  },
  hype: {
    animate: {
      y: [0, -22, -4, -14, 0],
      scale: [1, 1.12, 1, 1.06, 1],
      transition: { duration: 0.45 },
    },
  },
  shocked: {
    animate: {
      x: [0, -12, 12, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  },
  on_fire: {
    animate: {
      rotate: [-5, 5, -3, 3, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.7, repeat: Infinity, repeatType: "mirror" },
    },
  },
  sad: {
    animate: {
      y: [0, 8],
      rotate: [0, -4],
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },
  laughing: {
    animate: {
      rotate: [0, -6, 6, -4, 4, 0],
      y: [0, -4, 0],
      transition: { duration: 0.5, repeat: 3 },
    },
  },
  thinking: {
    animate: {
      rotate: [0, -8, 8, -8, 0],
      transition: { duration: 2.2, repeat: Infinity },
    },
  },
  sleepy: {
    animate: {
      y: [0, 5, 0],
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
    },
  },
};

export const Chip = React.memo(function Chip({
  emotion = "happy",
  size = 100,
  className = "",
}: ChipProps) {
  const imageSrc = EMOTION_IMAGES[emotion];
  const variant = variants[emotion];
  const filter = EMOTION_FILTERS[emotion] || "none";
  const badge = EMOTION_BADGES[emotion];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={emotion}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, ...variant.animate }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.35 }}
        style={{ width: size, height: size, display: "inline-block" }}
        className={className}
      >
        <div
          style={{
            position: "relative",
            width: size,
            height: size,
          }}
        >
          <Image
            src={imageSrc}
            alt={`Chip is ${emotion}`}
            width={size}
            height={size}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              filter,
            }}
            priority
          />
          {badge && (
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                fontSize: size * 0.28,
                lineHeight: 1,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
