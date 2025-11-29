"use client"

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    className?: string;
}

export default function AnimatedButton({
    children,
    className = '',
    variant = 'primary',
    disabled,
    ...props
}: AnimatedButtonProps) {
    const baseStyles = "px-6 py-3 border-4 border-black rounded-lg font-bold text-lg transition-all duration-200 relative overflow-hidden group";

    const variantStyles = {
        primary: "bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600",
        secondary: "bg-gray-200 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-300",
        danger: "bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600",
        success: "bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600"
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(
                baseStyles,
                variantStyles[variant],
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            disabled={disabled}
            {...props}
        >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20 pointer-events-none"></div>
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}
