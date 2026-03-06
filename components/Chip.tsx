"use client";

import { motion, type Variants } from "framer-motion";

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

const emotionVariants: Record<ChipEmotion, Variants> = {
  happy: {
    body: { scale: 1, rotate: 0 },
    head: { y: 0, scale: 1 },
    eye: { scaleY: 1 },
  },
  hype: {
    body: { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.5 } },
    head: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 0.4 } },
    eye: { scaleY: 1.2 },
  },
  shocked: {
    body: { scale: 1 },
    head: { y: -3 },
    eye: { scaleY: 1.5, scaleX: 0.7 },
  },
  laughing: {
    body: { scale: [1, 1.03, 1], transition: { repeat: Infinity, duration: 0.3 } },
    head: { y: [0, 1, 0], transition: { repeat: Infinity, duration: 0.25 } },
    eye: { scaleY: 0.3 },
  },
  sad: {
    body: { scale: 1, rotate: -2 },
    head: { y: 2 },
    eye: { scaleY: 0.4 },
  },
  on_fire: {
    body: { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 0.2 } },
    head: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 0.15 } },
    eye: { scaleY: 1.1 },
  },
  thinking: {
    body: { scale: 1, rotate: [0, 2, -2, 0], transition: { repeat: Infinity, duration: 2 } },
    head: { y: 0 },
    eye: { scaleY: 0.8 },
  },
  sleepy: {
    body: { scale: 1 },
    head: { y: 1 },
    eye: { scaleY: 0.15 },
  },
};

export function Chip({ emotion = "happy", size = 80, className = "" }: ChipProps) {
  const variants = emotionVariants[emotion];
  const isOnFire = emotion === "on_fire";

  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={false}
      animate="body"
      variants={variants}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Cracked shell (top) */}
        <motion.g variants={variants}>
          <path
            d="M20 28 Q40 22 60 28 Q58 38 50 42 Q40 36 30 42 Q22 38 20 28 Z"
            fill="#E8E4DC"
            stroke="#C4BEB4"
            strokeWidth="1.5"
          />
          <path
            d="M38 24 L42 44 M35 32 L48 36"
            stroke="#A89F92"
            strokeWidth="1"
            opacity={0.8}
          />
        </motion.g>

        {/* Egg body (cream oval) */}
        <motion.ellipse
          cx="40"
          cy="52"
          rx="24"
          ry="22"
          fill="#F5F0E6"
          stroke="#E0DAD0"
          strokeWidth="1.5"
          variants={variants}
          animate="body"
        />

        {/* Head peeking out (round) */}
        <motion.g variants={variants} animate="head" style={{ transformOrigin: "40px 38px" }}>
          <circle cx="40" cy="38" r="14" fill="#F5F0E6" stroke="#E0DAD0" strokeWidth="1" />

          {/* Eyes */}
          <motion.ellipse
            cx="35"
            cy="36"
            rx="3"
            ry="4"
            fill="#2D2A26"
            variants={variants}
            animate="eye"
            style={{ transformOrigin: "35px 36px" }}
          />
          <motion.ellipse
            cx="45"
            cy="36"
            rx="3"
            ry="4"
            fill="#2D2A26"
            variants={variants}
            animate="eye"
            style={{ transformOrigin: "45px 36px" }}
          />

          {/* Mouth / expression hint */}
          {emotion === "happy" && (
            <path d="M35 42 Q40 46 45 42" stroke="#2D2A26" strokeWidth="1.5" fill="none" />
          )}
          {emotion === "laughing" && (
            <path d="M34 44 Q40 50 46 44" stroke="#2D2A26" strokeWidth="2" fill="none" />
          )}
          {emotion === "sad" && (
            <path d="M35 46 Q40 42 45 46" stroke="#2D2A26" strokeWidth="1.5" fill="none" />
          )}
        </motion.g>

        {/* Flame effect for on_fire */}
        {isOnFire && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ transformOrigin: "40px 20px" }}
          >
            <path
              d="M40 12 Q44 22 40 28 Q36 22 40 12"
              fill="#FF6B35"
              opacity={0.9}
            />
            <path
              d="M40 16 Q42 24 40 30 Q38 24 40 16"
              fill="#FBBF24"
              opacity={0.8}
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
}
