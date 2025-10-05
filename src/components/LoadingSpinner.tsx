import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-white">
        <div className="bg-gray-50 border-b-2 border-black sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                            <div className="h-5 w-36 bg-gray-200 animate-pulse rounded" />
                        </div>
                        <div className="p-6 space-y-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                            <div className="h-5 w-28 bg-gray-200 animate-pulse rounded" />
                        </div>
                        <div className="p-6">
                            <div className="bg-white border-2 border-black rounded-lg p-6">
                                <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded mb-4" />
                                <div className="h-16 w-full bg-gray-200 animate-pulse rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
