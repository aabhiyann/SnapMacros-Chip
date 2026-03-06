"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TapButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  disabled?: boolean;
}

const TapButton = forwardRef<HTMLButtonElement, TapButtonProps>(
  ({ children, disabled, className, whileTap, transition, type = "button", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        className={cn("touch-manipulation", className)}
        whileTap={disabled ? undefined : (whileTap ?? { scale: 0.96 })}
        transition={transition ?? { type: "tween", duration: 0.1 }}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

TapButton.displayName = "TapButton";

export { TapButton };
