"use client"
import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from "next/navigation"
import SuccessModal from '@/components/SuccessModal';

export default function CreateCategory() {
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6'); // Default blue color
    const [status, setStatus] = useState('Active');
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowSuccessModal(false);

        if (!categoryName.trim()) {
            setError('Category name is required.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: categoryName.trim(),
                    description: description.trim(),
                    color: color,
                    status: status.toLowerCase()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Show success modal
            setShowSuccessModal(true);

            // Reset form
            setCategoryName('');
            setDescription('');
            setColor('#3B82F6');
            setStatus('Active');

            // Set timeout for auto-redirect, but store the reference
            timeoutRef.current = setTimeout(() => {
                router.push('/admin/categories/list');
            }, 2500);

        } catch (err) {
            console.error('Error creating category:', err);
            setError(err instanceof Error ? err.message : 'Failed to create category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        // Clear the timeout when modal is closed
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    const goToList = () => {
        // Clear the timeout and navigate immediately
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        router.push('/admin/categories/list');
    };

    const createAnother = () => {
        // Clear the timeout and just close the modal (stay on current page)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create New Category</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">Category Name <span className="text-red-600">*</span></label>
                    <input
                        type="text"
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block font-bold mb-2">Description</label>
                    <textarea
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-24"
                        placeholder="Enter category description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block font-bold mb-2">Color</label>
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            type="color"
                            className="w-16 h-12 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            disabled={isLoading}
                        />
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 border-2 border-black rounded"
                                style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-sm font-mono">{color}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block font-medium mb-1 text-sm">Hex Code</label>
                        <input
                            type="text"
                            className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
                            placeholder="#000000"
                            value={color}
                            onChange={e => {
                                const value = e.target.value;
                                // Allow typing and validate hex format
                                if (value.match(/^#[0-9A-Fa-f]{0,6}$/) || value === '') {
                                    setColor(value);
                                }
                            }}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <div>
                    <label className="block font-bold mb-2">Status</label>
                    <select
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        aria-label="Select category status"
                        disabled={isLoading}
                    >
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
                {error && <div className="text-red-600 font-semibold">{error}</div>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    <Plus size={20} className="inline-block mr-2" />
                    {isLoading ? 'Creating...' : 'Create Category'}
                </button>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                title="Success!"
                message="Category created successfully!"
                redirectMessage="Redirecting to the list..."
                onClose={closeModal}
                onPrimaryAction={goToList}
                onSecondaryAction={createAnother}
                primaryButtonText="View Categories"
                secondaryButtonText="Create Another"
                autoCloseDelay={2500}
                showProgressBar={true}
            />
        </div>
    );
}
