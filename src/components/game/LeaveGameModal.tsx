import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LeaveGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const LeaveGameModal: React.FC<LeaveGameModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-sm w-full text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">

                {/* Icon */}
                <div className="w-16 h-16 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <AlertTriangle className="w-8 h-8 text-black" />
                </div>

                <h3 className="text-2xl font-black text-black mb-2 uppercase transform -rotate-1">
                    Leaving so soon?
                </h3>

                <p className="text-gray-600 font-bold mb-8 leading-tight">
                    Are you sure you want to abandon your team? They need you to save the world!
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-black font-black text-lg rounded-xl border-4 border-transparent hover:border-black hover:bg-white transition-all"
                    >
                        NO, I&apos;LL STAY
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full py-3 bg-red-500 text-white font-black text-lg rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                    >
                        YES, LEAVE GAME
                    </button>
                </div>
            </div>
        </div>
    );
};
