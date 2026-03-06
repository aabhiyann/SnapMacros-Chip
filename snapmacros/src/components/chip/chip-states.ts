import type { ChipEmotion } from "@/lib/types";

export type EyeType =
  | "normal"
  | "star"
  | "squinted"
  | "wide"
  | "droopy"
  | "glowing"
  | "side-eye";

export type MouthType =
  | "small-smile"
  | "big-grin"
  | "o-shape"
  | "laugh"
  | "frown"
  | "hmm";

export type ArmPosition =
  | "raised"
  | "neutral"
  | "covering"
  | "wide"
  | "stomach"
  | "hanging";

export type ExtraElement =
  | "sparkles"
  | "zzz"
  | "thought-dots"
  | "flame-crown"
  | "sweat-drop";

export interface EyeConfig {
  type: EyeType;
  size: number;
  style: string;
  pupilPosition: { x: number; y: number };
  hasBlush: boolean;
  hasTear: boolean;
}

export interface MouthConfig {
  type: MouthType;
  width: number;
  openAmount: number;
}

export interface ArmConfig {
  left: ArmPosition;
  right: ArmPosition;
}

export interface ShellConfig {
  crackWidth: number;
  emergeAmount: number;
}

export interface ChipEmotionConfig {
  eyeConfig: EyeConfig;
  mouthConfig: MouthConfig;
  armConfig: ArmConfig;
  shellConfig: ShellConfig;
  extras: ExtraElement[];
  defaultLine: string;
}

const EYE_35 = 0.35;

export const CHIP_EMOTION_CONFIGS: Record<ChipEmotion, ChipEmotionConfig> = {
  happy: {
    eyeConfig: {
      type: "normal",
      size: EYE_35,
      style: "default",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: false,
      hasTear: false,
    },
    mouthConfig: { type: "small-smile", width: 0.4, openAmount: 0 },
    armConfig: { left: "neutral", right: "neutral" },
    shellConfig: { crackWidth: 0.5, emergeAmount: 0.6 },
    extras: [],
    defaultLine: "Ready when you are!",
  },
  hype: {
    eyeConfig: {
      type: "star",
      size: EYE_35,
      style: "gold",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: true,
      hasTear: false,
    },
    mouthConfig: { type: "big-grin", width: 0.5, openAmount: 0.3 },
    armConfig: { left: "raised", right: "raised" },
    shellConfig: { crackWidth: 0.55, emergeAmount: 0.7 },
    extras: ["sparkles"],
    defaultLine: "You're crushing it!",
  },
  shocked: {
    eyeConfig: {
      type: "wide",
      size: EYE_35,
      style: "default",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: false,
      hasTear: false,
    },
    mouthConfig: { type: "o-shape", width: 0.25, openAmount: 0.4 },
    armConfig: { left: "raised", right: "raised" },
    shellConfig: { crackWidth: 0.5, emergeAmount: 0.65 },
    extras: ["sweat-drop"],
    defaultLine: "Whoa!",
  },
  laughing: {
    eyeConfig: {
      type: "squinted",
      size: EYE_35,
      style: "arc",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: true,
      hasTear: false,
    },
    mouthConfig: { type: "laugh", width: 0.55, openAmount: 0.35 },
    armConfig: { left: "covering", right: "covering" },
    shellConfig: { crackWidth: 0.5, emergeAmount: 0.65 },
    extras: [],
    defaultLine: "That's hilarious!",
  },
  sad: {
    eyeConfig: {
      type: "droopy",
      size: EYE_35,
      style: "heavy-top",
      pupilPosition: { x: 0.5, y: 0.6 },
      hasBlush: false,
      hasTear: true,
    },
    mouthConfig: { type: "frown", width: 0.4, openAmount: 0 },
    armConfig: { left: "hanging", right: "hanging" },
    shellConfig: { crackWidth: 0.45, emergeAmount: 0.5 },
    extras: [],
    defaultLine: "Tomorrow's a new day.",
  },
  on_fire: {
    eyeConfig: {
      type: "glowing",
      size: EYE_35,
      style: "orange-glow",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: false,
      hasTear: false,
    },
    mouthConfig: { type: "big-grin", width: 0.5, openAmount: 0.25 },
    armConfig: { left: "wide", right: "wide" },
    shellConfig: { crackWidth: 0.55, emergeAmount: 0.7 },
    extras: ["flame-crown"],
    defaultLine: "Unstoppable!",
  },
  thinking: {
    eyeConfig: {
      type: "side-eye",
      size: EYE_35,
      style: "one-squint",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: false,
      hasTear: false,
    },
    mouthConfig: { type: "hmm", width: 0.35, openAmount: 0 },
    armConfig: { left: "neutral", right: "stomach" },
    shellConfig: { crackWidth: 0.5, emergeAmount: 0.6 },
    extras: ["thought-dots"],
    defaultLine: "Let me think...",
  },
  sleepy: {
    eyeConfig: {
      type: "squinted",
      size: EYE_35,
      style: "half-closed",
      pupilPosition: { x: 0.5, y: 0.5 },
      hasBlush: false,
      hasTear: false,
    },
    mouthConfig: { type: "small-smile", width: 0.35, openAmount: 0 },
    armConfig: { left: "neutral", right: "neutral" },
    shellConfig: { crackWidth: 0.45, emergeAmount: 0.55 },
    extras: ["zzz"],
    defaultLine: "Zzz...",
  },
};

export function getChipConfig(emotion: ChipEmotion): ChipEmotionConfig {
  return CHIP_EMOTION_CONFIGS[emotion];
}
