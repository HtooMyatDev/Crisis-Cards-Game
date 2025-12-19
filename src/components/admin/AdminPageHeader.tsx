import React from 'react';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, description, children }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">{title}</h1>
                {description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
};
