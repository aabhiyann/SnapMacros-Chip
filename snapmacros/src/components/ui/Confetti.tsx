"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--success)",
  "var(--warning)",
  "#ffffff",
];

const PARTICLE_COUNT = 24;
const DURATION_MS = 900;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

let confettiId = 0;

export function triggerConfetti(x: number, y: number): void {
  const event = new CustomEvent("snapmacros-confetti", { detail: { x, y } });
  if (typeof window !== "undefined") {
    window.dispatchEvent(event);
  }
}

export function ConfettiProvider() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const handleTrigger = useCallback((e: CustomEvent<{ x: number; y: number }>) => {
    const { x, y } = e.detail;
    const next: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      next.push({
        id: ++confettiId,
        x,
        y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        angle: (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.5,
        distance: 60 + Math.random() * 80,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.1,
      });
    }
    setParticles((prev) => [...prev, ...next]);
    const idsToRemove = new Set(next.map((n) => n.id));
    const t = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !idsToRemove.has(p.id)));
    }, DURATION_MS + 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = (e: Event) => handleTrigger((e as CustomEvent<{ x: number; y: number }>));
    window.addEventListener("snapmacros-confetti", fn);
    return () => window.removeEventListener("snapmacros-confetti", fn);
  }, [handleTrigger]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-[100] rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            x: "-50%",
            y: "-50%",
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance + 120,
            opacity: 0,
          }}
          transition={{
            duration: DURATION_MS / 1000,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>,
    document.body
  );
}
