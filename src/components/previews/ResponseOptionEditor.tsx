import React from 'react';
import { Shield, TrendingUp, Building2, Leaf, Users } from 'lucide-react';
import { ResponseOption, ResponseOptionErrors } from '../../types/crisisCard';

interface ResponseOptionEditorProps {
    option: ResponseOption;
    index: number;
    errors?: ResponseOptionErrors;
    onTextChange: (index: number, value: string) => void;
    onEffectChange: (index: number, field: keyof Pick<ResponseOption, 'politicalEffect' | 'economicEffect' | 'infrastructureEffect' | 'societyEffect' | 'environmentEffect' | 'score'>, value: string) => void;

}

export const ResponseOptionEditor: React.FC<ResponseOptionEditorProps> = ({
    option,
    index,
    errors,
    onTextChange,
    onEffectChange,

}) => {
    const effectFields = [
        { key: 'politicalEffect' as const, label: 'Political', icon: Shield, color: 'text-blue-500' },
        { key: 'economicEffect' as const, label: 'Economic', icon: TrendingUp, color: 'text-green-500' },
        { key: 'infrastructureEffect' as const, label: 'Infrastructure', icon: Building2, color: 'text-gray-500' },
        { key: 'societyEffect' as const, label: 'Society', icon: Users, color: 'text-yellow-500' },
        { key: 'environmentEffect' as const, label: 'Environment', icon: Leaf, color: 'text-emerald-500' },
    ];

    return (
        <div className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3 mb-3">
                <input
                    type="text"
                    value={option.text}
                    onChange={(e) => onTextChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder={`Response option ${index + 1}`}
                />
                {errors?.text && (
                    <p className="text-red-600 text-xs">{errors.text}</p>
                )}

            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                {effectFields.map(({ key, label, icon: Icon, color }) => (
                    <div key={key}>
                        <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 min-h-[20px] text-gray-700 dark:text-gray-300">
                            <Icon size={16} className={color} />
                            <span>{label}</span>
                        </label>
                        <input
                            type="number"
                            min="-10"
                            max="10"
                            value={option[key] === 0 ? '' : option[key]}
                            onChange={(e) => onEffectChange(index, key, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            className="w-full p-2 text-sm border border-gray-400 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                            placeholder="0"
                        />
                        {errors?.[key] && (
                            <p className="text-red-600 text-xs mt-1">{errors[key]}</p>
                        )}
                    </div>
                ))}
            </div>
            {/* Score Field */}
            <div className="mt-3">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Score (Points)
                </label>
                <input
                    type="number"
                    value={option.score === 0 ? '' : option.score}
                    onChange={(e) => onEffectChange(index, 'score', e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full p-3 border-2 border-gray-400 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-800 text-black dark:text-white"
                    placeholder="e.g., -300, +500, 0"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Enter the score value for this response (can be positive or negative)
                </p>
                {errors?.score && (
                    <p className="text-red-600 text-xs mt-1">{errors.score}</p>
                )}
            </div>
        </div>
    );
};
