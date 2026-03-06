"use client";

import type { ChipEmotion } from "@/lib/types";
import { Chip } from "./Chip";
import { ChipSpeech, type ChipSpeechPosition } from "./ChipSpeech";
import { cn } from "@/lib/utils";

export interface ChipWithSpeechProps {
  emotion: ChipEmotion;
  size?: number;
  speechLine: string | null;
  showSpeech: boolean;
  layout: "row" | "column";
  className?: string;
}

export function ChipWithSpeech({
  emotion,
  size = 100,
  speechLine,
  showSpeech,
  layout,
  className,
}: ChipWithSpeechProps) {
  const position: ChipSpeechPosition = layout === "row" ? "right" : "bottom";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        layout === "row" ? "flex-row" : "flex-col",
        className
      )}
    >
      <Chip emotion={emotion} size={size} />
      <ChipSpeech
        text={speechLine ?? ""}
        position={position}
        visible={showSpeech && speechLine != null && speechLine.length > 0}
      />
    </div>
  );
}
