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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 text-sans">
            <div className="bg-white border-[6px] border-black rounded-[2rem] p-8 md:p-10 max-w-[420px] w-full text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">

                {/* Icon */}
                <div className="w-20 h-20 bg-[#FFD600] border-[5px] border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <AlertTriangle className="w-10 h-10 text-black" strokeWidth={2.5} />
                </div>

                <h3 className="text-[28px] font-[family-name:var(--font-nohemi)] font-black text-black mb-4 uppercase tracking-wide">
                    LEAVING SO SOON?
                </h3>

                <p className="text-[#596372] font-bold text-[1.1rem] mb-8 leading-snug px-2">
                    Are you sure you want to abandon your team? They need you to save the world!
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-[#F4F4F5] text-black font-black font-[family-name:var(--font-nohemi)] text-lg rounded-2xl hover:bg-gray-200 transition-colors uppercase tracking-wide"
                    >
                        NO, I'LL STAY
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full py-4 bg-[#FE3448] text-white font-black font-[family-name:var(--font-nohemi)] text-lg rounded-2xl border-[5px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all uppercase tracking-wide"
                    >
                        YES, LEAVE GAME
                    </button>
                </div>
            </div>
        </div>
    );
};
