"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MacroSet } from "@/lib/types";
import { MACRO_COLORS } from "@/lib/constants";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

const MACRO_LABELS: Record<keyof MacroSet, string> = {
  calories: "Cal",
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

const MACRO_EMOJI: Record<keyof MacroSet, string> = {
  calories: "🔥",
  protein: "💪",
  carbs: "🌾",
  fat: "🥑",
};

const RING_SPECS = [
  { key: "calories" as const, radius: 120, stroke: "#FF6B35", thickness: 16 },
  { key: "protein" as const, radius: 97, stroke: "#6C63FF", thickness: 16 },
  { key: "carbs" as const, radius: 74, stroke: "#2DD4BF", thickness: 16 },
  { key: "fat" as const, radius: 51, stroke: "#FBBF24", thickness: 16 },
] as const;

const SIZE_BASE = 280;
const CENTER = SIZE_BASE / 2;
const TRACK_OPACITY = 0.1;

export interface MacroRingsProps {
  targets: MacroSet;
  consumed: MacroSet;
  size?: number;
  animate?: boolean;
  className?: string;
}

function getConsumed(targets: MacroSet, consumed: MacroSet, key: keyof MacroSet): number {
  return key === "calories" ? consumed.calories : consumed[key as "protein" | "carbs" | "fat"];
}

function getTarget(targets: MacroSet, key: keyof MacroSet): number {
  return key === "calories" ? targets.calories : targets[key as "protein" | "carbs" | "fat"];
}

export function MacroRings({
  targets,
  consumed,
  size = 280,
  animate = true,
  className,
}: MacroRingsProps) {
  const [expandedLabel, setExpandedLabel] = useState<keyof MacroSet | null>(null);
  const calRemaining = targets.calories - consumed.calories;
  const calWithinFive =
    targets.calories > 0 &&
    Math.abs(consumed.calories - targets.calories) / targets.calories <= 0.05;

  const ringKeys: (keyof MacroSet)[] = ["calories", "protein", "carbs", "fat"];

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${SIZE_BASE} ${SIZE_BASE}`}
          className="overflow-visible"
        >
          <defs>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feFlood floodColor="#F87171" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${CENTER}, ${CENTER}) rotate(-90)`}>
          {RING_SPECS.map((spec, i) => {
            const targetVal = getTarget(targets, spec.key);
            const consumedVal = getConsumed(targets, consumed, spec.key);
            const percentage = Math.min(
              targetVal > 0 ? (consumedVal / targetVal) * 100 : 0,
              110
            );
            const offset = 1 - percentage / 100;
            const isOverTarget = percentage > 100;
            const strokeColor = isOverTarget ? "#F87171" : spec.stroke;

            return (
              <g key={spec.key}>
                <circle
                  cx={0}
                  cy={0}
                  r={spec.radius}
                  fill="none"
                  stroke="white"
                  strokeOpacity={TRACK_OPACITY}
                  strokeWidth={spec.thickness}
                  strokeDasharray={1}
                  strokeDashoffset={0}
                  pathLength={1}
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
                <motion.circle
                  cx={0}
                  cy={0}
                  r={spec.radius}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={spec.thickness}
                  strokeDasharray={1}
                  pathLength={1}
                  strokeLinecap="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                  filter={isOverTarget ? "url(#ring-glow)" : undefined}
                  initial={animate ? { strokeDashoffset: 1 } : { strokeDashoffset: offset }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{
                    duration: 0.8,
                    delay: animate ? i * 0.1 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </g>
            );
          })}
        </g>
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            fontFamily: "var(--font-body), DM Sans, sans-serif",
          }}
        >
          <span
            className="font-display text-white font-semibold"
            style={{ fontSize: 48 }}
          >
            <CountUp value={consumed.calories} previousValue={0} />
          </span>
          <span
            className="text-[var(--text-muted)]"
            style={{ fontSize: 13, fontFamily: "var(--font-body), DM Sans, sans-serif" }}
          >
            / {targets.calories} cal
          </span>
          {calWithinFive ? (
            <span
              className="mt-1"
              style={{ fontSize: 13, color: "var(--success)" }}
            >
              Goal hit!
            </span>
          ) : (
            <span
              className="mt-1"
              style={{
                fontSize: 13,
                color: calRemaining >= 0 ? "var(--success)" : "var(--danger)",
              }}
            >
              {Math.abs(calRemaining)} cal {calRemaining >= 0 ? "remaining" : "over"}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto w-full pb-1" style={{ maxWidth: size }}>
        {ringKeys.map((key) => {
          const targetVal = getTarget(targets, key);
          const consumedVal = getConsumed(targets, consumed, key);
          const pct = targetVal > 0 ? Math.min((consumedVal / targetVal) * 100, 110) : 0;
          const dots = 10;
          const filledDots = Math.round((pct / 100) * dots);
          const color = MACRO_COLORS[key];
          const isExpanded = expandedLabel === key;
          const bgColor = `color-mix(in srgb, ${color} 10%, transparent)`;
          const borderColor = `color-mix(in srgb, ${color} 30%, transparent)`;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setExpandedLabel(isExpanded ? null : key)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1 rounded-full border px-3 py-2 min-h-[48px] transition-colors",
                isExpanded && "py-2"
              )}
              style={{
                backgroundColor: bgColor,
                borderColor,
                color,
                fontSize: 13,
                fontFamily: "var(--font-body), DM Sans, sans-serif",
              }}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span>{MACRO_EMOJI[key]}</span>
                <span>
                  {key === "calories"
                    ? `${consumed.calories} / ${targets.calories} cal`
                    : `${consumedVal}g / ${targetVal}g ${MACRO_LABELS[key]}`}
                </span>
              </span>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-0.5"
                  >
                    {Array.from({ length: dots }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: i < filledDots ? color : "var(--bg-border)",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
