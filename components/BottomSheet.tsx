import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
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
                        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A24] rounded-t-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.50)] p-5"
                    >
                        <div className="w-10 h-1 bg-[#2A2A3A] rounded-full mx-auto mb-6" />
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
