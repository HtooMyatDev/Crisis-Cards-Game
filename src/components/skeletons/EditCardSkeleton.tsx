import React from 'react';
import { ArrowLeft, Save, Plus, AlertCircle, Shield, TrendingUp, Building2, Leaf, Users } from 'lucide-react';

export default function EditCardSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-gray-50 dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-6 w-px bg-black dark:bg-gray-700"></div>
                            <div>
                                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {/* Form Section */}
                    <div className="space-y-6">
                        {/* Card Details Skeleton */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b-2 border-black dark:border-gray-700">
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Title Input */}
                                <div>
                                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>

                                {/* Description Input */}
                                <div>
                                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="flex justify-between mt-2">
                                        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>

                                {/* Category and Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    </div>
                                    <div>
                                        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    </div>
                                </div>

                                {/* Base Values Grid */}
                                <div>
                                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i}>
                                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                                </div>

                                {/* Time Limit */}
                                <div>
                                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                </div>
                            </div>
                        </div>

                        {/* Response Options Skeleton */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b-2 border-black dark:border-gray-700">
                                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {/* Mock Response Option 1 */}
                                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Mock Response Option 2 */}
                                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button Skeleton */}
                        <div className="h-14 w-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
