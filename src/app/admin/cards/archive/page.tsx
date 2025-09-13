"use client"
import React, { useState } from 'react';
import { Search, Filter, Archive, RotateCcw, Trash2, Calendar, Tag, AlertTriangle, Clock, Eye } from 'lucide-react';

export default function ArchivedCards() {
    // Mock archived crisis cards data
    const [archivedCards] = useState([
        {
            id: 1,
            title: "Server Outage - Payment System",
            description: "Critical payment processing system experiencing downtime affecting customer transactions",
            severity: "Critical",
            category: "Infrastructure",
            archivedDate: "2024-03-15",
            originalDate: "2024-03-10",
            archivedBy: "John Smith",
            status: "Resolved",
            duration: "4 hours",
            affectedUsers: 15000
        },
        {
            id: 2,
            title: "Data Breach Security Alert",
            description: "Potential unauthorized access detected in user database. Investigation completed.",
            severity: "High",
            category: "Security",
            archivedDate: "2024-03-12",
            originalDate: "2024-03-05",
            archivedBy: "Sarah Johnson",
            status: "Mitigated",
            duration: "2 days",
            affectedUsers: 5000
        },
        {
            id: 3,
            title: "Email Service Disruption",
            description: "Company-wide email service experiencing intermittent connectivity issues",
            severity: "Medium",
            category: "Communication",
            archivedDate: "2024-03-08",
            originalDate: "2024-03-01",
            archivedBy: "Mike Wilson",
            status: "Resolved",
            duration: "6 hours",
            affectedUsers: 2000
        },
        {
            id: 4,
            title: "Mobile App Crash Reports",
            description: "Increased crash reports from iOS users after latest app update deployment",
            severity: "Medium",
            category: "Application",
            archivedDate: "2024-03-05",
            originalDate: "2024-02-28",
            archivedBy: "Lisa Chen",
            status: "Fixed",
            duration: "3 days",
            affectedUsers: 8000
        },
        {
            id: 5,
            title: "Network Latency Issues",
            description: "High network latency affecting application performance in European region",
            severity: "Low",
            category: "Infrastructure",
            archivedDate: "2024-03-02",
            originalDate: "2024-02-25",
            archivedBy: "David Brown",
            status: "Optimized",
            duration: "1 day",
            affectedUsers: 3000
        },
        {
            id: 6,
            title: "Third-party API Failure",
            description: "External payment gateway API experiencing intermittent failures",
            severity: "High",
            category: "Integration",
            archivedDate: "2024-02-28",
            originalDate: "2024-02-20",
            archivedBy: "Emma Davis",
            status: "Resolved",
            duration: "8 hours",
            affectedUsers: 12000
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('archivedDate');
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Get unique values for filters
    const severities = [...new Set(archivedCards.map(card => card.severity))];
    const categories = [...new Set(archivedCards.map(card => card.category))];
    const statuses = [...new Set(archivedCards.map(card => card.status))];

    // Filter and sort cards
    const filteredCards = archivedCards
        .filter(card => {
            return (
                card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                card.description.toLowerCase().includes(searchTerm.toLowerCase())
            ) &&
            (selectedSeverity === '' || card.severity === selectedSeverity) &&
            (selectedCategory === '' || card.category === selectedCategory) &&
            (selectedStatus === '' || card.status === selectedStatus);
        })
        .sort((a, b) => {
            if (sortBy === 'archivedDate') return new Date(b.archivedDate) - new Date(a.archivedDate);
            if (sortBy === 'originalDate') return new Date(b.originalDate) - new Date(a.originalDate);
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'severity') {
                const severityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            }
            return 0;
        });

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Fixed': return 'bg-blue-100 text-blue-800';
            case 'Mitigated': return 'bg-purple-100 text-purple-800';
            case 'Optimized': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRestore = (cardId) => {
        console.log(`Restoring card ${cardId}`);
        setShowRestoreConfirm(null);
        // In real app, make API call to restore card
    };

    const handleDelete = (cardId) => {
        console.log(`Permanently deleting card ${cardId}`);
        setShowDeleteConfirm(null);
        // In real app, make API call to permanently delete card
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSeverity('');
        setSelectedCategory('');
        setSelectedStatus('');
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Archive size={28} className="text-gray-600" />
                    <h1 className="text-2xl font-bold">Archived Crisis Cards</h1>
                </div>
                <p className="text-gray-600">View and manage resolved crisis situations</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search archived cards..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <select
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                        value={selectedSeverity}
                        onChange={(e) => setSelectedSeverity(e.target.value)}
                    >
                        <option value="">All Severities</option>
                        {severities.map(severity => (
                            <option key={severity} value={severity}>{severity}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    <select
                        className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="archivedDate">Sort by Archive Date</option>
                        <option value="originalDate">Sort by Original Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="severity">Sort by Severity</option>
                    </select>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedSeverity || selectedCategory || selectedStatus) && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        <button
                            onClick={clearFilters}
                            className="text-sm px-3 py-1 bg-gray-500 text-white border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Archive size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Total Archived</span>
                    </div>
                    <div className="text-2xl font-bold">{archivedCards.length}</div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={18} className="text-red-600" />
                        <span className="text-sm font-medium text-gray-600">Critical Issues</span>
                    </div>
                    <div className="text-2xl font-bold">{archivedCards.filter(c => c.severity === 'Critical').length}</div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={18} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Avg Resolution</span>
                    </div>
                    <div className="text-2xl font-bold">2.1d</div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Filter size={18} className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Showing</span>
                    </div>
                    <div className="text-2xl font-bold">{filteredCards.length}</div>
                </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
                {filteredCards.map((card) => (
                    <div key={card.id} className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold">{card.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(card.severity)}`}>
                                        {card.severity}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(card.status)}`}>
                                        {card.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-3">{card.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Tag size={14} className="text-gray-500" />
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium">{card.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-gray-500" />
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">{card.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye size={14} className="text-gray-500" />
                                <span className="text-gray-600">Affected:</span>
                                <span className="font-medium">{card.affectedUsers.toLocaleString()} users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-gray-500" />
                                <span className="text-gray-600">Archived:</span>
                                <span className="font-medium">{card.archivedDate}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                Archived by <span className="font-medium">{card.archivedBy}</span> on {card.archivedDate}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowRestoreConfirm(card.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium text-sm"
                                >
                                    <RotateCcw size={14} />
                                    Restore
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(card.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium text-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredCards.length === 0 && (
                <div className="text-center py-12 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Archive size={48} className="mx-auto text-gray-400 mb-4" />
                    <div className="text-gray-500 text-lg mb-2">No archived cards found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search criteria or filters</div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {showRestoreConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Restore Crisis Card</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to restore this crisis card? It will be moved back to active cards.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRestoreConfirm(null)}
                                className="px-4 py-2 bg-gray-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRestore(showRestoreConfirm)}
                                className="px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium"
                            >
                                Restore Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Permanently Delete Card</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to permanently delete this crisis card? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
