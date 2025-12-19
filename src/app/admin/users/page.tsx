"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Crown, User, Eye, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchFilters } from '@/components/admin/AdminSearchFilters';
import { AdminPagination } from '@/components/admin/AdminPagination';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'player';
    status: 'active' | 'inactive';
    joinDate: string;
    lastActivity: string;
    gamesPlayed: number;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 1 });

    // Debounce search term to avoid too many API calls
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterRole, filterStatus]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                search: debouncedSearchTerm,
                role: filterRole,
                status: filterStatus
            });

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            const data = await res.json();

            if (data.success && Array.isArray(data.users)) {
                setUsers(data.users);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setNotification({ type: 'error', message: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, filterRole, filterStatus]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const toggleUserRole = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newRole = user.role === 'admin' ? 'player' : 'admin';
        const confirmed = window.confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`);

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (!res.ok) throw new Error('Failed to update role');

            const data = await res.json();
            setUsers(users.map(u => u.id === userId ? data.user : u));
            setNotification({ type: 'success', message: `Successfully updated ${user.name}'s role to ${newRole}` });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Failed to update role:', error);
            setNotification({ type: 'error', message: 'Failed to update user role' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const toggleUserStatus = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const confirmed = window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${user.name}'s account?`);

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus === 'active' })
            });

            if (!res.ok) throw new Error('Failed to update status');

            const data = await res.json();
            setUsers(users.map(u => u.id === userId ? data.user : u));
            setNotification({ type: 'success', message: `Successfully ${newStatus === 'active' ? 'activated' : 'deactivated'} ${user.name}'s account` });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Failed to update status:', error);
            setNotification({ type: 'error', message: 'Failed to update user status' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const deleteUser = async (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const confirmed = window.confirm(`Are you sure you want to PERMANENTLY DELETE ${user.name}? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete user');

            setNotification({ type: 'success', message: `Successfully deleted ${user.name}` });
            fetchUsers(); // Refresh list
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error('Failed to delete user:', error);
            setNotification({ type: 'error', message: 'Failed to delete user' });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    // Calculate stats from pagination data if available, otherwise fallback (though stats endpoint would be better)
    // For now, we'll just show the total from pagination
    const totalUsers = pagination.total;

    return (
        <div>
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg border-2 border-black dark:border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                    <p className="font-bold">{notification.message}</p>
                </div>
            )}

            <AdminPageHeader title="User Management" />

            {/* Stats Cards - Note: These are now somewhat approximate as we don't have separate stats API yet, using total from pagination */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={20} className="text-black dark:text-white" />
                        <span className="font-bold text-black dark:text-white">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">{totalUsers}</div>
                </div>
                {/* Other stats would ideally come from a stats endpoint, keeping placeholders or removing if inaccurate */}
            </div>

            <AdminSearchFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search users by name or email..."
            >
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-semibold text-black dark:text-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="player">Players</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-semibold text-black dark:text-white"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </AdminSearchFilters>

            {/* Loading State */}
            {loading ? (
                <div className="text-center py-14 text-gray-500 dark:text-gray-400 font-bold text-lg">Loading users...</div>
            ) : (
                <>
                    {/* Users Table */}
                    <div className="border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] bg-white dark:bg-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-black dark:border-gray-600">
                                    <tr>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">User</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Role</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Status</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Join Date</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Last Activity</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Games Played</th>
                                        <th className="text-left p-4 font-bold text-black dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr key={user.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-semibold text-black dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleUserRole(user.id)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm border-2 transition-all duration-200 ${user.role === 'admin'
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-800 dark:border-purple-600 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-800 dark:border-blue-600 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                                        }`}
                                                >
                                                    {user.role === 'admin' ? <Crown size={16} /> : <User size={16} />}
                                                    {user.role === 'admin' ? 'Admin' : 'Player'}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => toggleUserStatus(user.id)}
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm border-2 transition-all duration-200 ${user.status === 'active'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-800 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-800 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900/50'
                                                        }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></div>
                                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{user.joinDate}</td>
                                            <td className="p-4 text-gray-700 dark:text-gray-300">{user.lastActivity}</td>
                                            <td className="p-4">
                                                <span className="font-semibold text-blue-800 dark:text-blue-300">{user.gamesPlayed}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="p-2 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] dark:shadow-[1px_1px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[0px_0px_0px_0px_rgba(37,99,235,1)] dark:hover:shadow-[0px_0px_0px_0px_rgba(59,130,246,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white dark:bg-gray-800"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="p-2 border-2 border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 rounded-lg shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] dark:shadow-[1px_1px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[0px_0px_0px_0px_rgba(220,38,38,1)] dark:hover:shadow-[0px_0px_0px_0px_rgba(239,68,68,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white dark:bg-gray-800"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <AdminPagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.total}
                            itemsPerPage={pagination.limit}
                            onPageChange={setCurrentPage}
                            itemName="users"
                        />
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-semibold">No users found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
