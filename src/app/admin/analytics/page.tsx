"use client"
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Calendar, Activity, TrendingUp, Users } from 'lucide-react';

const AnalyticsPage = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to load analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const exportReport = () => {
        if (!data) return;

        // Simple CSV Export for Weekly Activity
        const headers = ['Day', 'Users', 'Cards', 'Games'];
        const rows = data.weeklyActivity.map((d: any) => [d.day, d.users, d.cards, d.games]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">Analytics & Reports</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Deep dive into platform performance and usage stats.</p>
                </div>
                <button
                    onClick={exportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-80 transition-opacity"
                >
                    <Download size={18} />
                    Export CSV
                </button>
            </div>

            {/* Platform Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold text-black dark:text-white">User Growth</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.monthlyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                            <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-green-500" size={24} />
                        <h2 className="text-xl font-bold text-black dark:text-white">Activity Overview</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="day" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black' }} />
                            <Bar dataKey="users" fill="#3B82F6" name="Users" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="games" fill="#F59E0B" name="Games" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="text-purple-500" size={24} />
                    <h2 className="text-xl font-bold text-black dark:text-white">User Engagement Metrics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-2">{data.stats.totalUsers}</div>
                        <div className="text-sm font-bold text-gray-500">Total Registered Users</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">{data.stats.totalGames}</div>
                        <div className="text-sm font-bold text-gray-500">Total Games Hosted</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">{data.stats.totalCards}</div>
                        <div className="text-sm font-bold text-gray-500">Active Crisis Cards</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
