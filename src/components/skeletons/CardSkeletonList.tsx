import React from 'react';

interface SkeletonCardListProps {
    count?: number;
}

export default function SkeletonCardList({ count = 5 }: SkeletonCardListProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-pulse"
                >
                    {/* Color accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-md"></div>

                    <div className="flex items-start justify-between">
                        {/* Left side content */}
                        <div className="flex-1 pr-6">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-6 bg-gray-300 rounded w-48"></div>
                                <div className="h-6 w-16 bg-gray-300 rounded"></div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                            </div>

                            {/* Details row */}
                            <div className="flex items-center gap-6 mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            {/* Response options */}
                            <div className="mb-4">
                                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                                <div className="flex gap-2 flex-wrap">
                                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="flex gap-4 text-xs">
                                <div className="h-3 bg-gray-100 rounded w-28"></div>
                                <div className="h-3 bg-gray-100 rounded w-28"></div>
                            </div>
                        </div>

                        {/* Right side actions */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            <div className="h-9 bg-gray-200 rounded-lg"></div>
                            <div className="h-9 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
