import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

export const AdminPagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemName = "items"
}) => {
    if (totalItems === 0) return null;

    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex justify-between items-center p-4 border-t-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Showing {startItem} to {endItem} of {totalItems} {itemName}
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border-2 border-black dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-800"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border-2 border-black dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-800"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
