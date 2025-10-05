import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UnsavedChangesModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
    isOpen,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50">
            <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle size={24} className="text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                        You have unsaved changes to this crisis card. Are you sure you want to leave without saving?
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-600 bg-white border-2 border-gray-300 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-white bg-red-600 border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                        >
                            Leave Without Saving
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
