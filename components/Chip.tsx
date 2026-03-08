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
    body: { y: [0, -5, 0], transition: { duration: 2.0, repeat: Infinity, ease: 'easeInOut' } },
  },
  hype: {
    body: { y: [0, -20, -3, -12, 0], scale: [1, 1.1, 1, 1.06, 1], transition: { duration: 0.45 } },
  },
  shocked: {
    body: { x: [0, -10, 10, -8, 8, 0], transition: { duration: 0.5 } },
  },
  on_fire: {
    body: { rotate: [-5, 5, -3, 3, 0], scale: [1, 1.08, 1], transition: { duration: 0.7, repeat: 3 } },
  },
  sad: {
    body: { y: [0, 6], rotate: [0, -3], transition: { duration: 0.7, ease: 'easeOut' } },
  },
  laughing: {
    body: { rotate: [0, -5, 5, -3, 3, 0], y: [0, -3, 0], transition: { duration: 0.5, repeat: 2 } },
  },
  thinking: {
    body: { rotate: [0, -8, 8, -8, 0], transition: { duration: 2.2, repeat: Infinity } },
  },
  sleepy: {
    body: { y: [0, 4, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } },
  },
};

export const Chip = React.memo(function Chip({ emotion = "happy", size = 100, className = "" }: ChipProps) {
  const variants = emotionVariants[emotion];
  const isOnFire = emotion === "on_fire";
  const isHype = emotion === "hype";
  const isLaughing = emotion === "laughing";
  const isSad = emotion === "sad";
  const isThinking = emotion === "thinking";
  const isSleepy = emotion === "sleepy";
  const isShocked = emotion === "shocked";

  // Hand Positions by Emotion
  let leftHand = { cx: 28, cy: 72, r: -15, scale: 1 };
  let rightHand = { cx: 92, cy: 72, r: 15, scale: 1 };

  if (isShocked) {
    leftHand = { cx: 32, cy: 52, r: 10, scale: 1 };
    rightHand = { cx: 88, cy: 52, r: -10, scale: 1 };
  } else if (isHype) {
    leftHand = { cx: 20, cy: 45, r: -45, scale: 1 };
    rightHand = { cx: 100, cy: 45, r: 45, scale: 1 };
  } else if (isLaughing) {
    leftHand = { cx: 44, cy: 75, r: 30, scale: 1 };
    rightHand = { cx: 96, cy: 50, r: 50, scale: 1 };
  } else if (isSad) {
    leftHand = { cx: 30, cy: 82, r: 30, scale: 1 };
    rightHand = { cx: 90, cy: 82, r: -30, scale: 1 };
  } else if (isOnFire) {
    leftHand = { cx: 16, cy: 65, r: -35, scale: 1.25 }; // scale 1.25 rx9/rx7
    rightHand = { cx: 104, cy: 65, r: 35, scale: 1.25 };
  } else if (isThinking) {
    leftHand = { cx: 30, cy: 75, r: 10, scale: 1 };
    rightHand = { cx: 82, cy: 58, r: -20, scale: 1 };
  } else if (isSleepy) {
    leftHand = { cx: 32, cy: 90, r: 45, scale: 1 };
    rightHand = { cx: 88, cy: 90, r: -45, scale: 1 };
  } else { // happy default
    leftHand = { cx: 26, cy: 70, r: -20, scale: 1 };
    rightHand = { cx: 94, cy: 70, r: 20, scale: 1 };
  }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * (140 / 120) }}
      initial={false}
      animate="body"
      variants={variants}
    >
      <svg
        width={size}
        height={size * (140 / 120)}
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feColorMatrix type="matrix" values="0 0 0 0 0.231  0 0 0 0 0.545  0 0 0 0 0.969  0 0 0 1 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="bodyGradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFEF8" />
            <stop offset="50%" stopColor="#FAF7F0" />
            <stop offset="100%" stopColor="#EDE0CC" />
          </radialGradient>

          <linearGradient id="shellGradient" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#F5F0E8" />
            <stop offset="100%" stopColor="#E0D5C0" />
          </linearGradient>

          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>

        {/* 1. Drop shadow ellipse */}
        <ellipse cx="60" cy="128" rx="35" ry="8" fill="rgba(0,0,0,0.15)" />

        {/* 2. Tiny Legs (below shell) */}
        <motion.g variants={variants} animate="body">
          {/* Left leg */}
          <g transform={`translate(48, 115) ${isHype ? 'rotate(10)' : isSleepy ? 'rotate(-10)' : isOnFire ? 'rotate(15) translate(-2,0)' : ''}`}>
            <rect x="-5" y="0" width="10" height="12" rx="4" fill="#FAF7F0" stroke="#D4C4A8" strokeWidth="0.8" />
            <ellipse cx="0" cy="12" rx="7" ry="3" fill="#FAF7F0" stroke="#D4C4A8" strokeWidth="0.8" />
          </g>
          {/* Right leg */}
          <g transform={`translate(72, 115) ${isHype ? 'rotate(-10)' : isSleepy ? 'rotate(10)' : isOnFire ? 'rotate(-15) translate(2,0)' : ''}`}>
            <rect x="-5" y="0" width="10" height="12" rx="4" fill="#FAF7F0" stroke="#D4C4A8" strokeWidth="0.8" />
            <ellipse cx="0" cy="12" rx="7" ry="3" fill="#FAF7F0" stroke="#D4C4A8" strokeWidth="0.8" />
          </g>
        </motion.g>

        {/* 8. Shell Rim Highlights (Rendered behind body to act as back rim) */}

        {/* On Fire Blue Glow Base */}
        {isOnFire && (
          <ellipse cx="60" cy="80" rx="45" ry="45" fill="none" filter="url(#blueGlow)" />
        )}

        <motion.g variants={variants} animate="head">
          {/* 3. Main Body + Head */}
          <ellipse cx="60" cy="55" rx="28" ry="32" fill="url(#bodyGradient)" />
          {/* Top rim highlight */}
          <ellipse cx="54" cy="35" rx="10" ry="5" fill="#FFFFFF" opacity="0.5" />

          {/* 6. Face Elements */}
          {/* Blush */}
          {(isHype || isLaughing) && (
            <g>
              <ellipse cx="40" cy="58" rx="7" ry="5" fill="#FFB3A7" opacity="0.55" />
              <ellipse cx="80" cy="58" rx="7" ry="5" fill="#FFB3A7" opacity="0.55" />
            </g>
          )}

          {/* Tear */}
          {isSad && (
            <motion.path
              d="M78 55 Q 81 60 78 63 Q 75 60 78 55 Z"
              fill="#93C5FD"
              animate={{ y: [0, 8, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Eyes */}
          <motion.g variants={variants} animate="eye" style={{ transformOrigin: "48px 48px" }}>
            <ellipse cx="48" cy="48" rx="8" ry="9" fill="#FFFFFF" />
            <ellipse cx="48" cy="48" rx="5" ry="6" fill="#1A1A2E" />
            <circle cx="50" cy="45" r="2" fill="#FFFFFF" />
          </motion.g>
          <motion.g variants={variants} animate="eye" style={{ transformOrigin: "72px 48px" }}>
            <ellipse cx="72" cy="48" rx="8" ry="9" fill="#FFFFFF" />
            <ellipse cx="72" cy="48" rx="5" ry="6" fill="#1A1A2E" />
            <circle cx="74" cy="45" r="2" fill="#FFFFFF" />
          </motion.g>

          {/* Eyebrows */}
          {isHype && (
            <g>
              <path d="M42 36 Q 48 32 54 36" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M66 36 Q 72 32 78 36" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {isSad && (
            <g>
              <path d="M44 34 Q 48 37 54 39" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M66 39 Q 72 37 76 34" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {isShocked && (
            <g>
              <path d="M44 32 L 52 32" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M68 32 L 76 32" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {isThinking && (
            <g>
              <path d="M44 40 Z" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" /> {/* hidden */}
              <path d="M66 34 Q 72 31 78 35" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {isOnFire && (
            <g>
              <path d="M42 38 L 52 40" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M68 40 L 78 38" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}
          {(!isHype && !isSad && !isShocked && !isThinking && !isOnFire) && (
            <g>
              <path d="M42 38 Q 48 35 54 38" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M66 38 Q 72 35 78 38" stroke="#8A7A6A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Mouth */}
          {isHype && (
            <path d="M52 58 Q 60 70 68 58 Z" fill="#1A1A2E" stroke="#1A1A2E" strokeLinejoin="round" />
          )}
          {isShocked && (
            <circle cx="60" cy="58" r="4" fill="#1A1A2E" />
          )}
          {isLaughing && (
            <path d="M52 58 Q 58 66 66 56 Q 60 64 52 58 Z" fill="#1A1A2E" />
          )}
          {isSad && (
            <path d="M56 60 Q 60 58 64 60" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
          {isOnFire && (
            <path d="M50 58 Q 60 66 70 58" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
          {isThinking && (
            <path d="M56 58 L 60 60 L 64 58" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {isSleepy && (
            <ellipse cx="60" cy="62" rx="3" ry="2" fill="#1A1A2E" />
          )}
          {/* Default Happy Mouth */}
          {(!isHype && !isShocked && !isLaughing && !isSad && !isOnFire && !isThinking && !isSleepy) && (
            <path d="M54 58 Q 60 62 66 58" stroke="#1A1A2E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </motion.g>

        {/* 4. Eggshell Bottom Half */}
        <motion.g variants={variants} animate="body">
          {/* Shell path */}
          <path
            d="M 25,80 Q 20,120 60,125 Q 100,120 95,80 L 90,75 L 85,80 L 80,73 L 75,78 L 70,72 L 65,77 L 60,71 L 55,77 L 50,72 L 45,78 L 40,73 L 35,80 L 30,75 Z"
            fill="url(#shellGradient)"
          />
          {/* Subtle texture lines inside shell */}
          <path d="M 35 100 Q 60 115 85 100" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" fill="none" />
          <path d="M 40 110 Q 60 120 80 110" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" fill="none" />
          {/* Shell highlyight */}
          <path d="M 28,82 L 30,77 L 35,82 L 40,75 L 45,80 L 50,74 L 55,79 L 60,73 L 65,79 L 70,74 L 75,80 L 80,75 L 85,82 L 90,77 L 92,82" stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
        </motion.g>

        {/* 5. Tiny Hands */}
        {/* Left Hand */}
        <motion.g variants={variants} animate="head">
          <motion.g animate={{ x: leftHand.cx, y: leftHand.cy, rotate: leftHand.r, scale: leftHand.scale }} transition={{ type: 'spring', bounce: 0.4 }}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#EDE0CC" stroke="#D4C4A8" strokeWidth="0.8" />
            {isHype && (
              <g>
                <line x1="-8" y1="-8" x2="-12" y2="-12" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="-10" x2="0" y2="-16" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8" y1="-8" x2="12" y2="-12" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
          </motion.g>
          {/* Right Hand */}
          <motion.g animate={{ x: rightHand.cx, y: rightHand.cy, rotate: rightHand.r, scale: rightHand.scale }} transition={{ type: 'spring', bounce: 0.4 }}>
            <ellipse cx="0" cy="0" rx="7" ry="5" fill="#EDE0CC" stroke="#D4C4A8" strokeWidth="0.8" />
            {isHype && (
              <g>
                <line x1="-8" y1="-8" x2="-12" y2="-12" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="-10" x2="0" y2="-16" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="8" y1="-8" x2="12" y2="-12" stroke="#3B8BF7" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            )}
          </motion.g>
        </motion.g>

        {/* Extras */}

        {/* Hype Sparkles */}
        {isHype && (
          <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ transformOrigin: '60px 60px' }}>
            <path d="M 20 20 Q 25 25 20 30 Q 15 25 20 20 Z" fill="#3B8BF7" />
            <path d="M 100 20 Q 105 25 100 30 Q 95 25 100 20 Z" fill="#3B8BF7" />
            <path d="M 20 100 Q 25 105 20 110 Q 15 105 20 100 Z" fill="#3B8BF7" />
            <path d="M 100 100 Q 105 105 100 110 Q 95 105 100 100 Z" fill="#3B8BF7" />
          </motion.g>
        )}

        {/* On Fire Flame Crown */}
        {isOnFire && (
          <motion.g style={{ transformOrigin: "60px 25px" }} animate={{ scale: [0.9, 1.1, 0.9] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}>
            <path d="M60 5 Q 65 20 60 25 Q 55 20 60 5 Z" fill="#FBBF24" />
            <path d="M50 10 Q 55 22 50 25 Q 45 22 50 10 Z" fill="#FF6B35" />
            <path d="M70 10 Q 75 22 70 25 Q 65 22 70 10 Z" fill="#FF6B35" />
          </motion.g>
        )}

        {/* Thinking Dots */}
        {isThinking && (
          <g>
            <motion.circle cx="85" cy="30" r="3" fill="#A0A0B8" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} />
            <motion.circle cx="95" cy="22" r="4" fill="#A0A0B8" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
            <motion.circle cx="107" cy="12" r="5" fill="#A0A0B8" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }} />
          </g>
        )}

        {/* Sleepy Zzzs */}
        {isSleepy && (
          <g>
            <motion.text x="85" y="40" fill="#A0A0B8" fontSize="8" animate={{ y: [0, -10], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0 }}>z</motion.text>
            <motion.text x="95" y="30" fill="#A0A0B8" fontSize="10" animate={{ y: [0, -15], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>z</motion.text>
            <motion.text x="105" y="20" fill="#A0A0B8" fontSize="12" animate={{ y: [0, -20], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 1.0 }}>z</motion.text>
          </g>
        )}

        {/* Shocked Sweat Drop */}
        {isShocked && (
          <motion.path d="M85 25 Q 90 35 85 40 Q 80 35 85 25 Z" fill="#93C5FD" animate={{ scale: [0, 1, 0] }} style={{ transformOrigin: '85px 35px' }} transition={{ repeat: Infinity, duration: 1.5 }} />
        )}

      </svg>
    </motion.div>
  );
});
