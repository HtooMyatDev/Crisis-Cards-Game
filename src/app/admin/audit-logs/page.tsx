"use client"
import React, { useEffect, useState } from 'react';
import { Search, Loader2, Calendar, User, FileText, Activity as ActivityIcon } from 'lucide-react';

interface AuditLog {
    id: number;
    action: string;
    description: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    card?: {
        title: string;
    };
}

const AuditLogsPage = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=20&search=${searchTerm}`);
            const data = await res.json();
            if (data.activities) {
                setLogs(data.activities);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchLogs]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">Audit Logs</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Track system activities and changes.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search logs by description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700 border-b-2 border-black dark:border-gray-600">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Resource</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <Loader2 className="animate-spin mx-auto text-blue-500" size={24} />
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${log.action.includes('CREATED') ? 'bg-green-100 text-green-800 border-green-200' :
                                                    log.action.includes('DELETED') ? 'bg-red-100 text-red-800 border-red-200' :
                                                        log.action.includes('UPDATED') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-300">
                                                    {log.user.name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{log.user.name}</div>
                                                    <div className="text-xs text-gray-500">{log.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate" title={log.description}>
                                                {log.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {log.card && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <FileText size={14} className="mr-1" />
                                                    {log.card.title}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border-2 border-gray-300 rounded-md text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border-2 border-gray-300 rounded-md text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
