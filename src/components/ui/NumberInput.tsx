import React from 'react';

interface NumberInputProps {
    value: number;
    onChange: (value: string) => void;
    min?: number;
    max?: number;
    placeholder?: string;
    className?: string;
    suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    min,
    max,
    placeholder,
    className = "",
    suffix
}) => (
    <div className="relative">
        <input
            type="number"
            min={min}
            max={max}
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            className={`w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none ${className}`}
            placeholder={placeholder}
        />
        {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 text-sm font-bold">{suffix}</span>
            </div>
        )}
    </div>
);
