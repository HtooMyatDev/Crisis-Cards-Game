"use client"

import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ConfettiEffectProps {
    trigger: boolean;
    variant?: 'win' | 'score';
}

export default function ConfettiEffect({ trigger, variant = 'win' }: ConfettiEffectProps) {
    useEffect(() => {
        if (!trigger) return;

        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const colors = variant === 'win'
            ? ['#FFD700', '#FFA500', '#FF6347', '#4169E1'] // Gold, orange, red, blue
            : ['#00FF00', '#FFFF00', '#FF00FF']; // Green, yellow, magenta

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        };

        frame();
    }, [trigger, variant]);

    return null;
}

// Celebration component with animation
export function CelebrationBanner({ message, show }: { message: string; show: boolean }) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
            <div className="bg-yellow-400 border-8 border-black rounded-2xl px-12 py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                <motion.h1
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-6xl font-black text-black uppercase tracking-wider"
                >
                    {message}
                </motion.h1>
            </div>
        </motion.div>
    );
}
