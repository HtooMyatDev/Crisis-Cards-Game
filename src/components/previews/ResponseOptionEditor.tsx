import React from 'react';
import { X, Shield, TrendingUp, Heart, Users } from 'lucide-react';
import { ResponseOption, ResponseOptionErrors } from '../types/crisisCard';

interface ResponseOptionEditorProps {
    option: ResponseOption;
    index: number;
    errors?: ResponseOptionErrors;
    onTextChange: (index: number, value: string) => void;
    onEffectChange: (index: number, field: keyof Pick<ResponseOption, 'pwEffect' | 'efEffect' | 'psEffect' | 'grEffect'>, value: string) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

export const ResponseOptionEditor: React.FC<ResponseOptionEditorProps> = ({
    option,
    index,
    errors,
    onTextChange,
    onEffectChange,
    onRemove,
    canRemove
}) => {
    const effectFields = [
        { key: 'pwEffect' as const, label: 'PW Effect', icon: Shield, color: 'text-blue-500' },
        { key: 'efEffect' as const, label: 'EF Effect', icon: TrendingUp, color: 'text-green-500' },
        { key: 'psEffect' as const, label: 'PS Effect', icon: Heart, color: 'text-red-500' },
        { key: 'grEffect' as const, label: 'GR Effect', icon: Users, color: 'text-yellow-500' },
    ];

    return (
        <div className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
                <input
                    type="text"
                    value={option.text}
                    onChange={(e) => onTextChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                    placeholder={`Response option ${index + 1}`}
                />
                {errors?.text && (
                    <p className="text-red-600 text-xs">{errors.text}</p>
                )}
                {canRemove && (
                    <button
                        onClick={() => onRemove(index)}
                        className="p-3 text-red-600 bg-white border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                        aria-label={`Remove response option ${index + 1}`}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {effectFields.map(({ key, label, icon: Icon, color }) => (
                    <div key={key}>
                        <label className="flex items-center gap-1 text-xs font-medium mb-1">
                            <Icon size={12} className={color} />
                            {label}
                        </label>
                        <input
                            type="number"
                            min="-10"
                            max="10"
                            value={option[key] === 0 ? '' : option[key]}
                            onChange={(e) => onEffectChange(index, key, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full p-2 text-sm border border-gray-400 rounded"
                            placeholder="0"
                        />
                        {errors?.[key] && (
                            <p className="text-red-600 text-xs mt-1">{errors[key]}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

