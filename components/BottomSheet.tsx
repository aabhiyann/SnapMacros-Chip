import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // allow overriding the sheet bg
}

export function BottomSheet({ isOpen, onClose, children, className }: BottomSheetProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40"
                        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.50)] p-5",
                            className || "bg-[#1A1A24]"
                        )}
                    >
                        <div className="w-10 h-1 bg-[#2A2A3A] rounded-full mx-auto mb-6" />
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
