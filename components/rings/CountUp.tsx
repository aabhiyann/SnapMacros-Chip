"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface CountUpProps {
    value: number;
    className?: string;
    delay?: number;
    duration?: number;
}

export function CountUp({ value, className = "", delay = 0 }: CountUpProps) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const display = useTransform(springValue, (current) => Math.round(current));

    useEffect(() => {
        if (delay > 0) {
            const t = setTimeout(() => {
                motionValue.set(value);
            }, delay * 1000);
            return () => clearTimeout(t);
        } else {
            motionValue.set(value);
        }
    }, [value, motionValue, delay]);

    return <motion.span className={className}>{display}</motion.span>;
}
