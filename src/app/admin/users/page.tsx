"use client"
import React, { useState } from 'react';
import { Crown, User, Shield, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

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

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([
        {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@email.com',
            role: 'admin',
            status: 'active',
            joinDate: '2024-01-15',
            lastActivity: '2024-03-10',
            gamesPlayed: 45
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            role: 'player',
            status: 'active',
            joinDate: '2024-02-20',
            lastActivity: '2024-03-09',
            gamesPlayed: 23
        },
        {
            id: '3',
            name: 'Mike Chen',
            email: 'mike.chen@email.com',
            role: 'player',
            status: 'active',
            joinDate: '2024-01-08',
            lastActivity: '2024-03-08',
            gamesPlayed: 67
        },
        {
            id: '4',
            name: 'Emily Davis',
            email: 'emily.d@email.com',
            role: 'admin',
            status: 'inactive',
            joinDate: '2023-11-12',
            lastActivity: '2024-02-15',
            gamesPlayed: 12
        },
        {
            id: '5',
            name: 'Alex Rodriguez',
            email: 'alex.r@email.com',
            role: 'player',
            status: 'active',
            joinDate: '2024-02-28',
            lastActivity: '2024-03-11',
            gamesPlayed: 8
        },
        {
            id: '6',
            name: 'Lisa Wong',
            email: 'lisa.wong@email.com',
            role: 'player',
            status: 'inactive',
            joinDate: '2023-12-05',
            lastActivity: '2024-01-20',
            gamesPlayed: 34
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const toggleUserRole = (userId: string) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, role: user.role === 'admin' ? 'player' : 'admin' }
                : user
        ));
    };

    const toggleUserStatus = (userId: string) => {
        setUsers(users.map(user =>
            user.id === userId
                ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
                : user
        ));
    };

    const adminCount = users.filter(user => user.role === 'admin').length;
    const playerCount = users.filter(user => user.role === 'player').length;
    const activeCount = users.filter(user => user.status === 'active').length;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <div className="flex items-center gap-2 mb-2">
                        <User size={20} />
                        <span className="font-bold">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold">{users.length}</div>
                </div>
                <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown size={20} />
                        <span className="font-bold">Admins</span>
                    </div>
                    <div className="text-2xl font-bold">{adminCount}</div>
                </div>
                <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield size={20} />
                        <span className="font-bold">Players</span>
                    </div>
                    <div className="text-2xl font-bold">{playerCount}</div>
                </div>
                <div className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-bold">Active Users</span>
                    </div>
                    <div className="text-2xl font-bold">{activeCount}</div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-semibold"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="player">Players</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white font-semibold"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b-2 border-black">
                            <tr>
                                <th className="text-left p-4 font-bold">User</th>
                                <th className="text-left p-4 font-bold">Role</th>
                                <th className="text-left p-4 font-bold">Status</th>
                                <th className="text-left p-4 font-bold">Join Date</th>
                                <th className="text-left p-4 font-bold">Last Activity</th>
                                <th className="text-left p-4 font-bold">Games Played</th>
                                <th className="text-left p-4 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="p-4">
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleUserRole(user.id)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm border-2 transition-all duration-200 ${
                                                user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 border-purple-800 hover:bg-purple-200'
                                                    : 'bg-blue-100 text-blue-800 border-blue-800 hover:bg-blue-200'
                                            }`}
                                        >
                                            {user.role === 'admin' ? <Crown size={16} /> : <User size={16} />}
                                            {user.role === 'admin' ? 'Admin' : 'Player'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleUserStatus(user.id)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm border-2 transition-all duration-200 ${
                                                user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 border-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {user.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-gray-700">{user.joinDate}</td>
                                    <td className="p-4 text-gray-700">{user.lastActivity}</td>
                                    <td className="p-4">
                                        <span className="font-semibold text-blue-800">{user.gamesPlayed}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="p-2 border-2 border-blue-600 text-blue-600 rounded-lg shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:shadow-[0px_0px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="p-2 border-2 border-green-600 text-green-600 rounded-lg shadow-[1px_1px_0px_0px_rgba(22,163,74,1)] hover:shadow-[0px_0px_0px_0px_rgba(22,163,74,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                                title="Edit User"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-2 border-2 border-red-600 text-red-600 rounded-lg shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:shadow-[0px_0px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
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
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <User size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No users found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
