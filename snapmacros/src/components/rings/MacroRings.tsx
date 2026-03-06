"use client";

import { motion } from "framer-motion";
import type { MacroSet } from "@/lib/types";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

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
  const calRemaining = targets.calories - consumed.calories;
  const calWithinFive =
    targets.calories > 0 &&
    Math.abs(consumed.calories - targets.calories) / targets.calories <= 0.05;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${SIZE_BASE} ${SIZE_BASE}`}
          className="overflow-visible"
        >
          <g transform={`translate(${CENTER}, ${CENTER}) rotate(-90)`}>
          {RING_SPECS.map((spec, i) => {
            const targetVal = getTarget(targets, spec.key);
            const consumedVal = getConsumed(targets, consumed, spec.key);
            const percentage = Math.min(
              targetVal > 0 ? (consumedVal / targetVal) * 100 : 0,
              110
            );
            const offset = 1 - percentage / 100;

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
                  stroke={spec.stroke}
                  strokeWidth={spec.thickness}
                  strokeDasharray={1}
                  pathLength={1}
                  strokeLinecap="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
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
    </div>
  );
}
