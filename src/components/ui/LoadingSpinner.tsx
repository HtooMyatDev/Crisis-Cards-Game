"use client"

import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
    const sizeMap = {
        sm: 32,
        md: 48,
        lg: 64
    };

    const iconSize = sizeMap[size];

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Modern Lucide Loader Spinner */}
            <Loader
                size={iconSize}
                className="animate-spin text-gray-400 dark:text-gray-50"
                aria-label="Loading..."
            />
            {message && (
                <p className="text-gray-500 dark:text-gray-400 font-medium text-center">{message}</p>
            )}
        </div>
    );
}
