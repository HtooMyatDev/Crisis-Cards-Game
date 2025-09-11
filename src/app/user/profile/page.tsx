"use client"
import React, { useState } from 'react';
import {
    User,
    Mail,
    Calendar,
    Trophy,
    Target,
    Star,
    Settings,
    Camera,
    Edit3,
    Save,
    X,
    Shield,
    Bell,
    Gamepad2,
    TrendingUp,
    Award,
    Clock,
    Users
} from 'lucide-react';

const UserProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        name: 'Player One',
        email: 'player.one@example.com',
        username: 'playerone2024',
        bio: 'Crisis management enthusiast. Love solving complex problems under pressure!',
        joinDate: 'March 2024',
        location: 'New York, USA'
    });

    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        soundEffects: true,
        autoSave: true,
        difficulty: 'medium'
    });

    const userStats = {
        level: 5,
        totalScore: 1247,
        gamesPlayed: 24,
        winRate: 67,
        streak: 5,
        rank: 4,
        achievements: 12,
        hoursPlayed: 18
    };

    const achievements = [
        { id: 1, title: 'First Victory', description: 'Win your first game', earned: true, icon: Trophy, color: 'bg-yellow-500' },
        { id: 2, title: 'Quick Thinker', description: 'Complete 5 scenarios in under 30 seconds each', earned: true, icon: Clock, color: 'bg-blue-500' },
        { id: 3, title: 'Streak Master', description: 'Win 5 games in a row', earned: true, icon: TrendingUp, color: 'bg-green-500' },
        { id: 4, title: 'Crisis Expert', description: 'Achieve 80% win rate', earned: false, icon: Target, color: 'bg-purple-500' },
        { id: 5, title: 'Social Player', description: 'Play with friends 10 times', earned: false, icon: Users, color: 'bg-pink-500' },
        { id: 6, title: 'Perfectionist', description: 'Get perfect scores on 3 scenarios', earned: true, icon: Star, color: 'bg-orange-500' }
    ];

    const handleSave = () => {
        setIsEditing(false);
        // Save logic would go here
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-black dark:text-white mb-2 transition-colors duration-200">
                        Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                        Manage your account and view your gaming progress
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'stats', label: 'Statistics', icon: Trophy },
                        { id: 'achievements', label: 'Achievements', icon: Award },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white border-blue-800 dark:border-blue-500'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 text-black dark:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                transition-all duration-200">

                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-black dark:text-white transition-colors duration-200">
                                        Profile Information
                                    </h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-blue-500 dark:bg-blue-600 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2 font-bold text-white text-sm
                                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150"
                                        >
                                            <Edit3 size={16} className="inline mr-1" />
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-500 dark:bg-green-600 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2 font-bold text-white text-sm
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150"
                                            >
                                                <Save size={16} className="inline mr-1" />
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-red-500 dark:bg-red-600 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2 font-bold text-white text-sm
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150"
                                            >
                                                <X size={16} className="inline mr-1" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                                            Display Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg
                                                    bg-white dark:bg-gray-700 text-black dark:text-white
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-black dark:text-white font-medium">{profileData.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                                            Username
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg
                                                    bg-white dark:bg-gray-700 text-black dark:text-white
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-black dark:text-white font-medium">@{profileData.username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-black dark:text-white mb-2">
                                            Bio
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg h-24 resize-none
                                                    bg-white dark:bg-gray-700 text-black dark:text-white
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <p className="text-gray-600 dark:text-gray-300">{profileData.bio}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-black dark:text-white mb-2">
                                                Email
                                            </label>
                                            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                <Mail size={16} />
                                                {profileData.email}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-black dark:text-white mb-2">
                                                Member Since
                                            </label>
                                            <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                                <Calendar size={16} />
                                                {profileData.joinDate}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Avatar & Quick Stats */}
                        <div className="space-y-6">
                            {/* Avatar Card */}
                            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                transition-all duration-200 text-center">

                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-black dark:border-gray-600
                                        rounded-full flex items-center justify-center font-bold text-white text-2xl">
                                        P1
                                    </div>
                                    <button className="absolute -bottom-1 -right-1 bg-gray-800 dark:bg-gray-600 border-2 border-black dark:border-gray-400
                                        rounded-full p-2 text-white hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-black dark:text-white mb-1">
                                    {profileData.name}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    Level {userStats.level} • Rank #{userStats.rank}
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                transition-all duration-200">

                                <h3 className="text-lg font-bold text-black dark:text-white mb-4">
                                    Quick Stats
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Win Rate</span>
                                        <span className="font-bold text-black dark:text-white">{userStats.winRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Current Streak</span>
                                        <span className="font-bold text-black dark:text-white">{userStats.streak}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-300">Total Score</span>
                                        <span className="font-bold text-black dark:text-white">{userStats.totalScore.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Games Played', value: userStats.gamesPlayed, icon: Gamepad2, color: 'bg-blue-500' },
                            { label: 'Total Score', value: userStats.totalScore.toLocaleString(), icon: Trophy, color: 'bg-yellow-500' },
                            { label: 'Win Rate', value: `${userStats.winRate}%`, icon: Target, color: 'bg-green-500' },
                            { label: 'Current Level', value: userStats.level, icon: Star, color: 'bg-purple-500' },
                            { label: 'Current Rank', value: `#${userStats.rank}`, icon: TrendingUp, color: 'bg-red-500' },
                            { label: 'Win Streak', value: userStats.streak, icon: Award, color: 'bg-orange-500' },
                            { label: 'Achievements', value: userStats.achievements, icon: Shield, color: 'bg-indigo-500' },
                            { label: 'Hours Played', value: userStats.hoursPlayed, icon: Clock, color: 'bg-pink-500' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${stat.color} dark:${stat.color} border-2 border-black dark:border-gray-600
                                        rounded-full flex items-center justify-center`}>
                                        <stat.icon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-black dark:text-white">{stat.value}</p>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement) => (
                            <div key={achievement.id} className={`bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                transition-all duration-200 ${achievement.earned ? '' : 'opacity-60'}`}>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 ${achievement.color} dark:${achievement.color} border-2 border-black dark:border-gray-600
                                        rounded-full flex items-center justify-center`}>
                                        <achievement.icon size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-black dark:text-white">{achievement.title}</h3>
                                        {achievement.earned && (
                                            <span className="text-xs bg-green-500 dark:bg-green-600 text-white px-2 py-1 rounded">
                                                EARNED
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {achievement.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                            transition-all duration-200">

                            <h2 className="text-xl font-bold text-black dark:text-white mb-6">
                                Game Settings
                            </h2>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-black dark:text-white">Email Notifications</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Receive updates about your games</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                                        className={`w-12 h-6 rounded-full border-2 border-black dark:border-gray-600 transition-all duration-200
                                            ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white border border-black dark:border-gray-600 rounded-full transition-transform duration-200
                                            ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-black dark:text-white">Sound Effects</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Play sounds during gameplay</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({...settings, soundEffects: !settings.soundEffects})}
                                        className={`w-12 h-6 rounded-full border-2 border-black dark:border-gray-600 transition-all duration-200
                                            ${settings.soundEffects ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white border border-black dark:border-gray-600 rounded-full transition-transform duration-200
                                            ${settings.soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="font-bold text-black dark:text-white mb-2">Difficulty Level</h3>
                                    <div className="flex gap-2">
                                        {['easy', 'medium', 'hard'].map((difficulty) => (
                                            <button
                                                key={difficulty}
                                                onClick={() => setSettings({...settings, difficulty})}
                                                className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm capitalize
                                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                                    hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                                    ${settings.difficulty === difficulty
                                                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-black dark:text-white'
                                                    }`}
                                            >
                                                {difficulty}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
