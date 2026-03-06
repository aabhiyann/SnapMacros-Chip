"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useMotionValueEvent, animate } from "framer-motion";

export interface CountUpProps {
  value: number;
  previousValue?: number;
  decimals?: number;
  suffix?: string;
}

/**
 * Animates a number from previousValue (or 0) to value over 600ms ease-out.
 */
export function CountUp({
  value,
  previousValue = 0,
  decimals = 0,
  suffix = "",
}: CountUpProps) {
  const motionValue = useMotionValue(previousValue);
  const [displayValue, setDisplayValue] = useState(previousValue);

  useMotionValueEvent(motionValue, "change", (latest) => setDisplayValue(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.6,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, motionValue]);

  const formatted =
    decimals <= 0
      ? Math.round(displayValue)
      : Number(displayValue).toFixed(decimals);
  return (
    <>
      {formatted}
      {suffix}
    </>
  );
}
