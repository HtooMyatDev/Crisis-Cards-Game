import React from 'react';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertCircle size={24} className="text-red-600" />;
            case 'warning':
                return <AlertCircle size={24} className="text-orange-600" />;
            case 'success':
                return <CheckCircle2 size={24} className="text-green-600" />;
            case 'info':
            default:
                return <AlertCircle size={24} className="text-blue-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    bg: 'bg-red-100',
                    border: 'border-red-600',
                    button: 'bg-red-600 hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]'
                };
            case 'warning':
                return {
                    bg: 'bg-orange-100',
                    border: 'border-orange-600',
                    button: 'bg-orange-600 hover:bg-orange-700 shadow-[2px_2px_0px_0px_rgba(234,88,12,1)]'
                };
            case 'success':
                return {
                    bg: 'bg-green-100',
                    border: 'border-green-600',
                    button: 'bg-green-600 hover:bg-green-700 shadow-[2px_2px_0px_0px_rgba(22,163,74,1)]'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-100',
                    border: 'border-blue-600',
                    button: 'bg-blue-600 hover:bg-blue-700 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                };
        }
    };

    const colors = getColors();

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <X size={20} className="text-black dark:text-white" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border}`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-black dark:text-white">{title}</h3>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 dark:text-gray-300">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 border-2 border-gray-400 text-gray-700 dark:text-gray-200 rounded-lg font-semibold
                                 shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,1)]
                                 hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200
                                 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 border-2 border-black dark:border-white text-white rounded-lg font-semibold
                                 ${colors.button} hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
