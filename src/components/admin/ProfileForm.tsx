"use client"
import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save } from 'lucide-react';
import { User as UserType } from '@prisma/client';

export default function ProfileForm({ user }: { user: Omit<UserType, 'password'> }) {
    // In a real app, we'd handle form state and submission here.
    // For now, we are pre-filling with authenticated data.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Profile update functionality coming soon!");
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Profile Picture</h2>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200">
                            <Camera size={18} />
                            Change Picture
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Personal Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-2 text-black dark:text-white">
                                <User size={18} className="inline mr-2" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                defaultValue={user.name || ''}
                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2 text-black dark:text-white" >
                                <Mail size={18} className="inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                defaultValue={user.email}
                                disabled
                                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-gray-600 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-2 text-black dark:text-white">
                                <Phone size={18} className="inline mr-2" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-2 text-black dark:text-white">
                                <Calendar size={18} className="inline mr-2" />
                                Location
                            </label>
                            <input
                                type="text"
                                defaultValue={user.location || ''}
                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold mb-2 text-black dark:text-white">Bio</label>
                        <textarea
                            defaultValue={user.bio || ''}
                            placeholder="Tell us about yourself..."
                            className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold border-2 border-black dark:border-gray-600 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-200 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <h2 className="text-lg font-bold mb-4 text-black dark:text-white">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold mb-2 text-black dark:text-white">Role</label>
                        <input
                            type="text"
                            defaultValue={user.role}
                            disabled
                            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-gray-600 dark:text-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2 text-black dark:text-white">User ID</label>
                        <input
                            type="text"
                            defaultValue={user.id}
                            disabled
                            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-gray-600 dark:text-gray-300"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
