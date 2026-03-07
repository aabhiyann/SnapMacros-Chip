"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

interface CountUpProps {
    value: number;
    className?: string;
}

export function CountUp({ value, className = "" }: CountUpProps) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        stiffness: 100,
        damping: 30, // 600ms ease-out approx
        restDelta: 0.001
    });

    const display = useTransform(springValue, (current) => Math.round(current));

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return <motion.span className={className}>{display}</motion.span>;
}
