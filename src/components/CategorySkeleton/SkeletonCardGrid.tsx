import React from 'react';

interface SkeletonCardGridProps {
  count?: number;
}

const SkeletonCard = () => (
  <div className="bg-white border-2 border-gray-200 rounded-lg shadow-[3px_3px_0px_0px_rgba(200,200,200,0.3)] p-5 animate-pulse">
    {/* Category Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Color dot skeleton */}
        <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-gray-300 flex-shrink-0"></div>
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded flex-1 max-w-32"></div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex gap-1">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Description skeleton */}
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>

    {/* Footer skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-16 px-2 py-1"></div>
    </div>
  </div>
);

export default function SkeletonCardGrid({ count = 8 }: SkeletonCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
