import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NicknameTakenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NicknameTakenModal: React.FC<NicknameTakenModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border-4 border-black dark:border-gray-700 p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                        Nickname already taken
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-6">
                        The nickname you entered has already been used by another player. Please choose a different one.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                        Ok, got it!
                    </button>
                </div>
            </div>
        </div>
    );
};
