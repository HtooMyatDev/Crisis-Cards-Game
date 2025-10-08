import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    cardTitle: string;
    isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    cardTitle,
    isDeleting = false
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isDeleting}
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-600">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Delete Card</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to delete this crisis card?
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                        <p className="font-semibold text-gray-900 text-sm">"{cardTitle}"</p>
                    </div>
                    <p className="text-sm text-red-600 mt-2 font-medium">
                        This will permanently delete the card and all associated response options.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-lg font-semibold
                                 shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,1)]
                                 hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200
                                 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 border-2 border-red-600 text-white rounded-lg font-semibold
                                 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)]
                                 hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200
                                 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                                 disabled:transform-none disabled:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]"
                    >
                        {isDeleting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </div>
                        ) : (
                            'Delete Card'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
