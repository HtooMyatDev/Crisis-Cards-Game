import React from 'react';

interface SkeletonCardGridProps {
    count?: number;
}

export default function SkeletonCardGrid({ count = 6 }: SkeletonCardGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-pulse"
                >
                    {/* Color accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded-t-md"></div>

                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-300 rounded ml-4"></div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    {/* Response Options */}
                    <div className="mb-4">
                        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="space-y-1">
                            <div className="h-6 bg-gray-200 rounded"></div>
                            <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                            <div className="h-3 bg-gray-100 rounded w-24"></div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                        <div className="h-3 bg-gray-100 rounded w-28 mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-28"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
