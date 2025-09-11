"use client"
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function CreateCategory() {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3B82F6'); // Default blue color
    const [status, setStatus] = useState('Active');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!categoryName.trim()) {
            setError('Category name is required.');
            return;
        }
        // TODO: Add actual submit logic here
        setSuccess('Category created successfully!');
        setCategoryName('');
        setDescription('');
        setColor('#3B82F6');
        setStatus('Active');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create New Category</h1>
            <div className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">Category Name <span className="text-red-600">*</span></label>
                    <input
                        type="text"
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block font-bold mb-2">Description</label>
                    <textarea
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-24"
                        placeholder="Enter category description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
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
                    >
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
                {error && <div className="text-red-600 font-semibold">{error}</div>}
                {success && <div className="text-green-700 font-semibold">{success}</div>}
                <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                    <Plus size={20} className="inline-block mr-2" />
                    Create Category
                </button>
            </div>
        </div>
    );
}
