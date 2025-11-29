"use client"
import React, { useState, useEffect } from 'react';
import {
    Bell,
    Check,
    Trash2,
    Info,
    AlertTriangle,
    XCircle,
    CheckCircle,
    Plus
} from 'lucide-react';

// Types
type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    createdAt: string;
    isRead: boolean;
    user?: {
        id: number;
        name: string | null;
        email: string;
    };
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'INFO' as NotificationType,
        sendToAll: true
    });

    const fetchNotifications = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/notifications?filter=${filter}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const createNotification = async () => {
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNotification)
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateModal(false);
                setNewNotification({ title: '', message: '', type: 'INFO', sendToAll: true });
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'INFO': return <Info size={20} className="text-blue-500" />;
            case 'SUCCESS': return <CheckCircle size={20} className="text-green-500" />;
            case 'WARNING': return <AlertTriangle size={20} className="text-orange-500" />;
            case 'ERROR': return <XCircle size={20} className="text-red-500" />;
        }
    };

    const getBorderColor = (type: NotificationType) => {
        switch (type) {
            case 'INFO': return 'border-l-blue-500';
            case 'SUCCESS': return 'border-l-green-500';
            case 'WARNING': return 'border-l-orange-500';
            case 'ERROR': return 'border-l-red-500';
            default: return 'border-l-gray-500';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} mins ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    };

    const filteredNotifications = notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-black dark:text-white">
                        <Bell className="w-8 h-8" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full border-2 border-black dark:border-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                                {unreadCount} unread
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-600 mt-2">Manage system notifications.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all font-bold"
                >
                    <Plus size={18} />
                    Create Notification
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 border-b-2 border-black dark:border-gray-700 pb-4 overflow-x-auto">
                {(['all', 'unread', 'read'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg border-2 border-black dark:border-gray-700 font-bold transition-all ${filter === f
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]'
                            : 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]'
                            } capitalize`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black dark:border-gray-600">
                            <Bell size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">No notifications found</h3>
                        <p className="text-gray-500 dark:text-gray-400">All caught up!</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`group bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                } border-l-8 ${getBorderColor(notification.type)}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-white dark:bg-gray-700 p-2 rounded-full border-2 border-black dark:border-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className={`text-lg font-bold ${!notification.isRead ? 'text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {notification.title}
                                                {!notification.isRead && (
                                                    <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                                            {notification.user && (
                                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                                    User: {notification.user.name || notification.user.email}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded border border-black dark:border-gray-600">
                                            {formatTimestamp(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Notification Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-lg p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Create Notification</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Title</label>
                                <input
                                    type="text"
                                    value={newNotification.title}
                                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                    className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Message</label>
                                <textarea
                                    value={newNotification.message}
                                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                                    className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg h-24 resize-none bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Type</label>
                                <select
                                    value={newNotification.type}
                                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as NotificationType })}
                                    className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
                                >
                                    <option value="INFO">Info</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="ERROR">Error</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={createNotification}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all font-bold"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all font-bold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
