"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface TapButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
}

export function TapButton({ children, className = "", ...props }: TapButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
            {...props}
        >
            {children}
        </motion.button>
    );
}
