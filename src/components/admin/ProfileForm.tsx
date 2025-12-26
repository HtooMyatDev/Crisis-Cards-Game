
"use client"
import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Camera, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

// Extend UserType to include optional fields that might not be in the generated type yet if types aren't fully synced
type ExtendedUser = Omit<UserType, 'password'>;

export default function ProfileForm({ user }: { user: ExtendedUser }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(user.image || null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('error', 'Image size must be less than 2MB');
            return;
        }

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            bio: formData.get('bio'),
            image: previewImage
        };

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            showToast('success', 'Profile updated successfully');
            router.refresh();
        } catch (error) {
            console.error('Profile update error:', error);
            showToast('error', error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Profile Picture</h2>
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                                {previewImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-400 dark:text-gray-500">
                                        {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleImageClick}
                                className="absolute bottom-0 right-0 p-1.5 bg-blue-500 text-white rounded-full border-2 border-white shadow-sm hover:bg-blue-600 transition-colors"
                            >
                                <Camera size={14} />
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/gif"
                            className="hidden"
                        />
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleImageClick}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-black dark:text-white border-2 border-black dark:border-gray-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                <Camera size={18} />
                                Change Picture
                            </button>
                            <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG or GIF. Max size 2MB</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    <h2 className="text-lg font-bold mb-4 text-black dark:text-white">Personal Information</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">
                                    <User size={18} className="inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
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
                                    name="phone"
                                    defaultValue={user.phone || ''}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">
                                    <MapPin size={18} className="inline mr-2" />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    defaultValue={user.location || ''}
                                    className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold mb-2 text-black dark:text-white">Bio</label>
                            <textarea
                                name="bio"
                                defaultValue={user.bio || ''}
                                placeholder="Tell us about yourself..."
                                className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={isLoading}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold border-2 border-black dark:border-gray-600 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold border-2 border-black dark:border-gray-200 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <h2 className="text-lg font-bold mb-4 text-black dark:text-white">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold mb-2 text-black dark:text-white">Role</label>
                        <input
                            type="text"
                            defaultValue={user.role}
                            disabled
                            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-gray-600 dark:text-gray-300 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block font-bold mb-2 text-black dark:text-white">User ID</label>
                        <input
                            type="text"
                            defaultValue={user.id}
                            disabled
                            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] text-gray-600 dark:text-gray-300 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
