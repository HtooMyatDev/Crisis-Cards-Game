"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                    duration: 0.3,
                    ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
                }}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Stagger children animation for lists
export function StaggerContainer({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: {
                    transition: {
                        staggerChildren: 0.05
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
