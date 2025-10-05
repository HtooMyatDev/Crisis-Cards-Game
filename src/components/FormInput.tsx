import React from 'react';

interface FormInputProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    helpText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    required = false,
    error,
    children,
    helpText
}) => (
    <div>
        <label className="block text-sm font-bold text-black mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
);
