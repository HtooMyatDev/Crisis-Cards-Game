import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    redirectMessage?: string;
    onClose: () => void;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    autoCloseDelay?: number;
    showProgressBar?: boolean;
}

export default function SuccessModal({
    isOpen,
    title = "Success!",
    message = "Operation completed successfully!",
    redirectMessage,
    onClose,
    onPrimaryAction,
    onSecondaryAction,
    primaryButtonText = "Continue",
    secondaryButtonText = "Close",
    autoCloseDelay = 0,
    showProgressBar = false
}: SuccessModalProps) {

    useEffect(() => {
        if (isOpen && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-md w-full animate-in fade-in-50 zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center">
                    <div className="mb-4">
                        <CheckCircle size={64} className="mx-auto text-green-500 animate-in zoom-in-50 duration-500" />
                    </div>

                    <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
                    <p className="text-gray-700 mb-2 font-medium">{message}</p>

                    {redirectMessage && (
                        <p className="text-sm text-gray-500 mb-4">{redirectMessage}</p>
                    )}

                    {showProgressBar && autoCloseDelay > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                                style={{
                                    animation: `progressBar ${autoCloseDelay}ms linear forwards`
                                }}
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        {onPrimaryAction && (
                            <button
                                onClick={onPrimaryAction}
                                className="flex-1 px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                {primaryButtonText}
                            </button>
                        )}

                        {onSecondaryAction && (
                            <button
                                onClick={onSecondaryAction}
                                className="flex-1 px-4 py-2 bg-white text-black font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                {secondaryButtonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
            @keyframes progressBar {
                0% { width: 0%; }
                100% { width: 100%; }
            }
        `}</style>
        </div>
    );
}
