"use client";

import React from "react";
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

export const Chip = React.memo(function Chip({ emotion = "happy", size = 80, className = "" }: ChipProps) {
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
        <defs>
          <linearGradient id="shellGradient" x1="30%" y1="20%" x2="70%" y2="90%">
            <stop offset="0%" stopColor="#FDFAF4" />
            <stop offset="60%" stopColor="#FAF7F0" />
            <stop offset="100%" stopColor="#EDE5D8" />
          </linearGradient>
          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3B8BF7" />
            <stop offset="50%" stopColor="#5B9EF8" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Drop shadow (ground) */}
        <ellipse cx="40" cy="76" rx="18" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Head peeking out (round) - placed behind the body so the shell covers the bottom */}
        <motion.g variants={variants} animate="head" style={{ transformOrigin: "40px 38px" }}>
          <circle cx="40" cy="38" r="16" fill="url(#shellGradient)" stroke="#E0DAD0" strokeWidth="1" />

          {/* Blush for hype/laughing */}
          {(emotion === "hype" || emotion === "laughing") && (
            <g>
              <ellipse cx="28" cy="42" rx="5" ry="3" fill="#FFB3A7" opacity="0.6" />
              <ellipse cx="52" cy="42" rx="5" ry="3" fill="#FFB3A7" opacity="0.6" />
            </g>
          )}

          {/* Left Eye */}
          <motion.g variants={variants} animate="eye" style={{ transformOrigin: "32px 36px" }}>
            <ellipse cx="32" cy="36" rx="6" ry="7" fill="#FFFFFF" />
            <ellipse cx="33" cy="36" rx="3.5" ry="4.5" fill="#2D2A26" />
            <circle cx="34.5" cy="33.5" r="1.5" fill="#FFFFFF" />
          </motion.g>

          {/* Right Eye */}
          <motion.g variants={variants} animate="eye" style={{ transformOrigin: "48px 36px" }}>
            <ellipse cx="48" cy="36" rx="6" ry="7" fill="#FFFFFF" />
            <ellipse cx="47" cy="36" rx="3.5" ry="4.5" fill="#2D2A26" />
            <circle cx="48.5" cy="33.5" r="1.5" fill="#FFFFFF" />
          </motion.g>

          {/* Mouth / expression hint */}
          {emotion === "happy" && (
            <path d="M36 44 Q40 48 44 44" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}
          {emotion === "laughing" && (
            <path d="M35 44 Q40 50 45 44" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" fill="none" />
          )}
          {emotion === "sad" && (
            <path d="M36 46 Q40 43 44 46" stroke="#2D2A26" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}
        </motion.g>

        {/* Egg body (Shell body oval with gradient) */}
        <motion.ellipse
          cx="40"
          cy="56"
          rx="24"
          ry="20"
          fill="url(#shellGradient)"
          variants={variants}
          animate="body"
        />

        {/* Rim highlight and Irregular crack line attached to the body */}
        <motion.g variants={variants} animate="body">
          {/* Subtle rim highlight at the top of the body for 3D/glossy effect */}
          <ellipse cx="40" cy="38" rx="14" ry="2" fill="#FFFFFF" opacity="0.4" />

          {/* Irregular organic crack line */}
          <path
            d="M 28 42 L 32 38 L 36 41 L 40 37 L 44 40 L 48 38 L 52 42"
            stroke="#C4B5A0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.8}
          />
        </motion.g>

        {/* Cracked shell hat (top) - keeping it to retain the egg vibe if desired, though softened */}
        <motion.g variants={variants}>
          <path
            d="M 30 24 Q 40 18 50 24 Q 48 32 44 34 Q 40 30 36 34 Q 32 30 30 24 Z"
            fill="url(#shellGradient)"
            stroke="#C4BEB4"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Flame effect for on_fire */}
        {isOnFire && (
          <motion.g style={{ transformOrigin: "40px 15px" }}>
            {/* Center Flame */}
            <motion.path
              d="M40 8 Q45 18 40 22 Q35 18 40 8"
              fill="url(#flameGradient)"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            />
            {/* Left Flame */}
            <motion.path
              d="M34 14 Q38 20 34 24 Q30 20 34 14"
              fill="url(#flameGradient)"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }}
            />
            {/* Right Flame */}
            <motion.path
              d="M46 14 Q50 20 46 24 Q42 20 46 14"
              fill="url(#flameGradient)"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.4 }}
            />
          </motion.g>
        )}
      </svg>
    </motion.div>
  );
});
