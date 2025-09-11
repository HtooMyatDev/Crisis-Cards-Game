"use client"
import React from 'react';
import {
    Users,
    CreditCard,
    Tag,
    Gamepad2,
    TrendingUp,
    TrendingDown,
    Activity,
    Calendar,
    Eye,
    UserPlus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard = () => {
    // Mock data for charts
    const weeklyData = [
        { day: 'Mon', users: 45, cards: 23, games: 12 },
        { day: 'Tue', users: 52, cards: 31, games: 18 },
        { day: 'Wed', users: 38, cards: 25, games: 15 },
        { day: 'Thu', users: 67, cards: 42, games: 22 },
        { day: 'Fri', users: 73, cards: 38, games: 28 },
        { day: 'Sat', users: 89, cards: 45, games: 35 },
        { day: 'Sun', users: 56, cards: 33, games: 19 }
    ];

    const categoryData = [
        { name: 'Electronics', value: 45, color: '#3B82F6' },
        { name: 'Clothing', value: 23, color: '#EF4444' },
        { name: 'Books', value: 12, color: '#10B981' },
        { name: 'Sports', value: 18, color: '#F59E0B' },
        { name: 'Home & Garden', value: 31, color: '#8B5CF6' },
        { name: 'Food & Beverage', value: 8, color: '#F97316' }
    ];

    const monthlyGrowth = [
        { month: 'Jan', value: 120 },
        { month: 'Feb', value: 150 },
        { month: 'Mar', value: 180 },
        { month: 'Apr', value: 220 },
        { month: 'May', value: 280 },
        { month: 'Jun', value: 320 }
    ];

    const stats = [
        {
            title: "Total Users",
            value: "1,234",
            change: "+12%",
            changeType: "positive",
            icon: Users,
            color: "bg-blue-500"
        },
        {
            title: "Active Cards",
            value: "456",
            change: "+8%",
            changeType: "positive",
            icon: CreditCard,
            color: "bg-green-500"
        },
        {
            title: "Categories",
            value: "24",
            change: "-2%",
            changeType: "negative",
            icon: Tag,
            color: "bg-purple-500"
        },
        {
            title: "Game Sessions",
            value: "89",
            change: "+23%",
            changeType: "positive",
            icon: Gamepad2,
            color: "bg-orange-500"
        }
    ];

    const recentActivity = [
        { id: 1, action: "New user registered", user: "John Doe", time: "2 minutes ago", type: "user" },
        { id: 2, action: "Card created", user: "Admin", time: "5 minutes ago", type: "card" },
        { id: 3, action: "Game session started", user: "Jane Smith", time: "10 minutes ago", type: "game" },
        { id: 4, action: "Category updated", user: "Admin", time: "15 minutes ago", type: "category" },
        { id: 5, action: "User login", user: "Mike Johnson", time: "20 minutes ago", type: "user" }
    ];

    const getActivityIcon = (type) => {
        switch(type) {
            case 'user': return <Users size={16} className="text-blue-500" />;
            case 'card': return <CreditCard size={16} className="text-green-500" />;
            case 'game': return <Gamepad2 size={16} className="text-orange-500" />;
            case 'category': return <Tag size={16} className="text-purple-500" />;
            default: return <Activity size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>Last updated: Just now</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 ${stat.color} border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <div className={`flex items-center gap-1 text-sm font-bold ${
                                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stat.changeType === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                                <p className="text-gray-600 font-medium">{stat.title}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Activity Chart */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={20} />
                        <h2 className="text-xl font-bold">Weekly Activity</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="day" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '2px solid black',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                                }}
                            />
                            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
                            <Line type="monotone" dataKey="cards" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                            <Line type="monotone" dataKey="games" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={20} />
                        <h2 className="text-xl font-bold">Category Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="#000"
                                strokeWidth={2}
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '2px solid black',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Growth */}
                <div className="lg:col-span-2 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} />
                        <h2 className="text-xl font-bold">Monthly Growth</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={monthlyGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" stroke="#666" />
                            <YAxis stroke="#666" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '2px solid black',
                                    borderRadius: '8px',
                                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8B5CF6"
                                strokeWidth={3}
                                fill="#8B5CF6"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye size={20} />
                        <h2 className="text-xl font-bold">Recent Activity</h2>
                    </div>
                    <div className="space-y-4 max-h-[250px] overflow-y-auto">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="mt-1">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                    <p className="text-xs text-gray-600">by {activity.user}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
