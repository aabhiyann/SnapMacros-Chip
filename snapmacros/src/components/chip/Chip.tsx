"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ChipEmotion } from "@/lib/types";
import { getChipConfig } from "./chip-states";
import { cn } from "@/lib/utils";

const CHIP_VARIANTS = {
  initial: { opacity: 0 },
  happy: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
  hype: { opacity: 1, y: -2, scale: 1.02, transition: { duration: 0.35, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const } },
  shocked: { opacity: 1, scale: 1.08, transition: { duration: 0.25, ease: "easeOut" as const } },
  laughing: { opacity: 1, x: [0, -1, 1, 0], transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const } },
  sad: { opacity: 1, y: 2, scale: 0.98, transition: { duration: 0.5, ease: "easeOut" as const } },
  on_fire: { opacity: 1, scale: 1.05, rotate: [0, -2, 2, 0], transition: { duration: 0.4, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const } },
  thinking: { opacity: 1, y: -1, rotate: [0, 1, -1, 0], transition: { duration: 1.2, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" as const } },
  sleepy: { opacity: 1, y: 1, scale: 0.98, transition: { duration: 0.6, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const VIEWBOX = 100;
const CENTER_X = 50;
const SHELL_CY = 58;
const SHELL_RX = 24;
const SHELL_RY = 26;
const HEAD_CY = 34;
const HEAD_R = 14;
const EYE_WIDTH_RATIO = 0.35;
const EYE_OFFSET_Y = 32;
const EYE_SPACING = 8;
const MOUTH_CY = 40;

export interface ChipProps {
  emotion: ChipEmotion;
  size?: number;
  className?: string;
}

function ChipSVGLayers({ emotion }: { emotion: ChipEmotion }) {
  const config = getChipConfig(emotion);
  const { eyeConfig, mouthConfig, armConfig, shellConfig, extras } = config;
  const eyeW = HEAD_R * 2 * EYE_WIDTH_RATIO;
  const eyeH = eyeW * 1.1;
  const leftEyeX = CENTER_X - EYE_SPACING / 2 - eyeW / 2;
  const rightEyeX = CENTER_X + EYE_SPACING / 2 - eyeW / 2;

  const glowColor =
    emotion === "on_fire"
      ? "#FF6B35"
      : emotion === "sad"
        ? "#93C5FD"
        : "rgba(0,0,0,0.15)";

  return (
    <>
      <defs>
        <filter id="chip-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.25)" />
        </filter>
        <filter id="chip-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feFlood floodColor={glowColor} floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="shell-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFBF5" />
          <stop offset="100%" stopColor="#FAF7F0" />
        </linearGradient>
      </defs>

      {/* Shell body */}
      <ellipse
        cx={CENTER_X}
        cy={SHELL_CY}
        rx={SHELL_RX}
        ry={SHELL_RY}
        fill="url(#shell-gradient)"
        stroke="#E8E4DC"
        strokeWidth="1"
        filter="url(#chip-shadow)"
      />

      {/* Crack */}
      <path
        d={`M ${CENTER_X - 20} ${HEAD_CY - 2} Q ${CENTER_X - 8} ${HEAD_CY + 6} ${CENTER_X} ${HEAD_CY + 2} Q ${CENTER_X + 10} ${HEAD_CY + 8} ${CENTER_X + 22} ${HEAD_CY - 1}`}
        fill="none"
        stroke="#C4B5A0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Arms (stub paths) */}
      {armConfig.left !== "neutral" && (
        <path
          d={
            armConfig.left === "raised"
              ? `M ${CENTER_X - 18} ${HEAD_CY + 4} Q ${CENTER_X - 24} ${HEAD_CY - 6} ${CENTER_X - 20} ${HEAD_CY - 2}`
              : armConfig.left === "hanging"
                ? `M ${CENTER_X - 20} ${HEAD_CY + 2} Q ${CENTER_X - 22} ${HEAD_CY + 12} ${CENTER_X - 18} ${HEAD_CY + 14}`
                : armConfig.left === "covering"
                  ? `M ${CENTER_X - 20} ${HEAD_CY} Q ${CENTER_X - 22} ${HEAD_CY - 8} ${CENTER_X - 16} ${HEAD_CY - 4}`
                  : armConfig.left === "wide"
                    ? `M ${CENTER_X - 20} ${HEAD_CY + 2} Q ${CENTER_X - 32} ${HEAD_CY} ${CENTER_X - 28} ${HEAD_CY + 4}`
                    : armConfig.left === "stomach"
                      ? `M ${CENTER_X - 20} ${HEAD_CY} Q ${CENTER_X - 24} ${HEAD_CY + 10} ${CENTER_X - 18} ${HEAD_CY + 12}`
                      : `M ${CENTER_X - 20} ${HEAD_CY} Q ${CENTER_X - 26} ${HEAD_CY + 4} ${CENTER_X - 22} ${HEAD_CY + 8}`
          }
          fill="none"
          stroke="#E8E4DC"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}
      {armConfig.right !== "neutral" && (
        <path
          d={
            armConfig.right === "raised"
              ? `M ${CENTER_X + 18} ${HEAD_CY + 4} Q ${CENTER_X + 24} ${HEAD_CY - 6} ${CENTER_X + 20} ${HEAD_CY - 2}`
              : armConfig.right === "hanging"
                ? `M ${CENTER_X + 20} ${HEAD_CY + 2} Q ${CENTER_X + 22} ${HEAD_CY + 12} ${CENTER_X + 18} ${HEAD_CY + 14}`
                : armConfig.right === "covering"
                  ? `M ${CENTER_X + 20} ${HEAD_CY} Q ${CENTER_X + 22} ${HEAD_CY - 8} ${CENTER_X + 16} ${HEAD_CY - 4}`
                  : armConfig.right === "wide"
                    ? `M ${CENTER_X + 20} ${HEAD_CY + 2} Q ${CENTER_X + 32} ${HEAD_CY} ${CENTER_X + 28} ${HEAD_CY + 4}`
                    : armConfig.right === "stomach"
                      ? `M ${CENTER_X + 20} ${HEAD_CY} Q ${CENTER_X + 24} ${HEAD_CY + 10} ${CENTER_X + 18} ${HEAD_CY + 12}`
                      : `M ${CENTER_X + 20} ${HEAD_CY} Q ${CENTER_X + 26} ${HEAD_CY + 4} ${CENTER_X + 22} ${HEAD_CY + 8}`
          }
          fill="none"
          stroke="#E8E4DC"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}

      {/* Head */}
      <circle
        cx={CENTER_X}
        cy={HEAD_CY}
        r={HEAD_R}
        fill="#FAF7F0"
        stroke="#E8E4DC"
        strokeWidth="1"
      />

      {/* Eyes */}
      {eyeConfig.type === "normal" && (
        <>
          <ellipse cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2} ry={eyeH / 2} fill="white" />
          <ellipse cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2} ry={eyeH / 2} fill="white" />
          <circle cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.35} fill="#1A1A2E" />
          <circle cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.35} fill="#1A1A2E" />
          <circle cx={leftEyeX + eyeW / 2 + 2} cy={EYE_OFFSET_Y - 1} r={2} fill="white" />
          <circle cx={rightEyeX + eyeW / 2 + 2} cy={EYE_OFFSET_Y - 1} r={2} fill="white" />
        </>
      )}
      {eyeConfig.type === "star" && (
        <>
          <path
            d={`M ${leftEyeX + eyeW / 2} ${EYE_OFFSET_Y - 4} L ${leftEyeX + eyeW / 2 + 2} ${EYE_OFFSET_Y} L ${leftEyeX + eyeW / 2} ${EYE_OFFSET_Y + 4} L ${leftEyeX + eyeW / 2 - 2} ${EYE_OFFSET_Y} Z`}
            fill="#FFD700"
          />
          <path
            d={`M ${rightEyeX + eyeW / 2} ${EYE_OFFSET_Y - 4} L ${rightEyeX + eyeW / 2 + 2} ${EYE_OFFSET_Y} L ${rightEyeX + eyeW / 2} ${EYE_OFFSET_Y + 4} L ${rightEyeX + eyeW / 2 - 2} ${EYE_OFFSET_Y} Z`}
            fill="#FFD700"
          />
        </>
      )}
      {eyeConfig.type === "squinted" && (
        <>
          <path d={`M ${leftEyeX} ${EYE_OFFSET_Y + 2} Q ${leftEyeX + eyeW / 2} ${EYE_OFFSET_Y + 4} ${leftEyeX + eyeW} ${EYE_OFFSET_Y + 2}`} fill="none" stroke="#1A1A2E" strokeWidth="2" />
          <path d={`M ${rightEyeX} ${EYE_OFFSET_Y + 2} Q ${rightEyeX + eyeW / 2} ${EYE_OFFSET_Y + 4} ${rightEyeX + eyeW} ${EYE_OFFSET_Y + 2}`} fill="none" stroke="#1A1A2E" strokeWidth="2" />
        </>
      )}
      {eyeConfig.type === "wide" && (
        <>
          <ellipse cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2 + 2} ry={eyeH / 2 + 2} fill="white" />
          <ellipse cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2 + 2} ry={eyeH / 2 + 2} fill="white" />
          <circle cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.4} fill="#1A1A2E" />
          <circle cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.4} fill="#1A1A2E" />
        </>
      )}
      {eyeConfig.type === "droopy" && (
        <>
          <ellipse cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y + 1} rx={eyeW / 2} ry={eyeH / 2} fill="white" stroke="#1A1A2E" strokeWidth="1.5" />
          <ellipse cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y + 1} rx={eyeW / 2} ry={eyeH / 2} fill="white" stroke="#1A1A2E" strokeWidth="1.5" />
          <circle cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y + 3} r={eyeW * 0.3} fill="#1A1A2E" />
          <circle cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y + 3} r={eyeW * 0.3} fill="#1A1A2E" />
        </>
      )}
      {eyeConfig.type === "glowing" && (
        <>
          <ellipse cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2} ry={eyeH / 2} fill="white" />
          <ellipse cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2} ry={eyeH / 2} fill="white" />
          <circle cx={leftEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.35} fill="#FF6B35" filter="url(#chip-glow)" />
          <circle cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.35} fill="#FF6B35" filter="url(#chip-glow)" />
        </>
      )}
      {eyeConfig.type === "side-eye" && (
        <>
          <path d={`M ${leftEyeX} ${EYE_OFFSET_Y + 2} Q ${leftEyeX + eyeW / 2} ${EYE_OFFSET_Y + 4} ${leftEyeX + eyeW} ${EYE_OFFSET_Y + 2}`} fill="none" stroke="#1A1A2E" strokeWidth="2" />
          <ellipse cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} rx={eyeW / 2} ry={eyeH / 2} fill="white" transform={`rotate(-10 ${rightEyeX + eyeW / 2} ${EYE_OFFSET_Y})`} />
          <circle cx={rightEyeX + eyeW / 2} cy={EYE_OFFSET_Y} r={eyeW * 0.3} fill="#1A1A2E" transform={`rotate(-10 ${rightEyeX + eyeW / 2} ${EYE_OFFSET_Y})`} />
        </>
      )}

      {/* Mouth */}
      {mouthConfig.type === "small-smile" && (
        <path d={`M ${CENTER_X - 6} ${MOUTH_CY} Q ${CENTER_X} ${MOUTH_CY + 4} ${CENTER_X + 6} ${MOUTH_CY}`} fill="none" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {mouthConfig.type === "big-grin" && (
        <path d={`M ${CENTER_X - 8} ${MOUTH_CY} Q ${CENTER_X} ${MOUTH_CY + 8} ${CENTER_X + 8} ${MOUTH_CY} L ${CENTER_X} ${MOUTH_CY + 4} Z`} fill="#1A1A2E" stroke="#1A1A2E" strokeWidth="1" />
      )}
      {mouthConfig.type === "o-shape" && (
        <circle cx={CENTER_X} cy={MOUTH_CY} r={4} fill="none" stroke="#1A1A2E" strokeWidth="1.5" />
      )}
      {mouthConfig.type === "laugh" && (
        <path d={`M ${CENTER_X - 10} ${MOUTH_CY - 2} Q ${CENTER_X} ${MOUTH_CY + 10} ${CENTER_X + 10} ${MOUTH_CY - 2}`} fill="#1A1A2E" />
      )}
      {mouthConfig.type === "frown" && (
        <path d={`M ${CENTER_X - 6} ${MOUTH_CY + 2} Q ${CENTER_X} ${MOUTH_CY - 2} ${CENTER_X + 6} ${MOUTH_CY + 2}`} fill="none" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {mouthConfig.type === "hmm" && (
        <path d={`M ${CENTER_X - 5} ${MOUTH_CY + 1} Q ${CENTER_X} ${MOUTH_CY} ${CENTER_X + 6} ${MOUTH_CY + 2}`} fill="none" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" />
      )}

      {/* Blush */}
      {eyeConfig.hasBlush && (
        <>
          <circle cx={CENTER_X - 14} cy={HEAD_CY + 4} r={4} fill="#FFB3A7" opacity="0.5" />
          <circle cx={CENTER_X + 14} cy={HEAD_CY + 4} r={4} fill="#FFB3A7" opacity="0.5" />
        </>
      )}

      {/* Tear */}
      {eyeConfig.hasTear && (
        <ellipse cx={CENTER_X + 12} cy={HEAD_CY + 6} rx={2} ry={4} fill="#93C5FD" opacity="0.9" />
      )}

      {/* Extras */}
      {extras.includes("sparkles") && (
        <>
          <path d="M 22 28 L 23 32 L 27 33 L 24 36 L 25 40 L 22 38 L 19 40 L 20 36 L 17 33 L 21 32 Z" fill="#FFD700" opacity="0.9" />
          <path d="M 78 26 L 79 30 L 83 31 L 80 34 L 81 38 L 78 36 L 75 38 L 76 34 L 73 31 L 77 30 Z" fill="#FFD700" opacity="0.9" />
        </>
      )}
      {extras.includes("zzz") && (
        <>
          <text x={CENTER_X + 18} y={HEAD_CY - 14} fill="#A0A0B8" fontSize="8" fontFamily="sans-serif">z</text>
          <text x={CENTER_X + 22} y={HEAD_CY - 10} fill="#A0A0B8" fontSize="10" fontFamily="sans-serif" opacity="0.8">z</text>
          <text x={CENTER_X + 28} y={HEAD_CY - 6} fill="#A0A0B8" fontSize="12" fontFamily="sans-serif" opacity="0.6">z</text>
        </>
      )}
      {extras.includes("thought-dots") && (
        <>
          <circle cx={CENTER_X - 4} cy={HEAD_CY - 18} r={2} fill="#A0A0B8" opacity="0.8" />
          <circle cx={CENTER_X} cy={HEAD_CY - 20} r={2} fill="#A0A0B8" opacity="0.9" />
          <circle cx={CENTER_X + 4} cy={HEAD_CY - 18} r={2} fill="#A0A0B8" opacity="0.8" />
        </>
      )}
      {extras.includes("flame-crown") && (
        <>
          <path d="M 42 20 Q 44 14 46 20 Q 48 16 50 22 Q 52 16 54 20 Q 56 14 58 20" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
          <path d="M 44 20 L 46 24 L 50 22 L 54 24 L 56 20" fill="#FF8C42" opacity="0.9" />
        </>
      )}
      {extras.includes("sweat-drop") && (
        <path d={`M ${CENTER_X + 10} ${HEAD_CY - 8} Q ${CENTER_X + 14} ${HEAD_CY - 4} ${CENTER_X + 10} ${HEAD_CY + 2} Q ${CENTER_X + 8} ${HEAD_CY - 2} ${CENTER_X + 10} ${HEAD_CY - 8}`} fill="#93C5FD" opacity="0.9" />
      )}
    </>
  );
}

export function Chip({ emotion, size = 100, className }: ChipProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-hidden
    >
      <AnimatePresence mode="wait">
        <motion.g
          key={emotion}
          variants={CHIP_VARIANTS}
          initial="initial"
          animate={emotion}
          exit="exit"
          style={{ transformOrigin: "50px 50px" }}
        >
          <ChipSVGLayers emotion={emotion} />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
