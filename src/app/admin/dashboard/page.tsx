"use client"
import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Tag, Gamepad2, TrendingUp, TrendingDown, Activity, Calendar, Eye, UserPlus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useGamePolling } from '@/hooks/useGamePolling';

interface Stat {
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative';
    icon: React.ElementType;
    color: string;
    link: string;
}

interface ActivityItem {
    type: string;
    action: string;
    user: string;
    time: string;
}

interface DashboardStats {
    totalUsers: number;
    totalCards: number;
    totalCategories: number;
    totalGames: number;
}

interface DashboardData {
    stats: DashboardStats;
    categoryDistribution: Array<{ name: string; value: number; color: string }>;
    weeklyActivity: Array<{ day: string; users: number; cards: number; games: number }>;
    monthlyGrowth: Array<{ month: string; value: number }>;
    recentActivity: Array<{ type: string; action: string; user: string; time: string }>;
}

const Dashboard = () => {
    const [weeklyData, setWeeklyData] = useState<Array<{ day: string; users: number; cards: number; games: number }>>([]);
    const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; color: string }>>([]);
    const [monthlyGrowth, setMonthlyGrowth] = useState<Array<{ month: string; value: number }>>([]);
    const [stats, setStats] = useState<Stat[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchDashboard = React.useCallback(async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Dashboard fetch failed:', res.status, errorText);
                throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
            }
            const data: DashboardData = await res.json();

            const fetchedStats: Stat[] = [
                { title: 'Total Users', value: data.stats.totalUsers.toString(), change: '+12%', changeType: 'positive', icon: Users, color: 'bg-blue-500', link: '/admin/users' },
                { title: 'Active Cards', value: data.stats.totalCards.toString(), change: '+8%', changeType: 'positive', icon: CreditCard, color: 'bg-green-500', link: '/admin/cards/list' },
                { title: 'Categories', value: data.stats.totalCategories.toString(), change: '-2%', changeType: 'negative', icon: Tag, color: 'bg-purple-500', link: '/admin/categories/list' },
                { title: 'Game Sessions', value: data.stats.totalGames.toString(), change: '+23%', changeType: 'positive', icon: Gamepad2, color: 'bg-orange-500', link: '/admin/games/manage' },
            ];
            setStats(fetchedStats);

            // Use real data from API
            setWeeklyData(data.weeklyActivity || []);
            setCategoryData(data.categoryDistribution || []);
            setMonthlyGrowth(data.monthlyGrowth || []);

            const activity = data.recentActivity.map((item) => ({
                type: item.type,
                action: item.action,
                user: item.user,
                time: new Date(item.time).toLocaleString(),
            }));
            setRecentActivity(activity);
            setLastUpdated(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Real-time updates
    useGamePolling({
        interval: 5000, // 5 seconds
        enabled: true,
        onPoll: fetchDashboard
    });

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'user': return <Users size={16} className="text-blue-500" />;
            case 'card': return <CreditCard size={16} className="text-green-500" />;
            case 'game': return <Gamepad2 size={16} className="text-orange-500" />;
            case 'category': return <Tag size={16} className="text-purple-500" />;
            default: return <Activity size={16} className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                    </div>
                    <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4 animate-pulse"></div>
                            <div className="h-[300px] bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse flex items-end justify-between p-4 gap-2">
                                {[40, 65, 55, 75, 50, 70, 35, 60, 45, 80, 30, 55].map((height, j) => (
                                    <div key={j} className="w-full bg-gray-200 dark:bg-gray-600 rounded-t" style={{ height: `${height}%` }}></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Growth Skeleton */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="h-[250px] bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse w-full"></div>
                    </div>

                    {/* Recent Activity Skeleton */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg">
                                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={16} />
                    <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                            <a href={stat.link}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 ${stat.color} border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {stat.changeType === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        {stat.change}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-1 text-black dark:text-white">{stat.value}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                                </div>
                            </a>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={20} className="text-black dark:text-white" />
                        <h2 className="text-xl font-bold text-black dark:text-white">Weekly Activity</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="day" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                            <Line type="monotone" dataKey="cards" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                            <Line type="monotone" dataKey="games" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={20} className="text-black dark:text-white" />
                        <h2 className="text-xl font-bold text-black dark:text-white">Category Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: { name?: string, percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value" stroke="#000" strokeWidth={2}>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-black dark:text-white" />
                        <h2 className="text-xl font-bold text-black dark:text-white">Monthly Growth</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={monthlyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }} />
                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fill="#8B5CF6" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye size={20} className="text-black dark:text-white" />
                        <h2 className="text-xl font-bold text-black dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="space-y-4 max-h-[250px] overflow-y-auto">
                        {recentActivity.map((activity, index) => (
                            <div key={`activity-${index}-${activity.action}-${activity.time}`} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{activity.action}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">by {activity.user}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
