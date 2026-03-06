"use client";

import type { MacroSet } from "@/lib/types";
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
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SIZE_BASE} ${SIZE_BASE}`}
        className="overflow-visible"
      >
        <g transform={`translate(${CENTER}, ${CENTER}) rotate(-90)`}>
          {RING_SPECS.map((spec) => {
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
                <circle
                  cx={0}
                  cy={0}
                  r={spec.radius}
                  fill="none"
                  stroke={spec.stroke}
                  strokeWidth={spec.thickness}
                  strokeDasharray={1}
                  strokeDashoffset={offset}
                  pathLength={1}
                  strokeLinecap="round"
                  style={{ vectorEffect: "non-scaling-stroke" }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
