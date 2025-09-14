import React from 'react';

interface SkeletonCardListProps {
  count?: number;
}

const SkeletonListItem = () => (
  <div className="bg-white border-2 border-gray-200 rounded-lg shadow-[2px_2px_0px_0px_rgba(200,200,200,0.3)] p-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Color dot skeleton */}
        <div className="w-4 h-4 rounded-full bg-gray-200 border-2 border-gray-300 flex-shrink-0"></div>

        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          {/* Description skeleton */}
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Item count skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Status badge skeleton */}
        <div className="h-6 bg-gray-200 rounded w-16 px-2 py-1"></div>

        {/* Action buttons skeleton */}
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function SkeletonCardList({ count = 6 }: SkeletonCardListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonListItem key={index} />
      ))}
    </div>
  );
}
