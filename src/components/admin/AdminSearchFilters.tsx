import React from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';

interface AdminSearchFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    showFilters?: boolean;
    onToggleFilters?: () => void;
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    children?: React.ReactNode;
}

export const AdminSearchFilters: React.FC<AdminSearchFiltersProps> = ({
    searchTerm,
    onSearchChange,
    searchPlaceholder = "Search...",
    showFilters,
    onToggleFilters,
    viewMode,
    onViewModeChange,
    children
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                {children}

                {onToggleFilters && (
                    <button
                        onClick={onToggleFilters}
                        className={`px-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium ${showFilters ? 'bg-black dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                            }`}
                    >
                        <Filter size={16} className="inline-block md:mr-2" />
                        <span className="hidden md:inline">Filters</span>
                    </button>
                )}

                {viewMode && onViewModeChange && (
                    <div className="flex border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            className={`px-3 py-3 font-medium transition-colors ${viewMode === 'grid' ? 'bg-black dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            className={`px-3 py-3 font-medium transition-colors border-l-2 border-black dark:border-gray-700 ${viewMode === 'list' ? 'bg-black dark:bg-gray-700 text-white' : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
